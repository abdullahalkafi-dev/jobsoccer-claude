export type TAppErrorOptions = {
  /** Stable machine code the frontend can switch on (OTP_EXPIRED, VIDEO_LOCKED ...). */
  code?: string;
  stack?: string;
};

class AppError extends Error {
  public statusCode: number;
  public code?: string;

  /**
   * new AppError(400, message)                      - as before
   * new AppError(400, message, "stack")             - as before
   * new AppError(400, message, { code: "OTP_EXPIRED" })
   * `message` is the English sentence; it is translated for the user in the error handler.
   */
  constructor(statusCode: number, message: string, stackOrOptions: string | TAppErrorOptions = "") {
    super(message);
    this.statusCode = statusCode;
    const options: TAppErrorOptions = typeof stackOrOptions === "string" ? { stack: stackOrOptions } : stackOrOptions;
    this.code = options.code;

    if (options.stack) {
      this.stack = options.stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default AppError;
