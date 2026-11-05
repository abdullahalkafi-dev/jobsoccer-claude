import { model, Schema } from "mongoose";
import { profileChangedPlugin } from "../../shared/events/profileChangedPlugin";
import { verificationFields } from "../credentialVerification/credentialVerification.fields";
import { TCandidateEducation } from "./candidateEducation.interface";

const candidateEducationSchema = new Schema<TCandidateEducation>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
      ref: "User",
    },
    profileId: {
      type: String,
      required: true,
      index: true,
    },
    candidateRole: {
      type: String,
      required: true,
      index: true,
    },
    instituteName: {
      type: String,
      required: true,
    },
    degree: {
      type: String,
      required: true,
    },
    fieldOfStudy: {
      type: String,
      required: true,
    },
    startMonth: {
      type: String,
      required: true,
    },
    startYear: {
      type: Number,
      required: true,
    },
    endMonth: {
      type: String,
      required: false,
    },
    endYear: {
      type: Number,
      required: false,
    },
    grade: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
  },
  { timestamps: true, versionKey: false }
);

// Supporting document + admin verification (feeds the Profile Quality "Verification" points)
candidateEducationSchema.add(verificationFields);

// Index for efficiently finding user's education records
candidateEducationSchema.index({ userId: 1, createdAt: -1 });
// Index for finding education by profile
candidateEducationSchema.index({ profileId: 1, startYear: -1 });

// Recalculate the Profile Quality Score when this changes
candidateEducationSchema.plugin(profileChangedPlugin, "education");

export const CandidateEducation = model<TCandidateEducation>(
  "CandidateEducation",
  candidateEducationSchema
);
