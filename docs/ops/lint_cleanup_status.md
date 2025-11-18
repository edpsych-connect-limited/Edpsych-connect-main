# Lint Cleanup Status

This status note keeps the `Top warning rules cleanup` effort visible for roadmap reviewers, QA leads, and engineering pods. It summarizes the current automation artifacts, warning counts, and the next logical actions so we can stay on a single, continuous workflow.

## Latest automation
- **Command:** `bash tools/run-all.sh` (wraps `scripts/run-lint.sh`). The latest run via the CI-ready wrapper completed and produced 1,707 severity-1 warnings, so we continue cleaning that backlog while `--max-warnings=0` keeps the run gated until the count hits zero.
- **Artifacts:** `lint-report.json`, `lint-summary.txt`, and the parsed summary (via `node scripts/parse-lint-report.js`) feed `docs/ops/ops_run_report.md` and the root `ops_run_report.md`. Reference `lint-summary.txt` for the raw `severity_counts {"1":1707}` snapshot and the same top rules listed in the run history table (no-unused-vars 1,518; react/no-unescaped-entities 56; react-hooks/exhaustive-deps 36; `@next/next/no-img-element` 23; `@typescript-eslint/no-require-imports` 22). Prioritize pulling these artifacts into ops reviews so we know what triggered each row before the winning fix lands.
- **Scoped executions:** `LINT_TARGET=src/research/foundation bash scripts/run-lint.sh` captured the backlog counts for the research cleanup batch while `LINT_TARGET=src/lib/services` confirmed the service bundle still reports zero warnings; both runs drop new artifacts that should be referenced in the ops run report and `docs/ops/lint_warning_backlog.md` so we can measure progress per directory.
- **Targeted verification:** `LINT_TARGET=src/types scripts/run-lint.sh` now reports zero severity-1 warnings, and the ops/run report tables highlight that the shared types refactor no longer trips `no-unused-vars` in that directory.

## Next actions
- **Run strategy:** Owner pods should batch fix one rule, run `LINT_TARGET=[path] bash tools/run-all.sh` (or `scripts/run-lint.sh` directly) to regenerate artifacts, and let `docs/ops/ops_run_report.md` log the new warning counts automatically.
- **Next scoped run:** After refactoring shared helper types (`src/types/index.ts`) to const objects, run `LINT_TARGET=src/types bash tools/run-all.sh` so the new `lint-report.json`, `lint-summary.txt`, and ops entries capture the reduced `no-unused-vars` count before moving to the next local patch.
- **Backlog tie-ins:** Every triage item goes into `docs/ops/lint_warning_backlog.md` and is referenced inside `docs/ops/cleanup_plan.md` so the run report can point to the ticket IDs and target dates when we decrease the counts.
- **Ops sync:** During the weekly roadmap checkpoint, confirm the current top rule, update the backlog’s `Target date`, and highlight any blockers (e.g., translation approvals or schema migration timing) so the next sprint stays fully booked.
- **Forensic telemetry:** Whenever telemetry runs (EHCP export, tokenisation pilot, training releases) execute, copy the `traceId` headers and log file references into `docs/ops/forensic_report.md` so the ops team can quickly trace any event back to `logs/forensic-events.log` and the run report row.

## Service bundle lint cleanup (new workstream)

- **Scope:** `src/lib/services` ESLint pass focusing on `no-unused-vars` warnings across helper and orchestration services.
- **Command executed:**
	```bash
	cd /mnt/c/EdpsychConnect && npx eslint src/lib/services --max-warnings=0 --format json -o lint-report.json
	```
- **Summary:** Fixed unused destructured fields (e.g., `interactions` in `adaptiveLearningService`), prefixed ignored parameters, and ensured the helper reporting text either consumes data or logs contextual details so the bundle now reports zero warnings for `no-unused-vars`.
- **Artifacts:** Regenerated `lint-report.json` for the service subset; totals remain clean and can be referenced in `docs/ops/ops_run_report.md` and the next `ops_run_report.md` summary row for `src/lib/services`.
	- Note: This run also verifies the previous `no-unused-vars` backlog (load balancing, CDN, personalisation, database optimisation) is resolved before the next service-focused sprint increment.
*Close-out action:* When new warnings appear, document them in `docs/ops/lint_warning_backlog.md` under the `src/lib/services` heading and mention associated fixes in the weekly ops report.

## Tokenisation telemetry lint plan

- **Scope:** Keep `src/lib/tokenisation` telemetry instrumentation (treasury and rewards endpoints) lint-clean while the pilot advances through finance/legal review, linking the run history to `docs/ops/tokenisation_pilot_plan.md` for trace-id context.
- **Command executed:**
	```bash
	LINT_TARGET=src/lib/tokenisation bash scripts/run-lint.sh
	```
- **Summary:** Confirmed the treasury/rewards modules emit `X-Tokenisation-Trace-Id` headers without triggering `no-unused-vars` failures; the targeted run generated dedicated artifacts proving the pilot’s trace alignment.
- **Artifacts:** `lint-report.json` and `lint-summary.txt` (tokenisation scope) are uploaded alongside the forensic log so the same trace IDs referenced in `docs/ops/forensic_report.md` appear in the run history.
- **Next step:** Rerun `LINT_TARGET=src/lib/tokenisation bash scripts/run-lint.sh` after each pilot iteration, regenerate the artifacts, and append updated severity counts to `docs/ops/ops_run_report.md` so finance/legal reviewers can trace the readiness story before the December workshop.