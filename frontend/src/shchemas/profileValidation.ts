import { z } from "zod";
import { countryList } from "@/constants/selectOptions";

// ---------------------Candidate Role Schemas---------------------

// Personal Information Schema
export const personalInfoSchema = z.object({
  image: z.instanceof(File),
  dateOfBirth: z
    .string()
    .refine(
      (date) => {
        const parsedDate = new Date(date);
        return !isNaN(parsedDate.getTime()) && parsedDate < new Date();
      },
      {
        message: "Date of birth must be a valid date in the past",
      },
    )
    .transform((date) => new Date(date)),
  placeOfBirth: z.string().trim().min(1, "Place of birth is required"),
  nationality: z.string().trim().min(1, "Nationality is required"),
  phoneNumber: z.string().optional(),
});

// Amateur player Professional Information Schema
export const amateurPlayerProfessionalInfoSchema = z.object({
  gender: z.enum(["Male", "Female"]),
  availability: z.enum(["Now", "Soon", "Later"]).optional(),
  height: z.object({
    size: z.number().min(1, "Height is required"),
    unit: z.enum(["cm", "m", "in", "ft"]),
  }),
  weight: z.object({
    size: z.number().min(1, "Weight is required"),
    unit: z.enum(["kg", "lb"]),
  }),
  currentClub: z.string().min(1, "Current club is required"),
  nationalTeamCategory: z.string().min(1, "National Team Category is required"),
  foot: z.enum(["Right", "Left", "Both"]),
  position: z.enum([
    "GK",
    "Central back",
    "Left back",
    "Right back",
    "Defensive midfielder",
    "Offensive midfielder",
    "Right winger",
    "Left winger",
    "Forward",
    "Striker",
  ]),
  league: z.string().min(1, "League is required"),
  agent: z.string().optional(),
  socialMedia: z.string().optional(),
  country: z.string().min(1, "Country is required"),
});

// College or University player Professional Information Schema
export const collegeOrUniversityPlayerProfessionalInfoSchema = z.object({
  gender: z.string().min(1, "Gender is required"),
  availability: z.string().optional(),
  height: z.object({
    size: z.number().min(1, "Height is required"),
    unit: z.enum(["cm", "m", "in", "ft"]),
  }),
  weight: z.object({
    size: z.number().min(1, "Weight is required"),
    unit: z.enum(["kg", "lb"]),
  }),
  currentClub: z.string().min(1, "Current club is required"),
  socialMedia: z.string().optional(),
  category: z.string().optional(),
  foot: z.string().min(1, "Foot is required"),
  position: z.string().min(1, "Position is required"),
  league: z.string().min(1, "League is required"),
  agent: z.string().optional(),
  schoolName: z.string().min(1, "School Name is required"),
  collegeOrUniversity: z.string().min(1, "College or University is required"),
  diploma: z.string().min(1, "Diploma is required"),
  satOrAct: z.string().optional(),
  gpa: z.string().optional(),
  country: z.string().min(1, "Country is required"),
});

// High School player Professional Information Schema
export const highSchoolPlayerProfessionalInfoSchema = z.object({
  gender: z.string().min(1, "Gender is required"),
  height: z.object({
    size: z.number().min(1, "Height is required"),
    unit: z.enum(["cm", "m", "in", "ft"]),
  }),
  weight: z.object({
    size: z.number().min(1, "Weight is required"),
    unit: z.enum(["kg", "lb"]),
  }),
  availability: z.string().optional(),
  currentClub: z.string().min(1, "Current club is required"),
  socialMedia: z.string().optional(),
  category: z.string().optional(),
  foot: z.string().min(1, "Foot is required"),
  position: z.string().min(1, "Position is required"),
  league: z.string().min(1, "League is required"),
  agent: z.string().optional(),
  schoolName: z.string().min(1, "School Name is required"),
  diploma: z.string().min(1, "Diploma is required"),
  satOrAct: z.string().optional(),
  gpa: z.string().optional(),
  country: z.string().min(1, "Country is required"),
});

// Professional player Professional Information Schema
export const professionalPlayerProfessionalInfoSchema = z.object({
  gender: z.string().min(1, "Gender is required"),
  height: z.object({
    size: z.number().min(1, "Height is required"),
    unit: z.enum(["cm", "m", "in", "ft"]),
  }),
  weight: z.object({
    size: z.number().min(1, "Weight is required"),
    unit: z.enum(["kg", "lb"]),
  }),
  nationalTeamCategory: z.string().min(1, "National Team Category is required"),
  currentClub: z.string().min(1, "Current club is required"),
  division: z.string().trim().min(1, "Division is required"),
  position: z.string().min(1, "Position is required"),
  agent: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  availability: z.string().optional(),
  socialMedia: z.string().optional(),
  foot: z.string().min(1, "Foot is required"),
  nationalTeamGames: z.string().min(1, "National Team Games is required"),
  teamsJoined: z.string().min(1, "Team's Joined is required"),
  contractExpires: z.string().min(1, "Contract expires is required"),
});

