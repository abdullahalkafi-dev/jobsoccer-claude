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
  requiredAiScore: number;
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
  aiMatchPercentage: number;
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
  aiMatchPercentage: number;
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
