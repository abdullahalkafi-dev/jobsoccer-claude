import { z } from "zod";
import { countryList } from "@/constants/selectOptions";
import { englishValidation, type Translator } from "./translator";

// ---------------------Shared building blocks---------------------

/** Required text (trimmed). `key` is the message in the "validation" namespace. */
const req = (t: Translator, key: string) => z.string(t(key)).trim().min(1, t(key));
/** Required text, not trimmed. */
const reqRaw = (t: Translator, key: string) => z.string(t(key)).min(1, t(key));
const optional = () => z.string().optional();

const countryRule = (t: Translator) => z.string(t("selectCountry")).min(1, t("selectCountry"));

const phoneRule = (t: Translator) =>
  z
    .string(t("phone"))
    .trim()
    .min(1, t("phone"))
    .regex(/^\+?[\d\s().-]{6,20}$/, t("phoneInvalid"));

const websiteRule = (t: Translator) =>
  z
    .string(t("website"))
    .trim()
    .min(1, t("website"))
    .refine((v) => /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/\S*)?$/i.test(v), t("websiteInvalid"));

const pastDateRule = (t: Translator, key: "dobPast" | "foundedPast") =>
  z
    .string(t(key))
    .refine(
      (date) => {
        const parsedDate = new Date(date);
        return !isNaN(parsedDate.getTime()) && parsedDate < new Date();
      },
      { message: t(key) },
    )
    .transform((date) => new Date(date));

const levelRule = (t: Translator) =>
  z.enum(["Division 1", "Division 2", "Division 3", "Division 4"], { error: t("selectLevel") });

const sizeRule = (t: Translator, key: "height" | "weight") =>
  z.number({ error: t(key) }).min(1, t(key));

const heightRule = (t: Translator) =>
  z.object({
    size: sizeRule(t, "height"),
    unit: z.enum(["cm", "m", "in", "ft"], { error: t("selectUnit") }),
  });

const weightRule = (t: Translator) =>
  z.object({
    size: sizeRule(t, "weight"),
    unit: z.enum(["kg", "lb"], { error: t("selectUnit") }),
  });

const logoRule = (t: Translator) =>
  z.instanceof(File, { error: t("logo") }).refine((file) => file.size > 0, t("logo"));

// ---------------------Candidate Role Schemas---------------------

// Personal Information Schema
export const getPersonalInfoSchema = (t: Translator) =>
  z.object({
    image: z.instanceof(File, { error: t("image") }),
    dateOfBirth: pastDateRule(t, "dobPast"),
    placeOfBirth: req(t, "placeOfBirth"),
    nationality: req(t, "nationality"),
    phoneNumber: optional(),
  });

// Amateur player Professional Information Schema
export const getAmateurPlayerProfessionalInfoSchema = (t: Translator) =>
  z.object({
    gender: z.enum(["Male", "Female"], { error: t("gender") }),
    availability: optional(),
    height: heightRule(t),
    weight: weightRule(t),
    currentClub: reqRaw(t, "currentClub"),
    nationalTeamCategory: reqRaw(t, "nationalTeamCategory"),
    foot: z.enum(["Right", "Left", "Both"], { error: t("foot") }),
    position: z.enum(
      [
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
      ],
      { error: t("position") },
    ),
    league: reqRaw(t, "league"),
    agent: optional(),
    socialMedia: optional(),
    country: countryRule(t),
  });

// College or University player Professional Information Schema
export const getCollegeOrUniversityPlayerProfessionalInfoSchema = (t: Translator) =>
  z.object({
    gender: reqRaw(t, "gender"),
    availability: optional(),
    height: heightRule(t),
    weight: weightRule(t),
    currentClub: reqRaw(t, "currentClub"),
    socialMedia: optional(),
    category: optional(),
    foot: reqRaw(t, "foot"),
    position: reqRaw(t, "position"),
    league: reqRaw(t, "league"),
    agent: optional(),
    schoolName: reqRaw(t, "schoolName"),
    collegeOrUniversity: reqRaw(t, "collegeOrUniversity"),
    diploma: reqRaw(t, "diploma"),
    satOrAct: optional(),
    gpa: optional(),
    country: countryRule(t),
  });

