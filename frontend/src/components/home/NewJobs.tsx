"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useGetNewFourJobsQuery } from "@/redux/features/job/jobApi";
import { TJob } from "@/types/job";
import { CardSkeleton } from "../skeleton/CardSkeleton";
import { JobCard } from "../cards/JobCard";
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
  const { data: jobsData, isLoading } = useGetNewFourJobsQuery(undefined);
  const jobs: TJob[] = jobsData?.data || [];

  return (
    <div className="bg-[#F7F6F2] rounded-3xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl md:4xl font-bold text-gray-900">
          <button className="bg-yellow-300 font-semibold px-6 py-3 rounded-md">
            New Jobs
          </button>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))
        ) : jobs.length > 0 ? (
          jobs.map((job) => <JobCard key={job._id} job={job} />)
        ) : (
          <p className="col-span-full text-center text-gray-500">
            No new jobs available
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <Button className="bg-yellow-300  hover:scale-105 transition-transform duration-200 font-semibold px-6 py-3">
          <Link href="jobs">See All</Link>
        </Button>
      </div>
    </div>
  );
}
