/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useAgentRating } from "@/hooks/useAgentRating";
import { Star } from "lucide-react";

interface AgentRatingComponentProps {
  agentUserId: string;
  agentRole?: string;
  agentUserType?: string;
  onSuccess?: () => void;
}

export const AgentRatingComponent: React.FC<AgentRatingComponentProps> = ({
  agentUserId,
  agentRole,
  agentUserType,
  onSuccess,
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    isLoggedIn,
    isCandidate,
    isEmployer,
    averageRating,
    totalRatings,
    userRating,
    hasRated,
    isLoading,
    isRating,
    canRate,
    submitRating,
  } = useAgentRating({
    agentUserId,
    agentRole,
    agentUserType,
  });

  const ratingCheck = canRate();

  const handleSubmitRating = async (rating: number) => {
    setError(null);
    setSuccess(false);

    try {
      await submitRating(rating);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-gray-500">Loading rating information...</div>
      </div>
    );
  }

  // Show message if user is not logged in
  if (!isLoggedIn) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-center text-amber-700 text-sm">
        Please log in to rate this agent
      </div>
    );
  }

  // For employers: show ratings but no rating input
  if (isEmployer) {
    return (
      <div className="space-y-4">
        {/* Average Rating Display */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="text-2xl font-bold">
              {averageRating > 0 ? averageRating.toFixed(1) : "No"}
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={20}
                  className={`${
                    star <= Math.round(averageRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-600">
            {totalRatings > 0
              ? `${totalRatings} rating${totalRatings !== 1 ? "s" : ""}`
              : "No ratings yet"}
          </p>
        </div>
      </div>
    );
  }

  // Show message if not a candidate
  if (!isCandidate) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg text-center text-gray-600 text-sm">
        Only candidates can rate agents
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Average Rating Display */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="text-2xl font-bold">
            {averageRating > 0 ? averageRating.toFixed(1) : "No"}
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={20}
                className={`${
                  star <= Math.round(averageRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
        <p className="text-sm text-gray-600">
          {totalRatings > 0
            ? `${totalRatings} rating${totalRatings !== 1 ? "s" : ""}`
            : "No ratings yet"}
        </p>
      </div>

      {/* Rating Input - Show if candidate can rate */}
      {ratingCheck.allowed && !hasRated && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">
            Share your experience with this agent
          </p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => handleSubmitRating(rating)}
                onMouseEnter={() => setHoverRating(rating)}
                onMouseLeave={() => setHoverRating(0)}
                disabled={isRating}
                className="transition-transform hover:scale-110 disabled:opacity-50"
                title={`Rate ${rating} star${rating !== 1 ? "s" : ""}`}
              >
                <Star
                  size={32}
                  className={`${
                    rating <= (hoverRating || 0)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  } cursor-pointer transition-colors`}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* User Rating Display */}
      {hasRated && userRating && (
        <div className="p-3 bg-blue-50 rounded-lg text-center">
          <p className="text-sm text-gray-700 mb-2">You rated this agent</p>
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={24}
                className={`${
                  star <= userRating
                    ? "fill-blue-500 text-blue-500"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Cannot Rate Message */}
      {!ratingCheck.allowed && !hasRated && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-600 text-sm">
          {ratingCheck.reason}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
          ✓ Rating submitted successfully!
        </div>
      )}
    </div>
  );
};

export default AgentRatingComponent;
