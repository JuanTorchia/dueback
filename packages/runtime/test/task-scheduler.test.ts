import { describe, expect, it, vi } from "vitest";
import type { CloudTasksClient } from "@google-cloud/tasks";
import { TaskScheduler } from "../src/task-scheduler.js";

describe("TaskScheduler", () => {
  it("uses a stable task name and treats ALREADY_EXISTS as deduplication", async () => {
    const client = {
      queuePath: () => "projects/demo/locations/us-central1/queues/cases",
      createTask: vi.fn().mockRejectedValue({ code: 6 })
    } as unknown as CloudTasksClient;
    const scheduler = new TaskScheduler(client, {
      projectId: "demo",
      location: "us-central1",
      queue: "cases",
      workerUrl: "https://dueback.test/api/internal/tasks/run-case",
      serviceAccountEmail: "tasks@demo.iam.gserviceaccount.com"
    });

    await expect(
      scheduler.scheduleCase({
        caseId: "case_1",
        expectedVersion: 2,
        wakeAt: "2026-08-15T12:00:00.000Z"
      })
    ).resolves.toMatchObject({ duplicate: true });
  });
});
