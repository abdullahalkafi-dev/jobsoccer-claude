import fs from "fs";
import os from "os";
import path from "path";
import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.mock is hoisted above everything else, so the mocks it uses must be created with vi.hoisted
const { transcriptionsCreate, translationsCreate, translateLines } = vi.hoisted(() => ({
  transcriptionsCreate: vi.fn(),
  translationsCreate: vi.fn(),
  translateLines: vi.fn(),
}));

// the real English check stays; only the chat-model translation is replaced
vi.mock("./englishTranslation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./englishTranslation")>()),
  translateLinesToEnglish: translateLines,
}));

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

import { aiConfig } from "../ai.config";
import { transcribeVideoFile } from "./transcriber";

const tempFile = path.join(os.tmpdir(), `transcriber-test-${process.pid}.mp3`);

// a realistic answer: long enough to count as speech (15 words or more)
const WARM_UP = "I would start with a short warm-up using the ball, then move into a small sided game so the players can practise the pressing triggers we talked about.";
const WARM_UP_ES = "Empezaría con un calentamiento corto con el balón, y luego pasaría a un juego reducido para que los jugadores practiquen las señales de presión que hablamos.";

describe("transcribeVideoFile", () => {
  beforeEach(() => {
    transcriptionsCreate.mockReset();
    translationsCreate.mockReset();
    translateLines.mockReset();
    fs.writeFileSync(tempFile, "audio");
  });

  it("detects the language itself (no language is forced) and keeps English speech as it is", async () => {
    transcriptionsCreate.mockResolvedValue({ language: "english", text: WARM_UP, segments: [{ start: 0, end: 2, text: ` ${WARM_UP}` }] });

    const result = await transcribeVideoFile(tempFile);

    expect(transcriptionsCreate.mock.calls[0][0]).not.toHaveProperty("language");
    expect(transcriptionsCreate.mock.calls[0][0].response_format).toBe("verbose_json");
    expect(translationsCreate).not.toHaveBeenCalled();
    expect(result).toMatchObject({ text: WARM_UP, language: "english", durationSeconds: 12 });
    expect(result.segments).toEqual([{ start: 0, end: 2, text: WARM_UP }]);
  });

  it("translates other languages to English, so scoring and captions are English", async () => {
    transcriptionsCreate.mockResolvedValue({ language: "spanish", text: WARM_UP_ES, segments: [{ start: 0, end: 2, text: WARM_UP_ES }] });
    translationsCreate.mockResolvedValue({ text: WARM_UP, segments: [{ start: 0, end: 2, text: ` ${WARM_UP}` }] });

    const result = await transcribeVideoFile(tempFile);

    expect(translationsCreate).toHaveBeenCalledTimes(1);
    expect(result.text).toBe(WARM_UP);
    expect(result.language).toBe("spanish");
    expect(result.segments[0].text).toBe(WARM_UP);
    expect(result.usage).toHaveLength(2);
  });

  it("translates the original lines itself when Whisper hands back the original language", async () => {
    transcriptionsCreate.mockResolvedValue({ language: "spanish", text: WARM_UP_ES, segments: [{ start: 0, end: 2, text: WARM_UP_ES }] });
    translationsCreate.mockResolvedValue({ text: WARM_UP_ES, segments: [{ start: 0, end: 2, text: WARM_UP_ES }] });
    translateLines.mockResolvedValue([{ start: 0, end: 2, text: WARM_UP }]);

    const result = await transcribeVideoFile(tempFile);

    expect(translateLines).toHaveBeenCalledTimes(1);
    expect(translateLines.mock.calls[0][0][0].text).toBe(WARM_UP_ES);
    expect(result.text).toBe(WARM_UP);
    expect(result.segments).toEqual([{ start: 0, end: 2, text: WARM_UP }]);
    expect(result.language).toBe("spanish");
  });

  it("does not trust english when the text is clearly another language: translates it and keeps the original", async () => {
    transcriptionsCreate.mockResolvedValue({ language: "english", text: WARM_UP_ES, segments: [{ start: 0, end: 2, text: WARM_UP_ES }] });
    translationsCreate.mockResolvedValue({ text: WARM_UP, segments: [{ start: 0, end: 2, text: WARM_UP }] });

    const result = await transcribeVideoFile(tempFile);

    expect(translationsCreate).toHaveBeenCalledTimes(1);
    expect(result.text).toBe(WARM_UP);
    expect(result.isTranslated).toBe(true);
    expect(result.language).toBe("unknown");
    expect(result.original?.text).toBe(WARM_UP_ES);
  });

  it("keeps true English as is (not translated, no original copy)", async () => {
    transcriptionsCreate.mockResolvedValue({ language: "english", text: WARM_UP, segments: [] });
    const result = await transcribeVideoFile(tempFile);
    expect(result.isTranslated).toBe(false);
    expect(result.original).toBeUndefined();
  });

  it("stores the original-language transcript next to the English one", async () => {
    transcriptionsCreate.mockResolvedValue({ language: "spanish", text: WARM_UP_ES, segments: [{ start: 0, end: 2, text: WARM_UP_ES }] });
    translationsCreate.mockResolvedValue({ text: WARM_UP, segments: [{ start: 0, end: 2, text: WARM_UP }] });
    const result = await transcribeVideoFile(tempFile);
    expect(result.isTranslated).toBe(true);
    expect(result.original).toEqual({ language: "spanish", text: WARM_UP_ES, segments: [{ start: 0, end: 2, text: WARM_UP_ES }] });
  });

  it("uses the translation model for /audio/translations and the transcription model for detection", async () => {
    transcriptionsCreate.mockResolvedValue({ language: "spanish", text: WARM_UP_ES, segments: [] });
    translationsCreate.mockResolvedValue({ text: WARM_UP, segments: [] });
    await transcribeVideoFile(tempFile);
    expect(transcriptionsCreate.mock.calls[0][0].model).toBe(aiConfig.models.transcribe);
    expect(translationsCreate.mock.calls[0][0].model).toBe(aiConfig.models.translate);
  });

  it("falls back to the text (never to an empty transcript) when there are no segments to translate", async () => {
    transcriptionsCreate.mockResolvedValue({ language: "spanish", text: WARM_UP_ES, segments: [] });
    translationsCreate.mockResolvedValue({ text: WARM_UP_ES, segments: [] }); // Whisper returned the original unchanged
    translateLines.mockImplementation(async (lines: any[]) => lines.map((line) => ({ ...line, text: WARM_UP })));

    const result = await transcribeVideoFile(tempFile);

    expect(translateLines.mock.calls[0][0]).toEqual([{ start: 0, end: 12, text: WARM_UP_ES }]);
    expect(result.text).toBe(WARM_UP);
    expect(result.segments).toEqual([]);
  });

  it("never turns an error into an empty transcript", async () => {
    transcriptionsCreate.mockRejectedValue(new Error("429 billing"));
    await expect(transcribeVideoFile(tempFile)).rejects.toThrow("429 billing");
  });

  it("drops empty caption segments", async () => {
    transcriptionsCreate.mockResolvedValue({ language: "en", text: WARM_UP, segments: [{ start: 0, end: 1, text: "  " }, { start: 1, end: 2, text: WARM_UP }] });
    const result = await transcribeVideoFile(tempFile);
    expect(result.segments).toHaveLength(1);
  });

  it.each(["You", "Thank you.", "Thanks for watching!", ""])('treats the made-up text "%s" (music, noise or silence) as no speech', async (invented) => {
    transcriptionsCreate.mockResolvedValue({ language: "english", text: invented, segments: invented ? [{ start: 0, end: 2, text: invented }] : [] });

    const result = await transcribeVideoFile(tempFile);

    expect(result.text).toBe("");
    expect(result.segments).toEqual([]);
  });
});
