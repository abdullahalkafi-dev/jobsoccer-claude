"use client";

import { useTranslations } from "next-intl";
import { useFormats } from "@/i18n/format";
import type { TUploadErrorInfo } from "./types";

const MB = 1024 * 1024;
const round = (value: number, digits: number) => Number(value.toFixed(digits));

/** Turns the numbers and codes kept by the upload store into text in the visitor's language. */
export function useUploadText() {
  const t = useTranslations("video");
  const f = useFormats();

  /** "123 of 480 MB"; small files keep one decimal ("0.4 of 1.5 MB") */
  const bytes = (loaded: number, total: number) => {
    const digits = total / MB < 10 ? 1 : 0;
    return t("upload.bytes", { done: f.number(round(loaded / MB, digits)), total: f.number(round(total / MB, digits)) });
  };

  /** "3.4 MB/s", "850 KB/s" */
  const speed = (bytesPerSecond: number) =>
    bytesPerSecond >= MB
      ? t("upload.speedMb", { value: f.number(round(bytesPerSecond / MB, 1)) })
      : t("upload.speedKb", { value: f.number(Math.max(1, Math.round(bytesPerSecond / 1024))) });

  /** "about 4 min left", "less than a minute left" */
  const timeLeft = (seconds: number | null) => {
    if (seconds === null) return t("upload.timeEstimating");
    if (seconds < 60) return t("upload.timeLessMinute");
    const minutes = Math.round(seconds / 60);
    return minutes >= 60
      ? t("upload.timeHoursMinutes", { hours: Math.floor(minutes / 60), minutes: minutes % 60 })
      : t("upload.timeMinutes", { minutes });
  };

  /** Message for an upload problem. Text sent by the server is shown as received. */
  const error = (info: TUploadErrorInfo) =>
    info.code === "SERVER" && info.message ? info.message : t(`upload.errors.${info.code === "SERVER" ? "FAILED" : info.code}`, info.params ?? {});

  /** Megabytes shown alone ("48") */
  const megabytes = (value: number) => f.number(round(value / MB, value / MB < 10 ? 1 : 0));

  return { bytes, speed, timeLeft, error, megabytes };
}
