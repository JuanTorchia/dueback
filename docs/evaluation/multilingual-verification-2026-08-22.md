# Multilingual verification — 2026-08-22

## Scope

DueBack now exposes English, Spanish and Portuguese at `/en`, `/es` and `/pt`. Locale selection is
persisted in a first-party cookie, product navigation retains the prefix, APIs remain unprefixed,
and the document language and metadata match the selected locale.

The localized surface includes landing, intake, durable analysis, contract review, approval limits,
result comprehension, case controls, inbox, notifications and recoverable identity. Stored plan
contracts, API enums, hashes and evidence remain language-independent; user-provided and
counterparty-provided text is not silently machine-translated.

## Mobile browser evidence

Checked locally at a 390×844 viewport with the Next.js development server:

- `/es`: meaningful content, Spanish metadata and `lang=es`; no framework overlay or horizontal
  overflow.
- `/pt`: meaningful content, Portuguese metadata and `lang=pt`; no framework overlay or horizontal
  overflow.
- `/en`: meaningful content, English metadata and `lang=en`; no framework overlay or horizontal
  overflow.
- `/pt/intake`: Portuguese intake heading rendered with no overlay. An initial header overflow was
  reproduced, traced to long Portuguese navigation labels, corrected and rechecked successfully.

This is local browser evidence, not deployed-release evidence. Authenticated approval and result
paths still require a post-deployment smoke test with a disposable controlled-demo case.
