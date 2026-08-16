import { ResendInboundEmailAdapter } from "@dueback/channel-adapters/inbound-email";
import { extractInboundFlow } from "@dueback/genkit-flows/extract-inbound";
import { FirestoreRuntimeStore } from "@dueback/persistence/runtime-store";
import { EvidenceService } from "@dueback/runtime/evidence-service";
import { InboundService } from "@dueback/runtime/inbound-service";
import { InterventionService } from "@dueback/runtime/interventions";
import { firestore } from "../../../../../lib/firebase-admin";
import { notificationDelivery } from "../../../../../lib/notification-delivery";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!request.headers.get("x-cloudtasks-taskname")) {
    return Response.json({ error: "CLOUD_TASK_IDENTITY_REQUIRED" }, { status: 401 });
  }
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return Response.json({ error: "INBOUND_EMAIL_NOT_CONFIGURED" }, { status: 503 });
  try {
    const body = await request.json() as {
      providerEventId?: string;
      providerEmailId?: string;
      eventType?: string;
    };
    if (!body.providerEventId || !body.providerEmailId || !body.eventType) {
      return Response.json({ error: "INBOUND_TASK_INVALID" }, { status: 400 });
    }
    if (body.eventType !== "email.received") {
      return Response.json({ status: "IGNORED", reasonCodes: ["NON_INBOUND_EVENT"] });
    }
    const store = new FirestoreRuntimeStore(firestore);
    const interventions = new InterventionService(store, store);
    const service = new InboundService(
      store,
      { interpret: (input) => extractInboundFlow(input) },
      new EvidenceService(store, store, store, notificationDelivery(store)),
      interventions
    );
    const email = await new ResendInboundEmailAdapter(apiKey).retrieve(body.providerEmailId);
    return Response.json(await service.process(email, new Date().toISOString()));
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "INBOUND_PROCESSING_FAILED" }, { status: 500 });
  }
}
