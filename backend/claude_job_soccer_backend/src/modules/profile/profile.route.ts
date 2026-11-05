import express, { Router } from "express";
import auth from "../../shared/middlewares/auth";
import fileUploadHandler from "../../shared/middlewares/fileUploadHandler";
import { ProfileController } from "./profile.controller";

const router = express.Router();

/**
 * POST /api/v1/profile
 * Create the role profile (multipart: "data" JSON + "image" photo).
 * Videos are uploaded afterwards, one per request, through /api/v1/videos.
 */
router.post("/", auth(), fileUploadHandler, ProfileController.createProfile);

/** PATCH /api/v1/profile - update profile fields, photo and banner. */
router.patch("/", auth(), fileUploadHandler, ProfileController.updateProfile);

export const ProfileRoutes: Router = router;
