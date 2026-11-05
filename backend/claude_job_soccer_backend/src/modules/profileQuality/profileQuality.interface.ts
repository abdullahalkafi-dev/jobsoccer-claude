/**
 * Profile Quality Score: how complete, verified and up to date a profile is.
 * It is NOT a measure of professional ability (that is the interview assessment)
 * and recruitment results never add points (client's "keep three indicators separate").
 */

export type TProfileLevel = "incomplete" | "developing" | "complete" | "advanced" | "premium";

/** One thing that earns points, with what is still missing. */
export type TQualityItem = {
  key: string;
  label: string;
  earned: number;
  max: number;
  done: boolean;
  /** What to do to earn the rest of the points (shown to the candidate). */
  tip?: string;
};

export type TQualityCategory = {
  key: "completion" | "verification" | "media" | "maintenance";
  label: string;
  earned: number;
  max: number;
  items: TQualityItem[];
};

export type TProfileQuality = {
  /** 0-100. */
  score: number;
  level: TProfileLevel;
  /** 1-5 stars shown on cards (see {@link LEVEL_BANDS}). */
  stars: 1 | 2 | 3 | 4 | 5;
  categories: TQualityCategory[];
  /** Short improvement actions, best first (rule based, then AI written). */
  tips: string[];
  /**
   * AI judgement of the written parts (experience descriptions, CV). Kept with the
   * hash of what it judged, so the AI is only called again when that text changes.
   */
  ai?: TAiJudgement;
  calculatedAt: Date;
};

export type TAiJudgement = {
  hash: string;
  /** 0-1: how informative the experience descriptions are. */
  experienceQuality: number;
  /** 0-1: how well the CV fits the candidate's role. */
  cvRelevance: number;
  /** Up to 2 personal, role-specific improvement actions. */
  tips: string[];
  judgedAt: Date;
};

/** Score bands from the client's PDF; each band is one star level. */
export const LEVEL_BANDS: { level: TProfileLevel; stars: 1 | 2 | 3 | 4 | 5; min: number; label: string }[] = [
  { level: "premium", stars: 5, min: 90, label: "Premium Qualified" },
  { level: "advanced", stars: 4, min: 80, label: "Advanced" },
  { level: "complete", stars: 3, min: 60, label: "Complete" },
  { level: "developing", stars: 2, min: 40, label: "Developing" },
  { level: "incomplete", stars: 1, min: 0, label: "Incomplete" },
];

/** Candidates at or above this score may apply to premium jobs (client: 90). */
export const PREMIUM_MIN_SCORE = 90;
