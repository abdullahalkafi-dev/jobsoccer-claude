import OpenAI from "openai";
import config from "../../../config";
import { logger } from "../../logger/logger";
import { aiConfig } from "../ai.config";

/**
 * Single OpenAI client for the AI pipeline.
 * Timeouts and retries (429 / 5xx / connection errors, with backoff) are
 * handled by the SDK using the values from ai.config.
 */
export const aiClient = new OpenAI({
  apiKey: config.openai.api_key,
  timeout: aiConfig.client.timeoutMs,
  maxRetries: aiConfig.client.maxRetries,
});

export interface TokenUsage {
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
}

export interface UsageRecord extends TokenUsage {
  task: string;
  model: string;
  durationMs: number;
  estimatedCostUsd: number | null;
}

/** Normalise the usage object returned by Chat Completions. */
export const readChatUsage = (usage: any): TokenUsage => ({
  inputTokens: usage?.prompt_tokens ?? 0,
  cachedInputTokens: usage?.prompt_tokens_details?.cached_tokens ?? 0,
  outputTokens: usage?.completion_tokens ?? 0,
  reasoningTokens: usage?.completion_tokens_details?.reasoning_tokens ?? 0,
});

/** Estimated cost in USD, or null when the model has no price entry. */
export const estimateCostUsd = (model: string, usage: TokenUsage): number | null => {
  const price = aiConfig.pricing[model];
  if (!price) return null;
  const uncachedInput = Math.max(0, usage.inputTokens - usage.cachedInputTokens);
  const cost =
    (uncachedInput * price.input +
      usage.cachedInputTokens * price.cachedInput +
      usage.outputTokens * price.output) /
    1_000_000;
  return Math.round(cost * 1_000_000) / 1_000_000;
};

/** Build a usage record and write it to the log. */
export const recordUsage = (
  task: string,
  model: string,
  usage: TokenUsage,
  durationMs: number
): UsageRecord => {
  const record: UsageRecord = {
    task,
    model,
    durationMs,
    ...usage,
    estimatedCostUsd: estimateCostUsd(model, usage),
  };
  logger.info("AI usage", record);
  return record;
};
