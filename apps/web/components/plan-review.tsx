"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DraftCase } from "@dueback/runtime/intake-service";
import type { PlanSimulation } from "@dueback/runtime/plan-service";
import type { ChannelCapability } from "@dueback/contracts";
import { anonymousIdToken } from "../lib/firebase-client";
import { errorCopy } from "../lib/error-copy";
import { RecoverableIdentity } from "./recoverable-identity";

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
  const [promisedDueAt, setPromisedDueAt] = useState("");
  const [followUpAt, setFollowUpAt] = useState("");
  const [recipient, setRecipient] = useState("");
  const [notificationRecipient, setNotificationRecipient] = useState("");
  const [legitimateContact, setLegitimateContact] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState("");
  const [recoverable, setRecoverable] = useState(false);
  const [verifiedOwnerEmail, setVerifiedOwnerEmail] = useState<string>();
  const [capabilities, setCapabilities] = useState<ChannelCapability[]>([]);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const identityChange = useCallback((value: boolean, email?: string) => {
    setRecoverable(value);
    setVerifiedOwnerEmail(email);
    if (email) setNotificationRecipient(email);
  }, []);

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

  useEffect(() => {
    void fetch("/api/channels", { cache: "no-store" })
      .then(async (response) => response.ok ? await response.json() as ChannelCapability[] : [])
      .then(setCapabilities);
  }, []);

  useEffect(() => {
    if (!draft) return;
    const localDateTime = (value: string | undefined) => {
      if (!value) return "";
      const date = new Date(value);
      const offset = date.getTimezoneOffset() * 60_000;
      return new Date(date.getTime() - offset).toISOString().slice(0, 16);
    };
    setCompany(draft.promiseDraft.promisor.value);
    setResult(draft.promiseDraft.result.value);
    setAmount(draft.promiseDraft.amountMinor
      ? (draft.promiseDraft.amountMinor.value / 100).toFixed(2)
      : "");
    setCurrency(draft.promiseDraft.currency?.value ?? "");
    setReference(draft.promiseDraft.transactionRef.value);
    setPromisedDueAt(localDateTime(draft.promiseDraft.dueAt?.value));
    setFollowUpAt(localDateTime(draft.plan.followUpAt ?? draft.promiseDraft.dueAt?.value));
    setRecipient(draft.plan.allowedRecipient);
    setNotificationRecipient(draft.plan.notificationRecipient ?? "");
  }, [draft?.plan.version]);

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
      if ("action" in body && body.action === "select-channel") {
        setStatus(`Contact channel changed. Plan updated to version ${String(next.plan.version)}; review the new sender, recipient, and return path.`);
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
  const parsedAmount = Number(amount);
  const monetaryPromise = Boolean(draft.promiseDraft.amountMinor && draft.promiseDraft.currency);
  const contractEditValid = Boolean(
    company.trim() && result.trim() && reference.trim() && (followUpAt || promisedDueAt) &&
    (!monetaryPromise || amount) &&
    (!amount || (Number.isFinite(parsedAmount) && parsedAmount >= 0 && /^[A-Z]{3}$/.test(currency)))
  );
  const saveContract = () => void saveRevision({
    promisor: company.trim(),
    result: result.trim(),
    amountMinor: amount ? Math.round(parsedAmount * 100) : null,
    currency: amount ? currency : null,
    transactionRef: reference.trim(),
    dueAt: promisedDueAt ? new Date(promisedDueAt).toISOString() : null,
    followUpAt: new Date(followUpAt || promisedDueAt).toISOString()
  });
  const referenceValue = draft.promiseDraft.transactionRef.value;
  const amountValue = draft.promiseDraft.amountMinor && draft.promiseDraft.currency
    ? `${draft.promiseDraft.currency.value} ${(draft.promiseDraft.amountMinor.value / 100).toFixed(2)}`
    : "No monetary amount in this promise";
  const followUpSubject = draft.plan.messageSubject ?? `Follow-up for ${referenceValue}`;
  const followUpBody = draft.plan.messageBody;
  const activeChannelType = draft.plan.channelType ??
    (contactMode === "email" ? "MANAGED_EMAIL" : "CONTROLLED_SANDBOX");
  const activeCapability = capabilities.find((item) => item.channelType === activeChannelType);
  const chooseChannel = (channelType: "CONTROLLED_SANDBOX" | "MANAGED_EMAIL") => {
    if (channelType === activeChannelType) return;
    void command({
      action: "select-channel",
      expectedPlanVersion: draft.plan.version,
      revision: { channelType }
    });
  };

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
              {draft.promiseDraft.amountMinor && draft.promiseDraft.currency
                ? `${draft.promiseDraft.currency.value} ${(draft.promiseDraft.amountMinor.value / 100).toFixed(2)}`
                : "Not applicable"}
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
              {draft.plan.executionMode === "ACCELERATED_DEMO"
                ? "Accelerated after approval"
                : draft.plan.followUpAt
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
        <details className="contract-editor" open={draft.activationBlocked}>
          <summary>{draft.activationBlocked ? "Fix the details Gemini could not confirm" : "Edit what Gemini understood"}</summary>
          <p>Correct any detail before delegating. Saving creates a new version and invalidates the previous approval hash.</p>
          <div className="contract-editor-grid">
            <label>Company<input aria-label="Company name" value={company} onChange={(event) => { setCompany(event.target.value); }} /></label>
            <label>Promised result<input aria-label="Promised result" value={result} onChange={(event) => { setResult(event.target.value); }} /></label>
            <label>Amount<input aria-label="Correct amount" inputMode="decimal" placeholder={monetaryPromise ? "Required" : "Not applicable"} value={amount} onChange={(event) => { setAmount(event.target.value); }} /></label>
            <label>Currency<input aria-label="Currency" value={currency} maxLength={3} placeholder={monetaryPromise ? "Required" : "Not applicable"} onChange={(event) => { setCurrency(event.target.value.toUpperCase()); }} /></label>
            <label>Order or case reference<input aria-label="Order or case reference" value={reference} onChange={(event) => { setReference(event.target.value); }} /></label>
            <label>Company deadline<input aria-label="Company deadline" type="datetime-local" value={promisedDueAt} onChange={(event) => { setPromisedDueAt(event.target.value); }} /></label>
            <label>DueBack follows up<input aria-label="Follow-up date" type="datetime-local" value={followUpAt} onChange={(event) => { setFollowUpAt(event.target.value); }} /></label>
          </div>
          <button className="secondary save-contract" type="button" disabled={busy || !contractEditValid} onClick={saveContract}>Save corrected contract</button>
          {!contractEditValid ? <p className="button-help">Company, result, reference, and follow-up date are required. Refunds also require an amount and three-letter currency.</p> : null}
        </details>
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
          <div className="channel-options" role="group" aria-label="Choose a contact channel">
            {(["MANAGED_EMAIL", "CONTROLLED_SANDBOX"] as const).map((channelType) => {
              const capability = capabilities.find((item) => item.channelType === channelType);
              const selected = activeChannelType === channelType;
              const available = capability?.status === "AVAILABLE" && capability.canSend;
              return <button
                key={channelType}
                type="button"
                className="channel-option"
                aria-pressed={selected}
                disabled={busy || !available}
                data-active={selected}
                onClick={() => { chooseChannel(channelType); }}
              >
                <span aria-hidden="true">{channelType === "MANAGED_EMAIL" ? "✉" : "↗"}</span>
                <strong>{channelType === "MANAGED_EMAIL" ? "Controlled email pilot" : "Accelerated proof demo"}</strong>
                <small>{selected ? "Selected" : available ? "Available" : "Unavailable — setup required"}</small>
              </button>;
            })}
          </div>
          <p className="button-help">The proof demo is reproducible but contacts no company. The email pilot crosses a real mail boundary, only with approved test addresses.</p>
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
          <div className="follow-up-policy"><span>Up to {draft.plan.maxLogicalSends ?? 3} sends</span><span>{draft.plan.executionMode === "ACCELERATED_DEMO" ? "Seconds apart in this demo" : `Every ${String(Math.round((draft.plan.followUpIntervalSeconds ?? 172800) / 86400))} days`}</span><span>Stops for decisions</span></div>
          {activeChannelType === "MANAGED_EMAIL" ? (
            <details><summary>Change the company email</summary><div className="inline-edit"><input type="email" aria-label="Company support email" value={recipient} placeholder={draft.plan.allowedRecipient} onChange={(event) => { setRecipient(event.target.value); }} /><button type="button" disabled={busy || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)} onClick={() => void saveRevision({ allowedRecipient: recipient.trim() })}>Save recipient</button></div></details>
          ) : null}
        </div>
        <div className="approval-decision" aria-label="Approval decision">
          <strong>Before you start</strong>
          <p>DueBack will contact {activeChannelType === "MANAGED_EMAIL" ? draft.plan.allowedRecipient : "only its demo merchant"}, share {monetaryPromise ? "the reference, amount, and currency" : "the reference and promised outcome"}, make up to {draft.plan.maxLogicalSends ?? 3} attempts, and stop for decisions. It cannot spend, change the outcome, or call an acknowledgement done.</p>
        </div>
        <details className="approval-details">
          <summary>Review every approved limit</summary>
          <div className="permission-list approval-summary" aria-label="Full approval limits">
          <div><span className="permission-icon">1</span><div><strong>Request</strong><p>{draft.plan.goal}</p></div></div>
          <div><span className="permission-icon">2</span><div><strong>Contact</strong><p>{draft.plan.allowedRecipient} via {activeChannelType === "MANAGED_EMAIL" ? "managed email" : "controlled demo API"}.</p></div></div>
          <div><span className="permission-icon">3</span><div><strong>Timing</strong><p>{draft.plan.executionMode === "ACCELERATED_DEMO" ? "Runs in seconds after approval for this demo." : `First follow-up ${draft.plan.followUpAt ? dateTime(draft.plan.followUpAt) : "after the due time"}.`}</p></div></div>
          <div><span className="permission-icon">4</span><div><strong>Limits</strong><p>Up to {draft.plan.maxLogicalSends ?? 3} sends. No spending, outcome changes, extra data, or bank-settlement claims.</p></div></div>
          <div><span className="permission-icon">5</span><div><strong>Done only with proof</strong><p>{monetaryPromise ? "Signed evidence matching this case, amount, currency, and reference." : "Signed evidence matching this case, reference, and promised outcome."} “Request received” is not completion.</p></div></div>
          </div>
        </details>
        <details className="shared-data" open><summary>Exactly what data will be shared—and with whom</summary><p>{monetaryPromise ? "DueBack shares the order/case reference, amount, and currency" : "DueBack shares the case reference and promised outcome"} only with {activeChannelType === "MANAGED_EMAIL" ? draft.plan.allowedRecipient : "the controlled demo merchant"}. No inbox access or extra fields.</p></details>
        {activeChannelType === "CONTROLLED_SANDBOX" ? <p className="demo-warning"><strong>Accelerated controlled demo:</strong> after approval, real Cloud Tasks and the isolated merchant adapter run in seconds instead of waiting for the promised date. The action goes to DueBack’s simulator, not {draft.promiseDraft.promisor.value}; no real company will be contacted.</p> : null}
        <div className="return-promise">
          <strong>3 · How the result comes back to you</strong>
          <p>The case page always updates. For real email follow-ups, updates can go only to the verified email on your Google identity.</p>
          <div className="inline-edit">
            <input
              type="email"
              aria-label="Email for DueBack case updates"
              value={notificationRecipient}
              placeholder={draft.plan.notificationRecipient ?? "you@example.com"}
              onChange={(event) => { setNotificationRecipient(event.target.value); }}
              readOnly={activeChannelType === "MANAGED_EMAIL" && Boolean(verifiedOwnerEmail)}
            />
            <button
              type="button"
              disabled={busy || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notificationRecipient) || (activeChannelType === "MANAGED_EMAIL" && notificationRecipient.toLowerCase() !== verifiedOwnerEmail?.toLowerCase())}
              onClick={() => void saveRevision({ notificationRecipient: notificationRecipient.trim() })}
            >Save update email</button>
          </div>
          <small>{draft.plan.notificationRecipient ? `Updates configured for ${draft.plan.notificationRecipient}.` : activeChannelType === "MANAGED_EMAIL" ? "Link Google, then save its verified email for updates." : "Optional for the controlled demo."}</small>
        </div>
        <label className="legitimate-contact">
          <input type="checkbox" checked={legitimateContact} onChange={(event) => { setLegitimateContact(event.target.checked); }} />
          <span><strong>I’m authorized to contact this recipient</strong><small>This is a legitimate follow-up about my own case—not bulk outreach, threats, or unsolicited marketing.</small></span>
        </label>
        <RecoverableIdentity
          required={activeChannelType === "MANAGED_EMAIL"}
          onChange={identityChange}
        />
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
          disabled={busy || draft.activationBlocked || draft.state === "READY" || !legitimateContact || activeCapability?.status !== "AVAILABLE" || (activeChannelType === "MANAGED_EMAIL" && !recoverable)}
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
        {draft.activationBlocked ? <p className="button-help">Activation stays locked until every highlighted field above is confirmed.</p> : activeCapability?.status !== "AVAILABLE" ? <p className="button-help">This channel cannot be activated until its required configuration and health gates pass.</p> : !legitimateContact ? <p className="button-help">Confirm that this is an authorized, legitimate contact before activation.</p> : activeChannelType === "MANAGED_EMAIL" && !recoverable ? <p className="button-help">Save recoverable access before activating a real email follow-up.</p> : null}
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
