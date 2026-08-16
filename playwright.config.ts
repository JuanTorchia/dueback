import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  testMatch: "deployed-demo.spec.ts",
  timeout: 90_000,
  retries: 1,
  use: {
    ...devices["iPhone 13"],
    channel: "chrome",
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  }
});
