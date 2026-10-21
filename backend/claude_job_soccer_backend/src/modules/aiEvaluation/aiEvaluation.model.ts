import { model, Schema } from "mongoose";
import { AI_EVALUATION_STATUS, TAiEvaluation, TAiTranscript } from "./aiEvaluation.interface";

const aiEvaluationSchema = new Schema<TAiEvaluation>(
  {
    candidateUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    profileId: { type: Schema.Types.ObjectId, required: true },
    role: { type: String, required: true },
    position: { type: String, required: true },
    level: { type: String },
    rubricId: { type: String, required: true },
    rubricVersion: { type: Number, required: true },
    status: { type: String, enum: AI_EVALUATION_STATUS, default: "queued", required: true, index: true },
    trigger: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    error: { type: String },
    idempotencyKey: { type: String, index: true },
    isLatest: { type: Boolean, default: true },
    videos: [
      {
        _id: false,
        url: { type: String, required: true },
        videoType: { type: String },
        sha256: { type: String },
        durationSeconds: { type: Number },
        transcriptChars: { type: Number },
      },
    ],
    transcript: { type: String },
    report: { type: Schema.Types.Mixed },
    rawModelOutput: { type: String },
    aiModel: { type: String },
    promptVersion: { type: String },
    usage: { type: Schema.Types.Mixed, default: [] },
    costUsd: { type: Number },
    queuedAt: { type: Date, default: Date.now },
    startedAt: { type: Date },
    finishedAt: { type: Date },
    corrections: [
      {
        _id: false,
        reviewerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        questionId: { type: Number },
        previousScore: { type: Number },
        newScore: { type: Number },
        reviewStatus: { type: String, enum: ["reviewed", "needs_follow_up"] },
        reason: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

// Latest evaluation of a candidate
aiEvaluationSchema.index({ candidateUserId: 1, isLatest: 1, createdAt: -1 });
// Review queue for admins
aiEvaluationSchema.index({ "report.needsHumanReview": 1, status: 1, createdAt: -1 });

export const AiEvaluation = model<TAiEvaluation>("AiEvaluation", aiEvaluationSchema);

const aiTranscriptSchema = new Schema<TAiTranscript>(
  {
    sha256: { type: String, required: true },
    model: { type: String, required: true },
    language: { type: String, required: true },
    text: { type: String, required: true },
    durationSeconds: { type: Number },
  },
  { timestamps: true, versionKey: false }
);

aiTranscriptSchema.index({ sha256: 1, model: 1, language: 1 }, { unique: true });

export const AiTranscript = model<TAiTranscript>("AiTranscript", aiTranscriptSchema);
