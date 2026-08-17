import type { ConsumerCaseDetail } from "../lib/case-projection";

export function CaseStatus({ detail }: { readonly detail: ConsumerCaseDetail }) {
  return <section className="card case-status" aria-labelledby="case-status-title">
    <div className="case-status-top"><span className={`status-pill state-${detail.state.toLowerCase()}`}>{detail.statusLabel}</span><span>{detail.channel.label}</span></div>
    <p className="eyebrow">DueBack is following through on</p>
    <h1 id="case-status-title">{detail.goal}</h1>
    <div className="next-action" role="status"><strong>What happens next</strong><p>{detail.nextAction}</p></div>
    <dl className="facts compact-facts">
      <div><dt>Last activity</dt><dd>{new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(detail.updatedAt))}</dd></div>
      {detail.nextCheckAt && !["DONE", "CANCELLED", "FAILED", "EXPIRED"].includes(detail.state) ? <div><dt>Next check</dt><dd>{new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(detail.nextCheckAt))}</dd></div> : null}
      <div><dt>Return path</dt><dd>{detail.returnPath}</dd></div>
    </dl>
  </section>;
}
