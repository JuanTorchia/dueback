<!--
Sync Impact Report
- Version change: template → 1.0.0
- Added principles:
  - I. Verified Outcomes Over Activity
  - II. Human Authority and Least Privilege
  - III. Durable, Idempotent Execution
  - IV. Honest Evidence and Reproducible Claims
  - V. Smallest Winning Slice
- Added sections:
  - Hackathon and Technology Constraints
  - Specification and Delivery Gates
- Removed sections: none; template placeholders were resolved.
- Follow-up TODOs: none.
-->

# DueBack Constitution

## Core Principles

### I. Verified Outcomes Over Activity

Every case MUST define its completion evidence before activation. Sending a message, invoking a
tool, receiving an acknowledgement, or producing model output MUST NOT by itself mark a case
complete. A deterministic verifier MUST decide whether the approved evidence requirements are
satisfied. Gemini MAY extract, classify, reconcile, or explain evidence, but MUST NOT authorize its
own actions or unilaterally transition a case to `DONE`.

Rationale: DueBack's product promise and competitive differentiation depend on preventing false
completion, not merely automating activity.

### II. Human Authority and Least Privilege

No external action MAY occur before the person reviews and approves a versioned Resolution Plan.
The plan MUST disclose the intended result, recipient, data shared, allowed actions, approval
boundaries, evidence required, and expiry. Content received from email, documents, webhooks, tools,
or models MUST be treated as untrusted data and MUST NOT expand permissions. Sensitive,
irreversible, financial, legal, or materially different actions MUST require explicit approval.
Every active case MUST support stopping and revocation.

Rationale: people will delegate only when authority is narrow, understandable, and reversible.

### III. Durable, Idempotent Execution

Case state MUST survive process restarts and deployments. State changes MUST be applied by an
explicit deterministic transition model and recorded as auditable events. Every external action and
incoming event MUST have a stable idempotency or deduplication key. Retries, duplicate delivery,
timeouts, concurrency, expiry, and exhausted recovery MUST have testable behavior. Connectors MUST
NOT write case state directly.

Rationale: a long-running agent that loses state or repeats an action is less useful and less safe
than a manual workflow.

### IV. Honest Evidence and Reproducible Claims

The project MUST distinguish real services, controlled sandboxes, historical replays, fixtures, and
unimplemented adapters in the UI, documentation, evaluation, and video. Claims MUST match the exact
evidence level demonstrated; for example, a merchant-confirmed refund MUST NOT be described as
funds settled in a bank account. Metrics MUST come from published, reproducible test cases and MUST
include failures. Secrets, personal data, fabricated integrations, invented user results, and
unlicensed assets MUST NOT enter the repository or demo.

Rationale: credibility is a product feature and an explicit judging advantage.

### V. Smallest Winning Slice

Work MUST prioritize one deployed end-to-end promise-resolution case over breadth. Secondary
promise types, channels, visual polish, bonus integrations, marketplace concepts, and speculative
scale MUST NOT begin until the walking skeleton passes its kill test. Every feature MUST strengthen
at least one official judging dimension and MUST have an observable acceptance path, explicit error
handling, verification, and reproduction instructions. Unnecessary agents and cloud services MUST
be excluded.

Rationale: a solo participant with a fixed deadline wins through depth, proof, and clarity rather
than a broad but superficial platform.

## Hackathon and Technology Constraints

- The submission MUST target exactly one official category; the working category is `The
Taskmaster` until final review.
- The deployed product MUST use Gemini 3.5 or newer, one permitted Google agent framework, and at
  least one Google Cloud infrastructure service in essential, visible roles.
- The agent MUST act asynchronously beyond a conventional chat loop and demonstrate state,
  recovery, controlled tools, and observable external change.
- The implementation MUST be newly created during the eligible hackathon period. Pre-existing
  code, templates, data, and assets MUST be declared and license-compatible.
- English MUST be supported for judging; bilingual Spanish/English behavior MAY be added only
  after the primary path is stable.
- The demo MUST be executable in under four minutes, use synthetic personal data, label accelerated
  time, and show the deployed Google Cloud backend.
- Until a framework spike is decided, specifications MUST remain framework-neutral. The technical
  plan MUST select exactly one of Genkit or ADK and record the rationale.

## Specification and Delivery Gates

The mandatory workflow is:

1. Constitution.
2. Product specification focused on user outcomes and boundaries.
3. Clarification of consequential ambiguity.
4. Requirements and security/privacy checklists.
5. Technical plan and research-backed decisions.
6. Actionable tasks with acceptance tests and dependency order.
7. Cross-artifact analysis with all critical issues resolved.
8. Implementation of the 48-hour walking skeleton.
9. Kill-test decision: continue DueBack, pivot channel, or pivot wedge.
10. Remaining product work, evaluation, documentation, deployment, and video.

No implementation MAY begin while critical clarification markers remain, mandatory checklist items
fail, or the specification, plan, and tasks contradict this constitution. Tests MUST cover the
happy path, false completion, insufficient evidence, unauthorized action, duplicate delivery,
retry, restart, invalid webhook, and evidence linked to the wrong case. A capability is complete
only when it is deployed or reproducibly runnable, handles errors explicitly, exposes a way to
verify its result, and is documented for another person.

## Governance

This constitution supersedes conflicting project conventions and planning artifacts. `AGENTS.md`
continues to govern collaboration and repository safety; where both apply, the stricter requirement
prevails. Amendments require a documented rationale, a semantic version change, an updated Sync
Impact Report, and review of affected specs, plans, tasks, tests, and decisions. MAJOR versions
remove or redefine a governing obligation, MINOR versions add or materially expand obligations,
and PATCH versions clarify without changing meaning.

Every specification, plan, task list, implementation review, and release gate MUST verify
constitutional compliance. Exceptions MUST be explicit, time-bounded, recorded in the decision
log, and MUST NOT weaken eligibility, evidence honesty, authorization, or false-completion safety.

**Version**: 1.0.0 | **Ratified**: 2026-08-15 | **Last Amended**: 2026-08-15
