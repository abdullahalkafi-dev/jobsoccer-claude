"use client";

import { Button } from "@/components/ui/button";
import React from "react";
import FindYourDreamTeam from "@/components/employer/FindYourDreamTeam";
import { EmployerCard } from "@/components/cards/EmployerCard";
import { EmployerSearch } from "@/components/search/EmploerSearch";
import { IEmployer } from "@/types/user";
import { useGetEmployerFeaturedQuery } from "@/redux/features/employer/employerApi";
import { EmployerCardSkeletonGrid } from "@/components/skeleton";
import Link from "next/link";
import { EmployerRole } from "@/types/profile";

// Employer category configuration
const EMPLOYER_CATEGORIES = [
  { key: "Academy", label: "Academy", category: EmployerRole.ACADEMY },
  {
    key: "HighSchool",
    label: "High School",
    category: EmployerRole.HIGH_SCHOOL,
  },
  {
    key: "CollegeUniversity",
    label: "College/University",
    category: EmployerRole.COLLEGE_UNIVERSITY,
  },
  {
    key: "ProfessionalClub",
    label: "Professional Club",
    category: EmployerRole.PROFESSIONAL_CLUB,
  },
  {
    key: "AmateurClub",
    label: "Amateur Club",
    category: EmployerRole.AMATEUR_CLUB,
  },
  { key: "Agent", label: "Agent", category: EmployerRole.AGENT },
  {
    key: "ConsultingCompany",
    label: "Consulting Company",
    category: EmployerRole.CONSULTING_COMPANY,
  },
] as const;

/**
 * Reusable section component for employer categories
 */
interface EmployerSectionProps {
  title: string;
  employers?: IEmployer[];
  isLoading?: boolean;
  category: string;
}

const EmployerSection = ({
  title,
  employers,
  isLoading,
  category,
}: EmployerSectionProps) => (
  <section className="my-8">
    <div className="flex items-center justify-between py-4">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <Button asChild className="bg-yellow-300  hover:scale-105 transition-transform duration-200 font-semibold px-6 py-3">
        <Link
          href={`/employers/search?role=${encodeURIComponent(category)}`}
        >
          See All
        </Link>
      </Button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
      {isLoading ? (
        <EmployerCardSkeletonGrid count={4} className="contents" />
      ) : (
        employers?.map((employer) => (
          <EmployerCard key={employer._id} employer={employer} />
        ))
      )}
    </div>
  </section>
);

function EmployersPage() {
  const { data: featuredEmployersData, isLoading } =
    useGetEmployerFeaturedQuery(null);

  return (
    <section>
      {/* Search Section */}
      <div className="bg-[#F7F6F2]">
        <EmployerSearch />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4">
        {/* Dream Team Section */}
        <FindYourDreamTeam />

        {/* Employer Categories */}
        {EMPLOYER_CATEGORIES.map((category) => (
          <EmployerSection
            key={category.key}
            title={category.label}
            employers={featuredEmployersData?.data?.[category.key]}
            isLoading={isLoading}
            category={category.category}
          />
        ))}
      </div>
    </section>
  );
}

export default EmployersPage;
