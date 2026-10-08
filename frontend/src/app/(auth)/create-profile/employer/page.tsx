/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useAppSelector } from "@/redux/hooks";
import { Spinner } from "@/components/ui/spinner";
import {
  EmployerRole,
  TAcademyEmployerProfile,
  TAgentEmployerProfile,
  TAmateurClubEmployerProfile,
  TCollegeOrUniversityEmployerProfile,
  TConsultingCompanyEmployerProfile,
  THighSchoolEmployerProfile,
  TProfessionalClubEmployerProfile,
} from "@/types/profile";
import { useCreateUserProfileMutation } from "@/redux/features/user/userApi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IoMdArrowBack } from "react-icons/io";
import { AcademyEmployerProfileForm } from "@/components/forms/AcademyEmployerProfileForm";
import { AgentEmployerProfileForm } from "@/components/forms/AgentEmployerProfileForm";
import { AmateurClubEmployerProfileForm } from "@/components/forms/AmateurClubEmployerProfileForm";
import { CollegeOrUniversityEmployerProfileForm } from "@/components/forms/CollegeOrUniversityEmployerProfileForm";
import { ConsultingCompanyEmployerProfileForm } from "@/components/forms/ConsultingCompanyEmployerProfileForm";
import { HighSchoolEmployerProfileForm } from "@/components/forms/HighSchoolEmployerProfileForm";
import { ProfessionalClubEmployerProfileForm } from "@/components/forms/ProfessionalClubEmployerProfileForm";

export default function EmployerProfilePage() {
  const [formData, setFormData] = useState<{
    profileInfo?:
      | TAcademyEmployerProfile
      | TAgentEmployerProfile
      | TAmateurClubEmployerProfile
      | TCollegeOrUniversityEmployerProfile
      | TConsultingCompanyEmployerProfile
      | THighSchoolEmployerProfile
      | TProfessionalClubEmployerProfile;
  }>({});

  const user = useAppSelector((state) => state.auth.user);
  const [createUserProfile, { isLoading }] = useCreateUserProfileMutation();

  const router = useRouter();

  const userRole = user?.role as EmployerRole;
  if (!userRole) {
    return (
      <div className="grid h-screen w-full place-items-center">
        <Spinner className="size-8 text-yellow-500" />
      </div>
    );
  }

  // Recursively removes empty optional fields from an object
  const removeEmptyFields = (input: unknown): unknown => {
    if (input === null || input === undefined) return undefined;

    if (input instanceof Date) return input;

    if (typeof input === "string")
      return input.trim() === "" ? undefined : input;
    if (typeof input === "number" || typeof input === "boolean") return input;

    if (Array.isArray(input)) {
      const cleaned = input
        .map((v) => (typeof v === "object" ? removeEmptyFields(v) : v))
        .filter((v) => v !== undefined && !(typeof v === "string" && v === ""));
      return cleaned.length ? cleaned : undefined;
    }

    if (typeof input === "object") {
      const tag = Object.prototype.toString.call(input);
      if (tag !== "[object Object]") return input;

      const obj = input as Record<string, unknown>;
      const out: Record<string, unknown> = {};
      Object.entries(obj).forEach(([k, v]) => {
        const cleaned = removeEmptyFields(v);
        if (cleaned !== undefined) out[k] = cleaned;
      });
      return Object.keys(out).length ? out : undefined;
    }

    return undefined;
  };

  const handleProfileNext = async (
    data:
      | TAcademyEmployerProfile
      | TAgentEmployerProfile
      | TAmateurClubEmployerProfile
      | TCollegeOrUniversityEmployerProfile
      | TConsultingCompanyEmployerProfile
      | THighSchoolEmployerProfile
      | TProfessionalClubEmployerProfile
  ) => {
    const logoFile =
      "logo" in data && data.logo instanceof File ? data.logo : null;

    const dataWithoutLogo = { ...data };
    if ("logo" in dataWithoutLogo) {
      delete (dataWithoutLogo as { logo?: File }).logo;
    }

    const cleanedData = removeEmptyFields(dataWithoutLogo) ?? {};

    setFormData({ profileInfo: data });

    const formDataToSend = new FormData();
    formDataToSend.append("data", JSON.stringify(cleanedData));

    if (logoFile) {
      formDataToSend.append("image", logoFile);
    }

    const { data: userProfile } = await createUserProfile(formDataToSend);
    if (userProfile?.data.profileId) {
      toast.success("Profile completed successfully!");
      router.push("/");
    } else {
      toast.error("Failed to create profile. Please try again.");
    }
  };

  const renderProfileForm = () => {
    switch (userRole) {
      case EmployerRole.PROFESSIONAL_CLUB:
        return (
          <ProfessionalClubEmployerProfileForm
            onNext={handleProfileNext}
            initialData={formData.profileInfo as any}
            isLoading={isLoading}
          />
        );

      case EmployerRole.ACADEMY:
        return (
          <AcademyEmployerProfileForm
            onNext={handleProfileNext}
            initialData={formData.profileInfo as any}
            isLoading={isLoading}
          />
        );

      case EmployerRole.AGENT:
        return (
          <AgentEmployerProfileForm
            onNext={handleProfileNext}
            initialData={formData.profileInfo as any}
            isLoading={isLoading}
          />
        );

      case EmployerRole.AMATEUR_CLUB:
        return (
          <AmateurClubEmployerProfileForm
            onNext={handleProfileNext}
            initialData={formData.profileInfo as any}
            isLoading={isLoading}
          />
        );

      case EmployerRole.COLLEGE_UNIVERSITY:
        return (
          <CollegeOrUniversityEmployerProfileForm
            onNext={handleProfileNext}
            initialData={formData.profileInfo as any}
            isLoading={isLoading}
          />
        );

      case EmployerRole.CONSULTING_COMPANY:
        return (
          <ConsultingCompanyEmployerProfileForm
            onNext={handleProfileNext}
            initialData={formData.profileInfo as any}
            isLoading={isLoading}
          />
        );

      case EmployerRole.HIGH_SCHOOL:
        return (
          <HighSchoolEmployerProfileForm
            onNext={handleProfileNext}
            initialData={formData.profileInfo as any}
            isLoading={isLoading}
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

      {renderProfileForm()}
    </div>
  );
}
