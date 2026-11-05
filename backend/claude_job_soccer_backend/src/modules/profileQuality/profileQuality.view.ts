import { LEVEL_BANDS, TProfileLevel, TProfileQuality } from "./profileQuality.interface";

/**
 * What other people see of a candidate's Profile Quality: the level and stars only
 * (client: "stars and incomplete / developing / complete / advanced / premium").
 * The number, the breakdown and the improvement tips are for the candidate alone.
 */
export type TPublicQuality = { stars: number; level: TProfileLevel; label: string };

export const toPublicQuality = (quality?: Pick<TProfileQuality, "stars" | "level"> | null): TPublicQuality | null => {
  if (!quality) return null;
  const band = LEVEL_BANDS.find((b) => b.level === quality.level);
  return { stars: quality.stars, level: quality.level, label: band?.label ?? quality.level };
};

/** The full result for the candidate themself, the public view for everyone else. */
export const qualityFor = (
  quality: TProfileQuality | undefined | null,
  ownerId: unknown,
  viewerId?: string | null
): TProfileQuality | TPublicQuality | null => {
  if (!quality) return null;
  return viewerId && String(ownerId) === viewerId ? quality : toPublicQuality(quality);
};
