import React from "react";
import { MapPin, ShieldCheck, Star, UserRoundPlus, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { StartChatButton } from "../messaging/StartChatButton";
import { IEmployer } from "@/types/user";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { LoginRequiredModal } from "../modals/LoginRequiredModal";
import {
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "@/redux/features/follow/followApi";
import { useAppDispatch } from "@/redux/hooks";
import {
  addToFollowing,
  removeFromFollowing,
} from "@/redux/features/follow/followSlice";
import { toast } from "sonner";

export function EmployerCard({ employer }: { employer: IEmployer }) {
  const dispatch = useAppDispatch();
  const { checkAuth, showLoginModal, handleLogin, handleCloseModal } =
    useAuthCheck();

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

  // Use local state if available, otherwise use API data
  const isFollowing = localIsFollowing ?? employer.isFollowing ?? false;
  const followerCount = localFollowerCount ?? employer?.followerCount ?? 0;
  const isLoading = isFollowLoading || isUnfollowLoading;

  const handleFollow = async () => {
    if (
      !checkAuth(async () => {
        await handleFollowLogic();
      })
    ) {
      return;
    }
  };

  const handleFollowLogic = async () => {
    const previousState = isFollowing;
    const previousCount = followerCount;

    try {
      // Optimistic update
      setLocalIsFollowing(!isFollowing);

      if (isFollowing) {
        // Unfollow
        await unfollowEmployer(employer._id).unwrap();
        dispatch(removeFromFollowing(employer._id));
        toast.success("Unfollowed successfully");
        setLocalFollowerCount(
          isFollowing ? followerCount - 1 : followerCount + 1,
        );
      } else {
        // Follow
        await followEmployer(employer._id).unwrap();
        dispatch(addToFollowing(employer._id));
        toast.success("Followed successfully");
        setLocalFollowerCount(
          isFollowing ? followerCount - 1 : followerCount + 1,
        );
      }
    } catch (error) {
      // Revert on error
      setLocalIsFollowing(previousState);
      setLocalFollowerCount(previousCount);
      const err = error as { data?: { message?: string } };
      toast.error(
        err?.data?.message ||
          `Failed to ${isFollowing ? "unfollow" : "follow"} employer`,
      );
    }
  };
  // Get profile image URL
  const getEmployerLogoUrl = () => {
    if (employer?.profileImage) {
      return `${process.env.NEXT_PUBLIC_BASE_URL}${employer.profileImage}`;
    }
    return null;
  };

  const logoUrl = getEmployerLogoUrl();
  const employerName = `${employer?.firstName || ""} ${
    employer?.lastName || ""
  }`.trim();
  const firstNameInitial = employer?.firstName?.charAt(0)?.toUpperCase() || "";
  const lastNameInitial = employer?.lastName?.charAt(0)?.toUpperCase() || "";

  return (
    <div className="bg-linear-to-br from-white to-[#FDF9E3] rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3 mb-4 ">
          <Link href={`/employers/${employer._id}`}>
            {logoUrl ? (
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200 bg-white cursor-pointer hover:opacity-80 transition-opacity">
                <Image
                  src={logoUrl}
                  alt={`${employerName} Logo`}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <Avatar className="w-12 h-12 rounded-xl cursor-pointer hover:opacity-80 transition-opacity">
                <AvatarFallback className="text-base font-semibold bg-black text-white rounded-xl">
                  {firstNameInitial}
                  {lastNameInitial}
                </AvatarFallback>
              </Avatar>
            )}
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={`/employers/${employer._id}`} className="hover:underline">
              <h3 className="font-semibold text-gray-900 text-lg truncate cursor-pointer">
                {employer?.profile?.clubName || "Unknown Club"}
              </h3>
            </Link>
            <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="truncate">
                {employer?.profile?.location || "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          <span className="rounded-full text-green-500 border border-green-500 px-2 py-1 text-xs flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" />
            Verified
          </span>
          <span className="rounded-full border border-black  px-2 py-1 text-xs">
            {employerName}
          </span>
        </div>
      </div>

      {/* Bottom section with applicant count, salary, and time */}
      <div className="flex items-center justify-between flex-grow">
        <div className="flex flex-col gap-4 py-4">
          <div className="text-gray-600 text-sm">
            <Star className="w-4 h-4 inline-block text-yellow-500 mr-2" />
            <span className="font-bold">Active Job Posts:</span>{" "}
            {employer?.activeJobCount || 0}
          </div>
          <div className="text-gray-600 text-sm">
            <Users className="w-4 h-4 inline-block text-gray-500 mr-2" />
            <span className="font-bold">Followers:</span> {followerCount}
          </div>
        </div>
      </div>

      {/* Footer - Always at bottom */}
      <div className="border-t border-gray-200 pt-4 flex gap-2 items-center mt-auto">
        <Button
          onClick={handleFollow}
          disabled={isLoading}
          variant="outline"
          className={`w-1/2 hover:scale-105 transition-transform duration-200 font-semibold px-6 py-3 ${
            isFollowing ? "bg-green-50 border-green-500 text-green-700" : ""
          }`}
        >
          {isLoading ? (
            <>{isFollowing ? "Unfollowing..." : "Following..."}</>
          ) : (
            <>
              <UserRoundPlus />
              {isFollowing ? "Unfollow" : "Follow"}
            </>
          )}
        </Button>
        <StartChatButton
          userId={employer._id}
          userName={employerName}
          className="w-1/2 hover:scale-105 transition-transform duration-200 font-semibold px-6 py-3"
        />
      </div>

      {/* Login Required Modal */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={handleCloseModal}
        onLogin={handleLogin}
        message="Please log in to interact with employers."
      />
    </div>
  );
}
