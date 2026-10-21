import { model, Schema } from "mongoose";
import { TCandidateResume } from "./candidateResume.interface";

const candidateResumeSchema = new Schema<TCandidateResume>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
      ref: "User",
    },
    profileId: {
      type: String,
      required: true,
      index: true,
    },
    candidateRole: {
      type: String,
      required: true,
      index: true,
    },
    resumeFileName: {
      type: String,
      required: true,
    },
    resumeUrl: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
      index: true,
    },
    // Text read from the PDF for AI job matching (cached)
    extractedText: { type: String },
    textStatus: { type: String, enum: ["ok", "no_text_layer"] },
    textExtractedAt: { type: Date },
  },
  { timestamps: true, versionKey: false }
);

// Index for efficiently finding user's resumes
candidateResumeSchema.index({ userId: 1, createdAt: -1 });
// Index for finding active resume
candidateResumeSchema.index({ userId: 1, isActive: 1 });

export const CandidateResume = model<TCandidateResume>(
  "CandidateResume",
  candidateResumeSchema
);
