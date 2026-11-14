"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";

/**
 * The client's two example pictures for the interview recording:
 * the first is the correct set-up, the second (behind a table, framed from the
 * waist up) is the one to avoid.
 */
export function SetupPhotos() {
  const t = useTranslations("video");
  return (
    <div className="grid gap-4 sm:grid-cols-2" aria-label={t("setup.ariaLabel")}>
      <figure className="overflow-hidden rounded-lg border-2 border-green-500 bg-white">
        <Image src="/video-setup/correct.jpg" alt={t("setup.correctAlt")} width={640} height={427} className="h-auto w-full" />
        <figcaption className="flex items-start gap-2 p-3 text-sm text-gray-700">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
          <span>
            {t.rich("setup.correctText", { b: (chunks) => <strong className="text-green-700">{chunks}</strong> })}
          </span>
        </figcaption>
      </figure>
      <figure className="overflow-hidden rounded-lg border-2 border-red-400 bg-white">
        <Image src="/video-setup/not-this.jpg" alt={t("setup.wrongAlt")} width={640} height={427} className="h-auto w-full" />
        <figcaption className="flex items-start gap-2 p-3 text-sm text-gray-700">
          <X className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <span>
            {t.rich("setup.wrongText", { b: (chunks) => <strong className="text-red-700">{chunks}</strong> })}
          </span>
        </figcaption>
      </figure>
    </div>
  );
}
