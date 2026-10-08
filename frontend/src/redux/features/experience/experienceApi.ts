import { baseApi } from "../../api/baseApi";

export interface Experience {
  _id?: string;
  title: string;
  employmentType: string;
  club: string;
  location: string;
  startMonth: string;
  startYear: number;
  endMonth?: string;
  endYear?: number;
  isCurrentlyWorking: boolean;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateExperienceRequest {
  title: string;
  employmentType: string;
  club: string;
  location: string;
  startMonth: string;
  startYear: number;
  endMonth?: string;
  endYear?: number;
  isCurrentlyWorking: boolean;
  description: string;
}

export interface GetExperiencesResponse {
  success: boolean;
  data: Experience[];
  message?: string;
}

export interface CreateExperienceResponse {
  success: boolean;
  data: Experience;
  message: string;
}

export const experienceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all experiences for a user
    getUserExperiences: builder.query<GetExperiencesResponse, string>({
      query: (userId) => `/candidate-experience/user/${userId}`,
      providesTags: ["Candidate"],
    }),

    // Create new experience
    createExperience: builder.mutation<
      CreateExperienceResponse,
      CreateExperienceRequest
    >({
      query: (body) => ({
        url: "/candidate-experience",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Candidate"],
    }),

    // Update experience
    updateExperience: builder.mutation<
      CreateExperienceResponse,
      { id: string; body: Partial<CreateExperienceRequest> }
    >({
      query: ({ id, body }) => ({
        url: `/candidate-experience/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Candidate"],
    }),

    // Delete experience
    deleteExperience: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/candidate-experience/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Candidate"],
    }),
  }),
});

export const {
  useGetUserExperiencesQuery,
  useCreateExperienceMutation,
  useUpdateExperienceMutation,
  useDeleteExperienceMutation,
} = experienceApi;
