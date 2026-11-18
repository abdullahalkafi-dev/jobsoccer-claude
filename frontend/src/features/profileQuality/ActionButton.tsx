"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { TQualityAction } from "./qualityHelpers";

/** The button that takes the candidate straight to the place where a missing item is fixed. */
export function QualityActionButton({
  action,
  onAction,
  size = "sm",
}: {
  action: TQualityAction | null;
  onAction?: (action: TQualityAction) => void;
  size?: "sm" | "default";
}) {
  const t = useTranslations("quality.action");
  if (!action || !onAction) return null;
  return (
    <Button type="button" variant="outline" size={size} className="shrink-0" onClick={() => onAction(action)}>
      {t(action)}
    </Button>
  );
}
