# EdPsych Connect — Operator Board

## 1. DONE
- Phase 1 control-plane unification completed:
  - canonical auth/session shape
  - canonical role normalization
  - consolidated onboarding route
  - server-authoritative client auth hydration
- Assessment corridor unification completed:
  - canonical assessment shell path
  - canonical assessment instance/conduct path
  - assessment framework resolution hardened server-side
- Report path hardened:
  - permission-gated
  - tenant-scoped
  - provenance required: `case_id`, `assessment_id`, `instance_id`
- Onboarding status coherence fixed for completed users
- Runtime validation proven on deployed preview for:
  - EP
  - SENCO
  - SCHOOL_ADMIN
- Runtime-proven Phase 1 corridor:
  1. login / session truth
  2. dashboard auth state
  3. onboarding status / progression
  4. student creation
  5. case creation
  6. assessment shell creation
  7. assessment instance creation
  8. assessment instance update
  9. report draft / create
  10. report generate / export

## 2. IN PROGRESS
- Phase 1 controlled stabilization
  - objective: keep the proven corridor coherent, repeatable, and deployment-safe
- Deployment normalization
  - objective: restore standard Vercel build gate (was temporarily relaxed to `build:vercel:phase1` = plain `npm run build`)
  - **status 2026-03-23 (complete):** all verify:ci checks now pass locally: type-check ✅, lint ✅, ai-governance ✅, ai-nontraining ✅, security-by-design ✅, intervention-validation-scale ✅, video-registry ✅, video-claims ✅, video-script-coverage ✅, video-script-provenance ✅, security:scan ✅. smoke:ci fails only due to local Node 22 vs required Node 20 — Vercel uses Node 20 per engines field. **Build gate restored to `build:vercel` (full verify:ci + build) in vercel.json.**
- Memory / operating infrastructure
  - objective: keep project state explicit in repo docs and assistant memory so execution does not rely on reconstructing chat context

## 3. NEXT
1. ~~Push committed changes to GitHub~~ — **done 2026-03-23 17:02 UTC**, commit `3f58ec2b` pushed via PAT
2. Confirm Vercel picks up the restored build gate and build passes in production/preview
3. Confirm latest READY preview still preserves the proven corridor after build gate change
4. ~~Produce a Phase 1 release-readiness checklist~~ — **done 2026-03-23 17:22 UTC**, see `docs/phase1/release-readiness-checklist.md`
5. Keep tightening only runtime-proven brittleness in Phase 1 surfaces

## 4. BLOCKERS
- No active corridor blocker
- No deployment normalization blocker: build gate restored to full `build:vercel` (verify:ci + build)
- Vercel deploy is triggered automatically on push to `phase1-auth-unification`; push credentials must be present on the execution host for the cron loop to trigger deploys directly

## 5. DEFERRED
### Phase 2
- differentiated curriculum
- gamification / engagement systems
- structured interventions as first-class layer

### Phase 3
- marketplace
- research platform surfaces
- broader AI extras
- non-core ecosystem expansion

### Non-corridor cleanup (deferred unless it blocks deployment normalization directly)
- multi-agency / research / orchestration type-check cleanup
- broader repo-wide CI restoration beyond what is needed for truthful Phase 1 deployment
