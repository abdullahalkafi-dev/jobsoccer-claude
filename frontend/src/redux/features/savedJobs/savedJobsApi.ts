import { baseApi } from "@/redux/api/baseApi";
import { TSavedJob } from "@/types/job";

const savedJobsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    saveJob: builder.mutation({
      query: (jobId: string) => ({
        url: "/saved-jobs",
        method: "POST",
        body: { jobId },
      }),
      invalidatesTags: [{ type: "Job", id: "SAVED_LIST" }, "SavedJobs"],
    }),

    getSavedJobs: builder.query<{ data: TSavedJob[] }, void>({
      query: () => "/saved-jobs",
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }: { _id: string }) => ({
                type: "Job" as const,
                id: _id,
              })),
              { type: "Job", id: "SAVED_LIST" },
              "SavedJobs",
            ]
          : [{ type: "Job", id: "SAVED_LIST" }, "SavedJobs"],
      keepUnusedDataFor: 300,
    }),

    unsaveJob: builder.mutation({
      query: (jobId: string) => ({
        url: `/saved-jobs/${jobId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Job", id: "SAVED_LIST" }, "SavedJobs"],
    }),

    deleteSavedJob: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/saved-jobs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Job", id: "SAVED_LIST" }, "SavedJobs"],
    }),
  }),
});

export const {
  useSaveJobMutation,
  useGetSavedJobsQuery,
  useLazyGetSavedJobsQuery,
  useUnsaveJobMutation,
  useDeleteSavedJobMutation,
} = savedJobsApi;
