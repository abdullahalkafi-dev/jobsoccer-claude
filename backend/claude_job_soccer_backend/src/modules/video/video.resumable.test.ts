import fs from "fs";
import os from "os";
import path from "path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// The real checks need the database; here only the piece handling is tested.
const uploadVideo = vi.fn(async (input: { file: { path: string; size: number } }) => ({ savedPath: input.file.path }));
vi.mock("./video.service", () => ({
  VideoService: { checkUploadAllowed: vi.fn(async () => ({})), uploadVideo: (input: any) => uploadVideo(input) },
}));

const originalCwd = process.cwd();
const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "resumable-"));
let Resumable: typeof import("./video.resumable").ResumableVideoUpload;

beforeAll(async () => {
  process.chdir(workDir); // the module keeps its pieces under <cwd>/uploads
  Resumable = (await import("./video.resumable")).ResumableVideoUpload;
});
afterAll(() => {
  process.chdir(originalCwd);
  fs.rmSync(workDir, { recursive: true, force: true });
});

const userId = "6af71bda7d70b6002b44bcb8";
const file = Buffer.from("0123456789abcdefghij"); // 20 bytes
const startInput = { userId, kind: "Interview" as any, fileName: "My Interview.mp4", size: file.length, lastModified: 1700000000000 };

describe("resumable video upload", () => {
  it("rejects wrong file types and sizes before anything is stored", async () => {
    await expect(Resumable.start({ ...startInput, fileName: "x.avi" })).rejects.toThrow(/MP4 or MOV/);
    await expect(Resumable.start({ ...startInput, size: 700 * 1024 * 1024 })).rejects.toThrow(/larger than/);
  });

  it("receives pieces in order, refuses a wrong offset, and continues the same file after a restart", async () => {
    const first = await Resumable.start(startInput);
    expect(first.resumed).toBe(false);
    expect(first.receivedBytes).toBe(0);

    const r1 = await Resumable.appendChunk({ userId, id: first.uploadId, offset: 0, data: file.subarray(0, 8) });
    expect(r1.receivedBytes).toBe(8);

    // A retried piece (the answer was lost) must not be written twice
    await expect(Resumable.appendChunk({ userId, id: first.uploadId, offset: 0, data: file.subarray(0, 8) })).rejects.toThrow(/byte 8/);

    // Choosing the same file again continues where it stopped
    const again = await Resumable.start(startInput);
    expect(again.uploadId).toBe(first.uploadId);
    expect(again.resumed).toBe(true);
    expect(again.receivedBytes).toBe(8);

    // Another user cannot touch it
    await expect(Resumable.status("aaaaaaaaaaaaaaaaaaaaaaaa", first.uploadId)).rejects.toThrow(/not found/);

    // Not finished yet
    await expect(Resumable.complete(userId, first.uploadId)).rejects.toThrow(/not finished/);

    await Resumable.appendChunk({ userId, id: first.uploadId, offset: 8, data: file.subarray(8) });
    expect((await Resumable.status(userId, first.uploadId)).receivedBytes).toBe(20);

    // A piece beyond the end is refused
    await expect(Resumable.appendChunk({ userId, id: first.uploadId, offset: 20, data: Buffer.from("x") })).rejects.toThrow(/does not fit/);

    const result: any = await Resumable.complete(userId, first.uploadId);
    expect(fs.readFileSync(result.savedPath).equals(file)).toBe(true);
    expect(path.basename(path.dirname(result.savedPath))).toBe("videos");
    expect(result.savedPath.endsWith(".mp4")).toBe(true);

    // The session is gone afterwards
    await expect(Resumable.status(userId, first.uploadId)).rejects.toThrow(/not found/);
  });

  it("handles two copies of the same piece arriving at once (only one is written)", async () => {
    const s = await Resumable.start({ ...startInput, fileName: "second.mp4" });
    const results = await Promise.allSettled([
      Resumable.appendChunk({ userId, id: s.uploadId, offset: 0, data: file.subarray(0, 10) }),
      Resumable.appendChunk({ userId, id: s.uploadId, offset: 0, data: file.subarray(0, 10) }),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect((await Resumable.status(userId, s.uploadId)).receivedBytes).toBe(10);
  });
});
