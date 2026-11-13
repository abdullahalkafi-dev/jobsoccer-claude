"use client";

import { useEffect, useRef, useState } from "react";
import { Lock, RefreshCw, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { baseApi } from "@/redux/api/baseApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { GuideQuestions } from "@/components/questions/GuideQuestions";
import { SetupPhotos } from "./SetupPhotos";
import { checkVideoFile, formatClock } from "./checkVideoFile";
import { useOptionalLiveConnection } from "@/components/providers/NotificationProvider";
import {
  formatProgressBytes,
  formatSpeed,
  formatTimeLeft,
  setUploadError,
  setUploadStage,
  startVideoUpload,
  useVideoUpload,
  type TUploadStage,
} from "./uploadStore";
import type { TStoredVideo, TVideoPlan, TVideoSlot } from "./types";

/** "Connection lost. Trying again in 8 s…" with a live countdown. */
function RetryNotice({ retryAt, done }: { retryAt: number; done: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const seconds = Math.max(0, Math.ceil((retryAt - now) / 1000));
  return (
    <p className="text-xs text-amber-700">
      Connection lost after {done}. {seconds > 0 ? `Trying again in ${seconds} s…` : "Trying again…"} Nothing is lost: the upload
      continues from where it stopped.
    </p>
  );
}

const mediaUrl = (path: string): string => (path.startsWith("http") ? path : `${process.env.NEXT_PUBLIC_BASE_URL}/${path}`);

/** One video the candidate has to provide: instructions, file picker, progress, preview with captions. */
export function VideoSlotCard({
  slot,
  plan,
  videos,
  consentOk,
}: {
  slot: TVideoSlot;
  plan: TVideoPlan;
  videos: TStoredVideo[];
  consentOk: boolean;
}) {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const inputRef = useRef<HTMLInputElement>(null);
  const targetRef = useRef<{ replaceVideoId?: string }>({});
  const { socket, connected } = useOptionalLiveConnection();
  // The upload lives outside this card, so it keeps going (and is shown again) if the candidate leaves the page
  const { state: upload, error } = useVideoUpload(slot.kind);

  const rows = Array.from({ length: slot.count }, (_, index) => videos[index] ?? null);
  const hasVideo = rows.some(Boolean);
  const uploading = upload !== null;

  // Once the whole file has arrived, the server reports what it is doing with it
  useEffect(() => {
    if (!socket) return;
    const onStage = (data: { kind: string; stage: TUploadStage }) => {
      if (data.kind === slot.kind) setUploadStage(slot.kind, data.stage);
    };
    socket.on("video:stage", onStage);
    return () => {
      socket.off("video:stage", onStage);
    };
  }, [socket, slot.kind]);

  const pick = (replaceVideoId?: string) => {
    targetRef.current = { replaceVideoId };
    inputRef.current?.click();
  };

  const handleFile = async (file: File | undefined) => {
    if (inputRef.current) inputRef.current.value = "";
    if (!file || !token) return;
    setUploadError(slot.kind, null);
    const check = await checkVideoFile(file, {
      maxSeconds: slot.maxSeconds,
      maxMegabytes: plan.limits.maxMegabytes,
      minShortSide: plan.limits.minShortSide,
    });
    if (!check.ok) return setUploadError(slot.kind, check.message);

    const saved = await startVideoUpload({ token, kind: slot.kind, file, replaceVideoId: targetRef.current.replaceVideoId });
    if (saved) {
      // Show the new video at once. With a live connection the server also pushes the score and profile
      // updates; without one, reload those here too.
      dispatch(baseApi.util.invalidateTags(connected ? ["Video"] : ["Video", "User", "ProfileQuality"]));
    }
  };

  return (
    <Card className="border border-gray-200 shadow-none">
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-gray-900">{slot.title}</h3>
          <div className="flex items-center gap-2">
            <Badge variant={slot.required ? "default" : "secondary"}>{slot.required ? "Required" : "Optional"}</Badge>
            <span className="text-xs text-gray-500">up to {formatClock(slot.maxSeconds)}{slot.count > 1 ? " each" : ""}</span>
          </div>
        </div>

        <p className="text-sm text-gray-700">{slot.headline}</p>

        {/* Open while the interview still has to be recorded; folded away once it is uploaded */}
        {slot.kind === "Interview" && plan.position && <GuideQuestions position={plan.position} collapsible defaultOpen={!hasVideo} />}

        <details className="rounded-lg bg-gray-50 p-3 text-sm" open={!hasVideo}>
          <summary className="cursor-pointer font-medium text-gray-900">Recording guide</summary>
          <div className="mt-3 space-y-4">
            {slot.sections.map((section) => (
              <div key={section.heading}>
                <h4 className="font-semibold text-gray-800">{section.heading}</h4>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-gray-700">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <h4 className="font-semibold text-gray-800">{plan.technical.heading}</h4>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-gray-700">
                {plan.technical.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-gray-500">Recommended file name: {plan.fileNameHint}</p>
            </div>
            {slot.showSetupPhotos && <SetupPhotos />}
          </div>
        </details>

        <input ref={inputRef} type="file" accept=".mp4,.mov,video/mp4,video/quicktime" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />

        <div className={slot.count > 1 ? "grid gap-4 sm:grid-cols-2" : ""}>
          {rows.map((video, index) => (
            <div key={video?._id ?? `empty-${index}`} className="space-y-2">
              {video ? (
                <>
                  <video
                    src={`${mediaUrl(video.url)}#t=0.1`}
                    controls
                    controlsList="nodownload"
                    preload="metadata"
                    crossOrigin="anonymous"
                    playsInline
                    className="aspect-video w-full rounded-lg bg-black"
                  >
                    {video.captionsUrl && <track kind="subtitles" src={mediaUrl(video.captionsUrl)} srcLang="en" label="English" default />}
                  </video>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600">
                    <span>
                      {formatClock(video.durationSeconds)} · {video.captionsUrl ? "English captions ready" : "captions are being created"}
                    </span>
                    {video.isLocked ? (
                      <span className="flex items-center gap-1 text-amber-700">
                        <Lock className="h-3 w-3" /> Locked until {new Date(video.lockedUntil!).toLocaleDateString()}
                      </span>
                    ) : (
                      <Button type="button" size="sm" variant="outline" disabled={uploading || !consentOk} onClick={() => pick(slot.count > 1 ? video._id : undefined)}>
                        <RefreshCw className="mr-1 h-3 w-3" /> Replace
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  disabled={uploading || !consentOk}
                  onClick={() => pick()}
                  className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-8 text-sm text-gray-600 transition hover:border-yellow-500 hover:bg-yellow-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Upload className="h-6 w-6" />
                  <span className="font-medium">{slot.count > 1 ? `Choose highlight video ${index + 1}` : "Choose your video"}</span>
                  <span className="text-xs">MP4 or MOV, up to {plan.limits.maxMegabytes} MB</span>
                </button>
              )}
            </div>
          ))}
        </div>

        {!consentOk && <p className="text-sm text-amber-700">Please tick the confirmations above before uploading.</p>}

        {upload && (
          <div role="progressbar" aria-valuenow={upload.percent} aria-valuemin={0} aria-valuemax={100} className="space-y-1">
            <div className="h-2 w-full overflow-hidden rounded bg-gray-200">
              <div
                className={`h-full bg-yellow-400 transition-all ${upload.stage === "uploading" ? "" : "animate-pulse"}`}
                style={{ width: `${upload.percent}%` }}
              />
            </div>
            {upload.stage === "uploading" && upload.retryAt ? (
              <RetryNotice retryAt={upload.retryAt} done={formatProgressBytes(upload.loadedBytes, upload.totalBytes)} />
            ) : upload.stage === "uploading" ? (
              <p className="text-xs text-gray-600">
                Uploading… {upload.percent}% · {formatProgressBytes(upload.loadedBytes, upload.totalBytes)}
                {upload.bytesPerSecond > 0 && <> · {formatSpeed(upload.bytesPerSecond)}</>} · {formatTimeLeft(upload.secondsLeft)}
              </p>
            ) : (
              <p className="text-xs text-gray-600">
                {upload.stage === "checking" ? "Upload complete. Checking your video (length, quality, sound)…" : "Saving your video…"}
              </p>
            )}
            {upload.resumedFromBytes !== null && upload.stage === "uploading" && (
              <p className="text-xs text-green-700">
                Continuing your earlier upload of this file from {formatProgressBytes(upload.resumedFromBytes, upload.totalBytes).split(" of ")[0]} MB.
              </p>
            )}
            <p className="text-xs text-gray-500">
              You can keep using the website while it uploads. If the connection drops, the upload continues by itself. If you
              close this tab, choose the same file again to continue where it stopped.
            </p>
          </div>
        )}
        {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      </CardContent>
    </Card>
  );
}
