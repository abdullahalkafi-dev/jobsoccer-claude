// Fails when a stored option value (selectOptions.ts, profile.ts months) has no label key in options.json for en/es/fr.
import fs from "node:fs";
import path from "node:path";
const slug = (v) => v.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
const src = (f) => fs.readFileSync(path.join(process.cwd(), "src", "constants", f), "utf8");
const arrayOf = (text, name) => {
  const m = text.match(new RegExp(`export const ${name}\\s*=\\s*\\[([\\s\\S]*?)\\]`));
  if (!m) throw new Error(`array ${name} not found`);
  return [...m[1].matchAll(/"([^"]*)"/g)].map((x) => x[1]);
};
const sel = src("selectOptions.ts");
const groups = {
  country: arrayOf(sel, "countryList"),
  gender: arrayOf(sel, "genderOptions"),
  position: [
    ...arrayOf(sel, "officeStaffPositionOptions"),
    ...arrayOf(sel, "fieldStaffPositionOptions"),
    ...arrayOf(sel, "playerPositionOptions"),
  ],
  category: [
    ...arrayOf(sel, "professionalPlayerNationalTeamCategoryOptions"),
    ...arrayOf(sel, "amaturePlayerNationalTeamCategoryOptions"),
  ],
  foot: arrayOf(sel, "footOptions"),
  unit: [...arrayOf(sel, "heightUnitOptions"), ...arrayOf(sel, "weightUnitOptions")],
  division: arrayOf(sel, "divisionLevelOptions"),
  month: arrayOf(src("profile.ts"), "months"),
  role: ["Professional Player", "Amateur Player", "High School Player", "College/University Player", "On field staff", "Office Staff",
    "Professional Club", "Academy", "Amateur Club", "Consulting Company", "High School", "College/University", "Agent"],
  userType: ["candidate", "employer", "admin"],
  jobType: ["FullTime", "PartTime", "Contract"],
  experience: ["Entry Level", "Intermediate", "Mid-Level", "Mid-Senior", "Senior"],
  postedDate: ["Last Week", "Last Month", "Last 3 Months", "Last 6 Months", "This Month", "Any Time"],
  jobStatus: ["active", "closed", "draft", "expired"],
};
let problems = 0;
for (const l of ["en", "es", "fr"]) {
  const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), "src", "messages", l, "options.json"), "utf8"));
  for (const [g, values] of Object.entries(groups))
    for (const v of values) {
      const label = data[g]?.[slug(v)];
      if (!label || !String(label).trim()) { console.log(`${l}: missing ${g}.${slug(v)} (stored "${v}")`); problems++; }
    }
}
console.log(problems ? `\n${problems} missing option label(s)` : `OK: ${Object.values(groups).flat().length} stored values have labels in en/es/fr`);
process.exit(problems ? 1 : 0);
