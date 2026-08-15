import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { signCallback } from "@dueback/channel-adapters/callback-signature";
import { scenarioStep, type ScenarioName } from "./scenarios";
import { statusPage } from "./status-page";

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

  attempt(key: string): number {
    const next = (this.attempts.get(key) ?? 0) + 1;
    this.attempts.set(key, next);
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
  readonly callbackUrl?: string;
  readonly now?: () => string;
  readonly request?: typeof fetch;
  readonly ledger?: MerchantLedger;
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
        const key = request.headers["idempotency-key"];
        if (typeof key !== "string") throw new Error("IDEMPOTENCY_KEY_REQUIRED");
        const scenario = (request.headers["x-dueback-scenario"] ??
          "signed-completion") as ScenarioName;
        const attempt = ledger.attempt(key);
        const step = scenarioStep(scenario, attempt);
        const raw = await readBody(request);
        const envelope = JSON.parse(raw) as {
          caseId?: string;
          proposal?: { sharedFields?: Record<string, string> };
        };
        if (!envelope.caseId || !envelope.proposal?.sharedFields) {
          throw new Error("INVALID_ACTION_ENVELOPE");
        }
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
          const callback = JSON.stringify({
            evidenceId: `evidence_${randomUUID()}`,
            caseId: envelope.caseId,
            level: step.outcome,
            amountMinor:
              step.mismatch === "amount" ? 1 : Number(envelope.proposal.sharedFields.amountMinor),
            currency: envelope.proposal.sharedFields.currency,
            transactionRef:
              step.mismatch === "reference"
                ? "WRONG-REFERENCE"
                : envelope.proposal.sharedFields.transactionRef,
            issuedAt: now(),
            issuer: "merchant-sandbox"
          });
          const timestamp = now();
          const send = () =>
            outbound(callbackUrl, {
              method: "POST",
              headers: {
                "content-type": "application/json",
                "x-dueback-timestamp": timestamp,
                "x-dueback-signature": signCallback(callback, timestamp, input.callbackSecret)
              },
              body: callback
            });
          setTimeout(() => void send(), step.delayMs ?? 0);
          if (step.replayCount === 2) setTimeout(() => void send(), (step.delayMs ?? 0) + 5);
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
    ...(process.env.DUEBACK_CALLBACK_URL ? { callbackUrl: process.env.DUEBACK_CALLBACK_URL } : {})
  }).listen(port);
}
