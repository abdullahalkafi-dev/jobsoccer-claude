"use client";

import { useSyncExternalStore } from "react";
import { UploadError, type TUploadErrorInfo, type TVideoKind } from "./types";
import { uploadVideoResumable } from "./uploadVideo";

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
  /** The connection dropped: the next try happens at this time (ms), null while all is well. */
  retryAt: number | null;
  /** An earlier unfinished upload of the same file was continued from this many bytes. */
  resumedFromBytes: number | null;
};

type TEntry = { state: TUploadState | null; error: TUploadErrorInfo | null };

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
  event.returnValue = "Video upload in progress";
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
  let samples: { at: number; loaded: number }[] = [];
  const update = (patch: Partial<TUploadState>) => {
    const current = entries.get(kind)?.state;
    if (!current) return;
    set(kind, { error: null, state: { ...current, ...patch } });
  };
  set(kind, {
    error: null,
    state: {
      stage: "uploading",
      percent: 0,
      loadedBytes: 0,
      totalBytes: file.size,
      bytesPerSecond: 0,
      secondsLeft: null,
      retryAt: null,
      resumedFromBytes: null,
    },
  });

  try {
    await uploadVideoResumable({
      ...input,
      onProgress: (loaded, total) => {
        const now = Date.now();
        // After a retry or a resume the position can jump: start measuring the speed again
        if (samples.length && loaded < samples[samples.length - 1].loaded) samples = [];
        samples.push({ at: now, loaded });
        while (samples.length > 2 && now - samples[0].at > 8000) samples.shift();
        const first = samples[0];
        const seconds = (now - first.at) / 1000;
        const bytesPerSecond = seconds >= 1 ? (loaded - first.loaded) / seconds : 0;
        update({
          stage: "uploading",
          percent: Math.min(100, Math.floor((loaded / total) * 100)),
          loadedBytes: loaded,
          totalBytes: total,
          bytesPerSecond,
          secondsLeft: bytesPerSecond > 0 ? Math.max(0, Math.round((total - loaded) / bytesPerSecond)) : null,
          retryAt: null,
        });
      },
      onRetry: (seconds) => {
        samples = [];
        update({ retryAt: Date.now() + seconds * 1000, bytesPerSecond: 0, secondsLeft: null });
      },
      onResume: (bytes) => update({ resumedFromBytes: bytes }),
      onUploaded: () => update({ stage: "checking", percent: 100, secondsLeft: 0, retryAt: null }),
    });
    set(kind, EMPTY);
    return true;
  } catch (error) {
    set(kind, { state: null, error: error instanceof UploadError ? error.info : { code: "FAILED" } });
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
export const setUploadError = (kind: TVideoKind, error: TUploadErrorInfo | null) => {
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
