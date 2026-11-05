import express, { Router } from "express";
import { UserController } from "./user.controller";
import { UserType } from "./user.interface";
import { UserValidation } from "./user.dto";
import fileUploadHandler from "../../shared/middlewares/fileUploadHandler";
import auth from "../../shared/middlewares/auth";
import validateRequest from "../../shared/middlewares/validateRequest";
import optionalAuth from "../../shared/middlewares/optionalAuth";

const router = express.Router();

/**
 * GET /api/v1/user
 * Get all users with pagination and filtering
 * Query params:
 *   - page: number (default: 1)
 *   - limit: number (default: 10)
 *   - role: string (filter by user role)
 * Response: Paginated array of user objects
 */
router.get("/", auth(UserType.ADMIN), UserController.getAllUsers);

/**
 * GET /api/v1/user/me
 * Get the authenticated user's profile
 * Auth: Required
 * Response: User object with full profile details
 */
router.get("/me", auth(), UserController.getMe);

/**
 * GET /api/v1/user/:id
 * Get a specific user by ID
 * Params:
 *   - id: string (required) - The ID of the user
 * Response: User object with profile details
 */
router.get("/:id",optionalAuth, UserController.getUserById);

/**
 * PATCH /api/v1/user/:id
 * Update user information
 * Supports file uploads for profile images and videos
 * Params:
 *   - id: string (required) - The ID of the user to update
 * Body: Multipart form data with fields to update
 * Response: Updated user object
 */
router.patch(
  "/:id",
  auth(),
  fileUploadHandler,
  validateRequest(UserValidation.updateUser),
  UserController.updateUser
);

/**
 * PATCH /api/v1/user/:id/status
 * Update user activation status (active/inactive)
 * Params:
 *   - id: string (required) - The ID of the user
 * Body:
 *   - status: string (required) - New activation status
 * Response: Updated user object
 */
router.patch(
  "/:id/status",
  auth(UserType.ADMIN),
  validateRequest(UserValidation.updateUserActivationStatus),
  UserController.updateUserActivationStatus
);

/**
 * PATCH /api/v1/user/:id/role
 * Update user role (candidate/employer)
 * Params:
 *   - id: string (required) - The ID of the user
 * Body:
 *   - role: string (required) - New user role
 * Response: Updated user object
 */
router.patch(
  "/:id/role",
  auth(UserType.ADMIN),
  validateRequest(UserValidation.updateUserRole),
  UserController.updateUserRole
);

export const UserRoutes: Router = router;
