import { describe, expect, it } from "vitest";
import type { DraftCase } from "../src/intake-service";
import { PlanService } from "../src/plan-service";
import type { PlanStore } from "../src/plan-service";

const hash = `sha256:${"a".repeat(64)}`;
const provenance = [
  {
    artifactId: "artifact_12345678",
    locator: "text:0-100",
    excerptHash: hash,
    confidence: "HIGH" as const
  }
];

function caseDraft(): DraftCase {
  return {
    caseId: "case_12345678",
    ownerId: "person_12345678",
    artifactId: "artifact_12345678",
    dedupeKey: hash,
    state: "AWAITING_APPROVAL",
    promiseDraft: {
      promisor: { value: "Northstar", provenance, uncertainty: "NONE" },
      result: { value: "USD 79 refund", provenance, uncertainty: "NONE" },
      amountMinor: { value: 7900, provenance, uncertainty: "NONE" },
      currency: { value: "USD", provenance, uncertainty: "NONE" },
      transactionRef: { value: "ORDER-79", provenance, uncertainty: "NONE" },
      dueAt: { value: "2026-08-20T00:00:00.000Z", provenance, uncertainty: "NONE" },
      proposedEvidenceLevel: "MERCHANT_CONFIRMED"
    },
    plan: {
      planId: "plan_12345678",
      caseId: "case_12345678",
      ownerId: "person_12345678",
      version: 1,
      planHash: hash,
      goal: "USD 79 refund",
      allowedActions: ["SEND_FOLLOW_UP"],
      allowedRecipient: "merchant@controlled.test",
      sharedFields: ["transactionRef", "amountMinor", "currency"],
      evidenceRequirements: [
        {
          minimumLevel: "MERCHANT_CONFIRMED",
          amountMinor: 7900,
          currency: "USD",
          transactionRef: "ORDER-79",
          maxAgeSeconds: 3600,
          trustedIssuer: "merchant-sandbox"
        }
      ],
      expiresAt: "2026-08-22T00:00:00.000Z"
    },
    activationBlocked: false,
    blockingFields: [],
    createdAt: "2026-08-15T00:00:00.000Z"
  };
}

class MemoryPlanStore implements PlanStore {
  constructor(private draft: DraftCase = caseDraft()) {}
  get(): Promise<DraftCase> {
    return Promise.resolve(this.draft);
  }
  replace(_caseId: string, expectedPlanVersion: number, next: DraftCase): Promise<void> {
    if (this.draft.plan.version !== expectedPlanVersion)
      return Promise.reject(new Error("CONFLICT"));
    this.draft = next;
    return Promise.resolve();
  }
}

describe("PlanService", () => {
  it("simulates without performing an external action", async () => {
    const service = new PlanService(new MemoryPlanStore());
    await expect(service.simulate("case_12345678", "person_12345678")).resolves.toMatchObject({
      completionLevel: "MERCHANT_CONFIRMED",
      externalActionPerformed: false
    });
  });

  it("invalidates the prior hash and version after correction", async () => {
    const service = new PlanService(new MemoryPlanStore());
    const revised = await service.revise("case_12345678", "person_12345678", 1, {
      amountMinor: 5900
    });
    expect(revised.plan.version).toBe(2);
    expect(revised.plan.planHash).not.toBe(hash);
    expect(revised.plan.evidenceRequirements[0]?.amountMinor).toBe(5900);
  });

  it("binds approval to owner, plan version, hash, and expiry", async () => {
    const service = new PlanService(new MemoryPlanStore());
    const approved = await service.approve({
      caseId: "case_12345678",
      ownerId: "person_12345678",
      expectedPlanVersion: 1,
      expectedPlanHash: hash,
      now: "2026-08-15T12:00:00.000Z"
    });
    expect(approved.state).toBe("READY");
    expect(approved.approval).toMatchObject({
      ownerId: "person_12345678",
      planVersion: 1,
      planHash: hash
    });
  });

  it("rejects approval of a stale plan hash", async () => {
    const service = new PlanService(new MemoryPlanStore());
    await expect(
      service.approve({
        caseId: "case_12345678",
        ownerId: "person_12345678",
        expectedPlanVersion: 1,
        expectedPlanHash: "sha256:stale",
        now: "2026-08-15T12:00:00.000Z"
      })
    ).rejects.toThrow("STALE_PLAN_APPROVAL");
  });
});
