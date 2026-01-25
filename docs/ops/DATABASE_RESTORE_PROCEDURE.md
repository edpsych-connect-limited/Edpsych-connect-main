# Database Restore Procedure (Neon / Postgres)

**Objective:** Recover from data corruption or accidental deletion with RPO < 5 minutes and RTO < 15 minutes.

## Architecture Context
- **Provider:** Neon (Serverless Postgres)
- **ORM:** Prisma
- **Strategy:** Point-in-Time Recovery (PITR) via Branching

## Incident Response Steps

### 1. Identify Restore Point
Determine the exact timestamp of the corruption/incident (UTC).
*Source: `docs/observability/SLO_STATUS_SNAPSHOT.md` (Alerts) or Sentry Logs.*

### 2. Immediate Mitigation (Stop the Bleeding)
If the corruption is ongoing (e.g., bad migration script):
1. Enable `MAINTENANCE_MODE=true` in Vercel Environment Variables.
2. Redeploy to stop traffic.

### 3. Execute Restore (The "Neon Branch" Method)
Neon allows instant copy-on-write branching from history effectively acting as a restore.

**Command (CLI or Console):**
```bash
# Create a recovery branch from 5 minutes before the incident
neon branches create restore-2026-01-23 --from-parent-id [main-branch-id] --timestamp "2026-01-23T14:30:00Z"
```

### 4. Verification
1. Connect to the `restore-2026-01-23` branch using a local client or the "Safety Net" test script.
2. Run validation:
   ```bash
   DATABASE_URL="postgres://...[restore-branch]..." npm run verify:ci
   ```
3. Check specific affected records (e.g., "Is User X restored?").

### 5. Cutover (Zero Downtime)
1. Update Vercel `DATABASE_URL` environment variable to point to the `restore-2026-01-23` host.
2. Redeploy application.
3. Verify production traffic is healthy.

### 6. Post-Mortem
1. Rename the corrupted `main` branch to `main-corrupted-[date]`.
2. Rename `restore-2026-01-23` to `main` (if supported) or update IaC to reflect new primary.
3. Conduct Root Cause Analysis (RCA).

## Testing Schedule
- **Frequency:** Quarterly.
- **Last Tested:** 2026-01-20 (Simulated during Handoff).
- **Owner:** DevOps Lead.
