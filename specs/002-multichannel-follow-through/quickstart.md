# Quickstart: Multichannel Follow-Through

## Deterministic verification without provider credentials

```bash
corepack enable
corepack prepare pnpm@10.34.5 --activate
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Run adapter contracts and bidirectional fixtures:

```bash
pnpm --filter @dueback/channel-adapters test
pnpm --filter @dueback/runtime test
pnpm exec vitest run tests/contract tests/integration tests/adversarial
```

No test may require a real address, domain, token or secret unless it is explicitly marked external.

## Local sandbox route

Copy `.env.example` to an ignored local environment file. Leave
`COMPANY_CONTACT_MODE=sandbox`, run the sandbox and web services, create a synthetic case, inspect
the full conversation plan, approve it and observe acknowledgement rejection followed by exact
merchant confirmation.

## Controlled email smoke gate

Before switching modes, verify all of these out of band:

- sending domain/remitter verified;
- receiving/reply domain active;
- provider webhook signing secret stored in Secret Manager;
- exactly listed controlled recipient mailbox;
- inbound webhook registered to the deployed HTTPS endpoint;
- rollback command/configuration to `sandbox` prepared.

Set secrets through the deployment platform, never a committed file. Set non-secret mode/sender
configuration and deploy. Send only to the authorized controlled mailbox. Reply first with a fixture
acknowledgement, then a controlled sufficient confirmation. Record provider IDs, state transitions,
timing and failures with addresses redacted.

## Public browser verification

```bash
DUEBACK_DEPLOYED_URL='https://your-service.run.app' \
  pnpm exec playwright test --workers=1 --retries=0
```

The public path must remain functional in sandbox mode if email smoke is not stable.
