# Code Classification Audit — Draft

> Populate as you confirm via the GitHub connector. This structure is ready for findings.

## System Overview
- **Front-end**: Next.js (app directory), MDX enabled, Vercel-hosted
- **Back-end**: Next API routes/functions (tbd), Node 20 baseline
- **Data stores**: Postgres (core), Redis (cache/queues), MongoDB (document content), Neo4j (relationships)
- **Infra**: Vercel (preview/canary); GitHub Actions (CI)

## Front-end Modules
- **/app/(marketing)/landing-legacy/page.mdx** — renders hero/logo, imports `content/legacy/bio.md`
- **/public/images/legacy/** — statically served assets
- **MDX config** — `apps/web/next.config.mjs` with MDX support
- **A11y** — pa11y-ci target pages

### Risks/Actions
- [ ] Confirm image alt text breadth (non-decorative images)
- [ ] Keyboard focus order and visible focus states on landing page
- [ ] Colour contrast rules verified (WCAG 2.2 AA)

## Back-end & Services
- **API routes**: _tbd from repository scan_
- **Auth**: _tbd_
- **Validation**: _tbd_

### Risks/Actions
- [ ] Input validation schema catalogue (Zod/Valibot/JSON Schema?)
- [ ] Rate limiting and authz checks mapped to endpoints

## Databases
- **Postgres** — core entities (users, orgs, sessions?)
- **Redis** — caching/queues for training automation
- **MongoDB** — training/help documents
- **Neo4j** — practitioner–school–case relationships

### Risks/Actions
- [ ] ERD snapshots for each store (export + docs)
- [ ] Data retention & DPIA links

## Cross-Cutting
- **Observability**: _tbd (logs/metrics/trace)_
- **Security**: Dependency review, SCA in CI
- **Docs**: `docs/ops/legacy_code_audit.md` will host final tables

## Compliance
- **WCAG 2.2 AA** — automated checks via pa11y + manual keyboard/AT pass list
- **UK spelling/terminology** — PR linting and review checklist
- **PII/Safeguarding** — ensure redaction in logs; DPIA links in docs
