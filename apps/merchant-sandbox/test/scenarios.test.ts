import { describe, expect, it } from "vitest";
import { merchantScenarios, scenarioStep } from "../src/scenarios";
import { MerchantLedger } from "../src/server";

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

  it("advances the story across distinct logical-action idempotency keys", () => {
    const ledger = new MerchantLedger();
    expect(ledger.attempt("case_one")).toBe(1);
    expect(ledger.attempt("case_one")).toBe(2);
    expect(ledger.attempt("case_one")).toBe(3);
    expect(ledger.attempt("case_two")).toBe(1);
  });
});
