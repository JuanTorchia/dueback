# DueBack — Proof, not promises

DueBack is a durable consumer agent for commercial promises. A person shares a message, PDF, or
screenshot describing what a company promised. Gemini 3.5 Flash extracts a cited Promise Contract;
the person approves narrow authority once; DueBack follows through asynchronously and refuses to
call the case done until deterministic evidence satisfies that contract.

Built from scratch for All Things Agentic Hackathon 2026 in the **Taskmaster** category by one
individual participant in Argentina. The project also targets the Individual/Hobbyist prize.

## Judge access

- App: <https://dueback-web-5m3karqdwa-uc.a.run.app>
- Controlled Merchant Sandbox: <https://dueback-merchant-sandbox-5m3karqdwa-uc.a.run.app>

The sandbox is intentionally public for inspection and visibly labeled. Its action endpoint still
requires a secret. No paid account or real personal/merchant data is required. Firebase anonymous
authentication creates an isolated owner identity when a case is activated.

## What the implemented demo proves

1. Paste or upload PDF/JPEG/PNG/text under content-detected limits.
2. Genkit invokes `gemini-3.5-flash` on Vertex AI to return typed fields with provenance and
   uncertainty. The model has no tools or lifecycle authority.
3. The person reviews what DueBack may do, will never do, will share, and what counts as done.
4. Approval binds owner, case, plan version, canonical hash, and expiry.
5. Cloud Tasks resumes the case after the tab closes. Firestore provides versioned durable state.
6. A deterministic Action Broker allows one closed HTTP follow-up with an idempotency ledger.
7. A separately deployed Merchant Sandbox emits signed callbacks. `REQUEST_ACKNOWLEDGED` is rejected
   as insufficient; matching `MERCHANT_CONFIRMED` evidence closes the case.
8. The timeline, correlation ID, notification ledger, exact claim, and claim limitation remain
   inspectable. Stop, revoke, expire, deletion, and reopen paths preserve user control.

Bill-credit and replacement-with-tracking manifests prove reuse of approval, policy, broker,
verifier, and lifecycle semantics. They are portability fixtures, not production integrations.

## Google technology

- Gemini 3.5 Flash through Vertex AI (`global`).
- Genkit 1.41 with `@genkit-ai/google-genai` and `vertexAI()`.
- Cloud Run for the web/runtime and controlled merchant service.
- Firestore for plans, runs, action/evidence ledgers, notifications, interventions, replay defense,
  security budgets, and deletion tombstones.
- Cloud Tasks for scheduled/retried OIDC worker delivery.
- Firebase Authentication for frictionless owner identity.

See [architecture and trust boundaries](docs/architecture/dueback.md) and the
[decision log](docs/decisions/decision-log.md).

## Local setup

Requirements: Node 22.x, Corepack, pnpm 10.34.5, a Google Cloud project with Application Default
Credentials for live Gemini/Firestore paths. Unit and deterministic evaluation paths do not require
paid credentials.

```bash
corepack enable
corepack prepare pnpm@10.34.5 --activate
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm evaluate
```

For the live web app, populate the public Firebase web identifiers and use secret injection for
`MERCHANT_CALLBACK_SECRET`; never place real secret values in a committed file. Start services in
separate terminals:

```bash
pnpm --filter @dueback/merchant-sandbox dev
pnpm --filter @dueback/web dev
```

Open <http://localhost:3000/intake>. Package manifests contain the exact scripts available in each
workspace.

## Reproducible Google Cloud deployment

The deployer creates/checks required APIs, Artifact Registry, service accounts and least-privilege
roles, Firestore, Cloud Tasks, Secret Manager, builds both images, deploys Cloud Run, and wires
callback/worker URLs.

```bash
export GOOGLE_CLOUD_PROJECT='your-project-id'
export GOOGLE_CLOUD_LOCATION='us-central1'
export MERCHANT_CALLBACK_SECRET='supply-out-of-band'
export FIREBASE_WEB_API_KEY='public-web-config-value'
export FIREBASE_AUTH_DOMAIN='your-project.firebaseapp.com'
export FIREBASE_APP_ID='public-web-config-value'
bash infra/cloud-run/deploy.sh
```

Firebase/Identity Platform anonymous sign-in must be enabled for the project. Firestore rules and
indexes live under `infra/firestore/`; the queue contract is `infra/cloud-tasks/queue.yaml`.

Run the mobile deployed journey after deployment:

```bash
DUEBACK_DEPLOYED_URL='https://your-web-service.run.app' pnpm test:deployed
```

The reset script refuses broad deletion and requires exact project, case, owner, and a scoped
confirmation hash; see `scripts/demo/reset.ts` before use.

## Verification and measured evidence

- `pnpm test`: package tests plus contract, integration, adversarial, and E2E runtime tests.
- `pnpm evaluate`: versioned 24-case corpus with per-case output in
  [`docs/evaluation/results.json`](docs/evaluation/results.json).
- `pnpm research:report`: validates exactly eight consented P01–P08 rows before generating study
  denominators and threshold results; it refuses the empty template.
- [Evaluation interpretation](docs/evaluation/results.md) distinguishes deterministic executions
  from fixture-contract checks and explicitly reports zero model calls in that run.
- [Four-minute demo script](docs/submission/demo-script.md).
- [Consent-safe user-study protocol](docs/research/user-study-protocol.md).

## Safety, privacy, and limits

- 10 MB/file, 20 PDF pages, 20 megapixels/image, 50,000 text characters, three artifacts/case.
- 10 new cases/identity/day, four model calls/normal case, five task attempts, three logical external
  actions, and three notifications.
- Raw uploaded bytes are processed in memory in the current P0 and are not stored as public files.
  Artifact grants are owner/case/artifact-bound and expire within ten minutes.
- Requested deletion makes the readable case unavailable and retains only a privacy-safe tombstone
  for bounded audit. No forensic-erasure or backup-deletion claim is made.
- Firestore `deleteAt` TTL policies cover drafts, dedupe records, case runs, evidence, events,
  notifications, interventions, security budgets, model usage, and deletion tombstones. TTL is
  eventual deletion by Firestore, not an immediate or forensic-erasure guarantee.
- Each model call is reserved before execution. Firestore records call count, observed provider
  token usage, latency, status, and an estimated standard-global USD cost when token counts exist.
  The price basis and observation date are stored with the estimate.
- External source text, model output, tool output, and callbacks remain untrusted data.

## Honest limitations

- Merchant Sandbox crosses a real HTTP boundary but is not a real company or refund integration.
- Merchant confirmation is not bank settlement. Replacement tracking is not delivery. A promised
  bill credit is not proof of the final bill total.
- Inbound email, WhatsApp, banks, general web browsing, and arbitrary merchant APIs are not built.
- Outbound email has an idempotent Resend-compatible adapter but is disabled in the public deployment
  until a verified sender and authorized recipient exist; the current return channel is the case UI.
- English is the judging UI; one Spanish promise is processed without changing its financial meaning.
- The eight-person usability study has a published protocol but results must not be claimed until the
  sessions are actually completed.

## Provenance

The application was initialized on 2026-08-15 during the competition period. No pre-existing app
code was incorporated. Synthetic fixtures were authored for this entry and labeled CC0. Dependency
and asset origins are recorded in [the provenance register](docs/compliance/dependencies.md).
