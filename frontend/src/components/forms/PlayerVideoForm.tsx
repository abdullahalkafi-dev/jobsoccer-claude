"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormLayout } from "@/components/form/FormLayout";
import { IndividualVideoUpload } from "../form/fields/IndividualVideoUpload";
import { videoSchema } from "@/shchemas/profileValidation";
import { IVideoFormProps, TVideo } from "@/types/profile";
import { Input } from "@/components/ui/input";
import { FormItem, FormLabel, FormControl, Form } from "@/components/ui/form";

export function PlayerVideoForm({
  onNext,
  onPrev,
  initialData,
  steps,
  isLoading,
}: IVideoFormProps) {
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const form = useForm<TVideo>({
    resolver: zodResolver(videoSchema),
    defaultValues: initialData,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = form;

  // State for videos and their titles
  const [video1, setVideo1] = useState<File | null>(
    initialData?.videos?.[0] || null,
  );
  const [video2, setVideo2] = useState<File | null>(
    initialData?.videos?.[1] || null,
  );
  const initialDataWithTitles = initialData as Partial<{
    videos: File[];
    videoTitles: string[];
  }>;
  const [videoTitle1, setVideoTitle1] = useState<string>(
    initialDataWithTitles?.videoTitles?.[0] || "",
  );
  const [videoTitle2, setVideoTitle2] = useState<string>(
    initialDataWithTitles?.videoTitles?.[1] || "",
  );

  // Update form videos array whenever videos change
  useEffect(() => {
    const videoArray = [video1, video2].filter(
      (video): video is File => video !== null,
    );
    setValue("videos", videoArray, { shouldValidate: true });
  }, [video1, video2, setValue]);

  const onSubmit = (data: TVideo) => {
    setHasSubmitted(true);

    // Create arrays for videos and videoTitles
    const videos: File[] = [];
    const videoTitles: string[] = [];

    if (video1) {
      videos.push(video1);
      videoTitles.push(videoTitle1.trim() || video1.name);
    }

    if (video2) {
      videos.push(video2);
      videoTitles.push(videoTitle2.trim() || video2.name);
    }

    // Pass formatted data (no videoMeta for player roles)
    onNext({
      ...data,
      videos,
      videoTitles,
    } as TVideo & {
      videos?: File[];
      videoTitles?: string[];
    });
  };

  // Check if all required videos are uploaded
  const hasAllRequiredVideos = video1 !== null && video2 !== null;

  return (
    <FormLayout
      steps={steps}
      onNext={handleSubmit(onSubmit)}
      onPrev={onPrev}
      showPrev={true}
      nextLabel="Complete"
      isNextDisabled={!hasAllRequiredVideos}
      isLoading={isLoading}
    >
      <Form {...form}>
        <form className="space-y-8">
          <div className="space-y-6">
            {/* Video 1 - Required */}
            <div className="space-y-4">
              <IndividualVideoUpload
                label="Highlight Video 1"
                description="Upload your first highlight video"
                required={true}
                maxDuration={180}
                value={video1}
                onChange={(file) => setVideo1(file)}
                error={
                  hasSubmitted && errors.videos && !video1
                    ? "This video is required"
                    : undefined
                }
              />
              {video1 && (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Video Title 1
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., My First Highlight"
                      value={videoTitle1}
                      onChange={(e) => setVideoTitle1(e.target.value)}
                      className="bg-gray-100 border-gray-200"
                    />
                  </FormControl>
                  <p className="text-sm text-gray-500">
                    Optional: Add a custom title for this video
                  </p>
                </FormItem>
              )}
            </div>

            {/* Video 2 - Required */}
            <div className="space-y-4">
              <IndividualVideoUpload
                label="Highlight Video 2"
                description="Upload your second highlight video"
                required={true}
                maxDuration={180}
                value={video2}
                onChange={(file) => setVideo2(file)}
                error={
                  hasSubmitted && errors.videos && !video2
                    ? "This video is required"
                    : undefined
                }
              />
              {video2 && (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Video Title 2
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Best Goals Compilation"
                      value={videoTitle2}
                      onChange={(e) => setVideoTitle2(e.target.value)}
                      className="bg-gray-100 border-gray-200"
                    />
                  </FormControl>
                  <p className="text-sm text-gray-500">
                    Optional: Add a custom title for this video
                  </p>
                </FormItem>
              )}
            </div>
          </div>
        </form>
      </Form>
    </FormLayout>
  );
}
