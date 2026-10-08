/* eslint-disable @typescript-eslint/no-explicit-any */
import { Bookmark, Clock, MapPin } from "lucide-react";
import { TJob } from "@/types/job";
import Image from "next/image";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import Link from "next/link";
import user1 from "@/assets/candidates/user1.png";
import user2 from "@/assets/candidates/user2.png";
import user3 from "@/assets/candidates/user3.png";
import user4 from "@/assets/candidates/user4.png";
import userPlaceholder from "@/assets/user-placeholder.png";
import { formatTimeAgo } from "@/lib/utils";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { LoginRequiredModal } from "../modals/LoginRequiredModal";
import {
  useSaveJobMutation,
  useUnsaveJobMutation,
} from "@/redux/features/savedJobs/savedJobsApi";
import { useApplyJobMutation } from "@/redux/features/jobApplication/jobApplicationApi";
import { addAppliedJob } from "@/redux/features/jobApplication/jobApplicationSlice";
import { useAppDispatch } from "@/redux/hooks";
import UploadResumeModal from "@/components/modals/UploadResumeModal";
import { toast } from "sonner";
import { useState } from "react";
import { Spinner } from "../ui/spinner";

type JobCardProps = {
  job: TJob;
};

export function JobCard({ job }: JobCardProps) {
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [localIsSaved, setLocalIsSaved] = useState<boolean | null>(null);
  const [localIsApplied, setLocalIsApplied] = useState<boolean | null>(null);
  const [imgError, setImgError] = useState(false);
  const { checkAuth, showLoginModal, handleLogin, handleCloseModal } =
    useAuthCheck();

  const [saveJob, { isLoading: isSavingLoading }] = useSaveJobMutation();
  const [unsaveJob, { isLoading: isUnsavingLoading }] = useUnsaveJobMutation();
  const [applyJob, { isLoading: isApplyingLoading }] = useApplyJobMutation();

  const dispatch = useAppDispatch();

  // Use local state if available, otherwise use API data
  const isApplied = localIsApplied ?? job.isApplied ?? false;
  const isSaved = localIsSaved ?? job.isSaved ?? false;

  const jobData = {
    id: job._id,
    creatorId: job.creator.creatorId?._id,
    company:
      `${job.creator.creatorId?.firstName || ""} ${job.creator.creatorId?.lastName || ""}`.trim() ||
      "Not available",
    location: job.location,
    image: job.creator.creatorId?.profileImage,
    applicantCount: job.applicationCount,
    salary: `$${(job.salary.min / 1000).toFixed(0)}K-${(
      job.salary.max / 1000
    ).toFixed(0)}K`,
    postedTime: formatTimeAgo(job.createdAt),
    applicantImages: [user1, user2, user3, user4],
    position: job.position,
    contractType: job.contractType,
  };

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      !checkAuth(async () => {
        await handleBookmarkLogic();
      })
    ) {
      return;
    }
  };

  const handleBookmarkLogic = async () => {
    const previousState = isSaved;
    const willBeSaved = !isSaved;

    try {
      // Optimistic update
      setLocalIsSaved(willBeSaved);

      const result = isSaved
        ? await unsaveJob(jobData.id).unwrap()
        : await saveJob(jobData.id).unwrap();
      if (result.success) {
        toast.success(
          willBeSaved ? "Job saved successfully!" : "Job unsaved successfully!",
        );
      }
    } catch (error: any) {
      // Revert on error
      setLocalIsSaved(previousState);
      toast.error(
        error.data?.message || "Failed to save job. Please try again.",
      );
      console.error("Failed to save job:", error);
    }
  };

  const handleShortlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      !checkAuth(async () => {
        await handleShortlistLogic();
      })
    ) {
      return;
    }
  };

  const handleShortlistLogic = async () => {
    const previousState = isSaved;
    const willBeSaved = !isSaved;

    try {
      // Optimistic update
      setLocalIsSaved(willBeSaved);

      const result = isSaved
        ? await unsaveJob(jobData.id).unwrap()
        : await saveJob(jobData.id).unwrap();
      if (result.success) {
        toast.success(
          willBeSaved
            ? "Job shortlisted successfully!"
            : "Job removed from shortlist!",
        );
      }
    } catch (error: any) {
      // Revert on error
      setLocalIsSaved(previousState);
      toast.error(
        error.data?.message || "Failed to update job. Please try again.",
      );
      console.error("Failed to update job:", error);
    }
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      !checkAuth(() => {
        setShowResumeModal(true);
      })
    ) {
      return;
    }
  };

  const handleResumeSubmitSuccess = async (resumeUrl: string) => {
    try {
      const result = await applyJob({ jobId: jobData.id, resumeUrl }).unwrap();
      dispatch(addAppliedJob(result.data));
      setLocalIsApplied(true);
      toast.success("Application submitted successfully!");
    } catch (error: any) {
      const errorMessage =
        error.data?.message || "Failed to apply. Please try again.";
      toast.error(errorMessage);
      console.error("Failed to apply:", error);
    }
  };
  return (
    <div className="bg-linear-to-br from-white to-[#FDF9E3] rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-4 border-b border-gray-200 pb-4">
        <Link
          href={`/jobs/${jobData.id}`}
          className="w-12 h-12 rounded-xl flex items-center justify-center border border-gray-200 bg-white"
        >
          {jobData.image ? (
            <div className="w-12 h-12 rounded-xl overflow-hidden">
              <Image
                src={
                  imgError
                    ? userPlaceholder
                    : `${process.env.NEXT_PUBLIC_BASE_URL}${jobData.image}`
                }
                alt={jobData.company}
                width={48}
                height={48}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            </div>
          ) : (
            <Avatar className="w-12 h-12 rounded-xl">
              <AvatarFallback className="rounded-xl text-sm font-medium">
                {job.creator.creatorId?.firstName?.charAt(0)}
                {job.creator.creatorId?.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            href={`/jobs/${jobData.id}`}
          >
            <h3 className="font-semibold text-gray-900 xl:text-lg cursor-pointer">
              {jobData.company}
            </h3>
          </Link>
          <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
            <MapPin className="w-4 h-4" />
            <span>{jobData.location}</span>
          </div>
        </div>
        <div
          onClick={handleBookmarkClick}
          className="cursor-pointer hover:scale-110 transition-transform duration-200"
        >
          <Bookmark
            className={`w-7 h-7 hover:stroke-yellow-400 transition-colors ${isSaved
                ? "fill-yellow-400 stroke-yellow-400"
                : "hover:fill-yellow-400"
              }`}
          />
        </div>
      </div>

      {/* Applicant avatars */}
      <Link
        href={`/jobs/${jobData.id}`}
        className="cursor-pointer"
        title="View Job Details"
      >
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center rounded-full bg-yellow-300 px-3 py-1 text-xs font-medium">
            {jobData.position}
          </span>
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
            {jobData.contractType === "FullTime" ? "Full Time" : jobData.contractType === "PartTime" ? "Part Time" : jobData.contractType === "Contract" ? "Contract" : "Not specified"}
          </span>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex -space-x-4">
            {jobData.applicantImages.map((image, index: number) => (
              <div key={index} className="relative">
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`Applicant ${index + 1}`}
                  className="w-8 h-8 rounded-full border-2 border-white object-cover"
                />
              </div>
            ))}
            <div className="relative w-8 h-8 rounded-full bg-yellow-300 flex items-center justify-center text-white text-sm font-semibold">
              +
            </div>
          </div>
        </div>

        {/* Bottom section with applicant count, salary, and time */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col gap-1">
            <span className="text-gray-600 text-sm">
              {jobData.applicantCount} Applicant
            </span>
            <div className="flex items-center gap-1 text-gray-400 text-xs">
              <Clock className="w-3 h-3" />
              <span>{jobData.postedTime}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl xl:text-2xl font-bold text-gray-900">
              {jobData.salary}
            </div>
            <div className="text-gray-500 text-sm">/mo</div>
          </div>
        </div>
      </Link>

      {/* action buttons */}
      <div className="border-t border-gray-200 pt-4 flex gap-4 items-center">
        <Button
          variant="outline"
          className={`flex-1 hover:scale-105 transition-transform duration-200 ${isSaved ? "bg-green-50 border-green-500 text-green-700" : ""
            }`}
          onClick={handleShortlistClick}
          disabled={isSavingLoading || isUnsavingLoading}
        >
          {isSavingLoading || isUnsavingLoading ? (
            <>
              <Spinner />
              {isSavingLoading ? "Adding..." : "Removing..."}
            </>
          ) : (
            <>
              <Bookmark
                className={`w-6 h-6 ${isSaved ? "fill-current" : ""}`}
              />
              {isSaved ? "Shortlisted" : "Shortlist"}
            </>
          )}
        </Button>
        <Button
          className={`flex-1 hover:scale-105 transition-transform duration-200 ${isApplied ? "bg-green-500 text-white" : ""
            }`}
          disabled={isApplied || isApplyingLoading}
          onClick={handleApplyClick}
        >
          {isApplyingLoading ? (
            <>
              <Spinner />
              Applying...
            </>
          ) : (
            <>{isApplied ? "Applied" : "Apply"}</>
          )}
        </Button>
      </div>

      <UploadResumeModal
        isOpen={showResumeModal}
        onClose={() => setShowResumeModal(false)}
        jobId={jobData.id}
        onSubmitSuccess={handleResumeSubmitSuccess}
      />

      {/* Login Required Modal */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={handleCloseModal}
        onLogin={handleLogin}
        message="Please log in to continue."
      />
    </div>
  );
}
