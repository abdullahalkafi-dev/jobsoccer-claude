import { z } from "zod";
import { englishValidation, type Translator } from "./translator";

export const getCreateJobSchema = (t: Translator) =>
  z
    .object({
      jobTitle: z.string(t("invalid")).min(3, t("jobTitle")),
      location: z.string(t("invalid")).min(1, t("location")),
      country: z.string(t("invalid")).min(1, t("country")),
      deadline: z.string(t("invalid")).min(1, t("deadline")),
      jobOverview: z.string(t("invalid")).min(20, t("jobOverviewMin", { min: 20 })),
      jobCategory: z.string(t("invalid")).min(1, t("jobCategory")),
      position: z.string(t("invalid")).min(1, t("position")),
      contractType: z.string(t("invalid")).min(1, t("contractType")),
      minSalary: z.string(t("invalid")).min(1, t("minSalary")),
      maxSalary: z.string(t("invalid")).min(1, t("maxSalary")),
      experience: z.enum(
        ["Entry Level", "Intermediate", "Mid-Level", "Mid-Senior", "Senior"],
        { error: t("selectExperience") }
      ),
      requirements: z.string(t("invalid")).min(20, t("requirementsMin", { min: 20 })),
      responsibilities: z.string(t("invalid")).min(20, t("responsibilitiesMin", { min: 20 })),
      requiredSkills: z.string(t("invalid")).min(20, t("requiredSkillsMin", { min: 20 })),
      additionalRequirements: z.string().optional(),
    })
    .refine(
      (data) => {
        const minSal = parseFloat(data.minSalary);
        const maxSal = parseFloat(data.maxSalary);
        return !isNaN(minSal) && !isNaN(maxSal) && maxSal > minSal;
      },
      {
        message: t("maxSalaryGreater"),
        path: ["maxSalary"],
      }
    );

export type CreateJobFormData = z.infer<ReturnType<typeof getCreateJobSchema>>;

// Type for API payload (with transformed salary object)
export interface CreateJobPayload {
  jobTitle: string;
  location: string;
  country: string;
  deadline: string;
  jobOverview: string;
  jobCategory: string;
  position: string;
  contractType: string;
  salary: {
    min: number;
    max: number;
  };
  experience: string;
  requirements: string;
  responsibilities: string;
  requiredSkills: string;
  additionalRequirements?: string;
  status: "active" | "closed" | "draft" | "expired";
}

// English versions for code outside React (types, older imports). Components use the getXxxSchema(t) factories.
export const createJobSchema = getCreateJobSchema(englishValidation);