// Field staff Professional Information Schema
export const fieldStaffProfessionalInfoSchema = z.object({
  currentClub: z.string().min(1, "Current employer is required"),
  availability: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  gender: z.string().min(1, "Gender is required"),
  socialMedia: z.string().optional(),
  position: z.string().min(1, "Position is required"),
  league: z.string().min(1, "League is required"),
  agent: z.string().optional(),
  category: z.string().optional(),
});

// Office staff Professional Information Schema
export const officeStaffProfessionalInfoSchema = z.object({
  country: z.enum(countryList).describe("Please select a valid country"),
  position: z.string().min(1, "Position is required"),
  languages: z.string().min(1, "Languages is required"),
  availability: z.string().optional(),
  socialMedia: z.string().optional(),
  agent: z.string().optional(),
  gender: z.string().min(1, "Gender is required"),
  currentClub: z.string().min(1, "Current employer is required"),
});

// // Video Schema
export const videoSchema = z.object({
  videos: z.array(z.instanceof(File)).min(1, "At least one video is required"),
});

// ---------------------End of Candidate Role Schemas---------------------

//----------------------Employer Role Schemas---------------------

// Academy Employer Profile Schema
export const academyEmployerProfileSchema = z.object({
  logo: z
    .instanceof(File, { message: "Please upload a logo" })
    .refine((file) => file.size > 0, "Logo is required"),
  clubName: z.string().trim().min(1, "Club name is required"),
  country: z.string().min(1, "Country is required"),
  address: z.string().trim().min(1, "Address is required"),
  founded: z
    .string()
    .refine(
      (date) => {
        const parsedDate = new Date(date);
        return !isNaN(parsedDate.getTime()) && parsedDate < new Date();
      },
      {
        message: "Founded date must be a valid date in the past",
      },
    )
    .transform((date) => new Date(date)),
  nationality: z.string().trim().min(1, "Nationality is required"),
  position: z.string().trim().min(1, "Position is required"),
  location: z.string().trim().min(1, "Location is required"),
  level: z.enum(["Division 1", "Division 2", "Division 3", "Division 4"]),
  website: z.string().trim().min(1, "Website is required"),
  phoneNumber: z.string().trim().min(1, "Phone number is required"),
  clubContact: z.string().trim().min(1, "Club contact is required"),
  clubDescription: z.string().trim().min(1, "Club description is required"),
});

// Agent Employer Profile Schema
export const agentEmployerProfileSchema = z.object({
  logo: z
    .instanceof(File, { message: "Please upload a logo" })
    .refine((file) => file.size > 0, "Logo is required"),
  companyName: z.string().trim().min(1, "Company name is required"),
  phoneNumber: z.string().trim().min(1, "Phone number is required"),
  country: z.string().min(1, "Country is required"),
  nationality: z.string().trim().min(1, "Nationality is required"),
  socialMedia: z.string().optional(),
  website: z.string().trim().min(1, "Website is required"),
  fifaLicenseNumber: z
    .string()
    .trim()
    .min(1, "FIFA license number is required"),
});

// Amateur Club Employer Profile Schema
export const amateurClubEmployerProfileSchema = z.object({
  logo: z
    .instanceof(File, { message: "Please upload a logo" })
    .refine((file) => file.size > 0, "Logo is required"),
  clubName: z.string().trim().min(1, "Club name is required"),
  country: z.string().min(1, "Country is required"),
  address: z.string().trim().min(1, "Address is required"),
  founded: z
    .string()
    .refine(
      (date) => {
        const parsedDate = new Date(date);
        return !isNaN(parsedDate.getTime()) && parsedDate < new Date();
      },
      {
        message: "Founded date must be a valid date in the past",
      },
    )
    .transform((date) => new Date(date)),
  nationality: z.string().trim().min(1, "Nationality is required"),
  location: z.string().trim().min(1, "Location is required"),
  level: z.enum(["Division 1", "Division 2", "Division 3", "Division 4"]),
  website: z.string().trim().min(1, "Website is required"),
  phoneNumber: z.string().trim().min(1, "Phone number is required"),
  clubContact: z.string().trim().min(1, "Club contact is required"),
  clubDescription: z.string().trim().min(1, "Club description is required"),
});

