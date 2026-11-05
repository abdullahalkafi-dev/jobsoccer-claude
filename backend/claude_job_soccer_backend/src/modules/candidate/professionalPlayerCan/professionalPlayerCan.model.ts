import { model, Schema } from "mongoose";
import { TProfileVideo } from "../../video/video.constant";
import { profileVideoSchema } from "../../video/video.schema";
import { countryList } from "../../../shared/constant/country.constant";

enum TNationalTeamCategory {
  U14 = "U14",
  U15 = "U15",
  U16 = "U16",
  U17 = "U17",
  U18 = "U18",
  U19 = "U19",
  U20 = "U20",
  U21 = "U21",
}
enum PlayerPosition {
  GK = "GK",
  CENTRAL_BACK = "Central back",
  LEFT_BACK = "Left back",
  RIGHT_BACK = "Right back",
  DEFENSIVE_MIDFIELDER = "Defensive midfielder",
  OFFENSIVE_MIDFIELDER = "Offensive midfielder",
  RIGHT_WINGER = "Right winger",
  LEFT_WINGER = "Left winger",
  FORWARD = "Forward",
  STRIKER = "Striker",
}

enum TFoot {
  RIGHT = "Right",
  LEFT = "Left",
  BOTH = "Both",
}

export type TProfessionalPlayerCan = {
  dateOfBirth: Date;
  placeOfBirth: string;
  nationality: string;
  phoneNumber?: string;
  gender: string;
  height: { size: number; unit: string };
  nationalTeamCategory?: TNationalTeamCategory;
  currentClub: string;
  division: string;
  position: PlayerPosition;
  agent?: string;
  country: (typeof countryList)[number];
  availability: string;
  weight: { size: number; unit: string };
  nationalTeamGames: string;
  socialMedia: string;
  foot: TFoot;
  teamsJoined: string;
  contractExpires: string;
  videos: TProfileVideo[];
};

const professionalPlayerCanSchema = new Schema<TProfessionalPlayerCan>(
    {
        dateOfBirth: { type: Date, required: true },
        placeOfBirth: { type: String, required: true, trim: true },
        nationality: { type: String, required: true, trim: true },
        phoneNumber: { type: String, required: false, trim: true },
        gender: { type: String, required: true, trim: true },
        height: {
            size: { type: Number, required: true },
            unit: { type: String, required: true, enum: ["cm", "m", "in", "ft"] },
        },
        nationalTeamCategory: {
            type: String,
            enum: Object.values(TNationalTeamCategory),
            required: false,
        },
        currentClub: { type: String, required: true, trim: true },
        division: { type: String, required: true, trim: true },
        position: {
            type: String,
            enum: Object.values(PlayerPosition),
            required: true,
        },
        agent: { type: String, required: false, trim: true },
        country: {
            type: String,
            enum: countryList,
            required: true,
        },
        availability: {
            type: String,
            required: false,
        },
        weight: {
            size: { type: Number, required: true },
            unit: { type: String, required: true, enum: ["kg", "lb"] },
        },
        nationalTeamGames: { type: String, required: true, trim: true },
        socialMedia: { type: String, required: true, trim: true },
        foot: {
            type: String,
            enum: Object.values(TFoot),
            required: true,
        },
        teamsJoined: { type: String, required: true, trim: true },
        contractExpires: { type: String, required: true, trim: true },
        videos: { type: [profileVideoSchema], default: [] },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export const ProfessionalPlayerCan = model<TProfessionalPlayerCan>(
  "ProfessionalPlayerCan",
  professionalPlayerCanSchema
);
