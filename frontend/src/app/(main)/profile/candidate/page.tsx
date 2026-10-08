"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Award,
  Upload,
  Mail,
  BadgeCheck,
  Clock,
  XCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  useUpdateProfileImageMutation,
  useUpdateBannerImageMutation,
} from "@/redux/features/user/userApi";
import { useRequestAdminVerificationMutation } from "@/redux/features/adminVerification/adminVerificationApi";
import UploadResumeModal from "@/components/modals/UploadResumeModal";
import EditProfileModal from "@/components/modals/EditProfileModal";
import EditPlayerDetailsModal from "@/components/modals/EditPlayerDetailsModal";
import { useAppSelector } from "@/redux/hooks";
import { ProfileSkeleton } from "@/components/skeleton";
import ExperienceSection from "@/components/profile/ExperienceSection";
import CertificateSection from "@/components/profile/CertificateSection";
import EducationSection from "@/components/profile/EducationSection";
import VideoSection from "@/components/profile/VideoSection";
import ProfileBanner from "@/components/profile/ProfileBanner";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import AnalyticsSection from "@/components/profile/AnalyticsSection";

export default function MyProfilePage() {
  // Get user data from Redux store
  const currentUser = useAppSelector((state) => state.auth.user);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isEditPlayerDetailsModalOpen, setIsPlayerDetailsModalOpen] =
    useState(false);

  const [isLoading, setIsLoading] = useState(true);

  // API mutations
  const [updateProfileImage, { isLoading: isUpdatingProfile }] =
    useUpdateProfileImageMutation();
  const [updateBannerImage, { isLoading: isUpdatingBanner }] =
    useUpdateBannerImageMutation();
  const [requestAdminVerification, { isLoading: isRequestingVerification }] =
    useRequestAdminVerificationMutation();

  // Handler for profile image update
  const handleProfileImageUpdate = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      await updateProfileImage(formData).unwrap();
      toast.success("Profile image updated successfully");
    } catch (error) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error.data as { message?: string })?.message
          : "Failed to update profile image";
      toast.error(errorMessage);
      throw error; // Re-throw to let component handle cleanup
    }
  };

  // Handler for banner image update
  const handleBannerImageUpdate = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("banner", file);

      await updateBannerImage(formData).unwrap();
      toast.success("Banner image updated successfully");
    } catch (error) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error.data as { message?: string })?.message
          : "Failed to update banner image";
      toast.error(errorMessage);
      throw error; // Re-throw to let component handle cleanup
    }
  };

  // Handler for admin verification request
  const handleRequestVerification = async () => {
    try {
      await requestAdminVerification().unwrap();
      toast.success("Verification request submitted successfully");
    } catch (error) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error.data as { message?: string })?.message
          : "Failed to submit verification request";
      toast.error(errorMessage);
    }
  };

  // Get verification status
  const verificationStatus = currentUser?.adminVerificationStatus;

  // Render verification badge button based on status
  const renderVerificationBadge = () => {
    // Don't show button when verified - badge is shown next to name
    if (verificationStatus?.status === "approved") {
      return null;
    }

    if (
      verificationStatus?.status === "pending" ||
      verificationStatus?.hasRequest
    ) {
      return (
        <Button
          variant="outline"
          className="rounded-full bg-yellow-50 border-yellow-200 text-yellow-700 cursor-default"
        >
          <Clock size={20} height={20} /> Verification Pending
        </Button>
      );
    }

    if (verificationStatus?.status === "rejected") {
      return (
        <Button
          variant="outline"
          className="rounded-full bg-red-50 border-red-200 text-red-700"
          onClick={handleRequestVerification}
          disabled={isRequestingVerification}
        >
          <XCircle size={20} height={20} />{" "}
          {isRequestingVerification ? "Requesting..." : "Request Again"}
        </Button>
      );
    }

    // Default: No request yet
    return (
      <Button
        variant="outline"
        className="rounded-full"
        onClick={handleRequestVerification}
        disabled={isRequestingVerification}
      >
        <Award size={20} height={20} />{" "}
        {isRequestingVerification ? "Requesting..." : "Add Verification Badge"}
      </Button>
    );
  };

  // Prepare display data from Redux store
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";
  const displayName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
    : "User";

  const displayAvatar = currentUser?.profileImage
    ? `${BASE_URL}${currentUser.profileImage}`
    : null;

  const displayBanner = currentUser?.bannerImage
    ? `${BASE_URL}${currentUser.bannerImage}`
    : null;

  const displayRole = currentUser?.role;

  // Handle loading state
  useEffect(() => {
    if (currentUser) {
      // Simulate minimal loading time for smooth transition
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentUser]);

  // Show loading skeleton while data is loading
  if (isLoading || !currentUser) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="px-4">
      {/* Banner and Profile Picture Section */}
      <div className="relative mb-8">
        <ProfileBanner
          bannerUrl={displayBanner}
          onBannerUpdate={handleBannerImageUpdate}
          isUpdating={isUpdatingBanner}
        />
        <ProfileAvatar
          avatarUrl={displayAvatar}
          displayName={displayName}
          onAvatarUpdate={handleProfileImageUpdate}
          isUpdating={isUpdatingProfile}
        />
      </div>

      {/* Profile Info */}
      <div className="mt-20 mb-8 px-4">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            {displayName}
            {verificationStatus?.status === "approved" && (
              <BadgeCheck className="h-6 w-6 text-blue-500" />
            )}
          </h2>

          {/* Contact Information */}
          <div className="flex flex-wrap gap-4 mt-2 mb-4 text-gray-600">
            {currentUser?.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{currentUser.email}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 flex-wrap mt-4">
            {displayRole && (
              <Badge className="bg-yellow-300 border-yellow-200 px-4 rounded-full">
                {displayRole}
              </Badge>
            )}
            {renderVerificationBadge()}
            <Button
              variant="outline"
              className="flex items-center rounded-full"
              onClick={() => setIsUploadModalOpen(true)}
            >
              <Upload size={20} height={20} />
              Upload Resume
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 border rounded-2xl shadow">
        {/* ------------------------Profile  Information Section------------------- */}
        <div className="bg-white rounded-lg border shadow border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-md md:text-xl font-semibold text-gray-900">
              Profile Information
            </h2>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
                onClick={() => setIsEditProfileModalOpen(true)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Personal Information Fields */}
            {currentUser?.profile?.dateOfBirth && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Date of birth
                </label>
                <p className="text-gray-900 font-medium">
                  {new Date(currentUser.profile.dateOfBirth).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
              </div>
            )}

            {currentUser?.profile?.placeOfBirth && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Place of birth
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.placeOfBirth}
                </p>
              </div>
            )}

            {currentUser?.profile?.nationality && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Nationality
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.nationality}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm text-gray-500 mb-1 block">
                Phone number
              </label>
              <p className="text-gray-900 font-medium">
                {currentUser?.profile?.phoneNumber
                  ? currentUser.profile.phoneNumber
                  : "N/A"}
              </p>
            </div>

            {/* Professional Information Fields */}
            {currentUser?.profile?.gender && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Gender
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.gender}
                </p>
              </div>
            )}

            {currentUser?.profile?.position && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Position
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.position}
                </p>
              </div>
            )}

            {currentUser?.profile?.height && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Height
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.height.size}{" "}
                  {currentUser.profile.height.unit}
                </p>
              </div>
            )}

            {currentUser?.profile?.weight && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Weight
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.weight.size}{" "}
                  {currentUser.profile.weight.unit}
                </p>
              </div>
            )}

            {currentUser?.profile?.currentClub && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Current Club
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.currentClub}
                </p>
              </div>
            )}

            {currentUser?.profile?.availability && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Availability
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.availability}
                </p>
              </div>
            )}

            {currentUser?.profile?.foot && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Foot</label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.foot}
                </p>
              </div>
            )}

            {currentUser?.profile?.league && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  League
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.league}
                </p>
              </div>
            )}

            {currentUser?.profile?.country && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Country
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.country}
                </p>
              </div>
            )}

            {currentUser?.profile?.agent && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Agent
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.agent}
                </p>
              </div>
            )}

            {currentUser?.profile?.socialMedia && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Social Media
                </label>
                <p className="text-blue-600 font-medium cursor-pointer hover:underline break-all">
                  {currentUser.profile.socialMedia}
                </p>
              </div>
            )}

            {/* Professional Player specific fields */}
            {currentUser?.profile?.contractExpires && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Contract Expires
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.contractExpires}
                </p>
              </div>
            )}

            {currentUser?.profile?.division && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Division
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.division}
                </p>
              </div>
            )}

            {currentUser?.profile?.nationalTeamCategory && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  National Team Category
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.nationalTeamCategory}
                </p>
              </div>
            )}

            {currentUser?.profile?.nationalTeamGames && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  National Team Games
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.nationalTeamGames}
                </p>
              </div>
            )}

            {currentUser?.profile?.teamsJoined && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Teams Joined
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.teamsJoined}
                </p>
              </div>
            )}

            {/* College/High School specific fields */}
            {currentUser?.profile?.schoolName && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  School Name
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.schoolName}
                </p>
              </div>
            )}

            {currentUser?.profile?.collegeOrUniversity && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  College/University
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.collegeOrUniversity}
                </p>
              </div>
            )}

            {currentUser?.profile?.diploma && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Diploma
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.diploma}
                </p>
              </div>
            )}

            {currentUser?.profile?.gpa && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">GPA</label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.gpa}
                </p>
              </div>
            )}

            {currentUser?.profile?.satOrAct && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  SAT/ACT
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.satOrAct}
                </p>
              </div>
            )}

            {currentUser?.profile?.category && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Category
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.category}
                </p>
              </div>
            )}

            {/* Office Staff specific fields */}
            {currentUser?.profile?.languages && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Languages
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.languages}
                </p>
              </div>
            )}

            {/* Office Staff specific fields */}
            {currentUser?.aiProfileScore && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                 Profile Quality Score
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.aiProfileScore}/100
                </p>
              </div>
            )}
            {/* Office Staff specific fields */}
            {currentUser?.profile?.AiVideoVideoScore && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Video AI Score
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.AiVideoVideoScore}/100
                </p>
              </div>
            )}
          </div>
        </div>

        {/* -------------------------Analytics----------------------- */}
        <AnalyticsSection />

        {/* ------------------ Experience, Certificate, Education, and Video Sections --------------------*/}
        <ExperienceSection userId={currentUser?._id || ""} />
        <CertificateSection userId={currentUser?._id || ""} />
        <EducationSection userId={currentUser?._id || ""} />
        <VideoSection
          videos={currentUser?.profile?.videos || []}
          userId={currentUser?._id || ""}
        />
      </div>

      {/* ------------------Modals --------------------*/}
      <UploadResumeModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        mode="profile"
      />
      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        initialData={currentUser?.profile || {}}
        userRole={currentUser?.role || ""}
        userType={currentUser?.userType || "candidate"}
      />
      <EditPlayerDetailsModal
        isOpen={isEditPlayerDetailsModalOpen}
        onClose={() => setIsPlayerDetailsModalOpen(false)}
        initialData={currentUser?.profile || {}}
      />
    </div>
  );
}
