# DueBack Consent-Safe User Study Protocol

Version 1.0 · 2026-08-16. Target: eight adults. Problem interviews and usability sessions are
separate datasets even if the same participant completes both.

## Consent and privacy

Read: “This is an unpaid hackathon product study lasting about 10 minutes. Participation is
voluntary; you may stop at any time. We record an anonymous participant ID, timing, task outcomes,
errors, help requested, and short answers. Do not provide real receipts, account numbers, company
cases, names, email addresses, or other personal data.” Record consent as yes/no. Do not record a
session when consent is no.

Use IDs P01–P08. Use only the supplied synthetic Northstar fixture. Do not store audio/video, IP,
contact information, or demographic data in the repository.

## Study A — problem and choice (5–8 minutes)

1. “Without naming the company, tell me about the last promise from a business that you had to
   chase.” Record whether it involved more than one step, delay, abandonment, and what evidence the
   participant considered resolution.
2. Show two neutral cards: `(A) reminder + draft` and `(B) DueBack follows through under explicit
limits and returns only for a decision or proof`.
3. Ask which they choose and why. Never ask “Would you use AI?” and do not pitch before the choice.

Record `multi_step`, `delay_or_abandonment`, `evidence_description`, `choice`, and near-verbatim
reason. These are qualitative observations, not market-size claims.

## Study B — unassisted usability

Give the participant the same synthetic promise and say only: “Use this page to delegate the
follow-up safely. Tell me when you believe it is active.” Start the timer. No coaching.

Observe whether the participant can:

1. paste/upload the promise;
2. find and correct one intentionally uncertain field;
3. explain what DueBack may do, will never do, shares, and accepts as completion;
4. activate the plan;
5. distinguish `request received` from `refund issued`;
6. locate stop/delete and `This isn't resolved`.

Record total seconds, completion, each error, help requested, explanation almost verbatim, and which
evidence state they identify as resolved.

## Predeclared thresholds

- ≥6/8 complete intake and approval without help.
- ≥6/8 complete in under three minutes.
- ≥6/8 correctly explain allowed action, prohibited action, shared data, and required evidence.
- ≥7/8 do not confuse acknowledgement with resolution.
- ≥5/8 choose limited delegation over reminder/draft.

Report every denominator and failure. If a threshold fails, say so and list the UX change; do not
discard or replace participants.

## Recording and report generation

Enter one row per participant in `user-study-results.csv`. Quote any CSV field that contains a comma
and double any literal quote inside a quoted field. Use only `yes` or `no` for boolean columns and
only `reminder` or `dueback` for `choice`. Do not leave timing, evidence description, or choice
reason blank.

After all eight sessions, run:

```bash
pnpm research:report
```

The command refuses fewer or more than eight rows, duplicate/missing P01–P08 IDs, missing consent,
invalid booleans, choices, or timing. Only after validation does it replace
`user-study-report.md` with the observed denominators, threshold results, and all participant-level
failures.
