import * as z from "zod";

export const educationFormSchema = z.object({
  instituteName: z.string().min(1, "Institute name is required"),
  degree: z.string().min(1, "Degree is required"),
  fieldOfStudy: z.string().min(1, "Field of study is required"),
  startMonth: z.string().min(1, "Start month is required"),
  startYear: z.string().min(1, "Start year is required"),
  endMonth: z.string().optional(),
  endYear: z.string().optional(),
  grade: z.string().optional(),
  isCurrentlyStudying: z.boolean(),
  description: z.string().optional(),
});

export type EducationFormData = z.infer<typeof educationFormSchema>;
