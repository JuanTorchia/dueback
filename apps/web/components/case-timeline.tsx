import type { RuntimeTimelineEvent } from "@dueback/runtime/timeline";

const title: Record<RuntimeTimelineEvent["type"], string> = {
  PLAN_APPROVED: "Plan approved",
  ACTION_RESULT: "Authorized action result",
  EVIDENCE_RESULT: "Evidence checked",
  CASE_CONTROL: "User control"
};

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
                {event.actor.toLowerCase()} · {event.occurredAt} · state {event.state}
              </p>
              <p>{event.reasonCodes.join(", ")}</p>
              {event.receiptId ? <code>receipt: {event.receiptId}</code> : null}
              {event.idempotencyKey ? <code>action: {event.idempotencyKey}</code> : null}
              {event.evidenceId ? <code>evidence: {event.evidenceId}</code> : null}
              <code>correlation: {event.correlationId}</code>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
