import express, { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import AppError from "../../errors/AppError";
import auth from "../../shared/middlewares/auth";
import fileUploadHandler from "../../shared/middlewares/fileUploadHandler";
import validateRequest from "../../shared/middlewares/validateRequest";
import catchAsync from "../../shared/util/catchAsync";
import sendResponse from "../../shared/util/sendResponse";
import { UserType } from "../user/user.interface";
import { CredentialVerificationService, RECORD_TYPES } from "./credentialVerification.service";

const router = express.Router();

const typeParam = z.enum(RECORD_TYPES);

const reviewDto = z.object({
  params: z.object({ type: typeParam, recordId: z.string().min(1) }),
  body: z
    .object({ status: z.enum(["approved", "rejected"]), note: z.string().trim().max(300).optional() })
    .strict(),
});

/**
 * POST /api/v1/credential-verification/:type/:recordId/document
 * Candidate attaches a supporting PDF (multipart field "doc") to one of their records.
 * :type = experience | education | license
 */
router.post(
  "/:type/:recordId/document",
  auth(UserType.CANDIDATE),
  fileUploadHandler,
  catchAsync(async (req: Request, res: Response) => {
    const type = typeParam.parse(req.params.type);
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    const file = files?.doc?.[0];
    if (!file) throw new AppError(StatusCodes.BAD_REQUEST, "Please attach a PDF document (form field \"doc\").");
    const data = await CredentialVerificationService.submitDocument({ userId: req.user.id, type, recordId: req.params.recordId, file });
    sendResponse(res, { statusCode: StatusCodes.CREATED, success: true, message: "Document sent for verification", data });
  })
);

/** GET /api/v1/credential-verification/pending - admin: documents waiting for review. */
router.get(
  "/pending",
  auth(UserType.ADMIN),
  catchAsync(async (_req: Request, res: Response) => {
    const data = await CredentialVerificationService.listPending();
    sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Pending documents retrieved", data });
  })
);

/** PATCH /api/v1/credential-verification/:type/:recordId/review - admin: approve or reject. */
router.patch(
  "/:type/:recordId/review",
  auth(UserType.ADMIN),
  validateRequest(reviewDto),
  catchAsync(async (req: Request, res: Response) => {
    const data = await CredentialVerificationService.review({
      adminId: req.user.id,
      type: typeParam.parse(req.params.type),
      recordId: req.params.recordId,
      status: req.body.status,
      note: req.body.note,
    });
    sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: `Document ${req.body.status}`, data });
  })
);

export const CredentialVerificationRoutes: Router = router;
