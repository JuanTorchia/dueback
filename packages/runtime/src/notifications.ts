import { stableHash } from "@dueback/domain";

export type NotificationKind = "NEEDS_ATTENTION" | "CASE_COMPLETED";

export interface NotificationRecord {
  readonly notificationId: string;
  readonly dedupeKey: string;
  readonly caseId: string;
  readonly ownerId: string;
  readonly kind: NotificationKind;
  readonly deepLinkPath: string;
  readonly createdAt: string;
  readonly deliveredAt?: string;
}

export interface NotificationStore {
  createIfAbsent(
    record: NotificationRecord
  ): Promise<{ record: NotificationRecord; duplicate: boolean }>;
}

export function notificationRecord(input: {
  caseId: string;
  ownerId: string;
  kind: NotificationKind;
  createdAt: string;
}): NotificationRecord {
  const dedupeKey = stableHash({
    namespace: "dueback/notification/v1",
    caseId: input.caseId,
    kind: input.kind
  });
  return {
    notificationId: `notification_${dedupeKey.slice(7, 31)}`,
    dedupeKey,
    caseId: input.caseId,
    ownerId: input.ownerId,
    kind: input.kind,
    deepLinkPath: `/cases/${input.caseId}/result`,
    createdAt: input.createdAt
  };
}
