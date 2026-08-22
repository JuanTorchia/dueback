# Final demo production plan

Target: one continuous product run plus direct, redacted Google Cloud evidence. Final duration
`02:45–03:15`, 16:9 at 1080p, English narration, English captions, no music.

## Gemini TTS direction

Use Gemini 2.5 Pro TTS or Gemini 3.1 Flash TTS Preview with a single neutral US-English voice.

```text
Audio profile: a warm, trustworthy technical founder in their thirties. Neutral American English.
Clear and conversational, never theatrical or salesy.

Scene: a concise live software demonstration for expert hackathon judges. The speaker understands
the system deeply and is calmly showing evidence, not reading marketing copy.

Director's notes: Speak at roughly 145 words per minute. Use restrained confidence. Keep product
and service names crisp. Pronounce DueBack as “Due Back”, Gemini as “Gem-in-eye”, and Genkit as
“Gen-kit”. Pause briefly before “Acknowledgement is not proof” and before “A deterministic
verifier—not the model”. Do not add, omit, paraphrase, or repeat words. No music or sound effects.
```

## Narration

> A company can mark a request received while the customer still carries all the follow-up.
> DueBack keeps the promise open until evidence matches the outcome the person approved.
>
> I will use a synthetic refund promise in Spanish. Gemini reads the source asynchronously and
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

| Time | Visual | Non-negotiable evidence |
|---|---|---|
| 00:00–00:10 | Landing and concrete refund card | Problem and one-line value |
| 00:10–00:32 | Preset, Spanish source, asynchronous analysis | Source, Gemini stage, saved/background state |
| 00:32–00:58 | Review and approval | Provenance, uncertainty, recipient, shared data, limits, sandbox disclosure |
| 00:58–01:25 | Activate, leave/reload, return | Browser independence and durable return |
| 01:25–01:48 | Weak ACK then accepted proof | `Waiting for sufficient proof`, next attempt, exact matching evidence |
| 01:48–02:08 | Result and technical trace | Limitation, correlation ID, Genkit/Gemini, Task, action, callback, verifier |
| 02:08–02:42 | Google Cloud Console | Cloud Run revision, Tasks queue/retry, Firestore state, Vertex/Gemini evidence |
| 02:42–02:58 | Architecture zoom | Model without authority; policy/action/verifier boundaries |
| 02:58–03:08 | End card | Taskmaster · Individual/Hobbyist · controlled sandbox, not bank settlement |

## CapCut contract

- Canvas: 1920×1080, 30 fps. Place the continuous product capture without cutting inside the live
  approval-to-result sequence.
- Narration: normalize peaks near `-3 dB`; target integrated loudness around `-16 LUFS`.
- Captions: maximum two lines and roughly 42 characters per line. Keep them inside the lower safe
  area, but move them above any evidence they would cover.
- Use only simple cuts between the continuous product run, Cloud Console evidence, architecture,
  and end card. No transitions, zoom animations, background music, or decorative effects.
- Redact account email, project billing information, tokens, secrets, raw user data, and unrelated
  projects. Keep service name, revision, queue policy, database mode, model ID, case ID, and
  correlation ID visible.
- Export H.264 MP4, 1080p, 30 fps, high bitrate. Reopen the exported file and verify duration,
  audio, caption safe area, and every redaction before uploading.
