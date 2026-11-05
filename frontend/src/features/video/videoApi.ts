import { baseApi } from "@/redux/api/baseApi";
import type { TVideoStatus } from "./types";

const videoApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** What to upload for this candidate, the current videos, locks and what is missing. */
    getVideoStatus: builder.query<TVideoStatus, void>({
      query: () => "/videos/me",
      transformResponse: (response: { data: TVideoStatus }) => response.data,
      providesTags: ["Video"],
    }),
    /** The checkboxes shown before upload (AI notice, filming permission). */
    saveVideoConsent: builder.mutation<unknown, { ai?: boolean; players?: boolean }>({
      query: (body) => ({ url: "/videos/consent", method: "POST", body }),
      invalidatesTags: ["Video"],
    }),
    deleteVideo: builder.mutation<unknown, string>({
      query: (videoId) => ({ url: `/videos/${videoId}`, method: "DELETE" }),
      invalidatesTags: ["Video", "User", "ProfileQuality"],
    }),
  }),
});

export const { useGetVideoStatusQuery, useSaveVideoConsentMutation, useDeleteVideoMutation } = videoApi;
