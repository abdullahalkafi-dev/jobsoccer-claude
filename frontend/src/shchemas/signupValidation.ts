import { CandidateRole, EmployerRole } from "@/types/profile";
import { z } from "zod";

// Create arrays of the string values from the enums
const candidateRoles = Object.values(CandidateRole).filter(
  (value) => typeof value === "string"
) as string[];
const employerRoles = Object.values(EmployerRole).filter(
  (value) => typeof value === "string"
) as string[];

// Combine all valid roles as a union type for Zod
const allRoles = [...candidateRoles, ...employerRoles] as [string, ...string[]];

export const signUpSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .refine(
      (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) || "";
      },
      {
        message: "Please enter a valid email address",
      }
    ),
  password: z.string().min(4, "Password must be at least 4 characters long"),
  role: z
    .enum(allRoles as [string, ...string[]])
    .describe("Please select a valid role"),
});

export type SignUpFormData = z.infer<typeof signUpSchema>;

// Export role arrays for use in components
export { candidateRoles, employerRoles, allRoles };
