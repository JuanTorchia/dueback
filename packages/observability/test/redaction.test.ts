import { describe, expect, it } from "vitest";
import { redactUnknownFields, safeEvent } from "../src/index.js";

describe("privacy-safe observability", () => {
  it("keeps only structured correlation and outcome fields", () => {
    expect(
      safeEvent({
        runId: "run_12345678",
        caseId: "case_12345678",
        correlationId: "corr_12345678",
        event: "EVIDENCE_REJECTED",
        outcome: "REJECTED",
        reasonCode: "INSUFFICIENT_LEVEL"
      })
    ).toEqual({
      runId: "run_12345678",
      caseId: "case_12345678",
      correlationId: "corr_12345678",
      event: "EVIDENCE_REJECTED",
      outcome: "REJECTED",
      reasonCode: "INSUFFICIENT_LEVEL"
    });
  });

  it("drops raw source, prompt, email, and nested values from unknown fields", () => {
    expect(
      redactUnknownFields({
        caseId: "case_12345678",
        prompt: "secret prompt",
        email: "person@example.test",
        raw: "receipt contents",
        nested: { source: "private" },
        attempt: 2
      })
    ).toEqual({ caseId: "case_12345678", attempt: 2 });
  });
});
