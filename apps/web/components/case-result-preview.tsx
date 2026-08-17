import type { EvidenceRecord } from "@dueback/runtime/evidence-service";
import type { RuntimeTimelineEvent } from "@dueback/runtime/timeline";
import { CaseTimeline } from "./case-timeline";

const evidence: EvidenceRecord[] = [
  {
    correlationId: "corr_demo0000000000000000000",
    candidate: {
      evidenceId: "evidence_ack_demo",
      caseId: "case_demo_verified",
      level: "REQUEST_ACKNOWLEDGED",
      amountMinor: 7900,
      currency: "USD",
      transactionRef: "ORDER-79",
      issuedAt: "2026-08-15T12:00:05.000Z",
      issuer: "merchant-sandbox",
      signatureValid: true
    },
    verification: { accepted: false, reasonCodes: ["INSUFFICIENT_LEVEL"] },
    recordedAt: "2026-08-15T12:00:05.000Z"
  },
  {
    correlationId: "corr_demo0000000000000000000",
    candidate: {
      evidenceId: "evidence_confirmed_demo",
      caseId: "case_demo_verified",
      level: "MERCHANT_CONFIRMED",
      amountMinor: 7900,
      currency: "USD",
      transactionRef: "ORDER-79",
      issuedAt: "2026-08-15T12:01:00.000Z",
      issuer: "merchant-sandbox",
      signatureValid: true
    },
    verification: {
      accepted: true,
      level: "MERCHANT_CONFIRMED",
      reasonCodes: ["ACCEPTED"]
    },
    recordedAt: "2026-08-15T12:01:00.000Z"
  }
];

const events: RuntimeTimelineEvent[] = [
  {
    eventId: "000001-plan-approved",
    caseId: "case_demo_verified",
    sequence: 1,
    type: "PLAN_APPROVED",
    actor: "PERSON",
    occurredAt: "2026-08-15T12:00:00.000Z",
    reasonCodes: ["CURRENT_PLAN_VERSION_APPROVED"],
    correlationId: "corr_demo0000000000000000000",
    state: "READY"
  },
  ...evidence.map(
    (record, index): RuntimeTimelineEvent => ({
      eventId: `evidence-${String(index + 2)}`,
      caseId: record.candidate.caseId,
      sequence: index + 2,
      type: "EVIDENCE_RESULT",
      actor: "COUNTERPARTY",
      occurredAt: record.recordedAt,
      reasonCodes: record.verification.reasonCodes,
      correlationId: record.correlationId,
      state: record.verification.accepted ? "DONE" : "WAITING_EXTERNAL",
      evidenceId: record.candidate.evidenceId
    })
  )
];

export function CaseResultPreview() {
  return (
    <div className="result-grid">
      <p className="preview-label">Controlled development preview — synthetic data</p>
      <section className="card outcome verified">
        <div className="eyebrow">Evidence accepted</div>
        <h2>Merchant confirmed the refund instruction</h2>
        <p>The merchant signed evidence matching this case, amount, currency, and reference.</p>
        <div className="claim-limit">
          Bank settlement: NOT VERIFIED. Check your payment account before treating the money as received.
        </div>
      </section>
      <section className="card">
        <h2>Auditable timeline</h2>
        <CaseTimeline events={events} channel="CONTROLLED_SANDBOX" />
      </section>
    </div>
  );
}
