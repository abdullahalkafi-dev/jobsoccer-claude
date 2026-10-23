import { model, Schema } from "mongoose";
import { countryList } from "../../../shared/constant/country.constant";

enum TPosition {
  ADMINISTRATIVE_DIRECTOR = "Administrative Director",
  COMMUNITY_MANAGER = "Community Manager",
  DATA_ANALYST = "Data Analyst",
  DIGITAL_MARKETING = "Digital Marketing",
  EVENT_MANAGER = "Event Manager",
  NUTRITIONIST = "Nutritionist",
  PR_COMMUNICATIONS_MANAGER = "PR & Communications Manager",
  TEAM_MANAGER = "Team Manager",
}


export type TOfficeStaffCan = {
  dateOfBirth: Date;
  placeOfBirth: string;
  country: (typeof countryList)[number];
  nationality: string;
  phoneNumber?: string;
  position: TPosition;
  availability: string;
  agent?: string;
  socialMedia: string;
  currentClub: string;
  gender: "Male" | "Female" | "Other";
  videos: {
    videoType: string; // From VideoType enum
    url: string;
    duration: number; // in seconds
    title?: string;
    description?: string;
    uploadedAt?: Date;
  }[];
  AiVideoVideoScore?: number;
};
const officeStaffSchema = new Schema<TOfficeStaffCan>(
  {
    dateOfBirth: { type: Date, required: true },
    placeOfBirth: { type: String, required: true, trim: true },
    country: {
      type: String,
      enum: countryList,
      required: true,
    },
    nationality: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: false, trim: true },
    position: {
      type: String,
      enum: Object.values(TPosition),
      required: true,
    },
    availability: { type: String, required: false, trim: true },
    agent: { type: String, required: false, trim: true },
    socialMedia: { type: String, required: true, trim: true },
    currentClub: { type: String, required: true, trim: true },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    videos: [
      {
        videoType: { type: String, required: true, trim: true },
        url: { type: String, required: true, trim: true },
        duration: { type: Number, required: true }, // in seconds
        title: { type: String, trim: true },
        description: { type: String, trim: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    AiVideoVideoScore: { type: Number, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const OfficeStaffCan = model<TOfficeStaffCan>(
  "OfficeStaffCan",
  officeStaffSchema
);
