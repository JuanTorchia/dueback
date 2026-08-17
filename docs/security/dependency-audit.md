# Production Dependency Audit

Audited: 2026-08-17 with `pnpm audit --prod` against the frozen lockfile.

## Result

The audit reports seven transitive advisories: three high and four moderate. They originate from
OpenTelemetry and `uuid` versions pinned below Genkit 1.41.0 / Firebase Admin dependencies. Genkit
1.41.0 is the current version resolved by `pnpm outdated`; there is no compatible parent upgrade in
the current dependency graph. The patched OpenTelemetry lines (`sdk-node >=0.217`, core >=2.8) are a
different coordinated major generation from Genkit's `sdk-node ^0.52` / core `~1.25` constraints, so
forcing them with an override would be an unverified framework ABI change and is not accepted.

## Reachability and controls

- The Prometheus crash advisory requires an exposed Prometheus exporter receiving malformed HTTP.
  DueBack does not configure or expose a Prometheus exporter.
- The Jaeger propagation advisory requires the Jaeger propagator to process attacker-controlled
  trace headers. DueBack does not configure Jaeger propagation; public requests terminate at Cloud
  Run/Next handlers with bounded application headers.
- The OpenTelemetry baggage allocation advisory concerns W3C baggage propagation. DueBack does not
  use baggage for authorization, state or correlation and does not expose a custom telemetry ingest
  endpoint. Cloud Run request limits remain an outer bound.
- The `uuid` advisory concerns caller-supplied buffers in v3/v5/v6 APIs. DueBack uses Node
  `crypto.randomUUID()` for its own identifiers and never passes an untrusted buffer to transitive
  UUID APIs.

These facts reduce present reachability but do not make the vulnerable packages patched. The audit
must continue to report the advisories until Genkit/Firebase publish a compatible dependency update.
Before a post-hackathon public pilot, update the Google dependencies, rerun the complete suite and
require `pnpm audit --prod` to be clean or repeat this reachability review against the new graph.

## Commands and evidence

```bash
pnpm audit --prod
pnpm outdated -r
pnpm why @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node \
  @opentelemetry/propagator-jaeger @opentelemetry/core uuid
```

Do not add audit-ignore configuration: future CI/operators must continue seeing these findings.
