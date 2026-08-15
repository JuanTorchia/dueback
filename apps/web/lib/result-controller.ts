import type { FollowThroughCase } from "@dueback/runtime/case-runner";
import type { EvidenceRecord } from "@dueback/runtime/evidence-service";

export interface CaseResultStore {
  get(caseId: string): Promise<FollowThroughCase | undefined>;
  listEvidence(caseId: string): Promise<readonly EvidenceRecord[]>;
}

export async function handleCaseResult(
  request: Request,
  caseId: string,
  dependencies: {
    authenticate: (request: Request) => Promise<{ uid: string }>;
    store: CaseResultStore;
  }
): Promise<Response> {
  try {
    const owner = await dependencies.authenticate(request);
    const item = await dependencies.store.get(caseId);
    if (!item) return Response.json({ error: "CASE_NOT_FOUND" }, { status: 404 });
    if (item.ownerId !== owner.uid)
      return Response.json({ error: "CASE_OWNERSHIP_REQUIRED" }, { status: 403 });
    const evidence = await dependencies.store.listEvidence(caseId);
    return Response.json({ case: item, evidence });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "RESULT_FAILED" },
      { status: 401 }
    );
  }
}
