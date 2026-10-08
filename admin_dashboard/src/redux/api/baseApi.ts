import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

// Custom base query with error handling
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1",
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth?.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQuery,
  tagTypes: ["user", "verification"],
  endpoints: (builder) => ({
    //user registration API
    getUserRegister: builder.query({
      query: (featured) => {
        const params = new URLSearchParams();
        if (featured) {
          params.append("featured", featured);
        }
        return {
          url: `auth/register`,
          method: "POST",
          params: params,
        };
      },
      providesTags: ["user"],
    }),

    ///----------------- Password Related APIs -----------------///
    //user login API
    userLogin: builder.mutation({
      query: (newUserLogin) => ({
        url: "/auth/login",
        method: "POST",
        body: newUserLogin,
      }),
      invalidatesTags: ["user"],
    }),

    //forgot password API
    forgotPassword: builder.mutation({
      query: (userForgotPassword) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: userForgotPassword,
      }),
      invalidatesTags: ["user"],
    }),

    //change password API
    changePassword: builder.mutation({
      query: (userChangePassword) => ({
        url: "/auth/change-password",
        method: "POST",
        body: userChangePassword,
      }),
      invalidatesTags: ["user"],
    }),
    //reset password API
    resetPassword: builder.mutation({
      query: (userResetPassword) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: userResetPassword,
      }),
      invalidatesTags: ["user"],
    }),

    //verify email API
    verifyEmail: builder.mutation({
      query: (userVerifyEmail) => ({
        url: "/auth/verify-email",
        method: "POST",
        body: userVerifyEmail,
      }),
      invalidatesTags: ["user"],
    }),

    //get user counts API
    getUserCounts: builder.query({
      query: () => ({
        url: "/dashboard/user-counts",
        method: "GET",
      }),
      providesTags: ["user"],
    }),

    //get monthly income API
    getMonthlyIncome: builder.query({
      query: () => ({
        url: "/dashboard/monthly-income",
        method: "GET",
      }),
      providesTags: ["user"],
    }),

    //get me (current user) API
    getMe: builder.query({
      query: () => ({
        url: "/user/me",
        method: "GET",
      }),
      providesTags: ["user"],
    }),

    //update user profile API
    updateProfile: builder.mutation({
      query: ({ id, formData }: { id: string; formData: FormData }) => ({
        url: `/user/${id}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["user"],
    }),

    //change password API (already exists but ensuring it's exported)

    //get user list API
    getUserList: builder.query({
      query: ({ email, limit, page, subscriptionType, userType }) => {
        const params = new URLSearchParams();
        if (email) params.append("email", email);
        if (limit) params.append("limit", limit.toString());
        if (page) params.append("page", page.toString());
        if (subscriptionType)
          params.append("subscriptionType", subscriptionType);
        if (userType) params.append("userType", userType);

        return {
          url: `/dashboard/user-list?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["user"],
    }),

    //get user details API
    getUserDetails: builder.query({
      query: (userId: string) => ({
        url: `/dashboard/user/${userId}`,
        method: "GET",
      }),
      providesTags: ["user"],
    }),

    //get all verification requests API
    getVerificationRequests: builder.query({
      query: ({ page, limit }: { page?: number; limit?: number } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append("page", page.toString());
        if (limit) params.append("limit", limit.toString());

        return {
          url: `/admin-verification/requests?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["verification"],
    }),

    //update verification status API
    updateVerificationStatus: builder.mutation({
      query: ({
        id,
        status,
      }: {
        id: string;
        status: "approved" | "rejected";
      }) => ({
        url: `/admin-verification/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["verification"],
    }),
  }),
});

export const {
  useGetUserCountsQuery,
  useGetMonthlyIncomeQuery,
  useGetMeQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetUserListQuery,
  useGetUserDetailsQuery,
  useGetVerificationRequestsQuery,
  useUpdateVerificationStatusMutation,
} = baseApi;
