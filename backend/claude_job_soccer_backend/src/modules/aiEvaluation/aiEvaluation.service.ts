import crypto from "crypto";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import AppError from "../../errors/AppError";
import { aiConfig } from "../../shared/ai/ai.config";
import { UsageRecord } from "../../shared/ai/client/openaiClient";
import { saveCaptions } from "../../shared/ai/captions/captions";
import { EvaluationError, evaluateTranscript } from "../../shared/ai/evaluation/evaluator";
import { EvaluationReport } from "../../shared/ai/evaluation/evaluation.types";
import { buildReport, computeTotals } from "../../shared/ai/evaluation/guardrails";
import { checkRecordingSetup, TSetupCheck } from "../../shared/ai/frameCheck/frameCheck";
import { enqueueJob } from "../../shared/ai/queue/aiQueue";
import { getRubric, listRubrics, resolveRubric } from "../../shared/ai/rubric/rubric.registry";
import { Rubric } from "../../shared/ai/rubric/rubric.schema";
import { logger } from "../../shared/logger/logger";
import redisOperations from "../../shared/redis/redisClient";
import { getLocalCopy } from "../../shared/storage";
import { emitToUser } from "../../socket/emitToUser";
import { FriendList } from "../friendlist/friendlist.model";
import { NotificationService } from "../notification/notification.service";
import { getProfileEntry } from "../profile/profile.registry";
import { CandidateRole, UserType } from "../user/user.interface";
import { User } from "../user/user.model";
import { VideoKind } from "../video/video.constant";
import { VideoService } from "../video/video.service";
import { TAiEvaluation } from "./aiEvaluation.interface";
import { AiEvaluation } from "./aiEvaluation.model";
import { transcribeCached } from "./transcriptCache";

type Viewer = { id: string; userType: string };

const isStaffRole = (role: string): boolean => role === CandidateRole.ON_FIELD_STAFF || role === CandidateRole.OFFICE_STAFF;

/** Tell the candidate's open tabs how far the assessment is (queued, transcribing, scoring, done). */
const announce = (userId: string, evaluationId: string, status: string): void =>
  emitToUser(userId, "assessment:status", { evaluationId, status });

/**
 * Create a queued evaluation for the candidate's INTERVIEW video and hand it to
 * the background worker. Only the interview is scored (client decision); the
 * methodology video is for employers to watch. Returns null when the candidate
 * has no interview video or no scoring guide.
 */
const requestEvaluation = async (userId: string, trigger: string): Promise<TAiEvaluation | null> => {
  const user = await User.findById(userId).lean();
  if (!user || user.userType !== UserType.CANDIDATE || !user.profileId || !isStaffRole(user.role as string)) return null;
  const entry = getProfileEntry(user.userType, user.role);
  const profile: any = entry ? await entry.model.findById(user.profileId).lean() : null;
  if (!profile) return null;

  const rubric = resolveRubric({ role: user.role as string, position: profile.position });
  if (!aiConfig.evalEnabled || !rubric) return null;

  const videos = (profile.videos ?? [])
    .filter((v: any) => v?.url && v.kind === VideoKind.INTERVIEW)
    .map((v: any) => ({ url: v.url, kind: v.kind, videoId: String(v._id) }));
  if (videos.length === 0) return null;

  const evaluation = await AiEvaluation.create({
    candidateUserId: user._id,
    profileId: profile._id,
    role: user.role,
    position: profile.position,
    level: rubric.level,
    rubricId: rubric.rubricId,
    rubricVersion: rubric.version,
    status: "queued",
    trigger,
    isLatest: false,
    videos,
    queuedAt: new Date(),
  });
  await enqueueJob("interview", { id: evaluation._id.toString() }, { jobId: `evaluate-${evaluation._id}` });
  announce(userId, evaluation._id.toString(), "queued");
  logger.info(`AI evaluation ${evaluation._id} queued for user ${userId} (${rubric.rubricId}, ${trigger})`);
  return evaluation.toObject();
};

/** Same as requestEvaluation but never throws: uploads must not fail because of AI. */
const requestEvaluationSafely = async (userId: string, trigger: string): Promise<void> => {
  try {
    await requestEvaluation(userId, trigger);
  } catch (error: any) {
    logger.error(`Could not queue AI evaluation for ${userId}`, { error: error.message });
  }
};

