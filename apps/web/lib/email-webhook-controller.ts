import { stableHash } from "@dueback/domain";
import {
  parseEmailProviderEvent,
  verifyEmailWebhook
} from "@dueback/channel-adapters/email-webhook";
import type { CallbackRecordStore } from "./callback-controller";

export interface InboundTaskScheduler {
  scheduleInbound(input: {
    providerEventId: string;
    providerEmailId: string;
    eventType: string;
    wakeAt: string;
  }): Promise<{ taskName: string; duplicate: boolean }>;
}

export async function handleEmailWebhook(
  request: Request,
  dependencies: {
    readonly secret: string;
    readonly now: () => string;
    readonly callbacks: CallbackRecordStore;
    readonly scheduler: InboundTaskScheduler;
  }
): Promise<Response> {
  const body = await request.text();
  const id = request.headers.get("svix-id");
  const timestamp = request.headers.get("svix-timestamp");
  const signature = request.headers.get("svix-signature");
  const now = dependencies.now();
  if (!id || !timestamp || !signature) {
    return Response.json({ error: "EMAIL_WEBHOOK_AUTH_REQUIRED" }, { status: 401 });
  }
  if (!verifyEmailWebhook({ body, id, timestamp, signature, secret: dependencies.secret, now })) {
    return Response.json({ error: "EMAIL_WEBHOOK_SIGNATURE_INVALID" }, { status: 401 });
  }
  try {
    const event = parseEmailProviderEvent(body);
    const key = stableHash({ namespace: "dueback/email-provider-event/v1", id });
    const reservation = await dependencies.callbacks.reserveCallback(key, now);
    if (reservation !== "RESERVED") {
      return Response.json({ providerEventId: id, status: reservation, duplicate: true }, { status: 202 });
    }
    try {
      await dependencies.scheduler.scheduleInbound({
        providerEventId: id,
        providerEmailId: event.data.email_id,
        eventType: event.type,
        wakeAt: now
      });
      await dependencies.callbacks.completeCallback(key);
      return Response.json({ providerEventId: id, status: "ENQUEUED", duplicate: false }, { status: 202 });
    } catch (error) {
      await dependencies.callbacks.failCallback(key);
      throw error;
    }
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "EMAIL_WEBHOOK_FAILED" }, { status: 400 });
  }
}
