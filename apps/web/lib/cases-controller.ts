import type { FollowThroughCase } from "@dueback/runtime/case-runner";

export type CaseBucket = "NEEDS_YOU" | "WORKING" | "DONE";

export interface CaseSummary {
  caseId: string;
  companyName: string;
  outcomeLabel: string;
  bucket: CaseBucket;
  statusLabel: string;
  lastActivityAt: string;
  nextStepLabel: string;
  attentionRequired: boolean;
  channelLabel: string;
}

export interface OwnerCaseStore {
  listByOwner(ownerId: string, limit: number): Promise<readonly FollowThroughCase[]>;
}

function bucket(state: FollowThroughCase["state"]): CaseBucket {
  if (["NEEDS_ATTENTION", "FAILED"].includes(state)) return "NEEDS_YOU";
  if (["DONE", "CANCELLED", "EXPIRED"].includes(state)) return "DONE";
  return "WORKING";
}

const status: Record<FollowThroughCase["state"], string> = {
  DRAFT: "Draft",
  AWAITING_APPROVAL: "Ready for your review",
  READY: "Scheduled",
  RUNNING: "Contacting the company",
  WAITING_EXTERNAL: "Waiting for the company",
  WAITING_RETRY: "Retrying safely",
  NEEDS_ATTENTION: "Needs your decision",
  DONE: "Proof accepted",
  FAILED: "Could not continue",
  CANCELLED: "Stopped",
  EXPIRED: "Approval expired"
};

function nextStep(item: FollowThroughCase): string {
  if (item.state === "NEEDS_ATTENTION") return "Review one decision";
  if (item.state === "DONE") return "Review the proof and limitation";
  if (item.state === "FAILED") return "Review why DueBack stopped";
  if (["CANCELLED", "EXPIRED"].includes(item.state)) return "No further action is authorized";
  if (item.state === "AWAITING_APPROVAL" || item.state === "DRAFT") return "Review and approve the plan";
  return "DueBack will keep this open until there is proof";
}

function companyName(item: FollowThroughCase): string {
  return item.plan.allowedRecipient.includes("@")
    ? item.plan.allowedRecipient.split("@").at(-1)?.split(".")[0] ?? "Company"
    : item.plan.allowedRecipient || "Company";
}

export function caseSummary(item: FollowThroughCase): CaseSummary {
  const requirement = item.plan.evidenceRequirements[0];
  return {
    caseId: item.caseId,
    companyName: companyName(item).replace(/(^|[-_])\w/g, (value) => value.replace(/[-_]/, " ").toUpperCase()),
    outcomeLabel: requirement?.subject ?? item.plan.messageSubject ?? "Company promise",
    bucket: bucket(item.state),
    statusLabel: status[item.state],
    lastActivityAt: item.lastAttemptAt ?? item.controlledAt ?? item.dueAt,
    nextStepLabel: nextStep(item),
    attentionRequired: bucket(item.state) === "NEEDS_YOU",
    channelLabel: item.plan.channelType === "MANAGED_EMAIL" ? "Email" : "Controlled demo"
  };
}

export async function handleCases(
  request: Request,
  dependencies: {
    authenticate: (request: Request) => Promise<{ uid: string }>;
    store: OwnerCaseStore;
  }
): Promise<Response> {
  try {
    const owner = await dependencies.authenticate(request);
    const url = new URL(request.url);
    const requestedLimit = Number(url.searchParams.get("limit") ?? 10);
    const limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 25) : 10;
    const requestedBucket = url.searchParams.get("bucket");
    const items = (await dependencies.store.listByOwner(owner.uid, 50))
      .map(caseSummary)
      .filter((item) => !requestedBucket || item.bucket === requestedBucket)
      .sort((left, right) => right.lastActivityAt.localeCompare(left.lastActivityAt))
      .slice(0, limit);
    return Response.json({ items, nextCursor: null });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "CASES_FAILED" },
      { status: 401 }
    );
  }
}
