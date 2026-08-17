# Completion Audit: Consumer Case Inbox

**Audited**: 2026-08-17  
**Rule**: `PASS` requires executable or deployed evidence. `PARTIAL` and `TARGET` are not completion.

## Kill gates

| Gate | Status | Current evidence | Missing evidence |
|---|---|---|---|
| A — Product truth | PARTIAL | Channel-aware copy helpers/tests and managed-email false-DONE deployment | Full managed-email projection fixture plus README/architecture/demo-script consistency pass |
| B — Personal inbox | PARTIAL | Owner-scoped `/api/cases`, Google sign-in, Firebase Hosting OAuth boundary, authenticated empty state | Same real case recovered in a clean browser; non-owner denial recorded; pagination remains unimplemented |
| C — Understandable case | PARTIAL | Safe bounded conversation, Promised-vs-Observed, ACK rejection and last-known refresh behavior | One continuous managed-email weak→sufficient journey on the consumer projection |
| D — Durable return | PARTIAL | Attention persistence is connected to idempotent delivery; completion notification exists | Terminal-failure path, bounce/suppression truth, retry and closed-tab E2E |
| E — Control/evidence/release | TARGET | Existing stop/resume/reopen controls and technical ledgers | Narrow reapproval races, judge trace, accessibility matrix and recorded demo |

## Requirement traceability

| Requirement | Status | Evidence / next test |
|---|---|---|
| FR-001 | PASS | Anonymous intake and sandbox flow in deployed example matrix |
| FR-002 | PASS | Managed-email activation rejects anonymous identity in `plan-controller.test.ts` |
| FR-003 | PARTIAL | Fresh anonymous→Google linking preserves Firebase UID; existing-account collision fails closed but has no explicit draft transfer |
| FR-004 | PARTIAL | Sign-in and owner-scoped inbox deployed; Gate B two-browser case recovery pending |
| FR-005 | PARTIAL | List/result ownership checks and 404-on-mismatch tests; export/technical routes do not exist |
| FR-006 | PARTIAL | Collision is non-destructive and blocks activation; audit/explicit recovery path pending |
| FR-007 | PASS | Global `My follow-ups`, Google sign-in and authenticated state deployed |
| FR-008 | PARTIAL | Human buckets rendered, but no grouping/filter control |
| FR-009 | PASS | Case summary/card projection and controller tests |
| FR-010 | PASS | Stable owner-scoped cursor, bounded pages, malformed/cross-filter rejection and retained-list “Load more” UI |
| FR-011 | PARTIAL | Loading/empty/retry and detail last-known state exist; offline inbox preservation pending |
| FR-012 | PARTIAL | Human status/result exists; dedicated first-viewport projection pending |
| FR-013 | PASS | `channel-copy.test.ts` plus deployed channel-aware result/timeline |
| FR-014 | PASS | `case-conversation.test.ts` and bounded conversation component |
| FR-015 | PASS | Real weak ACK remained open with explicit missing/mismatched facts |
| FR-016 | PASS | Outcome comparison tests and completed result UI |
| FR-017 | PASS | Transport status and deterministic evidence status remain separate |
| FR-018 | PARTIAL | Consumer result reduces technical copy; progressive technical drawer pending |
| FR-019 | PASS | Last refresh, retained payload and retry behavior in case result |
| FR-020 | PARTIAL | Attention and completion exist; terminal execution failure pending |
| FR-021 | PARTIAL | Provider lifecycle is persisted; complete owner projection/retry pending |
| FR-022 | PARTIAL | Minimal deep-link notifications exist; redaction contract test pending |
| FR-023 | PARTIAL | Idempotency/budget exists; bounce/suppression retry rules pending |
| FR-024 | FAIL | Owner notification destination/lifecycle is not fully rendered |
| FR-025 | PARTIAL | Existing exception screen is bounded but not one-decision refactor |
| FR-026 | PARTIAL | Core controls are idempotent; concurrent-device matrix pending |
| FR-027 | PARTIAL | Contract edits version/hash/reapprove before activation; active-case authority correction pending |
| FR-028 | PARTIAL | Stop/delete guards exist; late-event adversarial matrix pending |
| FR-029 | FAIL | Technical judge projection not implemented |
| FR-030 | FAIL | Technical judge projection not implemented |
| FR-031 | FAIL | Safe export not implemented |
| FR-032 | PARTIAL | Core product/README/architecture aligned; demo-script audit pending |
| FR-033 | PASS | Controlled-pilot and settlement limitations visible and documented |
| FR-034 | PASS | Unsupported channels remain unavailable/out of scope |
| FR-035 | PARTIAL | Prior axe/reflow checks and live status fixes exist; complete P0 screen matrix pending |

## Success criteria

| Criterion | Status | Evidence / gate |
|---|---|---|
| SC-001 | TARGET | Run Gate B with a real case and record elapsed time |
| SC-002 | PARTIAL | Existing owner isolation tests; export/technical endpoints pending |
| SC-003 | UNVERIFIED HUMAN TARGET | Synthetic feedback cannot satisfy it |
| SC-004 | PARTIAL | Attention/completion replay coverage; terminal failure pending |
| SC-005 | PASS | Published weak-ACK deployed evidence plus adversarial tests |
| SC-006 | PARTIAL | Channel helper coverage; full screen fixture audit pending |
| SC-007 | PASS | Outcome comparison and explicit evidence projection |
| SC-008 | TARGET | Continuous controlled-email return demo pending |
| SC-009 | TARGET | Judge trace not implemented |
| SC-010 | TARGET | Complete accessibility E2E matrix pending |
| SC-011 | PARTIAL | External action dedupe covered; full concurrent notification matrix pending |
| SC-012 | PARTIAL | Current docs mostly aligned; demo script and final submission audit pending |

## Next execution order

1. Close Gate B with one Google-owned case and a clean-browser recovery/denial test.
2. Implement real pagination rather than claiming it.
3. Close Gate D terminal failure and notification truth.
4. Run one continuous weak-proof→sufficient-proof managed-email journey.
5. Only then build the judge trace; export remains optional.
