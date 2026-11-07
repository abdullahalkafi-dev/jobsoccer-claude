import crypto from "crypto";
import { logger } from "../logger/logger";

/** Fixed code used only on development and staging so testers can sign in without reading e-mails.
 *  Set OTP_MODE=real to send real random codes there too (needs working e-mail settings). */
export const TEST_OTP = "123456";

const isTestEnvironment = (): boolean => {
  if (process.env.OTP_MODE?.trim().toLowerCase() === "real") return false;
  const appEnv = process.env.APP_ENV?.trim().toLowerCase();
  return appEnv === "development" || appEnv === "staging";
};

const isStagingOrDevelopment = (): boolean => {
  const appEnv = process.env.APP_ENV?.trim().toLowerCase();
  return appEnv === "development" || appEnv === "staging";
};

/**
 * Six-digit one-time code. Random everywhere except development and staging.
 * LOG_OTP=true (honoured on development and staging only) writes the code to the server log,
 * so testers can read a real random code without opening the inbox. Never set it on live.
 */
export const generateOTP = (): string => {
  const code = isTestEnvironment() ? TEST_OTP : crypto.randomInt(100000, 1000000).toString();
  if (process.env.LOG_OTP?.trim().toLowerCase() === "true" && isStagingOrDevelopment()) {
    logger.info(`[TEST ONLY] one-time code: ${code}`);
  }
  return code;
};
