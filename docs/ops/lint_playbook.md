# Lint Playbook

## Purpose
This playbook captures the automated lint path that keeps EdPsych Connect predictable and self-healing. Every pull request, CI job, and local verification build should follow the same steps so the codebase never regresses in type safety, React hook discipline, or shared tooling expectations.

## Core commands

### `npm run lint`
- Executes `eslint . --max-warnings=0` according to `eslint.config.js`.
- Always run this command from the workspace root and set `CI=1` when running inside automation pipelines.
- The script now uses our flat configuration so the CLI is consistent with `next lint` experience without spawning the interactive setup prompt.

### `scripts/run-lint.sh`
- Wraps the lint command so automation can run it end-to-end:
  1. Executes `CI=1 npm run lint -- --format json -o lint-report.json` to produce a machine-readable artifact.
  2. Runs `node scripts/parse-lint-report.js` to summarize the severity counts + top rules.
  3. Leaves `lint-report.json` and the parsed summary in the workspace for follow-on reporting or dashboards.
- The script honors `LINT_TARGET` (default `.`) so CI jobs or local diagnostics can focus on a subset when investigating regressions without editing the script.
- This script is the one to call from CI pipelines, service wrappers (e.g., `tools/run-all.sh`), and periodic scheduled jobs.

### `tools/run-all.sh`
- Simple wrapper that runs `bash scripts/run-lint.sh` from the workspace root while preserving `set -eo pipefail` semantics.
- Use this entrypoint in automation dashboards, CI/CD tasks, or ops runbooks so lint artifacts (`lint-report.json`, `lint-summary.txt`) are regenerated in a repeatable, documented way.

## Automation checklist
1. **CI gating:** All merge jobs must call `scripts/run-lint.sh` (or `CI=1 npm run lint -- --format json -o lint-report.json` directly) before executing tests. Treat the generated `lint-report.json` as a pre-condition for deployment and store it as an artifact when possible.
2. **Self-service runs:** Add `scripts/run-lint.sh` to any helper workflows (runbooks, pre-commit hook templates, or ops dashboards) instead of retyping the CLI flags.
3. **Reporting:** Post the `parse-lint-report.js` output to `docs/ops/ops_run_report.md` or the forensic run report so the team can monitor the number of warnings and ensure severity‑2 hits stay at zero.
4. **Alerting:** Fail the job immediately if severity‑2 warnings appear (the `--max-warnings=0` flag enforces this). Treat severity‑1 warnings as signals to triage quickly rather than suppressing them wholesale.

## Severity governance
- **Severity 2:** Errors – these must be zero. Any new parser error, `react-hooks/rules-of-hooks`, or rule such as `@typescript-eslint/no-require-imports` is a blocker until it is resolved.
- **Severity 1:** Warnings such as `no-unused-vars` and `react/no-unescaped-entities` are allowed only with documented exceptions. Keep the count dropping sprint over sprint by trimming the `snity-check.md` backlog, aligning `react/no-unescaped-entities` to our curated `forbid` list, and favoring `_`‑prefixed unused args instead of disabling rules globally.
- **Configuration exceptions:** The playbook documents why we keep `react/no-unescaped-entities` permissive, why `@typescript-eslint/no-require-imports` is still `warn`, and how to use `_prefixed` arguments, so every developer can make safe trade-offs without creating adhoc suppressions.

## Next actions
1. Add `scripts/run-lint.sh` to the `tools/run-all.sh` workflow or your CI pipeline so linting stays fully automated.
2. Share the lint summary output in `docs/ops/ops_run_report.md` after each run so our automation remains transparent and self-aware, and confirm the raw `lint-summary.txt` severity counts match the parsed summary before publishing.
3. Keep `docs/ops/cleanup_plan.md` synchronized with this playbook so owners can follow the triage + roadmap flow when attacking the top warning rules.
4. Update this playbook whenever new lint rules are enabled or when we adjust severity thresholds.
5. Reference `docs/ops/lint_warning_backlog.md` when assigning rule owners or updating follow-up tickets so the backlog, ops run report, and cleanup playbook all share the same target dates and mitigation notes.

## Cleanup plan for top warning rules
| Rule | Status | Lead | Approach | Target | Notes |
|------|--------|------|----------|--------|-------|
| `no-unused-vars` | High volume across shared helpers and research enums | Engineering | Remove unused exports, prefix intentional placeholders with `_`, and re-run `scripts/run-lint.sh` scoped via `LINT_TARGET` for touched directories | Nov Week 4 | Treat as blocker for files shipping in next sprint |
| `react/no-unescaped-entities` | Common in copy-heavy help/training components | Content + Frontend | Escape literals or wrap with localized content helpers; QA guardrails on translations to avoid reintroducing violations | Dec Week 1 | Coordinate with copy desk before merging |
| `react-hooks/exhaustive-deps` | Signals detected in intervention hooks | Engineering | Audit dependencies, add helpers/`useMemo` to stabilize references, add tests around effects | Dec Week 1 | Pair with existing hook ownership squads |
| `@next/next/no-img-element` | Legacy landing/help articles still using `<img>` | Platform | Swap to Next.js `<Image>` or wrap in vetted helper component, verify required attrs, and re-run `npm run lint -- src/components/landing` | Dec Week 2 | Document approved exception for animation assets |
| `@typescript-eslint/no-require-imports` | Legacy server helpers | Backend | Convert `require()` calls to `import`, update `tsconfig`, and ensure mocks are compatible before the backlog sprint | Jan Week 1 | Align fix with schema migration pushes |

### Execution notes
- Schedule 1–2 day sprints per rule, with the owner updating `docs/ops/ops_run_report.md` after each successful lint run to show warnings falling.
- Record any justified suppressions in this playbook, referencing the file and reasoning so future triage stays transparent.
- After each rule batch, run `scripts/run-lint.sh --format json -o lint-report.json` and attach the summary to the ops run report so roadmap stakeholders see progress on the cleanup track.