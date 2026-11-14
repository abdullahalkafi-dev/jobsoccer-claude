"use client";

import { useFormatter, useLocale } from "next-intl";

/**
 * One place for dates, money and "x ago", so every screen follows the chosen language.
 *   const f = useFormats();
 *   f.date(value)            -> "13/11/2026" (es/fr) or "11/13/2026" (en)
 *   f.dateLong(value)        -> "13 de noviembre de 2026"
 *   f.time(value)            -> "16:15" / "4:15 PM"
 *   f.number(1234.5)         -> "1.234,5" (es) / "1 234,5" (fr) / "1,234.5"
 *   f.money(30000)           -> "30.000 US$" ... (currency USD; the site only uses USD)
 *   f.moneyCompact(30000)    -> "$30K" style
 *   f.ago(date)              -> "hace 3 días" / "il y a 3 jours" / "3 days ago"
 */
export function useFormats() {
  const format = useFormatter();
  const locale = useLocale();
  const toDate = (value: Date | string | number) => (value instanceof Date ? value : new Date(value));
  return {
    locale,
    date: (value: Date | string | number) => format.dateTime(toDate(value), { year: "numeric", month: "2-digit", day: "2-digit" }),
    dateLong: (value: Date | string | number) => format.dateTime(toDate(value), { year: "numeric", month: "long", day: "numeric" }),
    monthYear: (value: Date | string | number) => format.dateTime(toDate(value), { year: "numeric", month: "long" }),
    time: (value: Date | string | number) => format.dateTime(toDate(value), { hour: "2-digit", minute: "2-digit" }),
    dateTime: (value: Date | string | number) =>
      format.dateTime(toDate(value), { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    number: (value: number) => format.number(value),
    percent: (value: number) => format.number(value / 100, { style: "percent", maximumFractionDigits: 0 }),
    money: (value: number) => format.number(value, { style: "currency", currency: "USD", maximumFractionDigits: 0 }),
    moneyCompact: (value: number) => format.number(value, { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }),
    ago: (value: Date | string | number) => format.relativeTime(toDate(value), new Date()),
    list: (items: string[]) => format.list(items, { type: "conjunction" }),
  };
}
