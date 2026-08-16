import { z } from "zod";

export const opaqueIdSchema = z.string().min(8).max(128);
export const isoDateSchema = z.iso.datetime({ offset: true });
export const sha256Schema = z.string().regex(/^sha256:[a-f0-9]{64}$/);
export const currencySchema = z.string().regex(/^[A-Z]{3}$/);

export const evidenceLevelSchema = z.enum([
  "PROMISE_RECORDED",
  "REQUEST_ACKNOWLEDGED",
  "MERCHANT_COMMITTED",
  "MERCHANT_CONFIRMED",
  "FUNDS_SETTLED"
]);

export const fieldProvenanceSchema = z.object({
  artifactId: opaqueIdSchema,
  locator: z.string().min(1).max(256),
  excerpt: z.string().min(1).max(160).optional(),
  excerptHash: sha256Schema,
  confidence: z.enum(["HIGH", "MEDIUM", "LOW", "UNKNOWN"])
});

export const extractedFieldSchema = <T extends z.ZodType>(value: T) =>
  z.object({
    value,
    provenance: z.array(fieldProvenanceSchema).min(1),
    uncertainty: z.enum(["NONE", "AMBIGUOUS", "MISSING", "CONTRADICTORY"])
  });

export const promiseDraftSchema = z.object({
  promisor: extractedFieldSchema(z.string().min(1).max(200)),
  result: extractedFieldSchema(z.string().min(1).max(500)),
  amountMinor: extractedFieldSchema(z.int().nonnegative()).optional(),
  currency: extractedFieldSchema(currencySchema).optional(),
  transactionRef: extractedFieldSchema(z.string().min(1).max(200)),
  dueAt: extractedFieldSchema(isoDateSchema).optional(),
  dueCondition: extractedFieldSchema(z.string().min(1).max(300)).optional(),
  proposedEvidenceLevel: evidenceLevelSchema
});

const outcomeContractBaseSchema = z.object({
  contractId: opaqueIdSchema,
  outcome: z.string().min(1).max(500),
  responsibleParty: z.string().min(1).max(200),
  dueAt: isoDateSchema.optional(),
  proofRequired: z.string().min(1).max(500),
  actionIntents: z
    .array(
      z.enum([
        "FOLLOW_UP",
        "CHECK_STATUS",
        "FIND_OPTION",
        "RESERVE_APPOINTMENT",
        "REQUEST_DOCUMENT"
      ])
    )
    .min(1)
    .max(5)
});

export const outcomeContractSchema = z.discriminatedUnion("recipe", [
  outcomeContractBaseSchema.extend({
    recipe: z.literal("COMMERCIAL_FOLLOW_UP"),
    recipeData: z.object({
      reference: z.string().min(1).max(200),
      amountMinor: z.int().nonnegative().optional(),
      currency: currencySchema.optional()
    })
  }),
  outcomeContractBaseSchema.extend({
    recipe: z.literal("APPOINTMENT"),
    recipeData: z.object({
      service: z.string().min(1).max(200),
      acceptableWindows: z.array(z.string().min(1).max(200)).min(1).max(10),
      location: z.string().min(1).max(300).optional()
    })
  }),
  outcomeContractBaseSchema.extend({
    recipe: z.literal("DOCUMENT"),
    recipeData: z.object({
      documentName: z.string().min(1).max(200),
      deliveryChannel: z.string().min(1).max(100).optional()
    })
  })
]);

