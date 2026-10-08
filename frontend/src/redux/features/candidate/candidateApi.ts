import { baseApi } from "@/redux/api/baseApi";

const candidateApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCandidates: builder.query({
      query: (filters = {}) => ({
        url: "/candidate/search",
        method: "GET",
        params: filters,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }: { _id: string }) => ({
                type: "Candidate" as const,
                id: _id,
              })),
              { type: "Candidate", id: "LIST" },
            ]
          : [{ type: "Candidate", id: "LIST" }],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),
    getCandidateById: builder.query({
      query: (id) => ({
        url: `/candidate/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Candidate", id }],
      keepUnusedDataFor: 300,
    }),
    getCandidateFeatured: builder.query({
      query: () => ({
        url: "/candidate/featured",
        method: "GET",
      }),
      providesTags: [{ type: "Candidate", id: "FEATURED" }],
      keepUnusedDataFor: 600, // Cache for 10 minutes
    }),
  }),
});

export const {
  useGetCandidatesQuery,
  useLazyGetCandidatesQuery,
  useGetCandidateByIdQuery,
  useLazyGetCandidateByIdQuery,
  useGetCandidateFeaturedQuery,
} = candidateApi;
