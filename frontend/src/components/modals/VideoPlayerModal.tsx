"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Loader2,
} from "lucide-react";
import { Video } from "@/types/user";
import { cn } from "@/lib/utils";

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videos: Video[];
  initialVideoIndex?: number;
  candidateName?: string;
}

export default function VideoPlayerModal({
  isOpen,
  onClose,
  videos,
  initialVideoIndex = 0,
  candidateName = "Candidate",
}: VideoPlayerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialVideoIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentVideo = useMemo(
    () => videos[currentIndex],
    [videos, currentIndex]
  );

  // Utility functions
  const formatTime = useCallback((seconds: number): string => {
    if (!isFinite(seconds) || isNaN(seconds)) return "0:00";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const getVideoUrl = useCallback((video: Video): string => {
    if (!video?.url) return "";

    if (video.url.startsWith("http")) {
      return video.url;
    }
    return `${process.env.NEXT_PUBLIC_BASE_URL}/${video.url}`;
  }, []);

  const videoUrl = useMemo(
    () => getVideoUrl(currentVideo),
    [currentVideo, getVideoUrl]
  );

  // Event handlers
  const handlePlayPause = useCallback(() => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch((error) => {
        console.error("Error playing video:", error);
      });
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleMuteUnmute = useCallback(() => {
    if (!videoRef.current) return;

    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleFullscreen = useCallback(() => {
    if (!videoRef.current) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;

    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;

    if (!isNaN(current) && !isNaN(total) && total > 0) {
      setCurrentTime(current);
      setProgress((current / total) * 100);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (!videoRef.current) return;

    setDuration(videoRef.current.duration);
    setIsLoading(false);
  }, []);

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!videoRef.current || !duration) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, clickX / rect.width));
      const newTime = percentage * duration;

      videoRef.current.currentTime = newTime;
      setProgress(percentage * 100);
      setCurrentTime(newTime);
    },
    [duration]
  );

  const handleVideoError = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
      console.error("Video loading error:", {
        currentVideo,
        videoUrl,
        error: e,
        videoElement: videoRef.current,
      });
      setIsLoading(false);
    },
    [currentVideo, videoUrl]
  );

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : videos.length - 1));
  }, [videos.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < videos.length - 1 ? prev + 1 : 0));
  }, [videos.length]);

  // Effects
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    }
  }, [currentIndex, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialVideoIndex);
    }
  }, [isOpen, initialVideoIndex]);

  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          handlePlayPause();
          break;
        case "ArrowLeft":
          if (videos.length > 1) {
            e.preventDefault();
            goToPrevious();
          }
          break;
        case "ArrowRight":
          if (videos.length > 1) {
            e.preventDefault();
            goToNext();
          }
          break;
        case "m":
          e.preventDefault();
          handleMuteUnmute();
          break;
        case "f":
          e.preventDefault();
          handleFullscreen();
          break;
        case "Escape":
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    isOpen,
    videos.length,
    handlePlayPause,
    handleMuteUnmute,
    handleFullscreen,
    goToPrevious,
    goToNext,
    onClose,
  ]);

  if (!currentVideo) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-full p-0 overflow-hidden bg-black/95 border-gray-800 max-h-[95vh] overflow-y-auto">
        <DialogHeader className="px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 pb-2 bg-linear-to-b from-black/80 to-transparent sticky top-0 z-10">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-white text-base sm:text-lg md:text-xl font-semibold truncate">
                {candidateName}&apos;s Videos
              </DialogTitle>
              <p className="text-gray-400 text-xs sm:text-sm mt-1 truncate">
                {currentVideo?.title || `Video ${currentIndex + 1}`}
              </p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 hover:text-white shrink-0 h-8 w-8 sm:h-10 sm:w-10"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Video Player Container */}
        <div className="relative bg-black">
          {/* Video Element */}
          <div className="relative aspect-video bg-black">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-12 w-12 text-white animate-spin" />
              </div>
            )}
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              onClick={handlePlayPause}
              onError={handleVideoError}
              crossOrigin="anonymous"
              playsInline
              preload="metadata"
              aria-label={currentVideo?.title || `Video ${currentIndex + 1}`}
            />

            {/* Play/Pause Overlay */}
            {!isPlaying && !isLoading && (
              <div
                className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/20 hover:bg-black/30 transition-colors z-10"
                onClick={handlePlayPause}
              >
                <div className="bg-white/90 rounded-full p-4 sm:p-6 hover:bg-white transition-colors shadow-2xl">
                  <Play
                    className="h-8 w-8 sm:h-12 sm:w-12 text-black ml-0.5"
                    fill="black"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Video Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/90 to-transparent p-2 sm:p-3 md:p-4 space-y-1.5 sm:space-y-2">
            {/* Progress Bar */}
            <div
              className="w-full h-1 sm:h-1.5 bg-white/30 rounded-full cursor-pointer group hover:h-2 transition-all"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-yellow-400 rounded-full relative transition-all"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  onClick={handlePlayPause}
                  size="icon"
                  variant="ghost"
                  className="text-white hover:bg-white/10 h-7 w-7 sm:h-9 sm:w-9"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Play className="h-4 w-4 sm:h-5 sm:w-5" fill="white" />
                  )}
                </Button>

                <Button
                  onClick={handleMuteUnmute}
                  size="icon"
                  variant="ghost"
                  className="text-white hover:bg-white/10 h-7 w-7 sm:h-9 sm:w-9"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </Button>

                <span className="text-white text-xs sm:text-sm ml-1 sm:ml-2 hidden xs:inline">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <Button
                onClick={handleFullscreen}
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/10 h-7 w-7 sm:h-9 sm:w-9"
              >
                <Maximize className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation Arrows */}
          {videos.length > 1 && (
            <>
              <Button
                onClick={goToPrevious}
                size="icon"
                variant="ghost"
                className="absolute left-1 sm:left-2 md:left-4 top-1/2 -translate-y-1/2 text-white hover:text-white bg-black/50 hover:bg-black/70 h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full z-20"
                aria-label="Previous video"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>

              <Button
                onClick={goToNext}
                size="icon"
                variant="ghost"
                className="absolute right-1 sm:right-2 md:right-4 top-1/2 -translate-y-1/2 text-white hover:text-white bg-black/50 hover:bg-black/70 h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full z-20"
                aria-label="Next video"
              >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            </>
          )}
        </div>

        {/* Video Thumbnails Slider */}
        {videos.length > 1 && (
          <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 bg-black/80 border-t border-gray-800">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <span className="text-gray-400 text-xs sm:text-sm font-medium whitespace-nowrap">
                {currentIndex + 1} / {videos.length}
              </span>
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-900/50">
                {videos.map((video, index) => (
                  <button
                    key={video._id}
                    onClick={() => setCurrentIndex(index)}
                    className={cn(
                      "shrink-0 relative rounded-lg overflow-hidden transition-all border-2",
                      currentIndex === index
                        ? "border-yellow-400"
                        : "border-gray-700 hover:border-gray-500"
                    )}
                  >
                    <div className="w-20 h-14 sm:w-22 sm:h-14 bg-gray-800 flex items-center justify-center">
                      <Play
                        className={cn(
                          "h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6",
                          currentIndex === index
                            ? "text-yellow-400"
                            : "text-gray-500"
                        )}
                      />
                    </div>
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex items-end p-1 sm:p-2">
                      <span className="text-white text-[10px] sm:text-xs font-medium truncate w-full">
                        {video.title || `Video ${index + 1}`}
                      </span>
                    </div>
                    {currentIndex === index && (
                      <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 bg-yellow-400 text-black text-[9px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded-full font-semibold">
                        Now
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
