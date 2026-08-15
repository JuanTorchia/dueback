import type { EvidenceCandidateContract, ResolutionPlan } from "@dueback/contracts";
import {
  stableHash,
  verifyEvidence,
  type CaseState,
  type VerificationResult
} from "@dueback/domain";
import {
  notificationRecord,
  type NotificationRecord,
  type NotificationStore
} from "./notifications";

export interface EvidenceCase {
  readonly caseId: string;
  readonly ownerId: string;
  readonly state: CaseState;
  readonly version: number;
  readonly plan: ResolutionPlan;
  readonly correlationId?: string;
}

export interface EvidenceRecord {
  readonly candidate: EvidenceCandidateContract;
  readonly verification: VerificationResult;
  readonly recordedAt: string;
  readonly correlationId: string;
}

export interface EvidenceCaseStore {
  get(caseId: string): Promise<EvidenceCase | undefined>;
  record(input: {
    caseId: string;
    expectedVersion: number;
    nextState: CaseState;
    evidence: EvidenceRecord;
  }): Promise<{ duplicate: boolean }>;
}

export class EvidenceService {
  constructor(
    private readonly cases: EvidenceCaseStore,
    private readonly notifications: NotificationStore
  ) {}

  async reconcile(
    candidate: EvidenceCandidateContract,
    now: string,
    requestedCorrelationId?: string
  ): Promise<{
    status: "VERIFIED" | "INSUFFICIENT";
    verification: VerificationResult;
    notification?: NotificationRecord;
  }> {
    const item = await this.cases.get(candidate.caseId);
    if (!item) throw new Error("CASE_NOT_FOUND");
    const requirement = item.plan.evidenceRequirements[0];
    if (!requirement) throw new Error("EVIDENCE_REQUIREMENT_MISSING");
    const verification = verifyEvidence({ caseId: item.caseId, requirement, candidate, now });
    const correlationId =
      requestedCorrelationId ??
      item.correlationId ??
      `corr_${stableHash({ namespace: "dueback/correlation/v1", caseId: item.caseId }).slice(7, 31)}`;
    const accepted = verification.accepted;
    await this.cases.record({
      caseId: item.caseId,
      expectedVersion: item.version,
      nextState: accepted ? "DONE" : "WAITING_EXTERNAL",
      evidence: { candidate, verification, recordedAt: now, correlationId }
    });
    if (!accepted) return { status: "INSUFFICIENT", verification };
    const record = notificationRecord({
      caseId: item.caseId,
      ownerId: item.ownerId,
      kind: "CASE_COMPLETED",
      createdAt: now,
      correlationId
    });
    const persisted = await this.notifications.createIfAbsent(record);
    return { status: "VERIFIED", verification, notification: persisted.record };
  }
}
