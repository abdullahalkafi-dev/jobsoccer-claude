"use client";

import React, { useState, useEffect, useMemo } from "react";
import { MoreVertical, Download, MessageCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateJobPostModal from "@/components/modals/CreateJobPostModal";
import { useAppSelector } from "@/redux/hooks";
import {
  useGetEmployerJobsQuery,
  useCloseJobMutation,
} from "@/redux/features/job/jobApi";
import { useGetJobApplicationsQuery } from "@/redux/features/jobApplication/jobApplicationApi";
import { TJob } from "@/types/job";
import Image from "next/image";

const JobsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"active" | "closed">("active");
  const [selectedJob, setSelectedJob] = useState<TJob | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isCreateJobPostModalOpen, setIsCreateJobPostModalOpen] =
    useState(false);

  // Get current user from Redux store
  const user = useAppSelector((state) => state.auth.user);

  // Fetch employer jobs
  const { data: employerJobsData, isLoading: isLoadingJobs } =
    useGetEmployerJobsQuery(user?._id || "", {
      skip: !user?._id,
    });

  // Fetch applications for selected job
  const { data: applicationsData, isLoading: isLoadingApplications } =
    useGetJobApplicationsQuery(selectedJob?._id || "", {
      skip: !selectedJob?._id,
    });

  // Close job mutation
  const [closeJob] = useCloseJobMutation();

  const jobs = useMemo(
    () => employerJobsData?.data || [],
    [employerJobsData?.data]
  );
  const applications = applicationsData?.data || [];

  // Set initial selected job when jobs are loaded
  useEffect(() => {
    if (jobs.length > 0 && !selectedJob) {
      const firstActiveJob = jobs.find((job) => job.status === activeTab);
      setSelectedJob(firstActiveJob || jobs[0]);
    }
  }, [jobs, activeTab, selectedJob]);

  // Filter jobs based on active tab
  const filteredJobs = jobs.filter((job) => job.status === activeTab);

  // Handle tab change
  const handleTabChange = (tab: "active" | "closed") => {
    setActiveTab(tab);
    const firstJobInTab = jobs.find((job) => job.status === tab);
    setSelectedJob(firstJobInTab || null);
    setOpenDropdownId(null);
  };

  // Handle job selection
  const handleJobSelect = (job: TJob) => {
    setSelectedJob(job);
  };

  // Handle job status change
  const handleJobStatusChange = async (
    jobId: string,
    newStatus: "active" | "closed"
  ) => {
    if (newStatus === "closed") {
      try {
        await closeJob(jobId).unwrap();
        // If the closed job was selected, update selection
        if (selectedJob?._id === jobId) {
          const remainingActiveJobs = jobs.filter(
            (job) => job._id !== jobId && job.status === "active"
          );
          setSelectedJob(remainingActiveJobs[0] || null);
        }
      } catch (error) {
        console.error("Failed to close job:", error);
      }
    }
    setOpenDropdownId(null);
  };

  // Toggle dropdown
  const toggleDropdown = (jobId: string) => {
    setOpenDropdownId(openDropdownId === jobId ? null : jobId);
  };

  // Get AI score color
  const getAIScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-blue-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Format salary
  const formatSalary = (min: number, max: number) => {
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };

  if (isLoadingJobs) {
    return (
      <div className="min-h-screen w-full p-4 md:p-6 border rounded-2xl flex items-center justify-center">
        <p className="text-gray-500">Loading jobs...</p>
      </div>
    );
  }


  
  return (
    <div className="min-h-screen w-full p-4 md:p-6 border rounded-2xl">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <Button
            variant="outline"
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            onClick={() => setIsCreateJobPostModalOpen(true)}
          >
            <Plus size={20} />
            Job Post
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 space-x-8 mb-6 p-1 rounded-lg w-fit">
          <button
            onClick={() => handleTabChange("active")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "active"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => handleTabChange("closed")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "closed"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Closed
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Job Cards Section */}
          <div className="flex-1 lg:max-w-[220px] xl:max-w-sm">
            <div className="space-y-4">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <div
                    key={job._id}
                    onClick={() => handleJobSelect(job)}
                    className={`relative bg-white rounded-lg border p-4 cursor-pointer transition-all ${
                      selectedJob?._id === job._id
                        ? "border-blue-500 shadow-md"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    {/* Three dots menu */}
                    {job.status === "active" && (
                      <div className="absolute top-4 right-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDropdown(job._id);
                          }}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <MoreVertical size={16} className="text-gray-500" />
                        </button>

                        {/* Dropdown menu */}
                        {openDropdownId === job._id && (
                          <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJobStatusChange(job._id, "closed");
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              Close
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="pr-8">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {job.jobTitle}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {formatDate(job.createdAt)}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        Salary: {formatSalary(job.salary.min, job.salary.max)}
                      </p>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {job.location}, {job.country}
                      </p>
                      <p className="text-sm text-blue-600 font-medium mt-2">
                        {job.applicationCount} Applicant
                        {job.applicationCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <p className="text-gray-500">No {activeTab} jobs found</p>
                </div>
              )}
            </div>
          </div>

          {/* Applicants Section */}
          <div className="flex-1">
            {selectedJob ? (
              <div className="bg-white rounded-lg border border-gray-200">
                {/* Applicants Header */}
                <div className="border-b border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Applicants
                  </h2>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 text-sm font-medium text-gray-700 border-b border-gray-200">
                  <div className="col-span-4">Name</div>
                  <div className="col-span-2 text-center">AI scores</div>
                  <div className="col-span-3 text-center">Resume</div>
                  <div className="col-span-3 text-center">Connect</div>
                </div>

                {/* Applicants List */}
                <div className="divide-y divide-gray-200 overflow-x-auto">
                  {isLoadingApplications ? (
                    <div className="px-6 py-12 text-center">
                      <p className="text-gray-500">Loading applicants...</p>
                    </div>
                  ) : applications.length > 0 ? (
                    applications.map((applicant) => (
                      <div
                        key={applicant._id}
                        className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        {/* Name */}
                        <div className="col-span-4 flex items-center gap-3">
                          {applicant.applicantProfileImage &&
                          process.env.NEXT_PUBLIC_IMAGE_URL ? (
                            <Image
                              src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${applicant.applicantProfileImage}`}
                              alt={applicant.applicantName}
                              className="rounded-full object-cover"
                              width={32}
                              height={32}
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {applicant.applicantName.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-900">
                              {applicant.applicantName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {applicant.candidateRole}
                            </span>
                          </div>
                        </div>

                        {/* AI Score */}
                        <div className="col-span-2 flex justify-center items-center">
                          <span
                            className={`text-sm font-medium ${getAIScoreColor(
                              applicant.aiMatchPercentage
                            )}`}
                          >
                            {applicant.aiMatchPercentage}%
                          </span>
                        </div>

                        {/* Resume Download */}
                        <div className="col-span-3 flex justify-center items-center">
                          {applicant.resumeUrl ? (
                            <a
                              href={`${process.env.NEXT_PUBLIC_BASE_URL}${applicant.resumeUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm transition-colors"
                            >
                              <Download size={16} />
                              Download
                            </a>
                          ) : (
                            <span className="text-sm text-gray-400">
                              No resume
                            </span>
                          )}
                        </div>

                        {/* Message Button */}
                        <div className="col-span-3 flex justify-center items-center">
                          <button className="flex items-center gap-2 bg-blue-100 text-blue-600 hover:bg-blue-200 px-3 py-1 rounded-full text-sm transition-colors">
                            <MessageCircle size={16} />
                            Message
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-12 text-center">
                      <p className="text-gray-500">No applicants yet</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="text-center">
                  <p className="text-gray-500">
                    Select a job to view applicants
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Create Job Post Modal */}
      {isCreateJobPostModalOpen && (
        <CreateJobPostModal
          isOpen={isCreateJobPostModalOpen}
          onClose={() => setIsCreateJobPostModalOpen(false)}
          onSuccess={() => {
            // The RTK Query cache invalidation will automatically refetch the jobs
            // You can add additional logic here if needed
          }}
        />
      )}
    </div>
  );
};

export default JobsPage;
