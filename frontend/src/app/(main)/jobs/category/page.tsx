"use client";

import React from "react";
import user1 from "@/assets/candidates/user1.png";
import user2 from "@/assets/candidates/user2.png";
import user3 from "@/assets/candidates/user3.png";
import user4 from "@/assets/candidates/user4.png";
import { TNewJobPost } from "@/components/home/NewJobs";
import { NewJobCard } from "@/components/cards/NewJobCard";
import { useSearchParams } from "next/navigation";
import { JobSearch } from "@/components/search/JobSearch";
import { JobFilters } from "@/components/jobs/JobFilters";
import { Suspense } from "react";

function JobBoardCategoryPageContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  const formatCategory = (category: string | null) => {
    if (!category) return "";
    return category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formattedCategory = formatCategory(category);

  const jobPosts: TNewJobPost[] = [
    {
      id: "1",
      company: "Trappes FC",
      location: "Trappes, France",
      applicantCount: 120,
      salary: "$30K",
      postedTime: "2 days ago",
      applicantImages: [user1, user2, user3, user4],
    },
    {
      id: "2",
      company: "Bordeaux AC",
      location: "Trappes, France",
      applicantCount: 120,
      salary: "$30K",
      postedTime: "2 days ago",
      applicantImages: [user1, user2, user3, user4],
    },
    {
      id: "3",
      company: "Greece FC",
      location: "Trappes, France",
      applicantCount: 120,
      salary: "$30K",
      postedTime: "2 days ago",
      applicantImages: [user1, user2, user3, user4],
    },
    {
      id: "4",
      company: "Tunis FC",
      location: "Trappes, France",
      applicantCount: 120,
      salary: "$30K",
      postedTime: "2 days ago",
      applicantImages: [user1, user2, user3, user4],
    },
    {
      id: "5",
      company: "Trappes FC",
      location: "Trappes, France",
      applicantCount: 120,
      salary: "$30K",
      postedTime: "2 days ago",
      applicantImages: [user1, user2, user3, user4],
    },
    {
      id: "6",
      company: "Bordeaux AC",
      location: "Trappes, France",
      applicantCount: 120,
      salary: "$30K",
      postedTime: "2 days ago",
      applicantImages: [user1, user2, user3, user4],
    },
    {
      id: "7",
      company: "Greece FC",
      location: "Trappes, France",
      applicantCount: 120,
      salary: "$30K",
      postedTime: "2 days ago",
      applicantImages: [user1, user2, user3, user4],
    },
    {
      id: "8",
      company: "Tunis FC",
      location: "Trappes, France",
      applicantCount: 120,
      salary: "$30K",
      postedTime: "2 days ago",
      applicantImages: [user1, user2, user3, user4],
    },
    {
      id: "9",
      company: "Trappes FC",
      location: "Trappes, France",
      applicantCount: 120,
      salary: "$30K",
      postedTime: "2 days ago",
      applicantImages: [user1, user2, user3, user4],
    },
    {
      id: "10",
      company: "Bordeaux AC",
      location: "Trappes, France",
      applicantCount: 120,
      salary: "$30K",
      postedTime: "2 days ago",
      applicantImages: [user1, user2, user3, user4],
    },
    {
      id: "11",
      company: "Greece FC",
      location: "Trappes, France",
      applicantCount: 120,
      salary: "$30K",
      postedTime: "2 days ago",
      applicantImages: [user1, user2, user3, user4],
    },
    {
      id: "12",
      company: "Tunis FC",
      location: "Trappes, France",
      applicantCount: 120,
      salary: "$30K",
      postedTime: "2 days ago",
      applicantImages: [user1, user2, user3, user4],
    },
  ];

  return (
    <div>
      <div className="bg-[#F7F6F2]">
        <h2 className="text-3xl md:text-4xl text-[#362F05] text-center pt-10 mb-24">
          Find Your <span className="text-green-400">Ultimate Job</span>
          <br />
          Search Companion
        </h2>
        <JobSearch />
        <JobFilters />
      </div>
      {/* Jobs */}
      <div className="container mx-auto px-4 md:px-0">
        <h2 className="text-3xl md:text-4xl font-semibold my-10">
          {category ? `${formattedCategory}` : "All Jobs"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 mb-8">
          {jobPosts.map((job) => (
            <NewJobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function JobBoardCategoryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JobBoardCategoryPageContent />
    </Suspense>
  );
}
