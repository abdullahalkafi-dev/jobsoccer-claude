/**
 * Video types as the API returns them (see backend modules/video).
 * The rules, texts and limits all come from GET /videos/me, so this app
 * never keeps its own copy of them.
 */

export type TVideoKind = "Interview" | "Methodology" | "Highlights";

export type TGuideSection = { heading: string; items: string[] };

export type TVideoSlot = {
  kind: TVideoKind;
  required: boolean;
  /** How many videos of this kind the profile holds (players: 2 highlights). */
  count: number;
  maxSeconds: number;
  /** Locked for 3 months after each submission. */
  locked: boolean;
  title: string;
  headline: string;
  sections: TGuideSection[];
  showSetupPhotos: boolean;
};

export type TVideoPlan = {
  role: string;
  position: string | null;
  slots: TVideoSlot[];
  technical: TGuideSection;
  consent: {
    ai: { required: boolean; text: string };
    players: { required: boolean; text: string };
    version: string;
  };
  lockNotice: string;
  fileNameHint: string;
  limits: { maxMegabytes: number; minShortSide: number; formats: string[] };
};

export type TStoredVideo = {
  _id: string;
  kind: TVideoKind;
  url: string;
  durationSeconds: number;
  width?: number;
  height?: number;
  title?: string;
  captionsUrl?: string;
  /** Caption files per language (older videos have none of these but captionsUrl). */
  captions?: Partial<Record<"en" | "es" | "fr", string>> | null;
  /** Tracks the API lists for the player: English first. */
  captionTracks?: { lang: "en" | "es" | "fr"; label: string; url: string }[];
  uploadedAt?: string;
  lockedUntil?: string | null;
  isLocked: boolean;
};

export type TVideoStatus = {
  plan: TVideoPlan;
  videos: TStoredVideo[];
  missing: TVideoKind[];
  isComplete: boolean;
  consent: { aiAt?: string; playersAt?: string; version?: string; currentVersion: string };
};

/**
 * Upload problems are reported as a stable code (plus numbers); the screen turns them into a
 * message in the visitor's language. SERVER carries the text the server sent (already translated by the server).
 */
export type TUploadErrorInfo = {
  code: "TIMEOUT" | "TOO_LARGE" | "NETWORK" | "CANCELLED" | "FAILED" | "SERVER" | "FILE_TYPE" | "FILE_SIZE" | "FILE_LONG" | "FILE_RESOLUTION";
  params?: Record<string, string | number>;
  message?: string;
};

export class UploadError extends Error {
  constructor(public info: TUploadErrorInfo) {
    super(info.message ?? info.code);
  }
}
