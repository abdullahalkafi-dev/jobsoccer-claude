"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BadgeCheck,
  Mail,
  XCircle,
  UserPlus,
  UserMinus,
  MapPin,
  Phone,
  Calendar,
} from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { ProfileSkeleton } from "@/components/skeleton/ProfileSkeleton";
import { useAppSelector } from "@/redux/hooks";
import { StartChatButton } from "@/components/messaging/StartChatButton";
import {
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "@/redux/features/follow/followApi";
import { AgentRatingComponent } from "@/components/shared/AgentRatingComponent";
import { useGetEmployerByIdQuery } from "@/redux/features/employer/employerApi";
import { detectSocialPlatform, formatUrl } from "@/utils/socialMedia";
import Link from "next/link";

export default function EmployerDetailsPage() {
  const params = useParams();
  const employerId = params?.id as string;
  const currentUser = useAppSelector((state) => state.auth.user);

  // Check if viewing own profile
  const isOwnProfile = currentUser?._id === employerId;

  // Fetch employer data
  const {
    data: employerData,
    isLoading: isLoadingEmployer,
    error: employerError,
  } = useGetEmployerByIdQuery(employerId, {
    skip: !employerId,
  });

  // Follow/Unfollow mutations
  const [followEmployer, { isLoading: isFollowLoading }] =
    useFollowUserMutation();
  const [unfollowEmployer, { isLoading: isUnfollowLoading }] =
    useUnfollowUserMutation();

  // Local state for optimistic updates
  const [localIsFollowing, setLocalIsFollowing] = React.useState<
    boolean | null
  >(null);
  const [localFollowerCount, setLocalFollowerCount] = React.useState<
    number | null
  >(null);

  const employer = employerData?.data;

  // Use local state if available, otherwise use API data
  const isFollowing = localIsFollowing ?? employer?.isFollowing ?? false;
  const followerCount = localFollowerCount ?? employer?.followerCount ?? 0;
  const isLoading = isFollowLoading || isUnfollowLoading;

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!currentUser) {
      toast.error("Please log in to follow employers");
      return;
    }

    const previousState = isFollowing;
    const previousCount = followerCount;

    try {
      // Optimistic update
      setLocalIsFollowing(!isFollowing);
      setLocalFollowerCount(
        isFollowing ? followerCount - 1 : followerCount + 1
      );

      if (isFollowing) {
        // Unfollow
        await unfollowEmployer(employerId).unwrap();
        toast.success("Unfollowed successfully");
      } else {
        // Follow
        await followEmployer(employerId).unwrap();
        toast.success("Followed successfully");
      }
    } catch (error) {
      // Revert on error
      setLocalIsFollowing(previousState);
      setLocalFollowerCount(previousCount);
      const err = error as { data?: { message?: string } };
      toast.error(
        err?.data?.message ||
        `Failed to ${isFollowing ? "unfollow" : "follow"} employer`
      );
    }
  };

  // Prepare display data
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";
  const displayName = employer
    ? `${employer.firstName} ${employer.lastName}`.trim()
    : "Employer";

  const displayAvatar = employer?.profileImage
    ? `${BASE_URL}${employer.profileImage}`
    : null;

  const displayBanner = employer?.bannerImage
    ? `${BASE_URL}${employer.bannerImage}`
    : null;

  const displayRole = employer?.role;

  // Get verification status
  const verificationStatus = employer?.adminVerificationStatus;

  // Format founded date
  const formatFoundedDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Loading state
  if (isLoadingEmployer) {
    return <ProfileSkeleton />;
  }

  // Error state
  if (employerError || !employer) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Employer Not Found
            </h3>
            <p className="text-gray-600">
              The employer profile you&apos;re looking for doesn&apos;t exist or
              has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6 lg:px-8 container mx-auto relative pb-16">
      {/* Banner Section */}
      <div className="relative mb-6 sm:mb-8 h-40 sm:h-48 md:h-64 rounded-lg sm:rounded-2xl overflow-hidden bg-linear-to-r from-yellow-50 to-yellow-500">
        {displayBanner && (
          <Image
            src={displayBanner}
            alt="Banner"
            fill
            className="object-cover"
          />
        )}
      </div>

      {/* Profile Avatar */}
      <div className="relative -mt-20 sm:-mt-24 md:-mt-32 mb-6 sm:mb-8 px-2 sm:px-4">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
          <div className="relative">
            {displayAvatar ? (
              <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white mx-auto sm:mx-0">
                <Image
                  src={displayAvatar}
                  alt={displayName}
                  width={160}
                  height={160}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <Avatar className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 border-4 border-white shadow-lg mx-auto sm:mx-0">
                <AvatarFallback className="text-2xl sm:text-3xl md:text-4xl font-medium bg-linear-to-br from-yellow-50 to-yellow-500">
                  {employer?.firstName?.charAt(0)}
                  {employer?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="flex-1 min-w-0 bg-white px-6 sm:px-6 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              {displayName}
              {verificationStatus?.status === "approved" && (
                <BadgeCheck className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 shrink-0" />
              )}
            </h2>

            {/* Contact Information */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 mt-2 mb-4 text-gray-600 text-sm">
              {employer?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" />
                  <Link href={`mailto:${employer.email}`} className="text-sm truncate hover:underline cursor-pointer">{employer.email}</Link>
                </div>
              )}
              {employer?.profile?.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="truncate">{employer.profile.location}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {displayRole && (
                <Badge className="bg-yellow-300  border-yellow-200 px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm">
                  {displayRole}
                </Badge>
              )}
              {employer?.profile?.clubName && (
                <Badge className="bg-green-100 text-green-800 border-green-200 px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm">
                  {employer.profile.clubName}
                </Badge>
              )}
            </div>
          </div>

          {/* Action Buttons - Hide on own profile */}
          {!isOwnProfile && (
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <StartChatButton
                userId={employerId}
                userName={displayName}
                className="flex items-center justify-center gap-2 flex-1 sm:flex-none text-sm"
              />
              <Button
                variant="outline"
                onClick={handleFollowToggle}
                disabled={isLoading}
                className={`flex items-center justify-center gap-2 flex-1 sm:flex-none text-sm ${isFollowing
                    ? "bg-green-50 border-green-500 text-green-700"
                    : ""
                  }`}
              >
                {isLoading ? (
                  <>{isFollowing ? "Unfollowing..." : "Following..."}</>
                ) : (
                  <>
                    {isFollowing ? (
                      <>
                        <UserMinus className="h-4 w-4" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        Follow
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="p-4 sm:p-6 border rounded-lg sm:rounded-2xl shadow bg-white">
        {/* Overview Section */}
        {employer?.profile?.clubDescription && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
              Overview
            </h2>
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
              {employer.profile.clubDescription}
            </p>
          </div>
        )}

        {/* Agent Rating Section - Only show for agents */}
        {employer?.role === "Agent" && employer?.userType === "employer" && (
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
              Agent Rating
            </h2>
            <AgentRatingComponent
              agentUserId={employerId}
              agentRole={employer.role}
              agentUserType={employer.userType}
            />
          </div>
        )}

        {/* Professional Information Section */}
        <div className="bg-white rounded-lg border shadow border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Professional Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-8 sm:gap-y-6">
            {/* Club Name */}
            {employer?.profile?.clubName && (
              <div>
                <label className="text-xs sm:text-sm text-gray-500 mb-1 block">
                  Club Name
                </label>
                <p className="text-gray-900 font-medium text-sm sm:text-base">
                  {employer.profile.clubName}
                </p>
              </div>
            )}

            {/* Country */}
            {employer?.profile?.country && (
              <div>
                <label className="text-xs sm:text-sm text-gray-500 mb-1 block">
                  Country
                </label>
                <p className="text-gray-900 font-medium text-sm sm:text-base">
                  {employer.profile.country}
                </p>
              </div>
            )}

            {/* Phone Number */}
            {employer?.profile?.phoneNumber && (
              <div>
                <label className="text-xs sm:text-sm text-gray-500 mb-1 block">
                  Phone Number
                </label>
                <p className="text-gray-900 font-medium flex items-center gap-2 text-sm sm:text-base">
                  <Phone className="h-4 w-4 text-gray-500 shrink-0" />
                  <span className="truncate">
                    {employer.profile.phoneNumber}
                  </span>
                </p>
              </div>
            )}

            {/* Website */}
            {employer?.profile?.website && (() => {
              const platform = detectSocialPlatform(employer.profile.website);
              const PlatformIcon = platform.Icon;
              return (
                <div>
                  <label className="text-xs sm:text-sm text-gray-500 mb-1 block">
                    {platform.name}
                  </label>
                  <p className={`font-medium cursor-pointer hover:underline text-sm sm:text-base ${platform.colorClass}`}>
                    <Link
                      href={formatUrl(employer.profile.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate flex items-center gap-2"
                    >
                      <PlatformIcon className="h-4 w-4 shrink-0" />
                      {employer.profile.website}
                    </Link>
                  </p>
                </div>
              );
            })()}

            {/* Address */}
            {employer?.profile?.address && (
              <div>
                <label className="text-xs sm:text-sm text-gray-500 mb-1 block">
                  Address
                </label>
                <p className="text-gray-900 font-medium flex items-start gap-2 text-sm sm:text-base">
                  <MapPin className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" />
                  <span>{employer.profile.address}</span>
                </p>
              </div>
            )}

            {/* Location */}
            {employer?.profile?.location && (
              <div>
                <label className="text-xs sm:text-sm text-gray-500 mb-1 block">
                  Location
                </label>
                <p className="text-gray-900 font-medium text-sm sm:text-base">
                  {employer.profile.location}
                </p>
              </div>
            )}

            {/* Founded */}
            {employer?.profile?.founded && (
              <div>
                <label className="text-xs sm:text-sm text-gray-500 mb-1 block">
                  Founded
                </label>
                <p className="text-gray-900 font-medium flex items-center gap-2 text-sm sm:text-base">
                  <Calendar className="h-4 w-4 text-gray-500 shrink-0" />
                  {formatFoundedDate(employer.profile.founded)}
                </p>
              </div>
            )}

            {/* Level */}
            {employer?.profile?.level && (
              <div>
                <label className="text-xs sm:text-sm text-gray-500 mb-1 block">
                  Level
                </label>
                <p className="text-gray-900 font-medium text-sm sm:text-base">
                  {employer.profile.level}
                </p>
              </div>
            )}

            {/* Nationality */}
            {employer?.profile?.nationality && (
              <div>
                <label className="text-xs sm:text-sm text-gray-500 mb-1 block">
                  Nationality
                </label>
                <p className="text-gray-900 font-medium text-sm sm:text-base">
                  {employer.profile.nationality}
                </p>
              </div>
            )}

            {/* Club Contact */}
            {employer?.profile?.clubContact && (
              <div>
                <label className="text-xs sm:text-sm text-gray-500 mb-1 block">
                  Club Contact
                </label>
                <p className="text-gray-900 font-medium text-sm sm:text-base">
                  {employer.profile.clubContact}
                </p>
              </div>
            )}

            {/* Follower Count */}
            <div>
              <label className="text-xs sm:text-sm text-gray-500 mb-1 block">
                Followers
              </label>
              <p className="text-gray-900 font-medium text-sm sm:text-base">
                {followerCount}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
