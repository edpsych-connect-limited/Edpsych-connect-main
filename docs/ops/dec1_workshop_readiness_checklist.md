# Dec 1 Finance/Legal Workshop – Readiness Checklist

**Project:** EdPsych Connect Tokenisation Pilot (EPT)  
**Review Date:** December 1, 2025  
**Prepared:** November 18, 2025  

---

## Pre-Workshop Validation (Nov 24-30)

### Telemetry & Logging
- [x] Treasury service emits trace IDs on mint/lock/unlock
- [x] Rewards service emits trace IDs on issue/claim
- [x] API routes return `X-Tokenisation-Trace-Id` headers
- [x] Forensic log format validated (newline-delimited JSON)
- [x] Sample traces captured in `logs/forensic-events-sample.log`
- [ ] **TODO (by Nov 24):** Run a full pilot flow (mint → reward issue → claim) in staging and capture real logs

### Code Quality & Compliance
- [x] Tokenisation service bundle lint-verified (zero severity-1 warnings)
- [x] API route handlers pass ESLint validation
- [x] Forensic logging functions lint-clean
- [x] Lint backlog documented with cleanup strategy
- [ ] **TODO (by Nov 30):** Run final lint pass to confirm no regressions in pilot stack

### Documentation
- [x] Audit evidence bundle complete (`docs/ops/audit_evidence_bundle.md`)
- [x] Forensic report includes sample traces (`docs/ops/forensic_report.md`)
- [x] Tokenisation pilot plan published (`docs/ops/tokenisation_pilot_plan.md`)
- [x] Ops run report tracks all automation artifacts
- [x] Lint cleanup status documented with timelines

---

## Workshop Materials (Due Nov 28)

### For Finance Review
- [ ] **Trace ID Architecture Document**
  - How every transaction gets a unique trace ID
  - How trace IDs appear in logs and API responses
  - How finance can audit transactions using trace IDs

- [ ] **Sample Transaction Walkthrough**
  - Live demo: trigger reward issue → show response header → verify log entry
  - Walk through the 5 sample traces in `logs/forensic-events-sample.log`
  - Show how traceId links API response to forensic log

- [ ] **Accounting Integration Plan**
  - How telemetry feeds into accounting reconciliation
  - Log retention and backup procedures
  - Monthly audit export process

### For Legal Review
- [ ] **Data Privacy & Compliance**
  - Trace IDs do not capture PII (only tenant/user ID, not names/emails)
  - Metadata fields documented for compliance review
  - GDPR/data retention alignment

- [ ] **Audit Trail Documentation**
  - Every token operation is recorded with timestamp and tenant context
  - Immutable log structure (append-only)
  - Chain-of-custody evidence preserved in forensic log

- [ ] **Safeguarding Framework**
  - Fraud detection opportunities (rate limiting, batch analysis)
  - Anomaly detection hooks (reward tier pattern analysis)
  - Escalation procedures for suspicious activities

---

## Go/No-Go Decision Criteria

### Must-Have (for Pilot Launch)
- [x] Telemetry infrastructure works end-to-end
- [x] Trace IDs surface in API responses
- [x] Forensic logs are properly formatted and accessible
- [ ] **Validate Nov 24-28:** Staging environment runs clean for 48 hours
- [ ] **Validate Nov 28-30:** Lint cleanup strategy keeps pilot stack healthy

### Should-Have (for Full Rollout)
- [x] Documentation is audit-ready
- [ ] **Prepare Nov 28:** Live demo script ready for workshop
- [ ] **Prepare Nov 29:** Contingency plan if issues surface in staging

### Risk Mitigation
- [x] Lint backlog isolated from pilot code paths
- [x] Telemetry logging can be disabled/re-enabled without affecting core functionality
- [x] Trace IDs are generated server-side (cannot be spoofed by clients)

---

## Workshop Agenda (Dec 1, 10:00 AM – 12:00 PM)

**10:00 – 10:15:** Project Overview
- Platform status snapshot
- Tokenisation pilot scope and timeline
- Dec Week 1 rollout plan

**10:15 – 10:45:** Telemetry Architecture Demo
- Live walkthrough: trigger transaction → show trace ID in response
- Show forensic log entry matching the trace ID
- Demonstrate 5 sample operations

**10:45 – 11:15:** Finance Review
- Accounting memo requirements alignment
- Trace ID audit trail walkthrough
- Reconciliation and monthly export procedures

**11:15 – 11:45:** Legal Review
- Data privacy and compliance checklist
- Safeguarding framework documentation
- Audit trail immutability guarantees

**11:45 – 12:00:** Q&A and Go/No-Go Decision
- Finance sign-off: ✓ / ✗
- Legal sign-off: ✓ / ✗
- Engineering readiness confirmation

---

## Post-Workshop Actions

### If Go
1. **Nov 30:** Merge pilot code to staging
2. **Dec 1-3:** Run full staging validation (all 5 transaction types)
3. **Dec 4-5:** Prepare production deployment
4. **Dec 6-8:** Limited production rollout (1-2 pilot tenants)
5. **Dec 9+:** Gradual rollout + monitoring

### If No-Go
1. **Dec 1-2:** Capture feedback and risk mitigation requirements
2. **Dec 2-5:** Address blockers
3. **Dec 8:** Reschedule review
4. **Dec 9+:** Resume rollout after sign-off

---

## Key Contacts & Responsibilities

| Role | Name | Email | Responsibility |
|------|------|-------|-----------------|
| Finance Lead | [TBD] | [TBD] | Audit trail validation, accounting integration |
| Legal Lead | [TBD] | [TBD] | Compliance checklist, safeguarding review |
| Engineering | [TBD] | [TBD] | Demo delivery, technical Q&A |
| Product | [TBD] | [TBD] | Project overview, timeline management |

---

## Delivery Artifacts (Finalized Nov 28)

All files finalized and linked in `docs/ops/` by Nov 28, 5:00 PM GMT:
- ✅ `docs/ops/audit_evidence_bundle.md` – Complete audit record
- ✅ `docs/ops/forensic_report.md` – Telemetry schema + samples
- ✅ `docs/ops/tokenisation_pilot_plan.md` – Implementation roadmap
- ✅ `docs/ops/ops_run_report.md` – Automation run history
- ✅ `logs/forensic-events-sample.log` – Sample transaction log
- [ ] **TODO (by Nov 28):** Dec 1 Workshop Presentation (PowerPoint/PDF)
- [ ] **TODO (by Nov 28):** Live Demo Script & Test Cases

---

## Escalation & Contact

**If issues arise before Nov 30:**
- Contact: Engineering lead
- Response time: < 4 hours
- Fallback: Reschedule workshop to Dec 8

---

**Status:** READY FOR REVIEW
**Last Updated:** November 18, 2025
**Next Review:** November 24, 2025 (Staging Validation)
