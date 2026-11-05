import { Schema } from "mongoose";
import { TProfileVideo, VideoKind } from "./video.constant";

/**
 * One stored video. Shared by all six candidate profile models, so the video
 * shape is defined once instead of being copied into every model.
 */
export const profileVideoSchema = new Schema<TProfileVideo>({
  kind: { type: String, enum: Object.values(VideoKind), required: true },
  url: { type: String, required: true, trim: true },
  durationSeconds: { type: Number, required: true, min: 0 },
  width: { type: Number },
  height: { type: Number },
  sizeBytes: { type: Number },
  title: { type: String, trim: true },
  captionsUrl: { type: String, trim: true },
  uploadedAt: { type: Date, default: Date.now },
  lockedUntil: { type: Date, default: null },
});
