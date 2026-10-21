import crypto from "crypto";
import fs from "fs";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import AppError from "../../errors/AppError";
import { aiConfig } from "../../shared/ai/ai.config";
import { UsageRecord } from "../../shared/ai/client/openaiClient";
import { EvaluationError, evaluateTranscript } from "../../shared/ai/evaluation/evaluator";
import { EvaluationReport } from "../../shared/ai/evaluation/evaluation.types";
import { buildReport, computeTotals } from "../../shared/ai/evaluation/guardrails";
import { enqueueAiJob } from "../../shared/ai/queue/aiQueue";
import { getRubric, listRubrics, resolveRubric } from "../../shared/ai/rubric/rubric.registry";
import { Rubric } from "../../shared/ai/rubric/rubric.schema";
import { transcribeVideoFile } from "../../shared/ai/transcription/transcriber";
import { VideoType } from "../../shared/constant/video.constant";
import { logger } from "../../shared/logger/logger";
import redisOperations from "../../shared/redis/redisClient";
import { getLocalCopy } from "../../shared/storage";
import { getCandidateModel } from "../../shared/util/getCandidateModel";
import { FriendList } from "../friendlist/friendlist.model";
import { NotificationService } from "../notification/notification.service";
import { CandidateRole, UserType } from "../user/user.interface";
import { User } from "../user/user.model";
import { TAiEvaluation } from "./aiEvaluation.interface";
import { AiEvaluation, AiTranscript } from "./aiEvaluation.model";

type Viewer = { id: string; userType: string };

/** True when this candidate is scored with a client scoring guide (new pipeline). */
export const usesRubricScoring = (role: string, position?: string | null): boolean =>
  aiConfig.evalEnabled && role === CandidateRole.ON_FIELD_STAFF && !!position && !!resolveRubric({ role, position });

// The interview video holds the answers; other videos may add to them.
const videoOrder = (type?: string) => (type === VideoType.PRE_RECORDED_INTERVIEW ? 0 : 1);

/**
 * Create a queued evaluation for the candidate's current videos and hand it to
 * the background worker. Returns null when the position has no scoring guide.
 */
const requestEvaluation = async (userId: string, trigger: string): Promise<TAiEvaluation | null> => {
  const user = await User.findById(userId).lean();
  if (!user || user.userType !== UserType.CANDIDATE || !user.profileId) return null;
  const profile = await getCandidateModel(user.role).findById(user.profileId).lean();
  if (!profile) return null;

  const rubric = resolveRubric({ role: user.role as string, position: profile.position });
  if (!aiConfig.evalEnabled || !rubric) return null;

  const videos = [...(profile.videos ?? [])]
    .filter((v: any) => v?.url)
    .sort((a: any, b: any) => videoOrder(a.videoType) - videoOrder(b.videoType))
    .map((v: any) => ({ url: v.url, videoType: v.videoType }));

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
  await enqueueAiJob("evaluate-interview", { id: evaluation._id.toString() });
  logger.info(`AI evaluation ${evaluation._id} queued for user ${userId} (${rubric.rubricId}, ${trigger})`);
  return evaluation.toObject();
};

/** Same as requestEvaluation but never throws: profile changes must not fail because of AI. */
const requestEvaluationSafely = async (userId: string, trigger: string): Promise<void> => {
  try {
    await requestEvaluation(userId, trigger);
  } catch (error: any) {
    logger.error(`Could not queue AI evaluation for ${userId}`, { error: error.message });
  }
};

const sha256File = (filePath: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    fs.createReadStream(filePath)
      .on("data", (chunk) => hash.update(chunk))
      .on("end", () => resolve(hash.digest("hex")))
      .on("error", reject);
  });

/** Transcript for one stored video, from the cache when the same file was seen before. */
const transcribeStoredVideo = async (url: string, usage: UsageRecord[]) => {
  const copy = await getLocalCopy(url);
  try {
    const sha256 = await sha256File(copy.path);
    const cacheKey = { sha256, model: aiConfig.models.transcribe, language: aiConfig.transcriptionLanguage };
    const cached = await AiTranscript.findOne(cacheKey).lean();
    if (cached) return { sha256, text: cached.text, durationSeconds: cached.durationSeconds ?? null };

    const result = await transcribeVideoFile(copy.path);
    usage.push(result.usage);
    await AiTranscript.updateOne(cacheKey, { $set: { text: result.text || " ", durationSeconds: result.durationSeconds } }, { upsert: true });
    return { sha256, text: result.text, durationSeconds: result.durationSeconds };
  } finally {
    copy.release();
  }
};

