import { baseApi } from "@/redux/api/baseApi";

const followApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    followUser: builder.mutation({
      query: (userId: string) => ({
        url: "/follow",
        method: "POST",
        body: { employerId: userId },
      }),
      invalidatesTags: (result, error, userId) => [
        { type: "Employer", id: "FOLLOWING" },
        { type: "Employer", id: "LIST" },
        { type: "Employer", id: userId },
        { type: "Candidate", id: userId },
        { type: "Candidate", id: "LIST" },
      ],
    }),

    unfollowUser: builder.mutation({
      query: (userId: string) => ({
        url: `/follow/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, userId) => [
        { type: "Employer", id: "FOLLOWING" },
        { type: "Employer", id: "LIST" },
        { type: "Employer", id: userId },
        { type: "Candidate", id: userId },
        { type: "Candidate", id: "LIST" },
      ],
    }),

    getFollowedUsers: builder.query({
      query: () => ({
        url: "/follow",
        method: "GET",
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }: { _id: string }) => ({
                type: "Employer" as const,
                id: _id,
              })),
              ...result.data.map(({ _id }: { _id: string }) => ({
                type: "Candidate" as const,
                id: _id,
              })),
              { type: "Employer", id: "FOLLOWING" },
              { type: "Candidate", id: "FOLLOWING" },
            ]
          : [
              { type: "Employer", id: "FOLLOWING" },
              { type: "Candidate", id: "FOLLOWING" },
            ],
      keepUnusedDataFor: 300,
    }),

    checkFollowStatus: builder.query({
      query: (userId: string) => ({
        url: `/follow/status/${userId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, userId) => [
        { type: "Employer", id: userId },
        { type: "Candidate", id: userId },
      ],
    }),
  }),
});

export const {
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetFollowedUsersQuery,
  useLazyGetFollowedUsersQuery,
  useCheckFollowStatusQuery,
  useLazyCheckFollowStatusQuery,
} = followApi;
