# EdPsych Connect: legacy asset remap + landing MDX + CI hardening (v0.9.9-legacy-integration)

**Base**: `main`  
**Compare**: `feat/legacy-full-ingest`

## Summary
This PR completes the enterprise-grade ingest of legacy assets and wires them into a modern content/MDX flow. It adds CI gates (lint, test, build, a11y, dependency review), ensures WCAG 2.2 AA checks run on key routes, and prepares the canary rollout to Vercel.

## Changes
- Remap legacy **images/HTML/MD** into the monorepo structure
- Add **Landing MDX** page that imports `content/legacy/bio.md`
- Commit **mapping logs**: `docs/ops/legacy_mapping.csv` + `legacy_code_audit.md`
- Introduce **CI workflow**: lint / test / build / a11y / dependency review
- Add **pa11y-ci** config targeting `/` and `/landing-legacy`
- Conventional commit and PR template for future maintenance

## Rationale
- Ensures continuity of your two‑year legacy work with auditable mapping and minimal drift.
- Moves the legacy landing into the same deployment and analytics surface as the main site.
- Establishes non-negotiable gates for quality, accessibility, and security from this PR forward.

## Implementation Notes
- PowerShell remap script: `tools/rescan-map.ps1` (idempotent; logs to CSV + MD)
- MDX route: `apps/web/app/(marketing)/landing-legacy/page.mdx` (Next.js 14/15-compatible)
- Images resolved under `/images/legacy/*` with stable import paths
- CI uses Node 20 and runs pa11y after build; pa11y targets can be expanded later

## Screenshots
_(add before/after hero/logo and a11y report snippets once canary is live)_

## Testing
1. Run remap locally and ensure non-zero asset count  
2. `npm run build` succeeds without type errors  
3. `npm start` → verify `/landing-legacy` renders hero, logo, and `<Bio />`  
4. `npx pa11y-ci` passes (or see PR annotations if failing)

## Rollout
- Vercel preview on PR open  
- Canary promotion after CI green  
- Monitor: 24h; roll back via Vercel if anomalies detected

## Checklist
- [ ] Assets mapped (non-zero count in `apps/web/public/images/legacy`)  
- [ ] `content/legacy/bio.md` present and imported in MDX  
- [ ] CI green: lint / test / build / a11y / deps  
- [ ] WCAG 2.2 AA checks pass on `/` and `/landing-legacy`  
- [ ] UK spelling & terminology  
- [ ] No PII in logs; secure defaults upheld

## Conventional Commits
```
chore(legacy): remap images/html/md — 2025-11-06T23:42:07Z
feat(landing): add MDX landing wired to legacy bio
ci: add lint/test/build/a11y/dependency-review workflows
docs(ops): add mapping report and audit
```

## Release Notes
**v0.9.9-legacy-integration**  
- Legacy asset ingestion and MDX landing complete  
- CI hardening and accessibility checks enforced  
- Canary-ready build for beta

## Command Snippets (optional)

### Create PR with GitHub CLI
```powershell
# from C:\EdPsychConnect
gh pr create ^
  --base main ^
  --head feat/legacy-full-ingest ^
  --title "EdPsych Connect: legacy asset remap + landing MDX + CI hardening (v0.9.9-legacy-integration)" ^
  --body-file .github/pull_request_template.md
```

### Validate remap results in CI logs
```powershell
(Get-ChildItem "C:\EdPsychConnect\apps\web\public\images\legacy" -Recurse | Measure-Object).Count
Get-Content "C:\EdPsychConnect\docs\ops\legacy_mapping.csv" | Select-Object -First 5
```

### Evidence to Attach in PR
- Mapping count + first lines of `legacy_mapping.csv`  
- Screenshot of `/landing-legacy` (desktop + mobile widths)  
- Pa11y report excerpt with zero critical violations  
- Dependency review summary
