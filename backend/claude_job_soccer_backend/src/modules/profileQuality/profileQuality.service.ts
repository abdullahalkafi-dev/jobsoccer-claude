import crypto from "crypto";
import { Types } from "mongoose";
import { aiConfig } from "../../shared/ai/ai.config";
import { enqueueJob } from "../../shared/ai/queue/aiQueue";
import { appEvents } from "../../shared/events/appEvents";
import { logger } from "../../shared/logger/logger";
import redisOperations from "../../shared/redis/redisClient";
import { emitToUser } from "../../socket/emitToUser";
import { AdminVerification } from "../adminVerification/adminVerification.model";
import { CandidateEducation } from "../candidateEducation/candidateEducation.model";
import { CandidateExperience } from "../candidateExperience/candidateExperience.model";
import { CandidateLicenseAndCertification } from "../candidateLicensesAndCertification/candidateLicensesAndCertification.model";
import { CandidateResume } from "../candidateResume/candidateResume.model";
import { getResumeText } from "../candidateResume/resumeText.service";
import { Message } from "../message/message.model";
import { getProfileEntry } from "../profile/profile.registry";
import { CandidateRole, UserType } from "../user/user.interface";
import { User } from "../user/user.model";
import { judgeProfileText } from "./profileQuality.ai";
import { TAiJudgement, TProfileQuality } from "./profileQuality.interface";
import { calculateProfileQuality, TQualitySnapshot } from "./profileQuality.rules";

const RESPONSE_WINDOW_DAYS = 90;
/** Fewer received conversations than this and responsiveness is not rated (new users are not penalised). */
const MIN_CONVERSATIONS_TO_RATE = 3;
/** Edits within this window collapse into one recalculation. */
const DEBOUNCE_MS = 3_000;

/** Share of received conversations the candidate answered (null when there are too few to judge). */
const loadResponseRate = async (userId: string): Promise<number | null> => {
  const since = new Date(Date.now() - RESPONSE_WINDOW_DAYS * 24 * 3600 * 1000);
  const received = await Message.aggregate([
    { $match: { receiverId: new Types.ObjectId(userId), createdAt: { $gte: since }, isDeleted: { $ne: true } } },
    { $group: { _id: "$chatId", firstReceivedAt: { $min: "$createdAt" } } },
  ]);
  if (received.length < MIN_CONVERSATIONS_TO_RATE) return null;
  const replied = await Promise.all(
    received.map((chat) => Message.exists({ chatId: chat._id, senderId: new Types.ObjectId(userId), createdAt: { $gte: chat.firstReceivedAt } }))
  );
  return replied.filter(Boolean).length / received.length;
};

/** Load everything the rules need about one candidate, in parallel. */
const loadSnapshot = async (userId: string): Promise<{ snapshot: TQualitySnapshot; resumeText: string | null; position?: string } | null> => {
  const user = await User.findById(userId).lean();
  if (!user || user.userType !== UserType.CANDIDATE || !user.profileId) return null;
  const entry = getProfileEntry(user.userType, user.role);
  const profile: any = entry ? await entry.model.findById(user.profileId).lean() : null;
  if (!profile) return null;

  const [experiences, educations, licenses, resume, verification, responseRate] = await Promise.all([
    CandidateExperience.find({ userId }).lean(),
    CandidateEducation.find({ userId }).lean(),
    CandidateLicenseAndCertification.find({ userId }).lean(),
    CandidateResume.findOne({ userId, isActive: true }).lean(),
    AdminVerification.findOne({ userId }).lean(),
    loadResponseRate(userId),
  ]);
  const resumeText = resume ? await getResumeText(userId, resume.resumeUrl) : null;

  return {
    resumeText,
    position: profile.position,
    snapshot: {
      role: user.role as CandidateRole,
      profile,
      profileImage: user.profileImage,
      videos: profile.videos ?? [],
      experiences: experiences as any[],
      educations: educations as any[],
      licenses: licenses as any[],
      resume: resume ? { text: resumeText } : null,
      identityStatus: (verification?.status as TQualitySnapshot["identityStatus"]) ?? null,
      responseRate,
      now: new Date(),
    },
  };
};

/** Fingerprint of the written parts, so the AI is only called when they change. */
const textHash = (snapshot: TQualitySnapshot, resumeText: string | null): string =>
  crypto
    .createHash("sha256")
    .update(JSON.stringify([snapshot.role, snapshot.experiences.map((e) => [e.description]), resumeText]))
    .digest("hex");

