import fs from "fs";
import path from "path";
import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { logger } from "../../shared/logger/logger";
import { appEvents } from "../../shared/events/appEvents";
import { emitToUser } from "../../socket/emitToUser";
import { persistUploadedFiles } from "../../shared/storage";
import redisOperations from "../../shared/redis/redisClient";
import { NotificationService } from "../notification/notification.service";
import { getProfileEntry } from "../profile/profile.registry";
import { User } from "../user/user.model";
import { CandidateRole, UserType } from "../user/user.interface";
import { findSlot, getVideoPlan, TVideoPlan, TVideoSlot } from "./video.config";
import { LOCKED_KINDS, TProfileVideo, VIDEO_CONSENT_VERSION, VIDEO_LIMITS, VideoKind } from "./video.constant";
import { assertVideoMeetsRules, probeVideo } from "./video.validator";

/** Everything the video flow needs to know about one candidate. */
type TVideoContext = {
  user: any;
  profile: any;
  plan: TVideoPlan;
};

const loadContext = async (userId: string): Promise<TVideoContext> => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  if (user.userType !== UserType.CANDIDATE) {
    throw new AppError(StatusCodes.FORBIDDEN, "Only candidates upload profile videos");
  }
  if (!user.profileId) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Please create your profile before uploading videos.");
  }
  const entry = getProfileEntry(user.userType, user.role);
  const profile = entry ? await entry.model.findById(user.profileId) : null;
  if (!profile) throw new AppError(StatusCodes.NOT_FOUND, "Profile not found");

  const plan = getVideoPlan(user.role as CandidateRole, profile.position);
  if (!plan) {
    throw new AppError(StatusCodes.BAD_REQUEST, `Videos are not configured for ${profile.position ?? user.role}.`);
  }
  return { user, profile, plan };
};

const invalidateMeCache = (userId: string) => redisOperations.del(`user:${userId}:me`).catch(() => undefined);

const lockedUntilFor = (slot: TVideoSlot): Date | null => {
  if (!slot.locked) return null;
  const date = new Date();
  date.setMonth(date.getMonth() + VIDEO_LIMITS.lockMonths);
  return date;
};

const isLockActive = (video: TProfileVideo | undefined): boolean =>
  !!video?.lockedUntil && new Date(video.lockedUntil).getTime() > Date.now();

const formatDate = (date: Date): string => new Date(date).toISOString().slice(0, 10);

/** The candidate must have accepted the notices before an upload (client: "you will be asked to confirm"). */
const assertConsent = (ctx: TVideoContext, slot: TVideoSlot): void => {
  const consent = ctx.user.videoConsent ?? {};
  if (ctx.plan.consent.ai.required && !consent.aiAt) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Please accept the AI notice before uploading your videos.");
  }
  if (slot.kind === VideoKind.METHODOLOGY && ctx.plan.consent.players.required && !consent.playersAt) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Please confirm you have permission to film the people shown in your video.");
  }
};

const removeRejectedFile = async (filePath?: string): Promise<void> => {
  if (!filePath) return;
  await fs.promises.unlink(filePath).catch(() => undefined);
};

/** What the screens need: the plan, current videos with their lock state, and what is still missing. */
const getStatus = async (userId: string) => {
  const { user, profile, plan } = await loadContext(userId);
  const videos: TProfileVideo[] = (profile.videos ?? []).map((v: any) => (v.toObject ? v.toObject() : v));
  const missing = plan.slots
    .filter((slot) => slot.required)
    .filter((slot) => videos.filter((v) => v.kind === slot.kind).length < slot.count)
    .map((slot) => slot.kind);
  return {
    plan,
    videos: videos.map((v) => ({ ...v, isLocked: isLockActive(v) })),
    missing,
    isComplete: missing.length === 0,
    consent: { ...(user.videoConsent ?? {}), currentVersion: VIDEO_CONSENT_VERSION },
  };
};

/** Record the candidate's consent (the checkboxes shown before upload). */
const saveConsent = async (userId: string, input: { ai?: boolean; players?: boolean }) => {
  const update: Record<string, unknown> = { "videoConsent.version": VIDEO_CONSENT_VERSION };
  if (input.ai) update["videoConsent.aiAt"] = new Date();
  if (input.players) update["videoConsent.playersAt"] = new Date();
  const user = await User.findByIdAndUpdate(userId, { $set: update }, { new: true });
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  await invalidateMeCache(userId);
  return user.videoConsent;
};

/**
 * May this candidate store a video of this kind now? (slot exists, consent given, not locked,
 * room for another). Used before an upload starts and again when the file has arrived.
 */
const checkUploadAllowed = async (userId: string, kind: VideoKind, replaceVideoId?: string) => {
  const ctx = await loadContext(userId);
  const slot = findSlot(ctx.plan, kind);
  if (!slot) {
    throw new AppError(StatusCodes.BAD_REQUEST, `${ctx.profile.position ?? ctx.user.role} does not use ${kind} videos.`);
  }
  assertConsent(ctx, slot);

  const sameKind = (ctx.profile.videos as any[]).filter((v) => v.kind === kind);
  let target: any;
  if (slot.count === 1) {
    target = sameKind[0];
  } else if (replaceVideoId) {
    target = sameKind.find((v) => String(v._id) === replaceVideoId);
    if (!target) throw new AppError(StatusCodes.NOT_FOUND, "The video to replace was not found.");
  } else if (sameKind.length >= slot.count) {
    throw new AppError(StatusCodes.BAD_REQUEST, `You already have ${slot.count} ${kind.toLowerCase()} videos. Replace one of them.`);
  }

  if (target && isLockActive(target)) {
    throw new AppError(
      StatusCodes.LOCKED,
      `Your ${kind.toLowerCase()} video is locked until ${formatDate(target.lockedUntil)}. Contact support if you need to change it earlier.`
    );
  }
  return { ctx, slot, target };
};

