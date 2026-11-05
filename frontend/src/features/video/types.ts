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
