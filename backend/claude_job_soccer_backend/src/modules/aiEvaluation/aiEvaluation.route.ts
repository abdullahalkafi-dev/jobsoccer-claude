import express, { Router } from "express";
import auth from "../../shared/middlewares/auth";
import validateRequest from "../../shared/middlewares/validateRequest";
import { UserType } from "../user/user.interface";
import { AiEvaluationController } from "./aiEvaluation.controller";
import { AiEvaluationDto } from "./aiEvaluation.dto";

const router = express.Router();

// Public: the interview questions for a position (from the client's scoring guide)
router.get("/questions", validateRequest(AiEvaluationDto.questionsDto), AiEvaluationController.getQuestions);

// Candidate: own assessment
router.get("/me", auth(UserType.CANDIDATE), AiEvaluationController.getMine);

// Candidate / admin / accepted connection
router.get("/candidate/:userId", auth(), AiEvaluationController.getForCandidate);
router.get("/:id/status", auth(), AiEvaluationController.getStatus);

// Admin
router.get("/rubrics", auth(UserType.ADMIN), AiEvaluationController.listRubrics);
router.get("/review-queue", auth(UserType.ADMIN), AiEvaluationController.listForReview);
router.post("/candidate/:userId/rescore", auth(UserType.ADMIN), AiEvaluationController.rescore);
router.post(
  "/:id/corrections",
  auth(UserType.ADMIN),
  validateRequest(AiEvaluationDto.correctionDto),
  AiEvaluationController.addCorrection
);

export const AiEvaluationRoutes: Router = router;
