import type { Firestore } from "firebase-admin/firestore";
import type { ActionReceipt, ActionRecordStore, Reservation } from "@dueback/runtime/action-broker";
import type { FollowThroughCase, FollowThroughStore } from "@dueback/runtime/case-runner";
import type { EvidenceCaseStore, EvidenceRecord } from "@dueback/runtime/evidence-service";
import type { NotificationRecord, NotificationStore } from "@dueback/runtime/notifications";
import type { InterventionRecord, InterventionStore } from "@dueback/runtime/interventions";
import type {
  EmailDeliveryReceipt,
  EmailDeliveryStore
} from "@dueback/channel-adapters/outbound-email";
import { firestoreDeleteAt } from "./expiry";

export class FirestoreRuntimeStore
  implements
    FollowThroughStore,
    ActionRecordStore,
    EvidenceCaseStore,
    NotificationStore,
    InterventionStore,
    EmailDeliveryStore
{
  constructor(private readonly db: Firestore) {}

  async get(caseId: string): Promise<FollowThroughCase | undefined> {
    const document = await this.db.collection("caseRuns").doc(caseId).get();
    return document.exists ? (document.data() as FollowThroughCase) : undefined;
  }

  async listEvidence(caseId: string): Promise<readonly EvidenceRecord[]> {
    const snapshot = await this.db
      .collection("caseRuns")
      .doc(caseId)
      .collection("evidence")
      .orderBy("recordedAt", "asc")
      .get();
    return snapshot.docs.map((document) => document.data() as EvidenceRecord);
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
      transaction.create(reference, {
        status: "RESERVED",
        idempotencyKey,
        deleteAt: firestoreDeleteAt(new Date().toISOString())
      });
      return { status: "RESERVED" as const };
    });
  }

  async succeed(idempotencyKey: string, receipt: ActionReceipt): Promise<void> {
    await this.db
      .collection("actionRecords")
      .doc(idempotencyKey.slice(7))
      .set({
        status: "SUCCEEDED",
        idempotencyKey,
        receipt,
        deleteAt: firestoreDeleteAt(new Date().toISOString())
      });
  }

  async fail(idempotencyKey: string, reasonCode: string): Promise<void> {
    await this.db.collection("actionRecords").doc(idempotencyKey.slice(7)).delete();
    await this.db.collection("actionFailures").add({
      idempotencyKey,
      reasonCode,
      occurredAt: new Date().toISOString(),
      deleteAt: firestoreDeleteAt(new Date().toISOString())
    });
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
      transaction.create(evidenceRef, {
        ...input.evidence,
        deleteAt: firestoreDeleteAt(input.evidence.recordedAt)
      });
      transaction.update(caseRef, {
        state: input.nextState,
        version: input.expectedVersion + 1,
        ...(input.nextState === "DONE"
          ? {
              completedLevel: input.evidence.candidate.level,
              deleteAt: firestoreDeleteAt(input.evidence.recordedAt)
            }
          : {})
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
      const existingForCase = await transaction.get(
        this.db.collection("notifications").where("caseId", "==", record.caseId)
      );
      if (existingForCase.size >= 3) throw new Error("NOTIFICATION_BUDGET_EXHAUSTED");
      transaction.create(reference, { ...record, deleteAt: firestoreDeleteAt(record.createdAt) });
      return { record, duplicate: false };
    });
  }

  async createInterventionIfAbsent(
    record: InterventionRecord
  ): Promise<{ record: InterventionRecord; duplicate: boolean }> {
    const reference = this.db.collection("interventions").doc(record.dedupeKey.slice(7));
    return this.db.runTransaction(async (transaction) => {
      const current = await transaction.get(reference);
      if (current.exists) return { record: current.data() as InterventionRecord, duplicate: true };
      transaction.create(reference, { ...record, deleteAt: firestoreDeleteAt(record.createdAt) });
      return { record, duplicate: false };
    });
  }

  async listInterventions(caseId: string): Promise<readonly InterventionRecord[]> {
    const snapshot = await this.db
      .collection("interventions")
      .where("caseId", "==", caseId)
      .orderBy("createdAt", "asc")
      .get();
    return snapshot.docs.map((document) => document.data() as InterventionRecord);
  }

  async reserveDelivery(key: string): Promise<"RESERVED" | "IN_FLIGHT" | EmailDeliveryReceipt> {
    const reference = this.db.collection("emailDeliveries").doc(key.slice(7));
    return this.db.runTransaction(async (transaction) => {
      const current = await transaction.get(reference);
      if (current.exists) {
        const data = current.data() as { status: string; receipt?: EmailDeliveryReceipt };
        return data.status === "COMPLETED" && data.receipt ? data.receipt : "IN_FLIGHT";
      }
      transaction.create(reference, {
        status: "IN_FLIGHT",
        key,
        deleteAt: firestoreDeleteAt(new Date().toISOString())
      });
      return "RESERVED";
    });
  }

  async completeDelivery(key: string, receipt: EmailDeliveryReceipt): Promise<void> {
    await this.db
      .collection("emailDeliveries")
      .doc(key.slice(7))
      .set({
        status: "COMPLETED",
        key,
        receipt,
        deleteAt: firestoreDeleteAt(new Date().toISOString())
      });
  }

  async failDelivery(key: string): Promise<void> {
    await this.db.collection("emailDeliveries").doc(key.slice(7)).delete();
  }

  async reserveCallback(
    dedupeKey: string,
    receivedAt: string
  ): Promise<"RESERVED" | "IN_FLIGHT" | "COMPLETED"> {
    const reference = this.db.collection("callbackDedupe").doc(dedupeKey.slice(7));
    return this.db.runTransaction(async (transaction) => {
      const current = await transaction.get(reference);
      if (current.exists) return current.get("status") === "COMPLETED" ? "COMPLETED" : "IN_FLIGHT";
      transaction.create(reference, {
        receivedAt,
        status: "IN_FLIGHT",
        deleteAt: firestoreDeleteAt(receivedAt)
      });
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
