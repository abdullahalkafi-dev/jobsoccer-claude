"use client";

import React, { useState } from "react";
import { MapPin, SquareCheck } from "lucide-react";
import {
  useGetSingleJobQuery,
  useGetJobsWithFiltersQuery,
} from "@/redux/features/job/jobApi";
import { useApplyJobMutation } from "@/redux/features/jobApplication/jobApplicationApi";
import {
  useSaveJobMutation,
  useUnsaveJobMutation,
} from "@/redux/features/savedJobs/savedJobsApi";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { LoginRequiredModal } from "@/components/modals/LoginRequiredModal";
import { addAppliedJob } from "@/redux/features/jobApplication/jobApplicationSlice";
import { useAppDispatch } from "@/redux/hooks";
import { TJob } from "@/types/job";
import { Skeleton } from "@/components/ui/skeleton";
import { JobCard } from "@/components/cards/JobCard";
import UploadResumeModal from "@/components/modals/UploadResumeModal";
import { toast } from "sonner";
import { use } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

const JobDetailsPage = ({ params }: PageProps) => {
  const { id } = use(params);
  const dispatch = useAppDispatch();
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [localIsSaved, setLocalIsSaved] = useState<boolean | null>(null);
  const [localIsApplied, setLocalIsApplied] = useState<boolean | null>(null);
  const { checkAuth, showLoginModal, handleLogin, handleCloseModal } =
    useAuthCheck();

  const [applyJob, { isLoading: isApplying }] = useApplyJobMutation();
  const [saveJob, { isLoading: isSaving }] = useSaveJobMutation();
  const [unsaveJob, { isLoading: isUnsaving }] = useUnsaveJobMutation();

  const { data: jobResponse, isLoading } = useGetSingleJobQuery(id);
  const jobData: TJob | undefined = jobResponse?.data;

  // Use local state if available, otherwise use API data
  const isApplied = localIsApplied ?? jobData?.isApplied ?? false;
  const isSaved = localIsSaved ?? jobData?.isSaved ?? false;

  const { data: relatedJobsResponse, isLoading: relatedJobsLoading } =
    useGetJobsWithFiltersQuery(
      {
        jobCategory: jobData?.jobCategory || "",
        country: jobData?.country || "",
        position: jobData?.position || "",
      },
      { skip: !jobData?.jobCategory }
    );

  const relatedJobs =
    relatedJobsResponse?.data
      ?.filter((job: TJob) => job._id !== id)
      ?.slice(0, 4) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 md:px-0 py-16">
          <div className="flex flex-col-reverse lg:flex-row justify-between gap-4">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
            <div className="flex-3">
              <Skeleton className="h-[800px] rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!jobData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Job not found</p>
      </div>
    );
  }

  const handleApplyClick = () => {
    if (
      !checkAuth(() => {
        setShowResumeModal(true);
      })
    ) {
      return;
    }
  };

  const handleSaveJob = async () => {
    if (
      !checkAuth(async () => {
        await handleSaveJobLogic();
      })
    ) {
      return;
    }
  };

  const handleSaveJobLogic = async () => {
    const previousState = isSaved;
    const willBeSaved = !isSaved;

    try {
      // Optimistic update
      setLocalIsSaved(willBeSaved);

      const result = isSaved
        ? await unsaveJob(id).unwrap()
        : await saveJob(id).unwrap();
      if (result.success) {
        toast.success(
          willBeSaved ? "Job saved successfully!" : "Job unsaved successfully!"
        );
      }
    } catch (error) {
      // Revert on error
      setLocalIsSaved(previousState);
      const err = error as { data?: { message?: string } };
      toast.error(err.data?.message || "Failed to save job. Please try again.");
      console.error("Failed to save job:", error);
    }
  };

  const handleResumeSubmitSuccess = async (resumeUrl: string) => {
    try {
      const result = await applyJob({ jobId: id, resumeUrl }).unwrap();
      dispatch(addAppliedJob(result.data));
      setLocalIsApplied(true);
      toast.success("Application submitted successfully!");
    } catch (error) {
      const err = error as { data?: { message?: string } };
      const errorMessage =
        err.data?.message || "Failed to apply. Please try again.";
      toast.error(errorMessage);
      console.error("Failed to apply:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatSalary = () => {
    if (jobData.salary.min && jobData.salary.max) {
      return `$${(jobData.salary.min / 1000).toFixed(0)}K - $${(
        jobData.salary.max / 1000
      ).toFixed(0)}K/month`;
    }
    return "Negotiable";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 md:px-0 py-16">
        <div className="flex flex-col-reverse lg:flex-row justify-between gap-4 items-start">
          {/* left column - Related Jobs */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
            <h2 className="text-xl font-semibold mb-4">Recommended Jobs</h2>
            {relatedJobsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-lg" />
              ))
            ) : relatedJobs.length > 0 ? (
              relatedJobs.map((job: TJob) => (
                <JobCard key={job._id} job={job} />
              ))
            ) : (
              <p className="text-gray-500">
                No recommended jobs found
              </p>
            )}
          </div>

          <div className="flex-3 ">
            <div className="border border-gray-200 shadow-sm rounded-2xl">
              <div className="p-6">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6">
                  <div className="mb-4 lg:mb-0">
                    <h1 className="text-2xl font-bold text-black mb-2">
                      {jobData.jobTitle}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                      <span>
                        {jobData.creator.creatorId.firstName}{" "}
                        {jobData.creator.creatorId.lastName}
                      </span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{jobData.location}</span>
                      </div>
                      <span>•</span>
                      <span>{jobData.contractType}</span>
                    </div>
                  </div>

                  <div className="text-sm">
                    <p>
                      <span className="text-gray-600">Deadline:</span>
                      <span className="text-gray-900 font-medium">
                        {formatDate(jobData.deadline)}
                      </span></p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column - Main Content */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* Job Overview */}
                    <div>
                      <h2 className="text-lg font-semibold text-black mb-3">
                        Job Overview
                      </h2>
                      <p className="text-gray-700 leading-relaxed text-sm">
                        {jobData.jobOverview}
                      </p>
                    </div>

                    {/* Job Summary - Mobile Only */}
                    <div className="lg:hidden">
                      <div className="bg-gray-50 rounded-lg p-5">
                        <h3 className="text-lg font-semibold text-black mb-4">
                          Job Summary
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Position
                            </div>
                            <div className="text-sm font-medium text-black">
                              {jobData.position}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Salary
                            </div>
                            <div className="text-sm font-medium text-black">
                              {formatSalary()}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Contract Type
                            </div>
                            <div className="text-sm font-medium text-black">
                              {jobData.contractType}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Experience
                            </div>
                            <div className="text-sm font-medium text-black">
                              {jobData.experience}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Category
                            </div>
                            <div className="text-sm font-medium text-black">
                              {jobData.jobCategory}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              AI Score Required
                            </div>
                            <div className="flex items-center gap-2">
                              <SquareCheck className="w-4 h-4 text-green-500 " />
                              <span className="text-sm font-medium text-black">
                                {jobData.requiredAiScore}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Responsibilities */}
                    <div>
                      <h2 className="text-lg font-semibold text-black mb-3">
                        Responsibilities
                      </h2>
                      <p className="text-gray-700 leading-relaxed text-sm">
                        {jobData.responsibilities}
                      </p>
                    </div>

                    {/* Required Skills & Qualifications */}
                    <div>
                      <h2 className="text-lg font-semibold text-black mb-3">
                        Required Skills & Qualifications
                      </h2>
                      <p className="text-gray-700 leading-relaxed text-sm">
                        {jobData.requiredSkills}
                      </p>
                    </div>

                    {/* Application Requirements */}
                    <div>
                      <h2 className="text-lg font-semibold text-black mb-3">
                        Application Requirements
                      </h2>
                      <p className="text-gray-700 leading-relaxed text-sm">
                        {jobData.requirements}
                      </p>
                      {jobData.additionalRequirements && (
                        <div className="mt-3">
                          <h3 className="text-sm font-semibold text-black mb-2">
                            Additional Requirements
                          </h3>
                          <p className="text-gray-700 leading-relaxed text-sm">
                            {jobData.additionalRequirements}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Mobile Action Buttons */}
                    <div className="lg:hidden flex flex-col sm:flex-row gap-3 pt-6">
                      <button
                        onClick={handleSaveJob}
                        disabled={isSaving || isUnsaving}
                        className={`flex-1 px-6 py-2 border rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isSaved
                          ? "bg-green-50 border-green-500 text-green-700"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        {isSaving || isUnsaving
                          ? isSaved
                            ? "Unsaving..."
                            : "Saving..."
                          : isSaved
                            ? "Unsave Job"
                            : "Save Job"}
                      </button>
                      <button
                        onClick={handleApplyClick}
                        disabled={isApplied || isApplying}
                        className={`flex-1 px-8 py-2 rounded-md transition-colors disabled:opacity-50 ${isApplied
                          ? "bg-green-500 text-white cursor-not-allowed"
                          : "bg-green-500 text-white hover:bg-green-600"
                          }`}
                      >
                        {isApplying
                          ? "Applying..."
                          : isApplied
                            ? "Applied"
                            : "Apply Now"}
                      </button>
                    </div>
                  </div>

                  {/* Right Column - Job Summary Sidebar (Desktop Only) */}
                  <div className="hidden lg:block lg:col-span-1">
                    <div className="bg-gray-50 rounded-lg p-5 sticky top-6">
                      <h3 className="text-lg font-semibold text-black mb-4">
                        Job Summary
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            Position
                          </div>
                          <div className="text-sm font-medium text-black">
                            {jobData.position}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            Salary
                          </div>
                          <div className="text-sm font-medium text-black">
                            {formatSalary()}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            Contract Type
                          </div>
                          <div className="text-sm font-medium text-black">
                            {jobData.contractType}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            Experience
                          </div>
                          <div className="text-sm font-medium text-black">
                            {jobData.experience}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            Category
                          </div>
                          <div className="text-sm font-medium text-black">
                            {jobData.jobCategory}
                          </div>
                        </div>

                        <div className="pt-2">
                          <div className="text-xs text-gray-500 mb-1">
                            AI Score Required
                          </div>
                          <div className="flex items-center gap-2">
                            <SquareCheck className="w-4 h-4 text-green-500 " />
                            <span className="text-sm font-medium text-black">
                              {jobData.requiredAiScore}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Action Buttons */}
                      <div className="mt-6 flex flex-col gap-3">
                        <button
                          onClick={handleSaveJob}
                          disabled={isSaving || isUnsaving}
                          className={`w-full px-4 py-2 border rounded-md transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed ${isSaved
                            ? "bg-green-50 border-green-500 text-green-700"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                          {isSaving || isUnsaving
                            ? isSaved
                              ? "Unsaving..."
                              : "Saving..."
                            : isSaved
                              ? "Unsave Job"
                              : "Save Job"}
                        </button>
                        <button
                          onClick={handleApplyClick}
                          disabled={isApplied || isApplying}
                          className={`w-full px-4 py-2 rounded-md transition-colors text-sm disabled:opacity-50 ${isApplied
                            ? "bg-green-500 text-white cursor-not-allowed"
                            : "bg-green-500 text-white hover:bg-green-600"
                            }`}
                        >
                          {isApplying
                            ? "Applying..."
                            : isApplied
                              ? "Applied"
                              : "Apply Now"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <UploadResumeModal
        isOpen={showResumeModal}
        onClose={() => setShowResumeModal(false)}
        jobId={id}
        onSubmitSuccess={handleResumeSubmitSuccess}
      />

      {/* Login Required Modal */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={handleCloseModal}
        onLogin={handleLogin}
        message="Please log in to apply for jobs or save them to your list."
      />
    </div>
  );
};

export default JobDetailsPage;
