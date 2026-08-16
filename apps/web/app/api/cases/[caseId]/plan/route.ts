import { CloudTasksClient } from "@google-cloud/tasks";
import { FirestoreIntakeStore } from "@dueback/persistence/intake-store";
import { PlanService } from "@dueback/runtime/plan-service";
import { TaskScheduler } from "@dueback/runtime/task-scheduler";
import { authenticatedOwner, assertSameOrigin } from "../../../../../lib/authz";
import { firestore } from "../../../../../lib/firebase-admin";
import { handlePlanRequest } from "../../../../../lib/plan-controller";
import { publicChannelCapabilities } from "@dueback/runtime/channel-registry";

export const runtime = "nodejs";
function planService() {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  const workerUrl = process.env.DUEBACK_WORKER_URL;
  const serviceAccountEmail = process.env.CLOUD_TASKS_SERVICE_ACCOUNT;
  const scheduler =
    projectId && workerUrl && serviceAccountEmail
      ? new TaskScheduler(new CloudTasksClient(), {
          projectId,
          location: process.env.CLOUD_TASKS_LOCATION ?? "us-central1",
          queue: process.env.CLOUD_TASKS_QUEUE ?? "dueback-cases",
          workerUrl,
          serviceAccountEmail
        })
      : undefined;
  return new PlanService(new FirestoreIntakeStore(firestore), scheduler);
}

function isChannelAvailable(channelType: string | undefined): boolean {
  if (!channelType) return false;
  const capabilities = publicChannelCapabilities({
    now: new Date().toISOString(),
    sandboxAvailable: Boolean(
      process.env.MERCHANT_SANDBOX_URL && process.env.MERCHANT_CALLBACK_SECRET
    ),
    managedEmailOutbound: Boolean(
      process.env.RESEND_API_KEY && process.env.COMPANY_EMAIL_FROM &&
      process.env.COMPANY_EMAIL_REPLY_DOMAIN &&
      process.env.COMPANY_EMAIL_ALLOWED_RECIPIENT_DOMAINS
    ),
    managedEmailInbound: Boolean(
      process.env.RESEND_API_KEY && process.env.EMAIL_WEBHOOK_SIGNING_SECRET &&
      process.env.COMPANY_EMAIL_REPLY_DOMAIN
    ),
    partnerFixtureAvailable: Boolean(
      process.env.PARTNER_FIXTURE_ENDPOINT && process.env.PARTNER_FIXTURE_SIGNING_SECRET
    )
  });
  return capabilities.some((item) =>
    item.channelType === channelType && item.status === "AVAILABLE" && item.canSend
  );
}
type Context = { params: Promise<{ caseId: string }> };

export async function GET(request: Request, context: Context) {
  const { caseId } = await context.params;
  return handlePlanRequest(request, caseId, {
    authenticate: authenticatedOwner,
    service: planService(),
    now: () => new Date().toISOString(),
    isChannelAvailable
  });
}

export async function POST(request: Request, context: Context) {
  assertSameOrigin(request);
  const { caseId } = await context.params;
  return handlePlanRequest(request, caseId, {
    authenticate: authenticatedOwner,
    service: planService(),
    now: () => new Date().toISOString(),
    isChannelAvailable
  });
}