const totalCost = (usage: UsageRecord[]) =>
  Math.round(usage.reduce((n, u) => n + (u.estimatedCostUsd ?? 0), 0) * 1_000_000) / 1_000_000;

/** Store the finished report and keep the 0-100 interview score on the user for cards and search. */
const completeEvaluation = async (evaluation: any, report: EvaluationReport) => {
  evaluation.status = "completed";
  evaluation.report = report;
  evaluation.error = undefined;
  evaluation.finishedAt = new Date();
  evaluation.isLatest = true;
  await evaluation.save();
  await AiEvaluation.updateMany(
    { candidateUserId: evaluation.candidateUserId, _id: { $ne: evaluation._id }, isLatest: true },
    { $set: { isLatest: false } }
  );

  await User.updateOne({ _id: evaluation.candidateUserId }, { interviewScore: report.legacyScore100 });
  await redisOperations.del(`user:${evaluation.candidateUserId}:me`).catch(() => undefined);

  const userId = evaluation.candidateUserId.toString();
  announce(userId, evaluation._id.toString(), "completed");
  await NotificationService.sendNotificationToUser(
    userId,
    "Interview assessment ready",
    `Your ${report.displayName} interview assessment is ready on your profile.`
  ).catch((error: any) => logger.warn("Could not send AI notification", { error: error.message }));
};

/**
 * Worker step: transcribe the interview (any language -> English), write the
 * English captions, then score it with the client's guide while the recording
 * setup is checked in parallel. Throws so the queue can retry.
 */
