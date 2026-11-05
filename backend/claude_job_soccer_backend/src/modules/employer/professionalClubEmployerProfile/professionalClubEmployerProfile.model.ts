import { model, Schema } from "mongoose";
import { countryList } from "../../../shared/constant/country.constant";

export type TProfessionalClubEmployerProfile = {
  country: (typeof countryList)[number];
  address: string;
  location: string;
  level: string;
  founded: string;
  website: string;
  nationality: string;
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
    required: true,
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
    required: true,
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
