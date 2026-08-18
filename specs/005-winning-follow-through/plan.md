# Implementation Plan: Winning Follow-through Loop

## Summary

Repair the core autonomy gap first, then repair the consumer projections that made the real deployed
case look like “Gmail / 5900 / past next check”. Preserve the existing Google Cloud boundaries and
controlled channel authority.

## Architecture

- `CaseRunner` owns each bounded logical send and schedules the next wake after success.
- `EvidenceService` invalidates the prior wake through versioning and schedules a replacement after
  insufficient non-conflicting evidence.
- `FirestoreRuntimeStore.record` atomically writes evidence, state, version and `nextWakeAt`.
- Cloud Tasks remains the durable scheduler; version checks make stale work harmless.
- `ResolutionPlan.counterpartyName` is optional for backwards compatibility and included in the
  versioned approval hash for new plans.
- Consumer projection helpers format values; canonical records remain unchanged.
- Intake artifacts use a private lifecycle-managed Cloud Storage bucket. A Firestore analysis job and
  OIDC Cloud Task let the request return before Gemini runs; the owner polls persisted stage only.

## Delivery Order

1. Write failing runtime race/budget/scheduling tests.
2. Implement the durable chase loop and adaptive bounded follow-up.
3. Persist counterparty name and correct consumer projections.
4. Convert synchronous intake into a durable analysis job and correct dates/copy/loading states.
5. Run full local gates, deploy, and execute public sequential journeys.

## Kill Gates

- No deploy if a weak ACK can leave a case without a future wake or intervention.
- No deploy if a replay can create two logical sends.
- No release freeze while the public UI renders raw minor units/enums or provider-derived company
  names.
- No video until the deployed loop shows a real scheduled second action or its accelerated fixture.
