import { describe, expect, it } from "vitest";
import { PlanService } from "@dueback/runtime/plan-service";
import type { DraftCase } from "@dueback/runtime/intake-service";
import { handlePlanRequest } from "../lib/plan-controller";

describe("plan API contract", () => {
  it("does not allow another owner to inspect a case", async () => {
    const service = new PlanService({
      get: () => Promise.resolve({ ownerId: "person_12345678" } as DraftCase),
      replace: () => Promise.resolve()
    });
    const response = await handlePlanRequest(
      new Request("https://dueback.test/api/cases/case_12345678/plan"),
      "case_12345678",
      {
        authenticate: () => Promise.resolve({ uid: "person_attacker" }),
        service,
        now: () => "2026-08-15T12:00:00.000Z"
      }
    );
    expect(response.status).toBe(403);
  });

  it("refuses approval when the persisted channel is unavailable", async () => {
    const service = new PlanService({
      get: () => Promise.resolve({
        ownerId: "person_12345678",
        plan: { channelType: "MANAGED_EMAIL" }
      } as DraftCase),
      replace: () => Promise.resolve()
    });
    const response = await handlePlanRequest(
      new Request("https://dueback.test/api/cases/case_12345678/plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          expectedPlanVersion: 1,
          expectedPlanHash: `sha256:${"a".repeat(64)}`
        })
      }),
      "case_12345678",
      {
        authenticate: () => Promise.resolve({ uid: "person_12345678" }),
        service,
        now: () => "2026-08-16T12:00:00.000Z",
        isChannelAvailable: () => false
      }
    );
    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({ error: "CONTACT_CHANNEL_UNAVAILABLE" });
  });
});
