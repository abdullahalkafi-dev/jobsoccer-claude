/**
 * The "token" cookie only tells the route guard (src/middleware.ts) that someone is signed in.
 * The app itself reads the token from the Redux store (kept in localStorage). Both are always
 * written together through these helpers, and AuthSync (lib/Provider.tsx) re-aligns them on
 * every page load, so the guard and the app never disagree.
 */

const COOKIE = "token";
/** Renewed on every visit, so it only runs out after 30 days without opening the site. */
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const secureFlag = (): string =>
  typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";

export const writeTokenCookie = (token: string): void => {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${MAX_AGE_SECONDS}; SameSite=Lax${secureFlag()}`;
};

export const clearTokenCookie = (): void => {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE}=; path=/; max-age=0; SameSite=Lax${secureFlag()}`;
};

/**
 * Where to go after signing in: the page the guard sent the user away from (?next=/messages),
 * or the home page. Only same-site paths are accepted.
 */
export const safeNextPath = (next: string | null | undefined): string | null =>
  next && next.startsWith("/") && !next.startsWith("//") ? next : null;
