import fs from "fs";
import path from "path";
import { persistUploadedFiles } from "../../storage";
import { TCaptionSegment } from "../transcription/transcriber";

/** "00:01:05.250" - the WebVTT time format. */
const vttTime = (seconds: number): string => {
  const total = Math.max(0, seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = Math.floor(total % 60);
  const ms = Math.round((total - Math.floor(total)) * 1000);
  const pad = (n: number, len = 2) => String(n).padStart(len, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(ms === 1000 ? 999 : ms, 3)}`;
};

/** Turn timed segments into a WebVTT subtitle file (what a <track> element plays). */
export const toWebVtt = (segments: TCaptionSegment[]): string => {
  const cues = segments.map((segment, index) => {
    // "-->" inside a cue would end it early, and blank lines split cues.
    const text = segment.text.replace(/-->/g, "->").replace(/\r?\n\s*\r?\n/g, "\n");
    return `${index + 1}\n${vttTime(segment.start)} --> ${vttTime(Math.max(segment.end, segment.start + 0.1))}\n${text}`;
  });
  return `WEBVTT\n\n${cues.join("\n\n")}\n`;
};

/**
 * Write the captions for one video file. The name comes from the video's content
 * hash, so the same file always gets the same captions file and nothing is duplicated.
 * Returns the public path (served at /captions/...), or null when there is no speech.
 */
export const saveCaptions = async (sha256: string, segments: TCaptionSegment[]): Promise<string | null> => {
  if (!segments.length) return null;
  const directory = path.join(process.cwd(), "uploads", "captions");
  await fs.promises.mkdir(directory, { recursive: true });
  const filePath = path.join(directory, `${sha256}.vtt`);
  await fs.promises.writeFile(filePath, toWebVtt(segments), "utf8");
  await persistUploadedFiles([filePath]);
  return `captions/${sha256}.vtt`;
};
