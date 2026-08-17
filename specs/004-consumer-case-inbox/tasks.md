# Tasks: Consumer Case Inbox

**Input**: Design documents from `specs/004-consumer-case-inbox/`

**Tests**: Required. Add the named failing test before each implementation slice.

## Phase 1 — Traceability and Product Truth

- [x] T001 Create FR/SC-to-test traceability in `specs/004-consumer-case-inbox/checklists/completion-audit.md`
- [ ] T002 [P] Add managed-email and sandbox projection fixtures in `packages/test-fixtures/src/case-projections.ts`
- [ ] T003 [P] Add channel-copy failures to `apps/web/test/case-projection.test.ts`
- [ ] T004 Implement server-side channel-aware projection in `apps/web/lib/case-projection.ts`
- [x] T005 Replace unconditional sandbox/callback copy in `apps/web/components/case-result.tsx` and `apps/web/components/case-timeline.tsx`
- [x] T006 Align live controlled-email claims in `README.md`, `docs/architecture/dueback.md`, `docs/hackathon/compliance-checklist.md` and `docs/submission/demo-script.md`

**Gate A**: managed-email UI contains zero sandbox-only labels; sandbox disclosure remains.

## Phase 2 — Foundational Ownership and Projection

- [ ] T007 [P] Define identity-claim, case-summary, conversation, comparison and technical-step schemas in `packages/contracts/src/index.ts`
- [ ] T008 [P] Add schema and redaction tests in `packages/contracts/test/consumer-case.test.ts`
- [ ] T009 Add `updatedAt` invariant to case mutations in `packages/runtime/src/case-runner.ts` and persistence tests
- [ ] T010 Add owner-history and identity-claim interfaces in `packages/runtime/src/case-history.ts` and `packages/runtime/src/identity-service.ts`
- [ ] T011 Implement bounded owner query and transactional claim in `packages/persistence/src/runtime-store.ts` and `packages/persistence/src/identity-store.ts`
- [ ] T012 Add Firestore composite index/rules/deploy checks in `infra/firestore/firestore.indexes.json`, `infra/firestore/firestore.rules` and `infra/cloud-run/deploy.sh`
- [ ] T013 Add cross-owner, cursor-tampering and concurrent-claim emulator tests in `tests/security/firestore-rules.test.ts`

## Phase 3 — User Story 1: Return to Every Follow-up (P1)

- [ ] T014 [P] [US1] Add Firebase anonymous-to-Google link and collision unit tests in `apps/web/test/firebase-identity.test.ts`
- [x] T015 [P] [US1] Add case-list API contract tests in `apps/web/test/cases-controller.test.ts`
- [x] T016 [US1] Extend Firebase client with recoverable auth state and link/sign-in operations in `apps/web/lib/firebase-client.ts`
- [ ] T017 [US1] Implement owner claim/link controller and route in `apps/web/lib/identity-controller.ts` and `apps/web/app/api/cases/[caseId]/identity/route.ts`
- [x] T018 [US1] Implement bounded owner list controller and route in `apps/web/lib/cases-controller.ts` and `apps/web/app/api/cases/route.ts`
- [x] T019 [US1] Build progressive activation identity component in `apps/web/components/recoverable-identity.tsx`
- [x] T020 [US1] Build mobile-first “My follow-ups” page in `apps/web/app/cases/page.tsx` and `apps/web/components/case-inbox.tsx`
- [x] T021 [US1] Add My follow-ups/sign-in state to `apps/web/components/app-header.tsx`
- [x] T022 [US1] Require recoverability before managed-email approval in `apps/web/components/plan-review.tsx` and `apps/web/lib/plan-controller.ts`
- [ ] T023 [US1] Add two-browser recovery/denial E2E in `tests/e2e/cross-device-return.spec.ts`

**Gate B**: clean browser recovers the same case; a different owner receives no facts.

## Phase 4 — User Story 2: Understand the Case (P1)

- [ ] T024 [P] [US2] Add safe conversation and Promised-vs-Observed projection tests in `apps/web/test/case-projection.test.ts`
- [ ] T025 [P] [US2] Add legacy-record and network-failure browser fixtures in `tests/e2e/consumer-case-detail.spec.ts`
- [ ] T026 [US2] Extend safe action/inbound read methods in `packages/persistence/src/runtime-store.ts`
- [ ] T027 [US2] Implement consumer detail projection and redaction in `apps/web/lib/case-projection.ts`
- [ ] T028 [US2] Add owner-checked detail route in `apps/web/app/api/cases/[caseId]/detail/route.ts`
- [ ] T029 [US2] Build human case header and next-action component in `apps/web/components/case-status.tsx`
- [x] T030 [US2] Build readable bounded conversation in `apps/web/components/case-conversation.tsx`
- [x] T031 [US2] Build Promised-versus-Observed result in `apps/web/components/outcome-comparison.tsx`
- [ ] T032 [US2] Refactor `apps/web/components/case-result.tsx` to use the consumer projection and progressive technical disclosure
- [x] T033 [US2] Preserve last-known state and add refresh/retry/last-updated behavior in `apps/web/components/case-result.tsx`
- [ ] T034 [US2] Add responsive case-detail styles in `apps/web/app/globals.css`

