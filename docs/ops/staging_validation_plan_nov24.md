# Staging Validation Test Plan – Nov 24-30, 2025

**Purpose:** Verify tokenisation pilot flows work end-to-end before Dec 1 finance/legal workshop  
**Scope:** Treasury + Rewards services, trace IDs, forensic logging  
**Duration:** 6 days (Nov 24-30)  
**Outcome:** Real transaction logs + workshop readiness confirmation  

---

## Pre-Deployment Checklist (Nov 24, 8:00 AM)

### Code Merge
- [ ] Merge tokenisation services to staging branch
- [ ] Verify CI pipeline passes (lint, tests)
- [ ] Confirm zero new warnings introduced

### Database Setup
- [ ] Staging DB initialized with tokenisation schema
- [ ] Test tenant created (ID: 1, name: "Staging Test")
- [ ] Test user created (ID: 101, tenant: 1)

### Environment Configuration
- [ ] Staging `.env` includes `FORENSIC_LOG_PATH=/var/log/tokenisation/forensic-events.log`
- [ ] API rate limits configured (100/min for staging)
- [ ] Trace ID generation enabled in `src/lib/server/forensic.ts`

### Monitoring Setup
- [ ] Log aggregation pointing to staging forensic log
- [ ] Dashboard prepared to monitor trace ID flow
- [ ] Error alerts configured for 5xx responses

---

## Test Scenarios (Nov 24-25)

### Scenario 1: Treasury Mint Flow
**Goal:** Verify token minting produces valid trace IDs

**Steps:**
1. Call `POST /api/tokenisation/treasury` with `{ tenantId: 1, action: 'mint', amount: 1000 }`
2. Capture response header `X-Treasury-Trace-Id`
3. Verify trace ID format: `trace-YYYY-MMDD-treasury-[action]-[seq]`
4. Check `logs/forensic-events.log` for matching entry

**Expected Outcome:**
- Response status: 200 OK
- Response body includes `{ success: true, balance: 1000, traceId: "trace-..." }`
- Header `X-Treasury-Trace-Id` present
- Log entry exists with matching traceId, tenantId, amount

**Pass Criteria:** ✅ Trace ID in response header AND log entry within 100ms

---

### Scenario 2: Reward Issue & Claim
**Goal:** Verify reward lifecycle with trace correlation

**Steps:**
1. Call `POST /api/tokenisation/rewards` with `{ tenantId: 1, userId: 101, amount: 50, action: 'issue' }`
2. Capture response `{ reward: { id: "reward-..." }, traceId: "trace-..." }`
3. Call `PATCH /api/tokenisation/rewards` to claim with `{ rewardId: "reward-..." }`
4. Verify both operations have distinct trace IDs in response + logs

**Expected Outcome:**
- Issue response: status 200, reward created, trace ID returned
- Claim response: status 200, reward claimed, new trace ID returned
- Two distinct log entries with different trace IDs
- Both entries link to same tenant + user

**Pass Criteria:** ✅ Both operations complete with unique trace IDs + log entries

---

### Scenario 3: Balance Consistency
**Goal:** Verify treasury balance tracking across operations

**Steps:**
1. Query balance: `POST /api/tokenisation/treasury` with `{ action: 'balance_check', tenantId: 1 }`
2. Mint 500 tokens
3. Issue reward (50 tokens deducted from rewards pool, not treasury)
4. Query balance again
5. Verify: initial (1000) → after mint (1500) → after reward (still 1500, rewards separate)

