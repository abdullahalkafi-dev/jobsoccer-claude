import express, { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { langOf } from "../../shared/ai/i18n/lang";
import auth from "../../shared/middlewares/auth";
import catchAsync from "../../shared/util/catchAsync";
import sendResponse from "../../shared/util/sendResponse";
import { User } from "../user/user.model";
import { UserType } from "../user/user.interface";
import { PREMIUM_MIN_SCORE } from "./profileQuality.interface";
import { localizedBands } from "./profileQuality.view";
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
    const lang = langOf(req);
    const user = await User.findById(req.user.id).select("profileQuality").lean();
    let quality = user?.profileQuality ?? (await ProfileQualityService.recalculate(req.user.id));
    // Results saved before translations existed have tips without keys: recalculate them once so they can be shown in the user's language
    const legacy = quality?.categories?.some((category: any) => category.items?.some((item: any) => item.tip && !item.tipKey));
    if (legacy) quality = (await ProfileQualityService.recalculate(req.user.id)) ?? quality;
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Profile quality retrieved",
      data: {
        // texts (labels, tips, level label) in the viewer's language; scores and keys never change
        quality: quality ? await ProfileQualityService.localizedFor(req.user.id, quality as any, lang) : null,
        premiumMinScore: PREMIUM_MIN_SCORE,
        bands: localizedBands(lang),
      },
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
