import type { EvidenceRecord } from "@dueback/runtime/evidence-service";

export function CaseTimeline({ evidence }: { readonly evidence: readonly EvidenceRecord[] }) {
  return (
    <ol className="timeline">
      <li>
        <span className="timeline-mark complete" />
        <div>
          <strong>Plan approved</strong>
          <p>Authority is bound to one owner, version, hash, recipient, and expiry.</p>
        </div>
      </li>
      <li>
        <span className="timeline-mark complete" />
        <div>
          <strong>Follow-up accepted</strong>
          <p>One idempotent request crossed the controlled merchant HTTP boundary.</p>
        </div>
      </li>
      {evidence.map((record) => (
        <li key={record.candidate.evidenceId}>
          <span
            className={`timeline-mark ${record.verification.accepted ? "complete" : "rejected"}`}
          />
          <div>
            <strong>{record.candidate.level.replaceAll("_", " ")}</strong>
            <p>
              {record.verification.accepted
                ? "Evidence matched every deterministic requirement."
                : `Not done — ${record.verification.reasonCodes.join(", ")}.`}
            </p>
            <code>{record.candidate.evidenceId}</code>
          </div>
        </li>
      ))}
    </ol>
  );
}
