"use client";

import { useEffect, useState } from "react";
import type { FollowThroughCase } from "@dueback/runtime/case-runner";
import type { EvidenceRecord } from "@dueback/runtime/evidence-service";
import { anonymousIdToken } from "../lib/firebase-client";
import { CaseTimeline } from "./case-timeline";

interface ResultPayload {
  case: FollowThroughCase;
  evidence: EvidenceRecord[];
  error?: string;
}

export function CaseResult({ caseId }: { readonly caseId: string }) {
  const [payload, setPayload] = useState<ResultPayload>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const load = async () => {
      try {
        const token = await anonymousIdToken();
        const response = await fetch(`/api/cases/${caseId}/result`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store"
        });
        const result = (await response.json()) as ResultPayload;
        if (!response.ok) throw new Error(result.error ?? "RESULT_FAILED");
        if (cancelled) return;
        setPayload(result);
        setError(undefined);
        if (!["DONE", "CANCELLED", "NEEDS_ATTENTION"].includes(result.case.state)) {
          timeout = setTimeout(() => void load(), 2_000);
        }
      } catch (cause: unknown) {
        if (cancelled) return;
        setError(cause instanceof Error ? cause.message : "RESULT_FAILED");
      }
    };
    void load();
    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
    };
  }, [caseId]);

  if (error) return <section className="card error">{error}</section>;
  if (!payload) return <section className="card">Loading the auditable timeline…</section>;
  const done = payload.case.state === "DONE";
  const acknowledgement = payload.evidence.some(
    (item) => item.candidate.level === "REQUEST_ACKNOWLEDGED" && !item.verification.accepted
  );
  return (
    <div className="result-grid">
      <section className={`card outcome ${done ? "verified" : "waiting"}`}>
        <div className="eyebrow">{done ? "Proof of Done" : "Still working"}</div>
        <h2>
          {done
            ? "Merchant-confirmed refund"
            : acknowledgement
              ? "Not done — request received only"
              : "Waiting for sufficient proof"}
        </h2>
        <p>
          {done
            ? "The merchant signed evidence matching this case, amount, currency, and reference."
            : "DueBack keeps the case open until evidence meets the approved contract."}
        </p>
        <div className="claim-limit">
          Merchant-confirmed does not mean bank settlement. Funds settlement has not been verified.
        </div>
      </section>
      <section className="card">
        <h2>Case controls</h2>
        <p>
          Stop future actions, remove your data, or report that a completed result did not arrive.
        </p>
        <a className="button-link" href={`/cases/${caseId}/exception`}>
          {done ? "This isn't resolved" : "Review or stop this case"}
        </a>
      </section>
      <section className="card">
        <h2>Auditable timeline</h2>
        <CaseTimeline evidence={payload.evidence} />
      </section>
    </div>
  );
}