**Gate C**: weak ACK visibly stays open; sufficient explicit evidence closes with exact limitation.

## Phase 5 — User Story 3: Durable Return (P1)

- [ ] T035 [P] [US3] Add attention/completion/failure notification transition tests in `packages/runtime/test/notifications.test.ts`
- [ ] T036 [P] [US3] Add concurrent replay/bounce/suppression tests in `tests/integration/attention-notification.test.ts`
- [ ] T037 [US3] Extend truthful notification lifecycle contracts in `packages/runtime/src/notifications.ts`
- [x] T038 [US3] Connect intervention persistence to bounded delivery in `packages/runtime/src/interventions.ts` and all construction sites
- [ ] T039 [US3] Emit terminal-failure notifications from `packages/runtime/src/case-runner.ts`
- [ ] T040 [US3] Persist destination redaction, attempts and provider transitions in `packages/persistence/src/runtime-store.ts`
- [ ] T041 [US3] Add owner notification retry controller/route in `apps/web/lib/notification-controller.ts` and `apps/web/app/api/cases/[caseId]/notifications/retry/route.ts`
- [ ] T042 [US3] Render accepted/delivered/bounced/suppressed truth and retry action in `apps/web/components/case-result.tsx`
- [ ] T043 [US3] Prove closed-tab attention return in `tests/e2e/consumer-case-inbox.spec.ts`

**Gate D**: replayed attention creates one logical notification and at most one provider send.

## Phase 6 — User Story 4: Narrow Intervention (P1)

- [ ] T044 [P] [US4] Add concurrent stop/resume/dispute/reapproval tests in `tests/integration/case-control.test.ts`
- [ ] T045 [US4] Extend intervention DTO with one decision and consequences in `packages/runtime/src/interventions.ts`
- [ ] T046 [US4] Implement authority-changing correction through plan revision in `packages/runtime/src/case-control.ts`
- [ ] T047 [US4] Extend case control API with expected version and idempotency key in `apps/web/lib/control-controller.ts`
- [ ] T048 [US4] Refactor exception screen into one bounded decision in `apps/web/components/case-exception.tsx`
- [ ] T049 [US4] Add stale approval and late-event adversarial tests in `tests/adversarial/case-control-races.test.ts`

## Phase 7 — User Story 5: Judge Evidence (P2)

- [ ] T050 [P] [US5] Add redaction/eligibility contract tests in `tests/contract/technical-run.test.ts`
- [ ] T051 [P] [US5] Add non-owner/non-synthetic denial tests in `tests/adversarial/technical-run-access.test.ts`
- [ ] T052 [US5] Implement persisted allowlist projection in `packages/runtime/src/technical-run.ts`
- [ ] T053 [US5] Add required safe read methods in `packages/persistence/src/runtime-store.ts`
- [ ] T054 [US5] Add owner/synthetic-gated route in `apps/web/app/api/cases/[caseId]/technical-run/route.ts`
- [ ] T055 [US5] Build “How DueBack ran” drawer in `apps/web/components/technical-run.tsx`

## Phase 8 — User Story 6: Safe Export (P2)

- [ ] T056 [P] [US6] Add export redaction/no-capability tests in `tests/contract/case-export.test.ts`
- [ ] T057 [US6] Implement static export projection in `apps/web/lib/case-export.ts`
- [ ] T058 [US6] Add owner-checked export route in `apps/web/app/api/cases/[caseId]/export/route.ts`
- [ ] T059 [US6] Add copy/download control in `apps/web/components/case-result.tsx`

## Phase 9 — Release Validation

- [ ] T060 Add keyboard/live-region/reduced-motion/200%-reflow tests in `tests/e2e/accessibility.spec.ts`
- [ ] T061 Run full deterministic gates from `specs/004-consumer-case-inbox/quickstart.md`
- [ ] T062 Deploy and run controlled-email continuous journey with workers 1/retries 0
- [ ] T063 Record deployed revisions, redacted provider evidence and failures in `docs/evaluation/reproducibility.md`
- [ ] T064 Rehearse and record the four-minute inbox-return story in `docs/submission/demo-script.md`
- [ ] T065 Validate every FR/SC and readiness claim in `specs/004-consumer-case-inbox/checklists/completion-audit.md`
- [ ] T066 Run `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm evaluate` and `git diff --check`

## Dependency Order

```text
Product Truth → Ownership/Projection → US1 Inbox
                                   ├→ US2 Detail → US4 Intervention
                                   └→ US3 Durable Return
US2 → US5 Judge Evidence → US6 Export
All P1 gates → Release Validation
```

## Solo-Founder Strategy

Execute sequentially by kill gate. Stop feature expansion whenever A–D fails. US5 and US6 are bonus
only after the recoverable controlled-email path is deployed. No new channel or recipe enters this
task list before the continuous inbox-return demo passes.
