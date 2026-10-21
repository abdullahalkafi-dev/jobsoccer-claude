import { execFileSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import {
  buildExtractAudioArgs,
  extractAudio,
  getMediaDurationSeconds,
  removeTempFile,
} from "./audioExtractor";

const hasFfmpeg = (() => {
  try {
    execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
})();

describe("buildExtractAudioArgs", () => {
  it("passes the file name as a single argument", () => {
    const name = 'a"; rm -rf ~; echo "$(whoami)`id`.mp4';
    const args = buildExtractAudioArgs(name, "out.mp3");
    expect(args).toContain(name);
    expect(args[args.length - 1]).toBe("out.mp3");
  });
});

describe.skipIf(!hasFfmpeg)("ffmpeg integration", () => {
  it("extracts audio and reads duration for a file name with shell characters", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ai-media-test-"));
    const video = path.join(dir, "clip $x `y` ; z.mp4");
    const marker = path.join(dir, "injected");
    execFileSync("ffmpeg", [
      "-y", "-f", "lavfi", "-i", "sine=frequency=440:duration=2",
      "-f", "lavfi", "-i", "color=c=black:s=64x64:d=2",
      "-shortest", "-c:v", "libx264", "-c:a", "aac", video,
    ], { stdio: "ignore" });

    const audio = await extractAudio(video);
    expect(audio).not.toBeNull();
    expect(fs.statSync(audio!).size).toBeGreaterThan(0);
    removeTempFile(audio!);

    const seconds = await getMediaDurationSeconds(video);
    expect(seconds).toBeGreaterThan(1.5);
    expect(fs.existsSync(marker)).toBe(false);

    fs.rmSync(dir, { recursive: true, force: true });
  }, 60_000);
});
