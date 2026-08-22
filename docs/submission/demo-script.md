# Four-Minute Demo Script and Evidence Shot List

Target duration: 3:50. Spoken English. Record in one continuous take; accelerated waits must be
labeled on screen. Never call the Merchant Sandbox a real merchant.

| Time      | Narration / action                                                                                                                          | Evidence visible                                                                    |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 0:00–0:15 | “Companies call a request received ‘done’. People still carry the follow-up. DueBack keeps the promise open until there is proof.” | Mobile landing and concrete refund example                                          |
| 0:15–0:30 | Choose Missing refund; submit the synthetic Spanish promise.                                                                                | One-click preset, privacy/retention line, Spanish source                            |
| 0:30–0:50 | Gemini extracts the cited candidate; quickly show amount, reference, deadline and required proof.                                            | Real asynchronous analysis, provenance, uncertainty                                |
| 0:50–1:05 | Show the compact approval summary, shared data, limits and sandbox disclosure; approve.                                                       | Exact authority before action                                                       |
| 1:05–1:15 | Close/reload the tab. Label the accelerated demo clock.                                                                                      | Saved case; browser is not executing the workflow                                   |
| 1:15–1:30 | Show `REQUEST_ACKNOWLEDGED` rejected.                                                                                                        | `Still working`; promised versus observed; next follow-up scheduled                 |
| 1:30–1:45 | Show the signed confirmation and reopen from `My follow-ups`.                                                                                | `Company confirmed`, durable return path, bank-settlement limitation                |
| 1:45–2:05 | Brief controlled-email insert.                                                                                                              | Real allowlisted delivery and signed weak-reply rejection; no arbitrary-company claim |
| 2:05–2:25 | Show retry/deduplication and hostile/wrong-case checks.                                                                                       | One logical action, zero unauthorized completion                                   |
| 2:25–3:18 | Open `How DueBack ran` and correlate the case to redacted Cloud evidence.                                                                     | Gemini/Genkit, Cloud Run, Firestore, Cloud Tasks, action and evidence records       |
| 3:18–3:40 | Show the architecture as an explanation of the completed product journey.                                                                    | Model without authority; deterministic policy/verifier; narrow action boundary      |
| 3:40–3:50 | End card and exact limitation.                                                                                                                | Taskmaster · Individual/Hobbyist · controlled demo, not bank settlement             |

The complete consumer loop must be visible by `1:45`—90 seconds after intake begins. Architecture explains the observed product
afterward; it must not delay the first visible result.

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
