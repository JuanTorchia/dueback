# Final demo production plan

Target: one continuous product run plus direct, redacted Google Cloud evidence. Final duration
`03:25–03:45`, 16:9 at 1080p, English narration, English captions, no music. The product journey
from approval through acknowledgement rejection and accepted proof must remain continuous.

## Gemini TTS direction

Use Gemini 2.5 Pro TTS or Gemini 3.1 Flash TTS Preview with a single neutral US-English voice.

```text
Audio profile: a warm, trustworthy technical founder in their thirties. Neutral American English.
Clear and conversational, never theatrical or salesy.

Scene: a concise live software demonstration for expert hackathon judges. The speaker understands
the system deeply and is calmly showing evidence, not reading marketing copy.

Director's notes: Speak at roughly 132–138 words per minute. Use restrained confidence. Keep product
and service names crisp. Pronounce DueBack as “Due Back”, Gemini as “Gem-in-eye”, and Genkit as
“Gen-kit”. Pause briefly before “Acknowledgement is not proof” and before “A deterministic
verifier—not the model”. Do not add, omit, paraphrase, or repeat words. No music or sound effects.
```

## Narration

> A company can mark a request received while the customer still carries all the follow-up.
> DueBack keeps the promise open until evidence matches the outcome the person approved.
>
> I will use a synthetic refund promise. Gemini reads the source asynchronously and
> extracts a typed contract: the company, amount, reference, deadline, citations, and uncertainty.
> Gemini has no tools and cannot decide that the case is complete.
>
> Before anything leaves DueBack, I can inspect the exact recipient, message, shared data, attempt
> limit, and proof requirement. This accelerated path uses a controlled merchant sandbox, not a
> real company. I approve only this versioned scope.
>
> The browser is not running the workflow. Cloud Tasks resumes it in the background and Firestore
> preserves the state. The first signed reply says only that the request was received.
>
> Acknowledgement is not proof.
>
> DueBack keeps the case open and performs the next bounded attempt without duplicating the logical
> action. The controlled counterparty then returns signed evidence matching the exact case, amount,
> currency, and reference.
>
> A deterministic verifier—not the model—accepts that evidence. The result is merchant-confirmed,
> and DueBack explicitly warns that bank settlement is not verified.
>
> Here is the same case in the technical trace. The correlation ID connects the Genkit and Gemini
> extraction, Firestore state, Cloud Task, action receipt, signed callback, and evidence decision.
>
> And here is the deployed backend: the current Cloud Run revision receiving traffic, the running
> Cloud Tasks queue with bounded retries, the Firestore database, and the Gemini model invocation on
> Google Cloud.
>
> Gemini proposes structured facts without authority. Deterministic policy controls action, and
> deterministic evidence controls completion. DueBack is a Taskmaster entry built by one individual
> during the All Things Agentic Hackathon: delegate the chase, keep the proof.

## Shot contract

| Time        | Visual                                   | Non-negotiable evidence                                                                     |
| ----------- | ---------------------------------------- | ------------------------------------------------------------------------------------------- |
| 00:00–00:08 | Landing and concrete refund card         | Problem, affected person and one-line value                                                 |
| 00:08–00:30 | English preset and asynchronous analysis | Source, Gemini stage, saved/background state                                                |
| 00:30–00:48 | Outcome Contract close-up                | Extracted facts, provenance, uncertainty and required proof remain readable                 |
| 00:48–01:10 | Approval Boundary close-up               | Recipient, exact message, shared data, attempt limit and sandbox disclosure                 |
| 01:10–01:44 | Continuous activation-to-result run      | Leave/reload, durable return, weak ACK, bounded retry and accepted proof; no editorial cuts |
| 01:44–02:04 | Verdict and proof comparison             | Merchant-confirmed limitation, `ACK ≠ PROOF`, promised vs observed                          |
| 02:04–02:28 | Technical trace close-ups                | Visible correlation ID, Genkit/Gemini, Firestore, Task, action, callback and verifier       |
| 02:28–03:08 | Google Cloud Console                     | Active Cloud Run revision, Tasks queue/retry, Firestore case and Vertex/Gemini invocation   |
| 03:08–03:31 | Architecture zoom                        | Model without authority; policy, action, state and verifier boundaries                      |
| 03:31–03:40 | Return to verified product result        | Taskmaster · Individual/Hobbyist · controlled sandbox, not bank settlement                  |

## CapCut contract

- Canvas: 1920×1080, 30 fps. Record the browser itself at 1920×1080 or crop from a larger
  lossless capture. Place the continuous product capture without cutting inside the live
  approval-to-result sequence. Still screenshots are planning evidence, not a substitute for the
  live run.
- Narration: normalize peaks near `-3 dB`; target integrated loudness around `-16 LUFS`.
- Captions: Inter SemiBold, 44–48 px, maximum two lines, 4–9 words per cue and roughly 32–38
  characters per line. Keep them inside the lower safe area, but move them above any evidence they
  would cover. Do not use word-by-word karaoke animation.
- Use only simple cuts between the continuous product run, Cloud Console evidence, architecture,
  and end card. No transitions, zoom animations, background music, or decorative effects.
- Redact account email, project billing information, tokens, secrets, raw user data, and unrelated
  projects. Keep service name, revision, queue policy, database mode, model ID, case ID, and
  correlation ID visible.
- Export H.264 MP4, 1080p, 30 fps, high bitrate. Reopen the exported file and verify duration,
  audio, caption safe area, and every redaction before uploading.

## Editorial exclusions

- Do not use generic AI-generated lifestyle imagery or stock-like refund scenes.
- Do not show full-page Review or Technical Trace frames when their text is unreadable at 1080p.
- Do not claim Spanish input in narration unless that exact source and a coherent English
  interpretation are visibly demonstrated in the final take.
- Do not claim bank settlement, arbitrary-company connectivity or notification delivery when the
  captured evidence proves only the controlled merchant confirmation.
- Do not recreate Cloud evidence in graphics. Show the redacted Google Cloud Console directly.
