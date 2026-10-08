import { baseApi } from "../../api/baseApi";
import { EducationData, CreateEducationRequest } from "@/types/education";

export interface GetEducationsResponse {
  success: boolean;
  data: EducationData[];
  message?: string;
}

export interface CreateEducationResponse {
  success: boolean;
  data: EducationData;
  message: string;
}

export const educationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all educations for a user
    getUserEducations: builder.query<GetEducationsResponse, string>({
      query: (userId) => `/candidate-education/user/${userId}`,
      providesTags: ["Candidate"],
    }),

    // Create new education
    createEducation: builder.mutation<
      CreateEducationResponse,
      CreateEducationRequest
    >({
      query: (body) => ({
        url: "/candidate-education",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Candidate"],
    }),

    // Update education
    updateEducation: builder.mutation<
      CreateEducationResponse,
      { id: string; body: Partial<CreateEducationRequest> }
    >({
      query: ({ id, body }) => ({
        url: `/candidate-education/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Candidate"],
    }),

    // Delete education
    deleteEducation: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/candidate-education/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Candidate"],
    }),
  }),
});

export const {
  useGetUserEducationsQuery,
  useCreateEducationMutation,
  useUpdateEducationMutation,
  useDeleteEducationMutation,
} = educationApi;
