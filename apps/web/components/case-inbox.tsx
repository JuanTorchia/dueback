"use client";

import { useCallback, useEffect, useState } from "react";
import { anonymousIdToken, recoverableIdentity } from "../lib/firebase-client";
import type { CaseSummary } from "../lib/cases-controller";
import { emptyInboxPresentation, type InboxIdentity } from "../lib/inbox-presentation";
import { GoogleSignIn } from "./google-sign-in";

export function CaseInbox() {
  const [items, setItems] = useState<CaseSummary[]>();
  const [identity, setIdentity] = useState<InboxIdentity>();
  const [error, setError] = useState<string>();
  const load = useCallback(async () => {
    try {
      const [token, currentIdentity] = await Promise.all([anonymousIdToken(), recoverableIdentity()]);
      const response = await fetch("/api/cases?limit=25", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const result = await response.json() as { items?: CaseSummary[]; error?: string };
      if (!response.ok || !result.items) throw new Error(result.error ?? "CASES_FAILED");
      setItems(result.items); setIdentity(currentIdentity); setError(undefined);
    } catch { setError("We could not refresh your follow-ups. Sign in if you saved these cases on another device."); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  if (!items && !error) return <section className="card" role="status">Loading your follow-ups…</section>;
  const empty = identity ? emptyInboxPresentation(identity) : undefined;
  return <div className="case-inbox">
    {error ? <section className="card error" role="alert"><p>{error}</p>{identity?.isAnonymous !== false ? <GoogleSignIn compact onSignedIn={() => { void load(); }} /> : null}<button type="button" onClick={() => void load()}>Try again</button></section> : null}
    {items?.length === 0 && empty ? <section className="card empty-state"><h2>{empty.heading}</h2><p>{empty.message}</p>{empty.showSignIn ? <GoogleSignIn onSignedIn={() => { void load(); }} /> : <p className="identity-confirmation"><span aria-hidden="true">✓</span> Google access is active on this device.</p>}<a className="button-link" href="/intake">Add a promise</a></section> : null}
    {items?.map((item) => <a className={`case-inbox-card ${item.attentionRequired ? "needs-you" : ""}`} href={`/cases/${item.caseId}/result`} key={item.caseId}>
      <div><span className="case-bucket">{item.bucket === "NEEDS_YOU" ? "Needs you" : item.bucket === "DONE" ? "Done" : "Working"}</span><small>{item.channelLabel}</small></div>
      <h2>{item.companyName}</h2><p className="case-outcome">{item.outcomeLabel}</p>
      <strong>{item.statusLabel}</strong><p>{item.nextStepLabel}</p>
      <small>Updated {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.lastActivityAt))}</small>
    </a>)}
  </div>;
}
