# Synthetic persona panel — 2026-08-16

This is an AI-assisted product audit, not human-subject research. It does not satisfy T075,
T076, SC-001, or SC-002 and contributes no completion rate, preference rate, quotation, or human
timing.

## Panel

Three independent synthetic auditors received explicit histories and constraints:

1. an older Spanish-speaking Android user with low technical literacy and high fraud concern;
2. a low-vision keyboard/screen-reader user testing zoom, focus, live state, and semantics;
3. a nontechnical consumer skeptical of autonomous action, privacy, and false completion.

Each exercised the deployed contradictory USD 79/USD 59 path and had to separate reproduced
behavior, code inspection, and persona prediction. Findings were accepted for implementation only
when reproduced or confirmed in code.

## Convergent verified findings

- A missing merchant deadline forced the person to invent one and incorrectly attribute it to the
  company.
- The simulator disclosure appeared too late for informed approval.
- The dominant `Proof of Done` / refund language could overpower the bank-settlement limitation.
- Conflict review exposed character offsets rather than the exact competing source phrases.
- Corrections and simulation results changed silently for assistive technology and lost focus.
- Timeline reason codes, hashes, states, and correlation IDs were primary copy rather than optional
  technical evidence.
- Small-screen editors needed vertical reflow and larger touch targets.
- Intake used incomplete tab semantics; automated Axe inspection found no confirmed violations but
  identified ARIA structures requiring manual resolution.

## Implemented response

- `followUpAt` is now a separate plan field. If no unambiguous company deadline exists, the person
  chooses when DueBack follows up; the UI explicitly says this is not a company promise.
- The review card discloses before approval that the action targets DueBack's simulator and no real
  company.
- The completion view says `Evidence accepted`, `Merchant confirmed the refund instruction`, and
  prominently `Bank settlement: NOT VERIFIED`.
- Gemini requests exact excerpts; the server retains an excerpt only when it is a bounded verbatim
  substring of the submitted text. Otherwise the UI tells the person to consult the original.
- Revision and preview state use live status announcements and move focus to the announced result.
- The timeline leads with human summaries and places raw states, reason codes, hashes, and IDs under
  `Technical details`.
- Mobile fact rows and editors stack, long values wrap, and secondary controls reach 44 px height.
- Input-mode controls use pressed-button semantics; decorative/list ARIA was corrected.

## Remaining product hypothesis

Spanish localization is the largest unimplemented persona recommendation. It is a plausible route
to the broader consumer vision and to unassisted testing in Argentina, but this synthetic panel
cannot prove demand or comprehension. The hackathon's required English judge path remains the only
committed UI language until localization is implemented and tested.
