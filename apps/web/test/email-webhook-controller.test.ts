import { describe, expect, it, vi } from "vitest";
import { signEmailWebhook } from "@dueback/channel-adapters/email-webhook";
import { handleEmailWebhook } from "../lib/email-webhook-controller";

const now = "2026-08-16T12:00:00.000Z";
const timestamp = String(Date.parse(now) / 1000);
const secret = `whsec_${Buffer.from("controller-secret").toString("base64")}`;
const body = JSON.stringify({ type: "email.received", created_at: now, data: { email_id: "email_123" } });

describe("email webhook controller", () => {
  it("reserves, enqueues and completes one verified event", async () => {
    const callbacks = {
      reserveCallback: vi.fn(() => Promise.resolve("RESERVED" as const)),
      completeCallback: vi.fn(() => Promise.resolve()),
      failCallback: vi.fn(() => Promise.resolve())
    };
    const scheduler = { scheduleInbound: vi.fn(() => Promise.resolve({ taskName: "task", duplicate: false })) };
    const response = await handleEmailWebhook(new Request("https://dueback.test/api/webhooks/email", {
      method: "POST",
      headers: {
        "svix-id": "event_123",
        "svix-timestamp": timestamp,
        "svix-signature": `v1,${signEmailWebhook(body, "event_123", timestamp, secret)}`
      },
      body
    }), { secret, now: () => now, callbacks, scheduler });
    expect(response.status).toBe(202);
    expect(scheduler.scheduleInbound).toHaveBeenCalledOnce();
    expect(callbacks.completeCallback).toHaveBeenCalledOnce();
  });

  it("rejects an invalid signature before reserving", async () => {
    const callbacks = {
      reserveCallback: vi.fn(),
      completeCallback: vi.fn(),
      failCallback: vi.fn()
    };
    const response = await handleEmailWebhook(new Request("https://dueback.test/api/webhooks/email", {
      method: "POST",
      headers: { "svix-id": "event_123", "svix-timestamp": timestamp, "svix-signature": "v1,bad" },
      body
    }), { secret, now: () => now, callbacks, scheduler: { scheduleInbound: vi.fn() } });
    expect(response.status).toBe(401);
    expect(callbacks.reserveCallback).not.toHaveBeenCalled();
  });
});
