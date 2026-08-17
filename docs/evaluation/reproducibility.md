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

## Outcome review redesign

Commit `8ab38cf` was built by Cloud Build operation
`432fa379-768e-4f22-bace-0a6cf259dbea` and deployed as `dueback-web-00024-tww` at 100% traffic.
The second step now separates comprehension from authorization: visible case progress, a readiness
summary, human-first outcome facts, a proof-of-done callout, collapsed technical identity, and a
separate delegation card containing action, recipient, prohibitions, proof, shared data, and the
controlled-demo disclosure. Five public browser paths passed without retries in 58.3 seconds.

Commit `e5cf0c2` was built by Cloud Build operation
`259bb164-ae33-47a6-9072-1c7d83376acc` and deployed as `dueback-web-00025-wsq` at 100% traffic. It
replaced the remaining ISO deadline in the review with a locale-formatted date. A mobile visual
inspection confirmed the human date, and the complete standard live-Gemini journey passed again
without retries in 24.3 seconds.

## Benefit-led landing deployment

Commit `feb2f55` was built by Cloud Build operation
`6f3c8f4f-84e0-463d-9930-7e04bc3e06df` and deployed as `dueback-web-00026-jsq` at 100% traffic.
The root route no longer redirects directly into intake. It now explains the concrete consumer
problem, shows a representative case rejecting weak acknowledgement evidence, contrasts DueBack
with a reminder, and defers evidence collection until after the value and boundaries are clear.
The visual case is explicitly illustrative and contains no fabricated user, testimonial, or metric.

All six public browser tests passed sequentially with retries disabled. The new value-comprehension
path passed in 1.3 seconds; both live-Gemini paths and all intake resilience paths also passed.

## Full journey and channel clarity deployment

Commit `7d32822` was built by Cloud Build operation
`b38ec2e8-9dd0-4388-9f07-ba625dbef5a0` and deployed as `dueback-web-00027-nnp` at 100% traffic.
The intake is now a single text-and-file composer rather than a sequence of form controls. The
intake, approval, and result views explain the complete communication loop: the approved action is
sent to the controlled Merchant Sandbox over HTTP, a signed callback is evaluated, and the open
case page updates automatically. They also state that no real company is contacted and that the
implemented outbound-email adapter is not enabled in the public deployment.

Typecheck, lint, the production build, 44 root tests, and 16 web tests passed locally. The first
public browser run exposed two stale copy assertions after the intentional redesign; no product
failure occurred. After updating those assertions in commit `421ee3c`, all six public browser tests
passed sequentially with retries disabled: ambiguous recovery in 44.5 seconds, the complete mobile
autonomous path in 31.3 seconds, and the four landing/intake resilience paths in 1.0–5.0 seconds.

## Multichannel contact-plan deployment

Commit `66dc598` was built by Cloud Build operation
`42cc4953-1228-4d22-a570-90c8a3e23a6b` and deployed as `dueback-web-00028-87h` at 100% traffic.
The approval view now exposes the active contact channel, recipient, subject, complete first
follow-up, completion rule, and return path. It labels email as ready to connect, the controlled API
as the live public demo channel, and web-form/WhatsApp as future adapters.

The same commit adds an idempotent Resend-compatible company-action adapter with plain-text-only
content, an approval-bound recipient, and a case-specific reply address. The public deployment
intentionally remains in sandbox mode because no verified email sender, authorized recipient,
reply domain, or authenticated inbound webhook is configured.

Typecheck, lint, production build, 44 root tests, 16 web tests, 14 runtime tests, and seven channel
adapter tests passed. In the first public run, five of six browser paths passed and the full path
stopped on one superseded heading assertion after rendering the new UI. Commit `3be98fe` updated
that test contract; the complete public autonomous path then passed without retries in 18.0 seconds.

## Multichannel implementation gate (local)

Commit `290b0a1` adds the production-shaped managed-email reply pipeline: capability registry,
approval-bound content, provider receipt and opaque reply route, signed webhook reservation,
bounded provider retrieval, tool-less typed Gemini inbound extraction, exact case/sender
correlation, and deterministic evidence reconciliation. The public revision remains on sandbox
until controlled external credentials and a verified domain exist.

