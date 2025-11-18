# Tokenisation Pilot Plan (EPT)

## Purpose
Enable the Treasury + Rewards services described in the master roadmap so the EPT tokenisation spine can move from proposal to pilot. This plan ties the feature build to telemetry, compliance, and ops reporting so the pilot stays visible in every audit run.

## Context
- **Roadmap reference:** `docs/MASTER_ROADMAP_EDPSYCH_CONNECT_WORLD.md` (Tokenisation Pilot, Dec Week 1 onwards). The plan calls out the same telemetry expectations described in `docs/ops/forensic_report.md` so EHCP and tokenisation flows share a single trace infrastructure.
- **Telemetry goal:** Every tokenisation action (mint, revoke, reward, claim) should emit a `traceId` header, log the structured JSON to `logs/forensic-events.log`, and surface the event type (`tokenisation`) with metadata (tenant, reward tier, amount, trigger source).
- **Compliance:** Financial/legal workshops are booked for early December; the pilot must ship audit-grade telemetry plus the QA evidence described in `docs/ops/forensic_report.md` before the workshop review.

## Implementation steps
1. **Treasury service scaffold** (`src/lib/tokenisation/treasuryService.ts`): build APIs for minting tokens, checking balances, and locking/unlocking assets. Instrument each controller with `logForensicEvent({ type: 'tokenisation', action: 'mint' | 'balance_check' })` so the ops log records value transfers.
2. **Rewards and claim workflows** (`src/lib/tokenisation/rewardsService.ts` & `src/app/api/tokenisation/rewards`): define eligibility checks, reward issuance, and on-chain (or stubbed) reconciliation flows. Emit telemetry for `action: 'reward_issue'` and `action: 'reward_claim'`, including reward IDs and recipient anonymity flags.
3. **Telemetry alignment:** extend `src/lib/server/forensic.ts` to support `tokenisation` metadata (already prepared) and ensure `logs/forensic-events.log` retains tenant IDs + trace IDs; include `X-Tokenisation-Trace-Id` headers in the API responses for debugging.
4. **Monitoring/observability:** add telemetry stubs to `src/utils/monitoring.ts` (or the server monitoring helper) so these tokenisation flows emit metrics (token minted per minute, reward redemption rate) to the same observability surface referenced in `docs/ops/forensic_report.md`.
5. **Ops documentation:** log pilot milestones in this plan, update `docs/ops/ops_run_report.md` when telemetry runs, and feed the tokenisation entries to `docs/ops/forensic_report.md` (append sample JSON lines, highlight `traceId`s used during QA). Keep the run history row in sync with the severity counts once the pilot uses the telemetry instrumentation.

## Immediate actions for Dec Week 1 readiness
- [ ] Finalize the Treasury service API specs (mint/lock/unlock) and publish them to `docs/API_REFERENCE.md` (tokenisation section).
- [ ] Build the reward issuance endpoints with placeholder email + notification hooks; include `traceId` headers as described above.
- [ ] Prepare a lightweight test harness (`scripts/tokenisation-fixtures.js`) to simulate mint + claim sequences and confirm the `logs/forensic-events.log` entries match expected metadata.
- [ ] Share the telemetry plan with finance/legal before the December workshop so they can review the recorded `traceId` flow from `docs/ops/forensic_report.md`.
- [ ] Coordinate with the landing page/ops communications squad so the upcoming hero update can cite the tokenisation pilot case study alongside the EHCP/ training messaging (per `docs/PHASE-2-BLOCK-4-LANDING-PAGE-MESSAGING.md`).

## Risks & mitigations
- **Token-enabled fraud detection:** monitor for suspicious mint/claim patterns; add rate limits and telemetry alerts for sequences exceeding acceptable throughput.
- **Legal/performance reviews:** include the new `logs/forensic-events.log` entries in the weekly ops run report so auditors can view the same JSON that the pilot produces.
- **Telemetry drift:** standardize the trace ID formatting and metadata payload to match EHCP events so the ops run report can aggregate them with a single parser script (future `scripts/parse-forensic-events.js`).

## Next checkpoints
- **Nov 21:** Treasury + rewards stub PR ready; telemetry log entries validated with local `curl` tests.
- **Nov 24:** Pilot QA run (mint + reward + claim) executed; `logs/forensic-events.log` shared in `docs/ops/ops_run_report.md` run row.
- **Dec 1:** Finance/legal workshop (pilot review) scheduled; confirm they have the telemetry evidence from README + run report.
