import { publicChannelCapabilities } from "@dueback/runtime/channel-registry";

export const runtime = "nodejs";

export function GET() {
  const managedEmailOutbound = Boolean(
    process.env.RESEND_API_KEY &&
    process.env.COMPANY_EMAIL_FROM &&
    process.env.COMPANY_EMAIL_REPLY_DOMAIN
  );
  const managedEmailInbound = Boolean(
    process.env.RESEND_API_KEY &&
    process.env.EMAIL_WEBHOOK_SIGNING_SECRET &&
    process.env.COMPANY_EMAIL_REPLY_DOMAIN
  );
  return Response.json(publicChannelCapabilities({
    now: new Date().toISOString(),
    sandboxAvailable: Boolean(
      process.env.MERCHANT_SANDBOX_URL && process.env.MERCHANT_CALLBACK_SECRET
    ),
    managedEmailOutbound,
    managedEmailInbound
  }));
}
