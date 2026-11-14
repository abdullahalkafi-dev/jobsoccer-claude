import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import type { TPublicQuality } from "./types";

/**
 * Stars + level, e.g. "★★★★☆ Advanced". This is all that other people see of a
 * candidate's Profile Quality Score (the number stays private to the candidate).
 */
export function QualityStars({
  quality,
  size = "sm",
  showLabel = true,
}: {
  quality: Pick<TPublicQuality, "stars" | "level"> & { label?: string };
  size?: "sm" | "lg";
  showLabel?: boolean;
}) {
  const t = useTranslations("quality");
  const iconSize = size === "lg" ? "h-6 w-6" : "h-4 w-4";
  const label = quality.label ?? (t.has(`levels.${quality.level}`) ? t(`levels.${quality.level}`) : quality.level);

  return (
    <span className="inline-flex items-center gap-2" title={t("tooltip", { label })}>
      <span className="inline-flex" role="img" aria-label={t("starsAria", { stars: quality.stars })}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} className={`${iconSize} ${n <= quality.stars ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
        ))}
      </span>
      {showLabel && <span className={size === "lg" ? "text-base font-semibold text-gray-900" : "text-sm text-gray-700"}>{label}</span>}
    </span>
  );
}
