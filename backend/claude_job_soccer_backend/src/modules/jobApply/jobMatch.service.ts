import { aiConfig } from "../../shared/ai/ai.config";
import { evaluateJobMatch } from "../../shared/ai/jobMatch/jobMatchEvaluator";
import { enqueueJob } from "../../shared/ai/queue/aiQueue";
import { getResumeText } from "../candidateResume/resumeText.service";
import { logger } from "../../shared/logger/logger";
import { getCandidateModel } from "../../shared/util/getCandidateModel";
import { AiEvaluation } from "../aiEvaluation/aiEvaluation.model";
import { applyCorrections } from "../aiEvaluation/aiEvaluation.service";
import { getRubric } from "../../shared/ai/rubric/rubric.registry";
import { CandidateEducation } from "../candidateEducation/candidateEducation.model";
import { CandidateExperience } from "../candidateExperience/candidateExperience.model";
import { CandidateLicenseAndCertification } from "../candidateLicensesAndCertification/candidateLicensesAndCertification.model";
import { Job } from "../Job/job.model";
import { User } from "../user/user.model";
import { JobApply } from "./jobApply.model";

// Personal details the match must not use (fairness) and fields with no meaning for a match.
const PROFILE_EXCLUDED = new Set([
  "_id", "createdAt", "updatedAt", "videos", "dateOfBirth", "placeOfBirth", "gender",
  "boyOrGirl", "phoneNumber", "socialMedia", "nationality", "height", "weight", "profileImage",
]);
const JOB_FIELDS = [
  "jobTitle", "jobCategory", "position", "location", "country", "contractType", "experience", "salary",
  "jobOverview", "requirements", "responsibilities", "requiredSkills", "additionalRequirements",
] as const;
const RECORD_EXCLUDED = new Set(["_id", "userId", "profileId", "createdAt", "updatedAt", "candidateRole"]);

const pick = (obj: Record<string, any>, exclude: Set<string>) =>
  Object.fromEntries(Object.entries(obj).filter(([k]) => !exclude.has(k)));

/** Mark the application for background matching and queue it. */
const queueMatch = async (applicationId: string): Promise<void> => {
  await JobApply.updateOne({ _id: applicationId }, { $set: { matchStatus: "queued" }, $unset: { matchError: 1 } });
  await enqueueJob("jobMatch", { id: applicationId }, { jobId: `match-${applicationId}` });
};

const processMatch = async (applicationId: string, isFinalAttempt = true): Promise<void> => {
  const application = await JobApply.findById(applicationId);
  if (!application || application.isDeleted || application.matchStatus === "completed") return;
  try {
    application.matchStatus = "processing";
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

    application.matchScore = result.output.score;
    application.matchStatus = "completed";
    application.matchDetails = {
      ...result.output,
      usedResume: !!resumeText,
      usedInterview: !!interviewReport,
      model: result.model,
      costUsd: result.usage.reduce((n, u) => n + (u.estimatedCostUsd ?? 0), 0),
      matchedAt: new Date(),
    };
    application.matchError = undefined;
    await application.save();
  } catch (error: any) {
    // Never store a fake 0: the percentage stays empty and the status shows the failure.
    application.matchStatus = isFinalAttempt ? "failed" : "queued";
    application.matchError = error.message;
    await application.save();
    throw error;
  }
};

const requeuePending = async (): Promise<number> => {
  if (!aiConfig.evalEnabled) return 0;
  const pending = await JobApply.find({ isDeleted: false, matchStatus: { $in: ["queued", "processing"] } })
    .select("_id")
    .lean();
  for (const p of pending) await enqueueJob("jobMatch", { id: p._id.toString() }, { jobId: `match-${p._id}` });
  return pending.length;
};

export const JobMatchService = {
  queueMatch,
  processMatch,
  requeuePending,
};
