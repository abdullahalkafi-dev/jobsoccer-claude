/**
 * Video kinds and the technical limits from the client's "Video Requirements"
 * documents. Every limit lives here so the API, the validator and the
 * requirements endpoint (which the frontend renders) can never disagree.
 */

/** What a video is for. Stored on every video; replaces the old 10 "type" names. */
export enum VideoKind {
  INTERVIEW = "Interview",
  METHODOLOGY = "Methodology",
  HIGHLIGHTS = "Highlights",
}

export const VIDEO_LIMITS = {
  /** Interview and methodology videos: up to 6:30 each. */
  staffMaxSeconds: 6 * 60 + 30,
  /** Player highlight videos: up to 3:00 each. */
  playerMaxSeconds: 3 * 60,
  /** Accepted by the upload middleware and re-checked from the real file. */
  maxBytes: 600 * 1024 * 1024,
  /** "Minimum quality 720p": checked on the short side so portrait phones pass. */
  minShortSide: 720,
  allowedMimeTypes: ["video/mp4", "video/quicktime"],
  allowedExtensions: [".mp4", ".mov"],
  /** Interview and methodology videos are locked after submission. */
  lockMonths: 3,
  /** Player highlights per profile. */
  playerHighlightCount: 2,
} as const;

/**
 * How long one upload request may take (whole body + checks). 45 minutes lets a 600 MB
 * video through at about 1.8 Mbit/s. Nginx's timeouts for /api/v1/videos must be at least this.
 */
export const UPLOAD_REQUEST_TIMEOUT_MS = 45 * 60 * 1000;

/** Version of the consent texts shown before upload; stored with the consent. */
export const VIDEO_CONSENT_VERSION = "2026-11";

/** Kinds that are locked for {@link VIDEO_LIMITS.lockMonths} months after each submission. */
export const LOCKED_KINDS: readonly VideoKind[] = [VideoKind.INTERVIEW, VideoKind.METHODOLOGY];

/** Shape of one stored video (shared by all candidate profile models). */
export type TProfileVideo = {
  _id?: string;
  kind: VideoKind;
  url: string;
  durationSeconds: number;
  width?: number;
  height?: number;
  sizeBytes?: number;
  title?: string;
  /** Public path of the English captions (WebVTT), set after transcription. */
  captionsUrl?: string;
  /** Public paths of the caption tracks per language (WebVTT); en mirrors captionsUrl. */
  captions?: Partial<Record<"en" | "es" | "fr", string>>;
  uploadedAt?: Date;
  /** Replacing the video is blocked until this date (admin can unlock early). */
  lockedUntil?: Date | null;
};
