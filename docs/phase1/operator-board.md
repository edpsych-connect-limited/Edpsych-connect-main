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
  - objective: determine when the temporary Vercel validation build gate can be removed safely
- Memory / operating infrastructure
  - objective: keep project state explicit in repo docs and assistant memory so execution does not rely on reconstructing chat context

## 3. NEXT
1. Confirm latest READY preview still preserves the proven corridor after each new hardening commit
2. Keep tightening only runtime-proven brittleness in Phase 1 surfaces
3. Decide whether repo-wide non-corridor type/build failures must be fixed now or can remain deferred while Phase 1 stabilizes
4. Remove temporary Vercel validation build relaxation when normal branch deployment is no longer blocked by unrelated code
5. Produce a Phase 1 release-readiness checklist

## 4. BLOCKERS
- No active corridor blocker at the moment
- Active deployment normalization issue:
  - temporary Vercel validation build gate is still required
  - classification: config / deployment-process issue
  - source: unrelated repo-wide non-corridor type/build failures still block normal branch deployment

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
