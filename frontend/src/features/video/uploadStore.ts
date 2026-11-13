"use client";

import { useSyncExternalStore } from "react";
import type { TVideoKind } from "./types";
import { uploadVideo } from "./uploadVideo";

/**
 * Video uploads that keep running while the candidate moves around the website.
 * The state lives here (outside any component), so coming back to the profile shows
 * the same progress bar instead of an empty "Choose your video" box. While an upload
 * runs, closing or reloading the tab asks for confirmation first.
 */

export type TUploadStage = "uploading" | "checking" | "saving";

export type TUploadState = {
  stage: TUploadStage;
  percent: number;
  loadedBytes: number;
  totalBytes: number;
  /** Average speed over the last seconds, bytes per second (0 until measured). */
  bytesPerSecond: number;
  /** Estimated seconds left for the file to arrive (null until measured). */
  secondsLeft: number | null;
};

type TEntry = { state: TUploadState | null; error: string | null };

const entries = new Map<TVideoKind, TEntry>();
const listeners = new Set<() => void>();
const EMPTY: TEntry = { state: null, error: null };

const emit = () => listeners.forEach((listener) => listener());
const set = (kind: TVideoKind, entry: TEntry) => {
  entries.set(kind, entry);
  syncLeaveWarning();
  emit();
};

const isAnyUploading = () => [...entries.values()].some((entry) => entry.state !== null);

const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
  event.preventDefault();
  // Older browsers need a value; the text itself is not shown by modern browsers
  event.returnValue = "Your video is still uploading. If you leave now, the upload stops.";
};
let warningOn = false;
const syncLeaveWarning = () => {
  if (typeof window === "undefined") return;
  const shouldWarn = isAnyUploading();
  if (shouldWarn && !warningOn) window.addEventListener("beforeunload", warnBeforeLeaving);
  if (!shouldWarn && warningOn) window.removeEventListener("beforeunload", warnBeforeLeaving);
  warningOn = shouldWarn;
};

/** Start an upload. Resolves true when the video is saved, false when it failed (see the error). */
export const startVideoUpload = async (input: {
  token: string;
  kind: TVideoKind;
  file: File;
  replaceVideoId?: string;
}): Promise<boolean> => {
  const { kind, file } = input;
  if (entries.get(kind)?.state) return false; // one upload per slot at a time

  // Speed over a sliding window of recent samples, so the estimate follows the real connection
  const samples: { at: number; loaded: number }[] = [];
  set(kind, {
    error: null,
    state: { stage: "uploading", percent: 0, loadedBytes: 0, totalBytes: file.size, bytesPerSecond: 0, secondsLeft: null },
  });

  try {
    await uploadVideo({
      ...input,
      onProgress: (loaded, total) => {
        const now = Date.now();
        samples.push({ at: now, loaded });
        while (samples.length > 2 && now - samples[0].at > 8000) samples.shift();
        const first = samples[0];
        const seconds = (now - first.at) / 1000;
        const bytesPerSecond = seconds >= 1 ? (loaded - first.loaded) / seconds : 0;
        set(kind, {
          error: null,
          state: {
            stage: loaded >= total ? "checking" : "uploading",
            percent: Math.min(100, Math.round((loaded / total) * 100)),
            loadedBytes: loaded,
            totalBytes: total,
            bytesPerSecond,
            secondsLeft: bytesPerSecond > 0 ? Math.max(0, Math.round((total - loaded) / bytesPerSecond)) : null,
          },
        });
      },
    });
    set(kind, EMPTY);
    return true;
  } catch (error) {
    set(kind, { state: null, error: error instanceof Error ? error.message : "The upload failed." });
    return false;
  }
};

/** The server reports what it is doing once the whole file has arrived (live event "video:stage"). */
export const setUploadStage = (kind: TVideoKind, stage: TUploadStage) => {
  const entry = entries.get(kind);
  if (!entry?.state) return;
  set(kind, { ...entry, state: { ...entry.state, stage, percent: 100, secondsLeft: 0 } });
};

/** Show a problem found before the upload started (wrong format, too long, too large). */
export const setUploadError = (kind: TVideoKind, error: string | null) => {
  set(kind, { state: entries.get(kind)?.state ?? null, error });
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Live upload state of one video slot. */
export const useVideoUpload = (kind: TVideoKind): TEntry =>
  useSyncExternalStore(
    subscribe,
    () => entries.get(kind) ?? EMPTY,
    () => EMPTY
  );

/** "3.4 MB/s", "850 KB/s" */
export const formatSpeed = (bytesPerSecond: number): string =>
  bytesPerSecond >= 1024 * 1024
    ? `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`
    : `${Math.max(1, Math.round(bytesPerSecond / 1024))} KB/s`;

/** "about 4 min left", "less than a minute left" */
export const formatTimeLeft = (seconds: number | null): string => {
  if (seconds === null) return "estimating time left…";
  if (seconds < 60) return "less than a minute left";
  const minutes = Math.round(seconds / 60);
  return minutes >= 60 ? `about ${Math.floor(minutes / 60)} h ${minutes % 60} min left` : `about ${minutes} min left`;
};

/** "123 of 480 MB"; small files keep one decimal ("0.4 of 1.5 MB") */
export const formatProgressBytes = (loaded: number, total: number): string => {
  const mb = (bytes: number) => bytes / (1024 * 1024);
  const digits = mb(total) < 10 ? 1 : 0;
  return `${mb(loaded).toFixed(digits)} of ${mb(total).toFixed(digits)} MB`;
};
