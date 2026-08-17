"use client";

import { useState } from "react";
import { signInWithExistingGoogle } from "../lib/firebase-client";

export function GoogleSignIn({
  onSignedIn,
  compact = false
}: {
  readonly onSignedIn: () => void;
  readonly compact?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  return <div className={compact ? "google-sign-in compact" : "google-sign-in"}>
    {!compact ? <p>Already saved your access? Sign in to recover the same private cases on this device.</p> : null}
    <button type="button" className="secondary" disabled={busy} onClick={() => {
      setBusy(true); setError(undefined);
      void signInWithExistingGoogle().then(() => { onSignedIn(); }).catch((cause: unknown) => {
        setError(cause instanceof Error && cause.message === "RECOVERABLE_SIGN_IN_CANCELLED"
          ? "Sign-in was cancelled. No case was changed."
          : "Google sign-in did not finish. Check that popups are allowed and try again.");
      }).finally(() => { setBusy(false); });
    }}>{busy ? "Signing in…" : "Sign in with Google"}</button>
    {error ? <p className="error" role="alert">{error}</p> : null}
  </div>;
}
