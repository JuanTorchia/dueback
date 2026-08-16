import type { ProposedAction } from "@dueback/domain";
import type { ActionReceipt, ClosedActionAdapter } from "@dueback/runtime/action-broker";

export interface CompanyEmailConfig {
  readonly apiKey: string;
  readonly from: string;
  readonly replyDomain: string;
  readonly request?: typeof globalThis.fetch;
}

function messageFor(proposal: ProposedAction, caseId: string) {
  const reference = proposal.sharedFields.transactionRef ?? caseId;
  const amount = proposal.sharedFields.amountMinor;
  const currency = proposal.sharedFields.currency;
  const amountLine = amount && currency
    ? `Amount: ${currency} ${(Number(amount) / 100).toFixed(2)}\n`
    : "";
  return {
    subject: `Follow-up for ${reference}`,
    text: [
      "Hello,",
      "",
      "DueBack is following up on an outcome requested by your customer.",
      `Reference: ${reference}`,
      amountLine.trimEnd(),
      "Please reply with the current status and verifiable confirmation when the outcome is complete.",
      "An acknowledgement that the request was received will not be treated as completion.",
      "",
      `DueBack case: ${caseId}`
    ].filter(Boolean).join("\n")
  };
}

export class CompanyEmailActionAdapter implements ClosedActionAdapter {
  private readonly request: typeof globalThis.fetch;

  constructor(private readonly config: CompanyEmailConfig) {
    this.request = config.request ?? globalThis.fetch;
  }

  async execute(
    proposal: ProposedAction,
    idempotencyKey: string,
    context: { readonly caseId: string; readonly correlationId?: string }
  ): Promise<ActionReceipt> {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(proposal.recipient)) {
      throw new Error("COMPANY_EMAIL_RECIPIENT_INVALID");
    }
    const message = messageFor(proposal, context.caseId);
    const replyLocalPart = context.caseId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80);
    const response = await this.request("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.config.apiKey}`,
        "content-type": "application/json",
        "idempotency-key": idempotencyKey
      },
      body: JSON.stringify({
        from: this.config.from,
        to: [proposal.recipient],
        reply_to: `case+${replyLocalPart}@${this.config.replyDomain}`,
        subject: message.subject,
        text: message.text
      })
    });
    if (!response.ok) throw new Error(`COMPANY_EMAIL_TRANSPORT_${String(response.status)}`);
    const result = (await response.json()) as { id?: string };
    if (!result.id) throw new Error("COMPANY_EMAIL_RECEIPT_MISSING");
    return { receiptId: result.id, acceptedAt: new Date().toISOString() };
  }
}

export { messageFor as companyFollowUpMessage };
