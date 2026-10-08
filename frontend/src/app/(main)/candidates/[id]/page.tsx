"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BadgeCheck, Mail, XCircle, Lock, UserPlus, UserMinus } from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  useCheckFriendshipStatusQuery,
  useSendFriendRequestMutation,
} from "@/redux/features/user/userApi";
import {
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "@/redux/features/follow/followApi";
import { ProfileSkeleton } from "@/components/skeleton/ProfileSkeleton";
import AccessRequestModal from "@/components/modals/AccessRequestModal";
import ExperienceSection from "@/components/profile/ExperienceSection";
import CertificateSection from "@/components/profile/CertificateSection";
import EducationSection from "@/components/profile/EducationSection";
import VideoSection from "@/components/profile/VideoSection";
import AnalyticsSection from "@/components/profile/AnalyticsSection";
import { useAppSelector } from "@/redux/hooks";
import { StartChatButton } from "@/components/messaging/StartChatButton";
import { useGetCandidateByIdQuery } from "@/redux/features/candidate/candidateApi";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function UserProfilePage() {
  const params = useParams();
  const userId = params?.id as string;
  const currentUser = useAppSelector((state) => state.auth.user);

  const [isAccessModalOpen, setIsAccessModalOpen] = useState(true);

  // Check if viewing own profile
  const isOwnProfile = currentUser?._id === userId;

  // Fetch user data
  const {
    data: userData,
    isLoading: isLoadingUser,
    error: userError,
  } = useGetCandidateByIdQuery(userId, {
    skip: !userId,
  });

  // Check friendship status
  const { data: friendshipData, isLoading: isLoadingFriendship } =
    useCheckFriendshipStatusQuery(userId, {
      skip: !userId,
    });

  // Send friend request mutation
  const [sendFriendRequest, { isLoading: isSendingRequest }] =
    useSendFriendRequestMutation();

  // Follow/Unfollow mutations
  const [followCandidate, { isLoading: isFollowLoading }] =
    useFollowUserMutation();
  const [unfollowCandidate, { isLoading: isUnfollowLoading }] =
    useUnfollowUserMutation();

  // Local state for optimistic updates
  const [localIsFollowing, setLocalIsFollowing] = useState<
    boolean | null
  >(null);
  const [localFollowerCount, setLocalFollowerCount] = useState<
    number | null
  >(null);

  const user = userData?.data;

  // Use local state if available, otherwise use API data
  const isFollowing = localIsFollowing ?? user?.isFollowing ?? false;
  const followerCount = localFollowerCount ?? user?.followerCount ?? 0;
  const isFollowMutating = isFollowLoading || isUnfollowLoading;

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!currentUser) {
      toast.error("Please log in to follow candidates");
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
        await unfollowCandidate(userId).unwrap();
        toast.success("Unfollowed successfully");
      } else {
        // Follow
        await followCandidate(userId).unwrap();
        toast.success("Followed successfully");
      }
    } catch (error) {
      // Revert on error
      setLocalIsFollowing(previousState);
      setLocalFollowerCount(previousCount);
      const err = error as { data?: { message?: string } };
      toast.error(
        err?.data?.message ||
        `Failed to ${isFollowing ? "unfollow" : "follow"} candidate`
      );
    }
  };
  const areFriends = friendshipData?.data?.areFriends || false;
  const isAdmin = (currentUser?.userType as string) === "admin" || currentUser?.role === "admin";
  const hasAccess = areFriends || isAdmin || isOwnProfile;

  // Handle friend request
  const handleRequestAccess = async () => {
    try {
      await sendFriendRequest(userId).unwrap();
      toast.success("Friend request sent successfully");
    } catch (error) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to send friend request");
    }
  };

  // Prepare display data
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";
  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "User";

  const displayAvatar = user?.profileImage
    ? `${BASE_URL}${user.profileImage}`
    : null;

  const displayBanner = user?.bannerImage
    ? `${BASE_URL}${user.bannerImage}`
    : null;

  const displayRole = user?.role;

  // Get verification status
  const verificationStatus = user?.adminVerificationStatus;

  // Loading state
  if (isLoadingUser || isLoadingFriendship) {
    return <ProfileSkeleton />;
  }

  // Error state
  if (userError || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              User Not Found
            </h3>
            <p className="text-gray-600">
              The user profile you&apos;re looking for doesn&apos;t exist or has
              been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 container mx-auto relative">
      {/* Banner Section - Always Visible */}
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

      {/* Profile Avatar - Always Visible */}
      <div className="relative -mt-20 sm:-mt-24 md:-mt-32 mb-6 sm:mb-8 px-2 sm:px-4">
        <div className="flex items-end gap-4">
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
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </div>

      {/* Profile Info - Always Visible */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 justify-between mb-6 sm:mb-8 px-2 sm:px-4">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex flex-wrap items-center gap-2">
            {displayName}
            {verificationStatus?.status === "approved" && (
              <BadgeCheck className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 shrink-0" />
            )}
          </h2>

          {/* Show email only to friends */}
          {hasAccess && user?.email && (
            <div className="flex flex-wrap gap-3 sm:gap-4 mt-2 mb-3 sm:mb-4 text-gray-600 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <Link href={`mailto:${user.email}`} className="text-sm truncate hover:underline cursor-pointer">{user.email}</Link>
              </div>
            </div>
          )}

          <div className="flex gap-2 flex-wrap mt-3 sm:mt-4">
                {displayRole && (
                <Badge className="bg-yellow-300 border-yellow-200 px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm">
                  {displayRole}
                </Badge>
              )}
              {!hasAccess && verificationStatus?.status === "approved" && (
                <Badge className="bg-blue-50 text-blue-700 border-blue-200 px-2 sm:px-3 py-1 rounded-full flex items-center gap-1 text-xs sm:text-sm">
                  <BadgeCheck className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                  Verified
                </Badge>
              )}
          </div>
        </div>
        {/* Action Buttons - Hide on own profile */}
        {!isOwnProfile && (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <StartChatButton
              userId={userId}
              userName={displayName}
              className="flex items-center justify-center gap-2 flex-1 sm:flex-none text-sm"
            />
            <Button
              variant="outline"
              onClick={handleFollowToggle}
              disabled={isFollowMutating}
              className={`flex items-center justify-center gap-2 flex-1 sm:flex-none text-sm ${
                isFollowing ? "bg-green-50 border-green-500 text-green-700" : ""
              }`}
            >
              {isFollowMutating ? (
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

      {/* Profile Information Section - Conditional Rendering */}
      <div className={!hasAccess ? "filter blur-sm pointer-events-none" : ""}>
        {hasAccess ? (
          // Full profile view for friends
          <div className="p-4 sm:p-6 border rounded-lg sm:rounded-2xl shadow">
            {/* Profile Information Section */}
            <div className="bg-white rounded-lg border shadow border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Profile Information
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-4 sm:gap-y-6">
                {/* Personal Information Fields */}
                {user?.profile?.nationality && (
                  <div>
                    <label className="text-xs sm:text-sm text-gray-500 mb-1 block">
                      Nationality
                    </label>
                    <p className="text-gray-900 font-medium text-sm sm:text-base">
                      {user.profile.nationality}
                    </p>
                  </div>
                )}
                {user?.profile?.gender && (
                  <div>
                    <label className="text-xs sm:text-sm text-gray-500 mb-1 block">
                      Gender
                    </label>
                    <p className="text-gray-900 font-medium text-sm sm:text-base">
                      {user.profile.gender}
                    </p>
                  </div>
                )}

                {user?.profile?.position && (
                  <div>
                    <label className="text-xs sm:text-sm text-gray-500 mb-1 block">
                      Position
                    </label>
                    <p className="text-gray-900 font-medium text-sm sm:text-base">
                      {user.profile.position}
                    </p>
                  </div>
                )}

                {user?.profile?.height && (
                  <div>
                    <label className="text-xs sm:text-sm text-gray-500 mb-1 block">
                      Height
                    </label>
                    <p className="text-gray-900 font-medium text-sm sm:text-base">
                      {user.profile.height.size} {user.profile.height.unit}
                    </p>
                  </div>
                )}

                {user?.profile?.weight && (
                  <div>
                    <label className="text-xs sm:text-sm text-gray-500 mb-1 block">
                      Weight
                    </label>
                    <p className="text-gray-900 font-medium text-sm sm:text-base">
                      {user.profile.weight.size} {user.profile.weight.unit}
                    </p>
                  </div>
                )}

                {user?.profile?.currentClub && (
                  <div>
                    <label className="text-xs sm:text-sm text-gray-500 mb-1 block">
                      Current Club
                    </label>
                    <p className="text-gray-900 font-medium text-sm sm:text-base">
                      {user.profile.currentClub}
                    </p>
                  </div>
                )}

                {user?.profile?.availability && (
                  <div>
                    <label className="text-xs sm:text-sm text-gray-500 mb-1 block">
                      Availability
                    </label>
                    <p className="text-gray-900 font-medium text-sm sm:text-base">
                      {user.profile.availability}
                    </p>
                  </div>
                )}

                {user?.profile?.foot && (
                  <div>
                    <label className="text-xs sm:text-sm text-gray-500 mb-1 block">
                      Foot
                    </label>
                    <p className="text-gray-900 font-medium text-sm sm:text-base">
                      {user.profile.foot}
                    </p>
                  </div>
                )}

                {user?.profile?.league && (
                  <div>
                    <label className="text-xs sm:text-sm text-gray-500 mb-1 block">
                      League
                    </label>
                    <p className="text-gray-900 font-medium text-sm sm:text-base">
                      {user.profile.league}
                    </p>
                  </div>
                )}

                {user?.profile?.country && (
                  <div>
                    <label className="text-xs sm:text-sm text-gray-500 mb-1 block">
                      Country
                    </label>
                    <p className="text-gray-900 font-medium text-sm sm:text-base">
                      {user.profile.country}
                    </p>
                  </div>
                )}

                {user?.profile?.agent && (
                  <div>
                    <label className="text-xs sm:text-sm text-gray-500 mb-1 block">
                      Agent
                    </label>
                    <p className="text-gray-900 font-medium text-sm sm:text-base">
                      {user.profile.agent}
                    </p>
                  </div>
                )}

                {user?.profile?.socialMedia && (
                  <div>
                    <label className="text-xs sm:text-sm text-gray-500 mb-1 block">
                      Social Media
                    </label>
                    <p className="text-gray-900 font-medium text-sm sm:text-base">
                      {user.profile.socialMedia}
                    </p>
                  </div>
                )}

                {user?.profile?.schoolName && (
                  <div>
                    <label className="text-xs sm:text-sm text-gray-500 mb-1 block">
                      School Name
                    </label>
                    <p className="text-gray-900 font-medium text-sm sm:text-base">
                      {user.profile.schoolName}
                    </p>
                  </div>
                )}

                {user?.profile?.collegeOrUniversity && (
                  <div>
                    <label className="text-xs sm:text-sm text-gray-500 mb-1 block">
                      College/University
                    </label>
                    <p className="text-gray-900 font-medium text-sm sm:text-base">
                      {user.profile.collegeOrUniversity}
                    </p>
                  </div>
                )}

                {user?.profile?.diploma && (
                  <div>
                    <label className="text-xs sm:text-sm text-gray-500 mb-1 block">
                      Diploma
                    </label>
                    <p className="text-gray-900 font-medium text-sm sm:text-base">
                      {user.profile.diploma}
                    </p>
                  </div>
                )}


                {user?.aiProfileScore >= 0 && (
                  <div>
                    <label className="text-xs sm:text-sm text-gray-500 mb-1 block">
                      Profile Quality Score
                    </label>
                    <p className="text-gray-900 font-medium text-sm sm:text-base">
                      {user.aiProfileScore}/100
                    </p>
                  </div>
                )}

                {user?.profile?.AiVideoVideoScore >= 0 && (
                  <div>
                    <label className="text-xs sm:text-sm text-gray-500 mb-1 block">
                      Video AI Score
                    </label>
                    <p className="text-gray-900 font-medium text-sm sm:text-base">
                      {user.profile.AiVideoVideoScore}/100
                    </p>
                  </div>
                )}

                {/* Followers Count */}
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

            {/* Additional Sections */}
            <AnalyticsSection />
            <ExperienceSection
              userId={user?._id || ""}
              readOnly={!isOwnProfile}
            />
            <CertificateSection
              userId={user?._id || ""}
              readOnly={!isOwnProfile}
            />
            <EducationSection
              userId={user?._id || ""}
              readOnly={!isOwnProfile}
            />
            <VideoSection
              videos={user?.profile?.videos || []}
              userId={user?._id || ""}
              readOnly={!isOwnProfile}
            />
          </div>
        ) : (
          // Restricted view placeholder for non-friends
          <div className="p-4 sm:p-6 border rounded-lg sm:rounded-2xl shadow">
            <Card className="bg-white border-gray-200">
              <CardContent className="p-6 sm:p-12 text-center">
                <div className="max-w-md mx-auto">
                  <Lock className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4 sm:mb-6" />
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">
                    Profile Information
                  </h3>
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Access Request Modal - Show automatically for non-friends */}
      {!hasAccess && (
        <AccessRequestModal
          isOpen={isAccessModalOpen}
          onClose={() => setIsAccessModalOpen(false)}
          onRequestAccess={handleRequestAccess}
          isLoading={isSendingRequest}
        />
      )}
    </div>
  );
}