/**
 * Store ONE video on the profile.
 * Checks: consent, the 3-month lock, and the real file (length, 720p, sound).
 * Anything slow (transcription, captions, the AI interview) happens afterwards
 * in the background, so this request ends as soon as the file is validated and saved.
 */
const uploadVideo = async (input: {
  userId: string;
  kind: VideoKind;
  file: Pick<Express.Multer.File, "path" | "size">;
  title?: string;
  /** Highlights only: which of the two videos to replace. */
  replaceVideoId?: string;
}) => {
  const { userId, kind, file, title, replaceVideoId } = input;
  // The file has fully arrived; tell the candidate's screen what happens next (a large file takes a while).
  const stage = (name: "checking" | "saving") => emitToUser(userId, "video:stage", { kind, stage: name });
  try {
    stage("checking");
    const { ctx, slot, target } = await checkUploadAllowed(userId, kind, replaceVideoId);

    const probe = await probeVideo(file.path);
    assertVideoMeetsRules(probe, kind, slot.maxSeconds);

    const video = {
      kind,
      url: `videos/${path.basename(file.path)}`,
      durationSeconds: Math.round(probe.durationSeconds),
      width: probe.width,
      height: probe.height,
      sizeBytes: file.size,
      title: title?.trim() || slot.title,
      uploadedAt: new Date(),
      lockedUntil: lockedUntilFor(slot),
      captionsUrl: undefined,
    };

    stage("saving");
    if (target) target.set(video);
    else ctx.profile.videos.push(video);
    await ctx.profile.save();

    // Copy to MinIO/S3 when configured (no-op for local storage); never blocks the answer on failure.
    await persistUploadedFiles([file.path]);
    await invalidateMeCache(userId);

    const saved: any = target ?? ctx.profile.videos[ctx.profile.videos.length - 1];
    const videoId = String(saved._id);
    appEvents.emit("video.uploaded", { userId, videoId, kind });
    emitToUser(userId, "video:updated", { videoId, kind, status: "uploaded" });
    return { video: saved.toObject ? saved.toObject() : saved, status: await getStatus(userId) };
  } catch (error) {
    await removeRejectedFile(file?.path);
    throw error;
  }
};

/** Remove an optional video (office methodology, optional player highlights). The file itself is kept. */
const deleteVideo = async (userId: string, videoId: string) => {
  const ctx = await loadContext(userId);
  const video = (ctx.profile.videos as any[]).find((v) => String(v._id) === videoId);
  if (!video) throw new AppError(StatusCodes.NOT_FOUND, "Video not found");

  const slot = findSlot(ctx.plan, video.kind);
  if (slot?.required) {
    throw new AppError(StatusCodes.BAD_REQUEST, "This video is required. You can replace it, but not delete it.");
  }
  if (isLockActive(video)) {
    throw new AppError(StatusCodes.LOCKED, `This video is locked until ${formatDate(video.lockedUntil)}.`);
  }

  ctx.profile.videos.pull({ _id: videoId });
  await ctx.profile.save();
  await invalidateMeCache(userId);
  appEvents.emit("video.deleted", { userId, kind: video.kind });
  emitToUser(userId, "video:updated", { videoId, kind: video.kind, status: "deleted" });
  return getStatus(userId);
};

/**
 * End the lock early: by an admin (wrong file, broken upload) or automatically
 * when the AI finds no speech in the interview (client: "upload again right away").
 */
const releaseLock = async (userId: string, kind?: VideoKind): Promise<number> => {
  const ctx = await loadContext(userId);
  let released = 0;
  for (const video of ctx.profile.videos as any[]) {
    if ((kind && video.kind !== kind) || !LOCKED_KINDS.includes(video.kind) || !video.lockedUntil) continue;
    video.lockedUntil = null;
    released += 1;
  }
  if (released) {
    await ctx.profile.save();
    await invalidateMeCache(userId);
    emitToUser(userId, "video:updated", { kind: kind ?? "all", status: "unlocked" });
  }
  return released;
};

/** Admin action: unlock a candidate's videos and tell the candidate. */
const unlockVideosByAdmin = async (candidateUserId: string, kind?: VideoKind) => {
  const released = await releaseLock(candidateUserId, kind);
  if (released) {
    await NotificationService.sendNotificationToUser(
      candidateUserId,
      "Video unlocked",
      "Your video has been unlocked by JOBSOCCER support. You can upload a new version now."
    ).catch((error: any) => logger.warn("Could not send unlock notification", { error: error.message }));
  }
  return { released };
};

/** Save the path of the generated English captions on the video (set by the caption worker). */
const setCaptions = async (userId: string, videoId: string, captionsUrl: string): Promise<void> => {
  const user = await User.findById(userId).lean();
  const entry = user ? getProfileEntry(user.userType, user.role) : null;
  if (!user?.profileId || !entry) return;
  await entry.model.updateOne({ _id: user.profileId, "videos._id": videoId }, { $set: { "videos.$.captionsUrl": captionsUrl } });
  await invalidateMeCache(userId);
  emitToUser(userId, "video:updated", { videoId, status: "captions-ready" });
};

export const VideoService = {
  getStatus,
  saveConsent,
  checkUploadAllowed,
  uploadVideo,
  deleteVideo,
  releaseLock,
  unlockVideosByAdmin,
  setCaptions,
};
