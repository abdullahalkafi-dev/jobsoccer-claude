/**
 * Language support for the API (English, Spanish, French).
 *
 *  - resolveLang(req): saved user language -> Accept-Language header -> "en"
 *  - translateMessage(message, lang): looks a finished English sentence up in the catalogs
 *    (messages/es.ts, messages/fr.ts); unknown sentences are returned unchanged (English).
 *
 * See README.md in this folder for how to add messages, emails and notifications.
 */
import { en } from "./messages/en";
import { es } from "./messages/es";
import { fr } from "./messages/fr";
import { values } from "./messages/values";

export const locales = ["en", "es", "fr"] as const;
export type Lang = (typeof locales)[number];
export const DEFAULT_LANG: Lang = "en";

export const isLang = (value: unknown): value is Lang =>
  typeof value === "string" && (locales as readonly string[]).includes(value);

/** First supported language of an Accept-Language header ("es-MX,es;q=0.9,en;q=0.8" -> "es"). */
export const parseAcceptLanguage = (header: unknown): Lang | undefined => {
  if (typeof header !== "string" || !header.trim()) return undefined;
  const tags = header
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      const weight = q ? Number(q.slice(2)) : 1;
      return { lang: tag.trim().toLowerCase().split("-")[0], weight: Number.isNaN(weight) ? 0 : weight, index };
    })
    .filter((t) => t.weight > 0)
    .sort((a, b) => b.weight - a.weight || a.index - b.index);
  return tags.map((t) => t.lang).find(isLang);
};

type TLangRequest = {
  headers?: Record<string, unknown>;
  /** Saved language of the signed-in user (set by languageMiddleware). */
  userLang?: Lang;
};

export const resolveLang = (req: TLangRequest): Lang =>
  (isLang(req.userLang) ? req.userLang : undefined) ?? parseAcceptLanguage(req.headers?.["accept-language"]) ?? DEFAULT_LANG;

// ---------------------------------------------------------------- catalogs

type TCatalog = Record<string, string>;
const catalogs: Record<Lang, TCatalog> = { en, es, fr };

type TPattern = { regex: RegExp; names: string[]; template: string; weight: number };
const patternCache: Partial<Record<Lang, TPattern[]>> = {};

const PLACEHOLDER = /\{([A-Za-z0-9_]+)\}/g;
const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const patternsFor = (lang: Lang): TPattern[] => {
  const cached = patternCache[lang];
  if (cached) return cached;
  const list: TPattern[] = [];
  for (const [key, template] of Object.entries(catalogs[lang])) {
    if (!/\{[A-Za-z0-9_]+\}/.test(key)) continue;
    const names: string[] = [];
    let source = "";
    let last = 0;
    for (const m of key.matchAll(PLACEHOLDER)) {
      source += escapeRegex(key.slice(last, m.index));
      source += "([\\s\\S]+?)";
      names.push(m[1]);
      last = (m.index ?? 0) + m[0].length;
    }
    source += escapeRegex(key.slice(last));
    list.push({ regex: new RegExp(`^${source}$`), names, template, weight: key.replace(PLACEHOLDER, "").length });
  }
  // Most specific (longest fixed text) first.
  list.sort((a, b) => b.weight - a.weight);
  patternCache[lang] = list;
  return list;
};

/** Translates a value that is put into a sentence (status, role, kind ...). Unknown values stay as they are. */
export const translateValue = (value: string, lang: Lang): string => {
  if (lang === "en") return value;
  const dict = values[lang];
  const direct = dict[value.trim().toLowerCase()];
  if (direct) return direct;
  if (/ and /i.test(value)) {
    const joiner = lang === "es" ? " y " : " et ";
    return value
      .split(/ and /i)
      .map((part) => dict[part.trim().toLowerCase()] ?? part)
      .join(joiner);
  }
  return value;
};

/** Translate one finished English sentence. English (or unknown text) comes back unchanged. */
export const translateMessage = (message: string, lang: Lang): string => {
  if (typeof message !== "string" || !message) return message;
  const trimmed = message.trim();
  if (lang === "en") return en[trimmed] ?? trimmed;

  const catalog = catalogs[lang];
  const exact = catalog[trimmed];
  if (exact !== undefined) return exact;

  for (const pattern of patternsFor(lang)) {
    const match = pattern.regex.exec(trimmed);
    if (!match) continue;
    return pattern.template.replace(PLACEHOLDER, (whole, name: string) => {
      const index = pattern.names.indexOf(name);
      return index === -1 ? whole : translateValue(match[index + 1], lang);
    });
  }
  return trimmed;
};

/** Fill {param} placeholders of a template. Missing params stay as written. */
export const fillTemplate = (template: string, params: Record<string, unknown> = {}): string =>
  template.replace(PLACEHOLDER, (whole, name: string) => (params[name] === undefined || params[name] === null ? whole : String(params[name])));

/** True when this exact sentence (or a {param} pattern of it) is in the Spanish/French catalog, i.e. it is a known, safe-to-show message. */
export const isKnownMessage = (message: string): boolean => {
  const trimmed = (message ?? "").trim();
  if (!trimmed) return false;
  return translateMessage(trimmed, "es") !== trimmed || Object.prototype.hasOwnProperty.call(es, trimmed) || Object.prototype.hasOwnProperty.call(en, trimmed);
};
