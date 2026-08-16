import { describe, expect, it } from "vitest";
import {
  actionEnvelopeSchema,
  channelCapabilitySchema,
  outcomeContractSchema,
  promiseDraftSchema,
  resolutionPlanSchema
} from "../src/index";

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

  it("accepts legacy plans while validating multichannel plans", () => {
    const base = {
      planId: "plan_12345678",
      caseId: "case_12345678",
      ownerId: "person_12345678",
      version: 1,
      planHash: `sha256:${"a".repeat(64)}`,
      goal: "USD 79 refund",
      allowedActions: ["SEND_FOLLOW_UP"],
      allowedRecipient: "support@example.test",
      sharedFields: ["transactionRef", "amountMinor", "currency"],
      evidenceRequirements: [{
        minimumLevel: "MERCHANT_CONFIRMED",
        amountMinor: 7900,
        currency: "USD",
        transactionRef: "ORDER-79",
        maxAgeSeconds: 3600,
        trustedIssuer: "merchant-sandbox"
      }],
      expiresAt: "2026-08-22T00:00:00.000Z"
    };
    expect(resolutionPlanSchema.parse(base).channelType).toBeUndefined();
    expect(resolutionPlanSchema.parse({
      ...base,
      channelType: "MANAGED_EMAIL",
      messageTemplateVersion: "follow-up/v1",
      messageSubject: "Follow-up for ORDER-79",
      messageBody: "Please confirm the promised outcome.",
      maxLogicalSends: 3
    }).channelType).toBe("MANAGED_EMAIL");
  });

  it("requires truthful channel capability fields", () => {
    expect(channelCapabilitySchema.parse({
      channelType: "CONTROLLED_SANDBOX",
      status: "AVAILABLE",
      canSend: true,
      canReceive: true,
      supportsThreading: false,
      supportsDeliveryReceipt: true,
      supportsAuthenticatedReply: true,
      requiresUserOAuth: false,
      reasonCodes: ["CONFIGURED"],
      checkedAt: "2026-08-16T00:00:00.000Z"
    }).status).toBe("AVAILABLE");
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
