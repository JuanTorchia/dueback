# Implementation Plan: Consumer Case Inbox

**Branch**: `004-consumer-case-inbox` | **Date**: 2026-08-17 | **Spec**: [spec.md](spec.md)

## Summary

Turn the proven DueBack runtime into a recoverable consumer product without widening its external
authority. Add progressive Firebase identity linking, an owner-scoped “My follow-ups” inbox,
channel-aware case and conversation projections, durable delivery of attention notifications,
Promised-versus-Observed results and a redacted judge trace. Keep Resend as the controlled email
transport and Google Cloud/Gemini/Genkit as the model, orchestration, identity, state and execution
backbone.

## Technical Context

**Language/Version**: TypeScript 5.9 on Node.js 22

**Primary Dependencies**: Next.js 16.3, React 19.2, Firebase Auth/Admin 12.17/14.2, Genkit 1.41,
Gemini 3.5 Flash through Vertex AI, `@google-cloud/tasks` 7, Resend-compatible adapters

**Storage**: Firestore owner-scoped case runs and subcollections; bounded notification,
intervention, provider-event and action ledgers with TTL

**Testing**: Vitest 4.1, Playwright 1.62, Firebase Rules Emulator, deployed controlled-email smoke

**Target Platform**: Responsive web on Cloud Run; mobile-first browser journey

**Project Type**: pnpm monorepo web application plus runtime/domain/persistence packages

**Performance Goals**: inbox first useful state under 2 seconds on warm path; known case state stays
visible during refresh failure; no UI poll faster than needed for the current lifecycle

**Constraints**: solo-founder deadline; preserve current controlled-email gates; no bearer links;
no account migration that can orphan or merge unrelated cases; three-notification case budget;
no raw email/artifact data in list or judge projections

**Scale/Scope**: one owner profile, paginated personal inbox, one controlled managed-email adapter,
one sandbox fallback, one narrow intervention path, one redacted technical projection

## Constitution Check

### Pre-design gate

- **Autonomous action**: PASS — background action, retry and evidence verification remain unchanged.
- **Required Google stack**: PASS — Gemini 3.5 Flash, Genkit, Cloud Run, Firestore, Cloud Tasks and
  Firebase Authentication remain essential and visible.
- **No invented evidence**: PASS — targets remain marked as targets; technical view reads persisted
  records only; real email remains a controlled pilot.
- **Security and privacy**: PASS — identity is strengthened; no bearer link, raw-content list or
  arbitrary recipients are introduced.
- **Reproducibility**: PASS — contracts, emulator tests, deterministic E2E and controlled deploy
  validation are included.
- **Scope discipline**: PASS — no new channel, recipe, dashboard, native app or arbitrary automation.

### Post-design gate

PASS. The data and API contracts preserve ownership at every boundary, isolate display projections
from source records, and make notification delivery idempotent. No constitution exception is needed.

## Project Structure

### Documentation

```text
specs/004-consumer-case-inbox/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── api.openapi.yaml
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code

```text
apps/web/
├── app/api/cases/
├── app/cases/
├── components/
├── lib/
└── test/

packages/
├── contracts/
├── domain/
├── persistence/
└── runtime/

infra/firestore/
tests/
├── adversarial/
├── e2e/
├── integration/
└── security/
```

**Structure Decision**: Extend existing boundaries. Identity/case/notification policy stays in
runtime, Firestore queries and transactions stay in persistence, HTTP authentication/projection
stays in the web app, and consumer components render only safe DTOs. No new deployable service.

## Delivery Phases and Kill Gates

### Phase A — Product truth

Make result/timeline copy channel-aware and align README, architecture and compliance evidence with
the already validated controlled email pilot.

**Kill gate**: zero sandbox-only terms on a managed-email fixture; no live-channel claim lacks an
evidence link.

### Phase B — Personal inbox

Add recoverable linking, owner-scoped bounded case history, navigation and cross-device return.

**Kill gate**: a clean browser recovers the same case; a second owner learns nothing; linking races
do not duplicate or strand cases.

### Phase C — Understandable case

Project a readable conversation, current/next state, Promised-versus-Observed comparison, safe
technical disclosure and resilient refresh.

**Kill gate**: one email case visibly rejects ACK and later accepts only explicit sufficient proof;
known state survives a network failure.

### Phase D — Durable return

Connect persisted intervention creation to the same idempotent notification delivery used for
completion, including transport truth and deep-link return.

**Kill gate**: closed browser + replayed attention event produces one notification and opens the
owned case after sign-in.

### Phase E — Control, evidence and release

Add narrow reapproval/dispute flow, redacted judge trace, safe export, accessibility matrix and
continuous demo rehearsal.

**Kill gate**: four-minute path shows real email transport, ACK rejection, sufficient proof,
notification return and Google Cloud evidence without unsupported claims.

## Complexity Tracking

No constitution violations. The new DTO/projection layer is necessary because source records contain
technical and potentially sensitive fields that must not be exposed directly to consumer lists.
