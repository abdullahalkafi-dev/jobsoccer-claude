import express, { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import auth from "../../shared/middlewares/auth";
import catchAsync from "../../shared/util/catchAsync";
import sendResponse from "../../shared/util/sendResponse";
import { User } from "../user/user.model";
import { UserType } from "../user/user.interface";
import { PREMIUM_MIN_SCORE, LEVEL_BANDS } from "./profileQuality.interface";
import { ProfileQualityService } from "./profileQuality.service";

const router = express.Router();

/**
 * GET /api/v1/profile-quality/me
 * The candidate's own Profile Quality Score with the breakdown and improvement
 * actions. Calculated on the spot the first time (existing accounts have none yet).
 */
router.get(
  "/me",
  auth(UserType.CANDIDATE),
  catchAsync(async (req: Request, res: Response) => {
    const user = await User.findById(req.user.id).select("profileQuality").lean();
    const quality = user?.profileQuality ?? (await ProfileQualityService.recalculate(req.user.id));
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Profile quality retrieved",
      data: { quality: quality ?? null, premiumMinScore: PREMIUM_MIN_SCORE, bands: LEVEL_BANDS },
    });
  })
);

/** POST /api/v1/profile-quality/recalculate - ask for a fresh calculation (runs in the background). */
router.post(
  "/recalculate",
  auth(UserType.CANDIDATE),
  catchAsync(async (req: Request, res: Response) => {
    ProfileQualityService.requestRecalculation(req.user.id);
    sendResponse(res, { statusCode: StatusCodes.ACCEPTED, success: true, message: "Recalculation started", data: null });
  })
);

export const ProfileQualityRoutes: Router = router;
