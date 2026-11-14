import * as z from "zod";
import { englishValidation, type Translator } from "./translator";

export const getExperienceFormSchema = (t: Translator) =>
  z.object({
    title: z.string(t("invalid")).min(1, t("title")),
    employmentType: z.string(t("invalid")).min(1, t("employmentType")),
    club: z.string(t("invalid")).min(1, t("club")),
    location: z.string(t("invalid")).min(1, t("jobLocation")),
    isCurrentlyWorking: z.boolean(t("invalid")),
    startMonth: z.string(t("invalid")).min(1, t("startMonth")),
    startYear: z.string(t("invalid")).min(1, t("startYear")),
    endMonth: z.string().optional(),
    endYear: z.string().optional(),
    description: z.string(t("invalid")).min(1, t("description")),
  });

export type ExperienceFormData = z.infer<ReturnType<typeof getExperienceFormSchema>>;

// English versions for code outside React (types, older imports). Components use the getXxxSchema(t) factories.
export const experienceFormSchema = getExperienceFormSchema(englishValidation);
