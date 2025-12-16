RUN-2025-12-16-01 — Production re-probe (post-push, pre/post-deploy)

Purpose
- Re-run production smoke checks for public URLs that must remain root-scoped (robots/sitemap) and for legacy auditor checklist paths.

How to run (PowerShell)
- From repo root:
  - pwsh -NoProfile -ExecutionPolicy Bypass -File tools/probe-prod-urls.ps1 -RunId RUN-2025-12-16-01

Evidence files
- prod-public-urls-*.json

Notes
- Do not overwrite previous evidence files; generate a new timestamped JSON per probe.
