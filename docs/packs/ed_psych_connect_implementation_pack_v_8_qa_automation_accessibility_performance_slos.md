# EdPsych Connect — Implementation Pack v8
**Author:** AI Dr Patrick (Autonomous)  
**Region:** UK (GB English)  
**Purpose:** Enterprise‑grade QA automation covering E2E, a11y, API, visual, performance & reliability. Includes CI gates, budgets, SLOs, scripts, fixtures, and runbooks. Additive only — preserves previous work.

---

## 0) Test Strategy Overview
- **Layers:** Unit → Integration → API → E2E → a11y → Visual → Performance → Resilience.
- **Pillars:** Reliability (SLOs), Security (baseline scanning), Accessibility (WCAG 2.2 AA), Performance (Core Web Vitals), Data integrity.
- **Environments:** Local → Sandbox → Staging → Production (read‑only probes).
- **Quality Gates:** PR must pass unit+integration+a11y+E2E smoke, size diff ≤ budget, coverage ≥ 80% statements (critical paths 90%).

---

## 1) E2E (Playwright) — `/tests/e2e/`
**1.1 Config** — `playwright.config.ts`
```ts
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  retries: 2,
  reporter: [['html',{ open: 'never' }], ['junit',{ outputFile: 'reports/junit-e2e.xml' }]],
  use: { trace: 'retain-on-failure', video: 'retain-on-failure', baseURL: process.env.E2E_BASE_URL },
  projects: [
    { name: 'chromium' },
    { name: 'firefox' },
    { name: 'webkit' }
  ]
});
```

**1.2 Smoke example** — `teacher_login.spec.ts`
```ts
import { test, expect } from '@playwright/test';

test('teacher can sign in and see cohort heatmap', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Email').fill('alice@oakfield.sch.uk');
  await page.getByLabel('Password').fill(process.env.TEST_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: /Teacher Console/ })).toBeVisible();
  await expect(page.getByTestId('cohort-heatmap')).toBeVisible();
});
```

**1.3 Data seeding helper** — `tests/utils/seed.ts` initialises sandbox users/classes/pupils via API.

**1.4 Flake control** — network idle waits, test isolation, `storageState` for accounts; quarantine file `tests/quarantine.json`.

---

## 2) Component & API Tests
**2.1 Front‑end:** Vitest + React Testing Library — `/tests/ui/`
```ts
import { render, screen } from '@testing-library/react';
import PupilCard from '@/components/PupilCard';

test('renders pupil accessibility toggles', () => {
  render(<PupilCard name="Maya" a11y={{ dyslexia: true }} />);
  expect(screen.getByRole('switch', { name: /dyslexia-friendly font/i })).toBeInTheDocument();
});
```

**2.2 API (Node):** Supertest — `/tests/api/`
```ts
import request from 'supertest';
import app from '@/server/app';

test('POST /teacher/plan validates input', async () => {
  const res = await request(app).post('/teacher/plan').send({ topic: 'Fractions' });
  expect(res.status).toBe(400);
});
```

**2.3 API (Python):** Pytest — `/api/tests/test_mission.py`
```py
from fastapi.testclient import TestClient
from app import app

def test_mission_minimal():
    c = TestClient(app)
    r = c.post('/learn/mission', json={'pupil_id':'p1','topic':'Forces'})
    assert r.status_code == 200
    assert 'scenes' in r.json()
```

---

## 3) Accessibility (WCAG 2.2 AA)
**3.1 Automated checks:** `jest-axe` unit rules, **axe-core** in Playwright; **pa11y-ci** for key routes.

**3.2 Playwright + axe helper** — `tests/a11y/axe.ts`
```ts
import { injectAxe, checkA11y } from 'axe-playwright';
export async function scan(page){ await injectAxe(page); await checkA11y(page, undefined, { detailedReport: true }); }
```

**3.3 Example** — `a11y_home.spec.ts`
```ts
import { test } from '@playwright/test';
import { scan } from './axe';

test('home is accessible', async ({ page }) => {
  await page.goto('/');
  await scan(page);
});
```

**3.4 Keyboard & motion policies:** focus ring visible, tab order documented, `prefers-reduced-motion` honoured, captions required.

---

## 4) Visual Regression
- **Playwright snapshots**: per component/state; tolerances 0.1%.
- Baseline managed per branch; failing diffs uploaded as artefacts.

---

