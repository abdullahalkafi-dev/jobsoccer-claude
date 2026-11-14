"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { TPremiumAccess } from "./types";

/**
 * Explains a premium job next to the Apply button. Candidates below the threshold
 * can see the job but not apply; the message says how far they are and links to
 * the page where the improvement actions are.
 */
export function PremiumNotice({ access }: { access?: TPremiumAccess | null }) {
  const t = useTranslations("quality");
  if (access?.canApply) {
    return <p className="rounded-md bg-green-50 p-3 text-sm text-green-800">{t("premium.canApply")}</p>;
  }
  return (
    <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">
      <p className="font-semibold">{t("premium.title")}</p>
      {access ? (
        <p className="mt-1">
          {t.rich("premium.needMore", {
            points: Math.max(0, access.required - access.score),
            b: (chunks) => <strong>{chunks}</strong>,
            link: (chunks) => (
              <Link href="/profile/candidate" className="font-medium underline">
                {chunks}
              </Link>
            ),
          })}
        </p>
      ) : (
        <p className="mt-1">{t("premium.guest")}</p>
      )}
    </div>
  );
}
