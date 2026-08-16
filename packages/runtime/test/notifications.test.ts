import { describe, expect, it, vi } from "vitest";
import {
  NotificationDeliveryService,
  notificationRecord,
  type NotificationRecord
} from "../src/notifications";
import { notificationSchema } from "@dueback/contracts";

function fixture(): NotificationRecord {
  return notificationRecord({
    caseId: "case_12345678",
    ownerId: "owner_12345678",
    correlationId: "corr_12345678",
    kind: "CASE_COMPLETED",
    createdAt: "2026-08-16T12:00:00.000Z"
  });
}

describe("notification delivery", () => {
  it("records unavailable without changing the durable notification", async () => {
    const updateDelivery = vi.fn(() => Promise.resolve());
    const service = new NotificationDeliveryService({
      createIfAbsent: (record) => Promise.resolve({ record, duplicate: false }),
      updateDelivery
    });
    await expect(service.deliver(fixture(), undefined)).resolves.toMatchObject({
      deliveryChannel: "IN_APP",
      deliveryStatus: "UNAVAILABLE"
    });
    expect(updateDelivery).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      deliveryStatus: "UNAVAILABLE"
    }));
  });

  it("projects provider acceptance but does not reinterpret case truth", async () => {
    const updateDelivery = vi.fn(() => Promise.resolve());
    const service = new NotificationDeliveryService({
      createIfAbsent: (record) => Promise.resolve({ record, duplicate: false }),
      updateDelivery
    }, {
      deliver: () => Promise.resolve({
        receipt: { deliveryId: "email_12345678", acceptedAt: "2026-08-16T12:00:01.000Z" },
        duplicate: false
      })
    });
    await expect(service.deliver(fixture(), "owner@example.test")).resolves.toMatchObject({
      deliveryChannel: "EMAIL",
      deliveryStatus: "ACCEPTED",
      deliveryId: "email_12345678"
    });
  });

  it("records provider failure instead of failing the completed case", async () => {
    const updateDelivery = vi.fn(() => Promise.resolve());
    const service = new NotificationDeliveryService({
      createIfAbsent: (record) => Promise.resolve({ record, duplicate: false }),
      updateDelivery
    }, { deliver: () => Promise.reject(new Error("provider down")) });
    await expect(service.deliver(fixture(), "owner@example.test")).resolves.toMatchObject({
      deliveryStatus: "FAILED"
    });
  });

  it.each(["BOUNCED", "SUPPRESSED"] as const)("accepts truthful %s delivery projection", (deliveryStatus) => {
    expect(notificationSchema.parse({
      ...fixture(),
      deliveryChannel: "EMAIL",
      deliveryStatus
    }).deliveryStatus).toBe(deliveryStatus);
  });
});
