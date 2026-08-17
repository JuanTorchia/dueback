# Final General Audit — 2026-08-17

Verdict: **release candidate, submission blocked by participant-owned evidence**.

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

1. **Cross-device Google recovery:** implementation and opt-in test exist, but no saved real Google
   owner state plus owned case has completed the two-context execution.
2. **Fresh managed-email journey on revision 00049:** an earlier revision has real Resend delivery
   and signed weak-reply rejection evidence. The current identity-gated UI still needs one authorized
   participant run; do not imply arbitrary-company support or sufficient email completion.
3. **Final video:** no public unedited `≤4:00` YouTube/Vimeo artifact exists. Consequently language,
   visible Cloud evidence and exact duration are unverified.
4. **Legal self-attestation:** only the participant can confirm sanctions/conflict-of-interest status.
5. **Human study:** no eight-person unassisted study has been run. Synthetic agent notes are not
   human evidence and remain untracked from release claims.
6. **Devpost submission:** final submission and deadline receipt are external and not yet recorded.

## Release decision

The sandbox-centered Taskmaster demo is technically ready to record. Do not freeze or submit until
items 1, 3, 4 and 6 above are closed. Managed Email may be omitted from the four-minute story if item
2 cannot be reproduced; the sandbox is the deterministic primary path. The human study and bonuses
are optional for eligibility but must never be presented as completed.
