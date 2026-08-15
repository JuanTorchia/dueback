import { describe, expect, it, vi } from "vitest";
import {
  CaseControlService,
  type CaseControlStore,
  type DeletionReceipt
} from "../../packages/runtime/src/case-control";
import type { FollowThroughCase } from "../../packages/runtime/src/case-runner";
import { EvidenceService, type EvidenceRecord } from "../../packages/runtime/src/evidence-service";
import type { NotificationRecord } from "../../packages/runtime/src/notifications";
import { makeDraftCase } from "../helpers/draft-case";

function activeCase(state: FollowThroughCase["state"] = "WAITING_EXTERNAL"): FollowThroughCase {
  const draft = makeDraftCase();
  return {
    caseId: draft.caseId,
    ownerId: draft.ownerId,
    state,
    version: 3,
    plan: draft.plan,
    approval: {
      ownerId: draft.ownerId,
      planVersion: draft.plan.version,
      planHash: draft.plan.planHash,
      expiresAt: draft.plan.expiresAt
    },
    actionOrdinal: 1,
    dueAt: "2026-08-15T12:00:00.000Z",
    correlationId: "corr_control_123456789012"
  };
}

class ControlMemory implements CaseControlStore {
  evidence: EvidenceRecord[] = [];
  deleted = false;
  constructor(public item: FollowThroughCase) {}
  get(caseId: string): Promise<FollowThroughCase | undefined> {
    return Promise.resolve(!this.deleted && caseId === this.item.caseId ? this.item : undefined);
  }
  transition(input: {
    expectedVersion: number;
    action: "STOP" | "REVOKE" | "EXPIRE" | "REOPEN" | "RESUME";
    reason: string;
    now: string;
  }): Promise<FollowThroughCase> {
    const state =
      input.action === "REOPEN"
        ? "NEEDS_ATTENTION"
        : input.action === "RESUME"
          ? "READY"
          : input.action === "EXPIRE"
            ? "EXPIRED"
            : "CANCELLED";
    this.item = {
      ...this.item,
      state,
      version: input.expectedVersion + 1,
      controlReason: input.reason,
      controlledAt: input.now
    };
    return Promise.resolve(this.item);
  }
  requestDeletion(input: { caseId: string; now: string }): Promise<DeletionReceipt> {
    this.deleted = true;
    return Promise.resolve({
      caseId: input.caseId,
      status: "DELETION_ACCEPTED",
      requestedAt: input.now,
      tombstoneId: "tombstone_12345678"
    });
  }
}

describe("case controls", () => {
  it.each([
    ["STOP", "CANCELLED"],
    ["REVOKE", "CANCELLED"],
    ["EXPIRE", "EXPIRED"]
  ] as const)("applies %s and leaves the case terminal for workers", async (action, state) => {
    const store = new ControlMemory(activeCase());
    const result = await new CaseControlService(store).command({
      caseId: store.item.caseId,
      ownerId: store.item.ownerId,
      expectedVersion: 3,
      action,
      now: "2026-08-15T12:00:00.000Z"
    });
    expect(result).toMatchObject({ state, version: 4 });
  });

  it("reopens DONE while preserving prior evidence", async () => {
    const store = new ControlMemory(activeCase("DONE"));
    store.evidence.push({
      candidate: {
        evidenceId: "evidence_12345678",
        caseId: store.item.caseId,
        level: "MERCHANT_CONFIRMED",
        amountMinor: 7900,
        currency: "USD",
        transactionRef: "ORDER-79",
        issuedAt: "2026-08-15T12:00:00.000Z",
        issuer: "merchant-sandbox",
        signatureValid: true
      },
      verification: { accepted: true, level: "MERCHANT_CONFIRMED", reasonCodes: ["ACCEPTED"] },
      recordedAt: "2026-08-15T12:00:00.000Z",
      correlationId: "corr_control_123456789012"
    });
    const result = await new CaseControlService(store).command({
      caseId: store.item.caseId,
      ownerId: store.item.ownerId,
      expectedVersion: 3,
      action: "REOPEN",
      reason: "Funds never appeared",
      now: "2026-08-15T12:01:00.000Z"
    });
    expect(result).toMatchObject({ state: "NEEDS_ATTENTION" });
    expect(store.evidence).toHaveLength(1);
  });

  it("makes a requested deletion immediately inaccessible", async () => {
    const store = new ControlMemory(activeCase());
    await new CaseControlService(store).command({
      caseId: store.item.caseId,
      ownerId: store.item.ownerId,
      expectedVersion: 3,
      action: "DELETE",
      now: "2026-08-15T12:00:00.000Z"
    });
    await expect(store.get(store.item.caseId)).resolves.toBeUndefined();
  });

  it("resolves an exception by scheduling only the already-approved action", async () => {
    const store = new ControlMemory(activeCase("NEEDS_ATTENTION"));
    const scheduleCase = vi.fn(() => Promise.resolve({}));
    const result = await new CaseControlService(store, { scheduleCase }).command({
      caseId: store.item.caseId,
      ownerId: store.item.ownerId,
      expectedVersion: 3,
      action: "RESUME",
      reason: "Reference confirmed",
      now: "2026-08-15T12:00:00.000Z"
    });
    expect(result).toMatchObject({ state: "READY", version: 4 });
    expect(scheduleCase).toHaveBeenCalledWith(
      expect.objectContaining({ caseId: store.item.caseId, expectedVersion: 4 })
    );
  });

  it("moves conflicting evidence to attention and asks only for the mismatched field", async () => {
    const store = new ControlMemory(activeCase());
    const notifications = {
      createIfAbsent: vi.fn(async (record: NotificationRecord) => ({ record, duplicate: false }))
    };
    const interventions = {
      createInterventionIfAbsent: vi.fn(async (record) => ({ record, duplicate: false })),
      listInterventions: vi.fn(() => Promise.resolve([]))
    };
    const service = new EvidenceService(
      {
        get: (caseId) => store.get(caseId),
        record: async (input) => {
          store.item = { ...store.item, state: input.nextState, version: store.item.version + 1 };
          store.evidence.push(input.evidence);
          return { duplicate: false };
        }
      },
      notifications,
      interventions
    );
    const result = await service.reconcile(
      {
        evidenceId: "evidence_wrong_amount",
        caseId: store.item.caseId,
        level: "MERCHANT_CONFIRMED",
        amountMinor: 1,
        currency: "USD",
        transactionRef: "ORDER-79",
        issuedAt: "2026-08-15T12:00:00.000Z",
        issuer: "merchant-sandbox",
        signatureValid: true
      },
      "2026-08-15T12:00:05.000Z"
    );
    expect(store.item.state).toBe("NEEDS_ATTENTION");
    expect(result.intervention).toMatchObject({ requestedField: "amount" });
    expect(notifications.createIfAbsent).toHaveBeenCalledOnce();
  });
});
