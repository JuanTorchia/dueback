# Implementation Plan: Multichannel Follow-Through

**Branch**: `002-multichannel-follow-through` | **Date**: 2026-08-16 | **Spec**:
[spec.md](./spec.md)

**Input**: Feature specification from `specs/002-multichannel-follow-through/spec.md`

## Summary

Extend the existing proof-of-done runtime with a capability-described `ChannelAdapter`, a versioned
Conversation Plan, durable transport receipts, authenticated inbound envelopes, and delivery/user
notification state. Managed email is the first real bidirectional target; the controlled sandbox
remains the deterministic judging path until every email gate passes. Gmail is an optional adapter,
and one reduced partner-API fixture proves portability without channel-specific lifecycle logic.

The implementation proceeds vertically: common contracts and persistence, outbound email, inbound
webhook and normalization, evidence reconciliation, return notifications, then optional portability.
Every external effect remains policy-checked and idempotent; Gemini extracts but cannot authorize or
transition state.

## Technical Context

**Language/Version**: TypeScript strict mode on Node.js 22+

**Primary Dependencies**: Next.js 16 App Router, React 19, Genkit 1.41, Google GenAI Vertex plugin,
Google Cloud clients, Firebase Admin/Auth, Zod, provider REST APIs over bounded `fetch`

**Storage**: Firestore collections for plans, runs, action receipts, channel threads, inbound
envelopes, provider events, evidence, interventions, notifications, replay defense, budgets and TTL

**Testing**: Vitest unit/contract/integration/adversarial suites; Playwright public mobile journey;
controlled-provider smoke tests separated from deterministic CI

**Target Platform**: Cloud Run services and Cloud Tasks workers in `us-central1`; Vertex AI global;
responsive modern browsers

**Project Type**: pnpm workspace web/runtime with isolated adapters and controlled counterparty

**Performance Goals**: webhook acknowledgement under 3 seconds; visible UI command feedback under 2
seconds; durable event processing within 60 seconds for the demo; no request held open for inbound
model work; full accelerated judge path under four minutes

**Constraints**: Solo participant; no arbitrary recipients; no broad Gmail mailbox scope in P0; raw
email and attachments never logged; three logical follow-ups maximum; exact-once logical effects over
at-least-once delivery; no provider or model receipt may declare `DONE`

**Scale/Scope**: One managed sending/receiving domain, controlled mailboxes, one complete refund
recipe, sandbox fallback, one partner-API fixture, low-volume public evaluation

## Constitution Check

_GATE: Passed before research and after design._

| Constitutional gate | Design response | Status |
| --- | --- | --- |
| Verified outcomes over activity | Transport events remain below evidence; deterministic verifier owns completion | PASS |
| Human authority and least privilege | Conversation Plan binds channel, recipient, message, cadence, data, proof and expiry | PASS |
| Durable, idempotent execution | Firestore ledgers, Cloud Tasks, provider event dedupe and reconciliation | PASS |
| Honest evidence and reproducible claims | Sandbox/email/Gmail/fixtures have distinct capabilities and labels | PASS |
| Smallest winning slice | Managed email P0; Gmail optional; one reduced partner fixture | PASS |
| Required Google technology | Gemini/Genkit, Vertex AI, Cloud Run, Firestore, Cloud Tasks remain essential | PASS |
| Reproducible judging | Sandbox remains default until external-email gates all pass | PASS |

No constitutional exception is required.

## Architecture Decisions

1. Preserve `CaseState` as lifecycle authority; represent send/delivery/inbound detail as typed
   channel events and a transport projection instead of multiplying lifecycle states.
2. Add optional channel/message fields to Resolution Plan with safe legacy defaults and canonical
   hashing; migrate lazily when an old plan is revised.
3. Replace direct worker adapter selection with a capability-aware registry keyed only by the
   approved plan channel.
4. Persist a local `ActionReceipt` and `MessageThread` before allowing inbound evidence processing.
5. Webhook endpoints verify raw-body signatures and reserve provider event IDs synchronously, then
   enqueue bounded asynchronous normalization.
6. Fetch inbound content server-side through the exact provider API; sanitize and store only bounded
   normalized text/metadata needed for the case.
7. Use Gemini in a new tool-less inbound extraction flow; send typed candidates to the existing
   deterministic verifier/intervention services.
8. Continue to use persisted in-app notifications as source of truth; deliver through one optional
   outbound email adapter without coupling notification success to case state.
9. Defer Gmail OAuth implementation behind Gate D. Design its adapter contract and test fixture now.
10. Implement the portability proof as a controlled partner-API fixture, not arbitrary web forms.

## Project Structure

### Documentation (this feature)

```text
specs/002-multichannel-follow-through/
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

### Source Code (repository root)

```text
packages/contracts/            # Channel, message, receipt and inbound schemas
packages/domain/               # Authorization, lifecycle and evidence policy
packages/channel-adapters/     # Sandbox, managed email and partner fixture
packages/runtime/              # Registry, dispatcher, inbound and notification services
packages/persistence/          # Firestore ledgers, dedupe, threads and TTL
packages/genkit-flows/         # Tool-less inbound interpretation
apps/web/app/api/              # Capabilities, plan, worker and provider webhooks
apps/web/components/           # Conversation approval and follow-through UX
tests/                         # Contract, integration, adversarial and deployed E2E
infra/                         # Cloud Run, Tasks, Firestore, Pub/Sub if Gmail is accepted
```

**Structure Decision**: Extend the existing package boundaries. Channel adapters perform transport
only; runtime services own orchestration; domain modules own policy; persistence implements durable
coordination; web routes authenticate boundaries and delegate.

## Delivery Gates

### Gate A — Outbound email

Contracts, approved recipient editing, capability health, verified sender configuration, durable
idempotency, one controlled send, receipt timeline, bounce handling and rollback to sandbox.

### Gate B — Inbound email

Signed webhook, replay defense, async retrieval, exact case correlation, bounded normalization,
hostile-input isolation, insufficient reply rejection and intervention behavior.

### Gate C — Bidirectional product

Browser closure, reply processing, exact verification, one return notification, stop/revoke/delete
races, deployed smoke evidence and an updated under-four-minute script.

### Gate D — Optional Gmail and portability

Only after Gate C: accept or reject Gmail based on OAuth/scope risk. Implement the partner-API
fixture independently as the portability proof. Do not delay submission-critical evidence.

## Complexity Tracking

No constitutional violations. The provider webhook and content-fetch split adds one asynchronous
step because webhook deadlines and hostile content processing cannot safely share one request.
