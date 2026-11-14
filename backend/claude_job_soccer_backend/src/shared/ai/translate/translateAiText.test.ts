import { beforeEach, describe, expect, it, vi } from "vitest";

const { chatCreate } = vi.hoisted(() => ({ chatCreate: vi.fn() }));

vi.mock("../client/openaiClient", () => ({
  aiClient: { chat: { completions: { create: chatCreate } } },
  readChatUsage: () => ({ inputTokens: 1, cachedInputTokens: 0, outputTokens: 1, reasoningTokens: 0 }),
  recordUsage: (task: string, model: string) => ({ task, model }),
}));

import { buildTranslationSystemPrompt, translateAiText, translateAiTextGroups } from "./translateAiText";

const reply = (texts: string[]) => ({ model: "m", usage: {}, choices: [{ message: { content: JSON.stringify({ texts }) } }] });

describe("translateAiText", () => {
  beforeEach(() => {
    chatCreate.mockReset();
  });

  it("returns English untouched without calling the model", async () => {
    expect(await translateAiText(["Strong pressing"], "en")).toEqual(["Strong pressing"]);
    expect(chatCreate).not.toHaveBeenCalled();
  });

  it("translates all texts in one call, with the football glossary in the prompt", async () => {
    chatCreate.mockResolvedValue(reply(["Presión fuerte", "Buen liderazgo"]));
    const result = await translateAiText(["Strong pressing", "Good leadership"], "es");
    expect(result).toEqual(["Presión fuerte", "Buen liderazgo"]);
    expect(chatCreate).toHaveBeenCalledTimes(1);
    const system = chatCreate.mock.calls[0][0].messages[0].content;
    expect(system).toContain("Striker = Delantero centro");
    expect(buildTranslationSystemPrompt("fr")).toContain("Head Coach = Entraîneur principal");
    expect(buildTranslationSystemPrompt("fr")).toContain("Striker = Avant-centre");
  });

  it("falls back to English when the model fails", async () => {
    chatCreate.mockRejectedValue(new Error("boom"));
    expect(await translateAiText(["Strong pressing"], "fr")).toEqual(["Strong pressing"]);
  });

  it("falls back to English when the count does not match", async () => {
    chatCreate.mockResolvedValue(reply(["only one"]));
    expect(await translateAiText(["a", "b"], "es")).toEqual(["a", "b"]);
  });

  it("translates named groups with a single call and keeps their shape", async () => {
    chatCreate.mockResolvedValue(reply(["Resumen", "Fuerte", "Débil"]));
    const result = await translateAiTextGroups({ summary: ["Summary"], strengths: ["Strong"], weak: ["Weak"] }, "es");
    expect(result).toEqual({ summary: ["Resumen"], strengths: ["Fuerte"], weak: ["Débil"] });
    expect(chatCreate).toHaveBeenCalledTimes(1);
  });
});
