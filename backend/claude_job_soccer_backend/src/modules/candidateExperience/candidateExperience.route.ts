import express, { Router } from "express";
import { CandidateExperienceController } from "./candidateExperience.controller";
import auth from "../../shared/middlewares/auth";
import optionalAuth from "../../shared/middlewares/optionalAuth";
import validateRequest from "../../shared/middlewares/validateRequest";
import {
  addExperienceSchema,
  updateExperienceSchema,
  removeExperienceSchema,
  getExperiencesByUserSchema,
  getExperienceByIdSchema,
  getExperiencesByProfileIdSchema,
} from "./candidateExperience.dto";
import { UserType } from "../user/user.interface";

const router: Router = express.Router();

/**
 * @route   POST /api/v1/candidate-experience
 * @desc    Add a new experience record for a candidate
 * @access  Private (Candidate & Employer)
 */
router.post(
  "/", 
  auth(),
  validateRequest(addExperienceSchema),
  CandidateExperienceController.addExperience
);

/**
 * @route   POST /api/v1/candidate-experience/bulk
 * @desc    Get experience records for multiple users
 * @access  Private (Employer & Admin)
 */
router.post(
  "/bulk",
  auth(UserType.EMPLOYER, UserType.ADMIN),
  CandidateExperienceController.getExperiencesByUsers
);

/**
 * @route   GET /api/v1/candidate-experience/user/:userId
 * @desc    Get all experience records for a user
 * @access  Public / Optional Auth
 */
router.get(
  "/user/:userId",
  optionalAuth,
  validateRequest(getExperiencesByUserSchema),
  CandidateExperienceController.getAllExperiencesByUser
);

/**
 * @route   GET /api/v1/candidate-experience/profile/:profileId
 * @desc    Get all experience records by profileId
 * @access  Private (All authenticated users)
 */
router.get(
  "/profile/:profileId",
  auth(),
  validateRequest(getExperiencesByProfileIdSchema),
  CandidateExperienceController.getExperiencesByProfileId
);

/**
 * @route   GET /api/v1/candidate-experience/:experienceId
 * @desc    Get a specific experience record by ID
 * @access  Public / Optional Auth
 */
router.get(
  "/:experienceId",
  optionalAuth,
  validateRequest(getExperienceByIdSchema),
  CandidateExperienceController.getExperienceById
);

/**
 * @route   PATCH /api/v1/candidate-experience/:experienceId
 * @desc    Update an existing experience record
 * @access  Private (Candidate & Employer)
 */
router.patch(
  "/:experienceId",
  auth(),
  validateRequest(updateExperienceSchema),
  CandidateExperienceController.updateExperience
);

/**
 * @route   DELETE /api/v1/candidate-experience/:experienceId
 * @desc    Remove a specific experience record
 * @access  Private (Candidate & Employer)
 */
router.delete(
  "/:experienceId",
  auth(),
  validateRequest(removeExperienceSchema),
  CandidateExperienceController.removeExperience
);

export const CandidateExperienceRoutes = router;
