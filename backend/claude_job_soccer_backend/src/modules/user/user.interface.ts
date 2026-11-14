import { Model, Types } from "mongoose";
import type { Lang } from "../../shared/i18n";
import { TProfileQuality } from "../profileQuality/profileQuality.interface";

export enum UserType {
  CANDIDATE = "candidate",
  EMPLOYER = "employer",
  ADMIN = "admin",
}
export enum CandidateRole {
  PROFESSIONAL_PLAYER = "Professional Player",
  AMATEUR_PLAYER = "Amateur Player",
  HIGH_SCHOOL = "High School Player",
  COLLEGE_UNIVERSITY = "College/University Player",
  ON_FIELD_STAFF = "On field staff",
  OFFICE_STAFF = "Office Staff",
}
export enum EmployerRole {
  PROFESSIONAL_CLUB = "Professional Club",
  ACADEMY = "Academy",
  AMATEUR_CLUB = "Amateur Club",
  CONSULTING_COMPANY = "Consulting Company",
  HIGH_SCHOOL = "High School",
  COLLEGE_UNIVERSITY = "College/University",
  AGENT = "Agent",
}

/** Consent given before uploading videos (stored with the date and the text version). */
export type TVideoConsent = {
  aiAt?: Date;
  playersAt?: Date;
  version?: string;
  /** Language the consent texts were shown in (version stays the same across languages). */
  aiLang?: string;
  playersLang?: string;
};

export type TBaseUser = {
  firstName: string;
  lastName: string;
  email: string;
  role: CandidateRole | EmployerRole;
  profileImage?: string;
  bannerImage?: string;
  /** Candidates only: Profile Quality Score with its breakdown. */
  profileQuality?: TProfileQuality;
  /** Candidates only: latest interview assessment, 0-100 (copy of the AiEvaluation result for cards and search). */
  interviewScore?: number | null;
  videoConsent?: TVideoConsent;
  /** Language of the user (en, es, fr); default en. */
  language?: Lang;
  profileId: string;
  userType: UserType;
  isVerified: boolean;
  isDeleted?: boolean;
  activeSubscriptionId?: Types.ObjectId;
  stripeCustomerId?: string;
  authId: Types.ObjectId;
};

export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
  isJWTIssuedBeforePasswordChanged(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number
  ): boolean;
} & Model<TBaseUser>;
