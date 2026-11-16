"use client";

import { Fragment, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, ChevronDown, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { QualityStars } from "./QualityStars";
import { useGetMyProfileQualityQuery } from "./qualityApi";

/**
 * The candidate's own Profile Quality Score: stars + level, the points per
 * category (the client's table) and concrete actions to improve.
 * It measures how complete and verified the profile is, not ability.
 */
/** Same layout and height as the real card (score, table of 4 rows, premium line, tips), so nothing jumps. */
function ProfileQualitySkeleton() {
  return (
    <Card>
      <CardContent className="space-y-5 p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-6 w-40" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
        <Skeleton className="h-[11.5rem] w-full rounded-lg" />
        <Skeleton className="h-5 w-72" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
        <Skeleton className="h-8 w-full" />
      </CardContent>
    </Card>
  );
}

export function ProfileQualityCard() {
  const t = useTranslations("quality");
  const { data, isLoading } = useGetMyProfileQualityQuery();
  // The category whose checklist is open (tap a row to see what earns points)
  const [openKey, setOpenKey] = useState<string | null>(null);
  if (isLoading) return <ProfileQualitySkeleton />;

  const quality = data?.quality;
  if (!quality) return null;
  const toPremium = Math.max(0, (data?.premiumMinScore ?? 90) - quality.score);

  return (
    <Card>
      <CardContent className="space-y-5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t("title")}</h3>
            <QualityStars quality={quality} size="lg" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {quality.score}
            <span className="text-base font-medium text-gray-500">/100</span>
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-3 py-2">{t("card.category")}</th>
                <th className="px-3 py-2 text-right">{t("card.earned")}</th>
                <th className="px-3 py-2 text-right">{t("card.maximum")}</th>
              </tr>
            </thead>
            <tbody>
              {quality.categories.map((category) => {
                const open = openKey === category.key;
                return (
                  <Fragment key={category.key}>
                    <tr className="border-t border-gray-100">
                      <td className="px-3 py-2 text-gray-800">
                        <button
                          type="button"
                          aria-expanded={open}
                          aria-controls={`quality-${category.key}`}
                          onClick={() => setOpenKey(open ? null : category.key)}
                          className="inline-flex items-center gap-1.5 text-left hover:text-gray-950"
                        >
                          <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
                          {category.label}
                        </button>
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-gray-900">{category.earned}</td>
                      <td className="px-3 py-2 text-right text-gray-500">{category.max}</td>
                    </tr>
                    {open && (
                      <tr id={`quality-${category.key}`} className="bg-gray-50/60">
                        <td colSpan={3} className="px-3 py-2">
                          <ul className="space-y-1.5">
                            {category.items.map((item) => (
                              <li key={item.key} className="flex items-start justify-between gap-3 text-sm">
                                <span className={`flex items-start gap-2 ${item.done ? "text-gray-700" : "text-gray-900"}`}>
                                  {item.done ? (
                                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" aria-hidden="true" />
                                  ) : (
                                    <X className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                                  )}
                                  <span>
                                    {item.label}
                                    {!item.done && item.tip && <span className="block text-xs text-gray-500">{item.tip}</span>}
                                  </span>
                                </span>
                                <span className={`shrink-0 tabular-nums ${item.done ? "text-green-700" : "text-gray-500"}`}>
                                  {item.earned}/{item.max}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="-mt-3 text-xs text-gray-500">{t("card.checklistHint")}</p>

        {toPremium === 0 ? (
          <p className="rounded-md bg-green-50 p-3 text-sm text-green-800">
            {t.rich("card.premiumQualified", { b: (chunks) => <strong>{chunks}</strong> })}
          </p>
        ) : (
          <p className="text-sm text-gray-600">
            {t.rich("card.morePoints", { points: toPremium, b: (chunks) => <strong>{chunks}</strong> })}
          </p>
        )}

        {quality.tips.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-900">{t("card.howToImprove")}</h4>
            <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
              {quality.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-xs text-gray-500">
          {t("card.disclaimer")}
        </p>
      </CardContent>
    </Card>
  );
}
