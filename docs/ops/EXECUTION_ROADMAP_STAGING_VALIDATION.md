# EXECUTION ROADMAP: NOV 24 - DEC 1 (Staging Validation Phase)

**Status:** PHASE 1 COMPLETE – Beginning PHASE 2  
**Authority:** CTO (Virtual – 100% Autonomous)  
**Timeline:** November 24-30, 2025  
**Target:** Workshop-Ready Validation Evidence  

---

## 📋 PHASE 2 Overview (Nov 24-30)

### Objective
Run comprehensive staging validation to prove tokenisation pilot is production-ready for finance/legal workshop on Dec 1.

### Success Criteria
- ✅ All 5 test scenarios pass end-to-end
- ✅ Forensic logs validate (JSON format, trace IDs)
- ✅ Database persistence verified (balances persist across restarts)
- ✅ Zero P0 errors in staging
- ✅ Demo script tested and ready
- ✅ Workshop evidence gathered

### Timeline
- **Nov 24 (Monday):** Pre-deployment + database migration
- **Nov 25 (Tuesday):** Test scenarios 1-3 execution
- **Nov 26 (Wednesday):** Test scenarios 4-5 + monitoring
- **Nov 27 (Thursday):** Data persistence verification
- **Nov 28 (Friday):** Demo finalization + sign-off preparation
- **Nov 29-30:** Continuous monitoring + contingency tests

---

## 🚀 DETAILED EXECUTION PLAN

### MONDAY, NOV 24 – KICKOFF & DEPLOYMENT

#### Morning (8:00 AM – 12:00 PM)

**STEP 1: Create Staging Branch (30 min)**
```bash
# Create staging branch from main
git checkout -b staging/nov24-pilot main
git push -u origin staging/nov24-pilot

# Verify branch created
git branch -v
```

**STEP 2: Deploy Database Migration (30 min)**
```bash
# On staging environment
export DATABASE_URL="<staging-db-url>"

# Run migration
npx prisma migrate deploy --skip-generate

# Verify migration success
npx prisma db execute --stdin < tools/verify-tokenisation-schema.sql
```

**Expected Output:**
- 4 tables created (TokenisationAccount, TokenisationTransaction, Reward, RewardClaim)
- 15 indexes created
- No errors

**STEP 3: Create Test Fixtures (1 hour)**
```bash
# Create initialization script
cat > tools/create-staging-fixtures.sql << 'EOF'
-- Test Tenant
INSERT INTO tenants (name, subdomain, tenant_type, status, created_at, updated_at)
VALUES (
  'Staging Pilot Test',
  'staging-pilot-nov24',
  'SCHOOL',
  'active',
  NOW(),
  NOW()
) RETURNING id;

-- Test Users (capture tenant_id from above)
INSERT INTO users (tenant_id, email, first_name, last_name, role_type, status, created_at, updated_at)
VALUES (1, 'pilot-admin@staging.test', 'Staging', 'Admin', 'ADMIN', 'active', NOW(), NOW());

INSERT INTO users (tenant_id, email, first_name, last_name, role_type, status, created_at, updated_at)
VALUES (1, 'pilot-teacher@staging.test', 'Staging', 'Teacher', 'TEACHER', 'active', NOW(), NOW());

-- Treasury Account
INSERT INTO "TokenisationAccount" (id, tenant_id, account_type, balance, locked_amount, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  1,
  'TREASURY',
  0,
  0,
  NOW(),
  NOW()
);

-- Rewards Pool Account
INSERT INTO "TokenisationAccount" (id, tenant_id, account_type, balance, locked_amount, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  1,
  'REWARDS_POOL',
  0,
  0,
  NOW(),
  NOW()
);
EOF

# Execute fixture script
psql $DATABASE_URL -f tools/create-staging-fixtures.sql
```

**Expected IDs for next steps:**
- Tenant ID: 1
- Admin User ID: 101
- Teacher User ID: 102

#### Afternoon (12:00 PM – 5:00 PM)

**STEP 4: Deploy Staging Build (1 hour)**
```bash
# Build Next.js application
npm run build

# Verify build success
npm run start &  # Optional: start in background to verify

# Deploy to staging environment
# (Method depends on your CD pipeline)
```

