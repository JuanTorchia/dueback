import { describe, expect, it, vi } from "vitest";
import { handleRunCaseTask } from "../lib/task-controller";

describe("Cloud Tasks worker controller", () => {
  it("requires a Cloud Tasks identity marker", async () => {
    const run = vi.fn();
    const response = await handleRunCaseTask(
      new Request("https://dueback.test/api/internal/tasks/run-case", {
        method: "POST",
        body: "{}"
      }),
      { run } as never,
      () => "2026-08-15T12:00:00.000Z"
    );
    expect(response.status).toBe(401);
    expect(run).not.toHaveBeenCalled();
  });

  it("passes a version-bound task to the runner", async () => {
    const run = vi.fn(() =>
      Promise.resolve({
        status: "WAITING_EXTERNAL" as const,
        broker: { status: "PENDING_DUPLICATE" as const, idempotencyKey: `sha256:${"a".repeat(64)}` }
      })
    );
    const response = await handleRunCaseTask(
      new Request("https://dueback.test/api/internal/tasks/run-case", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-cloudtasks-taskname": "projects/p/locations/l/queues/q/tasks/t"
        },
        body: JSON.stringify({ caseId: "case_12345678", expectedVersion: 2 })
      }),
      { run } as never,
      () => "2026-08-15T12:00:00.000Z"
    );
    expect(response.status).toBe(200);
    expect(run).toHaveBeenCalledWith({
      caseId: "case_12345678",
      expectedVersion: 2,
      now: "2026-08-15T12:00:00.000Z"
    });
  });
});
