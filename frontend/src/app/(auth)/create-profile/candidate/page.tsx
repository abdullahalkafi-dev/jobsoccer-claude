"use client";

import React, { useState, useMemo } from "react";
import { PersonalInfoForm } from "@/components/forms/PersonalInfoForm";
import { toast } from "sonner";
import {
  type TPersonalInfo,
  type TProfessionalPlayerProfessionalInfo,
  type TAmateurPlayerProfessionalInfo,
  type THighSchoolPlayerProfessionalInfo,
  type TCollegeOrUniversityPlayerProfessionalInfo,
  type TOfficeStaffProfessionalInfo,
  type TFieldStaffProfessionalInfo,
  CandidateRole,
  TVideo,
} from "@/types/profile";
import { AmateurPlayerProfessionalInfoForm } from "@/components/forms/AmateurPlayerProfessionalInfoForm";
import { ProfessionalPlayerProfessionalInfoForm } from "@/components/forms/ProfessionalPlayerProfessionalInfoForm";
import { HighSchoolPlayerProfessionalInfoForm } from "@/components/forms/HighSchoolPlayerProfessionalInfoForm";
import { CollegeOrUniversityPlayerProfessionalInfoForm } from "@/components/forms/CollegeOrUniversityPlayerProfessionalInfoForm";
import { FieldStaffProfessionalInfoForm } from "@/components/forms/FieldStaffProfessionalInfoForm";
import { OfficeStaffProfessionalInfoForm } from "@/components/forms/OfficeStaffProfessionalInfoForm";
import { useAppSelector } from "@/redux/hooks";
import { Spinner } from "@/components/ui/spinner";
import { FieldStaffPosition, VideoType } from "@/constants/video.constant";
import { useCreateUserProfileMutation } from "@/redux/features/user/userApi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IoMdArrowBack } from "react-icons/io";
import { HeadCoachVideoForm } from "@/components/forms/HeadCoachVideoForm";
import { GKCoachVideoForm } from "@/components/forms/GKCoachVideoForm";
import { SpecificCoachVideoForm } from "@/components/forms/SpecificCoachVideoForm";
import { ScoutVideoForm } from "@/components/forms/ScoutVideoForm";
import { TechnicalDirectorVideoForm } from "@/components/forms/TechnicalDirectorVideoForm";
import { AcademyDirectorVideoForm } from "@/components/forms/AcademyDirectorVideoForm";
import { DirectorOfCoachingVideoForm } from "@/components/forms/DirectorOfCoachingVideoForm";
import { OfficeStaffVideoForm } from "@/components/forms/OfficeStaffVideoForm";
import { PlayerVideoForm } from "@/components/forms/PlayerVideoForm";
import { removeEmptyFields } from "@/lib/utils";

type ProfessionalInfo =
  | TAmateurPlayerProfessionalInfo
  | TProfessionalPlayerProfessionalInfo
  | THighSchoolPlayerProfessionalInfo
  | TCollegeOrUniversityPlayerProfessionalInfo
  | TOfficeStaffProfessionalInfo
  | TFieldStaffProfessionalInfo;

interface FormData {
  personalInfo?: TPersonalInfo;
  professionalInfo?: ProfessionalInfo;
  videos?: TVideo;
}

interface VideoFormData {
  videos?: File[];
  videoTitles?: string[];
  videoMeta?: Array<{
    type: VideoType;
    title?: string;
    description?: string;
  }>;
}

const PLAYER_ROLES = [
  CandidateRole.PROFESSIONAL_PLAYER,
  CandidateRole.AMATEUR_PLAYER,
  CandidateRole.HIGH_SCHOOL,
  CandidateRole.COLLEGE_UNIVERSITY,
] as const;

