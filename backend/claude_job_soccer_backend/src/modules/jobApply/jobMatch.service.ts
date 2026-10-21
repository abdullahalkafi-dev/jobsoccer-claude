import { aiConfig } from "../../shared/ai/ai.config";
import { evaluateJobMatch } from "../../shared/ai/jobMatch/jobMatchEvaluator";
import { enqueueAiJob } from "../../shared/ai/queue/aiQueue";
import { extractStoredResumeText } from "../../shared/ai/resume/resumeText";
import { logger } from "../../shared/logger/logger";
import { getCandidateModel } from "../../shared/util/getCandidateModel";
import { AiEvaluation } from "../aiEvaluation/aiEvaluation.model";
import { applyCorrections } from "../aiEvaluation/aiEvaluation.service";
import { getRubric } from "../../shared/ai/rubric/rubric.registry";
import { CandidateEducation } from "../candidateEducation/candidateEducation.model";
import { CandidateExperience } from "../candidateExperience/candidateExperience.model";
import { CandidateLicenseAndCertification } from "../candidateLicensesAndCertification/candidateLicensesAndCertification.model";
import { CandidateResume } from "../candidateResume/candidateResume.model";
import { Job } from "../Job/job.model";
import { User } from "../user/user.model";
import { JobApply } from "./jobApply.model";

/** Job match v2 runs in the background when AI_EVAL_ENABLED (opt out with AI_JOB_MATCH_V2=false). */
export const isJobMatchV2Enabled = (): boolean => aiConfig.evalEnabled && process.env.AI_JOB_MATCH_V2 !== "false";

// Personal details the match must not use (fairness) and fields with no meaning for a match.
const PROFILE_EXCLUDED = new Set([
  "_id", "createdAt", "updatedAt", "videos", "AiVideoVideoScore", "dateOfBirth", "placeOfBirth", "gender",
  "boyOrGirl", "phoneNumber", "socialMedia", "nationality", "height", "weight", "profileImage",
]);
const JOB_FIELDS = [
  "jobTitle", "jobCategory", "position", "location", "country", "contractType", "experience", "salary",
  "jobOverview", "requirements", "responsibilities", "requiredSkills", "additionalRequirements",
] as const;
const RECORD_EXCLUDED = new Set(["_id", "userId", "profileId", "createdAt", "updatedAt", "candidateRole"]);

const pick = (obj: Record<string, any>, exclude: Set<string>) =>
  Object.fromEntries(Object.entries(obj).filter(([k]) => !exclude.has(k)));

/** Resume text for the application, cached on the resume record. */
const getResumeText = async (userId: string, resumeUrl?: string | null): Promise<string | null> => {
  if (!resumeUrl) return null;
  const resume = await CandidateResume.findOne({ userId, resumeUrl });
  if (resume?.extractedText !== undefined && resume.textStatus) return resume.extractedText || null;
  try {
    const result = await extractStoredResumeText(resumeUrl);
    if (resume) {
      resume.extractedText = result.text;
      resume.textStatus = result.status;
      resume.textExtractedAt = new Date();
      await resume.save();
    }
    return result.status === "ok" ? result.text : null;
  } catch (error: any) {
    logger.warn(`Could not read resume ${resumeUrl}`, { error: error.message });
    return null;
  }
};

/** Mark the application for background matching and queue it. */
const queueMatch = async (applicationId: string): Promise<void> => {
  await JobApply.updateOne({ _id: applicationId }, { $set: { aiMatchStatus: "queued" }, $unset: { aiMatchError: 1 } });
  await enqueueAiJob("match-job-application", { id: applicationId });
};

const processMatch = async (applicationId: string, isFinalAttempt = true): Promise<void> => {
  const application = await JobApply.findById(applicationId);
  if (!application || application.isDeleted || application.aiMatchStatus === "completed") return;
  try {
    application.aiMatchStatus = "processing";
    await application.save();

    const [job, user] = await Promise.all([
      Job.findById(application.jobId).lean(),
      User.findById(application.candidateId).lean(),
    ]);
    if (!job || !user?.profileId) throw new Error("Job or candidate profile no longer exists");
    const profile = await getCandidateModel(user.role).findById(user.profileId).lean();
    if (!profile) throw new Error("Candidate profile not found");
    const userId = user._id.toString();

    const [experiences, educations, certifications, latestInterview, resumeText] = await Promise.all([
      CandidateExperience.find({ userId }).lean(),
      CandidateEducation.find({ userId }).lean(),
      CandidateLicenseAndCertification.find({ userId }).lean(),
      AiEvaluation.findOne({ candidateUserId: user._id, isLatest: true, status: "completed" }).sort({ createdAt: -1 }).lean(),
      getResumeText(userId, application.resumeUrl),
    ]);
    const interviewReport = latestInterview ? applyCorrections(getRubric(latestInterview.rubricId), latestInterview) : null;

    const result = await evaluateJobMatch({
      job: Object.fromEntries(JOB_FIELDS.map((k) => [k, (job as any)[k]])),
      candidateRole: user.role as string,
      profile: {
        ...pick(profile as any, PROFILE_EXCLUDED),
        experiences: experiences.map((e: any) => pick(e, RECORD_EXCLUDED)),
        educations: educations.map((e: any) => pick(e, RECORD_EXCLUDED)),
        certifications: certifications.map((c: any) => pick(c, RECORD_EXCLUDED)),
      },
      resumeText,
      interview: interviewReport
        ? {
            displayName: interviewReport.displayName,
            percentage: interviewReport.totals.percentage,
            classification: interviewReport.totals.band,
            strongestAreas: interviewReport.strongestAreas,
            mainWeaknesses: interviewReport.mainWeaknesses,
          }
        : null,
    });

    application.aiMatchPercentage = result.output.score;
    application.aiMatchStatus = "completed";
    application.aiMatchDetails = {
      ...result.output,
      usedResume: !!resumeText,
      usedInterview: !!interviewReport,
      model: result.model,
      costUsd: result.usage.reduce((n, u) => n + (u.estimatedCostUsd ?? 0), 0),
      matchedAt: new Date(),
    };
    application.aiMatchError = undefined;
    await application.save();
  } catch (error: any) {
    // Never store a fake 0: the percentage stays empty and the status shows the failure.
    application.aiMatchStatus = isFinalAttempt ? "failed" : "queued";
    application.aiMatchError = error.message;
    await application.save();
    throw error;
  }
};

const requeuePending = async (): Promise<number> => {
  if (!isJobMatchV2Enabled()) return 0;
  const pending = await JobApply.find({ isDeleted: false, aiMatchStatus: { $in: ["queued", "processing"] } })
    .select("_id")
    .lean();
  for (const p of pending) await enqueueAiJob("match-job-application", { id: p._id.toString() });
  return pending.length;
};

export const JobMatchService = {
  queueMatch,
  processMatch,
  requeuePending,
};
