import type { CaseRunner } from "@dueback/runtime/case-runner";

export async function handleRunCaseTask(
  request: Request,
  runner: CaseRunner,
  now: () => string
): Promise<Response> {
  if (!request.headers.get("x-cloudtasks-taskname"))
    return Response.json({ error: "CLOUD_TASK_IDENTITY_REQUIRED" }, { status: 401 });
  try {
    const body = (await request.json()) as {
      caseId?: string;
      expectedVersion?: number;
      correlationId?: string;
    };
    const expectedVersion = body.expectedVersion;
    if (!body.caseId || typeof expectedVersion !== "number" || !Number.isInteger(expectedVersion))
      return Response.json({ error: "INVALID_TASK" }, { status: 400 });
    return Response.json(
      await runner.run({
        caseId: body.caseId,
        expectedVersion,
        now: now(),
        ...(body.correlationId ? { correlationId: body.correlationId } : {})
      })
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "TASK_FAILED" },
      { status: 500 }
    );
  }
}
