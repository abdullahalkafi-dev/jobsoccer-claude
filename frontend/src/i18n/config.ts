/** Languages the site is available in. English is the source language and the fallback. */
export const locales = ["en", "es", "fr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

/** Cookie that remembers the visitor's choice (read on the server so the first paint is already translated). */
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** Names shown in the language picker. Always written in their own language. */
export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
};

/** BCP 47 tags used for dates, numbers and money. */
export const localeTags: Record<Locale, string> = {
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
};

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && (locales as readonly string[]).includes(value);

/**
 * Message files live in src/messages/<locale>/<namespace>.json. Add a namespace here AND create the
 * file in all three languages (the build checks that every key exists in every language: `npm run i18n:check`).
 */
export const namespaces = [
  "common", "nav", "home", "pages", "auth", "forms", "validation", "options", "cards", "jobs",
  "candidates", "employers", "profile", "modals", "messages", "notifications", "video", "quality", "upgrade", "errors", "time",
] as const;
export type Namespace = (typeof namespaces)[number];
