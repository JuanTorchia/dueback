"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { anonymousIdToken } from "../lib/firebase-client";
import { errorCopy } from "../lib/error-copy";
import { examplePromises } from "../lib/example-promises";

export function IntakeForm() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File>();
  const [busy, setBusy] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string>();
  const [hydrated, setHydrated] = useState(false);
  const examples = examplePromises();

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!busy) {
      setElapsedSeconds(0);
      return;
    }
    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1_000);
    return () => {
      window.clearInterval(interval);
    };
  }, [busy]);

  async function submit() {
    setBusy(true);
    setError(undefined);
    try {
      const token = await anonymousIdToken();
      const body = new FormData();
      if (text.trim()) body.set("text", text);
      if (file) body.set("file", file);
      const response = await fetch("/api/intake", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body
      });
      const result = (await response.json()) as { caseId?: string; error?: string };
      if (!response.ok || !result.caseId) throw new Error(result.error ?? "INTAKE_FAILED");
      router.push(`/cases/${result.caseId}/review`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "INTAKE_FAILED");
      setBusy(false);
    }
  }

  const ready = text.trim().length > 0 || file !== undefined;
  return (
    <div className="card intake-composer-card" data-testid="intake-form" data-hydrated={hydrated} aria-busy={busy}>
      <div className="form-heading">
        <span>Live recipe · company follow-up</span>
        <strong>Give DueBack the messy version.</strong>
      </div>
      <p className="recipe-scope">
        Describe it, paste the message, attach the proof—or combine them. Gemini will organize it.
      </p>
      <div className="smart-composer">
        <label className="composer-label" htmlFor="promise">What happened, and what are you waiting for?</label>
        <textarea
          id="promise"
          value={text}
          disabled={busy}
          onChange={(event) => {
            setText(event.target.value);
          }}
          placeholder="Example: The store promised to refund $59 for order 1842 by Friday…"
          maxLength={50_000}
        />
        <div className="composer-footer">
          <div className="composer-attachment">
            <label htmlFor="artifact">{file ? file.name : "+ Add screenshot, photo, or PDF"}</label>
            <input
              id="artifact"
              type="file"
              disabled={busy}
              accept="application/pdf,image/jpeg,image/png"
              onChange={(event) => {
                setFile(event.target.files?.[0]);
              }}
            />
          </div>
          <button
            className="composer-submit"
            type="button"
            disabled={!ready || busy}
            onClick={() => void submit()}
          >
            {busy ? "Working…" : "Build my plan →"}
          </button>
        </div>
      </div>
      {file ? (
        <div className="attachment-status"><span>{(file.size / 1024 / 1024).toFixed(1)} MB · ready to analyze</span><button className="remove-file" type="button" disabled={busy} onClick={() => { setFile(undefined); }}>Remove</button></div>
      ) : null}
      {text.trim() && file ? <p className="combined-source">✓ Text and file will be analyzed together</p> : null}
      <div className="example-picker">
        <span>Or start with a common situation</span>
        <div>
          {examples.map((example) => (
            <button key={example.label} type="button" disabled={busy} onClick={() => { setText(example.text); setError(undefined); }}>
              {example.label}<span aria-hidden="true">→</span>
            </button>
          ))}
        </div>
      </div>
      <details className="mobile-after">
        <summary>What happens after I approve?</summary>
        <ol>
          <li>DueBack sends the one follow-up you approved.</li>
          <li>It rejects acknowledgements that do not prove the result.</li>
          <li>Your durable case page records every decision and supported result.</li>
        </ol>
        <p>The accelerated demo uses a controlled adapter. A controlled email pilot is available only for reviewed, allowlisted recipients.</p>
      </details>
      {busy ? (
        <div className="analysis-progress">
          <div className="progress-orbit" aria-hidden="true"><span /></div>
          <div>
            <strong>Gemini is reading your evidence</strong>
            <p>
              {elapsedSeconds < 15
                ? "Extracting the outcome, responsible party, dates, and proof requirements."
                : elapsedSeconds < 30
                  ? "Still working — complex or ambiguous evidence can take a little longer."
                  : "This is taking longer than usual. Nothing has been sent to the company."}
            </p>
            <small aria-hidden="true">{elapsedSeconds}s elapsed · usually 10–25 seconds</small>
          </div>
        </div>
      ) : null}
      <p className="privacy">
        DueBack processes only what you share. Raw files expire within 24 hours. No external action
        happens before you review and activate a versioned plan. <a href="/privacy">Privacy details</a>.
      </p>
      <p className="sr-status" role="status" aria-live="polite">
        {busy
          ? elapsedSeconds < 15
            ? "Gemini is analyzing the evidence. This usually takes 10 to 25 seconds."
            : elapsedSeconds < 30
              ? "The analysis is still working on complex or ambiguous evidence."
              : "The analysis is taking longer than usual. Nothing has been sent to the company."
          : ""}
      </p>
      {error ? (
        <p className="error" role="alert">
          {errorCopy(error)}
        </p>
      ) : null}
    </div>
  );
}
