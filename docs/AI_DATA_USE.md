# AI Data Use Policy (Proof-by-Repo)

This document exists to make our AI privacy claims **verifiable by in-repo artifacts** (code + CI checks), not by marketing language.

## What we mean by “student queries aren't training future AI models”

- **We do not implement any training or fine-tuning pipeline that uses end-user prompts or chat transcripts.**
- End-user queries are used for **inference only** (generate the response) and (optionally) for **safety/audit logging**.
- Any safety/audit logging is intended for accountability and incident response **not model training**.

In code, this is expressed as an explicit, reviewed policy constant:

- `src/lib/ai/data-use-policy.ts` → `AI_DATA_USE_POLICY.trainOnStudentQueries === false`

## Governance control

AI behaviour is tenant-governed. The governance schema includes an explicit opt-in flag:

- `src/lib/governance/policy-engine.ts` → `ai.allowTraining` (defaults to `false`)

**Default posture is no-training.** If this ever changes, it must be an explicit governance decision and must update the script/code audit outputs.

## CI enforcement

We validate that our default posture is **non-training** as part of deterministic tooling:

- `tools/test-ai-governance.ts` asserts `allowTraining === false` by default.

(Additional static checks may be added over time, e.g. guarding against accidental usage of fine-tuning endpoints.)

## Notes & scope

- This policy is about **our product behaviour** and what we do with user-provided text.
- This document does not attempt to restate third-party provider terms; provider selection/configuration is handled separately.
