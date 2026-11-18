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
  /** Always sent, also when no question is missing. */
  answeredCount?: number;
  questionCount?: number;
  notAnsweredQuestionIds?: number[];
  strongestAreas?: string[];
  mainWeaknesses?: string[];
  summary?: string;
  underReview?: boolean;
  disclaimer?: string;
};

/** One question of the full report. */
export type TReportQuestion = {
  id: number;
  sectionId: string;
  text: string;
  status: "scored" | "not_answered";
  score: number | null;
  rationale: string;
  /** The candidate's own words. */
  evidence: string[];
  /** What would have earned a higher score (candidate and admin only). */
  missing: string[];
  /** Where the answer is in the interview video (null on older reports). */
  startSec: number | null;
  endSec: number | null;
};

/** The full report shown in the "View full report" window. */
export type TAssessmentReport = TInterviewAssessment & {
  spokenLanguage?: string | null;
  isTranslated?: boolean;
  languageNote?: string | null;
  /** The viewer may see the coaching tips (the candidate themself or an admin). */
  coaching: boolean;
  improvementTips: string[];
  interviewVideoId: string | null;
  sections: { id: string; name: string; earned: number; max: number; answeredCount: number; questionCount: number }[];
  questions: TReportQuestion[];
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
      providesTags: ["Assessment"],
    }),
    getCandidateAssessment: builder.query<TAssessmentResponse, string>({
      query: (userId) => `/ai-evaluation/candidate/${userId}`,
      transformResponse: (response: { data: TAssessmentResponse }) => response.data,
      providesTags: ["Assessment"],
    }),
    /** Full report; loaded only when the report window opens. */
    getMyAssessmentReport: builder.query<TAssessmentReport | null, void>({
      query: () => "/ai-evaluation/me/report",
      transformResponse: (response: { data: TAssessmentReport | null }) => response.data,
      providesTags: ["Assessment"],
    }),
    getCandidateAssessmentReport: builder.query<TAssessmentReport | null, string>({
      query: (userId) => `/ai-evaluation/candidate/${userId}/report`,
      transformResponse: (response: { data: TAssessmentReport | null }) => response.data,
      providesTags: ["Assessment"],
    }),
  }),
});

export const {
  useGetInterviewQuestionsQuery,
  useGetMyAssessmentQuery,
  useGetCandidateAssessmentQuery,
  useGetMyAssessmentReportQuery,
  useGetCandidateAssessmentReportQuery,
} = aiEvaluationApi;
