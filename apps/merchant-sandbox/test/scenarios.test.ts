import { describe, expect, it } from "vitest";
import { merchantScenarios, scenarioStep } from "../src/scenarios";

describe("merchant scenarios", () => {
  it("defines every deterministic judge scenario", () => {
    expect(Object.keys(merchantScenarios)).toEqual([
      "acknowledgement",
      "retry-once",
      "mismatch",
      "signed-completion",
      "replay",
      "latency"
    ]);
  });

  it("advances retry-once from failure to acknowledgement to completion", () => {
    expect(scenarioStep("retry-once", 1).status).toBe(503);
    expect(scenarioStep("retry-once", 2).outcome).toBe("REQUEST_ACKNOWLEDGED");
    expect(scenarioStep("retry-once", 3).outcome).toBe("MERCHANT_CONFIRMED");
  });
});
