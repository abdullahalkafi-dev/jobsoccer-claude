"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { useGetJobCountsByRoleQuery } from "@/redux/features/job/jobApi";
import type { TJobCountByRole } from "@/types/job";

const SKELETON_COUNT = 6;

export function JobCategories() {
  const {
    data: jobCountsData,
    isLoading,
    isError,
  } = useGetJobCountsByRoleQuery(undefined);
  const jobCategories: TJobCountByRole[] = jobCountsData?.data || [];

  return (
    <section className="bg-[#F7F6F2]">
      <div className="container mx-auto px-4 py-8 lg:py-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-8">
          <h2 className="text-2xl md:text-4xl font-bold text-[#362F05] leading-tight max-w-2xl">
           Find Your Next Soccer Talent
          </h2>
          <Button
            asChild
            className="bg-yellow-300  hover:scale-105 transition-transform duration-200 font-semibold px-6 py-3"
          >
            <Link href="/jobs">See All</Link>
          </Button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <Skeleton
                key={`skeleton-${index}`}
                className="h-20 rounded-full"
              />
            ))
          ) : isError ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              Unable to load job categories. Please try again later.
            </div>
          ) : jobCategories.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No job categories available at the moment.
            </div>
          ) : (
            jobCategories.map((category) => (
              <Link
                key={category.role}
                href={`/jobs?jobCategory=${encodeURIComponent(category.role)}`}
                className="group bg-white rounded-full p-2 border border-gray-200 hover:bg-[#504A20] hover:text-white transition-all duration-200"
              >
                <div className="flex items-center justify-between gap-3 p-2 pl-6">
                  <div className="flex-1 items-center min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-white truncate">
                      {category.role}
                    </h3>
                    <p className="text-sm text-gray-500 group-hover:text-gray-200">
                      {category.jobCount}{" "}
                      {category.jobCount === 1 ? "job" : "jobs"} available
                    </p>
                  </div>
                  <ChevronRight
                    className="w-5 h-5 text-gray-400 group-hover:text-white shrink-0"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
