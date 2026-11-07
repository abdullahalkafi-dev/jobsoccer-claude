import crypto from "crypto";

/** Fixed code used only on development and staging so testers can sign in without reading e-mails.
 *  Set OTP_MODE=real to send real random codes there too (needs working e-mail settings). */
export const TEST_OTP = "123456";

const isTestEnvironment = (): boolean => {
  if (process.env.OTP_MODE?.trim().toLowerCase() === "real") return false;
  const appEnv = process.env.APP_ENV?.trim().toLowerCase();
  return appEnv === "development" || appEnv === "staging";
};

/** Six-digit one-time code. Random everywhere except development and staging. */
export const generateOTP = (): string => (isTestEnvironment() ? TEST_OTP : crypto.randomInt(100000, 1000000).toString());
