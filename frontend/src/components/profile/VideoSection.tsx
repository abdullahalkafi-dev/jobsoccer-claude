"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Play } from "lucide-react";
import { useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { renderCaptionTracks } from "@/features/video/captionTracks";

interface Video {
  _id: string;
  url: string;
  title?: string;
  durationSeconds: number;
  uploadedAt: string;
  kind?: string;
  /** Public path of the English captions (WebVTT); `captions` / `captionTracks` add Spanish and French. */
  captionsUrl?: string;
  captions?: Partial<Record<"en" | "es" | "fr", string>> | null;
  captionTracks?: { lang: "en" | "es" | "fr"; label: string; url: string }[];
}

interface VideoSectionProps {
  videos?: Video[];
  userId?: string;
  readOnly?: boolean;
}

export default function VideoSection({
  videos = [],
  readOnly = false,
}: VideoSectionProps) {
  const t = useTranslations("profile.videos");
  const locale = useLocale();
  const getVideoUrl = useCallback((video: Video): string => {
    if (!video?.url) return "";

    if (video.url.startsWith("http")) {
      return video.url;
    }
    return `${process.env.NEXT_PUBLIC_BASE_URL}/${video.url}`;
  }, []);

  return (
    <Card>
      <CardContent>
        {videos.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Play className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t("emptyTitle")}
            </h3>
            <p className="text-gray-600">
              {readOnly
                ? t("emptyReadOnly")
                : t("emptyOwner")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {videos.map((video) => {
              const videoUrl = getVideoUrl(video);

              return (
                <div key={video._id} className="relative group flex flex-col justify-between">
                  <CardTitle className="my-2">
                    {video?.kind ? t("kindVideo", { kind: video.kind }) : t("video")}
                  </CardTitle>
                  <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                    {/* Video Player */}
                    <video
                      key={locale}
                      src={`${videoUrl}#t=0.1`}
                      controls
                      controlsList="nodownload"
                      className="w-full h-full object-contain"
                      preload="metadata"
                      crossOrigin="anonymous"
                      playsInline
                      onError={(e) => {
                        console.error("Video load error:", {
                          video,
                          videoUrl,
                          error: e,
                        });
                      }}
                      aria-label={video.title || t("video")}
                    >
                      {renderCaptionTracks(video, locale, (path) => getVideoUrl({ ...video, url: path }))}
                      {t("noSupport")}
                    </video>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