const processEvaluation = async (evaluationId: string, isFinalAttempt = true): Promise<void> => {
  const evaluation = await AiEvaluation.findById(evaluationId);
  if (!evaluation || evaluation.status === "completed") return;
  const rubric = getRubric(evaluation.rubricId);
  if (!rubric) throw new Error(`Unknown rubric ${evaluation.rubricId}`);
  const userId = evaluation.candidateUserId.toString();

  const usage: UsageRecord[] = [];
  const copies: { release: () => void }[] = [];
  try {
    evaluation.status = "transcribing";
    evaluation.attempts += 1;
    evaluation.startedAt = new Date();
    evaluation.error = undefined;
    await evaluation.save();
    announce(userId, evaluationId, "transcribing");

    const parts: string[] = [];
    const setupTasks: Promise<{ check: TSetupCheck; usage: UsageRecord } | null>[] = [];
    for (const video of evaluation.videos) {
      const copy = await getLocalCopy(video.url);
      copies.push(copy);
      const transcript = await transcribeCached(copy.path);
      usage.push(...transcript.usage);
      video.sha256 = transcript.sha256;
      video.durationSeconds = transcript.durationSeconds;
      video.transcriptChars = transcript.text.trim().length;
      evaluation.detectedLanguage = transcript.detectedLanguage;
      if (transcript.text.trim()) parts.push(transcript.text.trim());

      // English captions for the video player (best effort: never blocks the score).
      if (video.videoId) {
        saveCaptions(transcript.sha256, transcript.segments)
          .then((url) => (url ? VideoService.setCaptions(userId, video.videoId!, url) : undefined))
          .catch((error: any) => logger.warn("Could not write captions", { error: error.message }));
      }
      // Recording-setup check starts now and runs while the answers are scored.
      if (transcript.text.trim() && (transcript.durationSeconds ?? 0) > 0) {
        setupTasks.push(
          checkRecordingSetup(copy.path, transcript.durationSeconds!, transcript.text).catch((error: any) => {
            logger.warn("Recording setup check failed (non-blocking)", { error: error.message });
            return null;
          })
        );
      }
    }
    const transcriptText = parts.join("\n\n");
    evaluation.transcript = transcriptText;
    evaluation.idempotencyKey = crypto
      .createHash("sha256")
      .update([...evaluation.videos.map((v) => v.sha256), rubric.rubricId, rubric.version, aiConfig.promptVersion, aiConfig.models.eval].join("|"))
      .digest("hex");
    evaluation.markModified("videos");

    // Same video, guide, prompt and model already evaluated: reuse instead of paying again.
    const previous = await AiEvaluation.findOne({
      idempotencyKey: evaluation.idempotencyKey,
      status: "completed",
      _id: { $ne: evaluation._id },
      trigger: { $ne: "admin-rescore" },
    }).lean();
    if (previous?.report && evaluation.trigger !== "admin-rescore") {
      evaluation.aiModel = previous.aiModel;
      evaluation.promptVersion = previous.promptVersion;
      evaluation.rawModelOutput = previous.rawModelOutput;
      evaluation.setupCheck = previous.setupCheck;
      evaluation.usage = usage;
      evaluation.costUsd = totalCost(usage);
      await completeEvaluation(evaluation, previous.report);
      return;
    }

    let report: EvaluationReport;
    if (!transcriptText.trim()) {
      // No speech at all: report "not answered" with low confidence instead of a low score,
      // and free the candidate to upload again at once (client decision).
      report = buildReport(
        rubric,
        {
          questions: [],
          strongestAreas: [],
          mainWeaknesses: [],
          summary: "No speech could be found in the interview video, so the answers could not be assessed.",
          overallConfidence: "low",
          audioOrTranscriptProblem: true,
          instructionAttempt: false,
        },
        transcriptText
      );
      evaluation.aiModel = "none";
      await VideoService.releaseLock(userId, VideoKind.INTERVIEW).catch((error: any) =>
        logger.warn("Could not release the video lock", { error: error.message })
      );
      await NotificationService.sendNotificationToUser(
        userId,
        "We could not hear your interview",
        "No speech was found in your interview video. Please upload it again with your microphone close to you."
      ).catch(() => undefined);
    } else {
      evaluation.status = "evaluating";
      await evaluation.save();
      announce(userId, evaluationId, "evaluating");
      const result = await evaluateTranscript(rubric, transcriptText);
      usage.push(...result.usage);
      report = buildReport(rubric, result.output, transcriptText);
      evaluation.aiModel = result.model;
      evaluation.promptVersion = result.promptVersion;
      evaluation.rawModelOutput = result.rawOutput;
    }

    // Setup problems only flag the video for an admin; the score is never changed by them.
    const setup = (await Promise.all(setupTasks)).find((result) => result !== null) ?? null;
    if (setup) {
      usage.push(setup.usage);
      evaluation.setupCheck = setup.check;
      if (setup.check.flags.length) {
        report = {
          ...report,
          needsHumanReview: true,
          reviewReasons: [...report.reviewReasons, ...setup.check.flags.map((flag) => `recording setup: ${flag}`)],
        };
      }
    }

    evaluation.usage = usage;
    evaluation.costUsd = totalCost(usage);
    await completeEvaluation(evaluation, report);
    logger.info(`AI evaluation ${evaluationId} completed: ${report.totals.earned}/${report.totals.max}`);
  } catch (error: any) {
    if (error instanceof EvaluationError) usage.push(...error.usage);
    evaluation.usage = usage;
    evaluation.costUsd = totalCost(usage);
    evaluation.error = error.message;
    evaluation.status = isFinalAttempt ? "failed" : "queued";
    evaluation.finishedAt = isFinalAttempt ? new Date() : undefined;
    await evaluation.save();
    announce(userId, evaluationId, isFinalAttempt ? "failed" : "queued");
    throw error;
  } finally {
    copies.forEach((copy) => copy.release());
  }
};

/**
 * Worker step for videos that are not scored (methodology): transcribe and
 * write the English captions, so every video can be watched with subtitles.
 */
const processCaptions = async (videoId: string, userId: string): Promise<void> => {
  const user = await User.findById(userId).lean();
  const entry = user ? getProfileEntry(user.userType, user.role) : null;
  const profile: any = entry && user?.profileId ? await entry.model.findById(user.profileId).lean() : null;
  const video = profile?.videos?.find((v: any) => String(v._id) === videoId);
  if (!video) return;

  const copy = await getLocalCopy(video.url);
  try {
    const transcript = await transcribeCached(copy.path);
    const captionsUrl = await saveCaptions(transcript.sha256, transcript.segments);
    if (captionsUrl) await VideoService.setCaptions(userId, videoId, captionsUrl);
  } finally {
    copy.release();
  }
};

