import { afterEach, describe, expect, it } from "vitest";
import { generateOTP, TEST_OTP } from "./generateOTP";

const originalEnv = process.env.APP_ENV;
const originalMode = process.env.OTP_MODE;

afterEach(() => {
  if (originalEnv === undefined) delete process.env.APP_ENV;
  else process.env.APP_ENV = originalEnv;
  if (originalMode === undefined) delete process.env.OTP_MODE;
  else process.env.OTP_MODE = originalMode;
});

describe("generateOTP", () => {
  it("uses the fixed test code on development and staging", () => {
    process.env.APP_ENV = "development";
    expect(generateOTP()).toBe(TEST_OTP);
    process.env.APP_ENV = "staging";
    expect(generateOTP()).toBe(TEST_OTP);
  });

  it("sends real random codes on staging when OTP_MODE=real", () => {
    process.env.APP_ENV = "staging";
    process.env.OTP_MODE = "real";
    const codes = new Set(Array.from({ length: 30 }, () => generateOTP()));
    expect(codes.size).toBeGreaterThan(1);
  });

  it("is a random six-digit code in production or when APP_ENV is missing", () => {
    for (const env of ["production", undefined]) {
      if (env === undefined) delete process.env.APP_ENV;
      else process.env.APP_ENV = env;
      const codes = new Set(Array.from({ length: 30 }, () => generateOTP()));
      expect(codes.size).toBeGreaterThan(1);
      codes.forEach((code) => expect(code).toMatch(/^\d{6}$/));
    }
  });
});
