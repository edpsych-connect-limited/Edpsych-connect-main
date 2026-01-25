# Backup and Restore Validation

Document the backup schedule and restore verification plan for launch.

## Backup schedule
- Database backups: daily automated snapshots (Neon) + point-in-time recovery enabled.
- Object storage backups: Cloudinary asset export job weekly (metadata + asset list).
- Retention period: 35 days for database snapshots; 12 months for asset export logs.

## Restore verification
- Cadence: monthly (tabletop + staged restore).
- Validation steps:
  1) Restore to a staging environment.
  2) Validate authentication and core dashboards.
  3) Validate a sample case, assessment, and EHCP export.
  4) Record results in this document.

## Evidence log
- Last restore test: 2026-01-25 (tabletop + checklist walk-through).
- Result: Pass (tabletop); staged restore scheduled for next monthly window.
