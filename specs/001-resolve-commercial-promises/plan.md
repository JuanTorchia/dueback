# Implementation Plan: Resolve Commercial Promises

**Branch**: `001-resolve-commercial-promises` | **Date**: 2026-08-15 | **Spec**:
[spec.md](./spec.md)

**Input**: Feature specification from `specs/001-resolve-commercial-promises/spec.md`

## Summary

Build the 48-hour DueBack walking skeleton: accept a synthetic commercial promise through mobile
upload or paste, use Gemini to draft a provenance-linked Promise Contract, create an anonymous
Firebase identity before activation, require owner- and version-bound approval,
execute one idempotent follow-up against a separately deployed controlled counterparty, persist
waiting and retries, reject acknowledgement-only evidence, and complete only after a deterministic
verifier accepts merchant-confirmed evidence. The core creates a deduplicated return notification;
outbound email and inbound email are adapters only after the deployed path works.

The product is a mobile-first case page rather than a dashboard. Genkit performs typed multimodal
interpretation and evidence reconciliation. A deterministic policy engine, state reducer, action
broker, and evidence verifier retain exclusive authority over permissions and lifecycle.

## Technical Context

**Language/Version**: TypeScript in strict mode on Node.js 22+

**Primary Dependencies**: Next.js App Router, React, Genkit, the unified Google GenAI plugin in
Vertex AI mode, Zod,
Google Cloud client libraries, OpenTelemetry-compatible structured logging

**Storage**: Firestore for contracts, cases, actions, evidence, and events; private Cloud Storage for
temporary source artifacts when inline processing is inappropriate

**Testing**: Vitest for unit/contract/integration suites; Playwright for deployed mobile happy path;
Genkit evaluation over a versioned corpus

**Target Platform**: Containerized Linux services on Google Cloud Run; responsive modern mobile and
desktop browsers

**Project Type**: pnpm workspace web application with one product service and one isolated controlled
counterparty service

**Performance Goals**: Intake acknowledgement visible within 3 seconds excluding model completion;
contract draft visible within 15 seconds for demo corpus; user actions visible within 2 seconds;
task/webhook endpoints acknowledge within their provider deadlines

**Constraints**: Solo developer; 15-result/48-hour walking-skeleton gate; final demo under four minutes; scale
to zero; no paid credentials required from judges; synthetic PII; Gemini never authorizes or changes
state; exact-once effects implemented over at-least-once delivery

**Scale/Scope**: One complete refund promise, two manifest-only promise variants, four product
surfaces, one controlled counterparty, 24-case evaluation corpus, low-volume hackathon evaluation

## Constitution Check

_GATE: Passed before research; passed again after design._

| Constitutional gate                           | Design response                                                                            | Status |
| --------------------------------------------- | ------------------------------------------------------------------------------------------ | ------ |
| Completion evidence defined before activation | Promise Contract contains versioned evidence policy                                        | PASS   |
| Gemini cannot authorize or declare `DONE`     | Policy engine and verifier are deterministic modules                                       | PASS   |
| Human authority and least privilege           | Approval is bound to contract hash/version; broker accepts only authorized actions         | PASS   |
| Durable and idempotent                        | Firestore transactions, append-only events, stable dedupe/action keys, Cloud Tasks retries | PASS   |
| Honest evidence                               | Controlled service is labeled; `MERCHANT_CONFIRMED` is distinct from `FUNDS_SETTLED`       | PASS   |
| Smallest winning slice                        | Upload-first refund path precedes email and secondary manifests                            | PASS   |
| Required Google stack                         | Gemini 3.5+ through Vertex AI, Genkit, Cloud Run, Firestore, Cloud Tasks                   | PASS   |
| Reproducible judging                          | Synthetic fixtures, seeded scenarios, evaluator corpus, public quickstart                  | PASS   |

No constitutional exception is required.

## Project Structure

### Documentation (this feature)

```text
specs/001-resolve-commercial-promises/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api.openapi.yaml
│   ├── domain-events.md
│   └── evaluation-corpus.md
├── checklists/
│   ├── requirements.md
│   ├── security-privacy.md
│   └── hackathon-readiness.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/
├── web/
│   ├── app/
│   │   ├── intake/
│   │   ├── cases/[caseId]/review/
│   │   ├── cases/[caseId]/exception/
│   │   ├── cases/[caseId]/result/
│   │   └── api/
│   ├── components/
│   └── tests/
└── merchant-sandbox/
    ├── src/
    └── tests/
packages/
├── contracts/
├── domain/
├── genkit-flows/
├── persistence/
├── runtime/
├── channel-adapters/
├── observability/
└── test-fixtures/
tests/
├── contract/
├── integration/
├── adversarial/
└── e2e/
infra/
├── cloud-run/
├── cloud-tasks/
└── firestore/
scripts/
└── demo/
```

**Structure Decision**: A small pnpm workspace isolates pure domain rules from model flows and
provider adapters while keeping one language and one dependency graph. The controlled counterparty
is a separate service so its state and receipts cross a real HTTP trust boundary. No generic plugin
system or multiagent service is introduced.

## Complexity Tracking

No constitutional violations require justification. The second service is not an application
feature; it is an independently observable test counterparty required to avoid an in-process mock.

## 48-Hour Walking-Skeleton Gate

The task backlog is not the kill test. The kill test contains only these observable results:

1. Pinned workspace, minimal CI, and secret-safe configuration.
2. Typed Plan, Case, Action, Evidence, Notification, and Event contracts.
3. Tested reducer and deterministic verifier that reject false `DONE`.
4. Firebase anonymous identity with per-case ownership.
5. One synthetic text or image intake within explicit limits.
6. Gemini produces a typed draft with field provenance.
7. One review screen with owner/version/hash-bound approval.
8. Firestore persists the case and ordered timeline.
9. Approval schedules one delayed Cloud Task.
10. The broker rejects unapproved actions and uses a stable idempotency key.
11. The separate Merchant Sandbox records one logical action.
12. An acknowledgement callback remains visibly insufficient.
13. Duplicate delivery/retry leaves one logical external action.
14. A signed, fresh, non-replayed callback supplies `MERCHANT_CONFIRMED` evidence.
15. The verifier closes at the exact evidence level and exposes proof, one notification, timeline,
    and correlated logs on deployed Cloud Run.

Until all 15 results are deployed and recordable, do not begin inbound/outbound email, secondary
promise types, the full corpus, advanced exception controls, distributed tracing, bonus models, or
general visual polish.
