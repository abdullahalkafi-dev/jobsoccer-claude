import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import { readLocaleCookie } from "@/i18n/cookie";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL + "/api/v1",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      const headerValue = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;
      headers.set("authorization", headerValue);
    }
    // The API answers (errors, notifications, emails) in the language the visitor chose
    headers.set("accept-language", readLocaleCookie());
    return headers;
  },
});

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery,
  tagTypes: [
    "User",
    "Job",
    "PopularSearch",
    "Candidate",
    "Employer",
    "SavedJobs",
    "JobApplications",
    "FriendList",
    "ProfileViews",
    "Friend",
    "Notification",
    "NotificationCount",
    "Agent",
    "Video",
    "ProfileQuality",
    "Assessment",
  ],
  endpoints: () => ({}),
});
