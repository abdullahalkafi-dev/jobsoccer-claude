import { Types } from "mongoose";

export type TJobApply = {
  _id: Types.ObjectId;
  jobId: Types.ObjectId;
  candidateId: Types.ObjectId;
  appliedAt: Date;
  aiMatchPercentage?: number;
  /** Job match v2 (background). Absent for applications scored the old way. */
  aiMatchStatus?: "queued" | "processing" | "completed" | "failed";
  aiMatchDetails?: {
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
  aiMatchError?: string;
  resumeUrl?: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};
