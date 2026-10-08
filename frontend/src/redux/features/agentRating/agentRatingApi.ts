import { baseApi } from "@/redux/api/baseApi";

export interface AgentRating {
  _id: string;
  agentUserId: string | AgentUser;
  ratedByUserId: string | RatedByUser;
  ratedByUserType: string;
  ratedByUserRole: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface AgentUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string;
  role: string;
  userType: string;
}

export interface RatedByUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string;
  role: string;
  userType: string;
}

export interface CreateRatingRequest {
  agentUserId: string;
  rating: number;
}

export interface AverageRatingResponse {
  averageRating: number;
  totalRatings: number;
}

export interface CheckRatingResponse {
  hasRated: boolean;
  rating: AgentRating | null;
}

const agentRatingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new rating for an agent
    rateAgent: builder.mutation<
      { success: boolean; message: string; data: AgentRating },
      CreateRatingRequest
    >({
      query: (data) => ({
        url: "/agent-rating",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { agentUserId }) => [
        { type: "Agent", id: "RATINGS" },
        { type: "Agent", id: agentUserId },
      ],
    }),

    // Get average rating for a specific agent
    getAgentAverageRating: builder.query<
      { success: boolean; message: string; data: AverageRatingResponse },
      string
    >({
      query: (agentUserId: string) => ({
        url: `/agent-rating/average/${agentUserId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, agentUserId) => [
        { type: "Agent", id: agentUserId },
      ],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    // Check if the authenticated user has rated a specific agent
    checkUserRatedAgent: builder.query<
      { success: boolean; message: string; data: CheckRatingResponse },
      string
    >({
      query: (agentUserId: string) => ({
        url: `/agent-rating/check/${agentUserId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, agentUserId) => [
        { type: "Agent", id: `${agentUserId}-check` },
      ],
    }),
  }),
});

export const {
  useRateAgentMutation,
  useGetAgentAverageRatingQuery,
  useLazyGetAgentAverageRatingQuery,
  useCheckUserRatedAgentQuery,
  useLazyCheckUserRatedAgentQuery,
} = agentRatingApi;
