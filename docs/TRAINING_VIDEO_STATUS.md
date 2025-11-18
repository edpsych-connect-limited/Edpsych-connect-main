# Training Video Status

## Overview
- Scope: 18 scripted tutorials described in `docs/VIDEO_TUTORIAL_SCRIPTS.md` (∼160 minutes total). Each video must be recorded, uploaded to the CDN, receive coach marks, and have an accessibility-ready thumbnail.
- Today’s focus is on the refreshed scripts that support EHCP/EHCNA automation, onboarding, and the new tokenisation spine.
- The landing page and help center will mirror this refreshed library once all recordings + QA pass are in place; see `docs/PHASE-2-BLOCK-4-LANDING-PAGE-MESSAGING.md` for messaging guidance.

## Current progress
| Video batch | Status | Notes |
|-------------|--------|-------|
| Scripts 1-6 (introduction + EHCP workflows) | Drafted | Coach marks being reviewed by CX; need final recordings scheduled for Nov 19-20. |
| Scripts 7-12 (AI tutoring + intervention prompts) | In progress | Research ops team updating references; thumbnails pending once recordings upload to the CDN. |
| Scripts 13-18 (training & tours + support) | Planned | Final script revisions due Nov 21; align with landing updates before Dec 1. |

## Next QA cadence
1. **Recording:** Secure `Synthesia` session times for each pending batch, flagging EHCP-specific scenes (exports, audit logs, notifications) for compliance sign-off.
2. **Upload + coach marks:** Push MP4s to the CDN (per `VIDEO_CREATION_AND_INTEGRATION_GUIDE.md`), embed them into `/training`, and add meeting notes to `docs/ops/training_content_validation.md` (create if missing) once each video is live.
3. **Analytics + doc sync:** Update this status doc and the landing page messaging doc (`PHASE-2-BLOCK-4-LANDING-PAGE-MESSAGING.md`) after each release, ensuring the `training` route and help center reflect the new descriptions.
4. **Ops reporting:** Append each video release to `docs/ops/ops_run_report.md` under a new `training-video` entry (list CDN URLs, QA thumbs, accessibility checks, and telemetry). Document any blocking issues in `docs/ops/ops_run_report.md` as well.

## Risks & mitigations
- **Training video backlog delays**: Use the recorded EA (Executive Assistant) to batch process three scripts per day. If QA is blocked, note the dependency in `LI`s (ticket tracker) and adjust landing page timelines.
- **Landing page misalignment**: Reserve a design review slot on Nov 26 to sync marketing copy with the new training narratives and EHCP promises.
