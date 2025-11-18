# 6-Week Technical Roadmap – Nov 24 – Jan 5, 2026

**Authority:** CTO-level autonomous decision making  
**Scope:** Tokenisation pilot launch, lint cleanup sprints, feature stabilization  
**Outcome:** Production-ready pilot + clean codebase entering 2026  

---

## Week 1: Nov 24-30 – Staging Validation & Pilot Readiness

### Primary Objectives
- ✅ Validate tokenisation pilot end-to-end in staging
- ✅ Finalize finance/legal workshop materials
- ✅ Begin lint cleanup Sprint 1 (high-frequency patterns)

### Key Milestones
| Date | Activity | Owner | Status |
|------|----------|-------|--------|
| Nov 24 | Pre-deployment checklist | Engineering | TO-DO |
| Nov 25-26 | Execute test scenarios 1-5 | QA + Engineering | TO-DO |
| Nov 27 | Scoped lint verification | Lint Owner | TO-DO |
| Nov 28 | Workshop materials finalized | Product + Engineering | TO-DO |
| Nov 29-30 | Continuous monitoring + sign-off | Engineering | TO-DO |

### Deliverables
- [ ] Staging Validation Report (`docs/ops/staging_validation_report.md`)
- [ ] Updated ops_run_report.md with Nov 24-30 results
- [ ] Workshop demo script tested
- [ ] Sprint 1 lint fixes merged (50+ warnings fixed)

### Success Criteria
- ✅ All 5 test scenarios pass
- ✅ Forensic log format validated
- ✅ < 1,700 warnings (down from 1,707)
- ✅ Workshop go/no-go decision ready

---

## Week 2: Dec 1-7 – Finance/Legal Review & Core Rollout

### Primary Objectives
- ✅ Finance/legal workshop (Dec 1, 10:00 AM – 12:00 PM)
- ✅ Go/no-go decision for production pilot rollout
- ✅ Begin Lint Sprint 2 (unused imports)
- ✅ Prepare limited production deployment

### Key Milestones
| Date | Activity | Owner | Status |
|------|----------|-------|--------|
| Dec 1 (10:00-12:00) | Finance/Legal Workshop | Finance + Legal + Engineering | **CRITICAL** |
| Dec 1 (12:30) | Go/no-go decision | CTO + Product | DECISION POINT |
| Dec 2-3 | Production deployment prep (if Go) | DevOps | CONDITIONAL |
| Dec 4-5 | Limited rollout: 1-2 pilot tenants | Operations | CONDITIONAL |
| Dec 6 | Monitor + stabilize | Engineering | ONGOING |
| Dec 7 | Post-weekend assessment | CTO | ASSESSMENT |

### Deliverables
- [ ] Finance/Legal workshop presentation
- [ ] Workshop decision document + escalation items
- [ ] Production deployment runbook (if Go)
- [ ] Monitoring dashboard (trace IDs, error rates, balance consistency)
- [ ] Sprint 2 lint fixes (150 warnings)

### Go/No-Go Decision Criteria
**MUST HAVE (Go):**
- ✅ Staging validation complete + signed off
- ✅ Finance + Legal both approve telemetry schema
- ✅ Zero P0 issues in staging
- ✅ Pilot code paths lint-clean

**SHOULD HAVE (Go with Caution):**
- Telemetry demo runs flawlessly
- Rate limiting verified in production environment

**RISK MITIGATION (No-Go):**
- Escalate blockers immediately
- Reschedule workshop to Dec 8
- Focus on remediation over rollout

---

## Week 3: Dec 8-14 – Pilot Expansion & Lint Sprint 3

### Primary Objectives
- ✅ Expand pilot rollout (5-10 pilot tenants)
- ✅ Complete Lint Sprint 3 (enum constants + type exports)
- ✅ Begin CI/CD pipeline integration

### Key Milestones
| Date | Activity | Owner | Status |
|------|----------|-------|--------|
| Dec 8 | Pilot expansion decision | Product + Finance | TO-DO |
| Dec 9-10 | Onboard 5 new pilot tenants | Operations | TO-DO |
| Dec 11 | Telemetry health check (trace ID volume) | Engineering | TO-DO |
| Dec 12-14 | Sprint 3 enum refactoring | Institutional Mgmt Team | TO-DO |
| Dec 14 | Mid-sprint retrospective | Engineering | MEETING |

