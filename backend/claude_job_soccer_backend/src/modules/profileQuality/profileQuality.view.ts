import { AiLang } from "../../shared/ai/i18n/lang";
import { categoryLabel, itemLabel, levelLabel, renderTip } from "./profileQuality.i18n";
import { LEVEL_BANDS, TProfileLevel, TProfileQuality } from "./profileQuality.interface";
import { selectTipItems } from "./profileQuality.rules";

/**
 * What other people see of a candidate's Profile Quality: the level and stars only
 * (client: "stars and incomplete / developing / complete / advanced / premium").
 * The number, the breakdown and the improvement tips are for the candidate alone.
 *
 * `label` is in the viewer's language; `levelKey` is the stable key (use it for logic and styling).
 */
export type TPublicQuality = { stars: number; level: TProfileLevel; levelKey: TProfileLevel; label: string };

export const toPublicQuality = (quality?: Pick<TProfileQuality, "stars" | "level"> | null, lang: AiLang = "en"): TPublicQuality | null => {
  if (!quality) return null;
  const band = LEVEL_BANDS.find((b) => b.level === quality.level);
  return { stars: quality.stars, level: quality.level, levelKey: quality.level, label: band ? levelLabel(band.level, lang) : quality.level };
};

/** The score bands with labels in the viewer's language. */
export const localizedBands = (lang: AiLang = "en") => LEVEL_BANDS.map((band) => ({ ...band, label: levelLabel(band.level, lang) }));

/**
 * The full result in the viewer's language: category and item labels, tips and the level label.
 * Points, score, level and stars are never changed. English (and rows saved before tip keys existed)
 * keep the stored English text. Personal AI tips use the cached translation when there is one.
 */
export const localizeQuality = (quality: TProfileQuality, lang: AiLang = "en"): TProfileQuality & { label: string; levelKey: TProfileLevel } => {
  const label = levelLabel(quality.level, lang);
  if (lang === "en") return { ...quality, label, levelKey: quality.level };

  const categories = quality.categories.map((category) => ({
    ...category,
    label: categoryLabel(category.key, lang),
    items: category.items.map((item) => ({
      ...item,
      label: item.labelKey ? itemLabel(item.labelKey, lang) : item.label,
      ...(item.tipKey ? { tip: renderTip(item.tipKey, item.tipParams, lang) ?? item.tip } : {}),
    })),
  }));

  const keyed = quality.categories.flatMap((c) => c.items).every((item) => !item.tip || item.tipKey);
  const ruleTips = keyed ? selectTipItems(categories).map((item) => item.tip as string).slice(0, 4) : quality.tips.slice(0, 4);
  const aiTips = quality.ai?.translations?.[lang as "es" | "fr"] ?? quality.ai?.tips ?? [];
  return { ...quality, categories, tips: [...ruleTips, ...aiTips].slice(0, 5), label, levelKey: quality.level };
};

/** The full result for the candidate themself, the public view for everyone else. */
export const qualityFor = (
  quality: TProfileQuality | undefined | null,
  ownerId: unknown,
  viewerId?: string | null,
  lang: AiLang = "en"
): (TProfileQuality & { label: string; levelKey: TProfileLevel }) | TPublicQuality | null => {
  if (!quality) return null;
  return viewerId && String(ownerId) === viewerId ? localizeQuality(quality, lang) : toPublicQuality(quality, lang);
};
