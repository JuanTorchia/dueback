import type { RuntimeTimelineEvent } from "@dueback/runtime/timeline";

const title: Record<RuntimeTimelineEvent["type"], string> = {
  PLAN_APPROVED: "Plan approved by you",
  ACTION_RESULT: "Follow-up accepted by demo merchant",
  EVIDENCE_RESULT: "Merchant evidence checked",
  CASE_CONTROL: "Case control used"
};

function humanSummary(event: RuntimeTimelineEvent): string {
  if (event.reasonCodes.includes("CURRENT_PLAN_VERSION_APPROVED"))
    return "You approved this exact version before DueBack acted.";
  if (event.reasonCodes.includes("ACTION_ACCEPTED"))
    return "One authorized follow-up crossed the demo HTTP boundary.";
  if (event.reasonCodes.includes("INSUFFICIENT_LEVEL"))
    return "Not enough: this reply only acknowledged the request, so the case stayed open.";
  if (event.reasonCodes.includes("ACCEPTED"))
    return "Accepted: signed evidence matched this case, amount, currency, and reference.";
  return "DueBack recorded this step without changing the approved limits.";
}

export function CaseTimeline({ events }: { readonly events: readonly RuntimeTimelineEvent[] }) {
  if (events.length === 0) {
    return <p>No persisted timeline events are available for this pre-ledger case.</p>;
  }
  return (
    <ol className="timeline">
      {events.map((event) => {
        const rejected = event.reasonCodes.some((reason) =>
          ["INSUFFICIENT", "WRONG", "INVALID", "EXHAUSTED", "DENIED"].some((token) =>
            reason.includes(token)
          )
        );
        return (
          <li key={event.eventId}>
            <span className={`timeline-mark ${rejected ? "rejected" : "complete"}`} />
            <div>
              <strong>{title[event.type]}</strong>
              <p>
                {new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(
                  new Date(event.occurredAt)
                )}
              </p>
              <p>{humanSummary(event)}</p>
              <details className="technical-details">
                <summary>Technical details</summary>
                <code>actor: {event.actor}</code>
                <code>state: {event.state}</code>
                <code>reason: {event.reasonCodes.join(", ")}</code>
                {event.receiptId ? <code>receipt: {event.receiptId}</code> : null}
                {event.idempotencyKey ? <code>action: {event.idempotencyKey}</code> : null}
                {event.evidenceId ? <code>evidence: {event.evidenceId}</code> : null}
                <code>correlation: {event.correlationId}</code>
              </details>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
