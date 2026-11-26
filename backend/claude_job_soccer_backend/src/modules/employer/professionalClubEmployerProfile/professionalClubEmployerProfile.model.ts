import { model, Schema } from "mongoose";
import { countryList } from "../../../shared/constant/country.constant";

export type TProfessionalClubEmployerProfile = {
  country: (typeof countryList)[number];
  address: string;
  /** No longer asked (client, 2026-11-26); old clubs keep what they saved. */
  location?: string;
  level: string;
  founded: string;
  website: string;
  nationality?: string;
  socialMedia?: string;
  phoneNumber?: string;
  clubName: string;
  clubContact: string;
  clubDescription: string;
};

const professionalClubEmployerProfileSchema = new Schema<TProfessionalClubEmployerProfile>({
  country: {
    type: String,
    enum: countryList,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: false,
  },
  level: {
    type: String,
    required: true,
  },
  founded: {
    type: String,
    required: true,
  },
  website: {
    type: String,
    required: true,
  },
  nationality: {
    type: String,
    required: false,
  },
  socialMedia: {
    type: String,
    required: false,
  },
  phoneNumber: {
    type: String,
    required: false,
  },
  clubName: {
    type: String,
    required: true,
  },
  clubContact: {
    type: String,
    required: true,
  },
  clubDescription: {
    type: String,
    required: true,
  },
});
export const ProfessionalClubEmployerProfile = model<TProfessionalClubEmployerProfile>(
  "ProfessionalClubEmployerProfile",
  professionalClubEmployerProfileSchema,
  "professionalclubemps" // keeps the existing collection after the model rename
);
