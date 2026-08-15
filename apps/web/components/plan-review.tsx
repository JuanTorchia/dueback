"use client";

import { useEffect, useState } from "react";
import type { DraftCase } from "@dueback/runtime/intake-service";
import type { PlanSimulation } from "@dueback/runtime/plan-service";
import { anonymousIdToken } from "../lib/firebase-client";

type PlanResponse = DraftCase & { error?: string };

export function PlanReview({ caseId }: { readonly caseId: string }) {
  const [draft, setDraft] = useState<DraftCase>();
  const [simulation, setSimulation] = useState<PlanSimulation>();
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

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
      if ("action" in body && body.action === "approve" && next.state === "READY") {
        window.location.assign(`/cases/${caseId}/result`);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "PLAN_REQUEST_FAILED");
    } finally {
      setBusy(false);
    }
  }

  async function simulate() {
    const token = await anonymousIdToken();
    const response = await fetch(`/api/cases/${caseId}/plan`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ action: "simulate" })
    });
    setSimulation((await response.json()) as PlanSimulation);
  }

  if (error && !draft) return <div className="card error">{error}</div>;
  if (!draft) return <div className="card">Building the cited Promise Contract…</div>;
  const requirement = draft.plan.evidenceRequirements[0];

  return (
    <div className="review-grid">
      <section className="card">
        <div className="contract-heading">
          <div>
            <span className="status-dot" /> Promise Contract · v{draft.plan.version}
          </div>
          <code>{draft.plan.planHash.slice(0, 18)}…</code>
        </div>
        <dl className="facts">
          <div>
            <dt>Company</dt>
            <dd>{draft.promiseDraft.promisor.value}</dd>
          </div>
          <div>
            <dt>Promised result</dt>
            <dd>{draft.plan.goal}</dd>
          </div>
          <div>
            <dt>Amount</dt>
            <dd>
              {draft.promiseDraft.currency?.value}{" "}
              {((draft.promiseDraft.amountMinor?.value ?? 0) / 100).toFixed(2)}
            </dd>
          </div>
          <div>
            <dt>Reference</dt>
            <dd>{draft.promiseDraft.transactionRef.value}</dd>
          </div>
          <div>
            <dt>Due</dt>
            <dd>
              {draft.promiseDraft.dueAt?.value ??
                draft.promiseDraft.dueCondition?.value ??
                "Needs your input"}
            </dd>
          </div>
          <div>
            <dt>Done means</dt>
            <dd>{requirement?.minimumLevel ?? "Undefined"}</dd>
          </div>
        </dl>
        {draft.blockingFields.length > 0 ? (
          <p className="warning">Resolve before activation: {draft.blockingFields.join(", ")}</p>
        ) : null}
        <details>
          <summary>Correct the amount</summary>
          <div className="inline-edit">
            <input
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
              onClick={() => {
                void command({
                  action: "revise",
                  expectedPlanVersion: draft.plan.version,
                  revision: { amountMinor: Math.round(Number(amount) * 100) }
                });
              }}
            >
              Save new version
            </button>
          </div>
        </details>
      </section>

      <section className="card boundaries">
        <h2>Before you delegate</h2>
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
          <p>{draft.plan.sharedFields.join(", ")}</p>
        </div>
        <div>
          <strong>It can close only when</strong>
          <p>
            Signed evidence matches this case, amount, currency, reference, freshness, and{" "}
            {requirement?.minimumLevel}.
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
            Simulation only: {simulation.action} → {simulation.recipient}. External action
            performed: no.
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
          {draft.state === "READY" ? "Plan activated" : "Approve and activate"}
        </button>
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
        {error ? <p className="error">{error}</p> : null}
      </section>
    </div>
  );
}