The repository gate after that commit passed typecheck, lint, production build and all deterministic
tests. Package suites reported 65 tests and the root integration/adversarial suite reported 44 tests
(109 total). These are local deterministic executions, not a claim of live provider delivery.

The external managed-email smoke is currently unmet because this workspace has no verified sender,
inbound domain, authorized test recipient, provider API key or webhook signing secret. The runtime
also requires an explicit recipient-domain allowlist; an empty list fails closed. Therefore Gates
A–C are recorded as pending external prerequisites, not as successful email evidence.

Commit `e27a085` was built by Cloud Build operation
`fa06f550-94cb-432f-9d36-071a3e294ed6` and deployed first as `dueback-web-00029-v8d`; adding the
public base URL created `dueback-web-00030-grp`, which serves 100% of traffic. The first six-path
public run passed all four deterministic UX paths but both autonomous paths failed because the new
notification query required a missing composite index. The error was visible in the result UI and
is not counted as a pass.

Commit `c97f33e` declares and provisions `notifications(caseId, createdAt)`. After the index reached
`READY`, the two previously failing live-Gemini mobile paths were rerun sequentially with one worker
and retries disabled; both passed in 31.6 s and 21.9 s (53.9 s total). This verifies the fix against
fresh public cases while preserving the initial deployment failure.

## Multichannel deterministic completion gate

The current un-deployed multichannel candidate passed typecheck, lint, the production build and
`git diff --check`. Package suites executed 136 tests and the root contract/integration/adversarial
suite executed 51 tests (187 total), all passing. Firestore Emulator separately executed four
ownership and server-only collection rule tests, all passing.

`pnpm evaluate` executed the versioned 28-case synthetic corpus: 28 passed, zero failed. Sixteen
cases exercised deterministic code and twelve validated fixture contracts; four cases specifically
cover managed-email delivery, bounce intervention, authenticated acknowledgement and matching
merchant confirmation. This run made zero Gemini or external-provider calls and is not external
delivery evidence.

Commit `60400d4` was built by Cloud Build operation
`0d2becc7-a894-420a-8444-c7d2638881fa` and deployed as `dueback-web-00031-xc7` at 100% traffic.
All eight public Playwright paths passed sequentially with one worker and retries disabled in 1.2
minutes. This included two channel-plan paths (available approval and unavailable-channel denial),
two fresh live-Gemini journeys (33.9 s and 18.5 s), and four deterministic landing/intake recovery
paths (0.9–4.8 s).

Commit `0896d12` was built by Cloud Build operation
`b0d1f533-e7c4-4c18-8d32-40503c181ad6` and deployed as `dueback-web-00032-grm` at 100% traffic.
The deployed channel suite verified available approval and unavailable-channel denial. Its first
keyboard-switch run exposed a stale accessible-name locator after the button correctly changed from
“Available” to “Selected”; updating only that test locator produced a clean rerun in 3.5 seconds.
No product code was changed to turn that result green.

Commit `12b9387` was built by Cloud Build operation
`fe21d2af-8e98-498c-a8f2-f9a38fee3c5f` and deployed as `dueback-web-00033-vgn` at 100% traffic.
This revision adds persisted reconciliation identity for uncertain provider acceptance, independent
reply-route plus `In-Reply-To` correlation, enriched action receipts, and common partner-adapter
lifecycle coverage. The complete public suite then passed all nine paths sequentially with one
worker and retries disabled in 1.3 minutes. Live-Gemini paths completed in 34.1 s and 24.3 s.

The final local candidate passed lint, typecheck, production build and `git diff --check`. Package
suites contain 141 passing tests and the root suite contains 52 passing tests (193 total), plus four
separate passing Firestore Emulator rule tests. The cancelled intermediate Cloud Build operation
`6322ae42-6c7f-46af-9c9f-e7083c8cf7e7` was superseded before deployment and is not evidence for
the public revision.

## Non-monetary intake production incident

On 2026-08-17 at 04:35 UTC, a public intake returned HTTP 422 after 10.7 seconds. Firestore model
usage showed Gemini completed successfully, while the post-model plan builder still required amount
and currency for every commercial promise. This incorrectly rejected valid document, replacement
and other non-monetary outcomes and the UI collapsed the internal error to `REQUEST_FAILED`.

