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

## Escalation Path
> Contact details are stored in the secure password manager (1Password) under "Incident Contacts".

1. **Incident Lead (On-Call)**: First responder.
2. **Tech Lead / Engineering Manager**: If S1/S2 not resolved within 30 minutes.
   - Responsible for stakeholder comms.
3. **CTO / Founder**: If S1/S2 triggers potential data breach or >2hr downtime.
   - Responsible for legal/PR activation.
4. **Third-Party Support**:
   - Neon Support (Database issues)
   - Vercel Support (Hosting/Platform issues)

## Resolution and follow-up
1) Confirm service stability and monitor recovery metrics.
2) Document root cause, timeline, and corrective actions.
3) Add learning to runbook and backlog.

## Verification log
- Last tabletop drill: 2026-01-25.
- Result: Pass (comms + severity workflow confirmed).
