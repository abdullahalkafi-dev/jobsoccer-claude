"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Globe } from "lucide-react";
import { isLocale, localeNames, locales } from "@/i18n/config";
import { writeLocaleCookie } from "@/i18n/cookie";
import { useAppSelector } from "@/redux/hooks";
import { useSetLanguageMutation } from "@/redux/features/auth/languageApi";

/** English / Español / Français. Works on every page and every screen size. */
export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const token = useAppSelector((state) => state.auth.token);
  const [saveLanguage] = useSetLanguageMutation();

  const change = (value: string) => {
    if (!isLocale(value) || value === locale) return;
    writeLocaleCookie(value);
    if (token) saveLanguage({ language: value }).catch(() => undefined); // remembered on the account (emails, notifications)
    startTransition(() => router.refresh());
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <Globe className="pointer-events-none absolute left-2.5 h-4 w-4 text-gray-500" aria-hidden="true" />
      <select
        value={locale}
        onChange={(event) => change(event.target.value)}
        disabled={pending}
        aria-label={t("language.label")}
        className="h-9 cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white py-1 pl-8 pr-7 text-sm font-medium text-gray-800 hover:border-teal-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 disabled:opacity-60"
      >
        {locales.map((code) => (
          <option key={code} value={code} lang={code}>
            {localeNames[code]}
          </option>
        ))}
      </select>
    </div>
  );
}
