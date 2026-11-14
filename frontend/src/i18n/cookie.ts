import { isLocale, LOCALE_COOKIE, defaultLocale, type Locale } from "./config";

/** Browser-side: the language chosen by the visitor (used for the API header). */
export function readLocaleCookie(): Locale {
  if (typeof document === "undefined") return defaultLocale;
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
  const value = match?.[1];
  return isLocale(value) ? value : defaultLocale;
}

export function writeLocaleCookie(locale: Locale) {
  const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; SameSite=Lax${secure}`;
}
