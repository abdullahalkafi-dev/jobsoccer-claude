import { baseApi } from "@/redux/api/baseApi";

const adminVerificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // REQUEST ADMIN VERIFICATION
    requestAdminVerification: builder.mutation<void, void>({
      query: () => ({
        url: "/admin-verification/request",
        method: "POST",
      }),
      invalidatesTags: [{ type: "User" }],
    }),
  }),
});

export const { useRequestAdminVerificationMutation } = adminVerificationApi;