export default function CandidateProfilePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({});
  const [fieldStaffPosition, setFieldStaffPosition] = useState<string>("");

  const user = useAppSelector((state) => state.auth.user);
  const [createUserProfile, { isLoading }] = useCreateUserProfileMutation();
  const router = useRouter();

  const userRole = user?.role as CandidateRole;

  const steps = useMemo(
    () => [
      {
        id: 1,
        label: "Step 1",
        completed: currentStep > 1,
        active: currentStep === 1,
      },
      {
        id: 2,
        label: "Step 2",
        completed: currentStep > 2,
        active: currentStep === 2,
      },
      {
        id: 3,
        label: "Step 3",
        completed: currentStep > 3,
        active: currentStep === 3,
      },
    ],
    [currentStep],
  );

  if (!userRole) {
    return (
      <div className="grid h-screen w-full place-items-center">
        <Spinner className="size-8 text-yellow-500" />
      </div>
    );
  }

  const handlePersonalInfoNext = (data: TPersonalInfo) => {
    setFormData((prev) => ({ ...prev, personalInfo: data }));
    setCurrentStep(2);
  };

  const handleProfessionalInfoNext = (data: ProfessionalInfo) => {
    setFormData((prev) => ({ ...prev, professionalInfo: data }));
    setFieldStaffPosition((data as TFieldStaffProfessionalInfo).position || "");
    setCurrentStep(3);
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const prepareFormData = (videoData: VideoFormData) => {
    const combinedData = {
      ...(formData.personalInfo ?? {}),
      ...(formData.professionalInfo ?? {}),
    };

    const imageFile =
      combinedData.image instanceof File ? combinedData.image : null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { image, ...dataWithoutImage } = combinedData;
    const cleanedData = removeEmptyFields(dataWithoutImage) ?? {};

    const formDataToSend = new FormData();
    formDataToSend.append("data", JSON.stringify(cleanedData));

    if (imageFile) {
      formDataToSend.append("image", imageFile);
    }

    // Handle video titles for player roles
    if (videoData.videoTitles && Array.isArray(videoData.videoTitles)) {
      formDataToSend.append(
        "videoTitles",
        JSON.stringify(videoData.videoTitles),
      );
    } else if (videoData.videoMeta) {
      // Handle video metadata for staff roles
      const cleanedVideoMeta = videoData.videoMeta
        .map((vm) => {
          const metadata: Record<string, unknown> = { type: vm.type };
          if (vm.title?.trim()) metadata.title = vm.title.trim();
          if (vm.description?.trim())
            metadata.description = vm.description.trim();
          return metadata;
        })
        .filter((vm) => Object.keys(vm).length > 0);

      if (cleanedVideoMeta.length > 0) {
        formDataToSend.append("videoMeta", JSON.stringify(cleanedVideoMeta));
      }
    }

    // Append video files
    if (videoData.videos) {
      videoData.videos.forEach((video) => {
        formDataToSend.append("videos", video);
      });
    }

    return formDataToSend;
  };

  const handleVideoNext = async (data: TVideo) => {
    try {
      const videoData = data as VideoFormData;
      setFormData((prev) => ({ ...prev, videos: data }));

      const formDataToSend = prepareFormData(videoData);
      const { data: userProfile } = await createUserProfile(formDataToSend);

      if (userProfile?.data.profileId) {
        toast.success("Profile completed successfully!");
        router.push("/");
      } else {
        toast.error("Failed to create profile. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred while creating your profile.");
      console.error("Profile creation error:", error);
    }
  };

  const renderProfessionalForm = () => {
    const baseProps = {
      onNext: handleProfessionalInfoNext,
      onPrev: handlePrevStep,
      steps,
    } as const;

    switch (userRole) {
      // Professional Player
      case CandidateRole.PROFESSIONAL_PLAYER:
        return (
          <ProfessionalPlayerProfessionalInfoForm
            {...baseProps}
            initialData={
              formData.professionalInfo as
                | TProfessionalPlayerProfessionalInfo
                | undefined
            }
          />
        );

      // Amateur Player
      case CandidateRole.AMATEUR_PLAYER:
        return (
          <AmateurPlayerProfessionalInfoForm
            {...baseProps}
            initialData={
              formData.professionalInfo as
                | TAmateurPlayerProfessionalInfo
                | undefined
            }
          />
        );

      // High School Player
      case CandidateRole.HIGH_SCHOOL:
        return (
          <HighSchoolPlayerProfessionalInfoForm
            {...baseProps}
            initialData={
              formData.professionalInfo as
                | THighSchoolPlayerProfessionalInfo
                | undefined
            }
          />
        );

      // College/University Player
      case CandidateRole.COLLEGE_UNIVERSITY:
        return (
          <CollegeOrUniversityPlayerProfessionalInfoForm
            {...baseProps}
            initialData={
              formData.professionalInfo as
                | TCollegeOrUniversityPlayerProfessionalInfo
                | undefined
            }
          />
        );

      // On Field Staff
      case CandidateRole.ON_FIELD_STAFF:
        return (
          <FieldStaffProfessionalInfoForm
            {...baseProps}
            initialData={
              formData.professionalInfo as
                | TFieldStaffProfessionalInfo
                | undefined
            }
          />
        );

      // Office Staff
      case CandidateRole.OFFICE_STAFF:
        return (
          <OfficeStaffProfessionalInfoForm
            {...baseProps}
            initialData={
              formData.professionalInfo as
                | TOfficeStaffProfessionalInfo
                | undefined
            }
          />
        );

      default:
        return null;
    }
  };

  const renderVideoForm = () => {
    const baseVideoProps = {
      onNext: handleVideoNext as (data: TVideo) => void,
      onPrev: handlePrevStep,
      initialData: formData.videos,
      steps,
      isLoading,
    };

    // Player roles
    if (PLAYER_ROLES.includes(userRole as (typeof PLAYER_ROLES)[number])) {
      return <PlayerVideoForm {...baseVideoProps} />;
    }

    // Office staff
    if (userRole === CandidateRole.OFFICE_STAFF) {
      return <OfficeStaffVideoForm {...baseVideoProps} />;
    }

    // On Field staff positions
    switch (fieldStaffPosition) {
      case FieldStaffPosition.HEAD_COACH:
      case FieldStaffPosition.ASSISTANT_COACH:
        return (
          <HeadCoachVideoForm
            {...baseVideoProps}
            fieldStaffPosition={
              fieldStaffPosition as
                | FieldStaffPosition.HEAD_COACH
                | FieldStaffPosition.ASSISTANT_COACH
            }
          />
        );

      case FieldStaffPosition.GK_COACH:
      case FieldStaffPosition.MENTAL_COACH:
      case FieldStaffPosition.VIDEO_ANALYST_COACH:
        return (
          <GKCoachVideoForm
            {...baseVideoProps}
            fieldStaffPosition={
              fieldStaffPosition as
                | FieldStaffPosition.GK_COACH
                | FieldStaffPosition.MENTAL_COACH
                | FieldStaffPosition.VIDEO_ANALYST_COACH
            }
          />
        );

      case FieldStaffPosition.SPECIFIC_OFFENSIVE_COACH:
      case FieldStaffPosition.SPECIFIC_DEFENSIVE_COACH:
      case FieldStaffPosition.SPECIFIC_TECHNICAL_COACH:
        return (
          <SpecificCoachVideoForm
            {...baseVideoProps}
            fieldStaffPosition={
              fieldStaffPosition as
                | FieldStaffPosition.SPECIFIC_OFFENSIVE_COACH
                | FieldStaffPosition.SPECIFIC_DEFENSIVE_COACH
                | FieldStaffPosition.SPECIFIC_TECHNICAL_COACH
            }
          />
        );

      case FieldStaffPosition.SCOUT:
        return (
          <ScoutVideoForm
            {...baseVideoProps}
            fieldStaffPosition={fieldStaffPosition as FieldStaffPosition.SCOUT}
          />
        );

      case FieldStaffPosition.TECHNICAL_DIRECTOR:
        return (
          <TechnicalDirectorVideoForm
            {...baseVideoProps}
            fieldStaffPosition={
              fieldStaffPosition as FieldStaffPosition.TECHNICAL_DIRECTOR
            }
          />
        );

      case FieldStaffPosition.ACADEMY_DIRECTOR:
        return (
          <AcademyDirectorVideoForm
            {...baseVideoProps}
            fieldStaffPosition={
              fieldStaffPosition as FieldStaffPosition.ACADEMY_DIRECTOR
            }
          />
        );

      case FieldStaffPosition.DIRECTOR_OF_COACHING:
        return (
          <DirectorOfCoachingVideoForm
            {...baseVideoProps}
            fieldStaffPosition={
              fieldStaffPosition as FieldStaffPosition.DIRECTOR_OF_COACHING
            }
          />
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-md bg-black hover:bg-gray-800 text-white hover:text-white shadow-md hover:shadow-lg transition-all duration-300 z-10 group font-medium"
      >
        <IoMdArrowBack className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
        <span className="text-sm">Home</span>
      </Link>

      {currentStep === 1 && (
        <PersonalInfoForm
          onNext={handlePersonalInfoNext}
          initialData={formData.personalInfo}
          steps={steps}
        />
      )}
      {currentStep === 2 && renderProfessionalForm()}
      {currentStep === 3 && renderVideoForm()}
    </div>
  );
}
