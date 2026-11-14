import * as z from "zod";
import { englishValidation, type Translator } from "./translator";

export const getEducationFormSchema = (t: Translator) =>
  z.object({
    instituteName: z.string(t("invalid")).min(1, t("instituteName")),
    degree: z.string(t("invalid")).min(1, t("degree")),
    fieldOfStudy: z.string(t("invalid")).min(1, t("fieldOfStudy")),
    startMonth: z.string(t("invalid")).min(1, t("startMonth")),
    startYear: z.string(t("invalid")).min(1, t("startYear")),
    endMonth: z.string().optional(),
    endYear: z.string().optional(),
    grade: z.string().optional(),
    isCurrentlyStudying: z.boolean(t("invalid")),
    description: z.string().optional(),
  });

export type EducationFormData = z.infer<ReturnType<typeof getEducationFormSchema>>;

// English versions for code outside React (types, older imports). Components use the getXxxSchema(t) factories.
export const educationFormSchema = getEducationFormSchema(englishValidation);