// College or University Employer Profile Schema
export const collegeOrUniversityEmployerProfileSchema = z.object({
  logo: z
    .instanceof(File, { message: "Please upload a logo" })
    .refine((file) => file.size > 0, "Logo is required"),
  collegeOrUniversityName: z
    .string()
    .trim()
    .min(1, "College or university name is required"),
  country: z.string().min(1, "Country is required"),
  address: z.string().trim().min(1, "Address is required"),
  founded: z
    .string()
    .refine(
      (date) => {
        const parsedDate = new Date(date);
        return !isNaN(parsedDate.getTime()) && parsedDate < new Date();
      },
      {
        message: "Founded date must be a valid date in the past",
      },
    )
    .transform((date) => new Date(date)),
  phoneNumber: z.string().trim().min(1, "Phone number is required"),
  location: z.string().trim().min(1, "Location is required"),
  level: z.enum(["Division 1", "Division 2", "Division 3", "Division 4"]),
  website: z.string().trim().min(1, "Website is required"),
  clubContact: z.string().trim().min(1, "Club contact is required"),
  clubDescription: z.string().trim().min(1, "Club description is required"),
});

// Consulting Company Employer Profile Schema
export const consultingCompanyEmployerProfileSchema = z.object({
  logo: z
    .instanceof(File, { message: "Please upload a logo" })
    .refine((file) => file.size > 0, "Logo is required"),
  clubName: z.string().trim().min(1, "Club name is required"),
  country: z.string().min(1, "Country is required"),
  address: z.string().trim().min(1, "Address is required"),
  founded: z
    .string()
    .refine(
      (date) => {
        const parsedDate = new Date(date);
        return !isNaN(parsedDate.getTime()) && parsedDate < new Date();
      },
      {
        message: "Founded date must be a valid date in the past",
      },
    )
    .transform((date) => new Date(date)),
  nationality: z.string().trim().min(1, "Nationality is required"),
  position: z.string().trim().min(1, "Position is required"),
  location: z.string().trim().min(1, "Location is required"),
  level: z.enum(["Division 1", "Division 2", "Division 3", "Division 4"]),
  website: z.string().trim().min(1, "Website is required"),
  phoneNumber: z.string().trim().min(1, "Phone number is required"),
  clubContact: z.string().trim().min(1, "Club contact is required"),
  clubDescription: z.string().trim().min(1, "Club description is required"),
});

// High School Employer Profile Schema
export const highSchoolEmployerProfileSchema = z.object({
  logo: z
    .instanceof(File, { message: "Please upload a logo" })
    .refine((file) => file.size > 0, "Logo is required"),
  highSchoolName: z.string().trim().min(1, "High school name is required"),
  country: z.string().min(1, "Country is required"),
  address: z.string().trim().min(1, "Address is required"),
  founded: z
    .string()
    .refine(
      (date) => {
        const parsedDate = new Date(date);
        return !isNaN(parsedDate.getTime()) && parsedDate < new Date();
      },
      {
        message: "Founded date must be a valid date in the past",
      },
    )
    .transform((date) => new Date(date)),
  clubName: z.string().trim().min(1, "Club name is required"),
  phoneNumber: z.string().trim().min(1, "Phone number is required"),
  location: z.string().trim().min(1, "Location is required"),
  level: z.enum(["Division 1", "Division 2", "Division 3", "Division 4"]),
  website: z.string().trim().min(1, "Website is required"),
  clubContact: z.string().trim().min(1, "Club contact is required"),
  clubDescription: z.string().trim().min(1, "Club description is required"),
});

// Professional Club Employer Profile Schema
export const professionalClubEmployerProfileSchema = z.object({
  logo: z
    .instanceof(File, { message: "Please upload a logo" })
    .refine((file) => file.size > 0, "Logo is required"),
  country: z.string().min(1, "Country is required"),
  address: z.string().trim().min(1, "Address is required"),
  location: z.string().trim().min(1, "Location is required"),
  level: z.enum(["Division 1", "Division 2", "Division 3", "Division 4"]),
  founded: z
    .string()
    .refine(
      (date) => {
        const parsedDate = new Date(date);
        return !isNaN(parsedDate.getTime()) && parsedDate < new Date();
      },
      {
        message: "Founded date must be a valid date in the past",
      },
    )
    .transform((date) => new Date(date)),
  website: z.string().trim().min(1, "Website is required"),
  nationality: z.string().trim().min(1, "Nationality is required"),
  phoneNumber: z.string().trim().min(1, "Phone number is required"),
  clubName: z.string().trim().min(1, "Club name is required"),
  clubContact: z.string().trim().min(1, "Club contact is required"),
  clubDescription: z.string().trim().min(1, "Club description is required"),
});
