# DueBack final demo narration

Status: final approved master. English source, English narration, English captions.

## Script

A company can say “request received” while the customer still carries every follow-up. DueBack
keeps that promise open until the evidence matches the outcome the person actually approved.

Here is a synthetic refund case. The store promised fifty-nine dollars for order eighteen forty-two,
but the refund has not arrived. Gemini reads this source asynchronously and proposes a typed Outcome
Contract: responsible party, amount, reference, deadline, citations, and uncertainty. The source is
retained for no more than twenty-four hours. Gemini has no contact tools, cannot approve an action,
and cannot decide that the case is done.

Now I review what it understood. The contract requires signed company evidence for this exact
outcome and reference. Before anything leaves DueBack, the Approval Boundary shows the exact
recipient, channel, proof requirement, attempt limit, and authorized path. This accelerated route contacts
only DueBack’s isolated merchant simulator. It cannot spend money, change the requested outcome, add
new data, or contact an arbitrary company. I authorize only this versioned plan.

From this point, the run is continuous. The browser is not executing the workflow. Firestore stores
the approved state, and Cloud Tasks resumes the case in the background with authenticated,
idempotent delivery.

The first signed company reply includes the right reference and amount, but says only that the
request was received.

Acknowledgement is not proof.

The deterministic verifier rejects it, so DueBack keeps the case open and performs the next bounded
attempt. The controlled merchant then returns signed evidence confirming the exact outcome, amount,
currency, and reference.

A deterministic verifier—not the model—accepts that evidence. The result says precisely what was
proved: the company confirmed the refund instruction. It also preserves the important limitation:
bank settlement is not verified, so the person must still check the underlying payment account.

The product trace shows the same redacted trace suffix across approval, Firestore transitions, the
Cloud Task, rejected acknowledgement, and accepted proof. It also records the real Gemini latency,
token usage, and estimated model cost. Missing telemetry would remain labeled missing; DueBack does
not manufacture evidence.

Here is the deployed backend on Google Cloud. Cloud Run serves the current product revision. Cloud
Tasks provides bounded delivery and retry. Firestore persists the versioned case. The product trace
records the Gemini invocation. The merchant simulator is a separate Cloud Run service with its own
service account, distinct from the DueBack runtime.

The architecture keeps authority and proof outside the model. Gemini and Genkit propose typed facts.
The person approves an exact boundary. Firestore and Cloud Tasks persist and resume the work. The
Action Broker releases only approved fields. Signed evidence returns through a deterministic
verifier, and only sufficient evidence can close the case.

DueBack is a Taskmaster entry built by one individual for the All Things Agentic Hackathon. Delegate
the chase. Keep the proof.

## Delivery notes

- Read at 132–138 words per minute with restrained, conversational confidence.
- Pause for approximately 700 ms before and after “Acknowledgement is not proof.”
- Pause before “A deterministic verifier—not the model—accepts that evidence.”
- Pronounce DueBack as “Due Back”, Gemini as “Gem-in-eye”, and Genkit as “Gen-kit”.
- Do not add, remove, repeat or paraphrase words.
