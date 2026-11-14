import { describe, expect, it } from "vitest";
import { listRubrics } from "../rubric/rubric.registry";
import { buildEvaluationPrompt, SYSTEM_PROMPT, translatedTranscriptRule } from "./promptBuilder";

const rubric = listRubrics()[0];

describe("scorer prompt for translated interviews", () => {
  it("adds nothing for English interviews", () => {
    expect(buildEvaluationPrompt(rubric, "hello").system).toBe(SYSTEM_PROMPT);
    expect(buildEvaluationPrompt(rubric, "hello", { spokenLanguage: "english", isTranslated: false }).system).toBe(SYSTEM_PROMPT);
  });

  it("tells the scorer the transcript is an English machine translation of the spoken language", () => {
    const system = buildEvaluationPrompt(rubric, "hello", { spokenLanguage: "spanish", isTranslated: true }).system;
    expect(system).toContain(SYSTEM_PROMPT);
    expect(system).toMatch(/English machine translation of a Spanish interview/);
    expect(system).toMatch(/Do not penalise unusual phrasing, translated idioms or football terms/);
    expect(system).toMatch(/quote evidence from the translation/);
  });

  it("handles ISO codes and an unknown language", () => {
    expect(translatedTranscriptRule({ spokenLanguage: "fr", isTranslated: true })).toMatch(/French interview/);
    expect(translatedTranscriptRule({ spokenLanguage: "unknown", isTranslated: true })).toMatch(/non-English interview/);
  });
});
