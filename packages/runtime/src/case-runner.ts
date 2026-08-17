import type { ResolutionPlan } from "@dueback/contracts";
import type { ApprovalBoundary, CaseState, EvidenceLevel, ProposedAction } from "@dueback/domain";
import { ActionOutcomeUnknownError, type ActionBroker, type BrokerResult } from "./action-broker";
import type { InterventionService } from "./interventions";

export interface FollowThroughCase {
  readonly caseId: string;
  readonly ownerId: string;
  readonly state: CaseState;
  readonly version: number;
  readonly plan: ResolutionPlan;
  readonly approval: ApprovalBoundary;
  readonly actionOrdinal: number;
  readonly dueAt: string;
  readonly correlationId?: string;
  readonly nextWakeAt?: string | undefined;
  readonly lastReceiptId?: string;
  readonly lastError?: string | undefined;
  readonly controlReason?: string;
  readonly controlledAt?: string;
  readonly attemptCount?: number;
  readonly completedLevel?: EvidenceLevel;
  readonly lastAttemptAt?: string;
  readonly lastActionIdempotencyKey?: string;
  readonly lastActionDuplicate?: boolean;
  readonly updatedAt?: string;
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
    correlationId?: string;
  }): Promise<unknown>;
}

export type RunResult =
  | { readonly status: "NOT_DUE"; readonly wakeAt: string }
  | { readonly status: "STALE_TASK" }
  | { readonly status: "WAITING_EXTERNAL"; readonly broker: BrokerResult }
  | { readonly status: "WAITING_RETRY"; readonly wakeAt: string }
  | { readonly status: "NEEDS_ATTENTION"; readonly reason: "RECOVERY_EXHAUSTED" };

function actionProposal(item: FollowThroughCase): ProposedAction {
  const requirement = item.plan.evidenceRequirements[0];
  if (!requirement) throw new Error("EVIDENCE_REQUIREMENT_MISSING");
  const sharedFields: Record<string, string> = { transactionRef: requirement.transactionRef };
  if (requirement.amountMinor !== undefined)
    sharedFields.amountMinor = String(requirement.amountMinor);
  if (requirement.currency !== undefined) sharedFields.currency = requirement.currency;
  if (requirement.subject !== undefined) sharedFields.subject = requirement.subject;
  if (requirement.billPeriod !== undefined) sharedFields.billPeriod = requirement.billPeriod;
  return {
    ownerId: item.ownerId,
    planVersion: item.plan.version,
    planHash: item.plan.planHash,
    actionType: "SEND_FOLLOW_UP",
    recipient: item.plan.allowedRecipient,
    ...(item.plan.channelType ? { channelType: item.plan.channelType } : {}),
    ...(item.plan.messageSubject ? { subject: item.plan.messageSubject } : {}),
    ...(item.plan.messageBody ? { body: item.plan.messageBody } : {}),
    sharedFields
  };
}

export class CaseRunner {
  constructor(
    private readonly store: FollowThroughStore,
    private readonly broker: ActionBroker,
    private readonly scheduler: RetryScheduler,
    private readonly retryDelaySeconds = 30,
    private readonly maxAttempts = 5,
    private readonly interventions?: InterventionService
  ) {}

  async run(input: {
    caseId: string;
    expectedVersion: number;
    now: string;
    correlationId?: string;
  }): Promise<RunResult> {
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

    if (item.actionOrdinal > 3) {
      const exhausted: FollowThroughCase = {
        ...item,
        state: "NEEDS_ATTENTION",
        version: item.version + 1,
        lastError: "LOGICAL_ACTION_BUDGET_EXHAUSTED",
        updatedAt: input.now
      };
      await this.store.compareAndSet(item.caseId, item.version, exhausted);
      return { status: "NEEDS_ATTENTION", reason: "RECOVERY_EXHAUSTED" };
    }

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
          ...(item.plan.channelType ? { allowedChannel: item.plan.channelType } : {}),
          sharedFields: item.plan.sharedFields,
          approval: item.approval
        },
        proposal: actionProposal(item),
        now: input.now,
        ...(input.correlationId || item.correlationId
          ? { correlationId: input.correlationId ?? item.correlationId }
          : {})
      });
      if (broker.status === "DENIED")
        throw new Error(`ACTION_DENIED:${broker.decision.reasonCodes.join(",")}`);
      if (broker.status === "PENDING_DUPLICATE") throw new Error("ACTION_IN_FLIGHT");
      const waitingExternal: FollowThroughCase = {
        caseId: item.caseId,
        ownerId: item.ownerId,
        state: "WAITING_EXTERNAL",
        version: item.version + 1,
        plan: item.plan,
        approval: item.approval,
        actionOrdinal: item.actionOrdinal,
        dueAt: item.dueAt,
        ...(item.correlationId || input.correlationId
          ? { correlationId: item.correlationId ?? input.correlationId }
          : {}),
        lastReceiptId: broker.receipt.receiptId,
        lastAttemptAt: input.now,
        lastActionIdempotencyKey: broker.idempotencyKey,
        lastActionDuplicate: broker.duplicate,
        updatedAt: input.now
      };
      await this.store.compareAndSet(item.caseId, item.version, waitingExternal);
      return { status: "WAITING_EXTERNAL", broker };
    } catch (error) {
      const attemptCount = (item.attemptCount ?? 0) + 1;
      if (attemptCount >= this.maxAttempts) {
        const exhausted: FollowThroughCase = {
          ...item,
          state: "NEEDS_ATTENTION",
          version: item.version + 1,
          attemptCount,
          lastError: "RECOVERY_EXHAUSTED",
          lastAttemptAt: input.now,
          updatedAt: input.now
        };
        await this.store.compareAndSet(item.caseId, item.version, exhausted);
        const correlationId =
          input.correlationId ?? item.correlationId ?? `corr_${item.caseId.slice(-24)}`;
        await this.interventions?.raise({
          caseId: item.caseId,
          ownerId: item.ownerId,
          correlationId,
          kind: "RECOVERY_EXHAUSTED",
          reasonCodes: [error instanceof Error ? error.message : "ACTION_FAILED"],
          ...(item.plan.notificationRecipient
            ? { notificationRecipient: item.plan.notificationRecipient }
            : {}),
          createdAt: input.now
        });
        return { status: "NEEDS_ATTENTION", reason: "RECOVERY_EXHAUSTED" };
      }
      const retryAt = new Date(Date.parse(input.now) + this.retryDelaySeconds * 1000).toISOString();
      const next = {
        ...item,
        state: "WAITING_RETRY" as const,
        version: item.version + 1,
        nextWakeAt: retryAt,
        lastError: error instanceof Error ? error.message : "ACTION_FAILED",
        ...(error instanceof ActionOutcomeUnknownError && error.idempotencyKey
          ? { lastActionIdempotencyKey: error.idempotencyKey }
          : {}),
        attemptCount,
        lastAttemptAt: input.now,
        updatedAt: input.now
      };
      await this.store.compareAndSet(item.caseId, item.version, next);
      await this.scheduler.scheduleCase({
        caseId: item.caseId,
        expectedVersion: next.version,
        wakeAt: retryAt,
        ...(input.correlationId || item.correlationId
          ? { correlationId: input.correlationId ?? item.correlationId }
          : {})
      });
      return { status: "WAITING_RETRY", wakeAt: retryAt };
    }
  }
}
