"use client";

import { Gem } from "lucide-react";
import { useTranslations } from "next-intl";

/** Marks a premium opportunity (set by the JOBSOCCER team). Everyone can see it; only 5-star profiles can apply. */
export function PremiumBadge({ className = "" }: { className?: string }) {
  const t = useTranslations("quality");
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 ${className}`}
      title={t("premium.badgeTitle")}
    >
      <Gem className="h-3 w-3" /> {t("premium.badge")}
    </span>
  );
}
