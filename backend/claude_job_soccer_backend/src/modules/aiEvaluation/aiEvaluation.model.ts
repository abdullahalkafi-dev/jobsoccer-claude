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
        kind: { type: String },
        videoId: { type: String },
        sha256: { type: String },
        durationSeconds: { type: Number },
        transcriptChars: { type: Number },
      },
    ],
    transcript: { type: String },
    /** Language the candidate spoke (detected automatically); the transcript is always English. */
    detectedLanguage: { type: String },
    /** True when the transcript is an English translation of the spoken language (scored on the translation). */
    isTranslated: { type: Boolean },
    /** What the candidate said, in the spoken language (only when translated). Shown to admins next to the English text. */
    originalTranscript: { type: String },
    /**
     * Cached translations of the AI texts (summary, strengths, weaknesses) for the viewer languages,
     * generated on first read. The English text on the report stays the canonical one.
     */
    translations: { type: Schema.Types.Mixed },
    /** Recording-setup check (frames + transcript). Only flags for an admin, never changes the score. */
    setupCheck: { type: Schema.Types.Mixed },
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
    /** English text (translated when the speech was in another language). */
    text: { type: String, required: true },
    detectedLanguage: { type: String },
    /** True when `text` is a translation. Missing on rows cached before this field existed. */
    isTranslated: { type: Boolean },
    /** What was said in the spoken language (only for translated speech). */
    originalText: { type: String },
    originalSegments: { type: Schema.Types.Mixed },
    /** English caption cues, for the WebVTT subtitles. */
    segments: { type: Schema.Types.Mixed, default: [] },
    durationSeconds: { type: Number },
  },
  { timestamps: true, versionKey: false }
);

aiTranscriptSchema.index({ sha256: 1, model: 1, language: 1 }, { unique: true });

export const AiTranscript = model<TAiTranscript>("AiTranscript", aiTranscriptSchema);