**STEP 5: Smoke Test API Endpoints (30 min)**
```bash
# Test Treasury balance query
curl -X GET "https://staging.edpsych-connect.test/api/tokenisation/treasury?tenantId=1"

# Expected: { "balance": 0 }

# Test Rewards ledger
curl -X GET "https://staging.edpsych-connect.test/api/tokenisation/rewards?tenantId=1"

# Expected: { "rewards": [] }
```

**STEP 6: Prepare Forensic Logging (30 min)**
```bash
# Ensure log directory exists
mkdir -p logs/

# Verify forensic log is being written
tail -f logs/forensic-events.log &
```

---

### TUESDAY-WEDNESDAY, NOV 25-26 – TEST SCENARIOS

#### Test Scenario 1: Treasury Mint Flow (Nov 25, 9:00 AM)

**Goal:** Verify token minting produces valid trace IDs and persists to database

**Test Steps:**
```bash
# POST /api/tokenisation/treasury - Mint 1000 tokens
curl -X POST "https://staging.edpsych-connect.test/api/tokenisation/treasury" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": 1,
    "amount": 1000,
    "reason": "Initial pilot allocation",
    "userId": 101
  }' -w "\n%{http_code}\n" | tee scenario1-mint-response.json

# Save response header with trace ID
# Expected Header: X-Tokenisation-Trace-Id: <uuid>

# Extract trace ID for later verification
TRACE_ID=$(grep -o '"traceId":"[^"]*"' scenario1-mint-response.json | cut -d'"' -f4)
echo "Trace ID: $TRACE_ID" > scenario1-trace-id.txt

# Query database to verify persistence
psql $DATABASE_URL << SQL
SELECT 
  id, 
  trace_id,
  transaction_type, 
  amount, 
  created_at,
  reason
FROM "TokenisationTransaction" 
WHERE tenant_id = 1 AND transaction_type = 'MINT'
ORDER BY created_at DESC LIMIT 1;
SQL

# Query account balance
psql $DATABASE_URL << SQL
SELECT 
  account_type,
  balance,
  updated_at
FROM "TokenisationAccount"
WHERE tenant_id = 1 AND account_type = 'TREASURY';
SQL

# Verify forensic log entry
grep "$TRACE_ID" logs/forensic-events.log | head -1
```

**Expected Results:**
- ✅ HTTP 200 OK
- ✅ Response body: `{ "success": true, "balance": 1000, "traceId": "<uuid>" }`
- ✅ Header: `X-Tokenisation-Trace-Id: <uuid>`
- ✅ Database: 1 MINT transaction with matching trace_id
- ✅ Account balance: 1000
- ✅ Forensic log: 1 entry with matching trace_id
- ✅ Response time: < 500ms

**Document Results:**
- Save scenario1-response.json (API response)
- Save scenario1-database-verify.txt (DB query results)
- Save scenario1-forensic-log-entry.txt (Forensic log extract)

---

#### Test Scenario 2: Reward Issue & Claim (Nov 25, 10:30 AM)

**Goal:** Verify reward lifecycle with trace correlation

**Step A: Issue Reward**
```bash
curl -X POST "https://staging.edpsych-connect.test/api/tokenisation/rewards" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": 1,
    "userId": 101,
    "amount": 50,
    "rewardTier": "standard",
    "description": "Pilot participation reward"
  }' | tee scenario2-issue-response.json

# Extract reward ID and trace ID
REWARD_ID=$(grep -o '"id":"[^"]*"' scenario2-issue-response.json | head -1 | cut -d'"' -f4)
TRACE_ID_ISSUE=$(grep -o '"traceId":"[^"]*"' scenario2-issue-response.json | cut -d'"' -f4)

echo "Reward ID: $REWARD_ID" > scenario2-ids.txt
echo "Issue Trace ID: $TRACE_ID_ISSUE" >> scenario2-ids.txt

# Verify in database
psql $DATABASE_URL << SQL
SELECT id, status, amount, reward_tier, issued_at
FROM "Reward"
WHERE tenant_id = 1 AND id = '$REWARD_ID';
SQL
```

