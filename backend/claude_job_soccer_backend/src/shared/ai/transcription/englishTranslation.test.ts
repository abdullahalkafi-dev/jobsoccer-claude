import { beforeEach, describe, expect, it, vi } from "vitest";

const { chatCreate } = vi.hoisted(() => ({ chatCreate: vi.fn() }));

vi.mock("../client/openaiClient", () => ({
  aiClient: { chat: { completions: { create: chatCreate } } },
  readChatUsage: () => ({ inputTokens: 1, cachedInputTokens: 0, outputTokens: 1, reasoningTokens: 0 }),
  recordUsage: (task: string, model: string) => ({ task, model, durationMs: 1, inputTokens: 1, cachedInputTokens: 0, outputTokens: 1, reasoningTokens: 0, estimatedCostUsd: null }),
}));

import { looksEnglish, translateLinesToEnglish } from "./englishTranslation";

const reply = (lines: string[]) => ({ model: "m", usage: {}, choices: [{ message: { content: JSON.stringify({ lines }) } }] });

describe("looksEnglish", () => {
  it("accepts English coaching text", () => {
    expect(looksEnglish("I would start with a warm-up and then work on the pressing triggers with the team.")).toBe(true);
  });

  it("rejects Spanish and other languages", () => {
    expect(looksEnglish("Hola, me llamo Carlos y soy entrenador principal de un equipo juvenil en Madrid.")).toBe(false);
    expect(looksEnglish("Ich trainiere seit zehn Jahren eine Jugendmannschaft und lege Wert auf Technik.")).toBe(false);
  });

  it("does not judge very short text", () => {
    expect(looksEnglish("Hola")).toBe(true);
  });
});

describe("translateLinesToEnglish", () => {
  beforeEach(() => chatCreate.mockReset());

  it("keeps the timings and replaces the text", async () => {
    chatCreate.mockResolvedValue(reply(["Hello, I am Carlos.", "I develop players."]));
    const usage: any[] = [];
    const result = await translateLinesToEnglish(
      [
        { start: 0, end: 2, text: "Hola, soy Carlos." },
        { start: 2, end: 5, text: "Desarrollo jugadores." },
      ],
      usage
    );
    expect(result).toEqual([
      { start: 0, end: 2, text: "Hello, I am Carlos." },
      { start: 2, end: 5, text: "I develop players." },
    ]);
    expect(usage).toHaveLength(1);
  });

  it("retries once when the line count is wrong, then gives up", async () => {
    chatCreate.mockResolvedValue(reply(["only one line"]));
    await expect(
      translateLinesToEnglish(
        [
          { start: 0, end: 1, text: "uno" },
          { start: 1, end: 2, text: "dos" },
        ],
        []
      )
    ).rejects.toThrow(/different number of lines/);
    expect(chatCreate).toHaveBeenCalledTimes(2);
  });
});
