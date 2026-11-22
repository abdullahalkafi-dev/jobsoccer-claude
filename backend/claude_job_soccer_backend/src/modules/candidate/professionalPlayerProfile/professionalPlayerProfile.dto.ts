import { z } from "zod";

const createProfessionalPlayerProfileDto = z.object({
  dateOfBirth: z
    .string()
    .refine(
      (date) => {
        const parsedDate = new Date(date);
        return !isNaN(parsedDate.getTime()) && parsedDate < new Date();
      },
      {
        message: "Date of birth must be a valid date in the past",
      }
    )
    .transform((date) => new Date(date)),
  placeOfBirth: z.string().trim().min(1, "Place of birth is required"),
  nationality: z.string().trim().min(1, "Nationality is required"),
  phoneNumber: z.string().trim().min(1, "Phone number is required").optional(),
  languages: z.string().trim().max(300, "Languages cannot exceed 300 characters").optional(),
  gender: z.string().trim().min(1, "Gender is required"),
  height: z.object({
    size: z.number().positive("Height must be positive"),
    unit: z.enum(["cm", "m", "in", "ft"]),
  }),
  // Optional; a player may have been in the national team in several categories.
  nationalTeamCategory: z.preprocess(
    // Older clients and stored data send one value; it becomes a list of one.
    (value) => (typeof value === "string" ? (value ? [value] : []) : value),
    z.array(z.enum(["U14", "U15", "U16", "U17", "U18", "U19", "U20", "U21", "Current International"])).optional()
  ),
  currentClub: z.string().trim().min(1, "Current club is required"),
  division: z.string().trim().min(1, "Division is required"),
  position: z.enum([
    "GK",
    "Central back",
    "Left back",
    "Right back",
    "Defensive midfielder",
    "Offensive midfielder",
    "Right winger",
    "Left winger",
    "Striker",
  ]),
  agent: z.string().trim().min(1, "Agent is required").optional(),
  country: z.string().min(1, "Country is required"),
  availability: z.string().trim().max(200).optional(),
  weight: z.object({
    size: z.number().positive("Weight must be positive"),
    unit: z.enum(["kg", "lb"]),
  }),
  nationalTeamGames: z.string().trim().optional(),
  socialMedia: z.string().trim().min(1, "Social media is required").optional(),
  foot: z.enum(["Right", "Left", "Both"]),
  teamsJoined: z.string().trim().min(1, "Teams joined is required"),
  contractExpires: z.string().trim().min(1, "Contract expires is required"),
});

const updateProfessionalPlayerProfileDto = createProfessionalPlayerProfileDto.partial();

export type TCreateProfessionalPlayerProfileDto = z.infer<
  typeof createProfessionalPlayerProfileDto
>;
export type TUpdateProfessionalPlayerProfileDto = z.infer<
  typeof updateProfessionalPlayerProfileDto
>;

export const ProfessionalPlayerProfileDto = {
  createProfessionalPlayerProfileDto,
  updateProfessionalPlayerProfileDto,
};
