"use client";

import { useEffect, useState } from "react";
import type { FollowThroughCase } from "@dueback/runtime/case-runner";
import type { InterventionRecord } from "@dueback/runtime/interventions";
import { anonymousIdToken } from "../lib/firebase-client";

interface ExceptionPayload {
  case: FollowThroughCase;
  interventions: InterventionRecord[];
  error?: string;
}

export function CaseException({ caseId }: { readonly caseId: string }) {
  const [payload, setPayload] = useState<ExceptionPayload>();
  const [reason, setReason] = useState("The promised result did not actually arrive.");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function load() {
    const token = await anonymousIdToken();
    const response = await fetch(`/api/cases/${caseId}/result`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    });
    const result = (await response.json()) as ExceptionPayload;
    if (!response.ok) throw new Error(result.error ?? "CASE_LOAD_FAILED");
    setPayload(result);
  }

  useEffect(() => {
    void load().catch((cause: unknown) => {
      setError(cause instanceof Error ? cause.message : "CASE_LOAD_FAILED");
    });
  }, [caseId]);

  async function command(action: "STOP" | "REOPEN" | "RESUME" | "REVISE" | "DELETE") {
    if (!payload) return;
    setBusy(true);
    setError(undefined);
    try {
      const token = await anonymousIdToken();
      const response = await fetch(`/api/cases/${caseId}/control`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action, expectedVersion: payload.case.version, reason, idempotencyKey: crypto.randomUUID() })
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "CONTROL_FAILED");
      if (action === "DELETE") {
        window.location.assign("/intake?deleted=1");
        return;
      }
      if (action === "REVISE") {
        window.location.assign(`/cases/${caseId}/review`);
        return;
      }
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "CONTROL_FAILED");
    } finally {
      setBusy(false);
    }
  }

  if (error && !payload) return <section className="card error">{error}</section>;
  if (!payload) return <section className="card">Loading the decision…</section>;
  const latest = payload.interventions.at(-1);
  return (
    <div className="review-grid">
      <section className="card">
        <div className="eyebrow">Your decision is required</div>
        <h2>{latest?.question ?? (payload.case.state === "DONE" ? "Did the promised result actually arrive?" : "Should DueBack stop future actions?")}</h2>
        <p>
          {latest?.requestedField
            ? `Check only the ${latest.requestedField}. DueBack has not changed the approved plan.`
            : `Current state: ${payload.case.state}`}
        </p>
        {latest ? <code>{latest.reasonCodes.join(" · ")}</code> : null}
        {latest ? <p><strong>What happens next:</strong> {latest.consequence}</p> : null}
      </section>
      <section className="card">
        <h2>You remain in control</h2>
        <p>Stop prevents future actions. Delete removes this case and its nested records; actions already sent cannot be recalled.</p>
        {payload.case.state === "DONE" ? (
          <>
            <label htmlFor="reopen-reason">Why is this not resolved?</label>
            <textarea
              id="reopen-reason"
              value={reason}
              maxLength={500}
              onChange={(event) => {
                setReason(event.target.value);
              }}
            />
            <button disabled={busy || !reason.trim()} onClick={() => void command("REOPEN")}>
              This isn&apos;t resolved
            </button>
          </>
        ) : payload.case.state === "NEEDS_ATTENTION" ? latest?.allowedDecisions.includes("REVISE") ? (
          <button disabled={busy} onClick={() => void command("REVISE")}>
            Correct the approved plan
          </button>
        ) : (
          <button disabled={busy} onClick={() => void command("RESUME")}>
            Retry within the approved limits
          </button>
        ) : (
          <button disabled={busy} onClick={() => void command("STOP")}>
            Stop future actions
          </button>
        )}
        <button className="secondary" disabled={busy} onClick={() => {
          if (window.confirm("Delete this case and stop all future actions? Actions already sent cannot be recalled.")) void command("DELETE");
        }}>
          Delete this case
        </button>
        {error ? <p className="error">{error}</p> : null}
      </section>
    </div>
  );
}
