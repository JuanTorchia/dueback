# Four-Minute Demo Script and Evidence Shot List

Target duration: 3:50. Spoken English. Record in one continuous take; accelerated waits must be
labeled on screen. Never call the Merchant Sandbox a real merchant.

| Time      | Narration / action                                                                                                                          | Evidence visible                                                                    |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 0:00–0:20 | “Companies call a request received ‘done’. People still carry the follow-up. DueBack keeps a commercial promise open until there is proof.” | Mobile landing; no dashboard or empty chat                                          |
| 0:20–0:48 | Paste the Spanish USD 79 refund fixture.                                                                                                    | Formats, privacy line, Spanish source                                               |
| 0:48–1:12 | “Gemini 3.5 Flash extracts a typed candidate with citations. It cannot call tools or close a case.”                                         | Promise Contract, amount/reference/date, provenance, uncertainty                    |
| 1:12–1:34 | Show the five-line approval summary, Demo API already selected, exact recipient/message/limits/proof, then approve. | Sandbox selected by default for safety and deterministic timing; managed email remains an explicit controlled-pilot choice; plan version is visible and hash stays under technical disclosure |
| 1:34–1:52 | Close/reload the tab. Label the demo clock acceleration.                                                                                    | Cloud Task and persisted case; user is not keeping the session alive                |
| 1:52–2:16 | Merchant Sandbox sends `REQUEST_ACKNOWLEDGED`.                                                                                              | Consumer case says `Not done — request received only`; Promised vs. Observed keeps absent facts missing |
| 2:16–2:38 | Show one injected retry/redelivery fixture.                                                                                                 | Stable idempotency key, one merchant ledger entry, bounded retry                    |
| 2:38–3:02 | Signed `MERCHANT_CONFIRMED` callback arrives.                                                                                               | HMAC boundary, exact case/amount/currency/reference, state `DONE`                   |
| 3:02–3:20 | Reopen from `My follow-ups` and inspect the completion.                                                                                      | Human status/next action, notification truth, `Company confirmed`, explicit “bank settlement is not verified” limitation |
| 3:20–3:37 | Show the hostile-source and wrong-case tests.                                                                                               | Zero unauthorized action, evidence rejection, intervention deep link                |
| 3:37–3:50 | Open `How DueBack ran`, then show current architecture and Cloud Run revision.                                                               | Redacted persisted stages; Gemini/Genkit, Cloud Run, Firestore, Cloud Tasks; corpus denominator |

## Required capture checklist

- Public DueBack URL and public controlled-sandbox status page.
- Mobile viewport and a readable English explanation even when the fixture is Spanish.
- Vertex AI / Gemini model ID, Genkit code, Cloud Run service revisions, Firestore state, Cloud Task,
  action receipt, callback verification, evidence reason, notification record, and correlation ID.
- Merchant Sandbox label, accelerated-time label, corpus denominator, failures (if any), and the
  exact limits of the completion claim.
- `/api/channels` truthfully showing sandbox availability and the actual managed-email/Gmail/partner
  status. Never show fixture provider IDs as live email evidence.
- End card: `Taskmaster · Individual/Hobbyist · Built during All Things Agentic Hackathon 2026`.

## Final rehearsal record

Do not mark the release task complete from a desk review. Record one unedited rehearsal here after
the final revision passes the deployed suite:

| Field | Required value |
|---|---|
| Date/time UTC | Pending real rehearsal |
| Public revision | Pending final frozen revision |
| Actual duration | Must be `≤ 04:00` |
| Retakes during recorded run | Must be `0` |
| Spoken/subtitle language | English, or Spanish with complete English subtitles |
| Visible live evidence | App, Cloud Task/runtime result, proof comparison, redacted trace, Cloud Run revision |
| Recording URL | Pending public YouTube/Vimeo URL |

## Optional controlled-email insert

The deployed controlled pilot has redacted evidence for one allowlisted real send and one signed
inbound weak-ACK rejection. Those two facts may replace, rather than extend, up to 20 seconds of the
sandbox section. Do not show or claim a sufficient real-email completion until that separate gate
passes. State “Resend controlled pilot” and “owned mailbox”; do not expose an address, token, body or
signing secret. The reproducible sandbox remains the only accelerated complete outcome in the demo.
