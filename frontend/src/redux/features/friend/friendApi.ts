import { baseApi } from "@/redux/api/baseApi";

/**
 * Friend API endpoints
 * Handles all friend-related API calls
 */
const friendApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get friends list with optional filters
     * @param filters - Optional filters (search, status, limit, page, etc.)
     * @returns List of friends for the current user
     */
    getFriends: builder.query({
      query: (filters = {}) => ({
        url: "/friendlist/friends",
        method: "GET",
        params: filters,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }: { _id: string }) => ({
                type: "User" as const,
                id: _id,
              })),
              { type: "User", id: "FRIENDS_LIST" },
            ]
          : [{ type: "User", id: "FRIENDS_LIST" }],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    /**
     * Get friend requests
     * @returns List of pending friend requests
     */
    getFriendRequests: builder.query({
      query: () => ({
        url: "/friendlist/requests",
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    /**
     * Send friend request
     * @param friendId - ID of the user to send request to
     */
    sendFriendRequest: builder.mutation({
      query: (friendId) => ({
        url: "/friendlist",
        method: "POST",
        body: { friendId },
      }),
      invalidatesTags: ["User"],
    }),

    /**
     * Accept friend request
     * @param requestId - ID of the friend request to accept
     */
    acceptFriendRequest: builder.mutation({
      query: (requestId) => ({
        url: `/friendlist/accept-request/${requestId}`,
        method: "PUT",
      }),
      invalidatesTags: ["User"],
    }),

    /**
     * Reject friend request
     * @param requestId - ID of the friend request to reject
     */
    rejectFriendRequest: builder.mutation({
      query: (requestId) => ({
        url: `/friendlist/reject-request/${requestId}`,
        method: "PUT",
      }),
      invalidatesTags: ["User"],
    }),

    /**
     * Remove friend
     * @param friendId - ID of the friend to remove
     */
    removeFriend: builder.mutation({
      query: (friendId) => ({
        url: `/friendlist/remove-friend/${friendId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetFriendsQuery,
  useGetFriendRequestsQuery,
  useSendFriendRequestMutation,
  useAcceptFriendRequestMutation,
  useRejectFriendRequestMutation,
  useRemoveFriendMutation,
} = friendApi;
