---
name: dueback-product-design
description: Design, review, or record DueBack product interfaces using its visual identity, proof-first information architecture, multilingual rules, and hackathon jury demo constraints. Use for UI/UX changes, product screenshots, demo recordings, or visual audits in this repository.
---

# DueBack Product Design

Make the causal story understandable before exposing implementation detail:

`promise → approved authority → bounded action → evidence check → verified outcome`

## Non-negotiable product truths

- Gemini interprets multilingual, messy source material into cited typed facts with uncertainty. It never contacts a counterparty, approves a plan, or closes a case.
- The person controls recipient, message, shared data, attempt budget, and required proof before activation.
- An acknowledgement is not proof. Show `ACK ≠ PROOF` explicitly whenever the weak reply appears.
- `Merchant confirmed` is not bank settlement. Keep that limitation adjacent to the accepted outcome.
- The controlled sandbox is visible before approval. Do not visually imply a real merchant integration.
- Technical evidence must come from actual saved state, traces, or captured read-only cloud output.

## Information architecture

Each task screen should answer, above the fold and in this order:

1. Where am I?
2. What did DueBack understand or do?
3. What decision or action is required from me?
4. What counts as completion?
5. Where can I inspect the evidence or technical detail?

Use progressive disclosure for hashes, adapters, callbacks, raw traces, and detailed contracts. Do not hide recipient, shared data, authority limits, proof requirements, retry state, or outcome limitations.

## Visual identity

- Preserve the warm paper, dark ink, evidence green, caution amber, and rejection terracotta palette defined as CSS tokens in `apps/web/app/globals.css`.
- Use green for verified/allowed states, amber for waiting or attention, and terracotta for rejected evidence. Never use green merely as decoration around an unresolved state.
- Favor editorial hierarchy: one dominant outcome, one supporting explanation, then structured evidence. Avoid several equally weighted cards.
- Reuse `.card`, `.eyebrow`, `.facts`, `.review-story`, and `.case-story` patterns before inventing variants.
- Icons must carry a label or accessible name; emoji are not the primary visual language.
- Keep key product claims readable at 1080p without pausing and at a 390px viewport without horizontal scrolling.

For exact tokens, component responsibilities, and screen composition, read
[references/design-system.md](references/design-system.md) before a visual refactor or new component.

## Language and demo recording

- The product remains complete in English, Spanish, and Portuguese.
- A judging video uses English UI and English captions. A Spanish or Portuguese promise may appear only as the source example, followed immediately by an English interpretation.
- Never mix interface locales in one recorded journey.
- Generated imagery or video may establish the human scenario, but it is not product evidence. Keep it brief, text-free, and separate from the real UI.

## Review gate

Before shipping or recording:

- inspect intake, analyzing, review, waiting/ACK rejected, accepted result, trace, and case controls at desktop and 390px;
- confirm focus visibility, semantic headings, live-region behavior, contrast, and reduced-motion handling;
- run lint, typecheck, relevant tests, and the deployed journey when a deployment is authorized;
- obtain independent UX, visual-design, and hackathon-jury reviews for a final video or major redesign;
- classify feedback as blocker, competitive risk, or optional polish. Do not churn a passing flow for taste alone.
