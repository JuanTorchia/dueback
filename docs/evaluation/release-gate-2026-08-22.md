# Release gate — 2026-08-22

## Frozen candidate

- Source revision at the start of the gate: `3dd50b2`.
- Public app: <https://bulbasour-503317.web.app/en>.
- Cloud Run web revision: `dueback-web-00068-4kv`, receiving 100% of untagged traffic.
- Merchant Sandbox revision: `dueback-merchant-sandbox-00019-dst`, receiving 100% of traffic.
- Firestore: native mode, `us-central1`.
- Cloud Tasks queue: `dueback-cases`, `RUNNING`, two concurrent dispatches, two dispatches per
  second, five attempts, and 10–300 second backoff.

## Deterministic gates

Executed from the repository root on 2026-08-22 UTC:

```text
pnpm lint      PASS
pnpm typecheck PASS
pnpm test      PASS (295 reported tests)
pnpm build     PASS
```

`pnpm format:check` is not a release gate in this repository and reported 185 pre-existing files
that do not match the current Prettier configuration. No claim of a passing whole-repository format
gate is made.

## Public deployed gate

The first run found six stale Playwright locators after the multilingual copy and information
architecture changed. Screenshots showed rendered content rather than missing functionality. The
tests were updated to target current accessible names and correct browser-equivalent 200% reflow.

The complete deployed rerun then reported:

```text
19 passed
2 skipped (credential-gated controlled flows)
0 failed
duration: 2.4 minutes
```

Passing live paths include the primary missing-refund judge journey, ambiguous extraction repair,
general non-monetary promise, four example recipes, keyboard authorization, 320 CSS-pixel reflow,
durable return, stale-state recovery, and intake failure recovery.

## Remaining submission gates

- Record one continuous demo of no more than four minutes using the prepared English track or the
  complete English subtitle file.
- Publish the video on YouTube or Vimeo with public access.
- Add the public video URL to `docs/submission/devpost-copy.md` and the final checklist.
- Submit on Devpost and reopen the submitted entry anonymously.

Kimi WebBridge confirmed an authenticated YouTube Studio session for the participant-owned channel.
Its Devpost tabs closed immediately during two attempts on this machine, so no Devpost fields were
mutated and no submission claim is made.
