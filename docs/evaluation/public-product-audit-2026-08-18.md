# Public product audit — 2026-08-18

## Outcome

DueBack remains a GO for the hackathon, but the video gate stays closed until the production
follow-up retry is captured with redacted Cloud evidence. This audit replaced the earlier assumption
that a successful first send meant the agent would keep following through.

## Release under test

- Public URL: `https://bulbasour-503317.web.app`
- Git commit: `e4a2859`
- Cloud Run revision: `dueback-web-00057-cj6` at 100% traffic
- Firebase Hosting: pinned after that revision was deployed
- Analysis storage: private uniform-access bucket with a one-day defensive lifecycle rule
- Channels observed from the public capability endpoint: Controlled Sandbox `AVAILABLE`, Managed
  Email `AVAILABLE`, Gmail and Partner API `FUTURE`

## Defects found and corrected

1. A successful send or weak ACK could leave a case in `WAITING_EXTERNAL` without another task.
   The runtime now schedules a version-bound next wake, uses a new idempotency key for each approved
   logical follow-up, adapts later copy, and raises one intervention when the send budget ends.
2. Intake held the HTTP request open while Gemini ran. It now creates an owner-scoped analysis job,
   stores the bounded artifact privately, enqueues an OIDC Cloud Task, and opens a resumable analysis
   route immediately.
3. The first production analysis jobs failed because Firestore TTL metadata (`deleteAt`) entered a
   strict domain parser. A regression test now proves TTL metadata is removed before validation.
4. Mobile navigation hid `My follow-ups`, contradicting the close-and-return promise. The link is now
   visible and the judge-path test must leave the analysis page, find the saved job, and reopen it.
5. Inbox and result copy projected recipient providers, raw minor currency units, enums, stale dates,
   and duplicate ACK language. New projections use the reviewed counterparty, formatted money,
   human evidence labels, newest activity, and valid future wakes only.
6. Fractional Cloud Task times were rounded down, so a task could arrive milliseconds early, return
   `NOT_DUE` with HTTP 200 and disappear. Scheduling now rounds up; an early worker response is also
   HTTP 503 so Cloud Tasks preserves the wake.

## Evidence observed

- Local gate: all package/root tests, typecheck, lint and production build passed.
- Deterministic evaluation: 28/28 passed; it contains zero live model calls and is labeled accordingly.
- Firestore rules emulator: 4/4 passed.
- Focused public regression after the TTL fix: 7/7 live flows passed sequentially with one worker and
  zero retries (ambiguous review, mobile judge flow, four visible examples, general document promise).
- Full public suite: 19 passed, 2 intentionally skipped. Cross-device Google return requires an
  interactive account and had already passed manually; Managed Email is intentionally opt-in and
  was not re-sent by the generic suite.
- Strengthened public mobile judge path on revision `00054`: 1/1 passed in 30.6 seconds. It explicitly
  observed `analyzing`, left for `My follow-ups`, reopened the saved job, reviewed/approved it, and
  returned only after sufficient signed sandbox evidence.
- Cloud Run error query for revision `00053` after the fix returned no severity `ERROR` records.
- A 390×844 visual capture confirmed readable hierarchy, phase progress, background-work copy, and
  visible `My follow-ups` navigation on the final UI.
- Final production judge path on revision `00057`: 1/1 passed with one worker and zero Playwright
  retries in 1.3 minutes. Redacted Cloud request sequence: worker `200` → sandbox injected `503` →
  worker `200` → sandbox `202` → signed callback `202` → stale task no-op `200` → current worker
  `200` → sandbox `200` → signed callback `200`.
- Redacted Firestore projection for case suffix `66df814d`: terminal state `DONE`, version 6,
  action ordinal 3; two successful action records with different key suffixes; evidence
  `REQUEST_ACKNOWLEDGED` rejected and `MERCHANT_CONFIRMED` accepted. No raw message, owner ID,
  recipient or full identifier is included here.

## Remaining honest gates

- Update the four-minute video and submission evidence from this pinned release; do not substitute a
  different unverified revision after recording.
- Do not claim arbitrary-company email, bank settlement, a completed human study, or automated
  cross-device credentials.
