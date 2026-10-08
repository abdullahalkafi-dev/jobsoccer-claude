import { baseApi } from "@/redux/api/baseApi";
import { TAppliedJob, TJobApplicationsResponse } from "@/types/job";

const jobApplicationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    applyJob: builder.mutation({
      query: ({ jobId, resumeUrl }: { jobId: string; resumeUrl: string }) => ({
        url: "/job-applications/apply",
        method: "POST",
        body: { jobId, resumeUrl },
      }),
      invalidatesTags: [{ type: "Job", id: "APPLICATIONS" }, "JobApplications"],
    }),

    getMyApplications: builder.query<{ data: TAppliedJob[] }, void>({
      query: () => "/job-applications/my-applications",
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }: { _id: string }) => ({
                type: "Job" as const,
                id: _id,
              })),
              { type: "Job", id: "APPLICATIONS" },
              "JobApplications",
            ]
          : [{ type: "Job", id: "APPLICATIONS" }, "JobApplications"],
      keepUnusedDataFor: 300,
    }),

    withdrawApplication: builder.mutation({
      query: (applicationId: string) => ({
        url: `/job-applications/${applicationId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Job", id: "APPLICATIONS" }, "JobApplications"],
    }),

    deleteJobApplication: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/job-applications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Job", id: "APPLICATIONS" }, "JobApplications"],
    }),

    getJobApplications: builder.query<TJobApplicationsResponse, string>({
      query: (jobId: string) => `/job-applications/job/${jobId}`,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }: { _id: string }) => ({
                type: "JobApplications" as const,
                id: _id,
              })),
              { type: "JobApplications", id: "LIST" },
            ]
          : [{ type: "JobApplications", id: "LIST" }],
      keepUnusedDataFor: 300,
    }),
  }),
});

export const {
  useApplyJobMutation,
  useGetMyApplicationsQuery,
  useLazyGetMyApplicationsQuery,
  useWithdrawApplicationMutation,
  useDeleteJobApplicationMutation,
  useGetJobApplicationsQuery,
  useLazyGetJobApplicationsQuery,
} = jobApplicationApi;
