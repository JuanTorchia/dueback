# Implementation Plan: Winning Product Loop

**Branch**: `003-winning-product-loop` | **Date**: 2026-08-17 | **Spec**: [spec.md](./spec.md)

## Summary

Close DueBack's product loop without broadening its claims. First remove the inbound false-DONE
fallback. Then convert synchronous intake into a durable `ANALYZING` job, make the extracted contract
fully editable, add an explicit accelerated demo mode whose real events finish during judging, and
project those events into a concise live timeline and redacted judge Evidence Console. Add recoverable
Firebase ownership before activation. Keep Managed Email disabled until a controlled two-mailbox
smoke passes every readiness and authenticity gate. Finish with live-Gemini evaluation and submission
release gates.

## Technical Context

**Language/Version**: TypeScript strict mode, Node.js 22+, React 19

**Primary Dependencies**: Next.js 16 App Router; Genkit 1.41 with `@genkit-ai/google-genai` and
Vertex AI; Firebase Auth client/Admin; Google Cloud Firestore and Cloud Tasks; Zod; existing bounded
Resend-compatible adapters; Playwright and Vitest

**Storage**: Existing Firestore collections extended with `analysisJobs`, `caseEvents`,
`identityLinks`, `emailReadiness` and `evaluationRuns`; existing drafts/runs, action, evidence,
notification, provider and model ledgers remain authoritative

**Testing**: Vitest unit/contract/integration/adversarial suites; Firestore Emulator ownership/race
rules; Playwright deterministic UI state matrix; sequential production browser smoke with retries
disabled; separate opt-in live Gemini and controlled-email runs

**Target Platform**: Cloud Run web/runtime and controlled merchant service; Cloud Tasks OIDC workers;
Firestore; Vertex AI global; responsive evergreen browsers at 390×844 minimum judge viewport

**Project Type**: Existing pnpm monorepo web/runtime application with isolated adapters and services

**Performance Goals**: intake acceptance and owned case URL within 2 seconds for 19/20 controlled
measurements; accelerated result within 90 seconds; UI command feedback within 2 seconds; model call
deadline bounded per attempt; continuous judge demo under 4 minutes

**Constraints**: Solo participant; deadline 2026-08-31 17:00 PT; no arbitrary email recipients; no
broad Gmail access; no raw content in logs/console; no model lifecycle authority; deterministic
sandbox remains fallback; exact claim levels; existing user changes preserved

**Scale/Scope**: One complete consumer recipe and four accelerated examples; one controlled sandbox;
optional one verified sender/domain and two controlled mailboxes; low-volume judging traffic; one
recoverable owner with a compact history, not a general dashboard

## Constitution Check

_Gate passed before research and re-checked after design._

| Constitutional gate | Design response | Status |
| --- | --- | --- |
| Verified outcomes over activity | Explicit-only inbound evidence; deterministic verifier remains sole completion authority | PASS |
| Human authority and least privilege | All edits version the plan; mode, recipient, data, proof and limits precede approval | PASS |
| Durable, idempotent execution | Analysis jobs, tasks, case events, actions and callbacks use durable reservations and CAS | PASS |
| Honest evidence and reproducible claims | Accelerated sandbox, controlled email and future channels are distinct capabilities | PASS |
| Smallest winning slice | One complete loop precedes email, more recipes or cosmetic redesign | PASS |
| Required Google technology | Gemini/Genkit, Vertex AI, Cloud Run, Firestore, Cloud Tasks and Firebase are essential and visible | PASS |
| Reproducible judging | Four examples, reset, Evidence Console and sequential production suite are explicit gates | PASS |

No constitutional exception is required.

## Architecture Decisions

1. **Fail closed before feature work**: inbound evidence candidates contain only interpreted explicit
   facts. Provider signature validity, sender/thread authentication and deterministic evidence
   sufficiency are stored and evaluated separately.
2. **One case identity from submission**: `/api/intake` validates evidence, reserves a dedupe identity,
   creates a draft plus analysis job transactionally, enqueues work and returns `202` with case URL.
   It never calls Gemini inline.
3. **At-least-once analysis, one publish**: the analysis worker leases a job version, reserves model
   budget, invokes the existing tool-less flow with a deadline, validates output and publishes only
   if case/job state still matches. A late result after cancellation is discarded and recorded.
4. **Persisted stage projection**: UI stages come from `AnalysisJob` and `CaseEvent`, not timers. Polling
   with bounded SWR-style refresh is sufficient for P0; SSE is deferred unless polling harms demo.
5. **Mode is approved policy**: `executionMode` and `timingPolicyVersion` are canonical plan fields.
   Accelerated demo derives relative wake times server-side and still crosses Cloud Tasks, Action
   Broker, sandbox HTTP and signed callback boundaries.
6. **Compact review over a second workflow**: extend the existing plan revision command and UI. Do
   not introduce a new form engine. Technical contract and inactive capabilities move to accordions.
7. **Case events as common projection**: append typed, redacted events from existing state transitions
   and ledgers. User timeline and Evidence Console read the same persisted facts with different views.
8. **Recoverable Firebase account linking**: allow anonymous exploration; before activation link or
   sign in with Google, then atomically claim the draft. Do not implement passwords or a custom auth
   system. Cross-device access requires the same provider identity.