const totalCost = (usage: UsageRecord[]) =>
  Math.round(usage.reduce((n, u) => n + (u.estimatedCostUsd ?? 0), 0) * 1_000_000) / 1_000_000;

/** Store the finished report and keep the old 0-100 score in sync for cards and filters. */
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

  await getCandidateModel(evaluation.role).updateOne({ _id: evaluation.profileId }, { AiVideoVideoScore: report.legacyScore100 });
  await User.updateOne({ _id: evaluation.candidateUserId }, { AiVideoVideoScore: report.legacyScore100 });
  await redisOperations.del(`user:${evaluation.candidateUserId}:me`).catch(() => undefined);

  await NotificationService.sendNotificationToUser(
    evaluation.candidateUserId.toString(),
    "Interview assessment ready",
    `Your ${report.displayName} interview assessment is ready on your profile.`
  ).catch((error: any) => logger.warn("Could not send AI notification", { error: error.message }));
};

/** Worker step: transcribe, evaluate, check, store. Throws so the queue can retry. */
const processEvaluation = async (evaluationId: string, isFinalAttempt = true): Promise<void> => {
  const evaluation = await AiEvaluation.findById(evaluationId);
  if (!evaluation || evaluation.status === "completed") return;
  const rubric = getRubric(evaluation.rubricId);
  if (!rubric) throw new Error(`Unknown rubric ${evaluation.rubricId}`);

  const usage: UsageRecord[] = [];
  try {
    evaluation.status = "transcribing";
    evaluation.attempts += 1;
    evaluation.startedAt = new Date();
    evaluation.error = undefined;
    await evaluation.save();

    const parts: string[] = [];
    for (const video of evaluation.videos) {
      const t = await transcribeStoredVideo(video.url, usage);
      video.sha256 = t.sha256;
      video.durationSeconds = t.durationSeconds;
      video.transcriptChars = t.text.trim().length;
      if (t.text.trim()) parts.push(`[Video: ${video.videoType ?? "video"}]\n${t.text.trim()}`);
    }
    const transcript = parts.join("\n\n");
    evaluation.transcript = transcript;
    evaluation.idempotencyKey = crypto
      .createHash("sha256")
      .update([...evaluation.videos.map((v) => v.sha256), rubric.rubricId, rubric.version, aiConfig.promptVersion, aiConfig.models.eval].join("|"))
      .digest("hex");
    evaluation.markModified("videos");

    // Same videos, guide, prompt and model already evaluated: reuse instead of paying again.
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
      evaluation.usage = usage;
      evaluation.costUsd = totalCost(usage);
      await completeEvaluation(evaluation, previous.report);
      return;
    }

    let report: EvaluationReport;
    if (!transcript.trim()) {
      // No speech at all: report "not answered" with low confidence instead of a low score.
      report = buildReport(
        rubric,
        {
          questions: [],
          strongestAreas: [],
          mainWeaknesses: [],
          summary: "No speech could be found in the interview videos, so the answers could not be assessed.",
          overallConfidence: "low",
          audioOrTranscriptProblem: true,
          instructionAttempt: false,
        },
        transcript
      );
      evaluation.aiModel = "none";
    } else {
      evaluation.status = "evaluating";
      await evaluation.save();
      const result = await evaluateTranscript(rubric, transcript);
      usage.push(...result.usage);
      report = buildReport(rubric, result.output, transcript);
      evaluation.aiModel = result.model;
      evaluation.promptVersion = result.promptVersion;
      evaluation.rawModelOutput = result.rawOutput;
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
    throw error;
  }
};

/** Put evaluations that never finished (e.g. server restart, Redis down) back on the queue. */
const requeuePending = async (): Promise<number> => {
  const pending = await AiEvaluation.find({ status: { $in: ["queued", "transcribing", "evaluating"] } })
    .select("_id")
    .lean();
  for (const p of pending) await enqueueAiJob("evaluate-interview", { id: p._id.toString() });
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
    await getCandidateModel(doc.role).updateOne({ _id: doc.profileId }, { AiVideoVideoScore: reviewed.legacyScore100 });
    await User.updateOne({ _id: doc.candidateUserId }, { AiVideoVideoScore: reviewed.legacyScore100 });
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
  const rubric = resolveRubric({ role: CandidateRole.ON_FIELD_STAFF, position, level });
  if (!rubric) throw new AppError(StatusCodes.NOT_FOUND, "No scoring guide for this position");
  return {
    rubricId: rubric.rubricId,
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
