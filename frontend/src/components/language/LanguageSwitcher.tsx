"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Globe } from "lucide-react";
import { isLocale, localeNames, locales, type Locale } from "@/i18n/config";
import { writeLocaleCookie } from "@/i18n/cookie";
import { useAppSelector } from "@/redux/hooks";
import { useSetLanguageMutation } from "@/redux/features/auth/languageApi";

/** English / Español / Français. Works on every page and every screen size. */
/** True when the screen is at least this wide (false on the server and for the first paint). */
function useMinWidth(px: number) {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const query = window.matchMedia(`(min-width: ${px}px)`);
    const update = () => setWide(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [px]);
  return wide;
}

export default function LanguageSwitcher({ className = "", compactBelowXl = false }: { className?: string; compactBelowXl?: boolean }) {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // What the visitor chose last. Shown at once and always the one that wins when they switch quickly.
  const [chosen, setChosen] = useState<Locale>(locale as Locale);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => setChosen(locale as Locale), [locale]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  // On tablet-width navbars (1024-1279px) show EN / ES / FR so everything fits on one line
  const wide = useMinWidth(1280);
  const compact = compactBelowXl && !wide;
  const token = useAppSelector((state) => state.auth.token);
  const [saveLanguage] = useSetLanguageMutation();

  const change = (value: string) => {
    if (!isLocale(value)) return;
    setChosen(value);
    writeLocaleCookie(value); // the cookie always holds the latest choice
    if (timer.current) clearTimeout(timer.current);
    // One refresh and one save for the LAST choice, so quick switching can never end on an older language
    timer.current = setTimeout(() => {
      if (token) saveLanguage({ language: value }).catch(() => undefined); // remembered on the account (emails, notifications)
      startTransition(() => router.refresh());
    }, 250);
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <Globe className="pointer-events-none absolute left-2 h-4 w-4 text-gray-500" aria-hidden="true" />
      <select
        value={chosen}
        onChange={(event) => change(event.target.value)}
        aria-label={t("language.label")}
        className={`h-9 cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white py-1 ${compact ? "pl-7 pr-5 text-xs" : "pl-8 pr-7 text-sm"} font-medium text-gray-800 hover:border-teal-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 ${pending ? "opacity-70" : ""}`}
      >
        {locales.map((code) => (
          <option key={code} value={code} lang={code}>
            {compact ? code.toUpperCase() : localeNames[code]}
          </option>
        ))}
      </select>
    </div>
  );
}
