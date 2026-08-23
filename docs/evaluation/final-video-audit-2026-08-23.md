# DueBack final video audit — 2026-08-23

## Scope

Candidate under review:
`docs/submission/evidence/2026-08-22/v12-final/dueback-demo-v12-final.mp4`.

This audit treats completion as unproven. It checks the rendered MP4, not only the timeline plan or
individual source files.

## Mechanical gates

| Gate | Result | Reproducible evidence |
| --- | --- | --- |
| Duration | PASS | `ffprobe`: 210.531 seconds |
| Resolution | PASS | H.264, 1920×1080 |
| Frame rate | PASS | `r_frame_rate` and `avg_frame_rate` are both `30/1`; 6,315 frames |
| Playback audio | PASS | AAC mono, 48 kHz |
| Loudness | PASS | -17.0 LUFS integrated, 2.1 LU LRA, -2.9 dBFS true peak |
| Captions | PASS | 74 burned English cues; high-contrast box; dedicated lower band for dense evidence |
| Duration limit | PASS | 03:30.531 is below four minutes |

## Evidence gates

| Requirement | Result | Evidence in the final master |
| --- | --- | --- |
| Product is visibly demonstrated | PASS | Landing, source, analysis, contract, approval, ACK, result and trace |
| Approval-to-proof is continuous | PASS | One source take from 01:12 through 01:48; editorial speed is constant and contains no cut |
| ACK is not presented as completion | PASS | Insufficient reply at 01:32; accepted proof follows after the bounded retry |
| Google Cloud deployment is visible | PASS | Cloud Run revision/image, Tasks policy, Firestore database/case and deployed-case routes at 02:31–02:56 |
| Gemini contribution is visible | PASS | Product analysis stage and trace expose Gemini latency, tokens and estimated cost |
| Authority boundary is clear | PASS | Exact human approval plus architecture: model proposes, person approves, deterministic policy acts and verifies |
| Limitations are honest | PASS | Controlled merchant sandbox and unverified bank settlement are stated and shown |
| Sensitive data is absent | PASS | Sanitized Cloud source contains no account email, billing data, tokens or unrelated windows |
| Generic AI/stock imagery is absent | PASS | Final uses only the real product, authentic command evidence and implemented architecture |

## Timeline inspection

- `00:00`: immediate product/problem hook; no Spanish opening or decorative intro.
- `00:49–01:18`: approval evidence remains readable above a dedicated caption band.
- `01:12–01:48`: the checkbox stays approved and the causal run never rewinds.
- `01:32`: weak acknowledgement aligns with the narration.
- `01:43–01:48`: accepted proof becomes visible without a cut in the critical run.
- `01:50–02:09`: verified result and bank-settlement limitation remain on screen.
- `02:09–02:31`: redacted trace is visible; missing telemetry is not invented.
- `02:31–02:56`: authentic Run, Tasks, Firestore, Gemini trace and separate-service identity views; the dark terminal is intentional, not
  missing video.
- `02:56–03:20`: architecture is legible, ordered Gemini → person → state → action → verifier and matches the deployed design.
- `03:20–03:30.531`: clean return to the verified result; the closing line receives a three-second hold.

## Independent review

The final candidate received three separately prompted reviews:

- UX: `PASS`; no P0/P1. Approval and durable execution are distinct, and the architecture order is correct.
- Hackathon judge: `PASS`; no P0/P1. Claims match the visible approval, product trace and Cloud evidence. The repaired voice splice is acoustically coherent.
- Visual design: `PASS`; no P0/P1. Review captions remain in their dedicated band, while the architecture title, five cards and completion rule stay visible.

One residual P2 is accepted: at `03:15–03:16`, a caption partially covers only the nonessential
technical footer below the architecture. It does not obscure the title, flow cards or completion rule.

## Reproduction

Run `bash scripts/release/build-final-video.sh`. The script validates all required inputs, creates a
temporary isolated font directory, assembles the shot contract, burns the canonical captions and
exports H.264/AAC at constant 30 fps. Source and output hashes are recorded in
`docs/submission/evidence/2026-08-22/v12-final/MANIFEST.sha256`.

## Current decision

`PASS`. Mechanical, evidence, UX, hackathon-judge and visual-design audits contain no P0 or P1.
The master is approved for upload; public upload and playback verification remain separate actions.
