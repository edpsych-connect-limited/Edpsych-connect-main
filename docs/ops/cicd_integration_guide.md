# CI/CD Integration Guide – Automated Lint & Telemetry Reporting

**Purpose:** Integrate lint analysis and telemetry runs into CI/CD pipeline  
**Scope:** GitHub Actions workflow + scheduled runs  
**Outcome:** Automated ops report updates + workspace telemetry validation  

---

## Current State

### Existing Tools
- ✅ `scripts/run-lint.sh` – ESLint wrapper, generates `lint-report.json` + `lint-summary.txt`
- ✅ `tools/run-all.sh` – CI wrapper, calls run-lint.sh
- ✅ `tools/analyze-lint-targets.py` – Parses lint output for analysis
- ✅ `tools/capture-telemetry-samples.js` – Generates sample traces

### Gaps
- ❌ No automated ops report update after lint runs
- ❌ No scoped lint runs in CI (only full lint)
- ❌ No telemetry validation in CI pipeline
- ❌ No scheduled weekly lint analysis

---

## Phase 1: Enhance Existing Tools (Nov 24-25)

### Task 1: Create `tools/parse-lint-report.js`
Purpose: Parse `lint-report.json` and append results to `docs/ops/ops_run_report.md`

```javascript
// File: tools/parse-lint-report.js
import fs from 'fs';
import path from 'path';

function parseAndAppend() {
  const lintReport = JSON.parse(fs.readFileSync('lint-report.json', 'utf-8'));
  const summary = fs.readFileSync('lint-summary.txt', 'utf-8').trim();
  
  // Extract severity counts
  const severityMatch = summary.match(/severity_counts ({[^}]+})/);
  const severities = severityMatch ? JSON.parse(severityMatch[1]) : { 1: 0, 2: 0 };
  
  // Build ops run report entry
  const now = new Date().toISOString().split('T')[0];
  const entry = `| ${now} | lint (CI) | ${severities['2'] || 0} | ${severities['1'] || 0} | Automated run via GitHub Actions; artifacts: \`lint-report.json\`, \`lint-summary.txt\`. |`;
  
  // Append to ops run report
  const opsReportPath = 'docs/ops/ops_run_report.md';
  const content = fs.readFileSync(opsReportPath, 'utf-8');
  const updated = content.replace(
    '| Run history',
    `${entry}\n| Run history`
  );
  fs.writeFileSync(opsReportPath, updated, 'utf-8');
  
  console.log(`✓ Ops run report updated: ${entry}`);
}

parseAndAppend();
```

**Integration:**
- Add to `tools/run-all.sh` after lint execution
- Call: `node tools/parse-lint-report.js`

---

### Task 2: Create `tools/run-scoped-lints.sh`
Purpose: Execute scoped lint runs for each major module

```bash
#!/bin/bash
# File: tools/run-scoped-lints.sh

set -e

MODULES=(
  "src/lib/tokenisation"
  "src/lib/services"
  "src/types"
  "src/services"
  "src/components"
)

echo "=== RUNNING SCOPED LINT CHECKS ==="

for module in "${MODULES[@]}"; do
  echo ""
  echo "Linting: $module"
  LINT_TARGET="$module" bash scripts/run-lint.sh
  
  # Parse and extract severity counts
  if [ -f lint-summary.txt ]; then
    echo "  → $(cat lint-summary.txt | grep severity_counts)"
  fi
done

echo ""
echo "=== SCOPED LINT COMPLETE ==="
```

**Integration:**
- Add to CI as optional job (can be scheduled weekly)
- Call: `bash tools/run-scoped-lints.sh`

---

## Phase 2: GitHub Actions Workflow (Nov 26-28)

### Create `.github/workflows/lint-and-telemetry.yml`

```yaml
name: Lint & Telemetry Validation

on:
  push:
    branches: [main]
  schedule:
    # Run full lint every day at 9:00 AM GMT
    - cron: '0 9 * * *'
    # Run scoped lints every Wednesday at 2:00 PM GMT
    - cron: '0 14 * * WED'

