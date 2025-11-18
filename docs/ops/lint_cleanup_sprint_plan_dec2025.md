# Lint Cleanup Sprint Plan – Nov 24 – Dec 15, 2025

**Goal:** Reduce 1,707 severity-1 warnings to < 500 by Dec 15  
**Strategy:** Module-by-module batch fixes with automated tooling  
**Ownership:** Engineering pods (AI, Curriculum, Gamification, Institutional Management)  

---

## Sprint Breakdown

### Sprint 1: High-Frequency Patterns (Nov 24-30) – Target: 200 warnings fixed

**Focus:** Parameter prefixing – Common unused parameters across multiple files

| File | Warnings | Pattern | Fix Strategy |
|------|----------|---------|--------------|
| `src/services/curriculum-service.ts` | 15 | `response`, `topic`, `yearGroup` parameters | Prefix with `_` in 6 handler functions |
| `src/services/navigation-service.ts` | 12 | `session`, `intent`, `pattern` parameters | Prefix in 8 callback functions |
| `src/services/gamification-service.ts` | 10 | `topic`, `gameMode`, `subject` parameters | Prefix in 5 functions |
| `src/services/blog-service.ts` | 8 | `topic`, `request` parameters | Prefix in 3 functions |
| `src/services/ai-service.ts` | 6 | `originalChallenge` parameter | Prefix in 1 callback |

**Action Items:**
1. **Nov 24:** Owner pod reviews files + confirms parameter names are truly unused
2. **Nov 25-26:** Apply `_` prefixes to identified parameters
3. **Nov 27:** Rerun `LINT_TARGET=src/services bash scripts/run-lint.sh` to verify fixes
4. **Nov 28:** Log results in `docs/ops/ops_run_report.md`

**Expected Result:**
- 51 warnings reduced to ~10 (some may be false positives requiring different handling)
- Scoped lint run passes with updated count
- Pattern documented for other pod teams

---

### Sprint 2: Unused Imports (Dec 1-5) – Target: 150 warnings fixed

**Focus:** Remove imported but unused services/utilities

| File | Unused Import | Count | Fix |
|------|---------------|-------|-----|
| `src/services/ai-service.ts` | `aiIntelligentCache` | 1 | Remove import |
| `src/services/blog-service.ts` | `AIService` | 1 | Remove import |
| `src/services/navigation-service.ts` | `AIService` | 1 | Remove import |
| `src/services/gamification-service.ts` | `AIService` | 1 | Remove import |
| `src/services/parental-service.ts` | `AIService` | 1 | Remove import |
| `src/services/institutional-management/types.ts` | 20+ unused constants | 20 | See "Sprint 3" |

**Action Items:**
1. **Dec 1:** Audit each import – confirm truly unused
2. **Dec 2:** Remove unused imports where safe
3. **Dec 3:** For imports needed by external code, add explicit usage or document exception
4. **Dec 4:** Rerun scoped lint on each file
5. **Dec 5:** Aggregate results

**Expected Result:**
- 6 direct import removals (6 warnings fixed)
- 20+ enum constants handled (Sprint 3)

---

### Sprint 3: Enum Constants & Type Exports (Dec 6-10) – Target: 200+ warnings fixed

**Focus:** Handle unused enum values in types files

**File:** `src/services/institutional-management/types.ts` (50+ constants)

**Strategy:** Enum constants are intentionally exported for API contracts + third-party integrations. Options:
1. **Option A** (Preferred): Add `// @ts-expect-error - exported for API contract` comment above enum
2. **Option B**: Wrap in namespace that's imported somewhere
3. **Option C**: Create a separate `types.ts.exported` file with re-exports

**Implementation:**
- Audit each enum (InstitutionSize, VerificationStatus, etc.)
- Determine if actually used internally
- If unused internally but part of API: add comment
- If truly unused: remove or consolidate

**Action Items:**
1. **Dec 6:** Map all enum usage across codebase (grep for each enum value)
2. **Dec 7-8:** Categorize: "used internally", "API contract", "unused"
3. **Dec 9:** Apply appropriate fix per category
4. **Dec 10:** Verify via lint run

**Expected Result:**
- 30-40 enums documented as API contracts (no fix needed, warning suppressed)
- 10-15 enums consolidated or removed
- Net reduction: 200+ warnings

---

### Sprint 4: Hook Dependencies & Advanced Patterns (Dec 11-15) – Target: 100 warnings

**Focus:** `react-hooks/exhaustive-deps`, refactoring complex handlers

| Rule | Count | Owners | Timeline |
|------|-------|--------|----------|
| `react-hooks/exhaustive-deps` | 36 | Frontend pod | Dec 11-12 |
| `@next/next/no-img-element` | 23 | Landing page pod | Dec 13-14 |
| `@typescript-eslint/no-require-imports` | 22 | Backend pod | Dec 15 |

**Action Items per Rule:**

