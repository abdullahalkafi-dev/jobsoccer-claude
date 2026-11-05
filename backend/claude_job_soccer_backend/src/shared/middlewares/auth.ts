import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Secret } from "jsonwebtoken";
import config from "../../config";
import { jwtHelper } from "../util/jwtHelper";
import AppError from "../../errors/AppError";

/**
 * Require a valid "Authorization: Bearer <token>" header and, when roles are
 * given, one of those user types. The decoded token is put on req.user.
 * Nothing from the request (token, body) is ever logged here.
 */
const auth =
  (...roles: string[]) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const header = req.headers.authorization;
      if (!header?.startsWith("Bearer ")) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "You are not authorized");
      }

      const verified = jwtHelper.verifyToken(header.split(" ")[1], config.jwt.jwt_secret as Secret);
      req.user = verified as typeof req.user;

      if (roles.length && !roles.includes(verified.userType)) {
        throw new AppError(StatusCodes.FORBIDDEN, "You don't have permission to access this api");
      }
      next();
    } catch (error) {
      next(error);
    }
  };

export default auth;
