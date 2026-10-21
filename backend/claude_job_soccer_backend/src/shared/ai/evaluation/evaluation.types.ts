import { z } from "zod";

export const CONFIDENCE = ["high", "medium", "low"] as const;
export type Confidence = (typeof CONFIDENCE)[number];

/**
 * What the model returns (validated with zod). The model proposes; code
 * decides the final scores (see guardrails.ts).
 */
export const modelQuestionSchema = z.object({
  questionId: z.number().int(),
  answerFound: z.boolean(),
  score: z.number().int().min(0).max(4).nullable(),
  confidence: z.enum(CONFIDENCE),
  evidence: z.array(z.string()),
  missingEvidence: z.array(z.string()),
  situation: z.boolean(),
  action: z.boolean(),
  outcome: z.boolean(),
  redFlags: z.array(z.string()),
  rationale: z.string(),
});

export const modelOutputSchema = z.object({
  questions: z.array(modelQuestionSchema),
  strongestAreas: z.array(z.string()),
  mainWeaknesses: z.array(z.string()),
  summary: z.string(),
  overallConfidence: z.enum(CONFIDENCE),
  audioOrTranscriptProblem: z.boolean(),
  instructionAttempt: z.boolean(),
});

export type ModelQuestion = z.infer<typeof modelQuestionSchema>;
export type ModelOutput = z.infer<typeof modelOutputSchema>;

/** JSON schema sent to OpenAI (strict structured output). Mirrors modelOutputSchema. */
export const modelOutputJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "questions",
    "strongestAreas",
    "mainWeaknesses",
    "summary",
    "overallConfidence",
    "audioOrTranscriptProblem",
    "instructionAttempt",
  ],
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "questionId",
          "answerFound",
          "score",
          "confidence",
          "evidence",
          "missingEvidence",
          "situation",
          "action",
          "outcome",
          "redFlags",
          "rationale",
        ],
        properties: {
          questionId: { type: "integer" },
          answerFound: { type: "boolean" },
          score: { type: ["integer", "null"], minimum: 0, maximum: 4 },
          confidence: { type: "string", enum: [...CONFIDENCE] },
          evidence: { type: "array", items: { type: "string" } },
          missingEvidence: { type: "array", items: { type: "string" } },
          situation: { type: "boolean" },
          action: { type: "boolean" },
          outcome: { type: "boolean" },
          redFlags: { type: "array", items: { type: "string" } },
          rationale: { type: "string" },
        },
      },
    },
    strongestAreas: { type: "array", items: { type: "string" } },
    mainWeaknesses: { type: "array", items: { type: "string" } },
    summary: { type: "string" },
    overallConfidence: { type: "string", enum: [...CONFIDENCE] },
    audioOrTranscriptProblem: { type: "boolean" },
    instructionAttempt: { type: "boolean" },
  },
} as const;

export type QuestionStatus = "scored" | "not_answered";

/** Final, code-checked result for one question. */
export interface QuestionResult {
  questionId: number;
  sectionId: string;
  status: QuestionStatus;
  /** null when not answered: never silently 0. */
  score: number | null;
  /** What the model proposed before the rules were applied. */
  modelScore: number | null;
  confidence: Confidence;
  evidence: string[];
  missingEvidence: string[];
  redFlags: string[];
  rationale: string;
  /** Rules that changed the model's proposal, e.g. "real-situation cap". */
  adjustments: string[];
}

export interface EvaluationTotals {
  earned: number;
  /** Points available on answered questions. */
  available: number;
  max: number;
  answeredCount: number;
  notAnsweredCount: number;
  /** earned / max x 100, one decimal (client example: 46/72 = 63.9%). */
  percentage: number;
  /** Band label; only when every question was answered (client rule). */
  band: string | null;
  bySection: Record<string, { earned: number; max: number }>;
}

export interface EvaluationReport {
  rubricId: string;
  rubricVersion: number;
  position: string;
  displayName: string;
  questions: QuestionResult[];
  totals: EvaluationTotals;
  strongestAreas: string[];
  mainWeaknesses: string[];
  summary: string;
  overallConfidence: Confidence;
  needsHumanReview: boolean;
  reviewReasons: string[];
  /** Old 0-100 number kept in sync for cards and filters. */
  legacyScore100: number;
  disclaimer: string;
}