// High School player Professional Information Schema
export const getHighSchoolPlayerProfessionalInfoSchema = (t: Translator) =>
  z.object({
    gender: reqRaw(t, "gender"),
    height: heightRule(t),
    weight: weightRule(t),
    availability: optional(),
    currentClub: reqRaw(t, "currentClub"),
    socialMedia: optional(),
    category: optional(),
    foot: reqRaw(t, "foot"),
    position: reqRaw(t, "position"),
    league: reqRaw(t, "league"),
    agent: optional(),
    schoolName: reqRaw(t, "schoolName"),
    diploma: reqRaw(t, "diploma"),
    satOrAct: optional(),
    gpa: optional(),
    country: countryRule(t),
  });

// Professional player Professional Information Schema
export const getProfessionalPlayerProfessionalInfoSchema = (t: Translator) =>
  z.object({
    gender: reqRaw(t, "gender"),
    height: heightRule(t),
    weight: weightRule(t),
    nationalTeamCategory: reqRaw(t, "nationalTeamCategory"),
    currentClub: reqRaw(t, "currentClub"),
    division: req(t, "division"),
    position: reqRaw(t, "position"),
    agent: optional(),
    country: countryRule(t),
    availability: optional(),
    socialMedia: optional(),
    foot: reqRaw(t, "foot"),
    nationalTeamGames: reqRaw(t, "nationalTeamGames"),
    teamsJoined: reqRaw(t, "teamsJoined"),
    contractExpires: reqRaw(t, "contractExpires"),
  });

// Field staff Professional Information Schema
export const getFieldStaffProfessionalInfoSchema = (t: Translator) =>
  z.object({
    currentClub: reqRaw(t, "currentEmployer"),
    availability: optional(),
    country: countryRule(t),
    gender: reqRaw(t, "gender"),
    socialMedia: optional(),
    position: reqRaw(t, "position"),
    league: reqRaw(t, "league"),
    agent: optional(),
    category: optional(),
  });

// Office staff Professional Information Schema
export const getOfficeStaffProfessionalInfoSchema = (t: Translator) =>
  z.object({
    country: z.enum(countryList, { error: t("selectCountry") }),
    position: reqRaw(t, "position"),
    languages: reqRaw(t, "languages"),
    availability: optional(),
    socialMedia: optional(),
    agent: optional(),
    gender: reqRaw(t, "gender"),
    currentClub: reqRaw(t, "currentEmployer"),
  });

// ---------------------Employer Role Schemas---------------------

// Academy Employer Profile Schema
export const getAcademyEmployerProfileSchema = (t: Translator) =>
  z.object({
    logo: logoRule(t),
    clubName: req(t, "clubName"),
    country: countryRule(t),
    address: req(t, "address"),
    founded: pastDateRule(t, "foundedPast"),
    nationality: req(t, "nationality"),
    position: req(t, "position"),
    location: req(t, "location"),
    level: levelRule(t),
    website: websiteRule(t),
    phoneNumber: phoneRule(t),
    clubContact: req(t, "clubContact"),
    clubDescription: req(t, "clubDescription"),
  });

// Agent Employer Profile Schema
export const getAgentEmployerProfileSchema = (t: Translator) =>
  z.object({
    logo: logoRule(t),
    companyName: req(t, "companyName"),
    phoneNumber: phoneRule(t),
    country: countryRule(t),
    nationality: req(t, "nationality"),
    socialMedia: optional(),
    website: websiteRule(t),
    fifaLicenseNumber: req(t, "fifaLicenseNumber"),
  });

// Amateur Club Employer Profile Schema
export const getAmateurClubEmployerProfileSchema = (t: Translator) =>
  z.object({
    logo: logoRule(t),
    clubName: req(t, "clubName"),
    country: countryRule(t),
    address: req(t, "address"),
    founded: pastDateRule(t, "foundedPast"),
    nationality: req(t, "nationality"),
    location: req(t, "location"),
    level: levelRule(t),
    website: websiteRule(t),
    phoneNumber: phoneRule(t),
    clubContact: req(t, "clubContact"),
    clubDescription: req(t, "clubDescription"),
  });

