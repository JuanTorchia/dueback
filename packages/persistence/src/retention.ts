import type { Firestore } from "firebase-admin/firestore";
import { stableHash } from "@dueback/domain";
import type { CaseControlStore, DeletionReceipt } from "@dueback/runtime/case-control";
import type { FollowThroughCase } from "@dueback/runtime/case-runner";
import { firestoreDeleteAt } from "./expiry";

export class FirestoreCaseControlStore implements CaseControlStore {
  constructor(private readonly db: Firestore) {}

  async get(caseId: string): Promise<FollowThroughCase | undefined> {
    const document = await this.db.collection("caseRuns").doc(caseId).get();
    return document.exists ? (document.data() as FollowThroughCase) : undefined;
  }

  async transition(input: {
    caseId: string;
    ownerId: string;
    expectedVersion: number;
    action: "STOP" | "REVOKE" | "EXPIRE" | "REOPEN" | "RESUME";
    reason: string;
    now: string;
  }): Promise<FollowThroughCase> {
    const reference = this.db.collection("caseRuns").doc(input.caseId);
    return this.db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(reference);
      if (!snapshot.exists) throw new Error("CASE_NOT_FOUND");
      const current = snapshot.data() as FollowThroughCase;
      if (current.ownerId !== input.ownerId) throw new Error("CASE_OWNERSHIP_REQUIRED");
      if (current.version !== input.expectedVersion) throw new Error("VERSION_CONFLICT");
      const state =
        input.action === "REOPEN"
          ? ("NEEDS_ATTENTION" as const)
          : input.action === "RESUME"
            ? ("READY" as const)
            : input.action === "EXPIRE"
              ? ("EXPIRED" as const)
              : ("CANCELLED" as const);
      const next: FollowThroughCase = {
        ...current,
        state,
        version: current.version + 1,
        controlReason: input.reason,
        controlledAt: input.now,
        ...(["REOPEN", "RESUME"].includes(input.action)
          ? {}
          : { approval: { ...current.approval, revokedAt: input.now } })
      };
      transaction.set(reference, {
        ...next,
        ...(input.action === "EXPIRE" ? { deleteAt: firestoreDeleteAt(input.now) } : {})
      });
      transaction.create(reference.collection("events").doc(`control-${String(next.version)}`), {
        type: `CASE_${input.action}`,
        actor: "PERSON",
        reason: input.reason,
        occurredAt: input.now,
        correlationId: current.correlationId ?? "corr_unavailable",
        deleteAt: firestoreDeleteAt(input.now)
      });
      return next;
    });
  }

  async requestDeletion(input: {
    caseId: string;
    ownerId: string;
    expectedVersion: number;
    now: string;
  }): Promise<DeletionReceipt> {
    const runRef = this.db.collection("caseRuns").doc(input.caseId);
    const draftRef = this.db.collection("caseDrafts").doc(input.caseId);
    const tombstoneId = stableHash({
      namespace: "dueback/deletion/v1",
      caseId: input.caseId
    }).slice(7, 39);
    const tombstoneRef = this.db.collection("deletionTombstones").doc(tombstoneId);
    await this.db.runTransaction(async (transaction) => {
      const run = await transaction.get(runRef);
      if (!run.exists) throw new Error("CASE_NOT_FOUND");
      const current = run.data() as FollowThroughCase;
      if (current.ownerId !== input.ownerId) throw new Error("CASE_OWNERSHIP_REQUIRED");
      if (current.version !== input.expectedVersion) throw new Error("VERSION_CONFLICT");
      transaction.create(tombstoneRef, {
        caseHash: stableHash(input.caseId),
        ownerHash: stableHash(input.ownerId),
        reason: "USER_REQUESTED_DELETION",
        requestedAt: input.now,
        purgeAfter: new Date(Date.parse(input.now) + 30 * 86_400_000).toISOString(),
        deleteAt: firestoreDeleteAt(input.now)
      });
      transaction.delete(runRef);
      transaction.delete(draftRef);
    });

    const [notifications, dedupe] = await Promise.all([
      this.db.collection("notifications").where("caseId", "==", input.caseId).get(),
      this.db.collection("intakeDedupe").where("caseId", "==", input.caseId).get()
    ]);
    const cleanup = this.db.batch();
    for (const document of [...notifications.docs, ...dedupe.docs]) cleanup.delete(document.ref);
    await cleanup.commit();
    await this.db.recursiveDelete(runRef);
    return {
      caseId: input.caseId,
      status: "DELETION_ACCEPTED",
      requestedAt: input.now,
      tombstoneId
    };
  }
}
