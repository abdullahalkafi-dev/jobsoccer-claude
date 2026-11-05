/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TProfileQuality, TPublicQuality } from "@/features/profileQuality/types";

export interface EmailVerificationPayload {
  email: string;
  reason: "account_verification" | "password_reset";
  oneTimeCode: string;
}

export interface AdminVerificationStatus {
  hasRequest: boolean;
  status: "pending" | "approved" | "rejected" | null;
  verifiedAt: string | null;
}

export type TUser = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string | null;
  bannerImage?: string | null;
  profileId: string | null;
  authId: string;
  isVerified: boolean;
  role: string;
  userType: "candidate" | "employer";
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  profile: any | null;
  adminVerificationStatus?: AdminVerificationStatus;
  /** Candidates: the full result for the owner (number, breakdown, tips). */
  profileQuality?: TProfileQuality | TPublicQuality | null;
  /** Candidates: latest AI interview assessment, 0-100. */
  interviewScore?: number | null;
};
