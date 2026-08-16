# Devpost Submission Copy

Use this as reviewed source text. Replace bracketed URLs only after they are public and verified.

## Project name

DueBack — Proof, not promises

## Tagline

Share what a company promised. DueBack follows through and closes the case only when the evidence
matches.

## Category

Taskmaster. Entrant: individual/hobbyist, Argentina.

## Inspiration

Companies often treat “request received,” “ticket opened,” or “message sent” as completion. The
customer still has to remember the deadline, repeat the context, chase the next step, and decide
whether a reply actually proves the promised outcome. DueBack is designed around a stricter idea:
an agent is not done because it acted; it is done only when independently checked evidence satisfies
the promise the person approved.

## What it does

A person pastes or uploads a company message. Gemini 3.5 Flash extracts a typed Promise Contract
with field-level provenance and uncertainty. The person reviews exactly what DueBack may do, will
never do, what data it may share, and what evidence counts as completion. After one version-bound
approval, DueBack persists the case, wakes through Cloud Tasks after the tab closes, performs a
narrow authorized follow-up, rejects acknowledgement-only or mismatched evidence, retries bounded
failures without duplicate effects, and returns with an inspectable Proof of Done.

The complete demo proves a merchant-confirmed refund. Future-bill credit and replacement tracking
fixtures reuse the same approval, policy, lifecycle, broker, evidence, and audit contracts without
pretending that three production integrations exist.

## How we built it

- Gemini 3.5 Flash on Vertex AI performs multimodal extraction with typed output, provenance, and
  uncertainty. It has no tools and cannot authorize actions or change lifecycle state.
- Genkit 1.41 defines the model flows and schemas.
- Cloud Run hosts the product/runtime and a separately observable Merchant Sandbox.
- Firestore stores versioned plans, case state, idempotency receipts, evidence, notifications,
  interventions, replay reservations, model usage, and privacy TTL timestamps.
- Cloud Tasks provides authenticated delayed delivery, bounded retry, and restart-safe continuation.
- Firebase anonymous authentication creates a low-friction but owner-isolated judge session.
- Deterministic policy and evidence verifiers—not Gemini—decide what may execute and what counts as
  done.

## The differentiator

DueBack prevents “false DONE.” External text, model output, tool output, and callbacks remain
untrusted. Approval binds the owner, case, canonical plan hash, version, and expiry. The action
broker exposes a closed tool surface and stable idempotency identity. Counterparty callbacks cross
a separate HMAC, timestamp, nonce, freshness, and replay boundary. `REQUEST_ACKNOWLEDGED` remains
open; only exact matching `MERCHANT_CONFIRMED` evidence closes the demo case, and the UI explicitly
states that this is not bank settlement.

## Challenges

The hardest part was not extraction. It was making the entire chain honest and durable: identity →
approval → delayed task → external HTTP action → acknowledgement rejection → retry/deduplication →
signed callback → deterministic verification → notification. A deployed mobile test exposed a
missing Firestore index, which we then made part of the reproducible infrastructure. A later audit
found that retention dates were not active deletion policies, so we added server-written Firestore
timestamps and enabled TTL for every in-scope collection group.

## Accomplishments

- A public mobile journey completes after the page is closed/reloaded.
- One logical external action survives duplicate task delivery and restart.
- Insufficient, wrong-case, wrong-amount, wrong-currency, wrong-reference, stale, unsigned, and
  replayed evidence cannot produce completion in the relevant automated suites.
- Four model-call, five task-attempt, three action, three notification, and daily identity budgets
  are explicit and bounded.
- Provider tokens, latency, status, price basis, and estimated Gemini cost are recorded without
  source content or personal data.
- The 28-case synthetic corpus reports its full denominator and clearly distinguishes 16 executed
  deterministic checks from 12 fixture-contract checks; it is not presented as model accuracy.

## What we learned

Agent quality is an operational property, not a prompt property. Durable state, narrow authority,
idempotency, adversarial boundaries, and evidence semantics matter more than making a model sound
confident. We also learned that a controlled service can be useful evidence when it crosses a real
HTTP/authentication boundary, exposes failures and receipts, and is labeled honestly rather than
presented as a production merchant.

## What's next

First, complete and publish the predeclared eight-person unassisted study and improve every failed
task. Next, add one authorized production counterparty adapter and a verified outbound email sender
without broad inbox access. Later channels can normalize into the same contract, but the runtime
will keep the same rule: content may propose; only the person and deterministic policy grant
authority; only verified evidence closes.

## Links

- Live app: <https://dueback-web-5m3karqdwa-uc.a.run.app>
- Controlled Merchant Sandbox: <https://dueback-merchant-sandbox-5m3karqdwa-uc.a.run.app>
- Source repository: `[PUBLIC_REPOSITORY_URL]`
- Demo video: `[PUBLIC_VIDEO_URL]`

## Disclosures

The Merchant Sandbox is a controlled service, not a real retailer. Merchant confirmation is not
bank settlement. Bill credit and replacement are portability fixtures, not production channels.
Inbound email, WhatsApp, bank access, arbitrary web browsing, and production merchant APIs are not
implemented. The project was created during the competition period; dependency and asset origins
are listed in the repository.
