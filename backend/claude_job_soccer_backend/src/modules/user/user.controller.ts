import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { UserServices } from "./user.service";
import catchAsync from "../../shared/util/catchAsync";
import sendResponse from "../../shared/util/sendResponse";
import AppError from "../../errors/AppError";
import { UserType } from "./user.interface";




const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const usersRes = await UserServices.getAllUsers(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Users retrieved successfully ",
    data: usersRes.result,
    meta: usersRes.meta,
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const user = await UserServices.getUserById(req.params.id as string, req.user?.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User retrieved successfully",
    data: user,
  });
});
const updateUser = catchAsync(async (req: Request, res: Response) => {
  const data = req.body.data ? JSON.parse(req.body.data) : {};

  let image = null;
  if (req.files && "image" in req.files && req.files.image[0]) {
    image = `/images/${req.files.image[0].filename}`;
  }

  const userData = {
    ...data,
    profileImage: image ?? undefined, //? If image is null, we don't want to set it to null in the database, we want to ignore it
  };

  // Only the account owner or an admin may change a user.
  if (req.user.id !== req.params.id && req.user.userType !== UserType.ADMIN) {
    throw new AppError(StatusCodes.FORBIDDEN, "You can only update your own account");
  }
  // Role, type and scores are never set from this request.
  for (const protectedField of ["role", "userType", "profileQuality", "interviewScore", "isVerified", "profileId", "authId"]) {
    delete (userData as Record<string, unknown>)[protectedField];
  }

  const user = await UserServices.updateUser(req.params.id as string, userData);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User updated successfully",
    data: user,
  });
});

const updateUserActivationStatus = catchAsync(
  async (req: Request, res: Response) => {
    const { status } = req.body;
    const user = await UserServices.updateUserActivationStatus(
      req.params.id as string,
      status
    );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: `User ${
        status === "active" ? "activated" : "deleted"
      } successfully`,
      data: user,
    });
  }
);

const updateUserRole = catchAsync(async (req: Request, res: Response) => {
  const { role } = req.body;
  const user = await UserServices.updateUserRole(req.params.id as string, role);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User role updated successfully",
    data: user,
  });
});

//get me
const getMe = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await UserServices.getMe(userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User retrieved successfully",
    data: result,
  });
});

export const UserController = {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserActivationStatus,
  updateUserRole,
  getMe,
};
