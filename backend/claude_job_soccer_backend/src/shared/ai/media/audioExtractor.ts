import { execFile } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { promisify } from "util";
import { logger } from "../../logger/logger";
import { aiConfig } from "../ai.config";

const execFileAsync = promisify(execFile);

/**
 * Media helpers built on ffmpeg / ffprobe.
 *
 * Commands are run with execFile and an argument array, never through a shell,
 * so file names containing quotes, `$`, backticks or `;` cannot inject commands.
 */

let ffmpegAvailable: boolean | null = null;

export const isFfmpegAvailable = async (): Promise<boolean> => {
  if (ffmpegAvailable !== null) return ffmpegAvailable;
  try {
    await execFileAsync("ffmpeg", ["-version"]);
    ffmpegAvailable = true;
  } catch {
    ffmpegAvailable = false;
    logger.warn("ffmpeg not found - audio extraction is disabled");
  }
  return ffmpegAvailable;
};

/** ffmpeg arguments: mono, 16 kHz, 64 kbps mp3 (speech quality, ~0.5 MB per minute). */
export const buildExtractAudioArgs = (videoPath: string, audioPath: string): string[] => [
  "-y",
  "-i",
  videoPath,
  "-vn",
  "-ac",
  "1",
  "-ar",
  "16000",
  "-b:a",
  "64k",
  "-f",
  "mp3",
  audioPath,
];

/**
 * Extract a speech-optimised mp3 from a video into the OS temp folder.
 * Returns the audio path, or null when ffmpeg is missing or fails.
 * The caller must delete the file with removeTempFile().
 */
export const extractAudio = async (videoPath: string): Promise<string | null> => {
  if (!(await isFfmpegAvailable())) return null;

  const audioPath = path.join(
    os.tmpdir(),
    `ai_audio_${Date.now()}_${Math.random().toString(36).slice(2)}.mp3`
  );

  try {
    await execFileAsync("ffmpeg", buildExtractAudioArgs(videoPath, audioPath), {
      timeout: aiConfig.media.ffmpegTimeoutMs,
    });
    if (!fs.existsSync(audioPath)) return null;
    const sizeMb = fs.statSync(audioPath).size / 1024 / 1024;
    logger.info(`Audio extracted: ${sizeMb.toFixed(2)}MB from ${path.basename(videoPath)}`);
    return audioPath;
  } catch (error: any) {
    logger.error(`Failed to extract audio from ${videoPath}`, { error: error.message });
    removeTempFile(audioPath);
    return null;
  }
};

/** Real media duration in seconds via ffprobe, or null when it cannot be read. */
export const getMediaDurationSeconds = async (filePath: string): Promise<number | null> => {
  try {
    const { stdout } = await execFileAsync(
      "ffprobe",
      ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", filePath],
      { timeout: 30_000 }
    );
    const seconds = Number.parseFloat(String(stdout).trim());
    return Number.isFinite(seconds) ? seconds : null;
  } catch (error: any) {
    logger.warn(`Could not read duration of ${path.basename(filePath)}`, { error: error.message });
    return null;
  }
};

export const removeTempFile = (filePath: string): void => {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {
    // temp file clean-up is best effort
  }
};
