/** Country calling codes for the phone number field: [ISO 3166 code, calling code without "+", English name]. */
export type TDialCountry = { iso: string; dial: string; name: string };

const RAW: [string, string, string][] = [
  ["US", "1", "United States"], ["CA", "1", "Canada"], ["GB", "44", "United Kingdom"], ["FR", "33", "France"], ["ES", "34", "Spain"],
  ["DE", "49", "Germany"], ["IT", "39", "Italy"], ["PT", "351", "Portugal"], ["NL", "31", "Netherlands"], ["BE", "32", "Belgium"],
  ["CH", "41", "Switzerland"], ["AT", "43", "Austria"], ["IE", "353", "Ireland"], ["SE", "46", "Sweden"], ["NO", "47", "Norway"],
  ["DK", "45", "Denmark"], ["FI", "358", "Finland"], ["IS", "354", "Iceland"], ["PL", "48", "Poland"], ["CZ", "420", "Czechia"],
  ["SK", "421", "Slovakia"], ["HU", "36", "Hungary"], ["RO", "40", "Romania"], ["BG", "359", "Bulgaria"], ["GR", "30", "Greece"],
  ["TR", "90", "Turkey"], ["RU", "7", "Russia"], ["UA", "380", "Ukraine"], ["BY", "375", "Belarus"], ["RS", "381", "Serbia"],
  ["HR", "385", "Croatia"], ["SI", "386", "Slovenia"], ["BA", "387", "Bosnia and Herzegovina"], ["ME", "382", "Montenegro"],
  ["MK", "389", "North Macedonia"], ["AL", "355", "Albania"], ["XK", "383", "Kosovo"], ["MD", "373", "Moldova"], ["LT", "370", "Lithuania"],
  ["LV", "371", "Latvia"], ["EE", "372", "Estonia"], ["LU", "352", "Luxembourg"], ["MT", "356", "Malta"], ["CY", "357", "Cyprus"],
  ["MC", "377", "Monaco"], ["AD", "376", "Andorra"], ["LI", "423", "Liechtenstein"], ["SM", "378", "San Marino"], ["GI", "350", "Gibraltar"],
  ["MX", "52", "Mexico"], ["BR", "55", "Brazil"], ["AR", "54", "Argentina"], ["CL", "56", "Chile"], ["CO", "57", "Colombia"],
  ["PE", "51", "Peru"], ["VE", "58", "Venezuela"], ["EC", "593", "Ecuador"], ["UY", "598", "Uruguay"], ["PY", "595", "Paraguay"],
  ["BO", "591", "Bolivia"], ["CR", "506", "Costa Rica"], ["PA", "507", "Panama"], ["GT", "502", "Guatemala"], ["HN", "504", "Honduras"],
  ["SV", "503", "El Salvador"], ["NI", "505", "Nicaragua"], ["CU", "53", "Cuba"], ["DO", "1809", "Dominican Republic"], ["PR", "1787", "Puerto Rico"],
  ["JM", "1876", "Jamaica"], ["TT", "1868", "Trinidad and Tobago"], ["HT", "509", "Haiti"], ["BS", "1242", "Bahamas"], ["BB", "1246", "Barbados"],
  ["MA", "212", "Morocco"], ["DZ", "213", "Algeria"], ["TN", "216", "Tunisia"], ["LY", "218", "Libya"], ["EG", "20", "Egypt"],
  ["SN", "221", "Senegal"], ["CI", "225", "Côte d'Ivoire"], ["GH", "233", "Ghana"], ["NG", "234", "Nigeria"], ["CM", "237", "Cameroon"],
  ["ML", "223", "Mali"], ["BF", "226", "Burkina Faso"], ["GN", "224", "Guinea"], ["GM", "220", "Gambia"], ["SL", "232", "Sierra Leone"],
  ["LR", "231", "Liberia"], ["TG", "228", "Togo"], ["BJ", "229", "Benin"], ["NE", "227", "Niger"], ["MR", "222", "Mauritania"],
  ["CV", "238", "Cape Verde"], ["GA", "241", "Gabon"], ["CG", "242", "Congo"], ["CD", "243", "DR Congo"], ["AO", "244", "Angola"],
  ["ZA", "27", "South Africa"], ["ZW", "263", "Zimbabwe"], ["ZM", "260", "Zambia"], ["MZ", "258", "Mozambique"], ["NA", "264", "Namibia"],
  ["BW", "267", "Botswana"], ["KE", "254", "Kenya"], ["TZ", "255", "Tanzania"], ["UG", "256", "Uganda"], ["RW", "250", "Rwanda"],
  ["ET", "251", "Ethiopia"], ["SD", "249", "Sudan"], ["SO", "252", "Somalia"], ["MG", "261", "Madagascar"], ["MU", "230", "Mauritius"],
  ["SA", "966", "Saudi Arabia"], ["AE", "971", "United Arab Emirates"], ["QA", "974", "Qatar"], ["KW", "965", "Kuwait"], ["BH", "973", "Bahrain"],
  ["OM", "968", "Oman"], ["JO", "962", "Jordan"], ["LB", "961", "Lebanon"], ["SY", "963", "Syria"], ["IQ", "964", "Iraq"],
  ["IR", "98", "Iran"], ["IL", "972", "Israel"], ["PS", "970", "Palestine"], ["YE", "967", "Yemen"], ["AM", "374", "Armenia"],
  ["GE", "995", "Georgia"], ["AZ", "994", "Azerbaijan"], ["KZ", "76", "Kazakhstan"], ["UZ", "998", "Uzbekistan"], ["KG", "996", "Kyrgyzstan"],
  ["TJ", "992", "Tajikistan"], ["TM", "993", "Turkmenistan"], ["AF", "93", "Afghanistan"], ["PK", "92", "Pakistan"], ["IN", "91", "India"],
  ["BD", "880", "Bangladesh"], ["LK", "94", "Sri Lanka"], ["NP", "977", "Nepal"], ["CN", "86", "China"], ["HK", "852", "Hong Kong"],
  ["TW", "886", "Taiwan"], ["JP", "81", "Japan"], ["KR", "82", "South Korea"], ["TH", "66", "Thailand"], ["VN", "84", "Vietnam"],
  ["MY", "60", "Malaysia"], ["SG", "65", "Singapore"], ["ID", "62", "Indonesia"], ["PH", "63", "Philippines"], ["KH", "855", "Cambodia"],
  ["MM", "95", "Myanmar"], ["MN", "976", "Mongolia"], ["AU", "61", "Australia"], ["NZ", "64", "New Zealand"], ["FJ", "679", "Fiji"],
  ["PG", "675", "Papua New Guinea"], ["WS", "685", "Samoa"], ["TO", "676", "Tonga"],
];

