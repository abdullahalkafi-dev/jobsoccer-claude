/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import {
  useGetReceivedFriendRequestsQuery,
  useGetFriendsListQuery,
  useUpdateFriendRequestMutation,
} from "@/redux/features/friend/friendListApi";
import { toast } from "sonner";
import RequestCard from "@/components/cards/RequestCard";
import AcceptedRequestCard from "@/components/cards/AcceptedRequestCard";

// Main Component
const AcceptRequestInterface: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"Request" | "Accepted">("Request");
  const [page] = useState(1);
  const limit = 10;

  // Fetch received friend requests
  const {
    data: receivedRequestsData,
    isLoading: isLoadingRequests,
    error: requestsError,
  } = useGetReceivedFriendRequestsQuery({ page, limit });

  // Fetch accepted friends list
  const {
    data: friendsListData,
    isLoading: isLoadingFriends,
    error: friendsError,
  } = useGetFriendsListQuery({ page, limit });

  // Mutation for accepting/rejecting requests
  const [updateFriendRequest, { isLoading: isUpdating }] =
    useUpdateFriendRequestMutation();

  // Handle accepting a request
  const handleAcceptRequest = async (requestId: string) => {
    try {
      const result = await updateFriendRequest({
        id: requestId,
        body: { status: "accepted" },
      }).unwrap();

      toast.success(result.message || "Friend request accepted successfully");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to accept friend request");
    }
  };

  // Handle canceling/rejecting a request
  const handleCancelRequest = async (requestId: string) => {
    try {
      const result = await updateFriendRequest({
        id: requestId,
        body: { status: "rejected" },
      }).unwrap();

      toast.success(result.message || "Friend request rejected successfully");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to reject friend request");
    }
  };

  const getTabCount = (tab: "Request" | "Accepted"): number => {
    if (tab === "Request") {
      return receivedRequestsData?.meta?.total || 0;
    }
    return friendsListData?.meta?.total || 0;
  };

  return (
    <div className="flex-1 min-h-screen border rounded-2xl">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">Access Request</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6">
          <div className="flex space-x-8">
            {["Request", "Accepted"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as "Request" | "Accepted")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab} ({getTabCount(tab as "Request" | "Accepted")})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-6 py-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {activeTab === "Request" ? (
            <>
              {isLoadingRequests ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">Loading requests...</p>
                </div>
              ) : requestsError ? (
                <div className="p-8 text-center">
                  <p className="text-red-500">Failed to load requests</p>
                </div>
              ) : !receivedRequestsData?.data ||
                receivedRequestsData.data.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">No pending requests</p>
                </div>
              ) : (
                <div>
                  {receivedRequestsData.data.map((request) => (
                    <RequestCard
                      key={request._id}
                      request={request}
                      onAccept={handleAcceptRequest}
                      onCancel={handleCancelRequest}
                      isLoading={isUpdating}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {isLoadingFriends ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">Loading friends...</p>
                </div>
              ) : friendsError ? (
                <div className="p-8 text-center">
                  <p className="text-red-500">Failed to load friends</p>
                </div>
              ) : !friendsListData?.data ||
                friendsListData.data.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">No accepted requests</p>
                </div>
              ) : (
                <div>
                  {friendsListData.data.map((friend) => (
                    <AcceptedRequestCard key={friend._id} request={friend} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcceptRequestInterface;
