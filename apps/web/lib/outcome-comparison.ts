import type { FollowThroughCase } from "@dueback/runtime/case-runner";
import type { EvidenceRecord } from "@dueback/runtime/evidence-service";

export interface OutcomeComparisonRow {
  label: string;
  promised: string;
  observed: string;
  status: "MATCH" | "MISSING" | "CONFLICT";
}

export function outcomeComparison(
  item: FollowThroughCase,
  evidence: readonly EvidenceRecord[]
): OutcomeComparisonRow[] {
  const requirement = item.plan.evidenceRequirements[0];
  if (!requirement) return [];
  const record = [...evidence].reverse().find((entry) =>
    entry.verification.accepted || entry.candidate.level !== "REQUEST_ACKNOWLEDGED"
  ) ?? evidence.at(-1);
  const candidate = record?.candidate;
  const row = (label: string, promised: string | undefined, observed: string | undefined) => {
    if (promised === undefined) return undefined;
    return {
      label,
      promised,
      observed: observed ?? "Not stated in the reply",
      status: observed === undefined ? "MISSING" as const : observed === promised ? "MATCH" as const : "CONFLICT" as const
    };
  };
  return [
    row("Proof level", requirement.minimumLevel, candidate?.level),
    row("Reference", requirement.transactionRef, candidate?.transactionRef),
    row("Amount", requirement.amountMinor === undefined ? undefined : String(requirement.amountMinor), candidate?.amountMinor === undefined ? undefined : String(candidate.amountMinor)),
    row("Currency", requirement.currency, candidate?.currency),
    row("Subject", requirement.subject, candidate?.subject),
    row("Bill period", requirement.billPeriod, candidate?.billPeriod),
    row("Tracking", requirement.requiredEvidenceFields?.includes("trackingNumber") ? "Required" : undefined, candidate?.trackingNumber ? "Required" : undefined)
  ].filter((value): value is OutcomeComparisonRow => value !== undefined);
}
