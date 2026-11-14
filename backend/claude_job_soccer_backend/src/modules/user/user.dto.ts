import { z } from "zod";
import { NAME_REGEX } from "../../shared/util/nameRegex";

const createUser = z.object({
  body: z
    .object({
      firstName: z
        .string()
        .min(1, "First name is required")
        .max(50, "First name cannot exceed 50 characters")
        .trim()
        .regex(NAME_REGEX, "First name contains invalid characters"),
      lastName: z
        .string()
        .min(1, "Last name is required")
        .max(50, "Last name cannot exceed 50 characters")
        .trim()
        .regex(NAME_REGEX, "Last name contains invalid characters"),
      email: z.string().email("Invalid email address").trim().toLowerCase(),
      address: z.string(),
      latitude: z
        .number()
        .min(-90, "Latitude must be between -90 and 90")
        .max(90, "Latitude must be between -90 and 90"),
      longitude: z
        .number()
        .min(-180, "Longitude must be between -180 and 180")
        .max(180, "Longitude must be between -180 and 180"),
      password: z
        .string()
        .min(6, "Password must be at least 6 characters long")
        .max(100, "Password is too long")
        .trim(),
    })
    .strict(),
});

const updateUser = z.object({
  data: z
    .object({
      firstName: z
        .string()
        .min(1, "First name must be at least 1 characters long")
        .max(50, "First name can't be more than 50 characters")
        .regex(
          NAME_REGEX,
          "First name contains invalid characters"
        )
        .trim()
        .optional(),
      lastName: z
        .string()
        .min(1, "Last name must be at least 1 characters long")
        .max(50, "Last name can't be more than 50 characters")
        .regex(
          NAME_REGEX,
          "Last name contains invalid characters"
        )
        .trim()
        .optional(),
      address: z.string().optional(),
      latitude: z
        .number()
        .min(-90, "Latitude must be between -90 and 90")
        .max(90, "Latitude must be between -90 and 90")
        .optional(),
      longitude: z
        .number()
        .min(-180, "Longitude must be between -180 and 180")
        .max(180, "Longitude must be between -180 and 180")
        .optional(),
      phoneNumber: z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/, "Please provide a valid phone number")
        .trim()
        .optional(),
      image: z.string().nullable().optional(),
    })
    .strict(),
});

const updateLanguage = z.object({
  body: z
    .object({
      language: z.enum(["en", "es", "fr"], "Unsupported language"),
    })
    .strict(),
});

const updateUserActivationStatus = z.object({
  body: z
    .object({
      status: z.enum(["active", "delete"]),
    })
    .strict(),
});

const updateUserRole = z.object({
  body: z
    .object({
      role: z.enum(["ADMIN", "USER"]),
    })
    .strict(),
});



export const UserValidation = {
  createUser,
  updateUser,
  updateLanguage,
  updateUserActivationStatus,
  updateUserRole,
};
