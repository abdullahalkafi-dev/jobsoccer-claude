"use client";

import { useRef, useState } from "react";
import { Lock, RefreshCw, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { baseApi } from "@/redux/api/baseApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { GuideQuestions } from "@/components/questions/GuideQuestions";
import { SetupPhotos } from "./SetupPhotos";
import { checkVideoFile, formatClock } from "./checkVideoFile";
import { uploadVideo } from "./uploadVideo";
import type { TStoredVideo, TVideoPlan, TVideoSlot } from "./types";

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
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rows = Array.from({ length: slot.count }, (_, index) => videos[index] ?? null);
  const uploading = progress !== null;

  const pick = (replaceVideoId?: string) => {
    targetRef.current = { replaceVideoId };
    inputRef.current?.click();
  };

  const handleFile = async (file: File | undefined) => {
    if (!file || !token) return;
    setError(null);
    const check = await checkVideoFile(file, {
      maxSeconds: slot.maxSeconds,
      maxMegabytes: plan.limits.maxMegabytes,
      minShortSide: plan.limits.minShortSide,
    });
    if (!check.ok) return setError(check.message);

    setProgress(0);
    try {
      await uploadVideo({ token, kind: slot.kind, file, replaceVideoId: targetRef.current.replaceVideoId, onProgress: setProgress });
      dispatch(baseApi.util.invalidateTags(["Video", "User", "ProfileQuality"]));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "The upload failed.");
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
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

        {slot.kind === "Interview" && plan.position && <GuideQuestions position={plan.position} />}

        <details className="rounded-lg bg-gray-50 p-3 text-sm" open={!rows.some(Boolean)}>
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

        {uploading && (
          <div role="progressbar" aria-valuenow={progress ?? 0} aria-valuemin={0} aria-valuemax={100} className="space-y-1">
            <div className="h-2 w-full overflow-hidden rounded bg-gray-200">
              <div className="h-full bg-yellow-400 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-gray-600">{progress === 100 ? "Checking your video…" : `Uploading… ${progress}%`}</p>
          </div>
        )}
        {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      </CardContent>
    </Card>
  );
}
