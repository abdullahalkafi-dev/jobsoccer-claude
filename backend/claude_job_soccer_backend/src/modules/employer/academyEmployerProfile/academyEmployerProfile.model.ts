import { model, Schema } from "mongoose";
import { countryList } from "../../../shared/constant/country.constant";

export type TAcademyEmployerProfile = {
  clubName: string;
  country: (typeof countryList)[number];
  address: string;
  founded: string;
  nationality: string;
  position: string;
  location: string;
  level: string;
  website: string;
  phoneNumber?: string;
  clubContact: string;
  clubDescription: string;
};

const academyEmployerProfileSchema = new Schema<TAcademyEmployerProfile>({
    clubName: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        enum: countryList,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    founded: {
        type: String,
        required: true,
    },
    nationality: {
        type: String,
        required: true,
    },
    position: {
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
    website: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: false,
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

export const AcademyEmployerProfile = model<TAcademyEmployerProfile>(
    "AcademyEmployerProfile",
    academyEmployerProfileSchema,
  "academyemps" // keeps the existing collection after the model rename
);
