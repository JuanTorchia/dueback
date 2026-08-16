import type { PlanService } from "@dueback/runtime/plan-service";

export interface PlanControllerDependencies {
  readonly authenticate: (request: Request) => Promise<{ uid: string }>;
  readonly service: PlanService;
  readonly now: () => string;
}

export async function handlePlanRequest(
  request: Request,
  caseId: string,
  dependencies: PlanControllerDependencies
): Promise<Response> {
  try {
    const owner = await dependencies.authenticate(request);
    if (request.method === "GET") {
      return Response.json(await dependencies.service.inspect(caseId, owner.uid));
    }
    const body = (await request.json()) as {
      action?: string;
      expectedPlanVersion?: number;
      expectedPlanHash?: string;
      revision?: Record<string, unknown>;
    };
    if (body.action === "simulate") {
      return Response.json(await dependencies.service.simulate(caseId, owner.uid));
    }
    if (body.action === "revise" && body.expectedPlanVersion !== undefined) {
      return Response.json(
        await dependencies.service.revise(
          caseId,
          owner.uid,
          body.expectedPlanVersion,
          body.revision ?? {}
        )
      );
    }
    if (
      body.action === "approve" &&
      body.expectedPlanVersion !== undefined &&
      body.expectedPlanHash
    ) {
      return Response.json(
        await dependencies.service.approve({
          caseId,
          ownerId: owner.uid,
          expectedPlanVersion: body.expectedPlanVersion,
          expectedPlanHash: body.expectedPlanHash,
          now: dependencies.now()
        })
      );
    }
    if (body.action === "reject" && body.expectedPlanVersion !== undefined) {
      return Response.json(
        await dependencies.service.reject(caseId, owner.uid, body.expectedPlanVersion)
      );
    }
    if (body.action === "delete") {
      await dependencies.service.deleteDraft(caseId, owner.uid);
      return Response.json({ status: "DRAFT_DELETED" }, { status: 202 });
    }
    return Response.json({ error: "INVALID_PLAN_COMMAND" }, { status: 400 });
  } catch (cause) {
    const error = cause instanceof Error ? cause.message : "PLAN_COMMAND_FAILED";
    const status = error.includes("OWNERSHIP") ? 403 : error.includes("NOT_FOUND") ? 404 : 409;
    return Response.json({ error }, { status });
  }
}
