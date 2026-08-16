import { describe, expect, it } from "vitest";
import { actionEnvelopeSchema, outcomeContractSchema, promiseDraftSchema } from "../src/index";

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

  it.each([
    {
      recipe: "COMMERCIAL_FOLLOW_UP",
      actionIntents: ["FOLLOW_UP", "CHECK_STATUS"],
      recipeData: { reference: "ORDER-79", amountMinor: 7900, currency: "USD" }
    },
    {
      recipe: "APPOINTMENT",
      actionIntents: ["FIND_OPTION", "RESERVE_APPOINTMENT"],
      recipeData: { service: "dentist", acceptableWindows: ["weekday mornings"] }
    },
    {
      recipe: "DOCUMENT",
      actionIntents: ["REQUEST_DOCUMENT", "CHECK_STATUS"],
      recipeData: { documentName: "signed enrollment certificate", deliveryChannel: "email" }
    }
  ])("accepts the $recipe recipe through one outcome contract", (recipe) => {
    expect(
      outcomeContractSchema.parse({
        contractId: "outcome_12345678",
        outcome: "Obtain the requested result",
        responsibleParty: "Responsible organization",
        proofRequired: "Independent confirmation that matches this exact outcome",
        ...recipe
      }).recipe
    ).toBe(recipe.recipe);
  });
});
