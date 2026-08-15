import { CloudTasksClient } from "@google-cloud/tasks";
import { FirestoreIntakeStore } from "@dueback/persistence/intake-store";
import { PlanService } from "@dueback/runtime/plan-service";
import { TaskScheduler } from "@dueback/runtime/task-scheduler";
import { authenticatedOwner, assertSameOrigin } from "../../../../../lib/authz";
import { firestore } from "../../../../../lib/firebase-admin";
import { handlePlanRequest } from "../../../../../lib/plan-controller";

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
type Context = { params: Promise<{ caseId: string }> };

export async function GET(request: Request, context: Context) {
  const { caseId } = await context.params;
  return handlePlanRequest(request, caseId, {
    authenticate: authenticatedOwner,
    service: planService(),
    now: () => new Date().toISOString()
  });
}

export async function POST(request: Request, context: Context) {
  assertSameOrigin(request);
  const { caseId } = await context.params;
  return handlePlanRequest(request, caseId, {
    authenticate: authenticatedOwner,
    service: planService(),
    now: () => new Date().toISOString()
  });
}