Commit `3e79766` removes that refund-only invariant, adds `GENERAL` promise classification, keeps
money fields conditional through plan/review/evidence/sandbox/result, and adds redacted diagnostic
logging. Cloud Build operation `9e9238be-3ea7-4622-ba8e-0ec266cc6c99` deployed web revision
`dueback-web-00034-724` and sandbox revision `dueback-merchant-sandbox-00007-4c9`, both at 100%
traffic. A fresh deployed document-promise journey with an overdue date passed end to end in 18.7
seconds without retries: intake 201, amount shown as not applicable, approval, Cloud Task, signed
general evidence and a truthful non-settlement completion claim. A future-dated variant remained
`Scheduled`, confirming it did not act early.

A second public failure at 04:54 UTC exposed a narrower schema defect: Gemini correctly classified
the built-in replacement example, but the plan builder selected `REPLACEMENT` without supplying the
subject and tracking-proof requirement demanded by the contract. The API returned 422 and previously
reduced the internal `ZodError` to generic copy. Commit `0b3e112` makes replacement evidence explicit,
teaches the controlled merchant callback to return matching subject and demo tracking evidence, and
maps any future plan-schema rejection to actionable public copy without exposing internals. Cloud
Build `142f204d-8cd8-4f94-8c9b-4319c438e315` deployed web revision
`dueback-web-00035-988` and sandbox revision `dueback-merchant-sandbox-00008-lgl`, both at 100% traffic.
The production Playwright matrix then clicked all four visible examples in independent sessions—
Missing refund, Cancellation, Replacement and Missing document—and all four reached a reviewable
plan with zero retries (4/4 passed in 1.3 minutes).

## Accelerated complete-example gate

Commit `781d5db` introduced an approved `ACCELERATED_DEMO` timing policy and changed the deployed
four-example test from review-only to full approval/action/evidence/result assertions. Its first
production run correctly failed: the plan and Cloud Task used the accelerated follow-up time, but
the persisted `caseRun.dueAt` still preferred the company's future promise date, leaving the case
`SCHEDULED`. This failure was not retried into green.

Commit `1ea40fd` made the durable run use the approved plan follow-up time before the company date
and added a persistence regression test for that ordering. Cloud Build
`101f7c8d-42b5-4beb-8dbc-544648e319e6` deployed revision `dueback-web-00037-6z8` at 100% traffic.

## Editable contract and compact approval deployment

Commits `274d457` and `6897fb6` made every user-relevant promise field editable even when Gemini
reported high confidence. A correction now creates a new plan version/hash, records human-correction
provenance, updates the deterministic evidence requirement, and regenerates the exact outbound
subject/body from the corrected result, reference, amount, and currency. Non-working channels were
removed from the primary chooser and approval was reduced to five explicit decisions: request,
contact, timing, limits, and proof.

Cloud Build `9f883ba1-c04f-4897-9217-3a1582bc6b95` deployed the main change. Follow-up build
`e89ca3a9-41da-4fa9-aa24-06ee9fb79319` fixed an E2E-discovered mismatch where the UI required a
separate follow-up date even though the runtime correctly falls back to the company deadline. The
final web revision is `dueback-web-00041-r57` at 100% traffic.

The public channel suite passed its three existing authorization paths, and the new edit-certain-
fields path passed independently in 3.0 seconds with retries disabled. The four-example deployed
matrix completed refund, cancellation, and replacement in the combined run; the document case hit a
transient intake timeout and then passed independently in 26.3 seconds with retries disabled. This is
reported as two executions rather than misrepresented as a single 4/4 green run.
The sequential production matrix then completed Missing refund, Cancellation, Replacement and
Missing document end to end with one worker and zero retries: 4/4 passed in 1.5 minutes. Each path
approved the accelerated controlled mode, crossed Cloud Tasks and the controlled HTTP adapter,
received signed evidence, reached the exact supported result and displayed a `NOT VERIFIED`
limitation. This is controlled sandbox protocol evidence, not proof that a real company was contacted.
