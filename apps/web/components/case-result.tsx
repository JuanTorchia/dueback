"use client";

import { useEffect, useState } from "react";
import type { FollowThroughCase } from "@dueback/runtime/case-runner";
import type { EvidenceRecord } from "@dueback/runtime/evidence-service";
import type { RuntimeTimelineEvent } from "@dueback/runtime/timeline";
import type { NotificationRecord } from "@dueback/runtime/notifications";
import { anonymousIdToken } from "../lib/firebase-client";
import { CaseTimeline } from "./case-timeline";
import { activeCaseChannel, channelCopy } from "../lib/channel-copy";
import { OutcomeComparison } from "./outcome-comparison";
import { CaseConversation } from "./case-conversation";
import { GoogleSignIn } from "./google-sign-in";
import { NotificationStatus } from "./notification-status";
import { TechnicalRun } from "./technical-run";
import { CaseExport } from "./case-export";

interface ResultPayload {
  case: FollowThroughCase;
  evidence: EvidenceRecord[];
  events?: RuntimeTimelineEvent[];
  notifications?: NotificationRecord[];
  channelEvents?: { channelType: string; transportStatus: string; acceptedAt: string; observedAt?: string }[];
  error?: string;
}

export function CaseResult({ caseId }: { readonly caseId: string }) {
  const [payload, setPayload] = useState<ResultPayload>();
  const [error, setError] = useState<string>();
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string>();

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
        setLastUpdatedAt(new Date().toISOString());
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
  }, [caseId, refreshKey]);

  if (error && !payload) return <section className="card error case-access-error" role="alert"><h2>Sign in to open this private case</h2><p>The link does not grant access by itself. Use the Google account that owns this follow-up.</p><GoogleSignIn onSignedIn={() => { setRefreshKey((value) => value + 1); }} /><button type="button" onClick={() => { setRefreshKey((value) => value + 1); }}>Try current session</button></section>;
  if (!payload) return <section className="card">Loading the auditable timeline…</section>;
  const done = payload.case.state === "DONE";
  const monetaryPromise = payload.case.plan.evidenceRequirements.some(
    (requirement) => requirement.amountMinor !== undefined && requirement.currency !== undefined
  );
  const acknowledgement = payload.evidence.some(
    (item) => item.candidate.level === "REQUEST_ACKNOWLEDGED" && !item.verification.accepted
  );
  const latestNotification = payload.notifications?.at(-1);
  const latestChannelEvent = payload.channelEvents?.at(-1);
  const activeChannel = activeCaseChannel(
    latestChannelEvent?.channelType ?? payload.case.plan.channelType
  );
  const activeChannelCopy = channelCopy(activeChannel);
  const stateCopy: Record<FollowThroughCase["state"], { label: string; next: string }> = {
    DRAFT: { label: "Draft", next: "Review the extracted outcome" },
    AWAITING_APPROVAL: { label: "Approval required", next: "Approve the exact conversation" },
    READY: { label: "Scheduled", next: "DueBack will send the approved follow-up" },
    RUNNING: { label: "Sending", next: "The authorized channel is processing the action" },
    WAITING_EXTERNAL: { label: acknowledgement ? "Response insufficient" : "Waiting for reply", next: "DueBack will evaluate the next authenticated response" },
    WAITING_RETRY: { label: "Retrying safely", next: "A bounded Cloud Task retry is scheduled" },
    NEEDS_ATTENTION: { label: "Decision needed", next: "Review the intervention before anything continues" },
    DONE: { label: "Evidence accepted", next: "Check the exact claim and underlying account" },
    FAILED: { label: "Stopped after failure", next: "Review the recorded failure" },
    CANCELLED: { label: "Stopped", next: "No future external action is authorized" },
    EXPIRED: { label: "Expired", next: "Create a new plan and approval to continue" }
  };
  const currentState = stateCopy[payload.case.state];
  const safeRecipient = payload.case.plan.allowedRecipient.includes("@")
    ? payload.case.plan.allowedRecipient.replace(/(^.).*(@.*$)/, "$1•••$2")
    : payload.case.plan.allowedRecipient;
  return (
    <div className="result-grid">
      {error ? <section className="card error refresh-warning" role="alert"><p>DueBack could not refresh. The saved state below is still available.</p><button type="button" onClick={() => { setRefreshKey((value) => value + 1); }}>Try again</button></section> : null}
      {lastUpdatedAt ? <p className="last-updated">Last refreshed {new Intl.DateTimeFormat(undefined, { timeStyle: "medium" }).format(new Date(lastUpdatedAt))}</p> : null}
      <p className="preview-label">{activeChannelCopy.disclosure}</p>
      <section className="case-channel-card" aria-label="How this case communicates">
        <div><span>↗</span><p><small>CONTACT</small><strong>{activeChannelCopy.contact}</strong></p></div>
        <i aria-hidden="true">→</i>
        <div><span>✓</span><p><small>REPLY</small><strong>{activeChannelCopy.reply}</strong></p></div>
        <i aria-hidden="true">→</i>
        <div><span>●</span><p><small>YOUR UPDATE</small><strong>This page, automatically</strong></p></div>
      </section>
      <section className="card" aria-label="Current follow-through state">
        <div className="eyebrow">Current state · {currentState.label}</div>
        <h2>{currentState.next}</h2>
        <dl className="facts">
          <div><dt>Next check</dt><dd>{new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(payload.case.nextWakeAt ?? payload.case.dueAt))}</dd></div>
          <div><dt>Attempts</dt><dd>{String(payload.case.attemptCount ?? 0)} of 5 used</dd></div>
          <div><dt>Channel</dt><dd>{payload.case.plan.channelType ?? "CONTROLLED_SANDBOX"}</dd></div>
          <div><dt>Recipient</dt><dd>{safeRecipient}</dd></div>
          <div><dt>Return path</dt><dd>{payload.case.plan.notificationRecipient ? "Case page + email" : "Durable case page"}</dd></div>
        </dl>
      </section>
      {latestChannelEvent ? <section className="card" aria-label="Contact delivery status">
        <div className="eyebrow">Contact status</div>
        <h2>{latestChannelEvent.transportStatus === "ACCEPTED" ? "Follow-up accepted by the channel" : `Follow-up ${latestChannelEvent.transportStatus.toLowerCase()}`}</h2>
        <p>Transport status is operational evidence only. It never proves that the company delivered the promised result.</p>
      </section> : null}
      <section className={`card outcome ${done ? "verified" : "waiting"}`}>
        <div className="eyebrow">{done ? "Evidence accepted" : "Still working"}</div>
        <h2>
          {done
            ? monetaryPromise
              ? "Merchant confirmed the refund instruction"
              : "The company confirmed the promised outcome"
            : acknowledgement
              ? "Not done — request received only"
              : "Waiting for sufficient proof"}
        </h2>
        <p>
          {done
            ? monetaryPromise
              ? "The merchant signed evidence matching this case, amount, currency, and reference."
              : "The company signed evidence matching this case, reference, and promised outcome."
            : "DueBack keeps the case open until evidence meets the approved contract."}
        </p>
        <div className="claim-limit">
          {monetaryPromise
            ? "Bank settlement: NOT VERIFIED. Check your payment account before treating the money as received."
            : "Independent fulfillment is NOT VERIFIED. Check that the promised outcome actually arrived."}
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
      {latestNotification ? <NotificationStatus caseId={caseId} notification={latestNotification} onRetried={() => { setRefreshKey((value) => value + 1); }} /> : null}
      <OutcomeComparison item={payload.case} evidence={payload.evidence} />
      <CaseConversation item={payload.case} evidence={payload.evidence} channelEvents={payload.channelEvents ?? []} />
      <section className="card">
        <h2>Case controls</h2>
        <p>
          Stop future actions, remove your data, or report that a completed result did not arrive.
        </p>
        <a className="button-link" href={`/cases/${caseId}/exception`}>
          {done ? "This isn't resolved" : "Review or stop this case"}
        </a>
      </section>
      {payload.case.plan.executionMode === "ACCELERATED_DEMO" ? <TechnicalRun caseId={caseId} /> : null}
      <CaseExport caseId={caseId} />
      <section className="card">
        <h2>What happened</h2>
        <p className="timeline-intro">Every action and decision stays attached to this case.</p>
        <CaseTimeline events={payload.events ?? []} channel={activeChannel} />
      </section>
    </div>
  );
}
