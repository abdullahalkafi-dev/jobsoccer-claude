import { model, Schema } from "mongoose";
import { TProfileVideo } from "../../video/video.constant";
import { profileVideoSchema } from "../../video/video.schema";
import { OfficeStaffPosition } from "../../../shared/constant/position.constant";
import { countryList } from "../../../shared/constant/country.constant";



export type TOfficeStaffProfile = {
  dateOfBirth: Date;
  placeOfBirth: string;
  country: (typeof countryList)[number];
  nationality: string;
  phoneNumber?: string;
  /** Spoken languages, free text ("English, Spanish"). */
  languages?: string;
  position: OfficeStaffPosition;
  availability: string;
  agent?: string;
  socialMedia?: string;
  currentClub: string;
  gender: "Male" | "Female" | "Other";
  videos: TProfileVideo[];
};
const officeStaffSchema = new Schema<TOfficeStaffProfile>(
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
    languages: { type: String, required: false, trim: true },
    position: {
      type: String,
      enum: Object.values(OfficeStaffPosition),
      required: true,
    },
    availability: { type: String, required: false, trim: true },
    agent: { type: String, required: false, trim: true },
    socialMedia: { type: String, required: false, trim: true },
    currentClub: { type: String, required: true, trim: true },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    videos: { type: [profileVideoSchema], default: [] },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const OfficeStaffProfile = model<TOfficeStaffProfile>(
  "OfficeStaffProfile",
  officeStaffSchema,
  "officestaffcans" // keeps the existing collection after the model rename
);
