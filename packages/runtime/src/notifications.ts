import { stableHash } from "@dueback/domain";

export type NotificationKind = "NEEDS_ATTENTION" | "CASE_COMPLETED";

export interface NotificationRecord {
  readonly notificationId: string;
  readonly dedupeKey: string;
  readonly caseId: string;
  readonly correlationId: string;
  readonly ownerId: string;
  readonly kind: NotificationKind;
  readonly deepLinkPath: string;
  readonly createdAt: string;
  readonly deliveryChannel?: "IN_APP" | "EMAIL";
  readonly deliveryStatus?:
    | "RECORDED"
    | "ACCEPTED"
    | "DELIVERED"
    | "BOUNCED"
    | "SUPPRESSED"
    | "FAILED"
    | "UNAVAILABLE";
  readonly deliveryId?: string;
  readonly deliveredAt?: string;
}

export interface NotificationStore {
  createIfAbsent(
    record: NotificationRecord
  ): Promise<{ record: NotificationRecord; duplicate: boolean }>;
  updateDelivery?(
    dedupeKey: string,
    update: Pick<NotificationRecord, "deliveryChannel" | "deliveryStatus"> & {
      deliveryId?: string;
      deliveredAt?: string;
    }
  ): Promise<void>;
  listNotifications?(caseId: string): Promise<readonly NotificationRecord[]>;
}

export function notificationRecord(input: {
  caseId: string;
  ownerId: string;
  kind: NotificationKind;
  createdAt: string;
  correlationId: string;
}): NotificationRecord {
  const dedupeKey = stableHash({
    namespace: "dueback/notification/v1",
    caseId: input.caseId,
    correlationId: input.correlationId,
    kind: input.kind
  });
  return {
    notificationId: `notification_${dedupeKey.slice(7, 31)}`,
    dedupeKey,
    caseId: input.caseId,
    correlationId: input.correlationId,
    ownerId: input.ownerId,
    kind: input.kind,
    deepLinkPath: `/cases/${input.caseId}/result`,
    createdAt: input.createdAt,
    deliveryChannel: "IN_APP",
    deliveryStatus: "RECORDED"
  };
}
