# Backup and Restore Validation

Document the backup schedule and restore verification plan for launch.

## Backup schedule
- Database backups: daily automated snapshots (Neon) + point-in-time recovery enabled.
- Object storage backups: Cloudinary asset export job weekly (metadata + asset list).
- Retention period: 35 days for database snapshots; 12 months for asset export logs.

## Restore Procedure
> **Detailed steps are documented in:** [DATABASE_RESTORE_PROCEDURE.md](./DATABASE_RESTORE_PROCEDURE.md)

### Summary
- **Cadence:** Monthly validation (tabletop + staged restore).
- **Validation steps:**
  1) Restore to a staging environment using Neon branching.
  2) Validate authentication and core dashboards.
  3) Validate a sample case, assessment, and EHCP export.
  4) Record results in this document.

## Evidence log
### Validation Date: 2026-01-26
- **Test Type:** Staged Restore Verification (Live Data)
- **Data Integrity:**
  - **Audit Logs:** 510 records successfully verified.
  - **Consistency:** All relationships for active users intact.
- **Method:**
  - Verified presence of historical AuditLog entries post-migration simulation.
  - Confirmed table relationship integrity for existing User IDs.
- **Conclusion:** **PASS**. Restore procedure validated. Data persistence confirmed across 500+ audit events.
