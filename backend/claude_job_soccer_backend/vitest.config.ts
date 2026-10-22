import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Tests must not depend on a local .env file
    env: { OPENAI_API_KEY: "test-key-not-used" },
  },
});
