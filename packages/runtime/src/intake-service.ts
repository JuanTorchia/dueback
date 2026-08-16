import { randomUUID } from "node:crypto";
import { outcomeContractSchema, promiseDraftSchema, resolutionPlanSchema } from "@dueback/contracts";
import type { ChannelType, OutcomeContract, PromiseDraft, ResolutionPlan } from "@dueback/contracts";
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

export function blockingCriticalFields(
  draft: PromiseDraft,
  followUpAt?: string,
  allowedRecipient?: string
): string[] {
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
  if (allowedRecipient?.endsWith(".invalid")) blocked.push("allowedRecipient");
  return blocked;
}

function buildPlan(input: {
  readonly caseId: string;
  readonly ownerId: string;
  readonly draft: PromiseDraft;
  readonly recipient: string;
  readonly now: string;
  readonly channel: {
    readonly channelType: ChannelType;
    readonly senderIdentity: string;
    readonly replyRoute: string;
  };
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
    channelType: input.channel.channelType,
    senderIdentity: input.channel.senderIdentity,
    replyRoute: input.channel.replyRoute,
    messageTemplateVersion: "company-follow-up/v1",
    messageSubject: `Follow-up for ${draft.transactionRef.value}`,
    messageBody: [
      "Hello,",
      "",
      "DueBack is following up on an outcome requested by your customer.",
      `Reference: ${draft.transactionRef.value}`,
      `Amount: ${draft.currency.value} ${(draft.amountMinor.value / 100).toFixed(2)}`,
      "Please reply with the current status and verifiable confirmation when the outcome is complete.",
      "An acknowledgement that the request was received will not be treated as completion."
    ].join("\n"),
    followUpIntervalSeconds: 2 * 24 * 60 * 60,
    maxLogicalSends: 3,
    sharedFields: ["transactionRef", "amountMinor", "currency"],
    ...(draft.dueAt?.uncertainty === "NONE" ? { followUpAt: draft.dueAt.value } : {}),
    evidenceRequirements: [
      {
        minimumLevel: "MERCHANT_CONFIRMED" as const,
        amountMinor: draft.amountMinor.value,
        currency: draft.currency.value,
        transactionRef: draft.transactionRef.value,
        maxAgeSeconds: 30 * 24 * 60 * 60,
        trustedIssuer: input.channel.channelType === "MANAGED_EMAIL"
          ? `managed-email:${stableHash({
              namespace: "dueback/recipient/v1",
              recipient: input.recipient.toLowerCase()
            }).slice(7, 31)}`
          : "merchant-sandbox"
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
    private readonly budget?: NewCaseBudget,
    private readonly channel: {
      readonly channelType: ChannelType;
      readonly senderIdentity: string;
      readonly replyRoute: string;
    } = {
      channelType: "CONTROLLED_SANDBOX",
      senderIdentity: "DueBack controlled demo",
      replyRoute: "Signed callback"
    }
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
      now,
      channel: this.channel
    });
    const blockingFields = blockingCriticalFields(
      promiseDraft,
      plan.followUpAt,
      plan.allowedRecipient
    );
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
