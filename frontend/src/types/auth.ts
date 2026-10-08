/* eslint-disable @typescript-eslint/no-explicit-any */
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
  profileAIScore: number | null;
  createdAt: string;
  updatedAt: string;
  profile: any | null;
  adminVerificationStatus?: AdminVerificationStatus;
  aiProfileScore?: number | null;
};
