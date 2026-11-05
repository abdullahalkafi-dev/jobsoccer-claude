import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import catchAsync from "../../shared/util/catchAsync";
import sendResponse from "../../shared/util/sendResponse";
import { ProfileService } from "./profile.service";

/** Profile fields arrive as JSON text in "data" (multipart) or directly as the body. */
const readProfileData = (req: Request): Record<string, any> => (req.body.data ? JSON.parse(req.body.data) : req.body);

/** Public path of an uploaded image field, or null when none was sent. */
const uploadedImagePath = (req: Request, field: "image" | "banner"): string | null => {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  const file = files?.[field]?.[0];
  return file ? `/images/${file.filename}` : null;
};

const createProfile = catchAsync(async (req: Request, res: Response) => {
  const profileImage = uploadedImagePath(req, "image");
  if (!profileImage) throw new AppError(StatusCodes.BAD_REQUEST, "Profile image is required");

  const data = await ProfileService.createProfile({ userId: req.user.id, data: readProfileData(req), profileImage });
  sendResponse(res, { statusCode: StatusCodes.CREATED, success: true, message: "Profile created successfully", data });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const data = await ProfileService.updateProfile({
    userId: req.user.id,
    data: readProfileData(req),
    profileImage: uploadedImagePath(req, "image"),
    bannerImage: uploadedImagePath(req, "banner"),
  });
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Profile updated successfully", data });
});

export const ProfileController = { createProfile, updateProfile };
