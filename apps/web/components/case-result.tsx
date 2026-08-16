"use client";

import { useEffect, useState } from "react";
import type { FollowThroughCase } from "@dueback/runtime/case-runner";
import type { EvidenceRecord } from "@dueback/runtime/evidence-service";
import type { RuntimeTimelineEvent } from "@dueback/runtime/timeline";
import type { NotificationRecord } from "@dueback/runtime/notifications";
import { anonymousIdToken } from "../lib/firebase-client";
import { CaseTimeline } from "./case-timeline";

interface ResultPayload {
  case: FollowThroughCase;
  evidence: EvidenceRecord[];
  events?: RuntimeTimelineEvent[];
  notifications?: NotificationRecord[];
  error?: string;
}

export function CaseResult({ caseId }: { readonly caseId: string }) {
  const [payload, setPayload] = useState<ResultPayload>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const load = async () => {
      try {
        const token = await anonymousIdToken();
        const response = await fetch(`/api/cases/${caseId}/result`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store"
        });
        const result = (await response.json()) as ResultPayload;
        if (!response.ok) throw new Error(result.error ?? "RESULT_FAILED");
        if (cancelled) return;
        setPayload(result);
        setError(undefined);
        if (!["DONE", "CANCELLED", "NEEDS_ATTENTION"].includes(result.case.state)) {
          timeout = setTimeout(() => void load(), 2_000);
        }
      } catch (cause: unknown) {
        if (cancelled) return;
        setError(cause instanceof Error ? cause.message : "RESULT_FAILED");
      }
    };
    void load();
    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
    };
  }, [caseId]);

  if (error) return <section className="card error">{error}</section>;
  if (!payload) return <section className="card">Loading the auditable timeline…</section>;
  const done = payload.case.state === "DONE";
  const acknowledgement = payload.evidence.some(
    (item) => item.candidate.level === "REQUEST_ACKNOWLEDGED" && !item.verification.accepted
  );
  const latestNotification = payload.notifications?.at(-1);
  return (
    <div className="result-grid">
      <p className="preview-label">
        Controlled hackathon demo — Merchant Sandbox is not a real merchant; callback timing is
        accelerated.
      </p>
      <section className="case-channel-card" aria-label="How this case communicates">
        <div><span>↗</span><p><small>CONTACT</small><strong>Controlled merchant adapter</strong></p></div>
        <i aria-hidden="true">→</i>
        <div><span>✓</span><p><small>REPLY</small><strong>Signed case callback</strong></p></div>
        <i aria-hidden="true">→</i>
        <div><span>●</span><p><small>YOUR UPDATE</small><strong>This page, automatically</strong></p></div>
      </section>
      <section className={`card outcome ${done ? "verified" : "waiting"}`}>
        <div className="eyebrow">{done ? "Evidence accepted" : "Still working"}</div>
        <h2>
          {done
            ? "Merchant confirmed the refund instruction"
            : acknowledgement
              ? "Not done — request received only"
              : "Waiting for sufficient proof"}
        </h2>
        <p>
          {done
            ? "The merchant signed evidence matching this case, amount, currency, and reference."
            : "DueBack keeps the case open until evidence meets the approved contract."}
        </p>
        <div className="claim-limit">
          Bank settlement: NOT VERIFIED. Check your payment account before treating the money as received.
        </div>
        <div className="notification-explainer" aria-live="polite">
          <strong>{done ? "Your case update is ready" : "You don’t need to keep refreshing"}</strong>
          <p>
            {done
              ? latestNotification
                ? `Update ${(latestNotification.deliveryStatus ?? "RECORDED").toLowerCase()} via ${latestNotification.deliveryChannel === "EMAIL" ? "email" : "this case"}. Case truth does not depend on notification delivery.`
                : "The verified result is recorded on this case even if a notification channel is unavailable."
              : "You may close this page. DueBack records decisions and verified results durably; configured notifications are a return channel, never proof of completion."}
          </p>
        </div>
      </section>
      <section className="card">
        <h2>Case controls</h2>
        <p>
          Stop future actions, remove your data, or report that a completed result did not arrive.
        </p>
        <a className="button-link" href={`/cases/${caseId}/exception`}>
          {done ? "This isn't resolved" : "Review or stop this case"}
        </a>
      </section>
      <section className="card">
        <h2>What happened</h2>
        <p className="timeline-intro">Every action and decision stays attached to this case.</p>
        <CaseTimeline events={payload.events ?? []} />
      </section>
    </div>
  );
}
