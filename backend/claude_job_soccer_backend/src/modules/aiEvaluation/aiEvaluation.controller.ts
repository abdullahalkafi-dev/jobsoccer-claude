import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../shared/util/catchAsync";
import sendResponse from "../../shared/util/sendResponse";
import { AiEvaluationService } from "./aiEvaluation.service";

const viewerOf = (req: Request) => ({ id: req.user.id as string, userType: req.user.userType as string });

/** GET /ai-evaluation/me - the candidate's own latest assessment */
const getMine = catchAsync(async (req: Request, res: Response) => {
  const result = await AiEvaluationService.getLatestForCandidate(viewerOf(req), req.user.id);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Assessment retrieved", data: result });
});

/** GET /ai-evaluation/candidate/:userId - candidate, admin, or a connection the candidate accepted */
const getForCandidate = catchAsync(async (req: Request, res: Response) => {
  const result = await AiEvaluationService.getLatestForCandidate(viewerOf(req), req.params.userId as string);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Assessment retrieved", data: result });
});

/** GET /ai-evaluation/:id/status */
const getStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await AiEvaluationService.getStatus(viewerOf(req), req.params.id as string);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Status retrieved", data: result });
});

/** GET /ai-evaluation/questions?position=&level= - questions candidates answer (public) */
const getQuestions = catchAsync(async (req: Request, res: Response) => {
  const result = AiEvaluationService.getQuestions(String(req.query.position), req.query.level as string | undefined);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Questions retrieved", data: result });
});

/** GET /ai-evaluation/rubrics - admin */
const listRubrics = catchAsync(async (_req: Request, res: Response) => {
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Scoring guides retrieved",
    data: AiEvaluationService.listRubricSummaries(),
  });
});

/** GET /ai-evaluation/review-queue - admin: assessments flagged for a person to check */
const listForReview = catchAsync(async (req: Request, res: Response) => {
  const result = await AiEvaluationService.listForReview(req.query as any);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Review queue retrieved",
    data: result.data,
    meta: result.meta,
  });
});

/** POST /ai-evaluation/candidate/:userId/rescore - admin */
const rescore = catchAsync(async (req: Request, res: Response) => {
  const result = await AiEvaluationService.rescore(req.params.userId as string);
  sendResponse(res, { statusCode: StatusCodes.ACCEPTED, success: true, message: "Re-assessment queued", data: result });
});

/** POST /ai-evaluation/:id/corrections - admin: record a human review or score correction */
const addCorrection = catchAsync(async (req: Request, res: Response) => {
  const result = await AiEvaluationService.addCorrection(req.user.id, req.params.id as string, req.body);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Correction saved", data: result });
});

export const AiEvaluationController = {
  getMine,
  getForCandidate,
  getStatus,
  getQuestions,
  listRubrics,
  listForReview,
  rescore,
  addCorrection,
};
