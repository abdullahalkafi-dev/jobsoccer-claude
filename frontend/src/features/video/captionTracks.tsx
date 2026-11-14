import type { ReactElement } from "react";

export type TCaptionLang = "en" | "es" | "fr";
export type TCaptionTrack = { lang: TCaptionLang; label: string; url: string };

/** What a stored video may carry: the old English field, per-language paths, and/or the API's ready-made list. */
export type TVideoCaptions = {
  captionsUrl?: string;
  captions?: Partial<Record<TCaptionLang, string>> | null;
  captionTracks?: TCaptionTrack[];
};

const LABELS: Record<TCaptionLang, string> = { en: "English", es: "Español", fr: "Français" };
const ORDER: TCaptionLang[] = ["en", "es", "fr"];

/** The tracks a video has (English first). Older videos with only `captionsUrl` give English alone. */
export const getCaptionTracks = (video: TVideoCaptions): TCaptionTrack[] => {
  if (video.captionTracks?.length) return video.captionTracks;
  const paths: Partial<Record<TCaptionLang, string>> = { ...(video.captions ?? {}) };
  if (!paths.en && video.captionsUrl) paths.en = video.captionsUrl;
  return ORDER.filter((lang) => !!paths[lang]).map((lang) => ({ lang, label: LABELS[lang], url: paths[lang]! }));
};

/** The track shown by default: the site language when that track exists, otherwise English (or the first one). */
export const defaultCaptionLang = (tracks: TCaptionTrack[], locale: string): TCaptionLang | undefined =>
  tracks.find((track) => track.lang === locale)?.lang ?? tracks.find((track) => track.lang === "en")?.lang ?? tracks[0]?.lang;

/** `<track>` elements for a video; the viewer can still switch in the player's CC menu. */
export const renderCaptionTracks = (video: TVideoCaptions, locale: string, resolveUrl: (path: string) => string): ReactElement[] => {
  const tracks = getCaptionTracks(video);
  const defaultLang = defaultCaptionLang(tracks, locale);
  return tracks.map((track) => (
    <track key={track.lang} kind="subtitles" src={resolveUrl(track.url)} srcLang={track.lang} label={track.label} default={track.lang === defaultLang} />
  ));
};
