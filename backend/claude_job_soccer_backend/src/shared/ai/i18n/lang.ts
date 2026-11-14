import { locales, type Lang } from "../../i18n";

/** Languages the AI layer can output: the shared `Lang` (src/shared/i18n). */
export type AiLang = Lang;

export const AI_LANGS: readonly AiLang[] = locales;

export const toAiLang = (value: unknown): AiLang => {
  const code = String(value ?? "").trim().toLowerCase().slice(0, 2);
  return (AI_LANGS as readonly string[]).includes(code) ? (code as AiLang) : "en";
};

/** The viewer's language: `req.lang` (set by the i18n middleware), English until then. */
export const langOf = (req: unknown): AiLang => toAiLang((req as any)?.lang);
