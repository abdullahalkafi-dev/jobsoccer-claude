// Fails when a translation key exists in English but is missing (or empty) in Spanish or French, or the other way round.
import fs from "node:fs";
import path from "node:path";
const root = path.join(process.cwd(), "src", "messages");
const locales = ["en", "es", "fr"];
const flat = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([k, v]) => (v && typeof v === "object" ? flat(v, prefix + k + ".") : [[prefix + k, v]]));
const placeholders = (s) => (String(s).match(/\{[a-zA-Z0-9_]+/g) || []).sort().join(",");
let problems = 0;
const files = fs.readdirSync(path.join(root, "en")).filter((f) => f.endsWith(".json"));
for (const file of files) {
  const data = {};
  for (const l of locales) {
    const p = path.join(root, l, file);
    if (!fs.existsSync(p)) { console.log(`MISSING FILE ${l}/${file}`); problems++; data[l] = new Map(); continue; }
    data[l] = new Map(flat(JSON.parse(fs.readFileSync(p, "utf8"))));
  }
  for (const l of locales) for (const [k, v] of data.en) {
    if (l === "en") continue;
    if (!data[l].has(k)) { console.log(`${l}/${file}: missing "${k}"`); problems++; }
    else if (!String(data[l].get(k)).trim()) { console.log(`${l}/${file}: empty "${k}"`); problems++; }
    else if (placeholders(v) !== placeholders(data[l].get(k))) { console.log(`${l}/${file}: placeholders differ in "${k}"`); problems++; }
  }
  for (const l of ["es", "fr"]) for (const k of data[l].keys()) if (!data.en.has(k)) { console.log(`${l}/${file}: extra "${k}" (not in en)`); problems++; }
}
console.log(problems ? `\n${problems} translation problem(s)` : `OK: ${files.length} files, all keys present in en/es/fr`);
process.exit(problems ? 1 : 0);
