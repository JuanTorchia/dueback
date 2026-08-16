# Four-Minute Demo Script and Evidence Shot List

Target duration: 3:50. Spoken English. Record in one continuous take; accelerated waits must be
labeled on screen. Never call the Merchant Sandbox a real merchant.

| Time      | Narration / action                                                                                                                          | Evidence visible                                                                    |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 0:00–0:20 | “Companies call a request received ‘done’. People still carry the follow-up. DueBack keeps a commercial promise open until there is proof.” | Mobile landing; no dashboard or empty chat                                          |
| 0:20–0:48 | Paste the Spanish USD 79 refund fixture.                                                                                                    | Formats, privacy line, Spanish source                                               |
| 0:48–1:12 | “Gemini 3.5 Flash extracts a typed candidate with citations. It cannot call tools or close a case.”                                         | Promise Contract, amount/reference/date, provenance, uncertainty                    |
| 1:12–1:34 | Show `may / never / data shared / done means`; simulate, then approve.                                                                      | Recipient, fields, `MERCHANT_CONFIRMED`, plan hash/version                          |
| 1:34–1:52 | Close/reload the tab. Label the demo clock acceleration.                                                                                    | Cloud Task and persisted case; user is not keeping the session alive                |
| 1:52–2:16 | Merchant Sandbox sends `REQUEST_ACKNOWLEDGED`.                                                                                              | Separate controlled-service page; timeline says `Not done` and `INSUFFICIENT_LEVEL` |
| 2:16–2:38 | Show one injected retry/redelivery fixture.                                                                                                 | Stable idempotency key, one merchant ledger entry, bounded retry                    |
| 2:38–3:02 | Signed `MERCHANT_CONFIRMED` callback arrives.                                                                                               | HMAC boundary, exact case/amount/currency/reference, state `DONE`                   |
| 3:02–3:20 | Open the completion notification and proof timeline.                                                                                        | `Merchant-confirmed refund`; explicit “not bank settlement” limitation              |
| 3:20–3:37 | Show the hostile-source and wrong-case tests.                                                                                               | Zero unauthorized action, evidence rejection, intervention deep link                |
| 3:37–3:50 | Show current architecture and Cloud Run revisions.                                                                                          | Gemini/Genkit, Cloud Run, Firestore, Cloud Tasks; corpus result with denominator    |

## Required capture checklist

- Public DueBack URL and public controlled-sandbox status page.
- Mobile viewport and a readable English explanation even when the fixture is Spanish.
- Vertex AI / Gemini model ID, Genkit code, Cloud Run service revisions, Firestore state, Cloud Task,
  action receipt, callback verification, evidence reason, notification record, and correlation ID.
- Merchant Sandbox label, accelerated-time label, corpus denominator, failures (if any), and the
  exact limits of the completion claim.
- End card: `Taskmaster · Individual/Hobbyist · Built during All Things Agentic Hackathon 2026`.
