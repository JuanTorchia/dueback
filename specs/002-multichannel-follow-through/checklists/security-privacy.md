# Security and Privacy Checklist: Multichannel Follow-Through

- [ ] Approval binds channel, recipient, exact message scope, cadence, limits, proof and expiry
- [ ] Pilot recipient allowlist blocks arbitrary public email
- [ ] Durable local idempotency survives provider-window expiry
- [ ] Uncertain timeout reconciles rather than blindly resends
- [ ] Webhook verifies original bytes, signature, timestamp and replay identity
- [ ] Inbound retrieval uses exact provider endpoints and bounded timeouts
- [ ] Bodies, headers, signatures, quoted text and attachments remain hostile data
- [ ] Model flows have no credentials, actions or lifecycle authority
- [ ] Cross-case, cross-owner and ambiguous routing cannot alter state
- [ ] Bounce, complaint and suppression stop future sends
- [ ] Logs redact address, body, attachment, token and secret data
- [ ] Retention and requested deletion cover inbound content and provider events
- [ ] Stop, revoke, expiry and deletion dominate scheduled work
- [ ] Abuse disclosure and legitimate-relationship confirmation are visible
- [ ] External smoke uses only controlled authorized mailboxes
