import { baseApi } from "@/redux/api/baseApi";
import { logout, setToken, setUser } from "./authSlice";

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // LOGIN
    login: builder.mutation({
      query: (userInfo) => ({
        url: "/auth/login",
        method: "POST",
        body: userInfo,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data.accessToken && data?.data.user?.isVerified) {
            const token = data.data.accessToken;
            dispatch(setToken(token));
            dispatch(setUser(data.data.user));
          } else {
            console.warn("No token found in verification response:", data);
          }
        } catch (error) {
          console.error("Email verification failed:", error);
        }
      },
      invalidatesTags: ["User"],
    }),

    // SIGNUP
    signup: builder.mutation({
      query: (userInfo) => ({
        url: "/auth/signup",
        method: "POST",
        body: userInfo,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.success) {
            dispatch(logout());
          } else {
            console.warn("No token found in verification response:", data);
          }
        } catch (error) {
          console.error("Email verification failed:", error);
        }
      },
      invalidatesTags: ["User"],
    }),

    // EMAIL VERIFICATION
    emailVerify: builder.mutation({
      query: (data) => ({
        url: "/auth/verify-email",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data.accessToken) {
            const token = data.data.accessToken;
            dispatch(setToken(token));
          } else {
            console.warn("No token found in verification response:", data);
          }
        } catch (error) {
          console.error("Email verification failed:", error);
        }
      },
      invalidatesTags: ["User"],
    }),

    // RESEND OTP
    resendOtp: builder.mutation({
      query: (data) => ({
        url: "/auth/resend-otp",
        method: "POST",
        body: data,
      }),
    }),

    // FORGOT PASSWORD
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: data,
      }),
    }),

    // RESET PASSWORD
    resetPassword: builder.mutation({
      query: ({ newPassword, token }) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: { newPassword },
        headers: {
          Authorization: token,
        },
      }),
    }),

    // CHANGE PASSWORD (for logged-in user)
    changePassword: builder.mutation({
      query: (data) => ({
        url: "/auth/change-password",
        method: "PATCH",
        body: data,
      }),
    }),
    //  GET CURRENT USER
    getMe: builder.query({
      query: () => ({
        url: "/user/me",
        method: "GET",
      }),

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data.data));
        } catch (err) {
          console.error("Get user info failed:", err);
        }
      },
      providesTags: ["User"],
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useEmailVerifyMutation,
  useResendOtpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useGetMeQuery,
} = authApi;
