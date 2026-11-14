import { model, Schema } from "mongoose";
import { TProfileVideo } from "../../video/video.constant";
import { profileVideoSchema } from "../../video/video.schema";
import { countryList } from "../../../shared/constant/country.constant";
import { OnFieldStaffPosition } from "../../../shared/constant/position.constant";



export type TOnFieldStaffProfile = {
  dateOfBirth: Date;
  placeOfBirth: string;
  nationality: string;
  phoneNumber?: string;
  /** Spoken languages, free text ("English, Spanish"). */
  languages?: string;
  currentClub: string;
  availability: string;
  gender: "Male" | "Female"|"Other";
  league: string;
  category?: string;
  country: (typeof countryList)[number];
  socialMedia?: string;
  agent?: string;
  position: OnFieldStaffPosition;
  videos: TProfileVideo[];
};
const onFieldStaffProfileSchema = new Schema<TOnFieldStaffProfile>(
  {
    dateOfBirth: { type: Date, required: true },
    placeOfBirth: { type: String, required: true, trim: true },
    nationality: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: false, trim: true },
    languages: { type: String, required: false, trim: true },
    currentClub: { type: String, required: true, trim: true },
    availability: { type: String, required: false, trim: true },
    country: {
      type: String,
      enum: countryList,
      required: true,
    },
    gender: { type: String, enum: ["Male", "Female","Other"], required: true },
    socialMedia: { type: String, required: false, trim: true },
    agent: { type: String, required: false, trim: true },
    league: { type: String, required: true, trim: true },
     category: { type: String, required: false, trim: true },
    position: {
      type: String,
      enum: Object.values(OnFieldStaffPosition),
      required: true,
    },
    videos: { type: [profileVideoSchema], default: [] },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const OnFieldStaffProfile = model<TOnFieldStaffProfile>(
  "OnFieldStaffProfile",
  onFieldStaffProfileSchema,
  "onfieldstaffcans" // keeps the existing collection after the model rename
);
