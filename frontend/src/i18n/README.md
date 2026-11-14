# Languages (English, Spanish, French)

* Texts live in `src/messages/<locale>/<namespace>.json` (namespaces are listed in `src/i18n/config.ts`).
* Client component: `const t = useTranslations("jobs")` -> `t("card.apply")`.
* Server component / metadata: `const t = await getTranslations("pages")`.
* Sentences with a link or bold part: `t.rich("key", { link: (chunks) => <a href="/x">{chunks}</a> })`.
* Counts: `"{count, plural, one {# job} other {# jobs}}"`.
* Dates / money / "3 days ago": `useFormats()` from `@/i18n/format`.
* Stored values (roles, positions, countries, months…) stay English in the database; the label is translated with `useOptionLabel()` / `getOptionLabel()` (`src/i18n/options*.ts`, texts in `options.json`).
* People's names, club names, chat messages, job posts typed by users are NEVER translated.
* After adding text: `npm run i18n:check` (every key must exist in en, es and fr, with the same {placeholders}).
