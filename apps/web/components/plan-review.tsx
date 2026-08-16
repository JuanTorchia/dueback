"use client";

import { useEffect, useRef, useState } from "react";
import type { DraftCase } from "@dueback/runtime/intake-service";
import type { PlanSimulation } from "@dueback/runtime/plan-service";
import { anonymousIdToken } from "../lib/firebase-client";
import { errorCopy } from "../lib/error-copy";

type PlanResponse = DraftCase & { error?: string };

export function PlanReview({ caseId }: { readonly caseId: string }) {
  const [draft, setDraft] = useState<DraftCase>();
  const [simulation, setSimulation] = useState<PlanSimulation>();
  const [amount, setAmount] = useState("");
  const [company, setCompany] = useState("");
  const [result, setResult] = useState("");
  const [currency, setCurrency] = useState("");
  const [reference, setReference] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState("");
  const statusRef = useRef<HTMLParagraphElement>(null);

  async function api(method: "GET" | "POST", body?: object): Promise<PlanResponse> {
    const token = await anonymousIdToken();
    const response = await fetch(`/api/cases/${caseId}/plan`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {})
      },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    const result = (await response.json()) as PlanResponse;
    if (!response.ok) throw new Error(result.error ?? "PLAN_REQUEST_FAILED");
    return result;
  }

  useEffect(() => {
    void api("GET")
      .then(setDraft)
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : "PLAN_REQUEST_FAILED");
      });
  }, [caseId]);

  async function command(body: object) {
    setBusy(true);
    setError(undefined);
    try {
      const next = await api("POST", body);
      setDraft(next);
      if ("action" in body && body.action === "revise") {
        setStatus(
          `Plan updated to version ${String(next.plan.version)}. Review the remaining highlighted fields.`
        );
        window.setTimeout(() => statusRef.current?.focus(), 0);
      }
      if ("action" in body && body.action === "approve" && next.state === "READY") {
        window.location.assign(`/cases/${caseId}/result`);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "PLAN_REQUEST_FAILED");
    } finally {
      setBusy(false);
    }
  }

  async function deleteDraft() {
    setBusy(true);
    setError(undefined);
    try {
      const token = await anonymousIdToken();
      const response = await fetch(`/api/cases/${caseId}/plan`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete" })
      });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "DRAFT_DELETE_FAILED");
      }
      window.location.assign("/intake");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "DRAFT_DELETE_FAILED");
      setBusy(false);
    }
  }

  async function simulate() {
    setBusy(true);
    setError(undefined);
    setStatus("Building a safe preview. Nothing is being sent.");
    try {
      const token = await anonymousIdToken();
      const response = await fetch(`/api/cases/${caseId}/plan`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "simulate" })
      });
      const body = (await response.json()) as PlanSimulation & { error?: string };
      if (!response.ok) throw new Error(body.error ?? "PLAN_REQUEST_FAILED");
      setSimulation(body);
      setStatus("Preview ready. Nothing was sent.");
      window.setTimeout(() => statusRef.current?.focus(), 0);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "PLAN_REQUEST_FAILED");
      setStatus("");
    } finally {
      setBusy(false);
    }
  }

  if (error && !draft)
    return (
      <div className="card error" role="alert">
        {errorCopy(error)}{" "}
        <button
          type="button"
          onClick={() => {
            window.location.reload();
          }}
        >
          Retry
        </button>
      </div>
    );
  if (!draft) return <div className="card">Building the cited Outcome Contract…</div>;
  const outcome = draft.outcomeContract;
  const fieldLabels: Record<string, string> = {
    promisor: "company name",
    result: "promised result",
    amountMinor: "amount",
    currency: "currency",
    transactionRef: "order or case reference",
    dueAt: "company deadline",
    followUpAt: "follow-up date"
  };
  const uncertainty = (field: { uncertainty: string; provenance: readonly { locator: string; excerpt?: string | undefined; confidence: string }[] } | undefined) =>
    field && field.uncertainty !== "NONE" ? (
      <div className="field-warning" role="note">
        <strong>{field.uncertainty === "CONTRADICTORY" ? "Conflicting information" : "Needs confirmation"}</strong>
        <span>Choose using the exact source evidence below.</span>
        {field.provenance.some((item) => item.excerpt) ? (
          <ul className="source-excerpts">
            {field.provenance.filter((item) => item.excerpt).map((item) => (
              <li key={`${item.locator}:${item.excerpt ?? ""}`}>“{item.excerpt}”</li>
            ))}
          </ul>
        ) : (
          <span>Open the original promise and confirm this value before continuing.</span>
        )}
      </div>
    ) : null;
  const saveRevision = (revision: Record<string, unknown>) =>
    command({ action: "revise", expectedPlanVersion: draft.plan.version, revision });

  return (
    <div className="review-grid">
      <section className="card">
        <div className="contract-heading">
          <div>
            <span className="status-dot" /> Outcome Contract · v{draft.plan.version}
          </div>
          <code>{draft.plan.planHash.slice(0, 18)}…</code>
        </div>
        <dl className="facts">
          <div>
            <dt>Responsible party</dt>
            <dd>{outcome?.responsibleParty ?? draft.promiseDraft.promisor.value}{uncertainty(draft.promiseDraft.promisor)}</dd>
          </div>
          <div>
            <dt>Outcome</dt>
            <dd>{outcome?.outcome ?? draft.plan.goal}{uncertainty(draft.promiseDraft.result)}</dd>
          </div>
          <div>
            <dt>Amount</dt>
            <dd>
              {draft.promiseDraft.currency?.value}{" "}
              {((draft.promiseDraft.amountMinor?.value ?? 0) / 100).toFixed(2)}
              {uncertainty(draft.promiseDraft.amountMinor)}
            </dd>
          </div>
          <div>
            <dt>Reference</dt>
            <dd>{draft.promiseDraft.transactionRef.value}{uncertainty(draft.promiseDraft.transactionRef)}</dd>
          </div>
          <div>
            <dt>Due</dt>
            <dd>
              {draft.promiseDraft.dueAt?.value ??
                draft.promiseDraft.dueCondition?.value ??
                "No company deadline found"}
              {uncertainty(draft.promiseDraft.dueAt ?? draft.promiseDraft.dueCondition)}
            </dd>
          </div>
          <div>
            <dt>Follow-up</dt>
            <dd>
              {draft.plan.followUpAt
                ? new Intl.DateTimeFormat(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short"
                  }).format(new Date(draft.plan.followUpAt))
                : "Choose when DueBack should follow up"}
            </dd>
          </div>
          <div>
            <dt>Done means</dt>
            <dd>{outcome?.proofRequired ?? "The merchant confirms the promised refund in signed evidence."}</dd>
          </div>
        </dl>
        {draft.blockingFields.length > 0 ? (
          <p className="warning">Before activation, confirm: {draft.blockingFields.map((field) => fieldLabels[field] ?? field).join(", ")}.</p>
        ) : null}
        {draft.blockingFields.includes("promisor") ? <details open><summary>Confirm the company name</summary><div className="inline-edit"><input aria-label="Company name" value={company} placeholder={draft.promiseDraft.promisor.value} onChange={(event) => { setCompany(event.target.value); }} /><button type="button" disabled={busy || !company.trim()} onClick={() => void saveRevision({ promisor: company.trim() })}>Confirm company</button></div></details> : null}
        {draft.blockingFields.includes("result") ? <details open><summary>Confirm the promised result</summary><div className="inline-edit"><input aria-label="Promised result" value={result} placeholder={draft.promiseDraft.result.value} onChange={(event) => { setResult(event.target.value); }} /><button type="button" disabled={busy || !result.trim()} onClick={() => void saveRevision({ result: result.trim() })}>Confirm result</button></div></details> : null}
        {draft.blockingFields.includes("amountMinor") ? <details open>
          <summary>Confirm the correct amount</summary>
          <div className="inline-edit">
            <input
              aria-label="Correct amount"
              inputMode="decimal"
              placeholder="79.00"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
              }}
            />
            <button
              type="button"
              disabled={busy || !amount}
              onClick={() => void saveRevision({ amountMinor: Math.round(Number(amount) * 100) })}
            >
              Save new version
            </button>
          </div>
        </details> : null}
        {draft.blockingFields.includes("currency") ? <details open><summary>Confirm the currency</summary><div className="inline-edit"><input aria-label="Currency" value={currency} maxLength={3} placeholder={draft.promiseDraft.currency?.value ?? "USD"} onChange={(event) => { setCurrency(event.target.value.toUpperCase()); }} /><button type="button" disabled={busy || !/^[A-Z]{3}$/.test(currency)} onClick={() => void saveRevision({ currency })}>Confirm currency</button></div></details> : null}
        {draft.blockingFields.includes("transactionRef") ? <details open><summary>Confirm the order or case reference</summary><div className="inline-edit"><input aria-label="Order or case reference" value={reference} placeholder={draft.promiseDraft.transactionRef.value} onChange={(event) => { setReference(event.target.value); }} /><button type="button" disabled={busy || !reference.trim()} onClick={() => void saveRevision({ transactionRef: reference.trim() })}>Confirm reference</button></div></details> : null}
        {draft.blockingFields.includes("followUpAt") ? <details open><summary>No company deadline was found — choose when DueBack should follow up</summary><p className="button-help">This is your follow-up date. DueBack will not claim the company promised it.</p><div className="inline-edit"><input aria-label="Follow-up date" type="datetime-local" value={dueAt} onChange={(event) => { setDueAt(event.target.value); }} /><button type="button" disabled={busy || !dueAt} onClick={() => void saveRevision({ followUpAt: new Date(dueAt).toISOString() })}>Confirm follow-up date</button></div></details> : null}
      </section>

      <section className="card boundaries">
        <h2>Before you delegate</h2>
        <p className="demo-warning"><strong>Demo only:</strong> this action goes to DueBack’s merchant simulator, not {draft.promiseDraft.promisor.value}. No real company will be contacted.</p>
        <div>
          <strong>DueBack may</strong>
          <p>Send one follow-up to {draft.plan.allowedRecipient} after the due time.</p>
        </div>
        <div>
          <strong>DueBack will never</strong>
          <p>Change the remedy, share extra data, spend money, or call this settled.</p>
        </div>
        <div>
          <strong>Data shared</strong>
          <p>Order/case reference, refund amount, and currency. No inbox access or extra fields.</p>
        </div>
        <div>
          <strong>It can close only when</strong>
          <p>
            Signed merchant evidence confirms this exact case, amount, currency, and reference.
            “Request received” is not completion. Merchant confirmation is not bank settlement.
          </p>
        </div>
        <button
          className="secondary"
          type="button"
          disabled={busy}
          onClick={() => {
            void simulate();
          }}
        >
          Simulate first
        </button>
        {simulation ? (
          <p className="simulation">
            Preview only. DueBack would send one follow-up to {simulation.recipient}. Nothing was sent.
          </p>
        ) : null}
        <button
          className="primary"
          type="button"
          disabled={busy || draft.activationBlocked || draft.state === "READY"}
          onClick={() => {
            void command({
              action: "approve",
              expectedPlanVersion: draft.plan.version,
              expectedPlanHash: draft.plan.planHash
            });
          }}
        >
          {draft.state === "READY" ? "Sandbox demo activated" : "Approve and activate sandbox demo"}
        </button>
        {draft.activationBlocked ? <p className="button-help">Activation stays locked until every highlighted field above is confirmed.</p> : null}
        <button
          className="text-button"
          type="button"
          disabled={busy || draft.state !== "AWAITING_APPROVAL"}
          onClick={() => {
            void command({ action: "reject", expectedPlanVersion: draft.plan.version });
          }}
        >
          Reject this plan
        </button>
        <button
          className="text-button danger"
          type="button"
          disabled={busy || draft.state === "READY"}
          onClick={() => {
            if (window.confirm("Delete this draft and its structured data?")) void deleteDraft();
          }}
        >
          Delete this draft
        </button>
        {error ? <p className="error" role="alert">{errorCopy(error)}</p> : null}
        <p className="sr-status" role="status" aria-live="polite" tabIndex={-1} ref={statusRef}>{status}</p>
      </section>
    </div>
  );
}
