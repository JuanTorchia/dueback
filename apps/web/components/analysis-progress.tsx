"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { anonymousIdToken } from "../lib/firebase-client";

interface AnalysisStatus {
  status: "QUEUED" | "ANALYZING" | "READY" | "FAILED";
  stage: "EVIDENCE_SECURED" | "GEMINI_EXTRACTION" | "VALIDATING" | "REVIEW_READY" | "FAILED";
  attemptCount: number;
  error?: string;
}

const stages = [
  ["EVIDENCE_SECURED", "Evidence secured"],
  ["GEMINI_EXTRACTION", "Gemini is reading the promise"],
  ["VALIDATING", "Checking dates, amounts and proof"],
  ["REVIEW_READY", "Review ready"]
] as const;

export function AnalysisProgress({ caseId }: { readonly caseId: string }) {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<AnalysisStatus>();
  const [error, setError] = useState<string>();
  const [retrying, setRetrying] = useState(false);
  const [pollGeneration, setPollGeneration] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const poll = async () => {
      try {
        const token = await anonymousIdToken();
        const response = await fetch(`/api/cases/${caseId}/analysis`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store"
        });
        const body = await response.json() as AnalysisStatus & { error?: string };
        if (!response.ok) throw new Error(body.error ?? "ANALYSIS_STATUS_FAILED");
        if (cancelled) return;
        setAnalysis(body);
        setError(undefined);
        if (body.status === "READY") {
          router.replace(`/cases/${caseId}/review`);
          return;
        }
        if (body.status !== "FAILED") timeout = setTimeout(() => void poll(), 1_200);
      } catch (cause) {
        if (cancelled) return;
        setError(cause instanceof Error ? cause.message : "ANALYSIS_STATUS_FAILED");
        timeout = setTimeout(() => void poll(), 3_000);
      }
    };
    void poll();
    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
    };
  }, [caseId, router, pollGeneration]);

  async function retry() {
    setRetrying(true);
    setError(undefined);
    try {
      const token = await anonymousIdToken();
      const response = await fetch(`/api/cases/${caseId}/analysis`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const body = await response.json() as AnalysisStatus & { error?: string };
      if (!response.ok) throw new Error(body.error ?? "ANALYSIS_RETRY_FAILED");
      setAnalysis(body);
      setPollGeneration((value) => value + 1);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "ANALYSIS_RETRY_FAILED");
    } finally {
      setRetrying(false);
    }
  }

  const activeIndex = analysis
    ? Math.max(0, stages.findIndex(([stage]) => stage === analysis.stage))
    : 0;
  const phaseAnnouncement = analysis?.status === "FAILED"
    ? "Analysis stopped. You can try again."
    : stages[activeIndex]?.[1] ?? "Evidence secured";
  return <section className="card durable-analysis" aria-busy={analysis?.status !== "FAILED"}>
    <span className="sr-only" role="status" aria-live="polite">{phaseAnnouncement}</span>
    <div className="analysis-visual" aria-hidden="true"><div className="progress-orbit"><span /></div><b>Gemini</b></div>
    <div>
      <div className="eyebrow">Saved and running in the background</div>
      <h2>{analysis?.status === "FAILED" ? "DueBack could not finish the analysis." : "Building your follow-up plan…"}</h2>
      <p>{analysis?.status === "FAILED"
        ? "Nothing was sent. Your private source is still available for a bounded retry."
        : "You can close this page. DueBack will keep the job and reopen the review when it is ready."}</p>
      <ol className="analysis-stage-list">
        {stages.map(([stage, label], index) => <li key={stage} data-state={index < activeIndex || analysis?.stage === "REVIEW_READY" ? "done" : index === activeIndex ? "active" : "pending"}>
          <span>{index < activeIndex || analysis?.stage === "REVIEW_READY" ? "✓" : index + 1}</span><strong>{label}</strong>
        </li>)}
      </ol>
      {analysis?.attemptCount ? <small>Bounded attempt {analysis.attemptCount} of 3</small> : null}
      {analysis?.status === "FAILED" ? <button type="button" disabled={retrying} onClick={() => void retry()}>{retrying ? "Restarting…" : "Try analysis again"}</button> : null}
      {error ? <p className="error" role="alert">DueBack could not refresh this saved job. Retrying automatically.</p> : null}
    </div>
  </section>;
}
