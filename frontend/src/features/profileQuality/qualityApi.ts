import { baseApi } from "@/redux/api/baseApi";
import type { TMyQualityResponse } from "./types";

const qualityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** The candidate's own score with the breakdown and improvement actions. */
    getMyProfileQuality: builder.query<TMyQualityResponse, void>({
      query: () => "/profile-quality/me",
      transformResponse: (response: { data: TMyQualityResponse }) => response.data,
      providesTags: ["ProfileQuality"],
    }),
  }),
});

export const { useGetMyProfileQualityQuery } = qualityApi;
