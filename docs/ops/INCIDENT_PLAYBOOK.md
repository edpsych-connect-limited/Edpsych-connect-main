# Incident Response Playbook

Use this playbook to respond to incidents affecting production reliability.
Align severity with business impact and follow communication steps.

## Severity definitions
- S1: Full outage or critical data integrity issue
- S2: Major degradation impacting multiple workflows
- S3: Partial degradation with workaround available
- S4: Minor issue or cosmetic defect

## Immediate actions
1) Declare incident and assign an incident lead.
2) Capture scope, start time, affected workflows.
3) Confirm recent deployments or config changes.
4) Mitigate impact (feature flags, rollback, rate limits).

## Communication steps
- Internal updates every 30 minutes for S1/S2.
- External updates within 60 minutes for S1/S2.
- Update status page (https://status.edpsychconnect.world) for S1/S2.

## Resolution and follow-up
1) Confirm service stability and monitor recovery metrics.
2) Document root cause, timeline, and corrective actions.
3) Add learning to runbook and backlog.

## Verification log
- Last tabletop drill: 2026-01-25.
- Result: Pass (comms + severity workflow confirmed).
