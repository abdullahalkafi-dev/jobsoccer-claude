import { baseApi } from "@/redux/api/baseApi";
import { setUser } from "../auth/authSlice";

const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // CREATE USER PROFILE (with form-data)
    createUserProfile: builder.mutation({
      query: (userInfo) => {
        return {
          url: "/user/profile",
          method: "POST",
          body: userInfo,
        };
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data.data));
        } catch (err) {
          console.error("Get user info failed:", err);
        }
      },
      invalidatesTags: [{ type: "User" }],
    }),

    // UPDATE PROFILE IMAGE
    updateProfileImage: builder.mutation({
      query: (formData: FormData) => ({
        url: "/user/profile",
        method: "PATCH",
        body: formData,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data.data));
        } catch (err) {
          console.error("Update profile image failed:", err);
        }
      },
      invalidatesTags: [{ type: "User" }],
    }),

    // UPDATE BANNER IMAGE
    updateBannerImage: builder.mutation({
      query: (formData: FormData) => ({
        url: "/user/profile",
        method: "PATCH",
        body: formData,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data.data));
        } catch (err) {
          console.error("Update banner image failed:", err);
        }
      },
      invalidatesTags: [{ type: "User" }],
    }),

    // UPDATE PROFILE (with form-data)
    updateProfile: builder.mutation({
      query: (formData: FormData) => ({
        url: "/user/profile",
        method: "PATCH",
        body: formData,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data.data));
        } catch (err) {
          console.error("Update profile failed:", err);
        }
      },
      invalidatesTags: [{ type: "User" }],
    }),

    // GET USER BY ID
    getUserById: builder.query({
      query: (userId: string) => ({
        url: `/user/${userId}`,
        method: "GET",
      }),
      providesTags: [{ type: "User" }],
    }),

    // CHECK FRIENDSHIP STATUS
    checkFriendshipStatus: builder.query({
      query: (userId: string) => ({
        url: `/friendlist/check/${userId}`,
        method: "GET",
      }),
      providesTags: ["Friend"],
    }),

    // SEND FRIEND REQUEST
    sendFriendRequest: builder.mutation({
      query: (receiverId: string) => ({
        url: "/friendlist",
        method: "POST",
        body: { receiverId },
      }),
      invalidatesTags: ["Friend"],
    }),
  }),
});

export const {
  useCreateUserProfileMutation,
  useUpdateProfileImageMutation,
  useUpdateBannerImageMutation,
  useUpdateProfileMutation,
  useGetUserByIdQuery,
  useCheckFriendshipStatusQuery,
  useSendFriendRequestMutation,
} = userApi;
