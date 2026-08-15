import { CloudTasksClient } from "@google-cloud/tasks";
import { MerchantSandboxAdapter } from "@dueback/channel-adapters/merchant-sandbox";
import { FirestoreRuntimeStore } from "@dueback/persistence/runtime-store";
import { ActionBroker } from "@dueback/runtime/action-broker";
import { CaseRunner } from "@dueback/runtime/case-runner";
import { InterventionService } from "@dueback/runtime/interventions";
import { TaskScheduler } from "@dueback/runtime/task-scheduler";
import { firestore } from "../../../../../lib/firebase-admin";
import { handleRunCaseTask } from "../../../../../lib/task-controller";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  const workerUrl = process.env.DUEBACK_WORKER_URL;
  const merchantUrl = process.env.MERCHANT_SANDBOX_URL;
  const serviceAccountEmail = process.env.CLOUD_TASKS_SERVICE_ACCOUNT;
  const actionSecret = process.env.MERCHANT_CALLBACK_SECRET;
  if (!projectId || !workerUrl || !merchantUrl || !serviceAccountEmail || !actionSecret)
    return Response.json({ error: "RUNTIME_NOT_CONFIGURED" }, { status: 503 });
  const store = new FirestoreRuntimeStore(firestore);
  const scheduler = new TaskScheduler(new CloudTasksClient(), {
    projectId,
    location: process.env.CLOUD_TASKS_LOCATION ?? "us-central1",
    queue: process.env.CLOUD_TASKS_QUEUE ?? "dueback-cases",
    workerUrl,
    serviceAccountEmail
  });
  const adapter = new MerchantSandboxAdapter({
    baseUrl: merchantUrl,
    scenario: process.env.MERCHANT_SCENARIO ?? "signed-completion",
    actionSecret
  });
  const runner = new CaseRunner(
    store,
    new ActionBroker(store, adapter),
    scheduler,
    30,
    5,
    new InterventionService(store, store)
  );
  return handleRunCaseTask(request, runner, () => new Date().toISOString());
}
