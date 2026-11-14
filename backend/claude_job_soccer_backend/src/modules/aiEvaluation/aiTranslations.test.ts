import { beforeEach, describe, expect, it, vi } from "vitest";

const { translateGroups, updateOne } = vi.hoisted(() => ({ translateGroups: vi.fn(), updateOne: vi.fn() }));

vi.mock("../../shared/ai/translate/translateAiText", () => ({ translateAiTextGroups: translateGroups }));
vi.mock("./aiEvaluation.model", () => ({ AiEvaluation: { updateOne: (...args: any[]) => ({ catch: () => updateOne(...args) }) } }));

import { NO_SPEECH_SUMMARY } from "../../shared/ai/evaluation/guardrails";
import { aiText, interviewLanguageNote, localizeFixedText } from "../../shared/ai/i18n/aiTexts";
import { getLocalizedTexts } from "./aiTranslations";

const texts = { summary: "Clear answers.", strongestAreas: ["Pressing"], mainWeaknesses: ["Set pieces"] };
const id: any = "abc";

describe("getLocalizedTexts", () => {
  beforeEach(() => {
    translateGroups.mockReset();
    updateOne.mockReset();
  });

  it("returns English without translating", async () => {
    expect(await getLocalizedTexts({ _id: id }, texts, "en")).toEqual(texts);
    expect(translateGroups).not.toHaveBeenCalled();
  });

  it("translates once, stores the result on the evaluation and reads it from there afterwards", async () => {
    translateGroups.mockResolvedValue({ summary: ["Respuestas claras."], strongestAreas: ["Presión"], mainWeaknesses: ["Jugadas a balón parado"] });
    const first = await getLocalizedTexts({ _id: id }, texts, "es");
    expect(first.summary).toBe("Respuestas claras.");
    expect(updateOne).toHaveBeenCalledTimes(1);
    const stored = updateOne.mock.calls[0][1].$set["translations.es"];

    const second = await getLocalizedTexts({ _id: id, translations: { es: stored } }, texts, "es");
    expect(second).toEqual({ summary: "Respuestas claras.", strongestAreas: ["Presión"], mainWeaknesses: ["Jugadas a balón parado"] });
    expect(translateGroups).toHaveBeenCalledTimes(1);
  });

  it("does not use a cache that belongs to different English texts", async () => {
    translateGroups.mockResolvedValue({ summary: ["Nuevo"], strongestAreas: ["A"], mainWeaknesses: ["B"] });
    const stale = { hash: "old", summary: "x", strongestAreas: [], mainWeaknesses: [], createdAt: new Date() };
    const result = await getLocalizedTexts({ _id: id, translations: { es: stale } }, texts, "es");
    expect(result.summary).toBe("Nuevo");
  });

  it("falls back to English and caches nothing when translation fails", async () => {
    translateGroups.mockImplementation(async (groups: any) => groups); // translateAiText returns its input on failure
    const result = await getLocalizedTexts({ _id: id }, texts, "fr");
    expect(result).toEqual(texts);
    expect(updateOne).not.toHaveBeenCalled();
  });

  it("never sends the fixed no-speech summary to the model", async () => {
    translateGroups.mockImplementation(async (groups: any) => groups);
    await getLocalizedTexts({ _id: id }, { ...texts, summary: NO_SPEECH_SUMMARY }, "es");
    expect(translateGroups.mock.calls[0][0].summary).toEqual([]);
  });
});

describe("fixed AI texts", () => {
  it("are available in en, es and fr without an LLM", () => {
    for (const lang of ["en", "es", "fr"] as const) {
      expect(aiText("disclaimer", lang).length).toBeGreaterThan(20);
      expect(aiText("noAnswer", lang).length).toBeGreaterThan(10);
    }
    expect(aiText("disclaimer", "es")).not.toBe(aiText("disclaimer", "en"));
    expect(localizeFixedText(NO_SPEECH_SUMMARY, "fr")).toBe(aiText("noSpeechSummary", "fr"));
    expect(localizeFixedText("something the AI wrote", "fr")).toBe("something the AI wrote");
  });

  it("describes the spoken language of translated interviews", () => {
    expect(interviewLanguageNote("spanish", true, "en")).toBe("Interview given in Spanish (scored on an English translation)");
    expect(interviewLanguageNote("spanish", true, "es")).toContain("español");
    expect(interviewLanguageNote("english", false, "en")).toBeNull();
    expect(interviewLanguageNote("unknown", true, "en")).toBeNull();
  });
});
