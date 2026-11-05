import fs from "fs";
import os from "os";
import path from "path";
import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.mock is hoisted above everything else, so the mocks it uses must be created with vi.hoisted
const { transcriptionsCreate, translationsCreate } = vi.hoisted(() => ({ transcriptionsCreate: vi.fn(), translationsCreate: vi.fn() }));

vi.mock("../client/openaiClient", () => ({
  aiClient: { audio: { transcriptions: { create: transcriptionsCreate }, translations: { create: translationsCreate } } },
  recordUsage: (task: string, model: string) => ({ task, model, durationMs: 1, inputTokens: 0, cachedInputTokens: 0, outputTokens: 0, reasoningTokens: 0, estimatedCostUsd: null }),
}));
// no ffmpeg needed: pretend the audio is the file itself
vi.mock("../media/audioExtractor", () => ({
  extractAudio: async () => null,
  getMediaDurationSeconds: async () => 12,
  removeTempFile: () => undefined,
}));

import { transcribeVideoFile } from "./transcriber";

const tempFile = path.join(os.tmpdir(), `transcriber-test-${process.pid}.mp3`);

describe("transcribeVideoFile", () => {
  beforeEach(() => {
    transcriptionsCreate.mockReset();
    translationsCreate.mockReset();
    fs.writeFileSync(tempFile, "audio");
  });

  it("detects the language itself (no language is forced) and keeps English speech as it is", async () => {
    transcriptionsCreate.mockResolvedValue({ language: "english", text: "I would start with a warm-up.", segments: [{ start: 0, end: 2, text: " I would start with a warm-up." }] });

    const result = await transcribeVideoFile(tempFile);

    expect(transcriptionsCreate.mock.calls[0][0]).not.toHaveProperty("language");
    expect(transcriptionsCreate.mock.calls[0][0].response_format).toBe("verbose_json");
    expect(translationsCreate).not.toHaveBeenCalled();
    expect(result).toMatchObject({ text: "I would start with a warm-up.", language: "english", durationSeconds: 12 });
    expect(result.segments).toEqual([{ start: 0, end: 2, text: "I would start with a warm-up." }]);
  });

  it("translates other languages to English, so scoring and captions are English", async () => {
    transcriptionsCreate.mockResolvedValue({ language: "spanish", text: "Empezaría con un calentamiento.", segments: [{ start: 0, end: 2, text: "Empezaría con un calentamiento." }] });
    translationsCreate.mockResolvedValue({ text: "I would start with a warm-up.", segments: [{ start: 0, end: 2, text: " I would start with a warm-up." }] });

    const result = await transcribeVideoFile(tempFile);

    expect(translationsCreate).toHaveBeenCalledTimes(1);
    expect(result.text).toBe("I would start with a warm-up.");
    expect(result.language).toBe("spanish");
    expect(result.segments[0].text).toBe("I would start with a warm-up.");
    expect(result.usage).toHaveLength(2);
  });

  it("never turns an error into an empty transcript", async () => {
    transcriptionsCreate.mockRejectedValue(new Error("429 billing"));
    await expect(transcribeVideoFile(tempFile)).rejects.toThrow("429 billing");
  });

  it("drops empty caption segments", async () => {
    transcriptionsCreate.mockResolvedValue({ language: "en", text: "Hello", segments: [{ start: 0, end: 1, text: "  " }, { start: 1, end: 2, text: "Hello" }] });
    const result = await transcribeVideoFile(tempFile);
    expect(result.segments).toHaveLength(1);
  });
});
