import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import catchAsync from "../../shared/util/catchAsync";
import sendResponse from "../../shared/util/sendResponse";
import { VideoService } from "./video.service";
import { ResumableVideoUpload } from "./video.resumable";

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

/** Resumable upload, step 1: start, or continue the unfinished upload of the same file. */
const startUpload = catchAsync(async (req: Request, res: Response) => {
  const data = await ResumableVideoUpload.start({ userId: req.user.id, ...req.body });
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: data.resumed ? "Upload resumed" : "Upload started", data });
});

/** How much of the file has arrived. */
const uploadStatus = catchAsync(async (req: Request, res: Response) => {
  const data = await ResumableVideoUpload.status(req.user.id, String(req.params.uploadId));
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Upload status", data });
});

/** Step 2 (repeated): one piece of the file, raw bytes, ?offset= where it starts. */
const uploadChunk = catchAsync(async (req: Request, res: Response) => {
  const offset = Number(req.query.offset);
  if (!Number.isInteger(offset) || offset < 0) throw new AppError(StatusCodes.BAD_REQUEST, "Missing or invalid offset.");
  if (!Buffer.isBuffer(req.body)) throw new AppError(StatusCodes.BAD_REQUEST, "Send the piece as application/octet-stream.");
  const data = await ResumableVideoUpload.appendChunk({ userId: req.user.id, id: String(req.params.uploadId), offset, data: req.body });
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Piece received", data });
});

/** Step 3: every byte arrived; check and save the video (same as a normal upload). */
const completeUpload = catchAsync(async (req: Request, res: Response) => {
  const data = await ResumableVideoUpload.complete(req.user.id, String(req.params.uploadId));
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

export const VideoController = { getStatus, saveConsent, upload, startUpload, uploadStatus, uploadChunk, completeUpload, remove, unlock };
