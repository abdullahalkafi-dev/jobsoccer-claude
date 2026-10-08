import { z } from "zod";

export const createJobSchema = z
  .object({
    jobTitle: z.string().min(3, "Job title is required"),
    location: z.string().min(1, "Location is required"),
    country: z.string().min(1, "Country is required"),
    deadline: z.string().min(1, "Deadline is required"),
    jobOverview: z.string().min(20, "Job overview minimum 20 characters long"),
    jobCategory: z.string().min(1, "Job category is required"),
    position: z.string().min(1, "Position is required"),
    contractType: z.string().min(1, "Contract type is required"),
    minSalary: z.string().min(1, "Minimum salary is required"),
    maxSalary: z.string().min(1, "Maximum salary is required"),
    experience: z.enum(
      ["Entry Level", "Intermediate", "Mid-Level", "Mid-Senior", "Senior"],
      { message: "Please select a valid experience level" }
    ),
    requirements: z.string().min(20, "Requirements minimum 20 characters long"),
    responsibilities: z.string().min(20, "Responsibilities minimum 20 characters long"),
    requiredAiScore: z
      .string()
      .min(1, "Required AI score is required")
      .refine(
        (val) => {
          const num = parseInt(val);
          return !isNaN(num) && num >= 0 && num <= 100;
        },
        { message: "AI score must be between 0 and 100" }
      ),
    requiredSkills: z.string().min(20, "Required skills minimum 20 characters long"),
    additionalRequirements: z.string().optional(),
  })
  .refine(
    (data) => {
      const minSal = parseFloat(data.minSalary);
      const maxSal = parseFloat(data.maxSalary);
      return !isNaN(minSal) && !isNaN(maxSal) && maxSal > minSal;
    },
    {
      message: "Maximum salary must be greater than minimum salary",
      path: ["maxSalary"],
    }
  );

export type CreateJobFormData = z.infer<typeof createJobSchema>;

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
  requiredAiScore: number;
  requiredSkills: string;
  additionalRequirements?: string;
  status: "active" | "closed" | "draft" | "expired";
}
