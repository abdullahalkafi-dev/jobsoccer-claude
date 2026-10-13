"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useGetHomeFeaturedJobsQuery, useGetNewFourJobsQuery } from "@/redux/features/job/jobApi";
import { TJob } from "@/types/job";
import { CardSkeleton } from "../skeleton/CardSkeleton";
import { HomeJobCard } from "../cards/HomeJobCard";
import { StaticImageData } from "next/image";

export type TNewJobPost = {
  id: string;
  company: string;
  location: string;
  applicantCount: number;
  salary: string;
  postedTime: string;
  applicantImages: StaticImageData[];
};

export function NewJobs() {
  const { data: featuredData, isLoading: isFeaturedLoading } = useGetHomeFeaturedJobsQuery(undefined);
  const { data: fallbackData, isLoading: isFallbackLoading } = useGetNewFourJobsQuery(undefined, {
    skip: !isFeaturedLoading && (featuredData?.data?.length ?? 0) > 0,
  });

  const isLoading = isFeaturedLoading || (featuredData?.data?.length === 0 && isFallbackLoading);
  const jobs: TJob[] = (featuredData?.data?.length ? featuredData.data : fallbackData?.data) || [];

  return (
    <div className="bg-[#F7F6F2] rounded-3xl p-5 md:p-8 border border-gray-100 shadow-xs">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
          New Jobs
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))
        ) : jobs.length > 0 ? (
          jobs.slice(0, 3).map((job) => (
            <HomeJobCard
              key={job._id}
              job={job}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500 py-8">
            No new jobs available
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <Button asChild className="bg-yellow-300 hover:bg-yellow-400 text-gray-900 hover:scale-105 transition-transform duration-200 font-semibold px-6 py-3 rounded-xl shadow-xs">
          <Link href="/jobs">See All</Link>
        </Button>
      </div>
    </div>
  );
}

