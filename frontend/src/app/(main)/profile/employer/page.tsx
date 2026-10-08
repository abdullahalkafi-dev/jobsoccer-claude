"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import {
  Award,
  Edit,
  BadgeCheck,
  Clock,
  XCircle,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import {
  useUpdateProfileImageMutation,
  useUpdateBannerImageMutation,
} from "@/redux/features/user/userApi";
import { useRequestAdminVerificationMutation } from "@/redux/features/adminVerification/adminVerificationApi";
import { useAppSelector } from "@/redux/hooks";
import { ProfileSkeleton } from "@/components/skeleton";
import ProfileBanner from "@/components/profile/ProfileBanner";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import EditEmployerPersonalInformationModal from "@/components/modals/EditEmployerPersonalInformationModal";
import { detectSocialPlatform, formatUrl } from "@/utils/socialMedia";

export default function EmployerProfilePage() {
  // Get user data from Redux store
  const currentUser = useAppSelector((state) => state.auth.user);

  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
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
      throw error;
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
      throw error;
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

  // Format founded date
  const formatFoundedDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="px-4 w-full">
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
          </div>


        </div>
      </div>

      <div className="p-4 md:p-6 border rounded-2xl shadow">
        {/* Overview Section */}
        {currentUser?.profile?.clubDescription && (
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
              Overview
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {currentUser.profile.clubDescription}
            </p>
          </div>
        )}

        {/* Professional Information Section */}
        <div className="bg-white rounded-lg border shadow border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Professional Information
            </h2>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Club Name */}
            {currentUser?.profile?.clubName && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Club Name
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.clubName}
                </p>
              </div>
            )}

            {/* Country */}
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

            {/* Phone Number */}
            <div>
              <label className="text-sm text-gray-500 mb-1 block">
                Phone number
              </label>
              <p className="text-gray-900 font-medium">
                {currentUser?.profile?.phoneNumber || "N/A"}
              </p>
            </div>

            {/* Website */}
            {currentUser?.profile?.website && (() => {
              const platform = detectSocialPlatform(currentUser.profile.website);
              const PlatformIcon = platform.Icon;
              return (
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">
                    {platform.name}
                  </label>
                  <p className={`font-medium cursor-pointer hover:underline flex items-center gap-2 text-sm ${platform.colorClass}`}>
                    <PlatformIcon className="h-4 w-4 shrink-0" />
                    <a
                      href={formatUrl(currentUser.profile.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate"
                    >
                      {currentUser.profile.website}
                    </a>
                  </p>
                </div>
              );
            })()}

            {/* Address */}
            {currentUser?.profile?.address && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Address
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.address}
                </p>
              </div>
            )}

            {/* Location */}
            {currentUser?.profile?.location && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Location
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.location}
                </p>
              </div>
            )}

            {/* Founded */}
            {currentUser?.profile?.founded && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Founded
                </label>
                <p className="text-gray-900 font-medium">
                  {formatFoundedDate(currentUser.profile.founded)}
                </p>
              </div>
            )}

            {/* Level */}
            {currentUser?.profile?.level && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Level
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.level}
                </p>
              </div>
            )}

            {/* Nationality */}
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

            {/* Club Contact */}
            {currentUser?.profile?.clubContact && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Club Contact
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.profile.clubContact}
                </p>
              </div>
            )}

            {/* Profile Score */}
            {currentUser?.aiProfileScore && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Profile Quality Score
                </label>
                <p className="text-gray-900 font-medium">
                  {currentUser.aiProfileScore}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditEmployerPersonalInformationModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        initialData={currentUser?.profile || {}}
      />
    </div>
  );
}
