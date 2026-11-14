"use client";

import FindYourDreamTeam from "@/components/candidates/FindYourDreamTeam";
import PreRecordedVideoInterviewSection from "@/components/candidates/PreRecordedVideoInterviewSection";
import CandidateSection from "@/components/candidates/CandidateSection";
import React, { useMemo } from "react";
import { CandidateSearch } from "@/components/search/CandidateSearch";
import { useGetCandidateFeaturedQuery } from "@/redux/features/candidate/candidateApi";
import { ICandidate } from "@/types/user";
import { Skeleton } from "@/components/ui/skeleton";
import { CardSkeletonGrid } from "@/components/skeleton/CardSkeleton";
import { CandidateRole } from "@/types/profile";
import { useTranslations } from "next-intl";

// Types for better type safety
interface CandidateSectionConfig {
  title: string;
  dataKey: keyof FeaturedCandidatesData;
  searchRole: string;
}

interface FeaturedCandidatesData {
  HighSchoolPlayer?: ICandidate[];
  "College/UniversityPlayer"?: ICandidate[];
  ProfessionalPlayer?: ICandidate[];
  AmateurPlayer?: ICandidate[];
  Onfieldstaff?: ICandidate[];
  OfficeStaff?: ICandidate[];
}

// Loading skeleton component
const LoadingSection = () => (
  <div className="my-8">
    <div className="flex items-center justify-between py-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-8 w-20" />
    </div>
    <CardSkeletonGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4" />
  </div>
);

function CandidatesPage() {
  const t = useTranslations("candidates.page");
  const { data: featuredCandidatesData, isLoading } =
    useGetCandidateFeaturedQuery(null);

  // Define sections configuration for better maintainability
  const candidateSections: CandidateSectionConfig[] = useMemo(
    () => [
      {
        title: t("onFieldStaff"),
        dataKey: "Onfieldstaff",
        searchRole: CandidateRole.ON_FIELD_STAFF,
      },
      {
        title: t("officeStaff"),
        dataKey: "OfficeStaff",
        searchRole: CandidateRole.OFFICE_STAFF,
      },
      {
        title: t("highSchoolPlayers"),
        dataKey: "HighSchoolPlayer",
        searchRole: CandidateRole.HIGH_SCHOOL,
      },
      {
        title: t("collegePlayers"),
        dataKey: "College/UniversityPlayer",
        searchRole: CandidateRole.COLLEGE_UNIVERSITY,
      },
      {
        title: t("professionalPlayers"),
        dataKey: "ProfessionalPlayer",
        searchRole: CandidateRole.PROFESSIONAL_PLAYER,
      },
      {
        title: t("amateurPlayers"),
        dataKey: "AmateurPlayer",
        searchRole: CandidateRole.AMATEUR_PLAYER,
      },
    ],
    [t],
  );

  const featuredData = featuredCandidatesData?.data as
    | FeaturedCandidatesData
    | undefined;

  // Loading state
  if (isLoading) {
    return (
      <div>
        <div className="bg-[#F7F6F2]">
          <CandidateSearch />
        </div>
        <div className="container mx-auto px-4 md:px-0">
          <FindYourDreamTeam />
          <PreRecordedVideoInterviewSection />
          {Array.from({ length: 6 }).map((_, index) => (
            <LoadingSection key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Search Section */}
      <div className="bg-[#F7F6F2]">
        <CandidateSearch />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4">
        <FindYourDreamTeam />
      </div>

      <PreRecordedVideoInterviewSection />

      {/* Candidate Sections */}
      <div className="container mx-auto px-4">
        {candidateSections.map((section) => (
          <CandidateSection
            key={section.dataKey}
            title={section.title}
            candidates={featuredData?.[section.dataKey]}
            searchRole={section.searchRole}
          />
        ))}

        {/* Empty State */}
        {!isLoading && !featuredData && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              {t("empty")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CandidatesPage;
