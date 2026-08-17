"use client";

import { useEffect, useState } from "react";
import {
  linkCurrentIdentityWithGoogle,
  recoverableIdentity
} from "../lib/firebase-client";

export function RecoverableIdentity({
  required,
  onChange
}: {
  readonly required: boolean;
  readonly onChange: (recoverable: boolean) => void;
}) {
  const [state, setState] = useState<"LOADING" | "ANONYMOUS" | "RECOVERABLE">("LOADING");
  const [email, setEmail] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    void recoverableIdentity().then((identity) => {
      setState(identity.isAnonymous ? "ANONYMOUS" : "RECOVERABLE");
      setEmail(identity.email);
      onChange(!identity.isAnonymous);
    }).catch(() => {
      setState("ANONYMOUS"); onChange(false);
    });
  }, [onChange]);

  if (state === "LOADING") return <div className="identity-gate" role="status">Checking how you can return to this case…</div>;
  if (state === "RECOVERABLE") return <div className="identity-gate ready"><span aria-hidden="true">✓</span><div><strong>Access saved</strong><p>{email ? `Continue with ${email}.` : "This case can be reopened after sign-in on another device."}</p></div></div>;
  return <div className="identity-gate" data-required={required}>
    <span aria-hidden="true">↗</span><div><strong>{required ? "Save access before DueBack sends" : "Save access to your follow-ups"}</strong>
      <p>{required ? "Real email continues after this tab closes. Link Google so only you can return on another device." : "Optional for the controlled demo. Your current anonymous access stays in this browser."}</p>
      <button type="button" className="secondary" disabled={busy} onClick={() => {
        setBusy(true); setError(undefined);
        void linkCurrentIdentityWithGoogle().then((result) => {
          setEmail(result.email); setState("RECOVERABLE"); onChange(true);
        }).catch((cause: unknown) => {
          const code = cause instanceof Error ? cause.message : "RECOVERABLE_SIGN_IN_FAILED";
          setError(code === "RECOVERABLE_ACCOUNT_ALREADY_EXISTS"
            ? "That Google account already has DueBack access. This draft remains safely in this browser; automatic case merging is not enabled yet."
            : code === "RECOVERABLE_SIGN_IN_CANCELLED" ? "Sign-in was cancelled. Nothing was sent." : "DueBack could not save access. Nothing was sent.");
        }).finally(() => {
          setBusy(false);
        });
      }}>{busy ? "Connecting…" : "Continue with Google"}</button>
      {error ? <p className="error" role="alert">{error}</p> : null}
    </div>
  </div>;
}
