import React, { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Bookmark, Lock, MapPin, SquarePen } from "lucide-react";
import { FaPlayCircle } from "react-icons/fa";
import { Button } from "../ui/button";
import { StartChatButton } from "../messaging/StartChatButton";
import { ICandidate } from "@/types/user";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { LoginRequiredModal } from "../modals/LoginRequiredModal";
import { Avatar, AvatarFallback } from "../ui/avatar";
import Image from "next/image";
import Link from "next/link";
import {
  useShortlistCandidateMutation,
  useRemoveFromShortlistMutation,
} from "@/redux/features/candidateShortlist/candidateShortlistApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  addToShortlist,
  removeFromShortlist,
} from "@/redux/features/candidateShortlist/candidateShortlistSlice";
import { toast } from "sonner";
import VideoPlayerModal from "../modals/VideoPlayerModal";
import { useSendFriendRequestMutation } from "@/redux/features/user/userApi";
import userPlaceholder from "@/assets/user-placeholder.png";

function CandidateCard({ candidate }: { candidate: ICandidate }) {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const dispatch = useAppDispatch();
  const shortlistedIds = useAppSelector(
    (state) => state.candidateShortlist.shortlistedIds,
  );
  const { checkAuth, showLoginModal, handleLogin, handleCloseModal } =
    useAuthCheck();

  // Local state for optimistic updates
  const [localIsShortlisted, setLocalIsShortlisted] = useState<boolean | null>(
    null,
  );
  const [localFriendRequestStatus, setLocalFriendRequestStatus] = useState<
    typeof candidate.friendRequestStatus | null
  >(null);

  // Use local state if available, otherwise use API data or Redux state
  const isShortlisted =
    localIsShortlisted ??
    candidate.isShortlisted ??
    shortlistedIds.includes(candidate._id);
  const friendRequestStatus =
    localFriendRequestStatus ?? candidate.friendRequestStatus;

  const [shortlistCandidate, { isLoading: isShortlisting }] =
    useShortlistCandidateMutation();
  const [removeFromShortlistApi, { isLoading: isRemoving }] =
    useRemoveFromShortlistMutation();

  // Send friend request mutation
  const [sendFriendRequest, { isLoading: isSendingRequest }] =
    useSendFriendRequestMutation();

  // Determine button text and action based on friendRequestStatus
  const getFriendRequestButtonProps = () => {
    const status = friendRequestStatus;

    if (!status) {
      return { text: "Request Access", disabled: false, icon: Lock };
    }

    if (status.status === "pending" && status.type === "sent") {
      return { text: "Request Sent", disabled: true, icon: Lock };
    }

    if (status.status === "pending" && status.type === "received") {
      return { text: "Accept Request", disabled: false, icon: Lock };
    }

    if (status.status === "accepted") {
      return { text: "Friends", disabled: true, icon: Lock };
    }

    if (status.status === "rejected") {
      return { text: "Request Again", disabled: false, icon: Lock };
    }

    return { text: "Request Access", disabled: false, icon: Lock };
  };

  // Handle friend request
  const handleRequestAccess = async () => {
    if (
      !checkAuth(async () => {
        await handleRequestAccessLogic();
      })
    ) {
      return;
    }
  };

  const handleRequestAccessLogic = async () => {
    const currentStatus = friendRequestStatus;

    try {
      // Optimistic update based on current status
      if (!currentStatus || currentStatus.status === "rejected") {
        // Sending new request
        setLocalFriendRequestStatus({ status: "pending", type: "sent" });
      } else if (
        currentStatus.status === "pending" &&
        currentStatus.type === "received"
      ) {
        // Accepting received request
        setLocalFriendRequestStatus({ status: "accepted", type: "received" });
      }

      await sendFriendRequest(candidate._id).unwrap();
      toast.success("Friend request sent successfully");
    } catch (error) {
      // Revert on error
      setLocalFriendRequestStatus(currentStatus);
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to send friend request");
    }
  };

  const handleShortlist = async () => {
    if (
      !checkAuth(async () => {
        await handleShortlistLogic();
      })
    ) {
      return;
    }
  };

  const handleShortlistLogic = async () => {
    const previousState = isShortlisted;

    try {
      // Optimistic update
      setLocalIsShortlisted(!isShortlisted);

      if (isShortlisted) {
        await removeFromShortlistApi(candidate._id).unwrap();
        dispatch(removeFromShortlist(candidate._id));
        toast.success("Removed from shortlist");
      } else {
        await shortlistCandidate(candidate._id).unwrap();
        dispatch(addToShortlist(candidate._id));
        toast.success("Added to shortlist");
      }
    } catch (error) {
      // Revert on error
      setLocalIsShortlisted(previousState);
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to update shortlist");
    }
  };

  const videoCount = candidate?.profile?.videos?.length ?? 0;
  const isStaffRole =
    candidate.role === "On field staff" || candidate.role === "Office Staff";
  const watchLabel = isStaffRole ? `Watch Interview` : `Watch Highlights`;

  return (
    <div className="h-full">
      <Card className="bg-linear-to-br from-white to-[#FDF9E3] border-0 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
        <CardContent className="p-6 flex-1 flex flex-col">
          {/* Profile Header */}
          <div className="flex items-center gap-3 mb-4">
            {candidate?.profileImage ? (
              <Link href={`/candidates/${candidate._id}`}>
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-transparent">
                  <Image
                    src={
                      imgError
                        ? userPlaceholder
                        : `${process.env.NEXT_PUBLIC_BASE_URL}${candidate.profileImage}`
                    }
                    alt={`${candidate?.firstName || ""}
                  }`}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                  />
                </div>
              </Link>
            ) : (
              <Link href={`/candidates/${candidate._id}`}>
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="text-base font-medium">
                    {candidate?.firstName?.charAt(0)}
                    {candidate?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Link>
            )}
            <div>
              <Link
                href={`/candidates/${candidate._id}`}
                className="hover:underline"
              >
                <h4 className=" text-sm xl:text-base font-semibold text-gray-900">
                  {candidate.firstName + " " + candidate.lastName}
                </h4>
              </Link>
              <p className="text-xs text-gray-500 capitalize">
                {candidate.profile.position}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {candidate.profile?.placeOfBirth}
            </span>
          </div>

          {/* Nationality */}
          <div className="mb-3">
            <span className="text-sm text-gray-600">
              <span className="font-medium">Nationality:</span>{" "}
              {candidate.profile?.nationality}
            </span>
          </div>

          <Link
            href={`/candidates/${candidate._id}`}
            className="flex mb-3 items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <SquarePen className="w-4 h-4" />
            View Profile
          </Link>
          <button
            onClick={() => setIsVideoModalOpen(true)}
            disabled={!videoCount}
            className="flex mb-6 items-center gap-1 text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPlayCircle className="w-4 h-4 text-red-500 hover:text-red-600" />
            {watchLabel} {videoCount ? `(${videoCount})` : ""}
          </button>

          {/* Spacer to push footer to bottom */}
          <div className="flex-1"></div>

          {/* Card Footer - Action Buttons */}
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShortlist}
              disabled={isShortlisting || isRemoving}
              className={`w-full text-xs hover:scale-105 transition-transform duration-200 ${
                isShortlisted
                  ? "bg-green-50 border-green-500 text-green-700"
                  : "bg-transparent"
              }`}
            >
              {isShortlisting || isRemoving ? (
                <>
                  <span className="w-3 h-3 mr-1 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  {isShortlisted ? "Adding..." : "Removing..."}
                </>
              ) : (
                <>
                  <Bookmark
                    className={`w-3 h-3 mr-1 ${
                      isShortlisted ? "fill-current" : ""
                    }`}
                  />
                  {isShortlisted ? "Shortlisted" : "Shortlist"}
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs bg-transparent hover:scale-105"
              onClick={handleRequestAccess}
              disabled={
                isSendingRequest || getFriendRequestButtonProps().disabled
              }
            >
              {React.createElement(getFriendRequestButtonProps().icon, {
                className: "w-3 h-3 mr-1",
              })}
              {isSendingRequest
                ? "Sending..."
                : getFriendRequestButtonProps().text}
            </Button>

            <StartChatButton
              userId={candidate._id}
              userName={`${candidate.firstName} ${candidate.lastName}`}
              className="w-full text-xs bg-yellow-300 hover:scale-105 transition-transform duration-200"
            />
          </div>
        </CardContent>
      </Card>

      {/* Video Player Modal */}
      {candidate?.profile?.videos?.length > 0 && (
        <VideoPlayerModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          videos={candidate.profile.videos}
          candidateName={`${candidate.firstName} ${candidate.lastName}`}
        />
      )}

      {/* Login Required Modal */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={handleCloseModal}
        onLogin={handleLogin}
        message="Please log in to interact with candidates."
      />
    </div>
  );
}

export default CandidateCard;
