"use client";

import { useCallback, useEffect, useState } from "react";
import { anonymousIdToken, recoverableIdentity } from "../lib/firebase-client";
import type { CaseSummary } from "../lib/cases-controller";
import { emptyInboxPresentation, type InboxIdentity } from "../lib/inbox-presentation";
import { GoogleSignIn } from "./google-sign-in";

export function CaseInbox() {
  const [items, setItems] = useState<CaseSummary[]>();
  const [identity, setIdentity] = useState<InboxIdentity>();
  const [nextCursor, setNextCursor] = useState<string | null>();
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string>();
  const load = useCallback(async (cursor?: string) => {
    if (cursor) setLoadingMore(true);
    try {
      const [token, currentIdentity] = await Promise.all([anonymousIdToken(), recoverableIdentity()]);
      const query = new URLSearchParams({ limit: "25" });
      if (cursor) query.set("cursor", cursor);
      const response = await fetch(`/api/cases?${query}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const result = await response.json() as { items?: CaseSummary[]; nextCursor?: string | null; error?: string };
      if (!response.ok || !result.items) throw new Error(result.error ?? "CASES_FAILED");
      const pageItems = result.items;
      setItems((current) => cursor && current ? [...current, ...pageItems] : pageItems);
      setNextCursor(result.nextCursor ?? null); setIdentity(currentIdentity); setError(undefined);
    } catch { setError(cursor ? "We could not load more follow-ups. Your current list is still here." : "We could not refresh your follow-ups. Sign in if you saved these cases on another device."); }
    finally { setLoadingMore(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  if (!items && !error) return <section className="card inbox-loading" role="status" aria-live="polite" aria-busy="true">
    <div><span className="case-bucket">Working</span><small>Checking saved cases</small></div>
    <h2>Opening your follow-ups…</h2>
    <p>Loading the latest company activity and decisions.</p>
    <div className="case-loading-steps" aria-hidden="true"><span /><span /><span /></div>
  </section>;
  const empty = identity ? emptyInboxPresentation(identity) : undefined;
  return <div className="case-inbox">
    {items && items.length > 0 ? <section className="inbox-summary" aria-label="Follow-up summary">
      <p><strong>{items.filter((item) => item.bucket === "WORKING").length}</strong><span>Working</span></p>
      <p><strong>{items.filter((item) => item.bucket === "NEEDS_YOU").length}</strong><span>Need you</span></p>
      <p><strong>{items.filter((item) => item.bucket === "DONE").length}</strong><span>Done</span></p>
      {identity?.email ? <small>Signed in as {identity.email}</small> : null}
    </section> : null}
    {error ? <section className="card error" role="alert"><p>{error}</p>{identity?.isAnonymous !== false ? <GoogleSignIn compact onSignedIn={() => { void load(); }} /> : null}<button type="button" onClick={() => void load()}>Try again</button></section> : null}
    {items?.length === 0 && empty ? <section className="card empty-state"><h2>{empty.heading}</h2><p>{empty.message}</p>{empty.showSignIn ? <GoogleSignIn onSignedIn={() => { void load(); }} /> : <p className="identity-confirmation"><span aria-hidden="true">✓</span> Google access is active on this device.</p>}<a className="button-link" href="/intake">Add a promise</a></section> : null}
    {items?.map((item) => <a className={`case-inbox-card ${item.attentionRequired ? "needs-you" : ""}`} href={`/cases/${item.caseId}/result`} key={item.caseId}>
      <div><span className="case-bucket">{item.bucket === "NEEDS_YOU" ? "Needs you" : item.bucket === "DONE" ? "Done" : "Working"}</span><small>{item.channelLabel}</small></div>
      <h2>{item.companyName}</h2><p className="case-outcome">{item.outcomeLabel}</p>
      <strong>{item.statusLabel}</strong><p>{item.nextStepLabel}</p>
      <small>Updated {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.lastActivityAt))}</small>
    </a>)}
    {nextCursor ? <button type="button" className="secondary inbox-load-more" disabled={loadingMore} onClick={() => { void load(nextCursor); }}>{loadingMore ? "Loading more…" : "Load more follow-ups"}</button> : null}
  </div>;
}
