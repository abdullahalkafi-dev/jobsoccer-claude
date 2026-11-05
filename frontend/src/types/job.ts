import type { TPremiumAccess } from "@/features/premiumJobs/types";

export interface TJob {
  _id: string;
  jobTitle: string;
  jobOverview: string;
  jobCategory: string;
  position: string;
  location: string;
  country: string;
  requirements: string;
  additionalRequirements?: string;
  requiredSkills: string;
  experience: string;
  salary: {
    min: number;
    max: number;
  };
  contractType: string;
  creator: {
    creatorId: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      profileImage: string | null;
      role: string;
    };
    creatorRole: string;
  };
  responsibilities: string;
  applicationCount: number;
  searchKeywords: string[];
  status: string;
  deadline: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
  isApplied?: boolean;
  isSaved?: boolean;
  /** Premium opportunity (marked by an admin). */
  isPremium?: boolean;
  /** Only for a signed-in candidate viewing a premium job. */
  premiumAccess?: TPremiumAccess | null;
}

export interface TJobCountByRole {
  jobCount: number;
  role: string;
}

export interface TSavedJob {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage: null | string;
  };
  jobId: TJob;
  userType: string;
  userRole: string;
  createdAt: string;
  updatedAt: string;
}

export interface TAppliedJob {
  _id: string;
  jobId: TJob;
  candidateId: string;
  appliedAt: string;
  matchScore: number;
  resumeUrl: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TJobApplication {
  _id: string;
  applicantName: string;
  applicantEmail: string;
  applicantProfileImage: string | null;
  candidateId: string;
  candidateRole: string;
  matchScore: number | null;
  /** Background job match (v2): queued / processing / completed / failed */
  matchStatus?: "queued" | "processing" | "completed" | "failed" | null;
  matchReasons?: {
    metRequirements: string[];
    missingRequirements: string[];
    summary: string;
    confidence: "high" | "medium" | "low";
    usedResume: boolean;
    usedInterview: boolean;
  } | null;
  resumeUrl: string | null;
  appliedAt: string;
  createdAt: string;
}

export interface TJobApplicationsResponse {
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  data: TJobApplication[];
}
