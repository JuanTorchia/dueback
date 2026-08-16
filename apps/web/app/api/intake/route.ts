import { FirestoreIntakeStore } from "@dueback/persistence/intake-store";
import { IntakeService } from "@dueback/runtime/intake-service";
import { extractPromiseWithMetricsFlow } from "@dueback/genkit-flows/extract-promise";
import { authenticatedOwner, assertSameOrigin } from "../../../lib/authz";
import { firestore } from "../../../lib/firebase-admin";
import { handleIntake } from "../../../lib/intake-controller";
import { consumeNewCaseBudget } from "../../../lib/security-limits";
import { recordModelCallOutcome, reserveModelCallBudget } from "../../../lib/security-limits";

export const runtime = "nodejs";

const service = new IntakeService(
  new FirestoreIntakeStore(firestore),
  {
    async extract(artifact) {
      const observedAt = new Date().toISOString();
      await reserveModelCallBudget(firestore, artifact.artifactId, artifact.ownerId, observedAt);
      const started = performance.now();
      try {
        const result = await extractPromiseWithMetricsFlow({
          artifactId: artifact.artifactId,
          source:
            typeof artifact.content === "string"
              ? { kind: "text", content: artifact.content }
              : { kind: "media", ...artifact.content }
        });
        await recordModelCallOutcome(firestore, artifact.artifactId, {
          latencyMs: performance.now() - started,
          status: "SUCCEEDED",
          observedAt: new Date().toISOString(),
          usage: result.usage
        });
        return result.draft;
      } catch (error) {
        await recordModelCallOutcome(firestore, artifact.artifactId, {
          latencyMs: performance.now() - started,
          status: "FAILED",
          observedAt: new Date().toISOString()
        });
        throw error;
      }
    }
  },
  process.env.MERCHANT_SANDBOX_RECIPIENT ?? "merchant@controlled.dueback.test",
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
