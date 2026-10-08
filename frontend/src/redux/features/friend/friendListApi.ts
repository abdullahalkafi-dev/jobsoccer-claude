/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "../../api/baseApi";

// Types
interface FriendRequestSender {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string | null;
  role: string;
  userType: string;
  createdAt: string;
}

export interface FriendRequest {
  _id: string;
  senderId: FriendRequestSender;
  senderType: string;
  senderRole: string;
  receiverId: string;
  receiverRole: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  updatedAt: string;
}

interface FriendInfo {
  _id: string;
  email: string;
  role: string;
  userType: string;
  createdAt: string;
}

export interface Friend {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profileImage: string | null;
  userType: string;
  friend: FriendInfo;
  friendshipDate: string;
}

interface Meta {
  page: number;
  limit: number;
  totalPage: number;
  total: number;
}

interface FriendRequestResponse {
  success: boolean;
  message: string;
  meta: Meta;
  data: FriendRequest[];
  requestId: string;
}

interface FriendListResponse {
  success: boolean;
  message: string;
  meta: Meta;
  data: Friend[];
  requestId: string;
}

interface UpdateFriendRequestBody {
  status: "accepted" | "rejected";
}

interface UpdateFriendRequestResponse {
  success: boolean;
  message: string;
  data?: any;
  requestId: string;
}

export const friendListApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get received friend requests
    getReceivedFriendRequests: builder.query<
      FriendRequestResponse,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 }) =>
        `/friendlist/received?page=${page}&limit=${limit}`,
      providesTags: ["FriendList"],
    }),

    // Get friends list (accepted requests)
    getFriendsList: builder.query<
      FriendListResponse,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 }) =>
        `/friendlist/friends?page=${page}&limit=${limit}`,
      providesTags: ["FriendList"],
    }),

    // Accept or reject friend request
    updateFriendRequest: builder.mutation<
      UpdateFriendRequestResponse,
      { id: string; body: UpdateFriendRequestBody }
    >({
      query: ({ id, body }) => ({
        url: `/friendlist/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["FriendList"],
    }),
  }),
});

export const {
  useGetReceivedFriendRequestsQuery,
  useGetFriendsListQuery,
  useUpdateFriendRequestMutation,
} = friendListApi;
