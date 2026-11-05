import express, { Router } from "express";
import auth from "../../shared/middlewares/auth";
import validateRequest from "../../shared/middlewares/validateRequest";
import { videoUpload } from "../../shared/middlewares/videoUpload";
import { UserType } from "../user/user.interface";
import { VideoController } from "./video.controller";
import { VideoDto } from "./video.dto";

const router = express.Router();

/** GET /api/v1/videos/me - what to upload, current videos, locks, what is missing. */
router.get("/me", auth(UserType.CANDIDATE), VideoController.getStatus);

/** POST /api/v1/videos/consent - the AI notice / filming-permission checkboxes. */
router.post("/consent", auth(UserType.CANDIDATE), validateRequest(VideoDto.consentDto), VideoController.saveConsent);

/** POST /api/v1/videos - upload ONE video (multipart: video, kind, title?, replaceVideoId?). */
router.post("/", auth(UserType.CANDIDATE), videoUpload, validateRequest(VideoDto.uploadDto), VideoController.upload);

/** DELETE /api/v1/videos/:videoId - remove an optional video. */
router.delete("/:videoId", auth(UserType.CANDIDATE), VideoController.remove);

/** POST /api/v1/videos/unlock/:userId - admin ends the 3-month lock early. */
router.post("/unlock/:userId", auth(UserType.ADMIN), validateRequest(VideoDto.unlockDto), VideoController.unlock);

export const VideoRoutes: Router = router;
