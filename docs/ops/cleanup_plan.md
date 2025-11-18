# Lint cleanup triage plan

## Purpose
This document captures the triage sequence that keeps the `Top warning rules cleanup` effort tied directly to the ops run report and roadmap. Use it as a lightweight checklist or ticket list template so owners can log each mitigation, chronology, and dependency while the cleanup effort progresses autonomously.

## Current status
- Latest lint run (November 18) still reports 1,707 severity-1 warnings with `no-unused-vars` at 1,518 occurrences, followed by `react/no-unescaped-entities`, `react-hooks/exhaustive-deps`, and the other rules listed in `docs/ops/ops_run_report.md`. Keep this as the baseline until the backlog update reduces the counts and the ops report row changes accordingly.
- A targeted `LINT_TARGET=src/types` execution now shows zero warnings for the shared helper types after converting the enums into const unions; the new ops report entry documents this localized success so we can prove the scoped fix before moving to the next rule bucket.
- Shared helper types (`src/types/index.ts`) were refactored from `enum` declarations into `const` objects with derived unions so the same values stay available without triggering `no-unused-vars`; next step is to run `LINT_TARGET=src/types` and capture the new summary before moving to the next rule.

## Triage flow
1. **Lint run finish:** `scripts/run-lint.sh` generates `lint-report.json`, `lint-summary.txt`, and severity summaries via `scripts/parse-lint-report.js`. Link the new files into `docs/ops/ops_run_report.md` immediately so the report reflects the latest execution and severity counts (see the `Run history` table for the November 18 entry with 0 severity-2 and 1707 severity-1 warnings).
2. **Owner assignment:** Create or update a triage ticket (e.g., in `docs/ops/cleanup_plan.md`, `snity-check.md`, or the roadmap’s lint column within `docs/MIGRATION_PROGRESS.md`). Include rule name, owner(s), mitigation steps, and the target sprint/milestone date. Record blockers such as downstream schema work or localization coordination.
3. **Mitigation & verification:** Owners execute the fix, re-run `scripts/run-lint.sh` (optionally scoped via `LINT_TARGET`) to prove the warning count decreases, and upload the refreshed artifacts. Update this document’s table to show progress and remedial links.
4. **Ops reporting:** After severity counts improve, note the change in `docs/ops/ops_run_report.md` and the roadmap’s lint-priority column, keeping the run report’s “Notes” field tied to this plan or the ticket ID.
5. **Roadmap sync:** During the weekly roadmap sync, reviewers confirm the next rule to tackle, shift ownership if needed, and document remaining work (percentage complete) inside this plan, the run report, or the master roadmap (e.g., `docs/MIGRATION_PROGRESS.md`).

## Ownership tracker
| Rule | Owner | Mitigation | Target date | Current status | Notes |
|------|-------|------------|-------------|----------------|-------|
| `no-unused-vars` | Engineering | Remove unused exports, use `_` prefixes, re-run scoped lint | Nov Week 4 | Backlog | Prioritize files shipping in next sprint and verify via `LINT_TARGET` runs |
| `react/no-unescaped-entities` | Content + Frontend | Escape punctuation, lean on localized copy helpers, QA review translations | Dec Week 1 | Backlog | Capture copy approvals inside the ticket to avoid rinse/repeat |
| `react-hooks/exhaustive-deps` | Engineering | Audit hook dependencies, stabilize with `useMemo`/`useCallback`, add tests | Dec Week 1 | Backlog | Pair with hooking squad to absorb new dependency patterns |
| `@next/next/no-img-element` | Platform | Replace with `<Image>`/helper wrapper, enforce width/height props | Dec Week 2 | Backlog | Document approved exception for animation assets requiring `<img>` |
| `@typescript-eslint/no-require-imports` | Backend | Migrate services to `import`, align `tsconfig`, keep mocks working | Jan Week 1 | Backlog | Coordinate with schema migration push to avoid regression |

## Automation check-in
- Confirm the latest lint run generated `lint-summary.txt` with severity counts (current file shows `severity_counts {"1":1707}` and the same top rules listed in `docs/ops/ops_run_report.md`).
- Ensure `scripts/run-lint.sh` remains the canonical automation; call it from CI/pipeline wrappers and the weekly obs run so we always have fresh JSON artifacts before writing this plan or the run report.
- Reference `docs/ops/lint_warning_backlog.md` when creating follow-up tickets or owner handoffs so the top five rules share a single tracking surface with owners, counts, and target dates.
- Keep `docs/ops/lint_cleanup_status.md` current so it captures the automation snapshot and next steps for statewide reviews.
- If any warning emerges as a blocker again, circle back through this document to update status, note the reopened run artifact, and sync with the roadmap column for visibility.

## Next cleanup wave (Nov 18 - Nov 24)

- **Focus areas:** `src/research/foundation` (grant proposals/models), `src/lib/services`, and the shared helpers flagged by `snity-check.md`. These modules still contain many of the `no-unused-vars` warnings, so clean them in parallel with EHCP and training delivery work.
- **Step 1:** For each affected directory, run scoped lint commands (`LINT_TARGET=src/research/foundation bash scripts/run-lint.sh`, `LINT_TARGET=src/lib/services bash scripts/run-lint.sh`) to emit fresh `lint-report.json` artifacts. Capture the `severity_counts` in `lint-summary.txt` and refer to the ops run report entry that lists the rule counts after the targeted run.
- **Step 2:** Apply the `_prefixed` naming pattern, remove unused destructuring, and add lightweight helper usages so none of the targeted files trigger `no-unused-vars`. Where removal is not possible, document the rationale in `docs/ops/lint_warning_backlog.md` and keep the relevant entry updated.
- **Step 3:** After each cleanup batch, rerun `bash tools/run-all.sh` (via the CI wrapper) so `lint-report.json` is refreshed globally; update this plan’s `Current status` section plus the run report row to show the new severity counts so stakeholders can see the progress.
- **Step 4:** Use the `docs/ops/lint_cleanup_status.md` log to highlight when the service bundle or research foundation batch completes, including the next targeted directory or rule. Connect these notes to the `snity-check.md` backlog to keep the research deliverables visible in the roadmap.
- **Step 5:** Schedule a checkpoint with the lint ownership squad during the weekly roadmap sync to validate that the next rule (e.g., `react-hooks/exhaustive-deps` or `@next/next/no-img-element`) is ready to be tackled in the following sprint, keeping the backlog moving steadily toward zero warnings.