jobs:
  lint:
    runs-on: ubuntu-latest
    name: ESLint & Analysis
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run full lint
        run: bash scripts/run-lint.sh
      
      - name: Parse and update ops report
        run: node tools/parse-lint-report.js
      
      - name: Commit ops report update
        if: always()
        run: |
          git config user.email "ci@edpsych-connect.local"
          git config user.name "EdPsych CI"
          git add docs/ops/ops_run_report.md
          git diff --cached --quiet || git commit -m "CI: Update ops_run_report.md with lint results [$(date +'%Y-%m-%d')]"
          git push
      
      - name: Upload lint artifacts
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: lint-artifacts
          path: |
            lint-report.json
            lint-summary.txt
  
  scoped-lint:
    runs-on: ubuntu-latest
    name: Scoped Lint Modules
    if: github.event.schedule == '0 14 * * WED' || contains(github.event.head_commit.message, '[scoped-lint]')
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run scoped lints
        run: bash tools/run-scoped-lints.sh
      
      - name: Upload scoped results
        uses: actions/upload-artifact@v3
        with:
          name: scoped-lint-results
          path: lint-*.log
  
  telemetry-validation:
    runs-on: ubuntu-latest
    name: Telemetry Schema Validation
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Generate telemetry samples
        run: node tools/capture-telemetry-samples.js
      
      - name: Validate forensic log format
        run: |
          echo "Validating logs/forensic-events-sample.log..."
          while IFS= read -r line; do
            if ! echo "$line" | jq . > /dev/null 2>&1; then
              echo "ERROR: Invalid JSON in log: $line"
              exit 1
            fi
          done < logs/forensic-events-sample.log
          echo "✓ All log entries valid JSON"
      
      - name: Upload telemetry samples
        uses: actions/upload-artifact@v3
        with:
          name: telemetry-samples
          path: logs/forensic-events-sample.log
  
  report:
    runs-on: ubuntu-latest
    name: Generate Audit Report
    needs: [lint, telemetry-validation]
    if: always()
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Create summary
        run: |
          echo "# CI Lint & Telemetry Run" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "**Date:** $(date)" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          if [ -f lint-summary.txt ]; then
            echo "## Lint Summary" >> $GITHUB_STEP_SUMMARY
            echo "\`\`\`" >> $GITHUB_STEP_SUMMARY
            cat lint-summary.txt >> $GITHUB_STEP_SUMMARY
            echo "\`\`\`" >> $GITHUB_STEP_SUMMARY
          fi
      
      - name: Check lint gates
        run: |
          if [ -f lint-report.json ]; then
            ERROR_COUNT=$(jq '[.[] | .messages[] | select(.severity == 1)] | length' lint-report.json)
            if [ "$ERROR_COUNT" -gt 2000 ]; then
              echo "⚠️  WARNING: Lint errors exceed 2000 ($ERROR_COUNT)"
              exit 1
            else
              echo "✓ Lint errors within acceptable threshold: $ERROR_COUNT"
            fi
          fi
```

---

## Phase 3: Slack/Email Notifications (Nov 29-30)

### Add GitHub Actions Notification Step

```yaml
  notify:
    runs-on: ubuntu-latest
    name: Notify Results
    needs: report
    if: always()
    
    steps:
      - name: Send Slack notification
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
          payload: |
            {
              "text": "EdPsych CI Lint Run",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Lint & Telemetry Validation*\nDate: ${{ github.event.head_commit.timestamp }}\nStatus: ${{ job.status }}"
                  }
                }
              ]
            }
```

---

## Phase 4: Dashboard & Monitoring (Dec 1-5)

### Create `docs/ops/lint-sprint-tracking.md`
Update weekly with:
- Current warning count (severity-1)
- Progress vs. sprint target
- Top 5 files with most warnings
- Recommended next action

**Template:**
```markdown
# Lint Sprint Tracking – Week of [DATE]

| Module | Warnings | Target | Progress |
|--------|----------|--------|----------|
| src/services | 300 | 150 | 50% |
| src/components | 100 | 70 | 30% |
| src/types | 0 | 0 | ✓ |

**Top Files This Week:**
1. src/services/institutional-management/types.ts – 50 warnings
2. src/services/curriculum-service.ts – 15 warnings
3. src/services/navigation-service.ts – 12 warnings

**Recommended Actions:**
- Focus on enum constants (src/services/institutional-management/types.ts)
- Continue parameter prefixing pattern
- Next scoped run: [DATE]
```

---

## Implementation Checklist

### By Nov 25 (Tools Ready)
- [ ] Create `tools/parse-lint-report.js`
- [ ] Create `tools/run-scoped-lints.sh`
- [ ] Test locally: `bash tools/run-scoped-lints.sh`
- [ ] Verify ops report auto-update works

### By Nov 28 (GitHub Actions Ready)
- [ ] Create `.github/workflows/lint-and-telemetry.yml`
- [ ] Test workflow on dev branch
- [ ] Configure Slack webhook in GitHub secrets
- [ ] Dry-run: trigger manual workflow execution

### By Dec 1 (Production Live)
- [ ] Merge workflow to main
- [ ] Verify first automated run succeeds
- [ ] Confirm ops report auto-updated
- [ ] Check Slack notification sent

### By Dec 8 (Dashboard Live)
- [ ] Create initial `lint-sprint-tracking.md`
- [ ] Update weekly with latest metrics
- [ ] Link to dashboard from ops run report
- [ ] Share with engineering leadership

---

## Expected Outcomes

### Daily (via CI)
- ✅ Lint run executed automatically on main branch push
- ✅ Artifacts uploaded to GitHub
- ✅ Ops report updated with new results
- ✅ Slack notification sent to engineering channel

### Weekly (Scheduled Wednesday 2:00 PM GMT)
- ✅ Scoped lint runs for each major module
- ✅ Detailed analysis of top warning files
- ✅ Sprint tracking dashboard updated
- ✅ Recommendations for next week's cleanup focus

### Monthly
- ✅ Lint dashboard reviewed during roadmap sync
- ✅ Progress vs. target measured
- ✅ Blockers identified and escalated
- ✅ Next sprint priorities set

---

**Status:** READY TO IMPLEMENT  
**Owner:** DevOps/CI Lead  
**Timeline:** Phase 1-2 by Nov 28, Phase 3-4 by Dec 8  
**Dependencies:** GitHub Actions access, Slack webhook, Node.js 20 in runner
