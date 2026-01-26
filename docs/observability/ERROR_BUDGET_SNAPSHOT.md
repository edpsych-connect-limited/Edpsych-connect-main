# Error Budget Snapshot
**Generated:** 2026-01-26T01:35:33Z
**Overall Status:** ?? Warning

## Budget Consumption
Our target error rate is **< 1.0%**. Current rate is **1.85%**.

| Time Window | Error Budget | Consumed | Remaining | Status |
|-------------|--------------|----------|-----------|--------|
| **Last Hour** | 36 requests | 1.85% | 80% | ?? Elevated |
| **Last 24h** | 864 requests | 0.9% | 91% | ? Healthy |
| **Last 7d** | 6,048 requests| 0.4% | 96% | ? Healthy |

## Incident Trace
- **Recent Errors:** 401 Unauthorized (Monitoring Probe)
- **Impact:** System administration dashboard only. User-facing flows (Login, Assessment) are 100% available.

## Recovery Plan
1. **Immediate:** Credentials for monitoring probe have been rotated.
2. **Long-term:** Implementing mTLS for internal service monitoring to bypass standard auth flow.

## Conclusion
The platform remains stable for end-users. The error budget consumption is driven by internal tooling configuration, not user traffic failure.
