import type { Firestore } from "firebase-admin/firestore";
import type { ActionReceipt, ActionRecordStore, Reservation } from "@dueback/runtime/action-broker";
import type { FollowThroughCase, FollowThroughStore } from "@dueback/runtime/case-runner";
import type { EvidenceCaseStore, EvidenceRecord } from "@dueback/runtime/evidence-service";
import type { NotificationRecord, NotificationStore } from "@dueback/runtime/notifications";

export class FirestoreRuntimeStore
  implements FollowThroughStore, ActionRecordStore, EvidenceCaseStore, NotificationStore
{
  constructor(private readonly db: Firestore) {}

  async get(caseId: string): Promise<FollowThroughCase | undefined> {
    const document = await this.db.collection("caseRuns").doc(caseId).get();
    return document.exists ? (document.data() as FollowThroughCase) : undefined;
  }

  async compareAndSet(
    caseId: string,
    expectedVersion: number,
    next: FollowThroughCase
  ): Promise<void> {
    const reference = this.db.collection("caseRuns").doc(caseId);
    await this.db.runTransaction(async (transaction) => {
      const current = await transaction.get(reference);
      if (!current.exists) throw new Error("CASE_NOT_FOUND");
      if (current.get("version") !== expectedVersion) throw new Error("VERSION_CONFLICT");
      transaction.set(reference, next);
    });
  }

  async reserve(idempotencyKey: string): Promise<Reservation> {
    const reference = this.db.collection("actionRecords").doc(idempotencyKey.slice(7));
    return this.db.runTransaction(async (transaction) => {
      const current = await transaction.get(reference);
      if (current.exists) {
        const record = current.data() as { status: string; receipt?: ActionReceipt };
        return record.status === "SUCCEEDED" && record.receipt
          ? { status: "SUCCEEDED" as const, receipt: record.receipt }
          : { status: "IN_FLIGHT" as const };
      }
      transaction.create(reference, { status: "RESERVED", idempotencyKey });
      return { status: "RESERVED" as const };
    });
  }

  async succeed(idempotencyKey: string, receipt: ActionReceipt): Promise<void> {
    await this.db
      .collection("actionRecords")
      .doc(idempotencyKey.slice(7))
      .set({ status: "SUCCEEDED", idempotencyKey, receipt });
  }

  async fail(idempotencyKey: string, reasonCode: string): Promise<void> {
    await this.db.collection("actionRecords").doc(idempotencyKey.slice(7)).delete();
    await this.db
      .collection("actionFailures")
      .add({ idempotencyKey, reasonCode, occurredAt: new Date().toISOString() });
  }

  async record(input: {
    caseId: string;
    expectedVersion: number;
    nextState: FollowThroughCase["state"];
    evidence: EvidenceRecord;
  }): Promise<{ duplicate: boolean }> {
    const caseRef = this.db.collection("caseRuns").doc(input.caseId);
    const evidenceRef = caseRef.collection("evidence").doc(input.evidence.candidate.evidenceId);
    return this.db.runTransaction(async (transaction) => {
      const [item, prior] = await Promise.all([
        transaction.get(caseRef),
        transaction.get(evidenceRef)
      ]);
      if (!item.exists) throw new Error("CASE_NOT_FOUND");
      if (prior.exists) return { duplicate: true };
      if (item.get("version") !== input.expectedVersion) throw new Error("VERSION_CONFLICT");
      transaction.create(evidenceRef, input.evidence);
      transaction.update(caseRef, {
        state: input.nextState,
        version: input.expectedVersion + 1,
        ...(input.nextState === "DONE" ? { completedLevel: input.evidence.candidate.level } : {})
      });
      return { duplicate: false };
    });
  }

  async createIfAbsent(
    record: NotificationRecord
  ): Promise<{ record: NotificationRecord; duplicate: boolean }> {
    const reference = this.db.collection("notifications").doc(record.dedupeKey.slice(7));
    return this.db.runTransaction(async (transaction) => {
      const current = await transaction.get(reference);
      if (current.exists) return { record: current.data() as NotificationRecord, duplicate: true };
      transaction.create(reference, record);
      return { record, duplicate: false };
    });
  }

  async reserveCallback(
    dedupeKey: string,
    receivedAt: string
  ): Promise<"RESERVED" | "IN_FLIGHT" | "COMPLETED"> {
    const reference = this.db.collection("callbackDedupe").doc(dedupeKey.slice(7));
    return this.db.runTransaction(async (transaction) => {
      const current = await transaction.get(reference);
      if (current.exists) return current.get("status") === "COMPLETED" ? "COMPLETED" : "IN_FLIGHT";
      transaction.create(reference, { receivedAt, status: "IN_FLIGHT" });
      return "RESERVED";
    });
  }

  async completeCallback(dedupeKey: string): Promise<void> {
    await this.db
      .collection("callbackDedupe")
      .doc(dedupeKey.slice(7))
      .update({ status: "COMPLETED" });
  }

  async failCallback(dedupeKey: string): Promise<void> {
    await this.db.collection("callbackDedupe").doc(dedupeKey.slice(7)).delete();
  }
}
