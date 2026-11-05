/**
 * Profile Quality Score as the API returns it. Everyone sees the public view
 * (stars + level); only the candidate sees the breakdown and the tips.
 */

export type TProfileLevel = "incomplete" | "developing" | "complete" | "advanced" | "premium";

/** What cards, search and other people's views show. */
export type TPublicQuality = { stars: number; level: TProfileLevel; label: string };

export type TQualityItem = { key: string; label: string; earned: number; max: number; done: boolean; tip?: string };

export type TQualityCategory = {
  key: "completion" | "verification" | "media" | "maintenance";
  label: string;
  earned: number;
  max: number;
  items: TQualityItem[];
};

/** The candidate's own result (breakdown + improvement actions). */
export type TProfileQuality = {
  score: number;
  level: TProfileLevel;
  stars: number;
  categories: TQualityCategory[];
  tips: string[];
  calculatedAt: string;
};

export type TQualityBand = { level: TProfileLevel; stars: number; min: number; label: string };

export type TMyQualityResponse = {
  quality: TProfileQuality | null;
  premiumMinScore: number;
  bands: TQualityBand[];
};

export const LEVEL_LABELS: Record<TProfileLevel, string> = {
  incomplete: "Incomplete",
  developing: "Developing",
  complete: "Complete",
  advanced: "Advanced",
  premium: "Premium Qualified",
};
