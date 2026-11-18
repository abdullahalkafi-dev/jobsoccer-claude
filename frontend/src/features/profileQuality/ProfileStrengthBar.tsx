"use client";

import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { NextStep } from "./NextStep";
import { QualityStars } from "./QualityStars";
import { QUALITY_SECTION_IDS, type TQualityAction } from "./qualityHelpers";
import { useGetMyProfileQualityQuery } from "./qualityApi";

/**
 * A short summary at the top of the candidate's own profile: score, a bar with the premium mark,
 * the next step and a link to the full breakdown further down the page.
 */
export function ProfileStrengthBar({ onAction }: { onAction?: (action: TQualityAction) => void }) {
  const t = useTranslations("quality");
  const { data, isLoading } = useGetMyProfileQualityQuery();

  if (isLoading) return <Skeleton className="h-36 w-full rounded-xl" />;
  const quality = data?.quality;
  if (!quality) return null;

  const premiumAt = data?.premiumMinScore ?? 90;
  const percent = Math.min(100, Math.max(0, quality.score));

  return (
    <section aria-label={t("strength.title")} className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t("strength.title")}</h3>
          <QualityStars quality={quality} size="lg" />
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {quality.score}
          <span className="text-base font-medium text-gray-500">/100</span>
        </p>
      </div>

      <div>
        <div
          className="relative h-2.5 rounded-full bg-gray-100"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label={t("strength.title")}
        >
          <div className="h-full rounded-full bg-green-600 transition-[width]" style={{ width: `${percent}%` }} />
          <span className="absolute -top-0.5 h-3.5 w-0.5 bg-gray-400" style={{ left: `${premiumAt}%` }} aria-hidden="true" />
        </div>
        <p className="mt-1.5 text-right text-xs text-gray-500">{t("strength.premiumMark", { points: premiumAt })}</p>
      </div>

      <NextStep quality={quality} onAction={onAction} />

      <a
        href={`#${QUALITY_SECTION_IDS.card}`}
        onClick={(event) => {
          event.preventDefault();
          document.getElementById(QUALITY_SECTION_IDS.card)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
        className="inline-block text-sm font-medium text-blue-700 underline-offset-2 hover:underline"
      >
        {t("strength.seeDetails")}
      </a>
    </section>
  );
}
