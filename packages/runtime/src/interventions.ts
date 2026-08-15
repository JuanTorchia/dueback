import { stableHash } from "@dueback/domain";
import { notificationRecord, type NotificationStore } from "./notifications";

export type InterventionKind = "EVIDENCE_CONFLICT" | "RECOVERY_EXHAUSTED";

export interface InterventionRecord {
  readonly interventionId: string;
  readonly dedupeKey: string;
  readonly caseId: string;
  readonly ownerId: string;
  readonly correlationId: string;
  readonly kind: InterventionKind;
  readonly reasonCodes: readonly string[];
  readonly requestedField?: string;
  readonly status: "OPEN" | "RESOLVED";
  readonly createdAt: string;
}

export interface InterventionStore {
  createInterventionIfAbsent(
    record: InterventionRecord
  ): Promise<{ record: InterventionRecord; duplicate: boolean }>;
  listInterventions(caseId: string): Promise<readonly InterventionRecord[]>;
}

export function interventionRecord(input: {
  caseId: string;
  ownerId: string;
  correlationId: string;
  kind: InterventionKind;
  reasonCodes: readonly string[];
  requestedField?: string;
  createdAt: string;
}): InterventionRecord {
  const dedupeKey = stableHash({
    namespace: "dueback/intervention/v1",
    caseId: input.caseId,
    kind: input.kind,
    reasonCodes: [...input.reasonCodes].sort()
  });
  return {
    interventionId: `intervention_${dedupeKey.slice(7, 31)}`,
    dedupeKey,
    caseId: input.caseId,
    ownerId: input.ownerId,
    correlationId: input.correlationId,
    kind: input.kind,
    reasonCodes: input.reasonCodes,
    ...(input.requestedField ? { requestedField: input.requestedField } : {}),
    status: "OPEN",
    createdAt: input.createdAt
  };
}

export class InterventionService {
  constructor(
    private readonly interventions: InterventionStore,
    private readonly notifications: NotificationStore
  ) {}

  async raise(input: {
    caseId: string;
    ownerId: string;
    correlationId: string;
    kind: InterventionKind;
    reasonCodes: readonly string[];
    requestedField?: string;
    createdAt: string;
  }): Promise<InterventionRecord> {
    const intervention = interventionRecord(input);
    const [persisted] = await Promise.all([
      this.interventions.createInterventionIfAbsent(intervention),
      this.notifications.createIfAbsent(
        notificationRecord({
          caseId: input.caseId,
          ownerId: input.ownerId,
          correlationId: input.correlationId,
          kind: "NEEDS_ATTENTION",
          createdAt: input.createdAt
        })
      )
    ]);
    return persisted.record;
  }
}
