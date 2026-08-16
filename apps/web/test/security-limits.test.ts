import { describe, expect, it } from "vitest";
import {
  estimateGemini35FlashGlobalCost,
  gemini35FlashGlobalPricing,
  modelBudgetKey,
  publicSecurityLimits,
  redactedPublicError
} from "../lib/security-limits";

describe("public evaluation budgets and model cost evidence", () => {
  it("pins every public budget from FR-035", () => {
    expect(publicSecurityLimits).toEqual({
      newCasesPerIdentityPerDay: 10,
      modelCallsPerNormalCase: 4,
      taskAttemptsPerCase: 5,
      logicalExternalActionsPerCase: 3,
      notificationsPerCase: 3
    });
  });

  it("isolates content-derived artifact budgets by owner", () => {
    const artifactId = "artifact_same_content";
    expect(modelBudgetKey("owner_a", artifactId)).not.toBe(modelBudgetKey("owner_b", artifactId));
    expect(modelBudgetKey("owner_a", artifactId)).toBe(modelBudgetKey("owner_a", artifactId));
  });

  it("estimates standard global cost only from observed token counts", () => {
    expect(gemini35FlashGlobalPricing).toMatchObject({
      inputUsdPerMillionTokens: 1.5,
      outputUsdPerMillionTokens: 9,
      observedOn: "2026-08-16"
    });
    expect(estimateGemini35FlashGlobalCost({ inputTokens: 1_000, outputTokens: 100 })).toBe(0.0024);
    expect(
      estimateGemini35FlashGlobalCost({ inputTokens: undefined, outputTokens: 100 })
    ).toBeNull();
  });

  it("exposes budget exhaustion but redacts unknown failures", () => {
    expect(redactedPublicError(new Error("MODEL_CALL_BUDGET_EXHAUSTED"))).toBe(
      "MODEL_CALL_BUDGET_EXHAUSTED"
    );
    expect(redactedPublicError(new Error("source content"))).toBe("REQUEST_FAILED");
  });
});
