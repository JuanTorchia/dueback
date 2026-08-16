import { randomUUID } from "node:crypto";
import { promiseDraftSchema, resolutionPlanSchema } from "@dueback/contracts";
import type { PromiseDraft, ResolutionPlan } from "@dueback/contracts";
import { stableHash } from "@dueback/domain";
import { blockingCriticalFields, commercialOutcomeContract } from "./intake-service";
import type { DraftCase, PlanApproval } from "./intake-service";

export interface PlanStore {
  get(caseId: string): Promise<DraftCase | undefined>;
  replace(caseId: string, expectedPlanVersion: number, next: DraftCase): Promise<void>;
  deleteDraft?(caseId: string, ownerId: string): Promise<void>;
}

export interface ActivationScheduler {
  scheduleCase(input: {
    caseId: string;
    expectedVersion: number;
    wakeAt: string;
  }): Promise<unknown>;
}

export interface PlanRevision {
  readonly promisor?: string;
  readonly result?: string;
  readonly amountMinor?: number;
  readonly currency?: string;
  readonly transactionRef?: string;
  readonly dueAt?: string;
  readonly followUpAt?: string;
  readonly goal?: string;
  readonly expiresAt?: string;
  readonly allowedRecipient?: string;
}

export interface PlanSimulation {
  readonly recipient: string;
  readonly action: string;
  readonly sharedFields: readonly string[];
  readonly completionLevel: string;
  readonly externalActionPerformed: false;
}

function correction<T>(
  value: T,
  field: string
): {
  value: T;
  provenance: { artifactId: string; locator: string; excerptHash: string; confidence: "HIGH" }[];
  uncertainty: "NONE";
} {
  return {
    value,
    provenance: [
      {
        artifactId: "user-correction",
        locator: `review:${field}`,
        excerptHash: stableHash({ field, value }),
        confidence: "HIGH"
      }
    ],
    uncertainty: "NONE"
  };
}

function revisedDraft(current: PromiseDraft, revision: PlanRevision): PromiseDraft {
  return promiseDraftSchema.parse({
    ...current,
    ...(revision.promisor === undefined ? {} : { promisor: correction(revision.promisor, "promisor") }),
    ...(revision.result === undefined ? {} : { result: correction(revision.result, "result") }),
    ...(revision.amountMinor === undefined
      ? {}
      : { amountMinor: correction(revision.amountMinor, "amountMinor") }),
    ...(revision.currency === undefined
      ? {}
      : { currency: correction(revision.currency, "currency") }),
    ...(revision.transactionRef === undefined
      ? {}
      : { transactionRef: correction(revision.transactionRef, "transactionRef") }),
    ...(revision.dueAt === undefined ? {} : { dueAt: correction(revision.dueAt, "dueAt") })
  });
}

function revisedPlan(current: ResolutionPlan, draft: PromiseDraft, revision: PlanRevision) {
  if (!draft.amountMinor || !draft.currency) throw new Error("REFUND_MONEY_FIELDS_REQUIRED");
  const hashable = {
    planId: current.planId,
    caseId: current.caseId,
    ownerId: current.ownerId,
    version: current.version + 1,
    goal: revision.goal ?? draft.result.value,
    allowedActions: current.allowedActions,
    allowedRecipient: revision.allowedRecipient ?? current.allowedRecipient,
    sharedFields: current.sharedFields,
    ...(revision.followUpAt || revision.dueAt || current.followUpAt
      ? { followUpAt: revision.followUpAt ?? revision.dueAt ?? current.followUpAt }
      : {}),
    expiresAt: revision.expiresAt ?? current.expiresAt,
    evidenceRequirements: [
      {
        ...current.evidenceRequirements[0],
        amountMinor: draft.amountMinor.value,
        currency: draft.currency.value,
        transactionRef: draft.transactionRef.value
      }
    ]
  };
  return resolutionPlanSchema.parse({ ...hashable, planHash: stableHash(hashable) });
}

export class PlanService {
  constructor(
    private readonly store: PlanStore,
    private readonly scheduler?: ActivationScheduler
  ) {}

  private async schedule(draft: DraftCase, now: string): Promise<void> {
    if (!this.scheduler) return;
    const requestedAt = draft.plan.followUpAt ?? draft.promiseDraft.dueAt?.value;
    const wakeAt = requestedAt && Date.parse(requestedAt) > Date.parse(now) ? requestedAt : now;
    await this.scheduler.scheduleCase({ caseId: draft.caseId, expectedVersion: 1, wakeAt });
  }

