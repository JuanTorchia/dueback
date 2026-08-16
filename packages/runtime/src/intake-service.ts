import { randomUUID } from "node:crypto";
import { outcomeContractSchema, promiseDraftSchema, resolutionPlanSchema } from "@dueback/contracts";
import type { OutcomeContract, PromiseDraft, ResolutionPlan } from "@dueback/contracts";
import { caseDedupeKey, stableHash } from "@dueback/domain";

export interface IntakeArtifact {
  readonly artifactId: string;
  readonly ownerId: string;
  readonly sourceChannel: "upload" | "paste" | "fixture";
  readonly sha256: string;
  readonly content:
    | string
    | {
      readonly dataUrl: string;
      readonly contentType: "image/jpeg" | "image/png" | "application/pdf";
      readonly contextText?: string;
      };
}

export interface PromiseExtractor {
  extract(artifact: IntakeArtifact): Promise<PromiseDraft>;
}

export interface DraftCase {
  readonly caseId: string;
  readonly ownerId: string;
  readonly artifactId: string;
  readonly dedupeKey: string;
  readonly state: "AWAITING_APPROVAL" | "READY" | "CANCELLED";
  readonly promiseDraft: PromiseDraft;
  readonly outcomeContract?: OutcomeContract;
  readonly plan: ResolutionPlan;
  readonly activationBlocked: boolean;
  readonly blockingFields: readonly string[];
  readonly createdAt: string;
  readonly approval?: PlanApproval;
}

export function commercialOutcomeContract(
  contractId: string,
  draft: PromiseDraft
): OutcomeContract {
  return outcomeContractSchema.parse({
    contractId,
    recipe: "COMMERCIAL_FOLLOW_UP",
    outcome: draft.result.value,
    responsibleParty: draft.promisor.value,
    ...(draft.dueAt?.uncertainty === "NONE" ? { dueAt: draft.dueAt.value } : {}),
    proofRequired:
      "Signed evidence from the responsible party confirming the exact outcome and reference.",
    actionIntents: ["FOLLOW_UP", "CHECK_STATUS"],
    recipeData: {
      reference: draft.transactionRef.value,
      ...(draft.amountMinor ? { amountMinor: draft.amountMinor.value } : {}),
      ...(draft.currency ? { currency: draft.currency.value } : {})
    }
  });
}

export interface PlanApproval {
  readonly approvalId: string;
  readonly ownerId: string;
  readonly caseId: string;
  readonly planVersion: number;
  readonly planHash: string;
  readonly approvedAt: string;
  readonly expiresAt: string;
}

export interface IntakeStore {
  findByDedupeKey(ownerId: string, dedupeKey: string): Promise<DraftCase | undefined>;
  createDraft(draft: DraftCase): Promise<void>;
}

export interface NewCaseBudget {
  consume(ownerId: string, now: string): Promise<void>;
}

export function blockingCriticalFields(draft: PromiseDraft, followUpAt?: string): string[] {
  const fields: [string, { uncertainty: string } | undefined][] = [
    ["promisor", draft.promisor],
    ["result", draft.result],
    ["amountMinor", draft.amountMinor],
    ["currency", draft.currency],
    ["transactionRef", draft.transactionRef]
  ];
  const blocked = fields
    .filter(([, field]) => !field || field.uncertainty !== "NONE")
    .map(([name]) => name);
  const extractedDeadline = draft.dueAt?.uncertainty === "NONE" ? draft.dueAt.value : undefined;
  if (!followUpAt && !extractedDeadline) blocked.push("followUpAt");
  return blocked;
}

function buildPlan(input: {
  readonly caseId: string;
  readonly ownerId: string;
  readonly draft: PromiseDraft;
  readonly recipient: string;
  readonly now: string;
}): ResolutionPlan {
  const { draft } = input;
  if (!draft.amountMinor || !draft.currency) throw new Error("REFUND_MONEY_FIELDS_REQUIRED");
  const unsigned = {
    planId: `plan_${randomUUID()}`,
    caseId: input.caseId,
    ownerId: input.ownerId,
    version: 1,
    goal: draft.result.value,
    allowedActions: ["SEND_FOLLOW_UP"] as const,
    allowedRecipient: input.recipient,
    sharedFields: ["transactionRef", "amountMinor", "currency"],
    ...(draft.dueAt?.uncertainty === "NONE" ? { followUpAt: draft.dueAt.value } : {}),
    evidenceRequirements: [
      {
        minimumLevel: "MERCHANT_CONFIRMED" as const,
        amountMinor: draft.amountMinor.value,
        currency: draft.currency.value,
        transactionRef: draft.transactionRef.value,
        maxAgeSeconds: 30 * 24 * 60 * 60,
        trustedIssuer: "merchant-sandbox"
      }
    ],
    expiresAt: new Date(Date.parse(input.now) + 7 * 24 * 60 * 60 * 1000).toISOString()
  };
  return resolutionPlanSchema.parse({ ...unsigned, planHash: stableHash(unsigned) });
}

export class IntakeService {
  constructor(
    private readonly store: IntakeStore,
    private readonly extractor: PromiseExtractor,
    private readonly merchantRecipient: string,
    private readonly budget?: NewCaseBudget
  ) {}

  async intake(
    artifact: IntakeArtifact,
    now: string
  ): Promise<{ draft: DraftCase; duplicate: boolean }> {
    const dedupeKey = caseDedupeKey({
      ownerId: artifact.ownerId,
      sourceChannel: artifact.sourceChannel,
      sourceIdentity: artifact.sha256
    });
    const existing = await this.store.findByDedupeKey(artifact.ownerId, dedupeKey);
    if (existing) return { draft: existing, duplicate: true };

    await this.budget?.consume(artifact.ownerId, now);

    const promiseDraft = promiseDraftSchema.parse(await this.extractor.extract(artifact));
    const caseId = `case_${randomUUID()}`;
    const plan = buildPlan({
      caseId,
      ownerId: artifact.ownerId,
      draft: promiseDraft,
      recipient: this.merchantRecipient,
      now
    });
    const blockingFields = blockingCriticalFields(promiseDraft, plan.followUpAt);
    const draft: DraftCase = {
      caseId,
      ownerId: artifact.ownerId,
      artifactId: artifact.artifactId,
      dedupeKey,
      state: "AWAITING_APPROVAL",
      promiseDraft,
      outcomeContract: commercialOutcomeContract(`outcome_${randomUUID()}`, promiseDraft),
      plan,
      activationBlocked: blockingFields.length > 0,
      blockingFields,
      createdAt: now
    };
    await this.store.createDraft(draft);
    return { draft, duplicate: false };
  }
}
