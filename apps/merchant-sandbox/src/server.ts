import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { signCallback } from "@dueback/channel-adapters/callback-signature";
import { scenarioStep, type ScenarioName } from "./scenarios.ts";
import { statusPage } from "./status-page.ts";

interface LedgerRecord {
  readonly receiptId: string;
  readonly acceptedAt: string;
  readonly attempt: number;
}

export class MerchantLedger {
  private readonly records = new Map<string, LedgerRecord>();
  private readonly attempts = new Map<string, number>();

  count(): number {
    return this.records.size;
  }

  attempt(scope: string): number {
    const next = (this.attempts.get(scope) ?? 0) + 1;
    this.attempts.set(scope, next);
    return next;
  }

  accept(key: string, now: string): { record: LedgerRecord; duplicate: boolean } {
    const existing = this.records.get(key);
    if (existing) return { record: existing, duplicate: true };
    const record = { receiptId: `merchant_${randomUUID()}`, acceptedAt: now, attempt: 1 };
    this.records.set(key, record);
    return { record, duplicate: false };
  }
}

async function readBody(request: import("node:http").IncomingMessage): Promise<string> {
  const chunks: Uint8Array[] = [];
  let size = 0;
  for await (const chunk of request) {
    const bytes = typeof chunk === "string" ? Buffer.from(chunk) : Buffer.from(chunk as Uint8Array);
    size += bytes.length;
    if (size > 100_000) throw new Error("BODY_TOO_LARGE");
    chunks.push(bytes);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export function createMerchantServer(input: {
  readonly callbackSecret: string;
  readonly actionSecret?: string;
  readonly callbackUrl?: string;
  readonly now?: () => string;
  readonly request?: typeof fetch;
  readonly ledger?: MerchantLedger;
  readonly callbackDelayMs?: number;
}) {
  const ledger = input.ledger ?? new MerchantLedger();
  const now = input.now ?? (() => new Date().toISOString());
  const outbound = input.request ?? fetch;
  const startedAt = now();

  return createServer((request, response) => {
    void (async () => {
      try {
        if (request.method === "GET" && request.url === "/") {
          response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
          response.end(statusPage({ requestCount: ledger.count(), startedAt }));
          return;
        }
        if (request.method !== "POST" || request.url !== "/v1/follow-ups") {
          response.writeHead(404).end();
          return;
        }
        if (
          input.actionSecret &&
          request.headers.authorization !== `Bearer ${input.actionSecret}`
        ) {
          response.writeHead(401, { "content-type": "application/json" });
          response.end(JSON.stringify({ error: "ACTION_AUTH_REQUIRED" }));
          return;
        }
        const key = request.headers["idempotency-key"];
        if (typeof key !== "string") throw new Error("IDEMPOTENCY_KEY_REQUIRED");
        const correlationId = request.headers["x-dueback-correlation-id"];
        const scenario = (request.headers["x-dueback-scenario"] ??
          "signed-completion") as ScenarioName;
        const raw = await readBody(request);
        const envelope = JSON.parse(raw) as {
          caseId?: string;
          proposal?: { sharedFields?: Record<string, string> };
        };
        if (!envelope.caseId || !envelope.proposal?.sharedFields) {
          throw new Error("INVALID_ACTION_ENVELOPE");
        }
        const caseId = envelope.caseId;
        const sharedFields = envelope.proposal.sharedFields;
        // Scenario progression belongs to the case, not the idempotency key.
        // Transport retries reuse a key, while a later approved follow-up gets
        // a new key; both must advance one observable case story.
        const attempt = ledger.attempt(caseId);
        const step = scenarioStep(scenario, attempt);
        if (step.status >= 500) {
          response.writeHead(step.status, { "content-type": "application/json" });
          response.end(JSON.stringify({ error: "INJECTED_RECOVERABLE_FAILURE", attempt }));
          return;
        }
        const accepted = ledger.accept(key, now());
        response.writeHead(step.status, { "content-type": "application/json" });
        response.end(JSON.stringify({ ...accepted.record, duplicate: accepted.duplicate }));

        if (input.callbackUrl) {
          const callbackUrl = input.callbackUrl;
          const callbackPayload = (level: typeof step.outcome) =>
            JSON.stringify({
              evidenceId: `evidence_${randomUUID()}`,
              caseId,
              level,
              ...(sharedFields.amountMinor !== undefined
                ? { amountMinor: step.mismatch === "amount" ? 1 : Number(sharedFields.amountMinor) }
                : {}),
              ...(sharedFields.currency !== undefined ? { currency: sharedFields.currency } : {}),
              ...(sharedFields.subject !== undefined
                ? {
                    subject: sharedFields.subject,
                    trackingNumber: `DEMO-${caseId.slice(-8).toUpperCase()}`
                  }
                : {}),
              transactionRef:
                step.mismatch === "reference" ? "WRONG-REFERENCE" : sharedFields.transactionRef,
              issuedAt: now(),
              issuer: "merchant-sandbox"
            });
          const send = async (level: typeof step.outcome) => {
            const callback = callbackPayload(level);
            const timestamp = now();
            const callbackResponse = await outbound(callbackUrl, {
              method: "POST",
              headers: {
                "content-type": "application/json",
                "x-dueback-timestamp": timestamp,
                "x-dueback-signature": signCallback(callback, timestamp, input.callbackSecret),
                ...(typeof correlationId === "string"
                  ? { "x-dueback-correlation-id": correlationId }
                  : {})
              },
              body: callback
            });
            if (!callbackResponse.ok)
              throw new Error(`CALLBACK_${String(callbackResponse.status)}`);
          };
          const callbackDelay = step.delayMs ?? input.callbackDelayMs ?? 1_000;
          setTimeout(() => void send(step.outcome).catch(() => undefined), callbackDelay);
          if (step.replayCount === 2)
            setTimeout(() => void send(step.outcome).catch(() => undefined), callbackDelay + 100);
          const followupOutcome = step.followupOutcome;
          if (followupOutcome)
            setTimeout(
              () => void send(followupOutcome).catch(() => undefined),
              callbackDelay + 1_500
            );
        }
      } catch (error) {
        response.writeHead(400, { "content-type": "application/json" });
        response.end(
          JSON.stringify({ error: error instanceof Error ? error.message : "BAD_REQUEST" })
        );
      }
    })();
  });
}

if (process.env.NODE_ENV !== "test") {
  const port = Number(process.env.PORT ?? 8081);
  const secret = process.env.MERCHANT_CALLBACK_SECRET;
  if (!secret) throw new Error("MERCHANT_CALLBACK_SECRET is required");
  createMerchantServer({
    callbackSecret: secret,
    actionSecret: secret,
    ...(process.env.DUEBACK_CALLBACK_URL ? { callbackUrl: process.env.DUEBACK_CALLBACK_URL } : {})
  }).listen(port);
}