## 5) Front‑end Performance & Budgets
**5.1 Lighthouse CI** — `.lighthouserc.json`
```json
{
  "ci": {
    "collect": { "startServerCommand": "npm run start", "numberOfRuns": 3, "url": ["http://localhost:3000/"] },
    "assert": { "assertions": { "categories:performance": ["error", {"minScore": 0.9}], "first-contentful-paint": ["error", {"maxNumericValue": 1800}], "largest-contentful-paint": ["error", {"maxNumericValue": 2500}], "total-blocking-time": ["error", {"maxNumericValue": 150}], "cumulative-layout-shift": ["error", {"maxNumericValue": 0.1}] } }
  }
}
```

**5.2 Bundlesize** — `package.json`
```json
{
  "scripts": {
    "bundlesize": "bundlesize"
  },
  "bundlesize": [
    { "path": ".next/static/chunks/*.js", "maxSize": "240kb" }
  ]
}
```

---

## 6) Back‑end Load, Soak & Resilience
**6.1 k6 script** — `/tests/perf/k6_plan_api.js`
```js
import http from 'k6/http';
import { sleep, check } from 'k6';
export const options = { vus: 50, duration: '3m', thresholds: { http_req_failed: ['rate<0.01'], http_req_duration: ['p(95)<400'] } };
export default function(){
  const res = http.post(`${__ENV.API}/teacher/plan`, JSON.stringify({ class_id: '2000...', topic:'Fractions', duration_mins: 45 }), { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${__ENV.TOKEN}` } });
  check(res, { 'status is 200': r => r.status === 200 });
  sleep(1);
}
```

**6.2 Chaos/readiness drills** — pod disruption budgets, graceful shutdown (SIGTERM), retry/backoff policy tests.

---

## 7) SLOs, SLIs & Alerts
**7.1 Web SLOs**
- **Availability:** ≥ 99.9% monthly.
- **Latency:** p95 HTML TTFB ≤ 300 ms; API p95 ≤ 400 ms.
- **Error rate:** p99 < 0.1% 5xx.
- **A11y debt:** 0 critical violations on key journeys.

**7.2 Observability**
- **OpenTelemetry** traces across web/API/worker; traceparent propagated.
- **Sentry** (or equivalent): release tagging, source maps, alert routes for safeguarding endpoints.
- **Log schemas:** request_id, user_role, school_id, pii=false flag.

---

## 8) Security Baseline (CI)
- **OWASP ZAP Baseline** against sandbox URL; report uploaded.
- **Dependency Review** and **secret scan** (already in earlier packs) remain mandatory.

---

## 9) CI Workflows — `.github/workflows/`
**9.1 e2e.yml**
```yaml
name: E2E
on: [pull_request]
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build && npm start &
      - run: npx playwright test --reporter=line
      - uses: actions/upload-artifact@v4
        if: always()
        with: { name: playwright-report, path: playwright-report }
```

**9.2 a11y.yml**
```yaml
name: Accessibility
on: [pull_request]
jobs:
  axe:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx pa11y-ci
```

**9.3 perf.yml**
```yaml
name: Performance
on:
  schedule: [ { cron: '0 4 * * *' } ]
  workflow_dispatch:
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx @lhci/cli autorun
  k6:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run k6
        uses: grafana/k6-action@v0.3.1
        with:
          filename: tests/perf/k6_plan_api.js
        env:
          API: ${{ secrets.SANDBOX_API }}
          TOKEN: ${{ secrets.SANDBOX_TOKEN }}
```

**9.4 security.yml** (ZAP baseline)
```yaml
name: OWASP ZAP Baseline
on: [pull_request]
jobs:
  zap:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: zaproxy/action-baseline@v0.10.0
        with:
          target: ${{ secrets.SANDBOX_WEB }}
          cmd_options: '-a'
```

---

## 10) Fixtures & Test Data
- **Users:** teacher, EP, SLT, parent; password in GitHub Actions secrets.
- **Classes & Pupils:** small cohorts across KS1–KS5 with SEN/EAL/PP mixes (seed SQL/JSON).
- **Missions:** KS1–KS5 seeds from packs v5 & v7; attach rubrics.

---

## 11) Runbooks
- **Flaky test triage:** auto‑label, quarantine list, weekly deflake target.
- **Incident drill:** simulate API latency spike; verify alert, auto‑scaling, and SLO error budget burn calculation.
- **Rollbacks:** tagged releases, database migration down‑scripts for non‑destructive changes.

---

## 12) Next Autonomous Steps
- **v9:** Deployment hardening (IaC snippets, WAF rules, backup drills) and training scripts V31–V36.
- Integrate QA dashboards into SLT Ops (test pass rates, a11y debt, perf trends).

