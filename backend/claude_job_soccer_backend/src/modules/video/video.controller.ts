import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import catchAsync from "../../shared/util/catchAsync";
import sendResponse from "../../shared/util/sendResponse";
import { VideoService } from "./video.service";

const getStatus = catchAsync(async (req: Request, res: Response) => {
  const data = await VideoService.getStatus(req.user.id);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Video status retrieved", data });
});

const saveConsent = catchAsync(async (req: Request, res: Response) => {
  const data = await VideoService.saveConsent(req.user.id, req.body);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Consent saved", data });
});

const upload = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) throw new AppError(StatusCodes.BAD_REQUEST, "Please choose a video file (form field \"video\").");
  const data = await VideoService.uploadVideo({
    userId: req.user.id,
    kind: req.body.kind,
    file: req.file,
    title: req.body.title,
    replaceVideoId: req.body.replaceVideoId,
  });
  sendResponse(res, { statusCode: StatusCodes.CREATED, success: true, message: "Video uploaded", data });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const data = await VideoService.deleteVideo(req.user.id, req.params.videoId);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Video deleted", data });
});

const unlock = catchAsync(async (req: Request, res: Response) => {
  const data = await VideoService.unlockVideosByAdmin(req.params.userId, req.body.kind);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Videos unlocked", data });
});

export const VideoController = { getStatus, saveConsent, upload, remove, unlock };
