/** Caption languages every video can have. English is the canonical track (always written first). */
export const CAPTION_LANGS = ["en", "es", "fr"] as const;
export type CaptionLang = (typeof CAPTION_LANGS)[number];

/** Track names shown in the player's CC menu (each in its own language). */
export const CAPTION_LABELS: Record<CaptionLang, string> = { en: "English", es: "Español", fr: "Français" };

export type TCaptionPaths = Partial<Record<CaptionLang, string>>;
export type TCaptionTrack = { lang: CaptionLang; label: string; url: string };

/** Public path of one caption file: English keeps its original name, so older videos keep working. */
export const captionPath = (sha256: string, lang: CaptionLang): string =>
  lang === "en" ? `captions/${sha256}.vtt` : `captions/${sha256}.${lang}.vtt`;

/**
 * The tracks a video has, English first. `captionsUrl` is the older English-only field,
 * `captions` holds the per-language paths. Videos with neither give an empty list.
 */
export const buildCaptionTracks = (video: { captionsUrl?: string | null; captions?: TCaptionPaths | null }): TCaptionTrack[] => {
  const paths: TCaptionPaths = { ...(video.captions ?? {}) };
  if (!paths.en && video.captionsUrl) paths.en = video.captionsUrl;
  return CAPTION_LANGS.filter((lang) => !!paths[lang]).map((lang) => ({ lang, label: CAPTION_LABELS[lang], url: paths[lang]! }));
};
