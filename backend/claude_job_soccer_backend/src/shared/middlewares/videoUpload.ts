import { NextFunction, Request, Response } from "express";
import fs from "fs";
import { StatusCodes } from "http-status-codes";
import multer from "multer";
import path from "path";
import AppError from "../../errors/AppError";
import { isAllowedVideoFile } from "../../modules/video/video.validator";
import { VIDEO_LIMITS } from "../../modules/video/video.constant";
import newFileName from "../util/filenameGenerator";

const VIDEO_DIR = path.join(process.cwd(), "uploads", "videos");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdirSync(VIDEO_DIR, { recursive: true });
    cb(null, VIDEO_DIR);
  },
  filename: (_req, file, cb) => cb(null, newFileName(file, path) + path.extname(file.originalname).toLowerCase()),
});

const upload = multer({
  storage,
  limits: { fileSize: VIDEO_LIMITS.maxBytes, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (isAllowedVideoFile(file.originalname, file.mimetype)) return cb(null, true);
    cb(new AppError(StatusCodes.BAD_REQUEST, "Only MP4 or MOV video files are accepted."));
  },
}).single("video");

/**
 * Receive exactly one video (form field "video", up to 600 MB) and put it on
 * req.file. One video per request keeps each upload small enough to finish
 * reliably and lets the browser show real progress per video.
 */
export const videoUpload = (req: Request, res: Response, next: NextFunction): void => {
  upload(req, res, (error: any) => {
    if (!error) return next();
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return next(new AppError(StatusCodes.REQUEST_TOO_LONG, "This video is larger than 600 MB."));
    }
    next(error);
  });
};
