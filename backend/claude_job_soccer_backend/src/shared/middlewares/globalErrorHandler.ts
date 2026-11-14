import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import config from "../../config";
import { TErrorSources } from "../types/error";
import handleZodError from "../../errors/handleZodError";
import handleValidationError from "../../errors/handleValidationError";
import handleCastError from "../../errors/handleCastError";
import handleDuplicateError from "../../errors/handleDuplicateError";
import AppError from "../../errors/AppError";
import { logger } from "../logger/logger";
import { requestContext } from "../logger/transport";
import { isKnownMessage, resolveLang, translateMessage } from "../i18n";

/** multer error codes -> friendly English sentences (translated through the catalog). */
const MULTER_MESSAGES: Record<string, { status: number; message: string }> = {
  LIMIT_FILE_SIZE: { status: 413, message: "The file is too large." },
  LIMIT_FILE_COUNT: { status: 400, message: "Too many files were uploaded." },
  LIMIT_UNEXPECTED_FILE: { status: 400, message: "Unexpected file field." },
  LIMIT_PART_COUNT: { status: 400, message: "Too many files were uploaded." },
  LIMIT_FIELD_COUNT: { status: 400, message: "Too many files were uploaded." },
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const globalErrorHandler: ErrorRequestHandler = (
  err,
  _req,
  res,
  _next
): any => {
  const lang = _req.lang ?? resolveLang(_req);
  const say = (text: string) => translateMessage(text, lang);

  let statusCode = 500;
  let message = say("Something went wrong");
  let errorSources: TErrorSources = [{ path: "", message }];
  let code: string | undefined;

  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err, lang);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (err?.name === "ValidationError") {
    logger.error(err);
    const simplifiedError = handleValidationError(err, lang);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (err?.name === "CastError") {
    const simplifiedError = handleCastError(err, lang);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (err?.code === 11000) {
    const simplifiedError = handleDuplicateError(err, lang);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError" || err?.name === "NotBeforeError") {
    // A broken or expired login token is the visitor's problem (401), not a server error (500)
    statusCode = 401;
    message = say("You are not authorized");
    errorSources = [{ path: "", message }];
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = say(err.message);
    errorSources = [{ path: "", message }];
    code = err.code;
  } else if (err?.name === "MulterError" || MULTER_MESSAGES[err?.code as string]) {
    const known = MULTER_MESSAGES[err?.code as string];
    statusCode = known?.status ?? 400;
    message = say(known?.message ?? "The file could not be uploaded.");
    errorSources = [{ path: typeof err?.field === "string" ? err.field : "", message }];
  } else if (err instanceof Error) {
    // Never show raw internal messages ("File too large", "Invalid role for candidate userType" ...).
    // Messages that are in the catalog (e.g. "Not allowed by CORS") are safe and are translated.
    const clientStatus = Number((err as any)?.statusCode ?? (err as any)?.status);
    if (clientStatus >= 400 && clientStatus < 500) statusCode = clientStatus;
    if (err instanceof SyntaxError && statusCode === 400) {
      message = say("Invalid request body.");
    } else if (isKnownMessage(err.message)) {
      message = say(err.message);
    }
    errorSources = [{ path: "", message }];
  }
  // The real error always goes to the log, with the request id from context.
  logger.error('Error occurred:', {
    message: err instanceof Error ? err.message : message,
    shown: message,
    errorSources,
    path: _req.path,
    method: _req.method
  });

  // Get requestId from async context
  const context = requestContext.getStore();
  const requestId = context?.requestId;

  //ultimate return
  return res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    ...(code && { code }),
    ...(requestId && { requestId }), // Add requestId if available
    stack: config.node_env === "development" ? err?.stack : null,
  });
};

export default globalErrorHandler;
