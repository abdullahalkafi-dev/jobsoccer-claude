import { z } from "zod";
import { englishValidation, type Translator } from "./translator";

export const getCreatePasswordSchema = (t: Translator) =>
  z
    .object({
      newPassword: z.string(t("invalid")).min(6, t("passwordMin", { min: 6 })),
      confirmPassword: z.string(t("invalid")).min(1, t("confirmPassword")),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("passwordsMismatch"),
      path: ["confirmPassword"],
    });

export type CreatePasswordFormData = z.infer<ReturnType<typeof getCreatePasswordSchema>>;

// English versions for code outside React (types, older imports). Components use the getXxxSchema(t) factories.
export const createPasswordSchema = getCreatePasswordSchema(englishValidation);
