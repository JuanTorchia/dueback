import { describe, expect, it, vi } from "vitest";
import {
  ActionBroker,
  type ActionReceipt,
  type ActionRecordStore,
  type Reservation
} from "../../packages/runtime/src/action-broker";
import {
  CaseRunner,
  type FollowThroughCase,
  type FollowThroughStore
} from "../../packages/runtime/src/case-runner";
import { makeDraftCase } from "../helpers/draft-case";
import {
  InterventionService,
  type InterventionRecord
} from "../../packages/runtime/src/interventions";
import type { NotificationRecord } from "../../packages/runtime/src/notifications";

class Records implements ActionRecordStore {
  readonly records = new Map<string, Reservation>();
  reserve(key: string): Promise<Reservation> {
    const value = this.records.get(key);
    if (value?.status === "SUCCEEDED") return Promise.resolve(value);
    if (value) return Promise.resolve({ status: "IN_FLIGHT" });
    this.records.set(key, { status: "RESERVED" });
    return Promise.resolve({ status: "RESERVED" });
  }
  succeed(key: string, receipt: ActionReceipt): Promise<void> {
    this.records.set(key, { status: "SUCCEEDED", receipt });
    return Promise.resolve();
  }
  fail(key: string): Promise<void> {
    this.records.delete(key);
    return Promise.resolve();
  }
}

class Cases implements FollowThroughStore {
  failNextWrite = false;
  constructor(public value: FollowThroughCase) {}
  get(): Promise<FollowThroughCase> {
    return Promise.resolve(this.value);
  }
  compareAndSet(_caseId: string, expectedVersion: number, next: FollowThroughCase): Promise<void> {
    if (this.value.version !== expectedVersion) throw new Error("VERSION_CONFLICT");
    if (this.failNextWrite) {
      this.failNextWrite = false;
      throw new Error("INJECTED_PERSISTENCE_CRASH");
    }
    this.value = next;
    return Promise.resolve();
  }
}

function readyCase(): FollowThroughCase {
  const draft = makeDraftCase();
  return {
    caseId: draft.caseId,
    ownerId: draft.ownerId,
    state: "READY",
    version: 1,
    plan: draft.plan,
    approval: {
      ownerId: draft.ownerId,
      planVersion: 1,
      planHash: draft.plan.planHash,
      expiresAt: draft.plan.expiresAt
    },
    actionOrdinal: 1,
    dueAt: "2026-08-15T12:00:00.000Z"
  };
}

describe("durable follow-through", () => {
  it("recovers an adapter failure through a bounded scheduled retry", async () => {
    const cases = new Cases(readyCase());
    const execute = vi
      .fn()
      .mockRejectedValueOnce(new Error("INJECTED_503"))
      .mockResolvedValueOnce({ receiptId: "receipt_1", acceptedAt: "2026-08-15T12:00:31.000Z" });
    const scheduleCase = vi.fn(() => Promise.resolve({}));
    const runner = new CaseRunner(
      cases,
      new ActionBroker(new Records(), { execute }),
      { scheduleCase },
      30
    );
    await expect(
      runner.run({
        caseId: cases.value.caseId,
        expectedVersion: 1,
        now: "2026-08-15T12:00:00.000Z"
      })
    ).resolves.toMatchObject({ status: "WAITING_RETRY" });
    expect(cases.value.state).toBe("WAITING_RETRY");
    expect(scheduleCase).toHaveBeenCalledOnce();
    await expect(
      runner.run({
        caseId: cases.value.caseId,
        expectedVersion: 2,
        now: "2026-08-15T12:00:31.000Z"
      })
    ).resolves.toMatchObject({ status: "WAITING_EXTERNAL" });
    expect(execute).toHaveBeenCalledTimes(2);
    expect(cases.value).toMatchObject({
      lastAttemptAt: "2026-08-15T12:00:31.000Z",
      lastReceiptId: "receipt_1",
      lastActionDuplicate: false
    });
    expect(cases.value.lastActionIdempotencyKey).toMatch(/^sha256:/);
  });

  it("does not repeat the external effect after a crash and worker restart", async () => {
    const cases = new Cases(readyCase());
    cases.failNextWrite = true;
    const execute = vi.fn(() =>
      Promise.resolve({ receiptId: "receipt_1", acceptedAt: "2026-08-15T12:00:00.000Z" })
    );
    const records = new Records();
    const scheduleCase = vi.fn(() => Promise.resolve({}));
    const firstProcess = new CaseRunner(
      cases,
      new ActionBroker(records, { execute }),
      { scheduleCase },
      1
    );
    await expect(
      firstProcess.run({
        caseId: cases.value.caseId,
        expectedVersion: 1,
        now: "2026-08-15T12:00:00.000Z"
      })
    ).resolves.toMatchObject({ status: "WAITING_RETRY" });

    const restarted = new CaseRunner(
      cases,
      new ActionBroker(records, { execute }),
      { scheduleCase },
      1
    );
    const result = await restarted.run({
      caseId: cases.value.caseId,
      expectedVersion: 2,
      now: "2026-08-15T12:00:02.000Z"
    });
    expect(result).toMatchObject({ status: "WAITING_EXTERNAL", broker: { duplicate: true } });
    expect(execute).toHaveBeenCalledOnce();
    expect(cases.value).toMatchObject({
      lastAttemptAt: "2026-08-15T12:00:02.000Z",
      lastReceiptId: "receipt_1",
      lastActionDuplicate: true
    });
  });

  it("ignores duplicate tasks after state advanced", async () => {
    const cases = new Cases({ ...readyCase(), state: "WAITING_EXTERNAL", version: 2 });
    const runner = new CaseRunner(cases, new ActionBroker(new Records(), { execute: vi.fn() }), {
      scheduleCase: vi.fn()
    });
    await expect(
      runner.run({
        caseId: cases.value.caseId,
        expectedVersion: 1,
        now: "2026-08-15T12:00:00.000Z"
      })
    ).resolves.toEqual({ status: "STALE_TASK" });
  });

  it("stops bounded recovery and creates one inspectable intervention", async () => {
    const cases = new Cases(readyCase());
    const interventionRecords = new Map<string, InterventionRecord>();
    const notificationRecords = new Map<string, NotificationRecord>();
    const interventionService = new InterventionService(
      {
        createInterventionIfAbsent: async (record) => {
          const old = interventionRecords.get(record.dedupeKey);
          if (old) return { record: old, duplicate: true };
          interventionRecords.set(record.dedupeKey, record);
          return { record, duplicate: false };
        },
        listInterventions: () => Promise.resolve([...interventionRecords.values()])
      },
      {
        createIfAbsent: async (record) => {
          const old = notificationRecords.get(record.dedupeKey);
          if (old) return { record: old, duplicate: true };
          notificationRecords.set(record.dedupeKey, record);
          return { record, duplicate: false };
        }
      }
    );
    const runner = new CaseRunner(
      cases,
      new ActionBroker(new Records(), { execute: vi.fn(() => Promise.reject(new Error("503"))) }),
      { scheduleCase: vi.fn() },
      30,
      1,
      interventionService
    );
    await expect(
      runner.run({
        caseId: cases.value.caseId,
        expectedVersion: 1,
        now: "2026-08-15T12:00:00.000Z",
        correlationId: "corr_recovery_123456789012"
      })
    ).resolves.toEqual({ status: "NEEDS_ATTENTION", reason: "RECOVERY_EXHAUSTED" });
    expect(cases.value.state).toBe("NEEDS_ATTENTION");
    expect(interventionRecords.size).toBe(1);
    expect(notificationRecords.size).toBe(1);
  });
});
