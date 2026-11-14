/**
 * AI configuration
 *
 * Every model name, limit and feature switch used by the AI pipeline lives here
 * and comes from the environment, so changing a model never needs a code change.
 *
 * Tiers:
 * - eval: important work (rubric scoring, summaries, review flags)  -> gpt-6.1-sol
 * - fast: cheap helper work (clean-up, pre-checks)                 -> gpt-6-luna
 * - transcribe: speech to text with language detection -> whisper-1
 * - translate: speech to English text (other languages) -> whisper-1
 * - vision: recording-setup check on interview frames          -> same as eval by default
 */

import "../../config"; // loads .env before process.env is read

export type ReasoningEffort = "low" | "medium" | "high";

export type AiTask = "eval" | "fast" | "vision";

export interface ModelCapabilities {
  /** Reasoning models reject `temperature`; only send it when supported. */
  supportsTemperature: boolean;
  /** Whether `reasoning_effort` may be sent. */
  supportsReasoningEffort: boolean;
}

const toInt = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const toBool = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
};

const toEffort = (value: string | undefined): ReasoningEffort => {
  return value === "low" || value === "high" ? value : "medium";
};

export const aiConfig = {
  /** Master switch for the new rubric-based evaluation. Off = legacy scoring only. */
  evalEnabled: toBool(process.env.AI_EVAL_ENABLED, false),

  models: {
    eval: process.env.OPENAI_EVAL_MODEL || "gpt-6.1-sol",
    fast: process.env.OPENAI_FAST_MODEL || "gpt-6-luna",
    /** Speech to text with language detection (/audio/transcriptions). */
    transcribe: process.env.OPENAI_TRANSCRIBE_MODEL || "whisper-1",
    /** Speech to English text (/audio/translations). Only whisper-1 supports this endpoint, so it has its own setting. */
    translate: process.env.OPENAI_TRANSLATE_MODEL || "whisper-1",
    vision: process.env.OPENAI_VISION_MODEL || process.env.OPENAI_EVAL_MODEL || "gpt-6.1-sol",
  },

  reasoningEffort: toEffort(process.env.OPENAI_EVAL_REASONING_EFFORT),
  promptVersion: process.env.AI_PROMPT_VERSION || "v1",

  client: {
    timeoutMs: toInt(process.env.OPENAI_TIMEOUT_MS, 120_000),
    maxRetries: toInt(process.env.OPENAI_MAX_RETRIES, 3),
  },

  media: {
    ffmpegTimeoutMs: toInt(process.env.AI_FFMPEG_TIMEOUT_MS, 120_000),
    /** Whisper upload limit (25 MB). */
    maxTranscribeBytes: 25 * 1024 * 1024,
  },

  /**
   * Jobs run at the same time per queue. Interview scoring is the heaviest
   * (Whisper + the eval model), so it has its own, lower limit.
   */
  concurrency: {
    interview: toInt(process.env.AI_CONCURRENCY_INTERVIEW, 2),
    captions: toInt(process.env.AI_CONCURRENCY_CAPTIONS, 3),
    jobMatch: toInt(process.env.AI_CONCURRENCY_JOB_MATCH, 3),
    profileQuality: toInt(process.env.AI_CONCURRENCY_PROFILE_QUALITY, 4),
  },

  /** USD per 1M tokens, used only for cost logging. */
  pricing: {
    "gpt-6.1-sol": { input: 2.0, cachedInput: 0.1, output: 10.0 },
    "gpt-6-luna": { input: 0.1, cachedInput: 0.01, output: 0.5 },
    "gpt-4o-mini": { input: 0.15, cachedInput: 0.075, output: 0.6 },
  } as Record<string, { input: number; cachedInput: number; output: number }>,
} as const;

/** Map a task to the configured model. */
export const modelFor = (task: AiTask): string => aiConfig.models[task];

/**
 * What each model accepts. Unknown models are treated as reasoning models
 * (no temperature), which is the safe default for new model families.
 */
export const capabilitiesFor = (model: string): ModelCapabilities => {
  if (/^gpt-4o|^gpt-4\.1/.test(model)) {
    return { supportsTemperature: true, supportsReasoningEffort: false };
  }
  return { supportsTemperature: false, supportsReasoningEffort: true };
};
