import { FirestoreIntakeStore } from "@dueback/persistence/intake-store";
import { PlanService } from "@dueback/runtime/plan-service";
import { authenticatedOwner, assertSameOrigin } from "../../../../../lib/authz";
import { firestore } from "../../../../../lib/firebase-admin";
import { handlePlanRequest } from "../../../../../lib/plan-controller";

export const runtime = "nodejs";
const service = new PlanService(new FirestoreIntakeStore(firestore));
type Context = { params: Promise<{ caseId: string }> };

export async function GET(request: Request, context: Context) {
  const { caseId } = await context.params;
  return handlePlanRequest(request, caseId, {
    authenticate: authenticatedOwner,
    service,
    now: () => new Date().toISOString()
  });
}

export async function POST(request: Request, context: Context) {
  assertSameOrigin(request);
  const { caseId } = await context.params;
  return handlePlanRequest(request, caseId, {
    authenticate: authenticatedOwner,
    service,
    now: () => new Date().toISOString()
  });
}