**Expected Outcome:**
- Initial balance: 1000
- After mint: 1500
- After reward: 1500 (rewards don't affect treasury balance)
- All operations have trace IDs

**Pass Criteria:** ✅ Balance consistent + all trace IDs present

---

### Scenario 4: Forensic Log Format Validation
**Goal:** Confirm log entries match audit schema

**Steps:**
1. Execute 10 transactions (mix of mint, reward, balance, lock)
2. Extract `logs/forensic-events.log`
3. Parse each line as JSON
4. Validate schema: `{ type, action, tenantId, traceId, timestamp, ... }`

**Expected Outcome:**
- All 10 lines parse as valid JSON
- Each line has: type, action, tenantId, traceId, timestamp
- All timestamps are ISO 8601
- All trace IDs are unique
- All tenant IDs match staging tenant (1)

**Pass Criteria:** ✅ 100% log entries valid + parseable

---

### Scenario 5: Rate Limiting & Error Handling
**Goal:** Verify rate limits and error responses include trace IDs

**Steps:**
1. Rapid-fire 150 requests to `/api/tokenisation/treasury` (exceeds 100/min limit)
2. Capture first 100 successful responses (status 200)
3. Verify requests 101-150 return 429 (Too Many Requests)
4. Check 429 responses include `X-Tokenisation-Trace-Id` header

**Expected Outcome:**
- Requests 1-100: status 200, with trace IDs
- Requests 101-150: status 429, with trace IDs (for debugging)
- Rate limit header: `Retry-After: 30`

**Pass Criteria:** ✅ Rate limiting working + error responses have trace IDs

---

## Continuous Monitoring (Nov 26-30)

### Daily Validation (9:00 AM – 5:00 PM GMT)
- Run each test scenario twice per day
- Log all trace IDs generated
- Monitor forensic log for anomalies
- Verify no memory leaks in logging subsystem

### Weekly Aggregation (Nov 30, 5:00 PM)
- Generate transaction summary: `{ totalMints: X, totalRewards: Y, totalClaims: Z, errorRate: N% }`
- Verify no duplicate trace IDs
- Check log file size growth (target: < 10MB for 48 hours of test)
- Confirm all operations are audit-traceable

### Sign-Off Checklist (Nov 30)
- [ ] All 5 test scenarios pass
- [ ] Forensic log format validated
- [ ] Rate limiting operational
- [ ] Zero P0/P1 errors in staging
- [ ] Workshop demo script tested end-to-end
- [ ] Finance/legal review materials finalized

---

## Workshop Demo Script (Dec 1, 10:15 AM)

### Live Demo Flow (10 minutes)
1. **Setup Screen Share (1 min)**
   - Show staging dashboard
   - Open `logs/forensic-events.log` in editor

2. **Execute Mint Operation (2 min)**
   - Call: `curl -X POST http://staging.api/tokenisation/treasury -d '{"action": "mint", "tenantId": 1, "amount": 500}'`
   - Show response header: `X-Treasury-Trace-Id: trace-2025-1130-treasury-mint-001`
   - Show response body with trace ID
   - Query log: `tail -f logs/forensic-events.log`
   - Highlight matching entry with same trace ID

3. **Execute Reward Issue (2 min)**
   - Call: `curl -X POST http://staging.api/tokenisation/rewards -d '{"tenantId": 1, "userId": 101, "amount": 50, "action": "issue"}'`
   - Show response with trace ID
   - Show new log entry

4. **Execute Reward Claim (2 min)**
   - Call: `curl -X PATCH http://staging.api/tokenisation/rewards -d '{"rewardId": "...", "action": "claim"}'`
   - Show response with trace ID
   - Show third log entry

5. **Q&A (1 min)**
   - Finance: "How do we reconcile these trace IDs to accounting?"
   - Response: "Export log daily, group by traceId, correlate to transaction ID"
   - Legal: "Can trace IDs be modified?"
   - Response: "No, generated server-side, immutable in log"

---

## Contingency Plans

### If Scenario Fails
**Issue: Trace ID missing from response**
- [ ] Check `src/app/api/tokenisation/treasury/route.ts` – ensure header is set
- [ ] Verify `src/lib/tokenisation/treasuryService.ts` returns trace ID
- [ ] Rerun tests; if persists, escalate to engineering

**Issue: Forensic log not created**
- [ ] Check `/var/log/tokenisation/` directory exists and is writable
- [ ] Verify `src/lib/server/forensic.ts` is being called
- [ ] Check for errors in application logs

**Issue: Rate limiting not working**
- [ ] Verify middleware is enabled in `src/app/api/tokenisation/`
- [ ] Check rate limit config in environment

**Issue: Production readiness concerns**
- [ ] Extend staging validation by 3 days (to Dec 3)
- [ ] Reschedule workshop to Dec 8
- [ ] Document blockers for engineering resolution

---

## Success Criteria for Go/No-Go

### Must-Have (Blocking)
- ✅ All 5 test scenarios pass
- ✅ Forensic log is generated and parseable
- ✅ Trace IDs are unique and traceable
- ✅ Zero P0 errors during 48-hour run

### Should-Have (Go with Caution)
- ✅ Rate limiting working
- ✅ Error responses include trace IDs
- ✅ Log file size < 10MB per 24 hours

### Risk Mitigation
- ✅ If lint regressions detected, run `LINT_TARGET=src/lib/tokenisation bash scripts/run-lint.sh` and update ops report
- ✅ If audit trail gaps found, update forensic schema and retest

---

## Deliverables by Nov 30, 5:00 PM

1. **Staging Validation Report**
   - Test scenario results (pass/fail for each)
   - Transaction summary (counts, error rate)
   - Log sample extraction (first 10 entries)

2. **Workshop Demo Recording** (optional)
   - 5-minute video walkthrough of live demo
   - Backup if live demo fails on Dec 1

3. **Lint Status Update**
   - Run full lint to confirm pilot code paths still clean
   - Update `docs/ops/ops_run_report.md` with Nov 30 validation run

4. **Go/No-Go Recommendation**
   - Clear statement: "READY FOR DEC 1 WORKSHOP" or escalation items
   - Engineering sign-off on code quality

---

**Owner:** Engineering Lead  
**Stakeholders:** Finance, Legal, Product, QA  
**Contact:** [Engineering email]  
**Escalation Path:** If blockers arise, escalate by Nov 27 EOD to enable remediation before workshop

**Status:** READY TO EXECUTE  
**Next Action:** Nov 24, 8:00 AM – Begin pre-deployment checklist
