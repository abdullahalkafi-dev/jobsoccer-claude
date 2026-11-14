/**
 * Search terms for name / place searches: case-insensitive AND accent-insensitive
 * ("jose" finds "José", "Zoe" finds "Zoë", "munoz" finds "Muñoz"), and always escaped so what a
 * visitor types is never read as a regular expression.
 */
const GROUPS: Record<string, string> = {
  a: "aàáâãäåāăą",
  c: "cçćčĉċ",
  d: "dďđ",
  e: "eèéêëēĕėęě",
  g: "gĝğġģ",
  h: "hĥħ",
  i: "iìíîïĩīĭįı",
  j: "jĵ",
  k: "kķ",
  l: "lĺļľŀł",
  n: "nñńņňŉ",
  o: "oòóôõöøōŏőœ",
  r: "rŕŗř",
  s: "sśŝşšß",
  t: "tţťŧ",
  u: "uùúûüũūŭůűų",
  w: "wŵ",
  y: "yýÿŷ",
  z: "zźżž",
};

const escapeRegex = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const BASE_OF: Record<string, string> = {};
for (const [base, chars] of Object.entries(GROUPS)) {
  for (const ch of chars) BASE_OF[ch] = base;
}

/** Pattern text (no flags) for a term. */
export const accentInsensitivePattern = (term: string): string => {
  const cleaned = String(term ?? "").trim().normalize("NFC");
  let out = "";
  for (const ch of cleaned) {
    const lower = ch.toLowerCase();
    const base = BASE_OF[lower];
    if (base) {
      const chars = GROUPS[base];
      out += `[${chars}${chars.toUpperCase()}]`;
    } else if (/[̀-ͯ]/.test(ch)) {
      // a loose combining accent: drop it, the base letter already matches
      continue;
    } else {
      out += escapeRegex(ch);
    }
  }
  return out;
};

/** RegExp for Mongo queries: { firstName: accentInsensitiveRegex(term) }. */
export const accentInsensitiveRegex = (term: string): RegExp => new RegExp(accentInsensitivePattern(term), "i");

/** Plain escaped, case-insensitive regex (places, emails). */
export const escapedRegex = (term: string): RegExp => new RegExp(escapeRegex(String(term ?? "").trim()), "i");
