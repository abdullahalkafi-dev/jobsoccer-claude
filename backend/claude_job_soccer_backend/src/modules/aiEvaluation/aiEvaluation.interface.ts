import { Types } from "mongoose";
import { EvaluationReport } from "../../shared/ai/evaluation/evaluation.types";
import { UsageRecord } from "../../shared/ai/client/openaiClient";

export const AI_EVALUATION_STATUS = ["queued", "transcribing", "evaluating", "completed", "failed"] as const;
export type TAiEvaluationStatus = (typeof AI_EVALUATION_STATUS)[number];

export type TAiEvaluationVideo = {
  url: string;
  videoType?: string;
  sha256?: string;
  durationSeconds?: number | null;
  transcriptChars?: number;
};

/** A reviewer's change to an AI result. The AI output itself is never overwritten. */
export type TAiEvaluationCorrection = {
  reviewerId: Types.ObjectId;
  questionId?: number;
  previousScore?: number | null;
  newScore?: number | null;
  reviewStatus?: "reviewed" | "needs_follow_up";
  reason: string;
  createdAt: Date;
};

export type TAiEvaluation = {
  _id?: Types.ObjectId;
  candidateUserId: Types.ObjectId;
  profileId: Types.ObjectId;
  role: string;
  position: string;
  level?: string;
  rubricId: string;
  rubricVersion: number;
  status: TAiEvaluationStatus;
  trigger: string;
  attempts: number;
  error?: string;
  /** Same videos + rubric + prompt + model = same result; avoids paying twice. */
  idempotencyKey?: string;
  isLatest: boolean;
  videos: TAiEvaluationVideo[];
  transcript?: string;
  report?: EvaluationReport;
  rawModelOutput?: string;
  /** Model that produced the report. */
  aiModel?: string;
  promptVersion?: string;
  usage: UsageRecord[];
  costUsd?: number;
  queuedAt: Date;
  startedAt?: Date;
  finishedAt?: Date;
  corrections: TAiEvaluationCorrection[];
  createdAt?: Date;
  updatedAt?: Date;
};

/** Cached speech-to-text per video file (by content hash). */
export type TAiTranscript = {
  sha256: string;
  model: string;
  language: string;
  text: string;
  durationSeconds?: number | null;
  createdAt?: Date;
};
