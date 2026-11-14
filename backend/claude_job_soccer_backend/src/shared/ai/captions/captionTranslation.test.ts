import fs from "fs";
import os from "os";
import path from "path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { chatCreate, existing } = vi.hoisted(() => ({ chatCreate: vi.fn(), existing: new Set<string>() }));

vi.mock("../client/openaiClient", () => ({
  aiClient: { chat: { completions: { create: chatCreate } } },
  readChatUsage: () => ({ inputTokens: 1, cachedInputTokens: 0, outputTokens: 1, reasoningTokens: 0 }),
  recordUsage: (task: string, model: string) => ({ task, model }),
}));
vi.mock("../../storage", () => ({
  localStorage: { exists: async (key: string) => existing.has(key) },
  storage: { exists: async () => false },
  persistUploadedFiles: async () => undefined,
  toStorageKey: (value: string) => value,
}));

import { saveTranslatedCaptions, toWebVtt } from "./captions";
import { buildCaptionTracks, captionPath } from "./captionTracks";
import { cuesForLanguage, parseWebVtt, translateCues } from "./captionTranslation";

const cues = [
  { start: 0, end: 2, text: "I am a Head Coach." },
  { start: 2, end: 4, text: "I like pressing." },
  { start: 4, end: 6, text: "Build-up play matters." },
];
const reply = (lines: string[]) => ({ model: "m", usage: {}, choices: [{ message: { content: JSON.stringify({ lines }) } }] });

describe("translateCues", () => {
  beforeEach(() => {
    chatCreate.mockReset();
  });

  it("translates all cues in ONE call, keeps timestamps, and sends the glossary", async () => {
    chatCreate.mockResolvedValue(reply(["Soy entrenador principal.", "Me gusta presionar.", "La salida de balón importa."]));
    const result = await translateCues(cues, "es");
    expect(chatCreate).toHaveBeenCalledTimes(1);
    expect(result.map((c) => c.text)).toEqual(["Soy entrenador principal.", "Me gusta presionar.", "La salida de balón importa."]);
    expect(result.map((c) => [c.start, c.end])).toEqual(cues.map((c) => [c.start, c.end]));
    expect(chatCreate.mock.calls[0][0].messages[0].content).toContain("Head Coach = Entrenador principal");
  });

  it("retries once when the line count is wrong", async () => {
    chatCreate.mockResolvedValueOnce(reply(["a", "b"])).mockResolvedValueOnce(reply(["x", "y", "z"]));
    const result = await translateCues(cues, "fr");
    expect(chatCreate).toHaveBeenCalledTimes(2);
    expect(result.map((c) => c.text)).toEqual(["x", "y", "z"]);
  });

  it("splits in halves after two bad answers and keeps English for lines that never translate", async () => {
    chatCreate.mockImplementation(async (args: any) => {
      const lines = JSON.parse(args.messages[1].content).lines as string[];
      if (lines.length === 3) return reply(["only one"]); // always wrong for the full block
      if (lines.length === 2) return reply(lines.map((l) => `fr:${l}`)); // the first half works
      return reply([]); // the single remaining line never works
    });
    const result = await translateCues(cues, "fr");
    expect(result.map((c) => c.text)).toEqual(["fr:I am a Head Coach.", "fr:I like pressing.", "Build-up play matters."]);
  });

  it("never throws when the model request fails: the English cues are kept", async () => {
    chatCreate.mockRejectedValue(new Error("boom"));
    const result = await translateCues(cues, "es");
    expect(result).toEqual(cues);
  });
});

describe("cuesForLanguage", () => {
  beforeEach(() => {
    chatCreate.mockReset();
  });

  it("uses the original-language cues when the candidate spoke that language (no model call)", async () => {
    const original = [{ start: 0, end: 2, text: "Soy entrenador." }];
    const result = await cuesForLanguage("es", { englishCues: cues, detectedLanguage: "spanish", originalSegments: original });
    expect(result).toBe(original);
    expect(chatCreate).not.toHaveBeenCalled();
  });

  it("translates the other language from the English cues", async () => {
    chatCreate.mockResolvedValue(reply(["un", "deux", "trois"]));
    const result = await cuesForLanguage("fr", { englishCues: cues, detectedLanguage: "es", originalSegments: [{ start: 0, end: 1, text: "hola" }] });
    expect(result.map((c) => c.text)).toEqual(["un", "deux", "trois"]);
    expect(chatCreate).toHaveBeenCalledTimes(1);
  });

  it("returns nothing when there are no cues", async () => {
    expect(await cuesForLanguage("fr", { englishCues: [] })).toEqual([]);
  });
});

describe("WebVTT round trip and track list", () => {
  it("parseWebVtt reads what toWebVtt wrote", () => {
    expect(parseWebVtt(toWebVtt(cues))).toEqual(cues);
  });

  it("buildCaptionTracks: old videos give English only, new videos all tracks in order", () => {
    expect(buildCaptionTracks({})).toEqual([]);
    expect(buildCaptionTracks({ captionsUrl: "captions/a.vtt" })).toEqual([{ lang: "en", label: "English", url: "captions/a.vtt" }]);
    const tracks = buildCaptionTracks({ captionsUrl: "captions/a.vtt", captions: { fr: "captions/a.fr.vtt", es: "captions/a.es.vtt" } });
    expect(tracks.map((t) => [t.lang, t.label])).toEqual([["en", "English"], ["es", "Español"], ["fr", "Français"]]);
    expect(captionPath("abc", "en")).toBe("captions/abc.vtt");
    expect(captionPath("abc", "es")).toBe("captions/abc.es.vtt");
  });
});

describe("saveTranslatedCaptions", () => {
  beforeEach(() => {
    chatCreate.mockReset();
    existing.clear();
  });

  it("writes es from the original segments and fr from a translation, and never regenerates an existing file", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "caps-"));
    vi.spyOn(process, "cwd").mockReturnValue(dir);
    chatCreate.mockResolvedValue(reply(["un", "deux", "trois"]));
    const original = [{ start: 0, end: 2, text: "Soy entrenador." }];
    const first = await saveTranslatedCaptions("sha1", { englishCues: cues, detectedLanguage: "es", originalSegments: original });
    expect(first).toEqual({ es: "captions/sha1.es.vtt", fr: "captions/sha1.fr.vtt" });
    expect(fs.readFileSync(path.join(dir, "uploads", "captions", "sha1.es.vtt"), "utf8")).toContain("Soy entrenador.");
    expect(fs.readFileSync(path.join(dir, "uploads", "captions", "sha1.fr.vtt"), "utf8")).toContain("deux");

    existing.add("captions/sha1.es.vtt");
    existing.add("captions/sha1.fr.vtt");
    chatCreate.mockClear();
    const second = await saveTranslatedCaptions("sha1", { englishCues: cues, detectedLanguage: "en" });
    expect(second).toEqual({ es: "captions/sha1.es.vtt", fr: "captions/sha1.fr.vtt" });
    expect(chatCreate).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });
});
