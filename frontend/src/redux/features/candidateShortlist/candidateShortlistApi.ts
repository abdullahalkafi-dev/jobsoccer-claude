import { baseApi } from "@/redux/api/baseApi";

const candidateShortlistApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    shortlistCandidate: builder.mutation({
      query: (candidateId: string) => ({
        url: "/candidate-shortlist",
        method: "POST",
        body: { candidateId },
      }),
      invalidatesTags: [{ type: "Candidate", id: "SHORTLIST" }],
    }),

    getShortlistedCandidates: builder.query({
      query: () => ({
        url: "/candidate-shortlist",
        method: "GET",
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }: { _id: string }) => ({
                type: "Candidate" as const,
                id: _id,
              })),
              { type: "Candidate", id: "SHORTLIST" },
            ]
          : [{ type: "Candidate", id: "SHORTLIST" }],
      keepUnusedDataFor: 300,
    }),

    removeFromShortlist: builder.mutation({
      query: (candidateId: string) => ({
        url: `/candidate-shortlist/${candidateId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Candidate", id: "SHORTLIST" }],
    }),
  }),
});

export const {
  useShortlistCandidateMutation,
  useGetShortlistedCandidatesQuery,
  useLazyGetShortlistedCandidatesQuery,
  useRemoveFromShortlistMutation,
} = candidateShortlistApi;
