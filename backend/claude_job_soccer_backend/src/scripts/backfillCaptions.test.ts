import { describe, expect, it, vi } from "vitest";
import { missingLangs, runBackfill, shaFromCaptionsUrl, TBackfillDeps, TBackfillVideo } from "./backfillCaptions";

const SHA = "a".repeat(64);
const videos: TBackfillVideo[] = [
  { userId: "u1", videoId: "v1", captionsUrl: `captions/${SHA}.vtt` },
  { userId: "u2", videoId: "v2", captionsUrl: `captions/${"b".repeat(64)}.vtt`, captions: { es: "x", fr: "y" } },
  { userId: "u3", videoId: "v3", captionsUrl: `captions/${"c".repeat(64)}.vtt`, captions: { es: "x" } },
];

const makeDeps = (): TBackfillDeps => ({
  async *listVideos() {
    for (const v of videos) yield v;
  },
  readEnglishVtt: vi.fn(async () => "WEBVTT\n\n1\n00:00:00.000 --> 00:00:02.000\nHello\n"),
  readTranscript: vi.fn(async () => null),
  writeTracks: vi.fn(async (sha, _src, langs) => Object.fromEntries(langs.map((l) => [l, `captions/${sha}.${l}.vtt`]))),
  saveTracks: vi.fn(async () => undefined),
  sleep: vi.fn(async () => undefined),
  log: vi.fn(),
});

describe("captions backfill", () => {
  it("helpers", () => {
    expect(shaFromCaptionsUrl(`captions/${SHA}.vtt`)).toBe(SHA);
    expect(shaFromCaptionsUrl("captions/odd.vtt")).toBeNull();
    expect(missingLangs({})).toEqual(["es", "fr"]);
    expect(missingLangs({ captions: { es: "x" } })).toEqual(["fr"]);
  });

  it("dry run plans the work but reads no files, calls no model and writes nothing", async () => {
    const deps = makeDeps();
    const result = await runBackfill(deps, { dryRun: true, delayMs: 0 });
    expect(result).toMatchObject({ scanned: 3, skipped: 1, planned: 2, done: 0 });
    expect(deps.readEnglishVtt).not.toHaveBeenCalled();
    expect(deps.writeTracks).not.toHaveBeenCalled();
    expect(deps.saveTracks).not.toHaveBeenCalled();
  });

  it("real run only creates the missing languages, skips finished videos and honours the limit", async () => {
    const deps = makeDeps();
    const result = await runBackfill(deps, { dryRun: false, delayMs: 5 });
    expect(result).toMatchObject({ done: 2, skipped: 1, failed: 0 });
    expect((deps.writeTracks as any).mock.calls.map((c: any[]) => c[2])).toEqual([["es", "fr"], ["fr"]]);
    expect(deps.sleep).toHaveBeenCalledWith(5);

    const limited = makeDeps();
    expect((await runBackfill(limited, { dryRun: false, delayMs: 0, limit: 1 })).done).toBe(1);
  });

  it("one failing video does not stop the others", async () => {
    const deps = makeDeps();
    (deps.writeTracks as any).mockRejectedValueOnce(new Error("disk full"));
    expect(await runBackfill(deps, { dryRun: false, delayMs: 0 })).toMatchObject({ failed: 1, done: 1 });
  });
});
