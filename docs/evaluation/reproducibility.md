# Reproducibility record

## Run metadata

- Date: 16 August 2026 (UTC)
- Baseline deployed commit: `aac0012`; documentation handoff: `de6e730`
- Node.js: 22 or newer as required by the repository
- Package manager: pnpm 10.34.5
- Google Cloud project: `bulbasour-503317`
- Region: `us-central1`; Vertex AI model location: `global`
- Public web service: <https://dueback-web-5m3karqdwa-uc.a.run.app>
- Controlled merchant service: <https://dueback-merchant-sandbox-5m3karqdwa-uc.a.run.app>

## Local quality gate

The following commands were executed in order from the repository root with the committed lockfile:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm evaluate
```

Observed result: all commands exited successfully. Package tests and the root suite passed; the root
suite reported 12 files and 40 tests. The evaluation runner reported 24/24 expected outcomes, split
between 12 deterministic executions and 12 fixture-contract checks. The full per-case output is in
[`results.json`](results.json); this is not presented as 24 live model calls.

pnpm reported that the dependency install did not run the optional `esbuild@0.25.12` lifecycle
script. The application still typechecked, tested, and built successfully. No approval was added
silently because dependency lifecycle policy should be an explicit repository decision.

## Controlled local services

Both documented development commands were started independently:

```bash
pnpm --filter @dueback/merchant-sandbox dev
pnpm --filter @dueback/web dev
```

The sandbox root returned its HTML disclosure and the web `/intake` route returned HTTP success.
They were then stopped intentionally with `SIGINT`; the resulting non-zero pnpm messages are
expected operator termination, not startup failures. Port 3000 was already held by the execution
environment, so Next.js selected port 3001 and printed that deviation.

## Deployed walking skeleton

The deployed path uses Cloud Run, Firestore, Cloud Tasks, Firebase anonymous authentication,
Vertex AI through Genkit, and a separately deployed controlled merchant service. Historical
end-to-end kill-test evidence is recorded in decision D-011. During the mobile Playwright run on 16
August, the test reached activation but exposed a missing Firestore composite index for
`interventions(caseId, createdAt)`. The index is now declared in
[`firestore.indexes.json`](../../infra/firestore/firestore.indexes.json), and the deployment script
provisions it when absent.

The authoritative command is:

```bash
DUEBACK_DEPLOYED_URL='https://dueback-web-5m3karqdwa-uc.a.run.app' pnpm test:deployed
```

After the Cloud index reached `READY`, the test was rerun against the same public URL and passed in
28.9 seconds (30.1 seconds including runner overhead). It created a fresh uniquely referenced case,
reviewed the authority boundary, approved it, reloaded the result route, and observed
`Merchant-confirmed refund`, the explicit bank-settlement limitation, and the auditable timeline.
The earlier failure is retained in this record as useful production-readiness evidence rather than
discarded.

## Intentional limitations

- The merchant is a controlled HTTP simulator, visibly labeled; it is not a real retailer.
- `MERCHANT_CONFIRMED` does not prove bank settlement. The UI states this explicitly.
- Outbound email is implemented behind an adapter but disabled in the public deployment until a
  verified sender and recipient are configured.
- Inbound email, WhatsApp, arbitrary browsing, bank access, and production merchant integrations
  are out of scope.
- The eight-person unassisted study has not yet run. No usability result is claimed.
- A public repository URL and public demo video are not yet available.

## Post-audit hardening

The completion audit after `de6e730` found that retention deadlines were stored only as strings and
therefore did not constitute active deletion. The implementation now writes Firestore `Timestamp`
values to `deleteAt`, the deployment script enables TTL for every in-scope collection group, and
the development project reports those TTL configurations. The same audit added a transactional
four-call model budget plus observed latency/token/cost-basis records. Cost uses provider token
counts and the official Gemini 3.5 Flash standard-global prices observed on 2026-08-16; absent token
counts produce no estimate.
