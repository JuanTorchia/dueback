# Specification completion audit

Audit date: 2026-08-16. A checked task is not accepted as proof by itself. This table maps the
mandatory requirements to executable or inspectable evidence and keeps external deliverables open.

## Functional requirements

| Requirements                                         | Status                                                | Authoritative evidence                                                                                                      |
| ---------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| FR-001–FR-004 intake, types, provenance, uncertainty | Verified                                              | `upload.test.ts`, `extract-promise.test.ts`, `intake-controller.test.ts`, `capture-approve.test.ts`                         |
| FR-005–FR-009 plan boundary and authority            | Verified                                              | `plan-service.test.ts`, `policy.test.ts`, `capture-approve.test.ts`, review UI                                              |
| FR-010–FR-013 durability, dedupe, ordered history    | Verified for implemented path                         | `durable-follow-through.test.ts`, `refund-walking-skeleton.spec.ts`, deployed Playwright path                               |
| FR-014–FR-017 exact evidence and false-DONE          | Verified                                              | `verifier.test.ts`, `callbacks.test.ts`, `callback-controller.test.ts`                                                      |
| FR-018–FR-020 notifications and direct experience    | Verified                                              | `notifications.ts`, `runtime-store.ts`, result/exception routes, deployed mobile test                                       |
| FR-021 refund end to end                             | Verified                                              | public Cloud Run walking skeleton and `refund-walking-skeleton.spec.ts`                                                     |
| FR-022 portable credit/replacement semantics         | Verified as contract fixtures                         | `promise-portability.test.ts`; no production integration is claimed                                                         |
| FR-023–FR-027 labels, privacy, claim level, language | Verified                                              | sandbox status page, result UI, Spanish fixture tests, README limitations                                                   |
| FR-028–FR-030 evaluation and reproducibility         | Verified with disclosed scope                         | 24-case corpus, `results.json`, `reproducibility.md`                                                                        |
| FR-031–FR-032 identity and separate callback trust   | Verified                                              | `capture-approve.test.ts`, `isolation.test.ts`, `callbacks.test.ts`                                                         |
| FR-033 bounded retention/deletion                    | Verified in code and development infrastructure       | transient raw bytes, owner deletion tests, server-written Firestore `deleteAt`, active TTL policies; TTL remains eventual   |
| FR-034 upload policy                                 | Verified                                              | content-detected bounded upload implementation and adversarial tests                                                        |
| FR-035 budgets and model telemetry                   | Verified in code and revision `dueback-web-00013-7ph` | transactional case/model budgets, bounded task/action/notification code, observed provider tokens/latency/status/cost basis |
| FR-036–FR-039 trust-boundary attacks                 | Verified across automated suites                      | hostile input, callback, isolation, broker, upload and deterministic verifier tests                                         |
| FR-040 submission identity/stack/provenance          | Verified in repository                                | README, decision log, dependency/provenance register                                                                        |
| FR-041 deterministic judge path                      | Verified except final video capture                   | scoped reset, public mobile Playwright, demo script, controlled sandbox                                                     |
| FR-042 eight-person measurement                      | **Open — external evidence required**                 | protocol and validated empty schema exist; denominator remains zero                                                         |
| FR-043 walking-skeleton gate                         | Verified                                              | D-011 plus deployed mobile rerun in `reproducibility.md`                                                                    |
| FR-044 final judging package                         | **Open — external publication required**              | repository URL, public English video, and Devpost submission are missing                                                    |

## Success criteria

| Criteria      | Status                                    | Evidence or gap                                                                                     |
| ------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------- |
| SC-001–SC-002 | **Unmeasured**                            | Requires eight real, unassisted adult participants. `pnpm research:report` refuses incomplete data. |
| SC-003–SC-007 | Verified in synthetic/controlled scope    | Verifier, idempotency, retry, restart, authorization, and intervention suites pass.                 |
| SC-008–SC-010 | Verified for public controlled demo       | Deployed mobile test passed in 28.9 seconds; Merchant Sandbox and claim limitation are visible.     |
| SC-011        | Verified fixture behavior                 | Spanish extraction contract preserves merchant, amount, currency, deadline, and evidence meaning.   |
| SC-012        | Partially measured and honestly disclosed | Deterministic corpus results exist; live traffic and usability metrics are not claimed.             |
| SC-013        | Verified across adversarial tests         | Ownership, approvals, callbacks, input limits, and budgets reject without unauthorized action.      |

## Remaining completion gate

The implementation goal cannot be declared complete until all of the following evidence exists:

1. eight consented P01–P08 rows and a successfully generated study report;
2. participant confirmation of sanctions/conflict eligibility;
3. a judge-accessible repository URL;
4. a public video no longer than four minutes, in English or with English subtitles;
5. the final Devpost submission before the deadline.

No repository checkbox or synthetic fixture can substitute for those facts.
