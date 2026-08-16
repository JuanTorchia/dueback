"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { anonymousIdToken } from "../lib/firebase-client";
import { errorCopy } from "../lib/error-copy";

export function IntakeForm() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

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
        <span>Start a case</span>
        <strong>Add the company’s promise</strong>
      </div>
      <div>
        <label htmlFor="promise">Paste the promise or add helpful context</label>
        <textarea
          id="promise"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
          }}
          placeholder="Paste an email, message, or describe what you are waiting for…"
          maxLength={50_000}
        />
      </div>
      <div className="input-divider"><span>or add evidence</span></div>
      <div className="file smart-file" data-has-file={Boolean(file)}>
        <label htmlFor="artifact">
          <strong>{file ? file.name : "Drop or choose a screenshot, photo, or PDF"}</strong>
          <span>{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB · ready to analyze` : "Gemini will detect and read the format automatically · max 10 MB"}</span>
        </label>
        <input
          id="artifact"
          type="file"
          accept="application/pdf,image/jpeg,image/png"
          onChange={(event) => {
            setFile(event.target.files?.[0]);
          }}
        />
      </div>
      {text.trim() && file ? <p className="combined-source">✓ Text and file will be analyzed together</p> : null}
      <p className="privacy">
        DueBack processes only what you share. Raw files expire within 24 hours. Nothing is sent to
        a company before you review and activate a versioned plan. <a href="/privacy">Privacy details</a>.
      </p>
      <button
        className="primary"
        type="button"
        disabled={!ready || busy}
        onClick={() => void submit()}
      >
        {busy ? "Reading the promise…" : "Create my follow-up plan"}
      </button>
      <p className="sr-status" role="status" aria-live="polite">
        {busy ? "DueBack is finding and checking the promise." : ""}
      </p>
      {error ? (
        <p className="error" role="alert">
          {errorCopy(error)}
        </p>
      ) : null}
    </div>
  );
}