/** Put evaluations that never finished (e.g. server restart, Redis down) back on the queue. */
const requeuePending = async (): Promise<number> => {
  const pending = await AiEvaluation.find({ status: { $in: ["queued", "transcribing", "evaluating"] } })
    .select("_id")
    .lean();
  for (const p of pending) await enqueueJob("interview", { id: p._id.toString() }, { jobId: `evaluate-${p._id}` });
  return pending.length;
};

// ─── Reading reports ─────────────────────────────────────────────────────────

/** Candidate themself, an admin, or someone the candidate accepted a connection/access request from. */
const canViewCandidate = async (viewer: Viewer, candidateUserId: string): Promise<boolean> => {
  if (viewer.userType === UserType.ADMIN || viewer.id === candidateUserId) return true;
  const link = await FriendList.exists({
    status: "accepted",
    $or: [
      { senderId: new Types.ObjectId(viewer.id), receiverId: new Types.ObjectId(candidateUserId) },
      { senderId: new Types.ObjectId(candidateUserId), receiverId: new Types.ObjectId(viewer.id) },
    ],
  });
  return !!link;
};

/** Apply reviewer score corrections on top of the AI report (the AI report is kept as is). */
export const applyCorrections = (rubric: Rubric | null, doc: Pick<TAiEvaluation, "report" | "corrections">): EvaluationReport | undefined => {
  const report = doc.report;
  if (!report || !rubric) return report;
  const scoreChanges = (doc.corrections ?? []).filter((c) => c.questionId !== undefined && c.newScore !== undefined);
  if (!scoreChanges.length) return report;
  const questions = report.questions.map((q) => {
    const last = [...scoreChanges].reverse().find((c) => c.questionId === q.questionId);
    if (!last) return q;
    return { ...q, score: last.newScore ?? null, status: last.newScore === null ? ("not_answered" as const) : ("scored" as const) };
  });
  const totals = computeTotals(rubric, questions);
  return { ...report, questions, totals, legacyScore100: Math.round(totals.percentage) };
};

/** The overall section (client section 5): what candidates and employers see. */
const toOverallView = (doc: TAiEvaluation) => {
  const report = applyCorrections(getRubric(doc.rubricId), doc);
  return {
    id: doc._id,
    status: doc.status,
    position: doc.position,
    displayName: report?.displayName,
    evaluatedAt: doc.finishedAt,
    ...(report && {
      totalScore: report.totals.earned,
      maxScore: report.totals.max,
      percentage: report.totals.percentage,
      classification: report.totals.band,
      notAnsweredCount: report.totals.notAnsweredCount,
      strongestAreas: report.strongestAreas,
      mainWeaknesses: report.mainWeaknesses,
      summary: report.summary,
      underReview: report.needsHumanReview && !doc.corrections?.some((c) => c.reviewStatus === "reviewed"),
      disclaimer: report.disclaimer,
    }),
  };
};

const toAdminView = (doc: TAiEvaluation) => ({
  ...doc,
  reviewedReport: applyCorrections(getRubric(doc.rubricId), doc),
});

const getLatestForCandidate = async (viewer: Viewer, candidateUserId: string) => {
  if (!Types.ObjectId.isValid(candidateUserId)) throw new AppError(StatusCodes.BAD_REQUEST, "Invalid candidate id");
  if (!(await canViewCandidate(viewer, candidateUserId))) {
    throw new AppError(StatusCodes.FORBIDDEN, "The candidate has not given you access to this assessment");
  }
  const latest = await AiEvaluation.findOne({ candidateUserId, isLatest: true, status: "completed" }).sort({ createdAt: -1 }).lean();
  const inProgress = await AiEvaluation.findOne({ candidateUserId, status: { $ne: "completed" } }).sort({ createdAt: -1 }).lean();
  const pending = inProgress && (!latest || inProgress.createdAt! > latest.createdAt!) ? { status: inProgress.status } : null;
  if (!latest) return { report: null, pending };
  return {
    report: viewer.userType === UserType.ADMIN ? toAdminView(latest) : toOverallView(latest),
    pending,
  };
};

const getStatus = async (viewer: Viewer, evaluationId: string) => {
  const doc = await AiEvaluation.findById(evaluationId).select("candidateUserId status error queuedAt startedAt finishedAt").lean();
  if (!doc) throw new AppError(StatusCodes.NOT_FOUND, "Evaluation not found");
  if (viewer.userType !== UserType.ADMIN && doc.candidateUserId.toString() !== viewer.id) {
    throw new AppError(StatusCodes.FORBIDDEN, "Not allowed");
  }
  return doc;
};

