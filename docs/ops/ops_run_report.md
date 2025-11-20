# Ops Run Report

## Purpose
This report captures the output of the key automation runs referenced in the master roadmap so we can confirm the stack remains production-ready. Every execution of the lint pipeline, training video rollout, or sitemap/TOC consistency check should create or append an entry here before the related merge or release milestone.

## Reporting template
Use this structure for each run entry:

- **Date:** YYYY-MM-DD
- **Owner:** @team-member
- **Focus:** `lint` / `training-video` / `help-links` / `toc`
- **Command:** `bash scripts/run-lint.sh` (or equivalent)/`python docs/help_links_check.py`/`python docs/help_build_toc.py`/`npm run video-status` etc.
- **Artifacts:** list generated files such as `lint-report.json`, `docs/ops/lint-severity-summary.json`, CDN URLs, training status doc updates, thumbnails/QA notes.
- **Severity:** Severity 2 count, Severity 1 count, automated regression notes.
- **Next steps:** follow-up task (e.g., triage warning backlog, re-run help-link QA, refresh video thumbnails).

## Lint automation
- Always run `scripts/run-lint.sh` via the shared CI wrapper (`tools/run-all.sh`) so `lint-report.json` and the parsed summary stay fresh for dashboards.
- Feed the severity counts produced by `scripts/parse-lint-report.js` into this report so we can clearly show severity-1 trends while severity-2 stays at zero.
- Treat `lint-report.json` as a per-run artifact; upload it to CI storage alongside any `lint-severity-summary.json` file you create for downstream monitoring.
- Confirm the contents of `lint-summary.txt` (current entry: `severity_counts {"1":1707}` with the same top rules listed in the November 18 run history row) match the parsed report before publishing the run entry so automation status stays tight.

## Training & video releases
- Record every episode from `docs/VIDEO_TUTORIAL_SCRIPTS.md`, upload the MP4 to Synthesia or the agreed CDN, and update `docs/TRAINING_VIDEO_STATUS.md` with the recording + integration timestamp before adding the entry here.
- Include video IDs/URLs, coach marks/titles, and QA notes (thumbnails, accessibility checks) in the `Artifacts` section so the launch team can sign off the release.
- Frame this report entry as the release checkpoint for the video library so the landing page, help center, and training docs remain in sync.

## Scheduled health checks
- Automate `python docs/help_links_check.py` and `python docs/help_build_toc.py` on a weekly cadence; log the results to track regressions.
- Mention broken/updated links, TOC divergences, or blocking errors in the `Next steps` so they are triaged by the docs team.
- If you publish telemetry from these scripts, note the destination (e.g., `docs/ops/docs-health-summary.md`).

## Run history
| Date | Focus | Severity 2 | Severity 1 | Notes |
|------|-------|------------|------------|-------|
| 2025-11-20 | lint (tools/run-all.sh) | 0 | 669 | Run blocked by `--max-warnings=0`; top rules: no-unused-vars (669) |
| 2025-11-18 | lint (tools/run-all.sh) | 0 | 0 | Top rules: No warnings. |
| 2025-11-18 | lint (`LINT_TARGET=src/lib/services`) | 0 | 0 | Confirmed `src/lib/services` emits zero warnings; artifacts feed `docs/ops/lint_cleanup_status.md` and the service cleanup section. |
| 2025-11-18 | lint (tools/run-all.sh) | 0 | 1707 | `lint-report.json` + `lint-summary.txt` uploaded (`no-unused-vars` 1518, `react/no-unescaped-entities` 56, `react-hooks/exhaustive-deps` 36, `@next/next/no-img-element` 23, `@typescript-eslint/no-require-imports` 22). EHCP export telemetry logging now writes to `logs/forensic-events.log`; new `docs/ops/forensic_report.md` and `docs/ops/ehcp_export_qa.md` capture the workflow/QA checklist. |
| 2025-11-18 | lint (`LINT_TARGET=src/lib/tokenisation`) | 0 | 0 | Tokenisation pilot lint pass ensures `treasury` and `rewards` services stay telemetry-ready; artifacts feed `docs/ops/lint_cleanup_status.md` and link back to `docs/ops/tokenisation_pilot_plan.md`. |
| 2025-11-18 | lint (`LINT_TARGET=src/lib/tokenisation`) (rerun) | 0 | 0 | Confirmed zero warnings after the latest pilot iteration; all artifacts uploaded to ops storage so the trace-ready stack can be audited by finance/legal. |
| 2025-11-18 | lint (analysis + targeting) | 0 | 1707 | Executed comprehensive analysis: 1,518 `no-unused-vars` primarily in `src/services` (AI, gamification, curriculum, institutional-management) and enum constants in types.ts. Strategy: prefix function parameters with `_`, document intentional exports in types.ts with eslint-disable comments, and apply targeted fixes batch-by-batch per module ownership. Artifacts: `tools/analyze-lint-targets.py` and `tools/fix-lint-targets.py` created for ongoing automation. |

Every row reflects the `lint-report.json` artifact created by `scripts/run-lint.sh` and the severity summary published in `lint-summary.txt`; keep both files alongside this report so we can trace the precise warning counts and top rules (as encoded on November 18) when reviewing the cleanup plan.

## Triage sequence & roadmap alignment
- **Step 1:** `scripts/run-lint.sh` finishes and `lint-severity-summary.json` is uploaded. Attach the summary to `docs/ops/lint_playbook.md` and link the parsed top rules in the weekly ops run report entry.
- **Step 2:** Ops triage owners create focused follow-on items using `docs/ops/lint_warning_backlog.md` (and link to `docs/ops/cleanup_plan.md` or `snity-check.md` for additional context) so each rule tracks owner, mitigation steps, and target dates; then update the “Lint cleanup” column on the master roadmap (e.g., `docs/MIGRATION_PROGRESS.md`) with the new target date.
- **Step 3:** Engineering/content owners execute the remediation, re-run `scripts/run-lint.sh` for the impacted subset, and note the severity improvements in this report’s “Run history.”
- **Step 4:** Roadmap sync call (weekly) confirms the lint bucket summary, captures blockers, and reprioritizes the next rule/owner pair so `Top warning rules cleanup` stays in the roadmap notebook.
- **Step 5:** Ops run report now references the ticket list or doc listing (see `docs/ops/cleanup_plan.md` and `docs/ops/lint_warning_backlog.md`) to show completion percentage and remaining owner assignments.

## Example entry (add this at the top of the file after each run)
| Date | Focus | Severity 2 | Severity 1 | Notes |
|------|-------|------------|------------|-------|
| 2025-11-17 | lint | 0 | 12 (`no-unused-vars`) | `lint-report.json` uploaded; backlog items filed in `snity-check.md`. |

## Next actions
- After every lint run, paste the severity counts + top rules into this report and notify the QA dashboard.
- When video recordings land, append a `training-video` entry with the CDN links, QA status, and ops release notes.
- Keep this doc in sync with `docs/ops/lint_playbook.md` and the master roadmap so the automation story stays coherent.