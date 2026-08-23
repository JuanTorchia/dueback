# Final video preflight — 2026-08-23

## Decision

`PASS`. Product revision v12, authentic capture sources, narration, captions and the reproducible
1080p master passed mechanical, evidence and three independent reviewer gates. Upload remains
intentionally separate from this decision.

## Final master

- File: `docs/submission/evidence/2026-08-22/v12-final/dueback-demo-v12-final.mp4`.
- Duration: 210.531 seconds (`03:30.531`), inside the target `03:25–03:45` range and below the
  four-minute submission limit.
- Video: H.264, 1920×1080, constant 30 fps, 6,315 frames, `yuv420p`.
- Audio: AAC mono, 48 kHz, measured at -17.0 LUFS integrated and -2.9 dBFS true peak.
- Captions: 74 English cues burned from the final audio transcript, Segoe UI Semibold and opaque
  high-contrast treatment. Dense Review and Architecture shots reserve a lower caption band.
- SHA-256: `1eb23b84acf88a75af5e3f871c8c82c09a91824a568249969e9b5c224fa705a6`.

## Product and evidence

- Public revision: `dueback-web-00070-wkz`, 100% traffic and Firebase Hosting repinned.
- Public mobile journey: 1/1 passed in 41.6 seconds with no retries.
- Final capture case: `case_c7d8d53a-3e13-4d6c-b27c-5f036a5021c7`, Firestore state `DONE`,
  version 4.
- Product master: real Windows desktop capture at 1920×1080 and nominal 30 fps; the sequence from
  approval through insufficient acknowledgement and accepted evidence remains one uninterrupted
  take in the final edit.
- Google Cloud source: sanitized 25-second capture of real `gcloud` output for the live Cloud Run
  revision, Cloud Tasks retry policy, Firestore database, product Gemini trace and both Cloud Run
  services with distinct service accounts. No other windows, account email, billing data or
  credentials remain in the source.
- The redacted product trace visibly joins Gemini/Genkit, Firestore, Cloud Task, action,
  insufficient acknowledgement, accepted evidence and notification stages.
- Architecture frame is 1920×1080 and describes implemented services and authority boundaries.

## Narration and captions

- Canonical narration: 462 words, English-only.
- Final WAV: 207.737 seconds, 48 kHz mono PCM 24-bit; the visual result holds through 210.531.
- The only silence longer than one second is the intentional 1.03-second pause around
  “Acknowledgement is not proof.”
- Captions were transcribed from the processed WAV and manually corrected for `DueBack`,
  `Firestore`, `idempotent` and `follow-up`.
- No music, decorative transition, generic AI imagery or stock footage is present.

## Editorial sequence

1. `00:00–00:12`: problem and concrete refund case.
2. `00:12–00:40`: asynchronous Gemini analysis and data boundaries.
3. `00:40–01:12`: Outcome Contract and Approval Boundary.
4. `01:12–01:48`: uninterrupted activation, insufficient ACK and accepted proof.
5. `01:48–02:09`: verified result and bank-settlement limitation.
6. `02:09–02:31`: correlated product trace.
7. `02:31–02:56`: authentic Google Cloud evidence.
8. `02:56–03:20`: implemented architecture.
9. `03:20–03:30.531`: return to the verified product result and sustained closing line.

## Independent release gate

Independent UX, hackathon-judge and visual-design reviews all returned `PASS` with no P0/P1. One
accepted P2 is documented in the final audit. Publication still requires the upload action and
public playback verification.
