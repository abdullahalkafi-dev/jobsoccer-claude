import { describe, expect, it } from "vitest";
import { capabilitiesFor, modelFor } from "./ai.config";
import { estimateCostUsd, readChatUsage } from "./client/openaiClient";

describe("ai.config", () => {
  it("routes tasks to the configured models", () => {
    expect(modelFor("eval")).toBe(process.env.OPENAI_EVAL_MODEL || "gpt-6.1-sol");
    expect(modelFor("fast")).toBe(process.env.OPENAI_FAST_MODEL || "gpt-6-luna");
  });

  it("does not send temperature to reasoning models", () => {
    expect(capabilitiesFor("gpt-6.1-sol").supportsTemperature).toBe(false);
    expect(capabilitiesFor("gpt-4o-mini").supportsTemperature).toBe(true);
  });
});

describe("cost estimate", () => {
  it("prices cached and uncached input separately", () => {
    const usage = { inputTokens: 10_000, cachedInputTokens: 4_000, outputTokens: 2_000, reasoningTokens: 500 };
    // 6000 * 2 + 4000 * 0.1 + 2000 * 10 = 32400 per 1M -> 0.0324 USD
    expect(estimateCostUsd("gpt-6.1-sol", usage)).toBeCloseTo(0.0324, 6);
  });

  it("returns null for unknown models", () => {
    expect(estimateCostUsd("unknown-model", readChatUsage({}))).toBeNull();
  });
});
