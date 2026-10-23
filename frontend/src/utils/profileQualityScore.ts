import { ICandidate } from "@/types/user";

/**
 * Profile quality score shown on candidate cards (0-100).
 * A candidate with a real score shows it. While the platform is being reviewed,
 * a candidate without a score shows a stable placeholder (50-95) so every card
 * looks complete. Set to false to hide the line for candidates without a score.
 */
export const SHOW_PLACEHOLDER_QUALITY_SCORE = true;

const PLACEHOLDER_MIN = 50;
const PLACEHOLDER_RANGE = 46; // 50..95

/** Same id always gives the same number (no change on refresh). */
const placeholderFor = (id: string): number => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return PLACEHOLDER_MIN + (hash % PLACEHOLDER_RANGE);
};

export const getProfileQualityScore = (candidate: ICandidate): number | null => {
  const real = candidate.aiProfileScore;
  if (typeof real === "number" && real > 0) {
    return Math.min(100, Math.round(real));
  }
  return SHOW_PLACEHOLDER_QUALITY_SCORE ? placeholderFor(candidate._id) : null;
};
