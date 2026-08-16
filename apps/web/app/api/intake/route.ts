import { FirestoreIntakeStore } from "@dueback/persistence/intake-store";
import { IntakeService } from "@dueback/runtime/intake-service";
import { extractPromiseWithMetricsFlow } from "@dueback/genkit-flows/extract-promise";
import { authenticatedOwner, assertSameOrigin } from "../../../lib/authz";
import { firestore } from "../../../lib/firebase-admin";
import { handleIntake } from "../../../lib/intake-controller";
import { consumeNewCaseBudget } from "../../../lib/security-limits";
import {
  modelBudgetKey,
  recordModelCallOutcome,
  reserveModelCallBudget
} from "../../../lib/security-limits";

export const runtime = "nodejs";

const service = new IntakeService(
  new FirestoreIntakeStore(firestore),
  {
    async extract(artifact) {
      // Budgets are per person and artifact. The artifact id is content-derived,
      // so using it alone would let one tester exhaust the fixture for everyone.
      const budgetKey = modelBudgetKey(artifact.ownerId, artifact.artifactId);
      for (let attempt = 1; attempt <= 2; attempt += 1) {
        const observedAt = new Date().toISOString();
        await reserveModelCallBudget(firestore, budgetKey, artifact.ownerId, observedAt);
        const started = performance.now();
        try {
          const result = await extractPromiseWithMetricsFlow({
            artifactId: artifact.artifactId,
            source:
              typeof artifact.content === "string"
                ? { kind: "text", content: artifact.content }
                : { kind: "media", ...artifact.content }
          });
          await recordModelCallOutcome(firestore, budgetKey, {
            latencyMs: performance.now() - started,
            status: "SUCCEEDED",
            observedAt: new Date().toISOString(),
            usage: result.usage
          });
          return result.draft;
        } catch (error) {
          await recordModelCallOutcome(firestore, budgetKey, {
            latencyMs: performance.now() - started,
            status: "FAILED",
            observedAt: new Date().toISOString()
          });
          if (attempt === 2) throw error;
        }
      }
      throw new Error("MODEL_RETRY_EXHAUSTED");
    }
  },
  process.env.COMPANY_CONTACT_MODE === "email"
    ? process.env.COMPANY_EMAIL_DEFAULT_RECIPIENT ?? "recipient-required@dueback.invalid"
    : process.env.MERCHANT_SANDBOX_RECIPIENT ?? "merchant@controlled.dueback.test",
  { consume: (ownerId, now) => consumeNewCaseBudget(firestore, ownerId, now) }
);

export async function POST(request: Request) {
  assertSameOrigin(request);
  return handleIntake(request, {
    authenticate: authenticatedOwner,
    service,
    now: () => new Date().toISOString()
  });
}
