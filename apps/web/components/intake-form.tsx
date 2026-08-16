"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { anonymousIdToken } from "../lib/firebase-client";

export function IntakeForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"paste" | "upload">("paste");
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
      if (mode === "paste") body.set("text", text);
      else if (file) body.set("file", file);
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

  const ready = mode === "paste" ? text.trim().length > 0 : file !== undefined;
  return (
    <div className="card" data-testid="intake-form" data-hydrated={hydrated}>
      <div className="tabs" aria-label="Promise input method">
        <button
          className="tab"
          data-active={mode === "paste"}
          onClick={() => {
            setMode("paste");
          }}
          type="button"
        >
          Paste text
        </button>
        <button
          className="tab"
          data-active={mode === "upload"}
          onClick={() => {
            setMode("upload");
          }}
          type="button"
        >
          Upload proof
        </button>
      </div>
      {mode === "paste" ? (
        <div>
          <label htmlFor="promise">What did the company promise?</label>
          <textarea
            id="promise"
            value={text}
            onChange={(event) => {
              setText(event.target.value);
            }}
            placeholder="Paste the email or message here…"
            maxLength={50_000}
          />
        </div>
      ) : (
        <div className="file">
          <label htmlFor="artifact">PDF, JPEG, or PNG · max 10 MB</label>
          <input
            id="artifact"
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            onChange={(event) => {
              setFile(event.target.files?.[0]);
            }}
          />
        </div>
      )}
      <p className="privacy">
        DueBack processes only what you share. Raw files expire within 24 hours. Nothing is sent to
        a company before you review and activate a versioned plan.
      </p>
      <button
        className="primary"
        type="button"
        disabled={!ready || busy}
        onClick={() => void submit()}
      >
        {busy ? "Finding the promise…" : "Build my resolution plan"}
      </button>
      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
