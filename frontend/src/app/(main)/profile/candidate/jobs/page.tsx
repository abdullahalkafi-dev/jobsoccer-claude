"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { TSavedJob, TAppliedJob } from "@/types/job";
import {
  useGetSavedJobsQuery,
  useDeleteSavedJobMutation,
} from "@/redux/features/savedJobs/savedJobsApi";
import {
  useGetMyApplicationsQuery,
  useDeleteJobApplicationMutation,
} from "@/redux/features/jobApplication/jobApplicationApi";
import { JobsListSkeletonGrid } from "@/components/skeleton";

// Type definitions
interface JobItemProps {
  item: TSavedJob | TAppliedJob;
  tab: "saved" | "applied";
  onRemove: (id: string, tab: "saved" | "applied") => void;
}

const JobItem: React.FC<JobItemProps> = ({ item, tab, onRemove }) => {
  const job = item.jobId;
  const date =
    tab === "saved" ? item.createdAt : (item as TAppliedJob).appliedAt;
  const salary = `$${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}`;
  const status = tab;

  const getStatusBadge = () => {
    return (
      <div className="flex items-center gap-2">
        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm font-medium">
          {status === "saved" ? "Saved" : "Applied"}
        </span>
      </div>
    );
  };

  return (
    <Card className="w-full mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 mb-1">
              {job.jobTitle}
            </h3>
            <p className="text-sm text-gray-500 mb-2">
              {new Date(date).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-700 mb-1">{salary}</p>
            <p className="text-sm text-gray-600">{job.location}</p>
          </div>

          <div className="flex flex-col items-end gap-4">
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <X className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem
                    onClick={() => onRemove(item._id, tab)}
                    className="cursor-pointer text-red-600"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="bg-green-500 hover:bg-green-600 text-white hover:text-white"
            >
              <Link href={`/jobs/${job._id}`}>View Details</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
const JobsList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"saved" | "applied">("saved");

  const { data: savedJobsData, isLoading: savedLoading } =
    useGetSavedJobsQuery();
  const { data: appliedJobsData, isLoading: appliedLoading } =
    useGetMyApplicationsQuery();
  const [deleteSavedJob] = useDeleteSavedJobMutation();
  const [deleteJobApplication] = useDeleteJobApplicationMutation();

  const handleRemoveJob = async (id: string, tab: "saved" | "applied") => {
    try {
      if (tab === "saved") {
        await deleteSavedJob(id).unwrap();
      } else {
        await deleteJobApplication(id).unwrap();
      }
    } catch (error) {
      console.error("Error removing job:", error);
    }
  };

  const getFilteredJobs = (): (TSavedJob | TAppliedJob)[] => {
    if (activeTab === "saved") {
      return savedJobsData?.data || [];
    } else {
      return appliedJobsData?.data || [];
    }
  };

  const filteredJobs = getFilteredJobs();
  const isLoading = activeTab === "saved" ? savedLoading : appliedLoading;

  return (
    <div className="w-full p-2 md:p-4 border rounded-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
        <Button className="bg-green-500 hover:bg-green-600 text-white">
          <Link href="/jobs">Find More Jobs</Link>
        </Button>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6">
          <div className="flex space-x-8">
            {[
              { key: "saved", label: "Saved" },
              { key: "applied", label: "Applied" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as "saved" | "applied")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4 px-2 md:px-6 py-2 md:py-4">
        {isLoading ? (
          <JobsListSkeletonGrid count={3} />
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {activeTab === "saved" && "No saved jobs found."}
              {activeTab === "applied" && "No applied jobs found."}
            </p>
          </div>
        ) : (
          filteredJobs.map((item) => (
            <JobItem
              key={item._id}
              item={item}
              tab={activeTab}
              onRemove={handleRemoveJob}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default JobsList;
