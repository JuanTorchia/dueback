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

Public revision `dueback-web-00049-4jd` now has redacted evidence for an allowlisted real send and a
signed inbound weak-ACK rejection on 2026-08-18. Those facts may replace, rather than extend, up to
20 seconds of the sandbox section. State “Resend controlled pilot” and “participant-owned mailbox”;
do not expose an address, token, message body or signing secret. The acknowledgement remained open,
so never present it as a completed refund. The reproducible sandbox remains the accelerated path that
demonstrates sufficient evidence and terminal completion.

## Exact spoken track

Keep this under roughly 430 words. The visual action in the timing table remains authoritative.

> A company can say “request received” while you still carry all the work. DueBack is an agent that
> follows a commercial promise until evidence actually matches the promised outcome.
>
> I will paste a realistic refund promise in Spanish. Gemini 3.5 Flash reads the messy source and
> produces a typed outcome contract: company, amount, reference and due date, with citations back to
> the evidence. Gemini has no tools and cannot decide that the case is complete.
>
> Before any action, DueBack shows the exact recipient, message, limits and proof requirement. I am
> choosing the controlled demo adapter for reproducible timing, then approving this versioned scope.
>
> I can close the page. Cloud Tasks executes the approved action in the background and Firestore
> preserves the state. The first reply says only “request received.” DueBack rejects it: acknowledgement
> is not proof of a refund, so the case remains open. Duplicate delivery also keeps one external action
> because every attempt is idempotent.
>
> Now the controlled merchant returns signed evidence containing the exact case, amount, currency and
> reference. A deterministic verifier—not the model—accepts those facts and advances the case. The UI
> says “Company confirmed” and explicitly warns that bank settlement is not verified.
>
> My Follow-ups is the consumer return path. It asks for attention only when judgment is needed and
> keeps a safe conversation and promised-versus-observed comparison. This real controlled-email pilot
> also sent through Resend and received a weak reply through a signed webhook; the same false-DONE
> rule kept it open.
>
> Under the hood, Genkit and Gemini extract without authority; Cloud Run hosts isolated services;
> Cloud Tasks provides retries; Firestore holds durable state; and narrow adapters cross the action
> boundary. Hostile content, wrong-case evidence and unauthorized actions fail closed.
>
> DueBack is a Taskmaster entry built by one individual during the All Things Agentic Hackathon 2026:
> delegate the chase, keep the proof.
