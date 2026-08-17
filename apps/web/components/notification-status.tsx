"use client";

import { useState } from "react";
import type { NotificationRecord } from "@dueback/runtime/notifications";
import { anonymousIdToken } from "../lib/firebase-client";
import { notificationPresentation } from "../lib/notification-presentation";

export function NotificationStatus({
  caseId,
  notification,
  onRetried
}: {
  readonly caseId: string;
  readonly notification: NotificationRecord;
  readonly onRetried: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const presentation = notificationPresentation(notification);
  return <section className="card notification-status" aria-label="Your return notification">
    <div className="eyebrow">Return notification</div>
    <h2>{presentation.copy}</h2>
    <p>Destination: {presentation.destination}. Attempts: {presentation.attempts} of 3.</p>
    <p>Notification delivery never changes whether the company promise has enough proof.</p>
    {presentation.canRetry ? <button type="button" className="secondary" disabled={busy} onClick={() => {
      setBusy(true); setError(undefined);
      void anonymousIdToken().then((token) => fetch(`/api/cases/${caseId}/notifications/retry`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: notification.notificationId })
      })).then((response) => {
        if (!response.ok) throw new Error("RETRY_FAILED");
        onRetried();
      }).catch(() => { setError("DueBack could not retry this notification. Your case is unchanged."); })
        .finally(() => { setBusy(false); });
    }}>{busy ? "Retrying…" : "Retry notification"}</button> : null}
    {error ? <p className="error" role="alert">{error}</p> : null}
  </section>;
}
