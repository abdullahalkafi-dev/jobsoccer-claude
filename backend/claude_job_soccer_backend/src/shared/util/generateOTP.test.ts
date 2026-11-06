import { afterEach, describe, expect, it } from "vitest";
import { generateOTP, TEST_OTP } from "./generateOTP";

const originalEnv = process.env.APP_ENV;

afterEach(() => {
  if (originalEnv === undefined) delete process.env.APP_ENV;
  else process.env.APP_ENV = originalEnv;
});

describe("generateOTP", () => {
  it("uses the fixed test code on development and staging", () => {
    process.env.APP_ENV = "development";
    expect(generateOTP()).toBe(TEST_OTP);
    process.env.APP_ENV = "staging";
    expect(generateOTP()).toBe(TEST_OTP);
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
