# Final General Audit — 2026-08-17

Verdict: **release candidate; identity and controlled-email gates passed, final video/submission pending**.

## Proven complete

- Public app: <https://bulbasour-503317.web.app>.
- Public source: <https://github.com/JuanTorchia/dueback> (`main`, HTTP 200, public visibility).
- Product revision: `dueback-web-00049-4jd`, 100% Cloud Run traffic and pinned Firebase Hosting
  rewrite. Build: `fdad7f79-c23a-464d-958e-36fbdd06935b`, `SUCCESS`.
- Google stack: Gemini 3.5 Flash on Vertex AI, Genkit 1.41, Cloud Run, Firestore, Cloud Tasks and
  Firebase Authentication.
- Full local release commands passed: package/root tests, typecheck, lint, production build,
  28/28 deterministic evaluation, four Firestore Emulator rule tests and `git diff --check`.
- Public browser evidence with one worker and zero retries:
  - seven live product stories passed, including four visible recipes, ambiguous correction,
    non-monetary promise and the main mobile judge path;
  - twelve deterministic browser paths passed for authorization, editing, intake failure/delay,
    safe projection, retained state, closed-tab inbox return and accessibility/reflow.
- Anonymous intake now fails safe to the controlled sandbox even while Managed Email is configured.
  A real email recipient requires explicit channel selection, recoverable identity and new approval.
- Server-side consumer projection omits owner ID, approval/hash, raw message content and provider
  identifiers. Cross-owner detail/export/technical routes return indistinguishable not-found results.
- Weak acknowledgement stays open; explicit matching evidence closes with a claim limitation.
- Current dependency advisories are visible and reachability-reviewed in
  `docs/security/dependency-audit.md`; they are not silently ignored.

## Not yet proven — do not claim

1. **Final video:** no public unedited `≤4:00` YouTube/Vimeo artifact exists. Consequently language,
   visible Cloud evidence and exact duration are unverified.
2. **Human study:** no eight-person unassisted study has been run. Synthetic agent notes are not
   human evidence and remain untracked from release claims.
3. **Devpost submission:** final submission and deadline receipt are external and not yet recorded.

## Release decision

The Taskmaster product is technically ready to record. Real Google recovery and the current-revision
controlled Managed Email false-DONE path were completed on 2026-08-18 and are documented in
`docs/evaluation/reproducibility.md`. Do not freeze or submit until the final video and Devpost receipt
exist. Keep the sandbox as the deterministic recording fallback and describe Managed Email only as a
controlled pilot. The human study and bonuses are optional for eligibility but must never be presented
as completed.