9. **In-app notification is authoritative**: email notification remains an optional transport. The
   UI shows provider status and never equates notification delivery with business completion.
10. **Evidence Console is a projection, not raw observability access**: an owner-checked endpoint
    assembles allowlisted fields from model/task/action/evidence records for synthetic demo cases.
11. **Controlled email is a gated adapter, not default product**: readiness requires configuration
    plus a persisted smoke record with expiry; environment variables alone cannot advertise health.
12. **Live-model evaluation is separate**: add an opt-in runner and dated output distinct from the
    deterministic 28-case corpus. Never make external model availability a default CI dependency.
13. **Submission is code-reviewed state**: a versioned release manifest/check script treats external
    URLs and eligibility confirmations as evidence inputs and refuses placeholders.

## State and Request Flow

```text
POST /api/intake
  → validate/normalize artifact
  → Firestore transaction: dedupe + DraftCase(ANALYZING) + AnalysisJob(QUEUED) + CaseEvent
  → enqueue Cloud Task with job/version
  → 202 { caseId, statusUrl }

Cloud Task /api/internal/tasks/analyze-case
  → verify OIDC + lease/version
  → reserve model budget
  → Gemini/Genkit extraction under deadline
  → deterministic schema/provenance validation
  → CAS publish plan + REVIEW_READY event, or bounded retry/error/cancelled-late event

Review
  → edit facts/mode/channel/proof
  → new version/hash
  → recoverable sign-in/link
  → approve version
  → schedule relative accelerated or real wake time

Execution
  → existing Cloud Task → policy → Action Broker → adapter
  → receipt/event → hostile inbound/callback → explicit candidate → deterministic verifier
  → weak proof event/retry or exact result/notification

Read models
  → case status endpoint → consumer timeline
  → owner + synthetic judge endpoint → Evidence Console
```

## Project Structure

### Documentation

```text
specs/003-winning-product-loop/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api.openapi.yaml
│   └── domain-events.md
├── checklists/
│   ├── requirements.md
│   ├── security-privacy.md
│   └── hackathon-readiness.md
└── tasks.md
```

### Source Code

```text
packages/contracts/                 # execution mode, analysis, event and console schemas
packages/domain/                    # explicit evidence policy and state invariants
packages/runtime/                   # analysis, inbound, event projection and identity services
packages/persistence/               # Firestore analysis/event/readiness/identity stores
packages/genkit-flows/              # tool-less extraction and live evaluation metadata
packages/test-fixtures/             # accelerated and live-model corpus fixtures
apps/web/app/api/intake/             # quick intake acceptance
apps/web/app/api/internal/tasks/     # analysis and existing execution workers
apps/web/app/api/cases/              # analysis, plan, timeline, history and evidence console
apps/web/components/                 # analyzing, compact review, timeline, identity and console UX
apps/web/lib/                        # auth linking, controllers, readiness and release helpers
tests/contract/                      # schemas/API/readiness contracts
tests/integration/                   # durable analysis, identity, email and event flows
tests/adversarial/                   # false-DONE, spoof, races and cross-owner access
tests/e2e/                           # deterministic UX plus sequential deployed matrix
scripts/evaluation/                  # opt-in live Gemini report
scripts/release/                     # submission readiness audit
infra/                               # task route, IAM, Firestore rules/index/TTL, deploy gates
```

**Structure Decision**: Extend current package boundaries. Avoid a new service unless Cloud Run
request limits or isolation evidence requires it; the OIDC-protected analysis route can share the web
image while remaining a separate worker boundary.

## Delivery Phases and Kill Gates

### Phase A — Safety blocker

Remove evidence fallback, model explicit provenance for inbound facts, add refund/replacement/general
adversarial tests and deploy without enabling email.

**Kill gate**: zero accepted candidates with any required field absent across the published corpus.

### Phase B — Winning accelerated loop

Add mode/timing policy, complete all visible examples, live timeline, weak-proof rejection and scoped
reset. Keep current intake temporarily if necessary for the earliest vertical validation.

**Kill gate**: production 4/4 end-to-end in under 90 seconds each, one worker, zero retries.

### Phase C — Durable consumer experience

Move intake to queued analysis, compact/editable review, recoverable ownership, history and truthful
notifications.

**Kill gate**: refresh/close/redeploy and cross-device scenarios pass without duplicate case/action.

### Phase D — Judge evidence and Gemini

Add console projection, live-model evaluation and demo rehearsal overlays.

**Kill gate**: one correlation identity is traceable in UI through real persisted records and the
live evaluation reports all attempts/failures.

### Phase E — Optional controlled email

Only after Phase A: require configured domain plus persisted smoke health. Run two controlled
mailboxes and explicit missing-field replies. Roll back to sandbox on any gate failure.

**Kill gate**: weak controlled reply remains open; complete authenticated reply reaches only the exact
supported evidence level; cross-sender and missing-field corpus remains fail-closed.

### Phase F — Submission

Freeze features, run full gates, expose repository, record video, validate English accessibility and
complete Devpost. Bonus content follows only if mandatory gates stay green.

## Complexity Tracking

No constitutional violations. Two projections (consumer timeline and judge console) share one event
source because their audiences require different disclosure levels. Recoverable identity adds one
provider flow because browser-bound anonymous ownership contradicts the return promise. Managed Email
remains optional to prevent external setup from threatening the deterministic submission path.
