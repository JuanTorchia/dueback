# Reproducibility record

## Run metadata

- Date: 16 August 2026 (UTC)
- Baseline deployed commit: `aac0012`; documentation handoff: `de6e730`
- Node.js: 22 or newer as required by the repository
- Package manager: pnpm 10.34.5
- Google Cloud project: `bulbasour-503317`
- Region: `us-central1`; Vertex AI model location: `global`
- Public web service: <https://dueback-web-5m3karqdwa-uc.a.run.app>
- Controlled merchant service: <https://dueback-merchant-sandbox-5m3karqdwa-uc.a.run.app>

## Local quality gate

The following commands were executed in order from the repository root with the committed lockfile:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm evaluate
```

Observed result: all commands exited successfully. Package tests and the root suite passed; the root
suite reported 13 files and 44 tests after study-report coverage was added. The evaluation runner reported 24/24 expected outcomes, split
between 12 deterministic executions and 12 fixture-contract checks. The full per-case output is in
[`results.json`](results.json); this is not presented as 24 live model calls.

pnpm reported that the dependency install did not run the optional `esbuild@0.25.12` lifecycle
script. The application still typechecked, tested, and built successfully. No approval was added
silently because dependency lifecycle policy should be an explicit repository decision.

## Controlled local services

Both documented development commands were started independently:

```bash
pnpm --filter @dueback/merchant-sandbox dev
pnpm --filter @dueback/web dev
```

The sandbox root returned its HTML disclosure and the web `/intake` route returned HTTP success.
They were then stopped intentionally with `SIGINT`; the resulting non-zero pnpm messages are
expected operator termination, not startup failures. Port 3000 was already held by the execution
environment, so Next.js selected port 3001 and printed that deviation.

## Deployed walking skeleton

The deployed path uses Cloud Run, Firestore, Cloud Tasks, Firebase anonymous authentication,
Vertex AI through Genkit, and a separately deployed controlled merchant service. Historical
end-to-end kill-test evidence is recorded in decision D-011. During the mobile Playwright run on 16
August, the test reached activation but exposed a missing Firestore composite index for
`interventions(caseId, createdAt)`. The index is now declared in
[`firestore.indexes.json`](../../infra/firestore/firestore.indexes.json), and the deployment script
provisions it when absent.

The authoritative command is:

```bash
DUEBACK_DEPLOYED_URL='https://dueback-web-5m3karqdwa-uc.a.run.app' pnpm test:deployed
```

After the Cloud index reached `READY`, the test was rerun against the same public URL and passed in
28.9 seconds (30.1 seconds including runner overhead). It created a fresh uniquely referenced case,
reviewed the authority boundary, approved it, reloaded the result route, and observed
`Merchant-confirmed refund`, the explicit bank-settlement limitation, and the auditable timeline.
The earlier failure is retained in this record as useful production-readiness evidence rather than
discarded.

## Intentional limitations

- The merchant is a controlled HTTP simulator, visibly labeled; it is not a real retailer.
- `MERCHANT_CONFIRMED` does not prove bank settlement. The UI states this explicitly.
- Outbound email is implemented behind an adapter but disabled in the public deployment until a
  verified sender and recipient are configured.
- Inbound email, WhatsApp, arbitrary browsing, bank access, and production merchant integrations
  are out of scope.
- The eight-person unassisted study has not yet run. No usability result is claimed.
- A public repository URL and public demo video are not yet available.

## Post-audit hardening

The completion audit after `de6e730` found that retention deadlines were stored only as strings and
therefore did not constitute active deletion. The implementation now writes Firestore `Timestamp`
values to `deleteAt`, the deployment script enables TTL for every in-scope collection group, and
the development project reports those TTL configurations. The same audit added a transactional
four-call model budget plus observed latency/token/cost-basis records. Cost uses provider token
counts and the official Gemini 3.5 Flash standard-global prices observed on 2026-08-16; absent token
counts produce no estimate.

The hardened image was built by Cloud Build operation
`8ef99d2d-b4e6-4bab-87dd-9c5daf493bcb` and deployed as Cloud Run revision
`dueback-web-00013-7ph` at 100% traffic. Fourteen in-scope Firestore collection groups reported TTL
state `ACTIVE`. Two fresh mobile journeys then ran sequentially with Playwright retries disabled and
both passed in 31.2 and 21.5 seconds (53.8 seconds total runner time).

The two newest model-usage records showed one successful call each, provider token counts, measured
latencies of 10,642 ms and 15,235 ms, standard-global cost estimates of USD 0.008439 and USD
0.014553, and Firestore `deleteAt` timestamps. Their associated completed case runs also contained
30-day `deleteAt` timestamps. No source content, owner ID, or promise text was printed in this
verification.

An earlier Playwright instability was traced to the shared machine's `/tmp` filesystem being 100%
full with unrelated caches. No unrelated files were deleted. `playwright.config.ts` now creates and
uses a repository-private ignored temp directory; two sequential no-retry runs passed afterward.

## Final deployed ledger verification

Commit `149786c` was built by Cloud Build operation
`e737fa64-5597-474d-8216-c0e6c41ac3b4` and deployed as Cloud Run revision
`dueback-web-00014-pzv` at 100% traffic. The first two-run, no-retry verification exposed a genuine
intermittency: one case remained `WAITING_EXTERNAL` because the controlled merchant had returned
HTTP 202 and scheduled its callback after the response while Cloud Run CPU throttling was enabled.
The failure is not counted as a pass.

The reproducible sandbox deployment now uses `--no-cpu-throttling` for that explicitly bounded
background callback delivery. Revision `dueback-merchant-sandbox-00006-dbl` reported the
`run.googleapis.com/cpu-throttling: false` annotation and 100% traffic. After the correction, two
fresh mobile journeys ran sequentially with Playwright retries disabled and both passed in 23.9 and
22.2 seconds (47.5 seconds total runner time).

Direct Firestore inspection of both resulting cases showed state `DONE`, version 4, one merchant
receipt, and the same four-event ledger: `PLAN_APPROVED`, `ACTION_RESULT`, rejected
`REQUEST_ACKNOWLEDGED` evidence with `INSUFFICIENT_LEVEL`, and accepted `MERCHANT_CONFIRMED`
evidence. Each case preserved one correlation ID across all four events. This verifies the visible
timeline from persisted state rather than a hard-coded UI narrative.

## Synthetic-pilot remediation deployment

The eight files supplied under `user-testing-feedback/` explicitly identify their personas,
quotations, and timings as AI-generated. They were excluded from human metrics and used only to
form bug hypotheses. The validation and disposition are recorded in
`docs/research/synthetic-pilot-validation.md`.

Commit `68cc8ce` was built by Cloud Build operation
`d70fc164-a6fe-4e41-a342-781876bf1878` and deployed as `dueback-web-00015-4cz` at 100% traffic. A
new deployed Playwright path used the contradictory USD 79/USD 59 fixture, observed a visible
uncertainty warning, resolved every model-selected blocker through the UI, activated without
developer tools, and reached merchant-confirmed evidence in 37.0 seconds. A subsequent joint
no-retry regression ran both the ambiguous path and the standard judge path sequentially; both
passed in 46.5 seconds total.

This deployment also scopes model-call budgets by owner plus content-derived artifact, waits for
persisted Firebase anonymous identity before creating a new owner, provides `/privacy`, and allows
owner-checked transactional deletion of a pre-activation draft.

The follow-up accessibility/error-copy commit `d1ec263` was built as Cloud Build operation
`59a54ae8-b4bb-4634-8aee-bca50ab35f79` and deployed as `dueback-web-00016-zjq` at 100% traffic.
The public privacy route passed an HTTP content smoke check and the standard mobile judge journey
passed again without retries in 40.2 seconds.

## Synthetic persona panel hardening

The explicitly synthetic three-persona audit is documented in
`docs/research/persona-panel-2026-08-16.md`; it contributes no human metrics. Commit `82940e4` was
built by Cloud Build operation `6121afe9-a010-48c3-b762-915e462c2ce7` and deployed as
`dueback-web-00017-97s` at 100% traffic.

The deployed ambiguous path passed in 31.4 seconds and demonstrated the new user-owned follow-up
date, pre-consent simulator disclosure, and limited merchant-confirmation claim. A standard-path
run then encountered one exhausted two-attempt Gemini request and is retained as a real transient
failure; an immediate no-retry rerun passed end to end in 25.1 seconds. Axe 4.12.1 reported zero
confirmed violations on the deployed intake page, 37 passed checks, and one manual contrast check
for the aria-hidden decorative checkmark.

## Consumer experience redesign

Commit `a5103d3` was built by Cloud Build operation
`3e367d0e-887a-442e-9d2f-73c6285a2066` and deployed as `dueback-web-00018-nv4` at 100% traffic.
The redesign replaces the form-like landing page with a responsive consumer hierarchy: a concise
value proposition, control and privacy assurances before intake, one primary action, and three
plain-language proof principles. The same branded header and visual system now continue through
review, result, exception, and privacy routes.

After deployment, both mobile Playwright journeys ran sequentially with retries disabled. The
ambiguous-review path passed in 30.7 seconds and the standard judge path passed in 22.0 seconds
(53.8 seconds total). A separate 390 by 844 browser inspection confirmed that the public intake
exposed the expected heading, input-mode controls, privacy link, labelled textbox, and disabled
primary action before input.

## Unified multimodal intake

Commit `9cb9286` was built by Cloud Build operation
`84ccd737-46a4-4dda-aca3-21377e2d35f4` and deployed as `dueback-web-00019-87f` at 100% traffic.
The intake now accepts text, an image or PDF, or both without requiring the person to choose a
mode first. When both are supplied, the sanitized media and user context are passed to Gemini in
one multimodal extraction request and share a content-derived deduplication identity.

The full local suite passed with 60 tests (44 root tests plus 16 web tests), alongside typecheck,
lint, and the production build. After deployment, both mobile journeys passed sequentially with
retries disabled in 30.8 and 28.8 seconds (one minute total runner time). The initially invoked
browser test still referenced the superseded accessible field name and was stopped after that
selector failure; updating the test contract produced the clean run reported here.

## Intake latency remediation

Commit `c4068cc` was built by Cloud Build operation
`3f1609ea-541a-475c-acae-c88f5b572205` and deployed as `dueback-web-00020-cr7` at 100% traffic.
The intake now displays an honest elapsed-time state, changes its explanation after 15 and 30
seconds, prevents duplicate submission, preserves the source after failure, supports removing a
selected file, and maps rejected file classes to actionable messages. Screen-reader announcements
occur only when the phase changes; the per-second visual counter is hidden from assistive
technology.

The first four-test public run produced three passes and one test-selector failure because Next.js
also exposes an empty route-announcer with `role=alert`; the product error was visible and correct.
After scoping the assertion to the product alert, both deterministic resilience tests passed with
retries disabled in 4.3 seconds and 834 ms. They verify delayed-response feedback and recovery plus
combined text-and-image intake. The two live-Gemini paths in the preceding run passed in 30.5 and
26.9 seconds.

## Platform positioning deployment

Commit `94c8f89` was built by Cloud Build operation
`43d6b7e6-d994-4f16-aa5b-5e2fe5cfddb7` and deployed as `dueback-web-00021-gwj` at 100% traffic.
The public product now describes the general proof-of-done contract while explicitly labelling
company follow-up as the live recipe and appointments/documents as next adapters. This avoids
claiming unsupported integrations while making the runtime scope visible.

All four public browser tests passed sequentially with retries disabled: the two live-Gemini paths
in 36.4 and 18.0 seconds, delayed-error recovery in 4.4 seconds, and combined text plus image intake
in 1.0 second. The production build, typecheck, lint, 44 root tests, and 16 web tests also passed.

## Universal outcome contract deployment

Commit `a84f012` was built by Cloud Build operation
`d557f8a2-e0f8-4cbf-b467-c26b1905e392` and deployed as `dueback-web-00022-zwm` at 100% traffic.
New commercial cases now persist a canonical `OutcomeContract` containing the desired outcome,
responsible party, deadline, required proof, action intents, and a typed recipe payload. The shared
schema also validates appointment and document recipes, while only commercial follow-up is claimed
as an executable public adapter. Existing persisted cases remain readable through the legacy
fallback and gain the canonical contract when revised.

The first public run passed the ambiguous, delayed-error, and combined-input paths. The standard
path stopped only because its assertion expected the superseded commercial proof sentence; the new
universal proof definition was visible. After updating that test contract, the same live-Gemini
journey passed without retries in 24.7 seconds.

## Guided first-use deployment

Commit `a5e9585` was built by Cloud Build operation
`bd47fcbc-1fbb-4eb8-9f64-89f6ec9e86be` and deployed as `dueback-web-00023-bgd` at 100% traffic.
The mobile intake now exposes four accepted ways to begin before the input, provides four
actionable commercial examples, and lets a first-time visitor populate a complete example with one
tap. Mobile hero spacing was reduced so the live recipe and guidance appear in the initial viewport.

Five public browser tests passed sequentially with retries disabled. The live-Gemini paths passed
in 33.2 and 28.9 seconds; delayed-error recovery, combined text-and-image intake, and first-use
example discovery passed in 4.4, 1.1, and 1.1 seconds respectively.
