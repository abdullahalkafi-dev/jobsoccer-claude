/** Sort stored values by their translated label using the locale's collation (accents handled: "Écosse" sorts with E). */
export function sortByLabel(values: string[], label: (v: string) => string, locale: string): string[] {
  const collator = new Intl.Collator(locale, { sensitivity: "base", numeric: true });
  return [...values].sort((a, b) => collator.compare(label(a), label(b)));
}
