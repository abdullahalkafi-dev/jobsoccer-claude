import { Types } from "mongoose";

export type TJobApply = {
  _id: Types.ObjectId;
  jobId: Types.ObjectId;
  candidateId: Types.ObjectId;
  appliedAt: Date;
  matchScore?: number;
  /** Job match v2 (background). Absent for applications scored the old way. */
  matchStatus?: "queued" | "processing" | "completed" | "failed";
  matchDetails?: {
    score: number;
    metRequirements: string[];
    missingRequirements: string[];
    summary: string;
    confidence: "high" | "medium" | "low";
    usedResume: boolean;
    usedInterview: boolean;
    model: string;
    costUsd: number;
    matchedAt: Date;
  };
  matchError?: string;
  resumeUrl?: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};