**Step B: Claim Reward**
```bash
curl -X PATCH "https://staging.edpsych-connect.test/api/tokenisation/rewards" \
  -H "Content-Type: application/json" \
  -d "{
    \"rewardId\": \"$REWARD_ID\"
  }" | tee scenario2-claim-response.json

# Extract trace ID for claim
TRACE_ID_CLAIM=$(grep -o '"traceId":"[^"]*"' scenario2-claim-response.json | cut -d'"' -f4)
echo "Claim Trace ID: $TRACE_ID_CLAIM" >> scenario2-ids.txt

# Verify claim in database
psql $DATABASE_URL << SQL
SELECT id, reward_id, claimed_at, trace_id
FROM "RewardClaim"
WHERE reward_id = '$REWARD_ID';

SELECT status
FROM "Reward"
WHERE id = '$REWARD_ID';
SQL
```

**Expected Results:**
- ✅ Issue: HTTP 200, reward created with AVAILABLE status
- ✅ Claim: HTTP 200, reward status changed to CLAIMED
- ✅ Different trace IDs for issue and claim operations
- ✅ RewardClaim record created with unique trace_id
- ✅ Both trace IDs in forensic logs
- ✅ Treasury account locked amount updated

**Document Results:**
- Save scenario2-issue-response.json
- Save scenario2-claim-response.json
- Save scenario2-database-verify.txt
- Save scenario2-ids.txt (trace ID correlation)

---

#### Test Scenario 3: Balance Consistency (Nov 25, 2:00 PM)

**Goal:** Verify treasury vs rewards separation and balance accuracy

**Steps:**
```bash
# Query current balances
psql $DATABASE_URL << SQL
SELECT 
  account_type,
  balance,
  locked_amount,
  (balance + locked_amount) as total
FROM "TokenisationAccount"
WHERE tenant_id = 1
ORDER BY account_type;
SQL

# Mint additional 500 tokens
curl -X POST "https://staging.edpsych-connect.test/api/tokenisation/treasury" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": 1,
    "amount": 500,
    "reason": "Additional pilot tokens"
  }' | tee scenario3-mint2-response.json

# Query balances again
psql $DATABASE_URL << SQL
SELECT 
  account_type,
  balance,
  locked_amount,
  (balance + locked_amount) as total
FROM "TokenisationAccount"
WHERE tenant_id = 1
ORDER BY account_type;
SQL

# Verify transaction count
psql $DATABASE_URL << SQL
SELECT 
  transaction_type,
  COUNT(*) as count,
  SUM(amount) as total_amount
FROM "TokenisationTransaction"
WHERE tenant_id = 1
GROUP BY transaction_type;
SQL
```

**Expected Results:**
- ✅ TREASURY account: balance = 1500 (1000 + 500)
- ✅ REWARDS_POOL account: separate from treasury
- ✅ Transaction count: MINT (2), LOCK (1), UNLOCK (1) from rewards
- ✅ Sum verification: All mints + locks + unlocks balance correctly

**Document Results:**
- Save scenario3-balance-state.txt (before & after)
- Save scenario3-transaction-summary.txt

---

#### Test Scenario 4: Forensic Log Format Validation (Nov 26, 9:00 AM)

**Goal:** Verify forensic logs are parseable, valid JSON with required fields

**Steps:**
```bash
# Extract last 10 forensic events
tail -10 logs/forensic-events.log > scenario4-forensic-extract.log

# Validate JSON format
cat scenario4-forensic-extract.log | while read line; do
  echo "$line" | jq . > /dev/null && echo "✓ Valid JSON" || echo "✗ Invalid JSON: $line"
done

# Verify required fields in each log entry
cat logs/forensic-events.log | jq '{
  type,
  action,
  tenantId,
  traceId,
  timestamp
}' > scenario4-required-fields.json

# Check trace ID uniqueness
jq -r '.traceId' logs/forensic-events.log | sort | uniq -d > scenario4-duplicate-trace-ids.txt
if [ ! -s scenario4-duplicate-trace-ids.txt ]; then
  echo "✓ All trace IDs are unique"
else
  echo "✗ Duplicate trace IDs found:"
  cat scenario4-duplicate-trace-ids.txt
fi

# Verify timestamp format (ISO 8601)
jq -r '.timestamp' logs/forensic-events.log | while read ts; do
  if [[ $ts =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2} ]]; then
    : # Valid
  else
    echo "✗ Invalid timestamp format: $ts"
  fi
done && echo "✓ All timestamps are ISO 8601"
```

