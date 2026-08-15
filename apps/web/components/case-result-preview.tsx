import type { EvidenceRecord } from "@dueback/runtime/evidence-service";
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

export function CaseResultPreview() {
  return (
    <div className="result-grid">
      <p className="preview-label">Controlled development preview — synthetic data</p>
      <section className="card outcome verified">
        <div className="eyebrow">Proof of Done</div>
        <h2>Merchant-confirmed refund</h2>
        <p>The merchant signed evidence matching this case, amount, currency, and reference.</p>
        <div className="claim-limit">
          Merchant-confirmed does not mean bank settlement. Funds settlement has not been verified.
        </div>
      </section>
      <section className="card">
        <h2>Auditable timeline</h2>
        <CaseTimeline evidence={evidence} />
      </section>
    </div>
  );
}