export const resolutionPlanSchema = z
  .object({
    planId: opaqueIdSchema,
    caseId: opaqueIdSchema,
    ownerId: opaqueIdSchema,
    version: z.int().positive(),
    planHash: sha256Schema,
    goal: z.string().min(1).max(500),
    promiseType: z.enum(["REFUND", "BILL_CREDIT", "REPLACEMENT"]).optional(),
    allowedActions: z
      .array(z.enum(["SEND_FOLLOW_UP", "CHECK_STATUS"]))
      .min(1)
      .max(2),
    allowedRecipient: z.string().min(1).max(320),
    sharedFields: z.array(z.string().min(1).max(80)).max(12),
    followUpAt: isoDateSchema.optional(),
    evidenceRequirements: z
      .array(
        z.object({
          minimumLevel: evidenceLevelSchema,
          amountMinor: z.int().nonnegative().optional(),
          currency: currencySchema.optional(),
          transactionRef: z.string().min(1).max(200),
          subject: z.string().min(1).max(300).optional(),
          billPeriod: z.string().min(1).max(100).optional(),
          requiredEvidenceFields: z
            .array(z.enum(["amountMinor", "currency", "subject", "billPeriod", "trackingNumber"]))
            .max(5)
            .optional(),
          maxAgeSeconds: z.int().positive(),
          trustedIssuer: z.string().min(1).max(200)
        })
      )
      .min(1),
    expiresAt: isoDateSchema
  })
  .superRefine((plan, context) => {
    const promiseType = plan.promiseType ?? "REFUND";
    for (const [index, requirement] of plan.evidenceRequirements.entries()) {
      if (
        ["REFUND", "BILL_CREDIT"].includes(promiseType) &&
        (requirement.amountMinor === undefined || requirement.currency === undefined)
      ) {
        context.addIssue({
          code: "custom",
          path: ["evidenceRequirements", index],
          message: "Money evidence is required"
        });
      }
      if (promiseType === "BILL_CREDIT" && !requirement.billPeriod) {
        context.addIssue({
          code: "custom",
          path: ["evidenceRequirements", index, "billPeriod"],
          message: "Bill period is required"
        });
      }
      if (
        promiseType === "REPLACEMENT" &&
        (!requirement.subject || !requirement.requiredEvidenceFields?.includes("trackingNumber"))
      ) {
        context.addIssue({
          code: "custom",
          path: ["evidenceRequirements", index],
          message: "Replacement subject and tracking proof are required"
        });
      }
    }
  });

export const actionEnvelopeSchema = z.object({
  actionId: opaqueIdSchema,
  idempotencyKey: sha256Schema,
  caseId: opaqueIdSchema,
  ownerId: opaqueIdSchema,
  planVersion: z.int().positive(),
  planHash: sha256Schema,
  actionType: z.enum(["SEND_FOLLOW_UP", "CHECK_STATUS"]),
  recipient: z.string().min(1).max(320),
  sharedFields: z.record(z.string(), z.string().max(500)),
  requestedAt: isoDateSchema
});

export const evidenceCandidateSchema = z.object({
  evidenceId: opaqueIdSchema,
  caseId: opaqueIdSchema,
  level: evidenceLevelSchema,
  amountMinor: z.int().nonnegative().optional(),
  currency: currencySchema.optional(),
  transactionRef: z.string().min(1).max(200),
  subject: z.string().min(1).max(300).optional(),
  billPeriod: z.string().min(1).max(100).optional(),
  trackingNumber: z.string().min(1).max(200).optional(),
  issuedAt: isoDateSchema,
  issuer: z.string().min(1).max(200),
  signatureValid: z.boolean()
});

export const caseEventSchema = z.object({
  eventId: opaqueIdSchema,
  caseId: opaqueIdSchema,
  sequence: z.int().positive(),
  type: z.string().min(1).max(100),
  actor: z.enum(["PERSON", "SYSTEM", "MODEL", "ADAPTER", "SANDBOX"]),
  occurredAt: isoDateSchema,
  correlationId: opaqueIdSchema,
  payloadHash: sha256Schema,
  schemaVersion: z.literal(1)
});

export const notificationSchema = z.object({
  notificationId: opaqueIdSchema,
  dedupeKey: sha256Schema,
  caseId: opaqueIdSchema,
  correlationId: opaqueIdSchema,
  kind: z.enum(["APPROVAL_REQUIRED", "NEEDS_ATTENTION", "CASE_COMPLETED"]),
  deepLinkPath: z.string().startsWith("/cases/"),
  createdAt: isoDateSchema
});

export type PromiseDraft = z.infer<typeof promiseDraftSchema>;
export type OutcomeContract = z.infer<typeof outcomeContractSchema>;
export type ResolutionPlan = z.infer<typeof resolutionPlanSchema>;
export type ActionEnvelope = z.infer<typeof actionEnvelopeSchema>;
export type EvidenceCandidateContract = z.infer<typeof evidenceCandidateSchema>;
