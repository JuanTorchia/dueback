import { CloudTasksClient, protos } from "@google-cloud/tasks";
import { stableHash } from "@dueback/domain";

export interface TaskSchedulerConfig {
  readonly projectId: string;
  readonly location: string;
  readonly queue: string;
  readonly workerUrl: string;
  readonly serviceAccountEmail: string;
}

export class TaskScheduler {
  constructor(
    private readonly client: CloudTasksClient,
    private readonly config: TaskSchedulerConfig
  ) {}

  async scheduleCase(input: {
    readonly caseId: string;
    readonly expectedVersion: number;
    readonly wakeAt: string;
  }): Promise<{ taskName: string; duplicate: boolean }> {
    const parent = this.client.queuePath(
      this.config.projectId,
      this.config.location,
      this.config.queue
    );
    const stableName = stableHash({ namespace: "dueback/task/v1", ...input }).slice(7, 39);
    const taskName = `${parent}/tasks/case-${stableName}`;
    const body = Buffer.from(
      JSON.stringify({ caseId: input.caseId, expectedVersion: input.expectedVersion })
    ).toString("base64");
    const task: protos.google.cloud.tasks.v2.ITask = {
      name: taskName,
      scheduleTime: { seconds: Math.floor(Date.parse(input.wakeAt) / 1000) },
      httpRequest: {
        httpMethod: protos.google.cloud.tasks.v2.HttpMethod.POST,
        url: this.config.workerUrl,
        headers: { "Content-Type": "application/json" },
        body,
        oidcToken: { serviceAccountEmail: this.config.serviceAccountEmail }
      }
    };

    try {
      const [created] = await this.client.createTask({ parent, task });
      return { taskName: created.name ?? taskName, duplicate: false };
    } catch (error) {
      const code = (error as { code?: number }).code;
      if (code === 6) return { taskName, duplicate: true };
      throw error;
    }
  }
}