// College or University Employer Profile Schema
export const getCollegeOrUniversityEmployerProfileSchema = (t: Translator) =>
  z.object({
    logo: logoRule(t),
    collegeOrUniversityName: req(t, "collegeOrUniversityName"),
    country: countryRule(t),
    address: req(t, "address"),
    founded: pastDateRule(t, "foundedPast"),
    phoneNumber: phoneRule(t),
    location: req(t, "location"),
    level: levelRule(t),
    website: websiteRule(t),
    clubContact: req(t, "clubContact"),
    clubDescription: req(t, "clubDescription"),
  });

// Consulting Company Employer Profile Schema
export const getConsultingCompanyEmployerProfileSchema = (t: Translator) =>
  z.object({
    logo: logoRule(t),
    clubName: req(t, "clubName"),
    country: countryRule(t),
    address: req(t, "address"),
    founded: pastDateRule(t, "foundedPast"),
    nationality: req(t, "nationality"),
    position: req(t, "position"),
    location: req(t, "location"),
    level: levelRule(t),
    website: websiteRule(t),
    phoneNumber: phoneRule(t),
    clubContact: req(t, "clubContact"),
    clubDescription: req(t, "clubDescription"),
  });

// High School Employer Profile Schema
export const getHighSchoolEmployerProfileSchema = (t: Translator) =>
  z.object({
    logo: logoRule(t),
    highSchoolName: req(t, "highSchoolName"),
    country: countryRule(t),
    address: req(t, "address"),
    founded: pastDateRule(t, "foundedPast"),
    clubName: req(t, "clubName"),
    phoneNumber: phoneRule(t),
    location: req(t, "location"),
    level: levelRule(t),
    website: websiteRule(t),
    clubContact: req(t, "clubContact"),
    clubDescription: req(t, "clubDescription"),
  });

// Professional Club Employer Profile Schema
export const getProfessionalClubEmployerProfileSchema = (t: Translator) =>
  z.object({
    logo: logoRule(t),
    country: countryRule(t),
    address: req(t, "address"),
    location: req(t, "location"),
    level: levelRule(t),
    founded: pastDateRule(t, "foundedPast"),
    website: websiteRule(t),
    nationality: req(t, "nationality"),
    phoneNumber: phoneRule(t),
    clubName: req(t, "clubName"),
    clubContact: req(t, "clubContact"),
    clubDescription: req(t, "clubDescription"),
  });

// English versions for code outside React (types, older imports). Components use the getXxxSchema(t) factories.
export const personalInfoSchema = getPersonalInfoSchema(englishValidation);
export const amateurPlayerProfessionalInfoSchema = getAmateurPlayerProfessionalInfoSchema(englishValidation);
export const collegeOrUniversityPlayerProfessionalInfoSchema = getCollegeOrUniversityPlayerProfessionalInfoSchema(englishValidation);
export const highSchoolPlayerProfessionalInfoSchema = getHighSchoolPlayerProfessionalInfoSchema(englishValidation);
export const professionalPlayerProfessionalInfoSchema = getProfessionalPlayerProfessionalInfoSchema(englishValidation);
export const fieldStaffProfessionalInfoSchema = getFieldStaffProfessionalInfoSchema(englishValidation);
export const officeStaffProfessionalInfoSchema = getOfficeStaffProfessionalInfoSchema(englishValidation);
export const academyEmployerProfileSchema = getAcademyEmployerProfileSchema(englishValidation);
export const agentEmployerProfileSchema = getAgentEmployerProfileSchema(englishValidation);
export const amateurClubEmployerProfileSchema = getAmateurClubEmployerProfileSchema(englishValidation);
export const collegeOrUniversityEmployerProfileSchema = getCollegeOrUniversityEmployerProfileSchema(englishValidation);
export const consultingCompanyEmployerProfileSchema = getConsultingCompanyEmployerProfileSchema(englishValidation);
export const highSchoolEmployerProfileSchema = getHighSchoolEmployerProfileSchema(englishValidation);
export const professionalClubEmployerProfileSchema = getProfessionalClubEmployerProfileSchema(englishValidation);
