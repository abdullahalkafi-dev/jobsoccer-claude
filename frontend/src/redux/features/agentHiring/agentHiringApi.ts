import { baseApi } from "@/redux/api/baseApi";
import {
  AgentHiringResponse,
  AgentHiringsListResponse,
  CheckActiveHiringResponse,
  CreateAgentHiringRequest,
  GetHiringsParams,
  UpdateHiringStatusRequest,
} from "@/types/agentHiring";

export const agentHiringApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create Agent Hiring Request
    createAgentHiring: builder.mutation<
      AgentHiringResponse,
      CreateAgentHiringRequest
    >({
      query: (data) => ({
        url: "/agent-hiring",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Agent"],
    }),

    // Get My Hirings (agents I have hired)
    getMyHirings: builder.query<AgentHiringsListResponse, GetHiringsParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.status) queryParams.append("status", params.status);

        return {
          url: `/agent-hiring/my-hirings?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Agent"],
    }),

    // Get Agent Requests (hiring requests received by agent)
    getAgentRequests: builder.query<AgentHiringsListResponse, GetHiringsParams>(
      {
        query: (params) => {
          const queryParams = new URLSearchParams();
          if (params.page) queryParams.append("page", params.page.toString());
          if (params.limit)
            queryParams.append("limit", params.limit.toString());
          if (params.status) queryParams.append("status", params.status);

          return {
            url: `/agent-hiring/agent-requests?${queryParams.toString()}`,
            method: "GET",
          };
        },
        providesTags: ["Agent"],
      }
    ),

    // Get Hiring by ID
    getHiringById: builder.query<AgentHiringResponse, string>({
      query: (hiringId) => ({
        url: `/agent-hiring/${hiringId}`,
        method: "GET",
      }),
      providesTags: ["Agent"],
    }),

    // Update Hiring Status
    updateHiringStatus: builder.mutation<
      AgentHiringResponse,
      { hiringId: string; data: UpdateHiringStatusRequest }
    >({
      query: ({ hiringId, data }) => ({
        url: `/agent-hiring/${hiringId}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Agent"],
    }),

    // Check Active Hiring
    checkActiveHiring: builder.query<CheckActiveHiringResponse, string>({
      query: (agentUserId) => ({
        url: `/agent-hiring/check-active/${agentUserId}`,
        method: "GET",
      }),
      providesTags: ["Agent"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateAgentHiringMutation,
  useGetMyHiringsQuery,
  useGetAgentRequestsQuery,
  useGetHiringByIdQuery,
  useUpdateHiringStatusMutation,
  useCheckActiveHiringQuery,
  useLazyCheckActiveHiringQuery,
} = agentHiringApi;
