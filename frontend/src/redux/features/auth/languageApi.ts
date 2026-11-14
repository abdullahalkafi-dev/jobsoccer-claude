import { baseApi } from "@/redux/api/baseApi";

/** Saves the user's language on their account (used for emails, notifications and AI texts). */
const languageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    setLanguage: builder.mutation<unknown, { language: "en" | "es" | "fr" }>({
      query: (body) => ({ url: "/user/language", method: "PATCH", body }),
    }),
  }),
});

export const { useSetLanguageMutation } = languageApi;
