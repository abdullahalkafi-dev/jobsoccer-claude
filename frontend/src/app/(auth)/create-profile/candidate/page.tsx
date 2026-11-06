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
} from "@/types/profile";
import { AmateurPlayerProfessionalInfoForm } from "@/components/forms/AmateurPlayerProfessionalInfoForm";
import { ProfessionalPlayerProfessionalInfoForm } from "@/components/forms/ProfessionalPlayerProfessionalInfoForm";
import { HighSchoolPlayerProfessionalInfoForm } from "@/components/forms/HighSchoolPlayerProfessionalInfoForm";
import { CollegeOrUniversityPlayerProfessionalInfoForm } from "@/components/forms/CollegeOrUniversityPlayerProfessionalInfoForm";
import { FieldStaffProfessionalInfoForm } from "@/components/forms/FieldStaffProfessionalInfoForm";
import { OfficeStaffProfessionalInfoForm } from "@/components/forms/OfficeStaffProfessionalInfoForm";
import { useAppSelector } from "@/redux/hooks";
import { Spinner } from "@/components/ui/spinner";
import { useCreateUserProfileMutation } from "@/redux/features/user/userApi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IoMdArrowBack } from "react-icons/io";
import { removeEmptyFields } from "@/lib/utils";
import { VideoUploadStep } from "@/features/video/VideoUploadStep";

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
}

/** Multipart body for POST /profile: the details as JSON plus the profile photo. */
const buildProfileForm = (data: FormData): globalThis.FormData => {
  const combined = { ...(data.personalInfo ?? {}), ...(data.professionalInfo ?? {}) };
  const imageFile = combined.image instanceof File ? combined.image : null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { image, ...withoutImage } = combined;

  const form = new globalThis.FormData();
  form.append("data", JSON.stringify(removeEmptyFields(withoutImage) ?? {}));
  if (imageFile) form.append("image", imageFile);
  return form;
};

export default function CandidateProfilePage() {
  const user = useAppSelector((state) => state.auth.user);
  // A candidate who already saved the profile but left before uploading videos continues at the video step.
  const [currentStep, setCurrentStep] = useState(user?.profileId ? 3 : 1);
  const [formData, setFormData] = useState<FormData>({});

  const [createUserProfile] = useCreateUserProfileMutation();
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

  /** Step 2 saves the profile (photo + details). Videos come next, one at a time. */
  const handleProfessionalInfoNext = async (data: ProfessionalInfo) => {
    setFormData((prev) => ({ ...prev, professionalInfo: data }));
    try {
      const response = await createUserProfile(buildProfileForm({ ...formData, professionalInfo: data }));
      if ("error" in response) {
        const data = (response.error as { data?: { message?: string; errorSources?: { message?: string }[] } })?.data;
        const detail = data?.errorSources?.[0]?.message ?? data?.message;
        toast.error(detail ?? "Could not save your profile. Please check the details and try again.");
        return;
      }
      setCurrentStep(3);
    } catch (error) {
      toast.error("An error occurred while saving your profile.");
      console.error("Profile creation error:", error);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
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
      {currentStep === 3 && (
        <VideoUploadStep
          steps={steps}
          onFinish={() => {
            toast.success("Profile completed successfully!");
            router.push("/");
          }}
        />
      )}
    </div>
  );
}