  async inspect(caseId: string, ownerId: string): Promise<DraftCase> {
    const draft = await this.store.get(caseId);
    if (!draft) throw new Error("CASE_NOT_FOUND");
    if (draft.ownerId !== ownerId) throw new Error("CASE_OWNERSHIP_REQUIRED");
    return draft;
  }

  async simulate(caseId: string, ownerId: string): Promise<PlanSimulation> {
    const draft = await this.inspect(caseId, ownerId);
    return {
      recipient: draft.plan.allowedRecipient,
      action: draft.plan.allowedActions[0] ?? "NONE",
      sharedFields: draft.plan.sharedFields,
      completionLevel: draft.plan.evidenceRequirements[0]?.minimumLevel ?? "UNDEFINED",
      externalActionPerformed: false
    };
  }

  async revise(
    caseId: string,
    ownerId: string,
    expectedPlanVersion: number,
    revision: PlanRevision
  ): Promise<DraftCase> {
    const current = await this.inspect(caseId, ownerId);
    if (current.plan.version !== expectedPlanVersion) throw new Error("STALE_PLAN_VERSION");
    if (current.state !== "AWAITING_APPROVAL") throw new Error("PLAN_NOT_EDITABLE");
    const promiseDraft = revisedDraft(current.promiseDraft, revision);
    const plan = revisedPlan(current.plan, promiseDraft, revision);
    const blockingFields = blockingCriticalFields(
      promiseDraft,
      plan.followUpAt,
      plan.allowedRecipient
    );
    const next: DraftCase = {
      ...current,
      promiseDraft,
      outcomeContract: commercialOutcomeContract(
        current.outcomeContract?.contractId ?? `outcome_${randomUUID()}`,
        promiseDraft
      ),
      plan,
      blockingFields,
      activationBlocked: blockingFields.length > 0
    };
    await this.store.replace(caseId, expectedPlanVersion, next);
    return next;
  }

  async approve(input: {
    readonly caseId: string;
    readonly ownerId: string;
    readonly expectedPlanVersion: number;
    readonly expectedPlanHash: string;
    readonly now: string;
  }): Promise<DraftCase> {
    const current = await this.inspect(input.caseId, input.ownerId);
    if (
      current.state === "READY" &&
      current.approval?.planVersion === input.expectedPlanVersion &&
      current.approval.planHash === input.expectedPlanHash
    ) {
      if (!this.scheduler) throw new Error("PLAN_NOT_APPROVABLE");
      await this.schedule(current, input.now);
      return current;
    }
    if (
      current.plan.version !== input.expectedPlanVersion ||
      current.plan.planHash !== input.expectedPlanHash
    ) {
      throw new Error("STALE_PLAN_APPROVAL");
    }
    if (current.state !== "AWAITING_APPROVAL") throw new Error("PLAN_NOT_APPROVABLE");
    if (current.activationBlocked) throw new Error("CRITICAL_FIELDS_UNRESOLVED");
    if (Date.parse(current.plan.expiresAt) <= Date.parse(input.now))
      throw new Error("PLAN_EXPIRED");
    const approval: PlanApproval = {
      approvalId: `approval_${randomUUID()}`,
      ownerId: input.ownerId,
      caseId: input.caseId,
      planVersion: current.plan.version,
      planHash: current.plan.planHash,
      approvedAt: input.now,
      expiresAt: current.plan.expiresAt
    };
    const next: DraftCase = { ...current, state: "READY", approval };
    await this.store.replace(input.caseId, input.expectedPlanVersion, next);
    await this.schedule(next, input.now);
    return next;
  }

  async reject(caseId: string, ownerId: string, expectedPlanVersion: number): Promise<DraftCase> {
    const current = await this.inspect(caseId, ownerId);
    if (current.plan.version !== expectedPlanVersion) throw new Error("STALE_PLAN_VERSION");
    const next: DraftCase = { ...current, state: "CANCELLED" };
    await this.store.replace(caseId, expectedPlanVersion, next);
    return next;
  }

  async deleteDraft(caseId: string, ownerId: string): Promise<void> {
    const current = await this.inspect(caseId, ownerId);
    if (current.state === "READY") throw new Error("USE_ACTIVE_CASE_CONTROLS");
    if (!this.store.deleteDraft) throw new Error("DRAFT_DELETION_UNAVAILABLE");
    await this.store.deleteDraft(caseId, ownerId);
  }
}
