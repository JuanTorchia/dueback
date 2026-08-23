# Final demo production plan

Target achieved: one continuous critical product run plus direct, redacted Google Cloud evidence.
Final duration `03:30.531`, 16:9 at 1080p, English narration, English captions, no music. The
product journey from approval through acknowledgement rejection and accepted proof remains
continuous.

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
> Before anything leaves DueBack, the Approval Boundary shows the exact recipient, channel, proof
> requirement, attempt limit, and authorized path. This accelerated route contacts only DueBack's
> isolated merchant simulator. It cannot spend money, change the requested outcome, add new data,
> or contact an arbitrary company. I authorize only this versioned plan.
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
| 00:00–00:12 | Landing and concrete refund card         | Problem, affected person and one-line value                                                 |
| 00:12–00:40 | English preset and asynchronous analysis | Source, Gemini stage, saved/background state                                                |
| 00:40–01:12 | Contract and Approval Boundary           | Facts, recipient, channel, proof requirement, attempts and authorized path                  |
| 01:12–01:48 | Continuous activation-to-result run      | Weak ACK, bounded retry and accepted proof; one uninterrupted product take                  |
| 01:48–02:09 | Verdict and proof comparison             | Merchant-confirmed limitation, `ACK ≠ PROOF`, promised vs observed                          |
| 02:09–02:31 | Technical trace close-up                 | Visible Genkit/Gemini, Firestore, Task, action and verifier stages                          |
| 02:31–02:56 | Sanitized `gcloud` evidence              | Active Run revision, Tasks retry, Firestore, Gemini trace and separate service identities   |
| 02:56–03:20 | Architecture                             | Model without authority; policy, action, state and verifier boundaries                      |
| 03:20–03:30 | Return to verified product result        | Limitation remains visible; “Keep the proof” holds for three seconds                        |

## CapCut contract

- Canvas: 1920×1080, 30 fps. Record the browser itself at 1920×1080 or crop from a larger
  lossless capture. Place the continuous product capture without cutting inside the live
  approval-to-result sequence. Still screenshots are planning evidence, not a substitute for the
  live run.
- Narration: normalize peaks near `-3 dB`; target integrated loudness around `-16 LUFS`.
- Captions: Segoe UI Semibold, maximum two lines and 74 semantic cues. Reserve a dark lower band in
  dense Review and Architecture shots; use top placement only where the technical trace needs its
  lower rows. Do not use word-by-word karaoke animation.
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
- Do not recreate Cloud evidence in graphics. Show sanitized output from authenticated `gcloud`
  commands or the redacted Google Cloud Console directly.