export const DIAL_COUNTRIES: TDialCountry[] = RAW.map(([iso, dial, name]) => ({ iso, dial, name }));

/** Flag emoji from the ISO code (two regional indicator letters). */
export const flagOf = (iso: string): string =>
  iso.length === 2 ? String.fromCodePoint(...[...iso.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0))) : "";

const byLongestDial = [...DIAL_COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);

/** Split "+33 786543641" into its country and the rest. Without a leading "+" nothing is recognised. */
export const splitPhone = (value: string): { country: TDialCountry | null; national: string } => {
  const text = (value ?? "").trim();
  if (!text.startsWith("+")) return { country: null, national: text };
  const digits = text.slice(1).replace(/[^\d]/g, "");
  const compact = text.slice(1);
  const found = byLongestDial.find((c) => digits.startsWith(c.dial));
  if (!found) return { country: null, national: text };
  // Drop the calling code from the original text, keeping the user's spacing for the rest.
  let skipped = 0;
  let i = 0;
  while (i < compact.length && skipped < found.dial.length) {
    if (/\d/.test(compact[i])) skipped++;
    i++;
  }
  // Prefer the first listed country for a shared code (+1 is the United States)
  const first = DIAL_COUNTRIES.find((c) => c.dial === found.dial) ?? found;
  return { country: first, national: compact.slice(i).trim() };
};

export const joinPhone = (country: TDialCountry | null, national: string): string => {
  const rest = national.trim();
  if (!rest) return "";
  return country ? `+${country.dial} ${rest}` : rest;
};
