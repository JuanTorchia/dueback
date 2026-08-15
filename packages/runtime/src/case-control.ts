import type { FollowThroughCase } from "./case-runner";

export type CaseControlAction = "STOP" | "REVOKE" | "EXPIRE" | "REOPEN" | "RESUME" | "DELETE";

export interface ControlScheduler {
  scheduleCase(input: {
    caseId: string;
    expectedVersion: number;
    wakeAt: string;
    correlationId?: string;
  }): Promise<unknown>;
}

export interface DeletionReceipt {
  readonly caseId: string;
  readonly status: "DELETION_ACCEPTED";
  readonly requestedAt: string;
  readonly tombstoneId: string;
}

export interface CaseControlStore {
  get(caseId: string): Promise<FollowThroughCase | undefined>;
  transition(input: {
    caseId: string;
    ownerId: string;
    expectedVersion: number;
    action: Exclude<CaseControlAction, "DELETE">;
    reason: string;
    now: string;
  }): Promise<FollowThroughCase>;
  requestDeletion(input: {
    caseId: string;
    ownerId: string;
    expectedVersion: number;
    now: string;
  }): Promise<DeletionReceipt>;
}

export class CaseControlService {
  constructor(
    private readonly store: CaseControlStore,
    private readonly scheduler?: ControlScheduler
  ) {}

  async command(input: {
    caseId: string;
    ownerId: string;
    expectedVersion: number;
    action: CaseControlAction;
    reason?: string;
    now: string;
  }): Promise<FollowThroughCase | DeletionReceipt> {
    const item = await this.store.get(input.caseId);
    if (!item) throw new Error("CASE_NOT_FOUND");
    if (item.ownerId !== input.ownerId) throw new Error("CASE_OWNERSHIP_REQUIRED");
    if (item.version !== input.expectedVersion) throw new Error("VERSION_CONFLICT");
    if (input.action === "DELETE") {
      return this.store.requestDeletion(input);
    }
    if (input.action === "REOPEN" && item.state !== "DONE") throw new Error("REOPEN_REQUIRES_DONE");
    if (input.action === "RESUME" && item.state !== "NEEDS_ATTENTION") {
      throw new Error("RESUME_REQUIRES_ATTENTION");
    }
    if (
      input.action === "RESUME" &&
      (item.approval.revokedAt || Date.parse(item.approval.expiresAt) <= Date.parse(input.now))
    ) {
      throw new Error("NEW_APPROVAL_REQUIRED");
    }
    if (["STOP", "REVOKE", "EXPIRE"].includes(input.action) && item.state === "DONE") {
      throw new Error("TERMINAL_CASE_CONTROL_DENIED");
    }
    if (input.action === "REOPEN" && !input.reason?.trim())
      throw new Error("REOPEN_REASON_REQUIRED");
    const next = await this.store.transition({
      caseId: input.caseId,
      ownerId: input.ownerId,
      expectedVersion: input.expectedVersion,
      action: input.action,
      reason: input.reason?.trim() || input.action,
      now: input.now
    });
    if (input.action === "RESUME") {
      if (!this.scheduler) throw new Error("CONTROL_SCHEDULER_REQUIRED");
      await this.scheduler.scheduleCase({
        caseId: next.caseId,
        expectedVersion: next.version,
        wakeAt: input.now,
        ...(next.correlationId ? { correlationId: next.correlationId } : {})
      });
    }
    return next;
  }
}
