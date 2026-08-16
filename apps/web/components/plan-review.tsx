"use client";

import { useEffect, useRef, useState } from "react";
import type { DraftCase } from "@dueback/runtime/intake-service";
import type { PlanSimulation } from "@dueback/runtime/plan-service";
import { anonymousIdToken } from "../lib/firebase-client";
import { errorCopy } from "../lib/error-copy";

type PlanResponse = DraftCase & { error?: string };

export function PlanReview({
  caseId,
  contactMode
}: {
  readonly caseId: string;
  readonly contactMode: "sandbox" | "email";
}) {
  const [draft, setDraft] = useState<DraftCase>();
  const [simulation, setSimulation] = useState<PlanSimulation>();
  const [amount, setAmount] = useState("");
  const [company, setCompany] = useState("");
  const [result, setResult] = useState("");
  const [currency, setCurrency] = useState("");
  const [reference, setReference] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [recipient, setRecipient] = useState("");
  const [legitimateContact, setLegitimateContact] = useState(false);
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
  const dateTime = (value: string) =>
    new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(value)
    );
  const fieldLabels: Record<string, string> = {
    promisor: "company name",
    result: "promised result",
    amountMinor: "amount",
    currency: "currency",
    transactionRef: "order or case reference",
    dueAt: "company deadline",
    followUpAt: "follow-up date",
    allowedRecipient: "company support email"
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
  const referenceValue = draft.promiseDraft.transactionRef.value;
  const amountValue = `${draft.promiseDraft.currency?.value ?? ""} ${((draft.promiseDraft.amountMinor?.value ?? 0) / 100).toFixed(2)}`.trim();
  const followUpSubject = draft.plan.messageSubject ?? `Follow-up for ${referenceValue}`;
  const followUpBody = draft.plan.messageBody;

  return (
    <div className="review-grid">
      <nav className="review-steps" aria-label="Case progress">
        <div data-complete="true"><span>✓</span><strong>Evidence read</strong></div>
        <div data-current="true"><span>2</span><strong>Review & approve</strong></div>
        <div><span>3</span><strong>DueBack follows through</strong></div>
      </nav>
      <section className="card contract-card">
        <div className="review-readiness" data-ready={!draft.activationBlocked}>
          <span aria-hidden="true">{draft.activationBlocked ? "!" : "✓"}</span>
          <div>
            <strong>{draft.activationBlocked ? `${String(draft.blockingFields.length)} details need you` : "Ready for your approval"}</strong>
            <p>{draft.activationBlocked ? "Confirm the highlighted information below." : "Gemini found the critical details. Check them before delegating."}</p>
          </div>
        </div>
        <div className="contract-heading">
          <div>
            <span className="status-dot" /> Outcome Contract · v{draft.plan.version}
          </div>
        </div>
        <h2 className="contract-outcome">{outcome?.outcome ?? draft.plan.goal}</h2>
        <p className="contract-owner">Responsible party · <strong>{outcome?.responsibleParty ?? draft.promiseDraft.promisor.value}</strong></p>
        <dl className="facts">
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
              {draft.promiseDraft.dueAt?.value
                ? dateTime(draft.promiseDraft.dueAt.value)
                : draft.promiseDraft.dueCondition?.value ?? "No company deadline found"}
              {uncertainty(draft.promiseDraft.dueAt ?? draft.promiseDraft.dueCondition)}
            </dd>
          </div>
          <div>
            <dt>Follow-up</dt>
            <dd>
              {draft.plan.followUpAt
                ? dateTime(draft.plan.followUpAt)
                : "Choose when DueBack should follow up"}
            </dd>
          </div>
        </dl>
        {uncertainty(draft.promiseDraft.promisor)}
        {uncertainty(draft.promiseDraft.result)}
        <div className="proof-callout">
          <span aria-hidden="true">✓</span>
          <div><strong>What counts as done</strong><p>{outcome?.proofRequired ?? "The merchant confirms the promised refund in signed evidence."}</p></div>
        </div>
        <details className="technical-details">
          <summary>Technical contract details</summary>
          <code>Plan v{draft.plan.version} · {draft.plan.planHash}</code>
        </details>
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
        <div className="delegate-heading">
          <span>Controlled delegation</span>
          <h2>Approve the conversation</h2>
          <p>See the channel, recipient, first message, and return path before anything leaves DueBack.</p>
        </div>
        <div className="channel-plan">
          <div className="channel-plan-heading">
            <span>1</span><div><strong>How DueBack contacts them</strong><p>One channel is authorized for this case.</p></div>
          </div>
          <div className="channel-options" role="list" aria-label="Contact channel availability">
            <div role="listitem" data-active={contactMode === "email"}><span>✉</span><strong>Email</strong><small>{contactMode === "email" ? "Outbound active" : "Ready to connect"}</small></div>
            <div role="listitem" data-active={contactMode === "sandbox"}><span>↗</span><strong>Demo API</strong><small>{contactMode === "sandbox" ? "Live now" : "Test mode"}</small></div>
            <div role="listitem"><span>▤</span><strong>Web form</strong><small>Next adapter</small></div>
            <div role="listitem"><span>◉</span><strong>WhatsApp</strong><small>Next adapter</small></div>
          </div>
        </div>
        <div className="message-preview">
          <div className="message-preview-heading"><span>2</span><div><strong>The first follow-up</strong><p>This exact scope is bound to your approval.</p></div></div>
          <dl>
            <div><dt>To</dt><dd>{draft.plan.allowedRecipient}</dd></div>
            <div><dt>From</dt><dd>{draft.plan.senderIdentity ?? "DueBack controlled demo"}</dd></div>
            <div><dt>Replies</dt><dd>{draft.plan.replyRoute ?? "Signed callback"}</dd></div>
            <div><dt>Subject</dt><dd>{followUpSubject}</dd></div>
          </dl>
          <div className="email-body">
            {followUpBody ? <p className="preserve-lines">{followUpBody}</p> : <>
              <p>Hello,</p>
              <p>DueBack is following up on an outcome requested by your customer.</p>
              <p><strong>Reference:</strong> {referenceValue}<br /><strong>Amount:</strong> {amountValue}</p>
              <p>Please reply with the current status and verifiable confirmation when the outcome is complete.</p>
              <p className="email-rule">An acknowledgement that the request was received will not be treated as completion.</p>
            </>}
          </div>
          <div className="follow-up-policy"><span>Up to {draft.plan.maxLogicalSends ?? 3} sends</span><span>Every {Math.round((draft.plan.followUpIntervalSeconds ?? 172800) / 86400)} days</span><span>Stops for decisions</span></div>
          {contactMode === "email" ? (
            <details><summary>Change the company email</summary><div className="inline-edit"><input type="email" aria-label="Company support email" value={recipient} placeholder={draft.plan.allowedRecipient} onChange={(event) => { setRecipient(event.target.value); }} /><button type="button" disabled={busy || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)} onClick={() => void saveRevision({ allowedRecipient: recipient.trim() })}>Save recipient</button></div></details>
          ) : null}
        </div>
        <div className="permission-list">
          <div><span className="permission-icon">→</span><div><strong>Action</strong><p>Send one follow-up after the due time.</p></div></div>
          <div><span className="permission-icon">○</span><div><strong>Recipient</strong><p>{draft.plan.allowedRecipient}</p></div></div>
          <div><span className="permission-icon">↗</span><div><strong>Contact channel</strong><p>{contactMode === "email" ? "Verified outbound email with a case-specific reply address. Automated reply processing requires the inbound webhook." : "Controlled HTTP merchant adapter in this public demo."}</p></div></div>
          <div><span className="permission-icon">⊘</span><div><strong>DueBack will never</strong><p>Change the outcome, share extra data, spend money, or claim bank settlement.</p></div></div>
          <div><span className="permission-icon">✓</span><div><strong>Proof required</strong><p>Signed evidence matching this case, amount, currency, and reference. “Request received” is not completion.</p></div></div>
        </div>
        <details className="shared-data"><summary>Exactly what data will be shared</summary><p>Order/case reference, refund amount, and currency. No inbox access or extra fields.</p></details>
        {contactMode === "sandbox" ? <p className="demo-warning"><strong>Controlled demo:</strong> the action goes to DueBack’s merchant simulator, not {draft.promiseDraft.promisor.value}. No real company will be contacted.</p> : null}
        <div className="return-promise"><strong>3 · How the result comes back to you</strong><p>The case page updates automatically. Decisions and verified results can also use the outbound notification adapter when a verified user address is configured.</p></div>
        <label className="legitimate-contact">
          <input type="checkbox" checked={legitimateContact} onChange={(event) => { setLegitimateContact(event.target.checked); }} />
          <span><strong>I’m authorized to contact this recipient</strong><small>This is a legitimate follow-up about my own case—not bulk outreach, threats, or unsolicited marketing.</small></span>
        </label>
        <button
          className="secondary"
          type="button"
          disabled={busy}
          onClick={() => {
            void simulate();
          }}
        >
          Preview the follow-up
        </button>
        {simulation ? (
          <p className="simulation">
            Preview only. DueBack would send one follow-up to {simulation.recipient}. Nothing was sent.
          </p>
        ) : null}
        <button
          className="primary"
          type="button"
          disabled={busy || draft.activationBlocked || draft.state === "READY" || !legitimateContact}
          onClick={() => {
            void command({
              action: "approve",
              expectedPlanVersion: draft.plan.version,
              expectedPlanHash: draft.plan.planHash
            });
          }}
        >
          {draft.state === "READY" ? "Follow-up activated" : "Approve and start follow-up"}
        </button>
        {draft.activationBlocked ? <p className="button-help">Activation stays locked until every highlighted field above is confirmed.</p> : !legitimateContact ? <p className="button-help">Confirm that this is an authorized, legitimate contact before activation.</p> : null}
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