const hasWrittenParts = (snapshot: TQualitySnapshot, resumeText: string | null): boolean =>
  snapshot.experiences.some((e) => (e.description ?? "").trim()) || !!resumeText;

const save = async (userId: string, quality: TProfileQuality): Promise<void> => {
  await User.updateOne({ _id: userId }, { $set: { profileQuality: quality } });
  await redisOperations.del(`user:${userId}:me`).catch(() => undefined);
  emitToUser(userId, "profileQuality:updated", { score: quality.score, level: quality.level, stars: quality.stars });
};

/**
 * Calculate and store the Profile Quality Score of one candidate.
 *  1. Rules give the score immediately (no AI cost) and it is saved.
 *  2. If the written parts changed since the last AI judgement, the AI judges them
 *     and the score is refreshed. If the AI fails, the rule-based score stays.
 */
const recalculate = async (userId: string): Promise<TProfileQuality | null> => {
  const loaded = await loadSnapshot(userId);
  if (!loaded) return null;
  const { snapshot, resumeText } = loaded;

  const previous = (await User.findById(userId).select("profileQuality").lean())?.profileQuality as TProfileQuality | undefined;
  const hash = textHash(snapshot, resumeText);
  let ai: TAiJudgement | undefined = previous?.ai?.hash === hash ? previous.ai : undefined;

  const compute = (judgement?: TAiJudgement): TProfileQuality => {
    const result = calculateProfileQuality({ ...snapshot, ai: judgement });
    const tips = [...result.tips.slice(0, 4), ...(judgement?.tips ?? [])].slice(0, 5);
    return { ...result, tips, ...(judgement ? { ai: judgement } : {}), calculatedAt: new Date() };
  };

  let quality = compute(ai);
  await save(userId, quality);

  if (!ai && aiConfig.evalEnabled && hasWrittenParts(snapshot, resumeText)) {
    try {
      const judged = await judgeProfileText({
        role: snapshot.role,
        position: loaded.position,
        experiences: snapshot.experiences as any[],
        resumeText,
      });
      ai = { hash, ...judged, judgedAt: new Date() };
      quality = compute(ai);
      await save(userId, quality);
    } catch (error: any) {
      logger.warn(`Profile quality AI judgement failed for ${userId} (rule-based score kept)`, { error: error.message });
    }
  }
  return quality;
};

/**
 * Ask for a recalculation in the background. Many quick edits become one job
 * (same id within a few seconds), and the request that caused the change never waits.
 */
const requestRecalculation = (userId: string): void => {
  const bucket = Math.floor(Date.now() / DEBOUNCE_MS);
  void enqueueJob("profileQuality", { id: userId }, { jobId: `pq-${userId}-${bucket}`, delayMs: DEBOUNCE_MS });
};

/** Anything that feeds the score announces itself through the event bus. */
const registerListeners = (): void => {
  appEvents.on("profile.changed", ({ userId }) => requestRecalculation(userId));
  appEvents.on("video.uploaded", ({ userId }) => requestRecalculation(userId));
  appEvents.on("video.deleted", ({ userId }) => requestRecalculation(userId));
};

/**
 * Keep scores fresh without a request: candidates that have no score yet (existing
 * accounts after this feature ships) or whose score is older than a week are
 * recalculated in small batches. "Recently updated" also decays with time.
 */
const queueStaleRecalculations = async (limit = 200): Promise<number> => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const stale = await User.find({
    userType: UserType.CANDIDATE,
    isDeleted: { $ne: true },
    profileId: { $exists: true, $ne: null },
    $or: [{ "profileQuality.calculatedAt": { $exists: false } }, { "profileQuality.calculatedAt": { $lt: weekAgo } }],
  })
    .select("_id")
    .limit(limit)
    .lean();
  for (const user of stale) requestRecalculation(user._id.toString());
  return stale.length;
};

const startStaleRecalculationSchedule = (): void => {
  const run = () =>
    queueStaleRecalculations()
      .then((count) => count && logger.info(`Queued ${count} profile quality recalculation(s)`))
      .catch((error: any) => logger.warn("Could not queue stale profile quality recalculations", { error: error.message }));
  setTimeout(run, 60_000).unref();
  setInterval(run, 30 * 60_000).unref();
};

export const ProfileQualityService = {
  recalculate,
  requestRecalculation,
  registerListeners,
  queueStaleRecalculations,
  startStaleRecalculationSchedule,
};
