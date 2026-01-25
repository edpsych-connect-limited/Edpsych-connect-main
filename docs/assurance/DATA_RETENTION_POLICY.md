# Data Retention Policy

This policy documents retention expectations for core data types and the
technical controls that enforce them. Update TBD items before launch.

## Core data categories
- EHCP documents: retained per local authority schedules (see privacy notice).
- Audit logs: retained for statutory periods (see EHCP document management service).
- Usage telemetry: retained per monitoring configuration.
- Security monitoring logs: retained per monitoring configuration.

## Evidence sources
- Privacy notice: `src/app/[locale]/privacy/page.tsx`
- EHCP document retention logic: `src/lib/ehcp/document-management-service.ts`
- Security monitoring retention: `src/lib/services/securityMonitoringService.ts`
- Performance monitoring retention: `src/lib/services/performanceMonitoringService.ts`

## Retention defaults (current evidence)
- EHCP audit logs: 6 years (statutory retention note in document management service).
- Security monitoring retention: 30 days (default).
- Performance monitoring retention: 7 days (default).
- Backups: daily database snapshots with 35-day retention; monthly restore verification.

## Open items
- Confirm data residency/region for all active vendors.
- Confirm retention for training video assets and marketplace data in vendor consoles.

## Approval
- Owner: Project Lead (Codex)
- Last reviewed: 2026-01-25
