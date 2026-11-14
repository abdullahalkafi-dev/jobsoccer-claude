import { z } from "zod";
import { englishValidation, type Translator } from "./translator";

export const getSignInSchema = (t: Translator) =>
  z.object({
    email: z.string(t("invalid")).min(1, t("email")).min(3, t("emailMin", { min: 3 })),
    password: z.string(t("invalid")).min(1, t("password")).min(6, t("passwordMin", { min: 6 })),
  });

export type SignInFormData = z.infer<ReturnType<typeof getSignInSchema>>;

// English versions for code outside React (types, older imports). Components use the getXxxSchema(t) factories.
export const signInSchema = getSignInSchema(englishValidation);
