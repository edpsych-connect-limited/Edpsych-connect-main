EdPsych Connect: legacy asset remap + landing hardening (v0.9.9-legacy-integration)

Base: main
Compare: feat/legacy-full-ingest

Summary

Completes the legacy asset import and wiring for Beta prep. Imports images and markdown, adds a temporary legacy landing page, fixes large-file history, and adds guardrails so .zip archives are ignored going forward.

Changes (this PR)

Imported legacy assets into the monorepo:

/apps/web/public/images/legacy/**

/content/legacy/bio.md (+ long-tail MD under /content/legacy/md/**)

/site/landing-legacy.html (temporary)

.gitignore: ignore _imports/*.zip

Removed _imports/legacy_archive.zip from branch history (GitHub 100 MB limit)

Updated mapping logs:

docs/ops/legacy_mapping.csv

docs/ops/legacy_code_audit.md (re-built from current repo state)

Evidence (local verify)

Images in /images/legacy: ~61

content/legacy/bio.md: present

site/landing-legacy.html: present

docs/ops/legacy_mapping.csv: has source→destination rows

How reviewers can test (no special setup)

npm install && npm run build && npm start

Visit /landing-legacy (if MDX route is added in a follow-up) or open site/landing-legacy.html directly.

Spot-check images resolve from /images/legacy/**.

Confirm .gitignore contains _imports/*.zip.

Security & privacy

No secrets committed; env files and archives ignored.

Large binary ZIP removed from Git history.

Risks / mitigations

Large volume of legacy MD → contained under /content/legacy/md/**; follow-up will curate a publishable subset.

Temporary HTML landing page → follow-up replaces with MDX page tied to bio.md.

Rollback

Revert this PR (no schema migrations included).

Follow-ups (separate PRs)

MDX landing route that imports content/legacy/bio.md.

CI hardening: lint / test / build / pa11y (WCAG 2.2 AA) / dependency review.

Content curation: move non-publishable MD to an archive/ folder.

Canary deploy to Vercel once CI is green.

Labels

type:chore, area:legacy, release:candidate
