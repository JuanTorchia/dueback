import { describe, expect, it } from "vitest";
import { actionEnvelopeSchema, promiseDraftSchema } from "../src/index";

describe("boundary contracts", () => {
  it("rejects a free-form model draft without provenance", () => {
    expect(() =>
      promiseDraftSchema.parse({
        promisor: "Merchant",
        result: "refund"
      })
    ).toThrow();
  });

  it("rejects an action without explicit authority context", () => {
    expect(() =>
      actionEnvelopeSchema.parse({
        actionId: "action_123",
        caseId: "case_123"
      })
    ).toThrow();
  });
});
