# DueBack design system

## Direction

`Proof, not promises`: a warm, precise receipt system for unfinished obligations. The recurring
visual motif is a proof trail connecting promise, approved action, and verified evidence.

## Tokens

```css
:root {
  --brand-950: #092a20;
  --brand-800: #0f5138;
  --brand-700: #147a52;
  --brand-100: #ddf3e7;
  --brand-50: #f2faf6;
  --ai-700: #365b8c;
  --ai-50: #eef4fc;
  --warning-700: #8a5a08;
  --warning-50: #fff7df;
  --danger-700: #a33e27;
  --danger-50: #fff0ea;
  --canvas: #f5f1e8;
  --surface: #fffefb;
  --surface-subtle: #f7f8f5;
  --ink-950: #10251d;
  --ink-700: #40544b;
  --ink-500: #687970;
  --border: #d7ded8;
  --border-strong: #b9c6be;
  --font-sans: "Geist Sans", Inter, system-ui, sans-serif;
  --font-mono: "Geist Mono", ui-monospace, monospace;
  --text-xs: .75rem;
  --text-sm: .875rem;
  --text-md: 1rem;
  --text-lg: 1.25rem;
  --title-sm: 1.75rem;
  --title-md: 2.5rem;
  --title-lg: clamp(3rem, 6vw, 4.75rem);
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;
  --radius-control: 10px;
  --radius-card: 16px;
  --radius-feature: 24px;
  --radius-pill: 999px;
  --shadow-card: 0 1px 2px rgb(9 42 32 / 6%), 0 12px 32px rgb(9 42 32 / 8%);
  --shadow-feature: 0 24px 64px rgb(9 42 32 / 14%);
}
```

Use 14px minimum for jury-readable information, 12px only for optional metadata, and 16px for
decisions. Use at most three radii and two elevations. A normal card uses a border or shadow, not
both. Mono is reserved for hashes, reason codes, commands, and traces.

## Semantic colors

- Blue-grey: Gemini interpretation, provenance, or uncertainty; it is not verified truth.
- Green: verified evidence or explicitly allowed authority.
- Amber: waiting, insufficient evidence, or attention required.
- Terracotta: rejected evidence, contradiction, or destructive action.
- Warm canvas and white surfaces are structural, not state indicators.

## Component map

Primitives: `DueBackLogo`, `Icon`, `Button`, `Badge`, `Field`, `FileDropzone`, `Card`, `Disclosure`,
`InlineAlert`, `Skeleton`, `Divider`, `Tooltip`.

Product patterns: `PageHeader`, `JourneyStepper`, `ProofTrail`, `OutcomeContract`, `ExtractedFact`,
`EvidenceCitation`, `UncertaintyAlert`, `ChannelSelector`, `MessagePreview`, `PermissionBoundary`,
`ApprovalPanel`, `ResultVerdict`, `PromiseEvidenceComparison`, `ConversationEvent`,
`TechnicalTrace`, `CaseControlPanel`.

## Screen composition

- Intake: compact page header, promise composer, examples, one trust line. Privacy and limits are a disclosure.
- Analyzing: centered analysis hero, four real stages, what Gemini is extracting, background-safety and retention line.
- Review: one global stepper, outcome contract plus approval panel in a 7/5 grid, CTA above the fold. Editing and technical detail are disclosures unless blocked.
- Result: verdict first, accepted/rejected evidence and limitation, proof trail, then conversation, controls, and technical evidence.
- Technical evidence: enlarge only the correlation ID and decisive events. Keep the full trace inspectable but secondary.

## Motion

Use 120–160ms for interaction feedback and 180–240ms for disclosure/state changes. A proof trail may
activate each node once as real state changes. Never animate decorative cards or use parallax. Every
motion rule needs a `prefers-reduced-motion` equivalent.
