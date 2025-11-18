# Forensic Run Report

This report describes how EHCP export and tokenisation telemetry is captured for compliance, auditing, and resiliency reviews. Every telemetry-enabled flow appends JSON entries to `logs/forensic-events.log`, which is consumed when generating the weekly ops forensic summary.

## Telemetry approach
- **EHCP exports (download + email)** now emit trace IDs (`X-EHCP-Export-Trace-Id`) and write structured events via `src/lib/server/forensic.ts`.
- **Tokenisation flows** surface `X-Tokenisation-Trace-Id` headers and log metadata (tenant, reward tier, action) so treasury/reward operations can be audited through the same forensic log.
- Each log entry includes `tenantId`, `ehcpId`, `recipients`, `sections`, and any optional metadata (signatures, watermark, attachment count) so we can replay what was exported and why.
- The artifact file (`logs/forensic-events.log`) is persisted on every run and can be shipped with the next ops audit package; the entry format is newline-delimited JSON.

## Running the telemetry review
1. Reproduce the EHCP export scenario (GET or POST) in a dev/staging environment.
2. Capture the response header `X-EHCP-Export-Trace-Id` and correlate it to the latest line in `logs/forensic-events.log` (search `"traceId":"<value>"`).
3. Record the traced metadata (sections, watermark, recipients) in this report or in `docs/ops/ops_run_report.md` run notes when a major export QA pass completes.
4. If telemetry should be forwarded to an external service (SaaS or control plane), wire the exported JSON to that endpoint before the log entry completes.

## Sample entry
```
{"type":"ehcp_export","action":"download","tenantId":42,"ehcpId":1001,"sections":["A","B","E","F","I"],"format":"pdf","metadata":{"watermark":"DRAFT","url":"https://..."},"traceId":"abcdef12-3456-7890-abcd-ef1234567890","timestamp":"2025-11-18T12:34:56.789Z"}
```

## Tokenisation sample entries
```
{"type":"tokenisation","action":"mint","tenantId":1,"amount":1000,"metadata":{"reason":"pilot-test","batch":"batch-2025-1118-001"},"traceId":"trace-2025-1118-treasury-mint-001","timestamp":"2025-11-18T09:15:00.000Z"}
{"type":"tokenisation","action":"reward_issue","tenantId":1,"userId":101,"amount":50,"rewardTier":"standard","metadata":{"reason":"training-completion","batchId":"batch-2025-1118-001"},"traceId":"trace-2025-1118-rewards-issue-001","timestamp":"2025-11-18T09:20:00.000Z"}
{"type":"tokenisation","action":"reward_claim","tenantId":1,"userId":101,"rewardId":"reward-2025-1118-001","amount":50,"metadata":{"claimReason":"manual-user-request"},"traceId":"trace-2025-1118-rewards-claim-001","timestamp":"2025-11-18T09:25:00.000Z"}
{"type":"tokenisation","action":"balance_check","tenantId":1,"balance":950,"metadata":{"userId":101,"context":"user-dashboard"},"traceId":"trace-2025-1118-treasury-balance-001","timestamp":"2025-11-18T09:30:00.000Z"}
{"type":"tokenisation","action":"lock","tenantId":1,"userId":102,"amount":100,"lockedUntil":"2025-11-25T00:00:00.000Z","metadata":{"reason":"pending-review"},"traceId":"trace-2025-1118-treasury-lock-001","timestamp":"2025-11-18T09:35:00.000Z"}
```

**Trace IDs Used:**
- `trace-2025-1118-treasury-mint-001` – Token minting operation
- `trace-2025-1118-rewards-issue-001` – Reward issuance
- `trace-2025-1118-rewards-claim-001` – Reward claim
- `trace-2025-1118-treasury-balance-001` – Balance verification
- `trace-2025-1118-treasury-lock-001` – Asset lock (pending review)

## Next steps
- Coordinate with the EPT/tokenisation team so their flows emit the same `traceId` headers and telemetry rows (`type: 'tokenisation'`).
- Schedule a weekly audit to parse `logs/forensic-events.log` and append the summary to `docs/ops/ops_run_report.md` for visibility.
- Once the audit tool is in place, purge entries older than 6 months if retention policies require it (a future enhancement).
