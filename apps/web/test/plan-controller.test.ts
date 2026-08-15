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
});
