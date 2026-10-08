"use client";

import { JobSearch } from "@/components/search/JobSearch";
import { JobFilters } from "@/components/jobs/JobFilters";
import React, { useEffect, useState, Suspense } from "react";
import { JobCard } from "@/components/cards/JobCard";
import {
  useGetNewFourJobsQuery,
  useGetJobsWithFiltersQuery,
} from "@/redux/features/job/jobApi";
import { TJob } from "@/types/job";
import { CardSkeleton } from "@/components/skeleton/CardSkeleton";
import { useSearchParams } from "next/navigation";

function JobPageContent() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Record<string, string>>({});

  const { data: newJobsData, isLoading: newJobsLoading } =
    useGetNewFourJobsQuery(undefined);

  const { data: allJobsData, isLoading: allJobsLoading } =
    useGetJobsWithFiltersQuery(filters);

  // Initialize filters from URL params
  useEffect(() => {
    const urlFilters: Record<string, string> = {};

    const searchTerm = searchParams.get("searchTerm");
    const jobCategory = searchParams.get("jobCategory");
    const country = searchParams.get("country");
    const dateFilter = searchParams.get("dateFilter");
    const aiScoreLevel = searchParams.get("aiScoreLevel");
    const experience = searchParams.get("experience");

    if (searchTerm) urlFilters.searchTerm = searchTerm;
    if (jobCategory) urlFilters.jobCategory = jobCategory;
    if (country) urlFilters.country = country;
    if (dateFilter) urlFilters.dateFilter = dateFilter;
    if (aiScoreLevel) urlFilters.aiScoreLevel = aiScoreLevel;
    if (experience) urlFilters.experience = experience;

    setFilters(urlFilters);
  }, [searchParams]);

  const handleFiltersChange = (newFilters: {
    dateFilter?: string;
    aiScoreLevel?: string;
    experience?: string;
  }) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  const handleReset = () => {
    const baseFilters: Record<string, string> = {};
    const searchTerm = searchParams.get("searchTerm");
    const jobCategory = searchParams.get("jobCategory");
    const country = searchParams.get("country");

    if (searchTerm) baseFilters.searchTerm = searchTerm;
    if (jobCategory) baseFilters.jobCategory = jobCategory;
    if (country) baseFilters.country = country;

    setFilters(baseFilters);
  };

  return (
    <main>
      <div className="bg-[#F7F6F2]">
        <h2 className="text-3xl md:text-4xl text-[#362F05] text-center pt-10 mb-24">
          Find Your <span className="text-green-400">Ultimate Job</span>
          <br />
          Search Companion
        </h2>
        <JobSearch />
        <JobFilters
          onFiltersChange={handleFiltersChange}
          onReset={handleReset}
          dateFilter={filters.dateFilter}
          aiScoreLevel={filters.aiScoreLevel}
          experience={filters.experience}
        />
      </div>

      {/* Jobs */}
      <div className="container mx-auto px-4">
        {/* New Jobs */}
        <div>
          <h2 className="text-2xl md:4xl font-bold text-gray-900  my-10">
            <span className="bg-yellow-300 font-semibold px-6 py-3 rounded-md">
              New Jobs
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 mb-8">
            {newJobsLoading ? (
              <>
                {Array.from({ length: 4 }).map((_, index) => (
                  <CardSkeleton key={index} />
                ))}
              </>
            ) : newJobsData?.data && newJobsData.data.length > 0 ? (
              newJobsData.data.map((job: TJob) => (
                <JobCard key={job._id} job={job} />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500">
                No new jobs available
              </p>
            )}
          </div>
        </div>

        {/* All Jobs */}
        <div>
          <h2 className="text-2xl md:text-4xl font-semibold my-10">All Jobs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 mb-8">
            {allJobsLoading ? (
              <>
                {Array.from({ length: 8 }).map((_, index) => (
                  <CardSkeleton key={index} />
                ))}
              </>
            ) : allJobsData?.data && allJobsData.data.length > 0 ? (
              allJobsData.data.map((job: TJob) => (
                <JobCard key={job._id} job={job} />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500">
                No jobs available
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function JobPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JobPageContent />
    </Suspense>
  );
}