**Expected Results:**
- ✅ All log entries are valid JSON
- ✅ All entries have required fields: type, action, tenantId, traceId, timestamp
- ✅ All trace IDs are unique (no duplicates)
- ✅ All timestamps are ISO 8601 format
- ✅ Log entries > 5 (from our test scenarios)

**Document Results:**
- Save scenario4-forensic-extract.log
- Save scenario4-validation-report.txt

---

#### Test Scenario 5: Rate Limiting & Error Handling (Nov 26, 2:00 PM)

**Goal:** Verify API robustness with invalid inputs and rate limiting

**Step A: Invalid Input Handling**
```bash
# Missing required field
curl -X POST "https://staging.edpsych-connect.test/api/tokenisation/treasury" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100
  }' | tee scenario5-invalid-tenantid-response.json

# Expected: HTTP 400, error message

# Negative amount
curl -X POST "https://staging.edpsych-connect.test/api/tokenisation/treasury" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": 1,
    "amount": -100
  }' | tee scenario5-negative-amount-response.json

# Expected: HTTP 400, error message

# Invalid reward claim
curl -X PATCH "https://staging.edpsych-connect.test/api/tokenisation/rewards" \
  -H "Content-Type: application/json" \
  -d '{
    "rewardId": "invalid-reward-id"
  }' | tee scenario5-invalid-reward-response.json

# Expected: HTTP 500, error message
```

**Step B: Rate Limiting (if configured)**
```bash
# Send 10 rapid requests
for i in {1..10}; do
  curl -X GET "https://staging.edpsych-connect.test/api/tokenisation/treasury?tenantId=1" &
done
wait

# Check for 429 responses (rate limit)
# Document any 429 responses with trace IDs
```

**Expected Results:**
- ✅ HTTP 400 for missing required fields
- ✅ HTTP 400 for negative amounts
- ✅ HTTP 500 for invalid reward IDs (with error message)
- ✅ All error responses include error description
- ✅ (Optional) HTTP 429 with X-Tokenisation-Trace-Id for rate-limited requests

**Document Results:**
- Save scenario5-error-responses.txt

---

### THURSDAY, NOV 27 – DATA PERSISTENCE VERIFICATION

**Goal:** Verify data persists across application restarts

#### Step 1: Restart Application (9:00 AM)
```bash
# Kill running application
pkill -f "node.*next"

# Wait 10 seconds
sleep 10

# Restart application
npm run start &

# Wait for startup
sleep 30
```

#### Step 2: Query Data Without New Transactions (9:30 AM)
```bash
# Query treasury balance (should still be 1500 from earlier)
curl -X GET "https://staging.edpsych-connect.test/api/tokenisation/treasury?tenantId=1"

# Expected: { "balance": 1500 }

# Query rewards (should show claimed reward)
curl -X GET "https://staging.edpsych-connect.test/api/tokenisation/rewards?tenantId=1"

# Expected: Array with claimed reward

# Query database directly
psql $DATABASE_URL << SQL
SELECT 
  account_type,
  balance,
  updated_at
FROM "TokenisationAccount"
WHERE tenant_id = 1
ORDER BY account_type;

SELECT COUNT(*) as transaction_count FROM "TokenisationTransaction" WHERE tenant_id = 1;
SELECT COUNT(*) as reward_count FROM "Reward" WHERE tenant_id = 1;
SELECT COUNT(*) as claim_count FROM "RewardClaim" WHERE tenant_id = 1;
SQL
```

**Expected Results:**
- ✅ API returns same balances as before restart
- ✅ Database queries return same data
- ✅ No data loss after restart
- ✅ All trace IDs still queryable

**Document Results:**
- Save scenario-persistence-verification.txt

---

### FRIDAY, NOV 28 – DEMO FINALIZATION

#### Morning: Demo Script Testing (9:00 AM)
```bash
# Execute demo script against staging
bash tools/demo-tokenisation-pilot-5min.sh
```

#### Afternoon: Workshop Materials Preparation (2:00 PM)
- [ ] Screenshot API response with trace ID header
- [ ] Screenshot database query showing transactions
- [ ] Screenshot forensic log entries
- [ ] Prepare presenter notes for 5-minute demo
- [ ] Document all evidence in workshop folder

