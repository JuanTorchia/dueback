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
});
