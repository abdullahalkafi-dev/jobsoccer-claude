import { baseApi } from "@/redux/api/baseApi";

const resumeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createResume: builder.mutation({
      query: (formData: FormData) => ({
        url: "/candidate-resume",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [{ type: "User", id: "RESUME" }, "ProfileQuality"],
    }),

    getUserResume: builder.query({
      query: (userId: string) => ({
        url: `/candidate-resume/user/${userId}`,
        method: "GET",
      }),
      providesTags: (result, error, userId) => [
        { type: "User", id: "RESUME" },
        { type: "User", id: userId },
      ],
      keepUnusedDataFor: 300,
    }),

    updateResume: builder.mutation({
      query: ({
        resumeId,
        formData,
      }: {
        resumeId: string;
        formData: FormData;
      }) => ({
        url: `/candidate-resume/${resumeId}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: [{ type: "User", id: "RESUME" }, "ProfileQuality"],
    }),

    // Make an older resume the current one (the one employers see and the score uses)
    activateResume: builder.mutation({
      query: (resumeId: string) => ({
        url: `/candidate-resume/${resumeId}/activate`,
        method: "PATCH",
      }),
      invalidatesTags: [{ type: "User", id: "RESUME" }, "ProfileQuality"],
    }),

    deleteResume: builder.mutation({
      query: (resumeId: string) => ({
        url: `/candidate-resume/${resumeId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "User", id: "RESUME" }, "ProfileQuality"],
    }),
  }),
});

export const {
  useCreateResumeMutation,
  useGetUserResumeQuery,
  useLazyGetUserResumeQuery,
  useUpdateResumeMutation,
  useDeleteResumeMutation,
  useActivateResumeMutation,
} = resumeApi;
