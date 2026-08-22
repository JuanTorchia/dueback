# Judge-cold product audit — 2026-08-21

## Scope

The public Firebase Hosting release was traversed at a 390×844 viewport from landing through a
fresh accelerated refund case. The audit evaluated consumer comprehension and trust, not backend
correctness. Synthetic case `case_8b94da38-3799-43fe-86e3-96fbf28a9c04` was created only through
the public controlled demo path; no real company or recipient was contacted.

## What already reads as a product

- The landing leads with the consumer problem and a concrete case rather than architecture.
- Intake explains the outcome, boundaries and proof decision before mentioning the Google stack.
- Durable analysis explicitly permits leaving the page and exposes real saved stages.
- The result visibly rejects acknowledgement-only evidence before accepting stronger evidence.

## Reproducible findings

1. **Internal money units leaked into the conversation.** The proof comparison displayed
   `USD 59.00`, while inbound conversation cards displayed `Amount 5900`. The consumer projection
   now formats minor units as money and has regression coverage.
2. **An optional email looked like a product failure.** An anonymous controlled-demo completion
   displayed `Email delivery is unavailable` and offered a retry even though no email return was
   requested. An `IN_APP` notification now presents the successful durable case-page return and
   cannot expose an email retry.
3. **The sandbox disclosure dominated the result.** Required honesty remains, but the disclosure
   now uses normal sentence casing and concise product language instead of an all-caps technical
   banner.
4. **Approval is cognitively long on mobile.** The primary activation action appears after channel,
   full message, five permission rows, disclosure, return email, authorization and identity. This
   is a product-comprehension risk, not yet changed: the human study should determine which details
   can move under progressive disclosure without weakening informed approval.

## Verification

- Web tests: 23 files, 71 tests passed.
- Web typecheck and lint passed.
- The changes are local until a separately verified deployment is made.

## Next evidence gate

Run the predeclared eight-person unassisted protocol. Prioritize the approval-length issue only if
participants fail to understand or activate without help; do not substitute synthetic personas for
that evidence.

## Follow-up comprehension changes

- Intake now states beside the action that Gemini processes only submitted material and has no
  contact or completion authority.
- The analysis screen derives and shows the exact raw-source retention end from the persisted
  creation time, while warning that deletion processing is asynchronous.
- Shared data and its recipient are expanded by default during approval.
- Consumer channel labels no longer lead with `adapter` or `callback` terminology.
- The video shot list now reaches the complete consumer outcome 90 seconds after intake begins and reserves
  architecture for explaining the already-observed journey.
- Stop/Delete/Resume behavior has 13 passing integration assertions. Human discoverability remains
  open and must not be marked complete from automation alone.

## Multi-agent remediation implemented locally

The three-persona review was converted into product changes without treating synthetic feedback as
human evidence:

- The approval screen now leads with one plain-language decision summary. The complete five-part
  authorization remains available under progressive disclosure.
- The recipient and exact shared fields remain visible before activation.
- Intake and privacy copy identify Gemini as the processor, state what it reads, and state that it
  has no contact, approval, or completion authority.
- Privacy copy now distinguishes raw-source deletion (after extraction, with a 24-hour maximum),
  structured-case expiry (seven days), database TTL scheduling (no later than 30 days afterward),
  and user-requested deletion.
- Stop/Delete copy explains future-action behavior and the irreversibility of actions already sent.
  Delete requires confirmation and returns an observable deletion receipt; the intake redirect
  confirms that no further action will be taken.

English-only presentation remains an accepted hackathon-delivery risk for this release. A Spanish
locale should be evaluated as a separate product change rather than introduced into the final
English judging flow without human comprehension evidence.

### Local verification

- Package tests: 217 passed.
- Repository integration/contract/adversarial tests: 74 passed.
- Typecheck: passed in all 10 participating workspace projects.
- Lint: passed in all 10 participating workspace projects.
- Production build: passed; all 16 static pages generated.
- `prettier --check .`: remains a repository-wide baseline failure across 181 existing files; no
  formatting-only rewrite was applied because it would mix unrelated changes into this remediation.

These changes are not deployment evidence. The public release must be deployed and its mobile
Stop/Delete controls visually rechecked before the discoverability finding can be closed.
