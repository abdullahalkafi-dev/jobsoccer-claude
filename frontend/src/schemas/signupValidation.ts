import { CandidateRole, EmployerRole } from "@/types/profile";
import { z } from "zod";
import { englishValidation, type Translator } from "./translator";

// Create arrays of the string values from the enums
const candidateRoles = Object.values(CandidateRole).filter(
  (value) => typeof value === "string"
) as string[];
const employerRoles = Object.values(EmployerRole).filter(
  (value) => typeof value === "string"
) as string[];

// Combine all valid roles as a union type for Zod
const allRoles = [...candidateRoles, ...employerRoles] as [string, ...string[]];

export const getSignUpSchema = (t: Translator) =>
  z.object({
    firstName: z.string(t("invalid")).min(1, t("firstName")),
    lastName: z.string(t("invalid")).min(1, t("lastName")),
    email: z
      .string(t("invalid"))
      .min(1, t("email"))
      .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
        message: t("emailInvalid"),
      }),
    password: z.string(t("invalid")).min(1, t("password")).min(6, t("passwordMin", { min: 6 })),
    role: z.enum(allRoles, { error: t("selectRole") }),
  });

export type SignUpFormData = z.infer<ReturnType<typeof getSignUpSchema>>;

// Export role arrays for use in components
export { candidateRoles, employerRoles, allRoles };

// English versions for code outside React (types, older imports). Components use the getXxxSchema(t) factories.
export const signUpSchema = getSignUpSchema(englishValidation);