**Dec 11-12: `react-hooks/exhaustive-deps` (36 warnings)**
- Audit useEffect/useCallback dependencies
- Identify which are legitimately unsafe vs. false positives
- Add useMemo/useCallback wrappers to stabilize dependencies
- Add tests for affected hooks
- Run scoped lint on `src/components` to verify

**Dec 13-14: `@next/next/no-img-element` (23 warnings)**
- Identify all `<img>` tags in landing + help modules
- Replace with `<Image>` from Next.js Image component
- Document exceptions for animation/animated GIFs (if any)
- Run scoped lint on `src/app/help`, `src/app/landing`

**Dec 15: `@typescript-eslint/no-require-imports` (22 warnings)**
- Identify all `require()` statements in backend services
- Migrate to `import` statements
- Adjust Jest mocks if necessary
- Coordinate with schema migration to avoid conflicts
- Full lint pass to confirm

---

## Parallel Execution Track: Automation

### Tooling Maintenance (Continuous)

**`tools/analyze-lint-targets.py`** – Already created
- Keep running daily to identify emerging patterns
- Feed results to pod owners

**`tools/fix-lint-targets.py`** – Template created, expand as needed
- Build safe regex-based fixes for common patterns
- Test against each target file before applying
- Document which fixes are safe (parameter prefixing) vs. risky (import removal)

**Lint Automation in CI** – New task
- Add `LINT_TARGET=src/services bash scripts/run-lint.sh` to CI for each service module
- Create separate lint pass for `src/components` (React warnings)
- Set up dashboard to track warning count by module over time

---

## Success Metrics

### By Dec 5 (Mid-Sprint)
- [ ] Sprint 1 & 2 complete: 50+ warnings fixed
- [ ] `LINT_TARGET=src/services bash scripts/run-lint.sh` shows < 100 warnings
- [ ] Updated ops run report with progress

### By Dec 10 (3/4 Complete)
- [ ] Sprint 1-3 complete: 300+ warnings fixed
- [ ] Global lint run shows < 1,400 warnings
- [ ] No regressions in pilot code paths

### By Dec 15 (Complete)
- [ ] All 4 sprints complete: 450+ warnings fixed
- [ ] Global lint: 1,707 → ~1,250 warnings (26% reduction)
- [ ] Target: < 500 warnings by Dec 22 (holidays break)

---

## Backlog Beyond Dec 15

### Dec 16-22 (Post-Holiday Sprint)
- Continue Sprint 4 followup work
- Consolidate enum exports
- Tackle any emerging patterns

### Jan 2026 (New Year Sprint)
- Target: < 300 warnings (advanced refactoring)
- Pair with code review opportunities
- Integrate lint cleanup into feature development (no new warnings introduced)

---

## Ownership & Escalation

| Pod | Module | Owner | Warnings | Sprint |
|-----|--------|-------|----------|--------|
| AI Services | `src/services/ai-*.ts` | [AI Lead] | 25 | 1-2 |
| Curriculum | `src/services/curriculum-service.ts` | [Curriculum Lead] | 15 | 1 |
| Gamification | `src/services/gamification-service.ts` | [Gamification Lead] | 10 | 1 |
| Institutional Mgmt | `src/services/institutional-management/` | [Inst Mgmt Lead] | 100+ | 2-3 |
| Navigation | `src/services/navigation-service.ts` | [Nav Lead] | 12 | 1 |
| Frontend | `src/components/`, `src/app/` | [Frontend Lead] | 36 + 23 = 59 | 4 |
| Backend | `src/services/` (misc) | [Backend Lead] | 22 | 4 |

**Escalation:** If any pod cannot meet sprint deadline, escalate by start of next sprint to re-prioritize

---

## CI/CD Integration

### Add to `tools/run-all.sh`
```bash
# Scoped lint runs for each pod to track progress
LINT_TARGET=src/services bash scripts/run-lint.sh >> lint-services.log
LINT_TARGET=src/components bash scripts/run-lint.sh >> lint-components.log
# ... parse and log counts to ops report
```

### Dashboard Updates
- Create `docs/ops/lint-sprint-tracking.md` – Updated weekly with progress
- Link to ops run report for each scoped execution
- Highlight any regressions immediately

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Parameter prefixing breaks function signatures | Test all prefixed functions before merge; keep original param count |
| Import removal breaks external dependencies | Audit imports before removal; search for usages across codebase |
| React hook refactoring introduces bugs | Add unit tests; pair with code review |
| Enum consolidation breaks API contracts | Document which enums are public API; version carefully |

---

## Communication Plan

- **Weekly Standups:** Report sprint progress Monday 10:00 AM GMT
- **Mid-Sprint Check-In:** Wednesday 2:00 PM GMT (Dec 5, Dec 12)
- **Sprint Retrospective:** Friday 4:00 PM GMT (Dec 8, Dec 15)
- **Ops Report Update:** Every lint run logged in `docs/ops/ops_run_report.md`

---

**Owner:** Lint Cleanup Coordinator  
**Contact:** [Engineering lead email]  
**Target Completion:** Dec 15, 2025  
**Go-Live Target:** < 500 warnings by Dec 22, 2025