const rescore = async (candidateUserId: string) => {
  if (!aiConfig.evalEnabled) throw new AppError(StatusCodes.BAD_REQUEST, "AI evaluation is switched off (AI_EVAL_ENABLED)");
  const evaluation = await requestEvaluation(candidateUserId, "admin-rescore");
  if (!evaluation) throw new AppError(StatusCodes.BAD_REQUEST, "No scoring guide for this candidate's position");
  return evaluation;
};

const addCorrection = async (
  reviewerId: string,
  evaluationId: string,
  body: { questionId?: number; newScore?: number | null; reviewStatus?: "reviewed" | "needs_follow_up"; reason: string }
) => {
  const doc = await AiEvaluation.findById(evaluationId);
  if (!doc || doc.status !== "completed") throw new AppError(StatusCodes.NOT_FOUND, "Completed evaluation not found");
  let previousScore: number | null | undefined;
  if (body.questionId !== undefined) {
    const question = doc.report?.questions.find((q) => q.questionId === body.questionId);
    if (!question) throw new AppError(StatusCodes.BAD_REQUEST, `Question ${body.questionId} is not in this evaluation`);
    previousScore = applyCorrections(getRubric(doc.rubricId), doc)?.questions.find((q) => q.questionId === body.questionId)?.score;
  }
  doc.corrections.push({
    reviewerId: new Types.ObjectId(reviewerId),
    questionId: body.questionId,
    previousScore,
    newScore: body.newScore,
    reviewStatus: body.reviewStatus,
    reason: body.reason,
    createdAt: new Date(),
  });
  await doc.save();

  const reviewed = applyCorrections(getRubric(doc.rubricId), doc);
  if (reviewed && doc.isLatest) {
    await User.updateOne({ _id: doc.candidateUserId }, { interviewScore: reviewed.legacyScore100 });
  }
  return toAdminView(doc.toObject());
};

const listForReview = async (query: { page?: string; limit?: string }) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const filter = {
    status: "completed",
    isLatest: true,
    "report.needsHumanReview": true,
    "corrections.reviewStatus": { $ne: "reviewed" },
  };
  const [data, total] = await Promise.all([
    AiEvaluation.find(filter)
      .select("candidateUserId position rubricId report.totals report.reviewReasons report.displayName finishedAt")
      .populate("candidateUserId", "firstName lastName email")
      .sort({ finishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    AiEvaluation.countDocuments(filter),
  ]);
  return { data, meta: { page, limit, total, totalPage: Math.ceil(total / limit) } };
};

/** Questions shown to candidates for a position (from the client's scoring guide). */
const getQuestions = (position: string, level?: string) => {
  // Position names are unique across on-field and office staff
  const rubric =
    resolveRubric({ role: CandidateRole.ON_FIELD_STAFF, position, level }) ??
    resolveRubric({ role: CandidateRole.OFFICE_STAFF, position, level });
  if (!rubric) throw new AppError(StatusCodes.NOT_FOUND, "No scoring guide for this position");
  return {
    rubricId: rubric.rubricId,
    role: rubric.role,
    position: rubric.position,
    displayName: rubric.displayName,
    level: rubric.level ?? null,
    questionCount: rubric.questionCount,
    sections: rubric.sections.map((s) => ({
      id: s.id,
      name: s.name,
      questions: s.questions.map((q) => ({ id: q.id, text: q.text })),
    })),
  };
};

const listRubricSummaries = () =>
  listRubrics().map((r) => ({
    rubricId: r.rubricId,
    version: r.version,
    status: r.status,
    position: r.position,
    displayName: r.displayName,
    level: r.level ?? null,
    questionCount: r.questionCount,
    maxTotalScore: r.maxTotalScore,
  }));

export const AiEvaluationService = {
  requestEvaluation,
  requestEvaluationSafely,
  processEvaluation,
  processCaptions,
  requeuePending,
  canViewCandidate,
  getLatestForCandidate,
  getStatus,
  rescore,
  addCorrection,
  listForReview,
  getQuestions,
  listRubricSummaries,
};
