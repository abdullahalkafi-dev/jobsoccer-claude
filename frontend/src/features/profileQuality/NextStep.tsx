"use client";

import { Clock, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { QualityActionButton } from "./ActionButton";
import { nextStep, type TQualityAction } from "./qualityHelpers";
import type { TProfileQuality } from "./types";

/**
 * "Next step": the single most useful thing to do now, with its points and a button.
 * Rule based (no AI): it is the missing item worth the most points, and an admin review
 * that is already under way is shown as "waiting" when nothing else is left.
 */
export function NextStep({ quality, onAction }: { quality: TProfileQuality; onAction?: (action: TQualityAction) => void }) {
  const t = useTranslations("quality.next");
  const step = nextStep(quality);

  if (!step) {
    return <p className="rounded-md bg-green-50 p-3 text-sm text-green-800">{t("allDone")}</p>;
  }

  const waiting = !!step.waiting;
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-md p-3 text-sm ${
        waiting ? "bg-gray-50 text-gray-700" : "bg-blue-50 text-blue-900"
      }`}
    >
      <div className="flex min-w-0 items-start gap-2">
        {waiting ? (
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
        ) : (
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
        )}
        <p className="min-w-0">
          <span className="font-semibold">{waiting ? t("waiting") : t("title")}: </span>
          {step.tip}
          {!waiting && <span className="ml-1 font-semibold whitespace-nowrap">({t("points", { points: step.gain })})</span>}
        </p>
      </div>
      <QualityActionButton action={step.action} onAction={onAction} />
    </div>
  );
}
