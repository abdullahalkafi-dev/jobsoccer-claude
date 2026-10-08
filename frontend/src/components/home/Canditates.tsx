"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import CandidateCard from "../cards/CandidateCard";
import { useGetCandidateFeaturedQuery } from "@/redux/features/candidate/candidateApi";
import { ICandidate } from "@/types/user";
import { Skeleton } from "../ui/skeleton";

interface FeaturedCandidatesData {
  Onfieldstaff?: ICandidate[];
  OfficeStaff?: ICandidate[];
  "College/UniversityPlayer"?: ICandidate[];
  AmateurPlayer?: ICandidate[];
}

export function Candidates() {
  const {
    data: candidatesData,
    isLoading,
    isError,
  } = useGetCandidateFeaturedQuery(undefined);

  const featuredData = candidatesData?.data as
    | FeaturedCandidatesData
    | undefined;

  // Show one candidate from each requested category on the homepage preview.
  const homepageCandidates: ICandidate[] = [
    featuredData?.Onfieldstaff?.[0],
    featuredData?.OfficeStaff?.[0],
    featuredData?.["College/UniversityPlayer"]?.[0],
    featuredData?.AmateurPlayer?.[0],
    
  ].filter((candidate): candidate is ICandidate => Boolean(candidate));

  return (
    <section className="py-8 lg:py-16 bg-white">
      {/* Header */}
      <div className="py-8 text-center bg-primary">
        <h2 className="text-2xl md:text-4xl font-bold text-center text-gray-900 mb-2">
          Find Your Dream Team
        </h2>
        <p className="text-center text-gray-900">
          Stop searching - Start Finding ! Jobsoccer connects you with verified
          soccer talent worldwide.
        </p>
      </div>
      <div className="container mx-auto px-4">
        {/* Candidates Container */}
        <div className="bg-[#F7F6F2] rounded-b-2xl p-4 md:p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900">Candidates</h3>
            <Button
              asChild
              className="bg-yellow-300  hover:scale-105 transition-transform duration-200 font-semibold px-6 py-3"
            >
              <Link href="/candidates">See All</Link>
            </Button>
          </div>

          {/* Candidates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Skeleton
                  key={`skeleton-${index}`}
                  className="h-[400px] rounded-lg"
                />
              ))
            ) : isError ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                Failed to load candidates. Please try again later.
              </div>
            ) : homepageCandidates.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                No candidates available at the moment.
              </div>
            ) : (
              homepageCandidates.map((candidate: ICandidate) => (
                <CandidateCard key={candidate._id} candidate={candidate} />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
