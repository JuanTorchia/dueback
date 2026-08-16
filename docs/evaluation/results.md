# Evaluation Results

Run date: 2026-08-16. Runner: `pnpm evaluate`. Full per-case output:
[`results.json`](./results.json).

## Answer first

The versioned corpus contains 24 synthetic CC0 cases and the latest run reported 24 passing checks.
This is **not** a claim of 100% model accuracy: 12 cases execute deterministic code paths and 12
validate recorded fixture contracts. The run deliberately made zero Gemini calls, so no model cost,
model latency, field accuracy, or production success rate is inferred from it.

| Measurement              | Observed |
| ------------------------ | -------: |
| Corpus cases             |       24 |
| Passed checks            |       24 |
| Failed checks            |        0 |
| Deterministic executions |       12 |
| Fixture-contract checks  |       12 |
| Gemini calls in this run |        0 |

The JSON records each case, group, scenario, expected outcome, observed state/reason codes,
evaluation type, latency, error (including failures), runner version, model configured for the
product (`gemini-3.5-flash`), location, and cost basis.

## Coverage

- 8 clear promises: refund, next-bill credit, replacement; English and Spanish.
- 6 ambiguous evidence cases: acknowledgement, approval-only, partial amount, wrong currency,
  relative date, and contradiction.
- 4 unmet promises: overdue, no response, changed offer, and missing reference.
- 3 delivery/failure cases: duplicate task, retryable failure, and restart boundary.
- 3 adversarial cases: prompt injection, wrong-case evidence, and unsigned callback.

Automated Vitest coverage separately executes callback freshness/replay, authorization, upload
policy, retry exhaustion, restart/idempotency, case isolation, artifact grants, deletion, reopen,
and false-DONE invariants. The deployed walking skeleton was also manually observed on Cloud Run.

## What remains unmeasured

The eight-person usability study is not yet completed. No recovery dollars, NPS, adoption, false
positive rate in real merchant traffic, bank settlement rate, or universal-country support is
claimed. A future live-model evaluation must record input/output token usage and use the official
Vertex AI price applicable on its execution date before reporting estimated model cost.
