"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { anonymousIdToken } from "../lib/firebase-client";
import { errorCopy } from "../lib/error-copy";

const examples = [
  {
    label: "Missing refund",
    text: "Northstar Store promised to refund USD 59 for order ORDER-1842 by August 20, 2026, but the refund has not arrived."
  },
  {
    label: "Cancellation",
    text: "Northstar Travel promised to cancel booking BOOKING-731 and confirm a full USD 120 refund by August 22, 2026."
  },
  {
    label: "Replacement",
    text: "Northstar Electronics promised to replace the damaged headphones from order ORDER-992 by August 25, 2026."
  },
  {
    label: "Missing document",
    text: "Northstar Insurance promised to email the coverage certificate for case CASE-441 by August 21, 2026."
  }
] as const;

export function IntakeForm() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File>();
  const [busy, setBusy] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string>();
  const [hydrated, setHydrated] = useState(false);

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
    <div className="card" data-testid="intake-form" data-hydrated={hydrated} aria-busy={busy}>
      <div className="form-heading">
        <span>Live recipe · company follow-up</span>
        <strong>What are you waiting to have done?</strong>
      </div>
      <p className="recipe-scope">
        Start with a refund, replacement, cancellation, delivery, or document a company owes you.
      </p>
      <div className="source-guide" aria-label="What you can give DueBack">
        <strong>Start with anything you have</strong>
        <div>
          <span>Write it yourself</span>
          <span>Paste an email or message</span>
          <span>Add a screenshot or photo</span>
          <span>Upload a PDF</span>
        </div>
      </div>
      <div>
        <label htmlFor="promise">Describe the outcome or paste the evidence</label>
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
      </div>
      <div className="example-picker">
        <span>Not sure what to add? Try an example:</span>
        <div>
          {examples.map((example) => (
            <button
              key={example.label}
              type="button"
              disabled={busy}
              onClick={() => {
                setText(example.text);
                setError(undefined);
              }}
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>
      <div className="input-divider"><span>or add evidence</span></div>
      <div className="file smart-file" data-has-file={Boolean(file)}>
        <label htmlFor="artifact">
          <strong>{file ? file.name : "Choose a screenshot, photo, or PDF"}</strong>
          <span>{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB · ready to analyze` : "Gemini will detect and read the format automatically · max 10 MB"}</span>
        </label>
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
      {file ? (
        <button className="remove-file" type="button" disabled={busy} onClick={() => {
          setFile(undefined);
        }}>
          Remove file
        </button>
      ) : null}
      {text.trim() && file ? <p className="combined-source">✓ Text and file will be analyzed together</p> : null}
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
      <button
        className="primary"
        type="button"
        disabled={!ready || busy}
        onClick={() => void submit()}
      >
        {busy ? "Building your plan…" : "Create my follow-up plan"}
      </button>
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
