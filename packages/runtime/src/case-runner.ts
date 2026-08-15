import type { ResolutionPlan } from "@dueback/contracts";
import type { ApprovalBoundary, CaseState, ProposedAction } from "@dueback/domain";
import type { ActionBroker, BrokerResult } from "./action-broker";

export interface FollowThroughCase {
  readonly caseId: string;
  readonly ownerId: string;
  readonly state: CaseState;
  readonly version: number;
  readonly plan: ResolutionPlan;
  readonly approval: ApprovalBoundary;
  readonly actionOrdinal: number;
  readonly dueAt: string;
  readonly nextWakeAt?: string | undefined;
  readonly lastReceiptId?: string;
  readonly lastError?: string | undefined;
}

export interface FollowThroughStore {
  get(caseId: string): Promise<FollowThroughCase | undefined>;
  compareAndSet(caseId: string, expectedVersion: number, next: FollowThroughCase): Promise<void>;
}

export interface RetryScheduler {
  scheduleCase(input: {
    caseId: string;
    expectedVersion: number;
    wakeAt: string;
  }): Promise<unknown>;
}

export type RunResult =
  | { readonly status: "NOT_DUE"; readonly wakeAt: string }
  | { readonly status: "STALE_TASK" }
  | { readonly status: "WAITING_EXTERNAL"; readonly broker: BrokerResult }
  | { readonly status: "WAITING_RETRY"; readonly wakeAt: string };

function actionProposal(item: FollowThroughCase): ProposedAction {
  const requirement = item.plan.evidenceRequirements[0];
  if (!requirement) throw new Error("EVIDENCE_REQUIREMENT_MISSING");
  return {
    ownerId: item.ownerId,
    planVersion: item.plan.version,
    planHash: item.plan.planHash,
    actionType: "SEND_FOLLOW_UP",
    recipient: item.plan.allowedRecipient,
    sharedFields: {
      transactionRef: requirement.transactionRef,
      amountMinor: String(requirement.amountMinor),
      currency: requirement.currency
    }
  };
}

export class CaseRunner {
  constructor(
    private readonly store: FollowThroughStore,
    private readonly broker: ActionBroker,
    private readonly scheduler: RetryScheduler,
    private readonly retryDelaySeconds = 30
  ) {}

  async run(input: { caseId: string; expectedVersion: number; now: string }): Promise<RunResult> {
    const item = await this.store.get(input.caseId);
    if (!item) throw new Error("CASE_NOT_FOUND");
    if (
      item.version !== input.expectedVersion ||
      !["READY", "WAITING_RETRY"].includes(item.state)
    ) {
      return { status: "STALE_TASK" };
    }
    const wakeAt = item.nextWakeAt ?? item.dueAt;
    if (Date.parse(wakeAt) > Date.parse(input.now)) return { status: "NOT_DUE", wakeAt };

    try {
      const broker = await this.broker.execute({
        caseId: item.caseId,
        actionOrdinal: item.actionOrdinal,
        policy: {
          ownerId: item.ownerId,
          planVersion: item.plan.version,
          planHash: item.plan.planHash,
          allowedActions: item.plan.allowedActions,
          allowedRecipient: item.plan.allowedRecipient,
          sharedFields: item.plan.sharedFields,
          approval: item.approval
        },
        proposal: actionProposal(item),
        now: input.now
      });
      if (broker.status === "DENIED")
        throw new Error(`ACTION_DENIED:${broker.decision.reasonCodes.join(",")}`);
      if (broker.status === "PENDING_DUPLICATE") throw new Error("ACTION_IN_FLIGHT");
      await this.store.compareAndSet(item.caseId, item.version, {
        ...item,
        state: "WAITING_EXTERNAL",
        version: item.version + 1,
        lastReceiptId: broker.receipt.receiptId,
        lastError: undefined,
        nextWakeAt: undefined
      });
      return { status: "WAITING_EXTERNAL", broker };
    } catch (error) {
      const retryAt = new Date(Date.parse(input.now) + this.retryDelaySeconds * 1000).toISOString();
      const next = {
        ...item,
        state: "WAITING_RETRY" as const,
        version: item.version + 1,
        nextWakeAt: retryAt,
        lastError: error instanceof Error ? error.message : "ACTION_FAILED"
      };
      await this.store.compareAndSet(item.caseId, item.version, next);
      await this.scheduler.scheduleCase({
        caseId: item.caseId,
        expectedVersion: next.version,
        wakeAt: retryAt
      });
      return { status: "WAITING_RETRY", wakeAt: retryAt };
    }
  }
}
