import { baseApi } from "@/redux/api/baseApi";

/** Overall section of the client's interview assessment (what candidates and employers see). */
export type TInterviewAssessment = {
  id: string;
  status: string;
  position: string;
  displayName?: string;
  evaluatedAt?: string;
  totalScore?: number;
  maxScore?: number;
  percentage?: number;
  classification?: string | null;
  notAnsweredCount?: number;
  strongestAreas?: string[];
  mainWeaknesses?: string[];
  summary?: string;
  underReview?: boolean;
  disclaimer?: string;
};

export type TAssessmentResponse = {
  report: TInterviewAssessment | null;
  pending: { status: string } | null;
};

export type TInterviewQuestions = {
  rubricId: string;
  position: string;
  displayName: string;
  level: string | null;
  questionCount: number;
  sections: { id: string; name: string; questions: { id: number; text: string }[] }[];
};

const aiEvaluationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInterviewQuestions: builder.query<TInterviewQuestions, string>({
      query: (position) => `/ai-evaluation/questions?position=${encodeURIComponent(position)}`,
      transformResponse: (response: { data: TInterviewQuestions }) => response.data,
      keepUnusedDataFor: 3600,
    }),
    getMyAssessment: builder.query<TAssessmentResponse, void>({
      query: () => "/ai-evaluation/me",
      transformResponse: (response: { data: TAssessmentResponse }) => response.data,
      providesTags: ["User"],
    }),
    getCandidateAssessment: builder.query<TAssessmentResponse, string>({
      query: (userId) => `/ai-evaluation/candidate/${userId}`,
      transformResponse: (response: { data: TAssessmentResponse }) => response.data,
      providesTags: ["FriendList"],
    }),
  }),
});

export const { useGetInterviewQuestionsQuery, useGetMyAssessmentQuery, useGetCandidateAssessmentQuery } =
  aiEvaluationApi;
