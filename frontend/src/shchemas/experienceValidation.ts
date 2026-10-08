import * as z from "zod";

export const experienceFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  employmentType: z.string().min(1, "Employment type is required"),
  club: z.string().min(1, "Club is required"),
  location: z.string().min(1, "Job location is required"),
  isCurrentlyWorking: z.boolean(),
  startMonth: z.string().min(1, "Start month is required"),
  startYear: z.string().min(1, "Start year is required"),
  endMonth: z.string().optional(),
  endYear: z.string().optional(),
  description: z.string().min(1, "Description is required"),
});

export type ExperienceFormData = z.infer<typeof experienceFormSchema>;
