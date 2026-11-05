import { execFile } from "child_process";
import path from "path";
import { promisify } from "util";
import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { logger } from "../../shared/logger/logger";
import { VIDEO_LIMITS, VideoKind } from "./video.constant";

const execFileAsync = promisify(execFile);

export type TProbeResult = {
  durationSeconds: number;
  width: number;
  height: number;
  hasAudio: boolean;
};

/** Seconds of slack for container rounding, so a 6:30 recording is not rejected at 6:30.4. */
const DURATION_TOLERANCE_SECONDS = 1;

const formatClock = (seconds: number): string => `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, "0")}`;

/**
 * Read the real duration, resolution and audio presence with ffprobe.
 * Arguments go through execFile (no shell), so file names cannot inject commands.
 */
export const probeVideo = async (filePath: string): Promise<TProbeResult> => {
  try {
    const { stdout } = await execFileAsync(
      "ffprobe",
      ["-v", "error", "-print_format", "json", "-show_streams", "-show_format", filePath],
      { timeout: 30_000, maxBuffer: 5 * 1024 * 1024 }
    );
    const info = JSON.parse(String(stdout));
    const video = (info.streams ?? []).find((s: any) => s.codec_type === "video");
    if (!video) throw new Error("no video stream");
    const duration = Number.parseFloat(info.format?.duration ?? video.duration ?? "");
    if (!Number.isFinite(duration)) throw new Error("no duration");
    return {
      durationSeconds: duration,
      width: Number(video.width) || 0,
      height: Number(video.height) || 0,
      hasAudio: (info.streams ?? []).some((s: any) => s.codec_type === "audio"),
    };
  } catch (error: any) {
    logger.warn(`ffprobe failed for ${path.basename(filePath)}`, { error: error.message });
    throw new AppError(StatusCodes.BAD_REQUEST, "This file could not be read as a video. Please upload an MP4 or MOV file.");
  }
};

/**
 * Enforce the client's technical rules on the uploaded file itself.
 * (The browser also checks, but only this check cannot be bypassed.)
 */
export const assertVideoMeetsRules = (probe: TProbeResult, kind: VideoKind, maxSeconds: number): void => {
  if (probe.durationSeconds > maxSeconds + DURATION_TOLERANCE_SECONDS) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `This video is ${formatClock(probe.durationSeconds)} long. The maximum for a ${kind.toLowerCase()} video is ${formatClock(maxSeconds)}.`
    );
  }
  const shortSide = Math.min(probe.width, probe.height);
  if (shortSide < VIDEO_LIMITS.minShortSide) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `This video is ${probe.width}x${probe.height}. The minimum quality is 720p (1280x720).`
    );
  }
  if (!probe.hasAudio && kind !== VideoKind.HIGHLIGHTS) {
    throw new AppError(StatusCodes.BAD_REQUEST, "This video has no sound. Interview and methodology videos need your voice.");
  }
};

export const isAllowedVideoFile = (originalName: string, mimeType: string): boolean =>
  (VIDEO_LIMITS.allowedMimeTypes as readonly string[]).includes(mimeType) &&
  (VIDEO_LIMITS.allowedExtensions as readonly string[]).includes(path.extname(originalName).toLowerCase());
