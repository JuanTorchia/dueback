"use client";

import { useEffect, useState } from "react";
import type { ConsumerCaseDetail } from "../lib/case-projection";
import { anonymousIdToken } from "../lib/firebase-client";
import { GoogleSignIn } from "./google-sign-in";
import { NotificationStatus } from "./notification-status";
import { TechnicalRun } from "./technical-run";
import { CaseExport } from "./case-export";
import { CaseStatus } from "./case-status";

export function CaseResult({ caseId }: { readonly caseId: string }) {
  const [detail, setDetail] = useState<ConsumerCaseDetail>();
  const [error, setError] = useState<string>();
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastRefreshed, setLastRefreshed] = useState<string>();
  useEffect(() => {
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const load = async () => {
      try {
        const token = await anonymousIdToken();
        const response = await fetch(`/api/cases/${caseId}/detail`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
        const body = await response.json() as ConsumerCaseDetail & { error?: string };
        if (!response.ok) throw new Error(body.error ?? "DETAIL_FAILED");
        if (cancelled) return;
        setDetail(body); setError(undefined); setLastRefreshed(new Date().toISOString());
        if (!["DONE", "CANCELLED", "FAILED", "EXPIRED", "NEEDS_ATTENTION"].includes(body.state)) timeout = setTimeout(() => void load(), 2_000);
      } catch (cause) { if (!cancelled) setError(cause instanceof Error ? cause.message : "DETAIL_FAILED"); }
    };
    void load();
    return () => { cancelled = true; if (timeout) clearTimeout(timeout); };
  }, [caseId, refreshKey]);

  if (error && !detail) return <section className="card error case-access-error" role="alert"><h2>Sign in to open this private case</h2><p>The link does not grant access. Use the Google account that owns this follow-up.</p><GoogleSignIn onSignedIn={() => { setRefreshKey((value) => value + 1); }} /><button type="button" onClick={() => { setRefreshKey((value) => value + 1); }}>Try current session</button></section>;
  if (!detail) return <section className="card case-loading" role="status" aria-live="polite" aria-busy="true">
    <div className="eyebrow">Your follow-up</div>
    <h2>Opening the latest saved state…</h2>
    <p>Checking the case, company response and proof decision.</p>
    <div className="case-loading-steps" aria-hidden="true"><span /><span /><span /></div>
  </section>;
  const notification = detail.notifications.at(-1);
  return <div className="result-grid consumer-case-detail">
    {error ? <section className="card error refresh-warning" role="alert"><p>DueBack could not refresh. Your last saved state remains below.</p><button type="button" onClick={() => { setRefreshKey((value) => value + 1); }}>Try again</button></section> : null}
    {lastRefreshed ? <p className="last-updated">Last refreshed {new Intl.DateTimeFormat(undefined, { timeStyle: "medium" }).format(new Date(lastRefreshed))}</p> : null}
    <CaseStatus detail={detail} />
    <section className="case-channel-card" aria-label="How this follow-up communicates"><div><span>↗</span><p><small>CONTACT</small><strong>{detail.channel.contact}</strong></p></div><i aria-hidden="true">→</i><div><span>✓</span><p><small>REPLY</small><strong>{detail.channel.reply}</strong></p></div><i aria-hidden="true">→</i><div><span>●</span><p><small>YOUR UPDATE</small><strong>{detail.returnPath}</strong></p></div></section>
    <p className="preview-label">{detail.channel.disclosure} Recipient: {detail.channel.recipientHint}.</p>
    <section className={`card outcome ${detail.outcome.accepted ? "verified" : "waiting"}`}><div className="eyebrow">{detail.outcome.accepted ? "Evidence accepted" : "Still working"}</div><h2>{detail.outcome.title}</h2><p>{detail.outcome.explanation}</p><div className="claim-limit">{detail.outcome.limitation}</div></section>
    {notification ? <NotificationStatus caseId={caseId} notification={notification} onRetried={() => { setRefreshKey((value) => value + 1); }} /> : null}
    {detail.comparison.length ? <section className="card outcome-comparison" aria-labelledby="comparison-title"><div className="eyebrow">Proof check</div><h2 id="comparison-title">Promised vs. observed</h2><p>Missing facts stay missing; DueBack never copies them from the promise.</p><div className="comparison-table" role="table">{detail.comparison.map((row) => <div role="row" key={row.label} data-status={row.status}><strong role="cell">{row.label}</strong><span role="cell">{row.promised}</span><span role="cell">{row.observed}<small>{row.status === "MATCH" ? " Matches" : row.status === "MISSING" ? " Missing" : " Different"}</small></span></div>)}</div></section> : null}
    <section className="card case-conversation" aria-labelledby="conversation-title"><div className="eyebrow">Conversation</div><h2 id="conversation-title">What DueBack and the company said</h2>{detail.conversation.length ? <ol>{detail.conversation.map((entry) => <li key={entry.id} data-direction={entry.direction}><div><strong>{entry.title}</strong>{entry.occurredAt ? <time dateTime={entry.occurredAt}>{new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(entry.occurredAt))}</time> : null}</div><p className="conversation-body">{entry.safeBody}</p><p className="conversation-reason"><span>{entry.status.replaceAll("_", " ")}</span>{entry.reason}</p></li>)}</ol> : <p>DueBack has not contacted the company yet.</p>}</section>
    <section className="card"><h2>Case controls</h2><p>Stop future actions or report that an accepted result did not arrive.</p><a className="button-link" href={`/cases/${caseId}/exception`}>{detail.outcome.accepted ? "This isn't resolved" : "Review or stop this case"}</a></section>
    <details className="card technical-disclosure"><summary>Technical activity</summary><p>Consumer-safe lifecycle events; identifiers and private message content are not exposed.</p><ol>{detail.timeline.map((event) => <li key={event.eventId}><strong>{event.type.replaceAll("_", " ")}</strong> · {event.state.replaceAll("_", " ")} · <time dateTime={event.occurredAt}>{new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(event.occurredAt))}</time></li>)}</ol></details>
    {detail.technicalTraceEligible ? <TechnicalRun caseId={caseId} /> : null}<CaseExport caseId={caseId} />
  </div>;
}
