"use client";

import { useCallback, useEffect, useState } from "react";
import { anonymousIdToken } from "../lib/firebase-client";
import type { CaseSummary } from "../lib/cases-controller";
import { GoogleSignIn } from "./google-sign-in";

export function CaseInbox() {
  const [items, setItems] = useState<CaseSummary[]>();
  const [error, setError] = useState<string>();
  const load = useCallback(async () => {
    try {
      const token = await anonymousIdToken();
      const response = await fetch("/api/cases?limit=25", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const result = await response.json() as { items?: CaseSummary[]; error?: string };
      if (!response.ok || !result.items) throw new Error(result.error ?? "CASES_FAILED");
      setItems(result.items); setError(undefined);
    } catch { setError("We could not refresh your follow-ups. Sign in if you saved these cases on another device."); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  if (!items && !error) return <section className="card" role="status">Loading your follow-ups…</section>;
  return <div className="case-inbox">
    {error ? <section className="card error" role="alert"><p>{error}</p><GoogleSignIn compact onSignedIn={() => { void load(); }} /><button type="button" onClick={() => void load()}>Try again</button></section> : null}
    {items?.length === 0 ? <section className="card empty-state"><h2>No follow-ups in this session</h2><p>Sign in to recover cases saved with Google, or add a new company promise.</p><GoogleSignIn onSignedIn={() => { void load(); }} /><a className="button-link" href="/intake">Add a promise</a></section> : null}
    {items?.map((item) => <a className={`case-inbox-card ${item.attentionRequired ? "needs-you" : ""}`} href={`/cases/${item.caseId}/result`} key={item.caseId}>
      <div><span className="case-bucket">{item.bucket === "NEEDS_YOU" ? "Needs you" : item.bucket === "DONE" ? "Done" : "Working"}</span><small>{item.channelLabel}</small></div>
      <h2>{item.companyName}</h2><p className="case-outcome">{item.outcomeLabel}</p>
      <strong>{item.statusLabel}</strong><p>{item.nextStepLabel}</p>
      <small>Updated {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.lastActivityAt))}</small>
    </a>)}
  </div>;
}