### Deliverables
- [ ] Pilot expansion report (tenant onboarding, trace ID volume)
- [ ] Sprint 3 lint fixes merged (200+ warnings)
- [ ] CI/CD Phase 1 tools created (parse-lint, scoped-lints)
- [ ] Lint dashboard prototype

### Success Criteria
- ✅ 5-10 pilot tenants trading tokens successfully
- ✅ Forensic logs growing at expected rate
- ✅ Zero trace ID collisions
- ✅ < 1,500 total warnings (12% reduction)

---

## Week 4: Dec 15-21 – Holiday Week Prep & Advanced Lint Cleanup

### Primary Objectives
- ✅ Complete Lint Sprint 4 (hook dependencies, img elements, requires)
- ✅ Prepare holiday-week skeleton crew
- ✅ Finalize CI/CD integration

### Key Milestones
| Date | Activity | Owner | Status |
|------|----------|-------|--------|
| Dec 15 (EOD) | Sprint 4 complete | All pods | SPRINT END |
| Dec 16-17 | Sprint retrospective + planning | Engineering | RETRO |
| Dec 18 | Holiday readiness checklist | DevOps + Operations | CHECKLIST |
| Dec 19-23 | Monitoring-only skeleton crew | Operations | HOLIDAY |

### Deliverables
- [ ] Sprint 4 lint fixes merged (100 warnings)
- [ ] Total warnings target: < 1,200 (30% reduction from baseline)
- [ ] CI/CD workflow live in GitHub Actions (Phase 2 complete)
- [ ] Holiday readiness: monitoring + escalation procedures documented

### Success Criteria
- ✅ < 1,200 total warnings
- ✅ Pilot running stably through holidays
- ✅ CI/CD automated lint runs executing daily
- ✅ No human intervention required Dec 24-25

---

## Week 5: Dec 24-30 – Holiday Week (Minimal Operations)

### Objectives
- ✅ Passive monitoring only
- ✅ Collect baseline telemetry for post-holiday analysis
- ✅ No deployments or major changes

### Skeleton Crew Responsibilities
- Check forensic logs daily (no errors, trace ID generation normal)
- Monitor rate limiting (no unexpected blocks)
- Escalation: Alert on-call for any P0 issues

### Automated Tasks (No Manual Intervention)
- ✅ Daily lint runs (GitHub Actions)
- ✅ Telemetry validation (GitHub Actions)
- ✅ Ops report auto-updates

### Deliverables
- [ ] Holiday week summary (telemetry volume, error rate, performance)
- [ ] Post-holiday readiness assessment

---

## Week 6: Dec 31-Jan 5 – Post-Holiday Assessment & 2026 Planning

### Primary Objectives
- ✅ Assess pilot stability during holiday period
- ✅ Review telemetry volume + patterns
- ✅ Plan Jan 2026 sprint (target: < 500 warnings)
- ✅ Begin rollout expansion (20+ pilot tenants)

### Key Milestones
| Date | Activity | Owner | Status |
|------|----------|-------|--------|
| Dec 31 | Holiday debrief | Ops Lead | MEETING |
| Jan 1 | Holiday telemetry summary | Engineering | ANALYSIS |
| Jan 2 | Pilot health check | Product + Finance | ASSESSMENT |
| Jan 3 | Jan 2026 sprint planning | Engineering | PLANNING |
| Jan 4-5 | Rollout expansion + team ramp-up | Operations | RAMP-UP |

### Deliverables
- [ ] Post-holiday telemetry report
- [ ] Pilot expansion plan (20+ tenants by Jan 10)
- [ ] Jan 2026 sprint backlog (target: < 500 warnings)
- [ ] 2026 Q1 roadmap alignment

### Success Criteria
- ✅ Pilot ran stably through holidays (zero P0 issues)
- ✅ Telemetry data clean + usable for accounting review
- ✅ Pilot ready for gradual rollout expansion
- ✅ Engineering ready for advanced lint cleanup

---

## Critical Path Summary

