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
  beforeEach(() => {
    chatCreate.mockReset(); // braces: a returned mock would be called by vitest as a cleanup hook
  });

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

  it("never fails the assessment because the line count is wrong: it splits the block and translates the parts", async () => {
    // the whole block (2 lines) always comes back as one line; single lines are fine
    chatCreate.mockImplementation(async (args: any) => {
      const lines: string[] = JSON.parse(args.messages[1].content).lines;
      return reply(lines.length === 1 ? ["EN(" + lines[0] + ")"] : ["only one line"]);
    });
    const result = await translateLinesToEnglish(
      [
        { start: 0, end: 1, text: "uno" },
        { start: 1, end: 2, text: "dos" },
      ],
      []
    );
    expect(result).toEqual([
      { start: 0, end: 1, text: "EN(uno)" },
      { start: 1, end: 2, text: "EN(dos)" },
    ]);
  });

  it("keeps the original line when a single line cannot be translated at all", async () => {
    chatCreate.mockResolvedValue(reply([]));
    const result = await translateLinesToEnglish([{ start: 0, end: 1, text: "uno" }], []);
    expect(result).toEqual([{ start: 0, end: 1, text: "uno" }]);
  });

  it("joins a single line that comes back split into several", async () => {
    chatCreate.mockResolvedValue(reply(["Hello", "there"]));
    const result = await translateLinesToEnglish([{ start: 0, end: 1, text: "hola" }], []);
    expect(result[0].text).toBe("Hello there");
  });
});
