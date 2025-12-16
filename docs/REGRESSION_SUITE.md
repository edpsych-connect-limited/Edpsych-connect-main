# Regression Suite (How we prove it’s shippable)

This repo uses **TypeScript + ESLint + Next build + Cypress E2E** as the release gate.

## Gates (must be green)

### 1) Static quality gates

- Type-check:
  - `npm run type-check`
- Lint:
  - `npm run lint`
- Production build:
  - `npm run build`
  - If you hit a stale build lock or Windows `EPERM` around `.next_build`, run:
    - `npm run build:clean`

### 2) E2E gates

There are many specs in `cypress/e2e/`. For release readiness we define:

- **Smoke suite** (fast, blocks obvious regressions)
- **Full regression** (slower, intended for pre-release/CI nightly)

## How to run

### One-command release gate

Runs the full shippable pipeline in the correct order (lint → type-check → clean build → start production server → smoke → regression):

- `npm run gate:release`

### Smoke suite

Runs a small set of high-signal specs:

- `cypress/e2e/sanity.cy.ts`
- `cypress/e2e/auth.cy.ts`
- `cypress/e2e/parent-portal.cy.ts`

Command:

- `npm run test:e2e:smoke`

### Full regression

Runs a curated, high-coverage Cypress suite (excluding debug/a11y-only specs):

- `npm run test:e2e:regression`

Runs the full Cypress suite (includes everything under `cypress/e2e/`):

- `npm run test:e2e`

### Optional: Accessibility audit

Runs the `cypress-axe` audit spec:

- `npm run test:e2e:a11y`

## Interpreting failures

- Prefer failures that point to **user-visible behavior** (UI copy, redirects, access control) over brittle DOM selectors.
- If an API change affects UI messages, update tests to assert on stable semantics (status codes, error keys) or make the UI message deterministic.

## Adding new coverage

When adding a new feature or fixing a bug:

1. Add a Cypress spec (or expand an existing one) that reproduces the scenario.
2. Ensure it runs deterministically in CI (seeded data, stable selectors, minimal timing assumptions).
3. If it’s a release-critical flow, include it in the smoke suite.
