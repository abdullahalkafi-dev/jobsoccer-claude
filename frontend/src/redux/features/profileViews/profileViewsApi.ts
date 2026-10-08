import { baseApi } from "@/redux/api/baseApi";

export interface Viewer {
  _id: string;
  viewerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage: string;
    role: string;
    userType: string;
  };
  viewerType: string;
  viewerRole: string;
  profileOwnerId: string;
  profileOwnerType: string;
  profileOwnerRole: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileViewsStats {
  totalViews: number;
  uniqueViewers: number;
}

export interface ProfileViewsData {
  views: Viewer[];
  stats: ProfileViewsStats;
}

export interface ProfileViewsResponse {
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  data: ProfileViewsData;
  requestId: string;
}

const profileViewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyProfileViews: builder.query<
      ProfileViewsResponse,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/profile-views/my-views?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["ProfileViews"],
    }),
  }),
});

export const { useGetMyProfileViewsQuery } = profileViewsApi;
