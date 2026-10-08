/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from "react";
import { useAppSelector } from "@/redux/hooks";
import {
  useRateAgentMutation,
  useGetAgentAverageRatingQuery,
  useCheckUserRatedAgentQuery,
} from "@/redux/features/agentRating/agentRatingApi";

interface UseAgentRatingProps {
  agentUserId: string;
  agentRole?: string;
  agentUserType?: string;
}

export const useAgentRating = ({
  agentUserId,
  agentRole,
  agentUserType,
}: UseAgentRatingProps) => {
  const user = useAppSelector((state) => state.auth.user);
  const [rateAgent, { isLoading: isRating }] = useRateAgentMutation();

  // Get average rating for the agent
  const {
    data: averageRatingData,
    isLoading: isLoadingAverage,
    error: averageError,
    refetch: refetchAverage,
  } = useGetAgentAverageRatingQuery(agentUserId);

  // Check if user has already rated
  const {
    data: checkRatingData,
    isLoading: isCheckingRating,
    error: checkError,
    refetch: refetchCheckRating,
  } = useCheckUserRatedAgentQuery(agentUserId, {
    skip: !user?._id, // Skip query if user is not logged in
  });

  // Check if rating feature should be available
  const canRate = useCallback(() => {
    // Only candidates can rate
    if (user?.userType !== "candidate") {
      return {
        allowed: false,
        reason: "Only candidates can rate agents",
      };
    }

    // Only agents with role "Agent" or "agent" can be rated
    const isAgent = agentRole?.toLowerCase() === "agent";
    if (agentUserType !== "employer" || !isAgent) {
      return {
        allowed: false,
        reason: "Only agents can be rated",
      };
    }

    // User cannot rate themselves
    if (user?._id === agentUserId) {
      return {
        allowed: false,
        reason: "You cannot rate yourself",
      };
    }

    // Check if user has already rated
    if (checkRatingData?.data?.hasRated) {
      return {
        allowed: false,
        reason: "You have already rated this agent",
      };
    }

    return {
      allowed: true,
      reason: "",
    };
  }, [user, agentUserId, agentUserType, agentRole, checkRatingData]);

  // Submit rating
  const submitRating = useCallback(
    async (rating: number) => {
      if (!user?._id) {
        throw new Error("You must be logged in to rate an agent");
      }

      const validationResult = canRate();
      if (!validationResult.allowed) {
        throw new Error(validationResult.reason);
      }

      if (rating < 1 || rating > 5) {
        throw new Error("Rating must be between 1 and 5");
      }

      try {
        const result = await rateAgent({
          agentUserId,
          rating,
        }).unwrap();

        // Refresh both queries after successful rating
        await Promise.all([refetchAverage(), refetchCheckRating()]);

        return result;
      } catch (error: any) {
        throw new Error(error?.data?.message || "Failed to submit rating");
      }
    },
    [
      user?._id,
      canRate,
      rateAgent,
      agentUserId,
      refetchAverage,
      refetchCheckRating,
    ]
  );

  return {
    // User info
    isLoggedIn: !!user?._id,
    isCandidate: user?.userType === "candidate",
    isEmployer: user?.userType === "employer",
    userType: user?.userType,

    // Rating data
    averageRating: averageRatingData?.data?.averageRating || 0,
    totalRatings: averageRatingData?.data?.totalRatings || 0,
    userRating: checkRatingData?.data?.rating?.rating || null,
    hasRated: checkRatingData?.data?.hasRated || false,

    // Loading states
    isLoading: isLoadingAverage || isCheckingRating,
    isRating,

    // Errors
    averageError,
    checkError,

    // Functions
    canRate,
    submitRating,
  };
};
