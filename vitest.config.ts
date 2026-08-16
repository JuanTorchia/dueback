import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts", "tests/**/*.test.ts", "tests/**/*.spec.ts"],
    exclude: ["tests/e2e/deployed-demo.spec.ts"],
    passWithNoTests: false,
    testTimeout: 10_000
  }
});
