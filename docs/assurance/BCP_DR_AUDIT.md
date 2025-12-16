# Business Continuity & Disaster Recovery (BCP/DR) – Internal Audit

## Objectives

- Demonstrate recoverability and acceptable downtime.
- Produce evidence for Availability controls (SOC 2) and resilience expectations (public sector procurement).

## Define targets (fill in)

- RPO (data loss tolerance): ____
- RTO (time to restore service): ____

## Evidence we must produce

- [ ] Backup configuration description
- [ ] Restore test log (date, operator, outcome)
- [ ] Database restore verification (row counts / spot checks)
- [ ] Runbook for incident response + DR invocation

## DR test procedure (template)

1. Pick a realistic failure mode (DB outage, region outage, deploy rollback)
2. Execute restore/rollback
3. Validate critical flows
4. Record timings vs RTO/RPO
5. Record lessons learned + follow-up tasks

Last updated: 2025-12-15