```
Nov 24 ──→ Staging Validation ──→ Dec 1 Finance/Legal Review
                                        ↓
                                  Go/No-Go Decision
                                   ↙           ↘
                             (Go)             (No-Go)
                              ↓                 ↓
                    Dec 2 Production Deploy   Remediation
                              ↓
                    Dec 9 Pilot Expansion
                              ↓
                    Dec 15 Sprint 4 Complete
                              ↓
                    Dec 24-30 Holiday Monitoring
                              ↓
                    Jan 5 Post-Holiday Assessment
                              ↓
                    Jan 2026 Rollout Expansion
```

---

## Resource Allocation

### Engineering (50% capacity)
- Week 1-2: Pilot validation + workshop
- Week 2-6: Lint cleanup sprints (Sprint 1-4)
- Week 6+: Advanced refactoring (< 500 warnings target)

### Operations (25% capacity)
- Week 1: Pre-deployment
- Week 2-6: Pilot monitoring + expansion
- Week 6+: Gradual rollout + tenant onboarding

### Finance/Legal (TBD capacity)
- Week 2: Workshop review (Dec 1)
- Week 3-6: Pilot monitoring + accounting integration
- Post-pilot: Full production readiness

### QA (30% capacity)
- Week 1: Staging validation test scenarios
- Week 2-6: Pilot monitoring + incident response
- Week 6+: Production rollout testing

---

## Risk & Mitigation

| Risk | Likelihood | Mitigation |
|------|------------|-----------|
| Finance/Legal requests delay | Low | Have contingency items + clear escalation path |
| Pilot encounters edge case | Medium | Rate limiting + monitoring dashboard + on-call ops |
| Lint cleanup blockers | Medium | Pre-identified patterns + automated tooling |
| Holiday week incidents | Low | Skeleton crew + clear escalation procedures |
| Production deployment issues | Low | Staging validation + limited initial rollout |

---

## Success Metrics (End of 6 Weeks)

### Tokenisation Pilot
- ✅ Pilot running in production with 20+ tenants
- ✅ Zero P0 incidents
- ✅ Forensic logs clean + audit-ready
- ✅ Finance/Legal confident in telemetry

### Code Quality
- ✅ < 500 total lint warnings (71% reduction)
- ✅ Pilot code paths lint-verified
- ✅ CI/CD automated lint running daily
- ✅ Sprint retrospectives documented

### Operations
- ✅ Monitoring dashboard operational
- ✅ Holiday week ran stably (zero human intervention)
- ✅ Jan 2026 sprint planned
- ✅ Rollout expansion roadmap agreed

---

## Next Steps

### Immediate (Nov 18-23)
- [ ] Finalize staging validation plan (DONE)
- [ ] Create lint cleanup sprint plan (DONE)
- [ ] Brief engineering leadership on timeline
- [ ] Prepare workshop materials

### Week 1 Start (Nov 24)
- [ ] Begin staging validation
- [ ] Start Sprint 1 lint cleanup
- [ ] Kick-off CI/CD integration

### Decision Point (Dec 1)
- [ ] Finance/Legal go/no-go decision
- [ ] CTO final approval
- [ ] Proceed with pilot expansion or remediation

---

**Owner:** CTO  
**Last Updated:** November 18, 2025  
**Next Review:** Nov 24, 2025 (Staging validation kickoff)  
**Approval:** [CTO signature]

---

## Appendices

### A. Escalation Matrix
- **Lint blockers:** Escalate to engineering pod lead by start of next sprint
- **Pilot issues:** Page on-call engineer immediately
- **Finance/Legal blockers:** Escalate to CTO + Product lead same-day
- **Holiday week P0:** Page on-call + CTO

### B. Communication Cadence
- **Daily:** Engineering standup (10:00 AM GMT)
- **Weekly:** Sprint retrospective (Friday 4:00 PM GMT)
- **Bi-weekly:** Leadership roadmap sync (Thursday 2:00 PM GMT)
- **Monthly:** Finance/Legal audit review (TBD)

### C. Reference Documents
- Pilot Plan: `docs/ops/tokenisation_pilot_plan.md`
- Staging Tests: `docs/ops/staging_validation_plan_nov24.md`
- Lint Sprints: `docs/ops/lint_cleanup_sprint_plan_dec2025.md`
- CI/CD Guide: `docs/ops/cicd_integration_guide.md`
- Workshop: `docs/ops/dec1_workshop_readiness_checklist.md`
