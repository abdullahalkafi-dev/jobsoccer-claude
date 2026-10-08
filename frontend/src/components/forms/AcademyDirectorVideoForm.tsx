"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormLayout } from "@/components/form/FormLayout";
import { IndividualVideoUpload } from "../form/fields/IndividualVideoUpload";
import { CoachingQuestions } from "../questions/CoachingQuestions";
import { FieldStaffPosition, VideoType } from "@/constants/video.constant";
import { videoSchema } from "@/shchemas/profileValidation";
import { IVideoFormProps, IVideoMap, TVideo } from "@/types/profile";

export function AcademyDirectorVideoForm({
  onNext,
  onPrev,
  initialData,
  steps,
  isLoading,
  fieldStaffPosition,
}: IVideoFormProps & {
  fieldStaffPosition: FieldStaffPosition.ACADEMY_DIRECTOR;
}) {
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TVideo>({
    resolver: zodResolver(videoSchema),
    defaultValues: initialData,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  // Maintain a map of video types to files
  const [videoMap, setVideoMap] = useState<IVideoMap>(() => {
    // Initialize from initialData if available
    if (initialData?.videos && initialData.videos.length > 0) {
      return {
        [VideoType.PRE_RECORDED_INTERVIEW]: initialData.videos[0] || null,
        [VideoType.YOUTH_DEVELOPMENT_METHODOLOGY]:
          initialData.videos[1] || null,
      };
    }
    return {
      [VideoType.PRE_RECORDED_INTERVIEW]: null,
      [VideoType.YOUTH_DEVELOPMENT_METHODOLOGY]: null,
    };
  });

  // Update form videos array whenever videoMap changes
  useEffect(() => {
    const videoArray = Object.values(videoMap).filter(
      (video): video is File => video !== null,
    );
    setValue("videos", videoArray, { shouldValidate: true });
  }, [videoMap, setValue]);

  const onSubmit = (data: TVideo) => {
    setHasSubmitted(true);

    // Create ordered arrays for videos and videoMeta based on videoMap
    const videoMeta: Array<{
      type: VideoType;
      title: string;
      description: string;
    }> = [];
    const videos: File[] = [];

    // Maintain specific order
    const orderedVideoTypes = [
      VideoType.PRE_RECORDED_INTERVIEW,
      VideoType.YOUTH_DEVELOPMENT_METHODOLOGY,
    ];

    orderedVideoTypes.forEach((videoType) => {
      const file = videoMap[videoType];
      if (file) {
        // Use file name as the title and leave description empty for now.
        videoMeta.push({ type: videoType, title: file.name, description: "" });
        videos.push(file);
      }
    });

    // Pass formatted data with videoMeta array and videos
    onNext({
      ...data,
      videoMeta,
      videos,
    } as TVideo & {
      videoMeta?: Array<{
        type: VideoType;
        title: string;
        description: string;
      }>;
      videos?: File[];
    });
  };

  // Handle individual video changes by video type
  const handleVideoChangeByType = (videoType: VideoType, file: File | null) => {
    setVideoMap((prev) => ({
      ...prev,
      [videoType]: file,
    }));
  };

  // Check if all required videos are uploaded
  const hasAllRequiredVideos =
    videoMap[VideoType.PRE_RECORDED_INTERVIEW] !== null &&
    videoMap[VideoType.YOUTH_DEVELOPMENT_METHODOLOGY] !== null;

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
      <CoachingQuestions fieldStaffPosition={fieldStaffPosition} />
      <form className="space-y-8">
        <div className="space-y-6">
          {/* Video 1 - Required */}
          <IndividualVideoUpload
            label={VideoType.PRE_RECORDED_INTERVIEW}
            description="Upload your pre-recorded interview video"
            required={true}
            maxDuration={420}
            value={videoMap[VideoType.PRE_RECORDED_INTERVIEW]}
            onChange={(file) =>
              handleVideoChangeByType(VideoType.PRE_RECORDED_INTERVIEW, file)
            }
            error={
              hasSubmitted &&
              errors.videos &&
              !videoMap[VideoType.PRE_RECORDED_INTERVIEW]
                ? "This video is required"
                : undefined
            }
          />

          {/* Video 2 - Required */}
          <IndividualVideoUpload
            label={VideoType.YOUTH_DEVELOPMENT_METHODOLOGY}
            description="Upload your youth development methodology video"
            required={true}
            maxDuration={420}
            value={videoMap[VideoType.YOUTH_DEVELOPMENT_METHODOLOGY]}
            onChange={(file) =>
              handleVideoChangeByType(
                VideoType.YOUTH_DEVELOPMENT_METHODOLOGY,
                file,
              )
            }
            error={
              hasSubmitted &&
              errors.videos &&
              !videoMap[VideoType.YOUTH_DEVELOPMENT_METHODOLOGY]
                ? "This video is required"
                : undefined
            }
          />
        </div>
      </form>
    </FormLayout>
  );
}
