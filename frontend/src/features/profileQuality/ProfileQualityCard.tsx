"use client";

import { Fragment, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, ChevronDown, Clock, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { QualityActionButton } from "./ActionButton";
import { NextStep } from "./NextStep";
import { QualityStars } from "./QualityStars";
import { adminChecks, missingItems, QUALITY_SECTION_IDS, wholeNumberItems, type TQualityAction } from "./qualityHelpers";
import { useGetMyProfileQualityQuery } from "./qualityApi";

/**
 * The candidate's own Profile Quality Score: stars + level, the points per
 * category (the client's table), what is still missing (with points and a button
 * for each) and the admin approvals that premium needs.
 * It measures how complete and verified the profile is, not ability.
 */
/** Same layout and height as the real card (score, next step, table of 4 rows, premium line, list), so nothing jumps. */
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
        <Skeleton className="h-14 w-full rounded-md" />
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

export function ProfileQualityCard({ onAction }: { onAction?: (action: TQualityAction) => void }) {
  const t = useTranslations("quality");
  const { data, isLoading } = useGetMyProfileQualityQuery();
  // The category whose full checklist is open (tap a row to see everything, including what is done)
  const [openKey, setOpenKey] = useState<string | null>(null);
  if (isLoading) return <ProfileQualitySkeleton />;

  const quality = data?.quality;
  if (!quality) return null;
  const toPremium = Math.max(0, (data?.premiumMinScore ?? 90) - quality.score);
  const missing = missingItems(quality);
  // Personal suggestions that do not belong to one checklist item (written by the AI for a few profiles)
  const extraTips = quality.tips.filter((tip) => !missing.some((item) => item.tip === tip));
  const checks = adminChecks(quality);
  const needsApproval = toPremium > 0 && checks.some((check) => check.state !== "approved");

  return (
    <Card id={QUALITY_SECTION_IDS.card} className="scroll-mt-24">
      <CardContent className="space-y-5 p-4 sm:p-6">
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

        <NextStep quality={quality} onAction={onAction} />

        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full table-fixed text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-3 py-2">{t("card.category")}</th>
                <th className="w-20 px-2 py-2 text-right sm:w-24 sm:px-3">{t("card.earned")}</th>
                <th className="w-20 px-2 py-2 text-right sm:w-24 sm:px-3">{t("card.maximum")}</th>
              </tr>
            </thead>
            <tbody>
              {quality.categories.map((category) => {
                const open = openKey === category.key;
                const items = wholeNumberItems(category);
                return (
                  <Fragment key={category.key}>
                    <tr className="border-t border-gray-100">
                      <td className="px-3 py-2 text-gray-800">
                        <button
                          type="button"
                          aria-expanded={open}
                          aria-controls={`quality-${category.key}`}
                          onClick={() => setOpenKey(open ? null : category.key)}
                          className="inline-flex items-start gap-1.5 text-left hover:text-gray-950"
                        >
                          <ChevronDown className={`mt-0.5 h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
                          <span className="break-words">{category.label}</span>
                        </button>
                      </td>
                      <td className="px-2 py-2 text-right font-medium text-gray-900 sm:px-3">{category.earned}</td>
                      <td className="px-2 py-2 text-right text-gray-500 sm:px-3">{category.max}</td>
                    </tr>
                    {open && (
                      <tr id={`quality-${category.key}`} className="bg-gray-50/60">
                        <td colSpan={3} className="px-3 py-2">
                          <ul className="space-y-1.5">
                            {items.map((item) => (
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

        {missing.length > 0 && (
          <div>
            <h4 className="mb-1 text-sm font-semibold text-gray-900">{t("missing.title")}</h4>
            <ul className="divide-y divide-gray-100">
              {missing.map((item) => (
                <li key={`${item.categoryKey}-${item.key}`} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 py-2.5 text-sm">
                  <div className="flex min-w-0 flex-1 basis-56 items-start gap-2 text-gray-800">
                    {item.waiting ? (
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                    ) : (
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                    )}
                    <span className="min-w-0">
                      {item.tip}
                      {!item.waiting && (
                        <span className="ml-2 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 whitespace-nowrap">
                          {t("next.points", { points: item.gain })}
                        </span>
                      )}
                    </span>
                  </div>
                  <QualityActionButton action={item.action} onAction={onAction} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {extraTips.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-900">{t("missing.more")}</h4>
            <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
              {extraTips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {needsApproval && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <p className="font-semibold">{t("premiumPath.title")}</p>
            <ul className="mt-2 space-y-1">
              {checks.map((check) => (
                <li key={check.key} className="flex items-center gap-2">
                  {check.state === "approved" ? (
                    <Check className="h-4 w-4 shrink-0 text-green-600" aria-hidden="true" />
                  ) : check.state === "inReview" ? (
                    <Clock className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                  ) : (
                    <X className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                  )}
                  <span>
                    {check.label}: <span className="font-medium">{t(`premiumPath.${check.state}`)}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-amber-800">{t("premiumPath.note")}</p>
          </div>
        )}

        <p className="text-xs text-gray-500">
          {t("card.disclaimer")}
        </p>
      </CardContent>
    </Card>
  );
}
