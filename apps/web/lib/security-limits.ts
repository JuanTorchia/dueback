import type { Firestore } from "firebase-admin/firestore";
import { stableHash } from "@dueback/domain";

export const publicSecurityLimits = Object.freeze({
  newCasesPerIdentityPerDay: 10,
  modelCallsPerNormalCase: 4,
  taskAttemptsPerCase: 5,
  logicalExternalActionsPerCase: 3,
  notificationsPerCase: 3
});

export async function consumeNewCaseBudget(
  db: Firestore,
  ownerId: string,
  now: string
): Promise<void> {
  const day = now.slice(0, 10);
  const ownerHash = stableHash(ownerId).slice(7, 31);
  const reference = db.collection("securityBudgets").doc(`${ownerHash}-${day}`);
  await db.runTransaction(async (transaction) => {
    const current = await transaction.get(reference);
    const newCases = Number(current.get("newCases") ?? 0);
    if (newCases >= publicSecurityLimits.newCasesPerIdentityPerDay) {
      throw new Error("DAILY_CASE_BUDGET_EXHAUSTED");
    }
    transaction.set(
      reference,
      {
        ownerHash,
        day,
        newCases: newCases + 1,
        modelCalls: Number(current.get("modelCalls") ?? 0) + 1,
        updatedAt: now,
        expiresAt: new Date(Date.parse(now) + 2 * 86_400_000).toISOString()
      },
      { merge: true }
    );
  });
}

export function assertLogicalActionBudget(actionOrdinal: number): void {
  if (
    !Number.isInteger(actionOrdinal) ||
    actionOrdinal < 1 ||
    actionOrdinal > publicSecurityLimits.logicalExternalActionsPerCase
  ) {
    throw new Error("LOGICAL_ACTION_BUDGET_EXHAUSTED");
  }
}

const safeErrors = new Set([
  "AUTHENTICATION_REQUIRED",
  "CASE_OWNERSHIP_REQUIRED",
  "DAILY_CASE_BUDGET_EXHAUSTED",
  "LOGICAL_ACTION_BUDGET_EXHAUSTED",
  "FILE_TOO_LARGE",
  "UNSUPPORTED_MEDIA_TYPE",
  "MEDIA_TYPE_MISMATCH",
  "PROMISE_SOURCE_REQUIRED",
  "CRITICAL_FIELDS_UNRESOLVED"
]);

export function redactedPublicError(error: unknown): string {
  const candidateCode =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : undefined;
  const message = candidateCode ?? (error instanceof Error ? error.message : "REQUEST_FAILED");
  return safeErrors.has(message) ? message : "REQUEST_FAILED";
}
