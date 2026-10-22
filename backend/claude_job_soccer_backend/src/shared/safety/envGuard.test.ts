import { describe, expect, it } from "vitest";
import { assertSafeEnvironment, checkEnvironment } from "./envGuard";

const PROD_URL = "mongodb+srv://user:pw@cluster0.bhmvsbs.mongodb.net/claude_job_soccer";
const DEV_URL = "mongodb+srv://user:pw@jobsoccer.dumldin.mongodb.net/jobsoccer_dev";

describe("environment guard", () => {
  it("blocks a staging process that uses the production database", () => {
    const problem = checkEnvironment({
      APP_ENV: "staging",
      DATABASE_URL: PROD_URL,
      PROTECTED_DB_MARKERS: "cluster0.bhmvsbs,claude_job_soccer",
    });
    expect(problem).toContain("must not use the protected production database");
  });

  it("allows development against the dev database", () => {
    expect(
      checkEnvironment({ APP_ENV: "development", DATABASE_URL: DEV_URL, PROTECTED_DB_MARKERS: "cluster0.bhmvsbs" })
    ).toBeNull();
  });

  it("does nothing in production or when APP_ENV is not set", () => {
    expect(checkEnvironment({ APP_ENV: "production", DATABASE_URL: PROD_URL, PROTECTED_DB_MARKERS: "cluster0.bhmvsbs" })).toBeNull();
    expect(checkEnvironment({ DATABASE_URL: PROD_URL, PROTECTED_DB_MARKERS: "cluster0.bhmvsbs" })).toBeNull();
  });

  it("throws from assertSafeEnvironment", () => {
    expect(() =>
      assertSafeEnvironment({ APP_ENV: "development", DATABASE_URL: PROD_URL, PROTECTED_DB_MARKERS: "bhmvsbs" })
    ).toThrow();
  });
});