#### End of Day: Sign-Off Confirmation (5:00 PM)
- [ ] QA lead signs off on all test results
- [ ] Engineering lead confirms no P0 issues
- [ ] Product lead confirms demo readiness
- [ ] All evidence collected in `docs/ops/staging-validation-report.md`

---

### NOV 29-30 – MONITORING & CONTINGENCY

#### Continuous Monitoring
- [ ] Monitor staging for any unusual errors
- [ ] Check forensic logs for any anomalies
- [ ] Verify database performance (query times)
- [ ] Document any issues found

#### Contingency Tests
- [ ] Retry all 5 test scenarios (verify consistency)
- [ ] Database backup verification
- [ ] Failover testing (if applicable)
- [ ] Performance under load (optional)

---

## 📊 SUCCESS METRICS (Weekly Goals)

| Metric | Target | Status |
|--------|--------|--------|
| Test scenarios passing | 5/5 | ⏳ TO-DO |
| Forensic log entries | > 10 valid | ⏳ TO-DO |
| Data persistence verified | Yes | ⏳ TO-DO |
| Zero P0 errors | Yes | ⏳ TO-DO |
| Workshop demo ready | Yes | ⏳ TO-DO |
| Lint warnings | < 1,700 | ⏳ TO-DO |
| Sprint 1 progress | 50+ fixed | ⏳ TO-DO |

---

## 📝 DOCUMENTATION DELIVERABLES

By Nov 30, 5:00 PM:

1. **Staging Validation Report** (`docs/ops/staging-validation-report.md`)
   - Test results (pass/fail for each scenario)
   - Evidence screenshots and logs
   - Database query results
   - Performance metrics
   - Go/no-go recommendation

2. **Workshop Demo Script** (`docs/ops/workshop-demo-script.md`)
   - 5-minute walkthrough
   - Live API calls (with real responses)
   - Trace ID demonstration
   - Forensic log verification

3. **Evidence Artifacts**
   - API response logs (JSON)
   - Database query results (SQL)
   - Forensic log extracts (newline-delimited JSON)
   - Screenshots (if applicable)

4. **Go/No-Go Decision Document** (`docs/ops/staging-go-nogo-decision.md`)
   - Validation results summary
   - Critical findings
   - Finance/legal workshop readiness
   - Deployment recommendation

---

## 🚨 DECISION POINTS

### If All Tests Pass (Nov 30, 5:00 PM)
- ✅ **GO** → Proceed to Dec 1 workshop with confidence
- ✅ Prepare workshop presentation
- ✅ Brief finance/legal team on evidence
- ✅ Ready for production deployment decision

### If Blockers Found (Before Nov 30)
- ⚠️ **PAUSE** → Escalate immediately
- ⚠️ Identify root cause
- ⚠️ Implement fix
- ⚠️ Re-test the scenario
- ⚠️ Update workshop timeline if needed

---

## 👥 TEAM ASSIGNMENTS

| Role | Responsibility | Name |
|------|-----------------|------|
| CTO | Overall coordination, blocker resolution | Virtual CTO |
| QA Lead | Test execution, result documentation | TBD |
| DevOps | Deployment, database setup, monitoring | TBD |
| Engineering | API support, troubleshooting | TBD |
| Product | Workshop materials, stakeholder comms | TBD |

---

## 📞 COMMUNICATION PROTOCOL

### Daily Standups (Mon-Fri, 9:00 AM GMT)
- Report on yesterday's progress
- Identify today's blockers
- Update team on any issues
- Confirm demo ready status

### Escalation Path
- **P0 Issues:** Page CTO immediately
- **Blocked Tests:** Escalate to engineering same-day
- **Database Issues:** Escalate to DevOps same-day
- **Finance Concerns:** Escalate to product + CTO

### Final Sign-Off (Nov 30, 5:00 PM)
- CTO approves release to workshop
- QA confirms all tests passed
- Engineering confirms code quality
- Product confirms stakeholder readiness

---

**Execution Status: READY TO BEGIN NOV 24**

All preparation complete. Database layer built. Test scenarios defined. Workshop evidence process documented.

**Next Checkpoint:** Monday, November 24, 2025 at 8:00 AM GMT

