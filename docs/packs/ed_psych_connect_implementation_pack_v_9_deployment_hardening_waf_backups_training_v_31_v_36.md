# EdPsych Connect — Implementation Pack v9
**Author:** AI Dr Patrick (Autonomous)  
**Region:** UK (GB English)  
**Purpose:** Production‑hardening: infra‑as‑code (IaC), Web Application Firewall (WAF), secrets & SBOM, backup/restore drills for Postgres/Redis/Mongo/Neo4j, disaster recovery (RPO/RTO), and **training videos V31–V36**. Additive only — preserves prior work.

---

## 0) Target Context
- **Web**: Vercel (Next.js/Edge).  
- **Datastores**: Railway Postgres, Redis, MongoDB Atlas, Neo4j Aura (or managed Neo4j).  
- **Security stance**: Zero‑trust, least privilege, encryption in transit + at rest, signed artefacts, immutable backups.

---

## 1) Reference Architecture — Hardened Edge
**Folder:** `docs/DEPLOY/architecture-hardened.md`
- **Cloudfront/Cloudflare** in front of **Vercel** (choose one provider):
  - TLS ≥ 1.2, HSTS (preload), OCSP stapling, ALPN.  
  - WAF managed rules (OWASP Core, Bot/Anomaly), custom rules for `/api/*` and auth endpoints.  
  - Rate‑limits: `60 req/min/IP` for unauthenticated, `600 req/min/user` authenticated; burst controls.
- **Vercel Edge Middleware**:
  - Geo/IP allowlists for admin routes.  
  - Security headers (CSP, COOP/COEP/CORP, Referrer‑Policy, Permissions‑Policy).  
  - Signed cookies for session binding.
- **API**:
  - Node (Express/Fastify) and/or FastAPI behind WAF.  
  - JWT with key rotation (JWKS), short‑lived access tokens, refresh via rotating refresh tokens, audience/issuer checks.  
  - OpenTelemetry traces; structured logs with pii=false tag.

---

## 2) IaC — Minimal, Composable
**Folder:** `iac/terraform/`

### 2.1 Providers & State — `main.tf`
```hcl
terraform {
  required_version = ">= 1.8"
  backend "s3" {
    bucket = var.tf_state_bucket
    key    = "edpsych/terraform.tfstate"
    region = var.aws_region
    dynamodb_table = var.tf_lock_table
    encrypt = true
  }
  required_providers {
    cloudflare = { source = "cloudflare/cloudflare", version = ">= 4.0" }
    vercel     = { source = "vercel/vercel", version = ">= 0.13" }
  }
}

provider "cloudflare" { api_token = var.cloudflare_api_token }
provider "vercel"     { api_token = var.vercel_api_token }
```

### 2.2 Cloudflare WAF & Rate Limit — `waf.tf`
```hcl
resource "cloudflare_ruleset" "waf" {
  zone_id = var.zone_id
  name    = "edpsych-waf"
  kind    = "zone"
  phase   = "http_request_firewall_custom"
}

resource "cloudflare_rate_limit" "api_rl" {
  zone_id = var.zone_id
  threshold = 60
  period    = 60
  match {
    request {
      methods = ["GET","POST","PUT","DELETE"]
      schemes = ["HTTPS"]
      url_pattern = "*/api/*"
    }
  }
  action {
    mode = "ban"
    timeout = 300
  }
  description = "Rate limit unauthenticated API calls"
}
```

### 2.3 Security Headers (Vercel) — `vercel.json`
```json
{
  "headers": [
    { "source": "/(.*)", "headers": [
      { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
      { "key": "Content-Security-Policy", "value": "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' https:" },
      { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
      { "key": "Permissions-Policy", "value": "geolocation=(), microphone=(), camera=()" }
    ]}
  ]
}
```

---

## 3) Secrets, SBOM & Signatures
**Folder:** `docs/SECURITY/secrets-sbom-signing.md`
- **Secrets**:
  - `.env.example` with placeholders only.  
  - Vercel/CI: project‑scoped env vars; never commit secrets.  
  - Rotation policy: 90 days; instant rotation on incident; JWKS endpoint for JWT key rotation.  
- **SBOM**: CycloneDX (`npm run sbom` using `@cyclonedx/cyclonedx-npm`), attached to releases.  
- **Signing**: Git commit signing + provenance via GitHub OIDC to your registry; artefact attestation (SLSA level 2+ where feasible).

---

## 4) Backups & Restore Drills
**Folder:** `docs/DEPLOY/backups-restore.md`

### 4.1 Postgres (Railway)
- **Backup:** daily logical dumps (pg_dump) + weekly base + WAL archiving where available.  
- **Restore drill:** quarterly — spin ephemeral db, `pg_restore`, run integrity checks (row counts, referential constraints, sample semantic checks).  
- **RPO/RTO:** RPO ≤ 15 min (WAL), RTO ≤ 60 min.

**Scripts** — `ops/pg/backup.sh`
```bash
#!/usr/bin/env bash
set -euo pipefail
ts=$(date +%Y%m%d-%H%M%S)
pg_dump "$POSTGRES_URL" -Fc -Z9 -f "/backups/postgres/edpsych_${ts}.dump"
```

### 4.2 MongoDB Atlas
- **Snapshot schedule** per cluster; PIT restore enabled.  
- **Drill:** monthly restore to temp cluster; validate collection counts + key queries.

### 4.3 Redis
- **AOF** enabled; daily RDB snapshot; encrypt at rest.  
- **Drill:** warm stand‑by; failover test.

### 4.4 Neo4j
- **Aura**: built‑in snapshots; export `neo4j-admin dump` for off‑site.  
- **Drill:** restore dump to staging; run Cypher validations for intervention graphs.

### 4.5 Off‑site & Immutability
- Replicate backups to separate cloud (object storage with **WORM**/object lock, 90‑day retention).

---

## 5) Disaster Recovery & Business Continuity
**Folder:** `docs/DEPLOY/dr-bcp.md`
- **Scenarios:** provider outage, credential leak, data corruption, WAF misconfig, regional failure.  
- **Runbook:** declare SEV, comms tree, freeze deploys, failover DNS to hot‑standby, restore data, verify synthetic transactions.  
- **Table‑top exercise** template + schedule (twice yearly).

---

## 6) Monitoring & Alerting (Production)
**Folder:** `docs/DEPLOY/observability-prod.md`
- **SLIs:** availability, latency, error rate, a11y violations (from v8), data latency (ETL freshness).  
- **Alerts:** budget burn, auth error spikes, WAF block anomalies, DB replication lag, backup failures.  
- **Dashboards:** core vitals (LCP/TBT/CLS), API p95, queue depth, export throughput, mission completion.

---

## 7) Change Management & Approvals
**Folder:** `docs/DEPLOY/change-management.md`
- **Git policy:** PR + code owner approvals for risk‑tagged areas (auth, safeguarding).  
- **Release trains:** weekly; emergency patch lane.  
- **Feature flags:** gradual rollouts; kill switches.

---

## 8) Training Videos — V31 to V36 (Scripts)
**Folder:** `docs/TRAINING/VIDEO_PLAYLIST.md` (append)
- **V31 – Security Essentials for Staff**: passwords, 2FA, data handling, spotting phishing; 6‑minute micro‑learning.  
- **V32 – Using the SLT Dashboards**: interpreting KPIs, evidence exports, action planning.  
- **V33 – Backups & Restores (Admin)**: where to find, how to test.  
- **V34 – Incident Response Walkthrough**: from alert to comms to closure.  
- **V35 – Accessibility Power Checks**: quick a11y testing with keyboard + screen reader.  
- **V36 – Parent Communications & Consent**: templates, opt‑out/withdrawal handling, respectful tone.

**Scripts (examples)**
```markdown
### V31 – Security Essentials (script)
- Why security matters in schools; summary of UK GDPR responsibilities.
- Password managers & strong passphrases; enable 2FA.
- Data minimisation in practice; reporting incidents swiftly.

### V34 – Incident Response (script)
- Recognising a high‑signal alert, triage, assigning severity.
- Containment steps, evidence capture, ICO decision guide.
- Post‑incident review: actions, owners, dates.
```

---

## 9) CI Additions — `.github/workflows/ops.yml`
```yaml
name: Ops Checks
on:
  schedule: [{ cron: '30 2 * * *' }]
  workflow_dispatch:
jobs:
  sbom:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx @cyclonedx/cyclonedx-npm --output-file sbom.json
      - uses: actions/upload-artifact@v4
        with: { name: sbom, path: sbom.json }
  headers:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate security headers
        run: |
          grep -q "Strict-Transport-Security" vercel.json
          grep -q "Content-Security-Policy" vercel.json
```

---

## 10) Next Autonomous Steps
- **v10**: Data lifecycle & research governance (DUA templates, anonymisation pipeline enhancements), SLT ops dashboards for QA & reliability, and parent‑facing explainer assets.  
- Prepare **Beta Readiness Checklist** (tech + policy + training) and run a simulated Ofsted evidence export.  
- Integrate Drive index references for v8–v9 and stamp SHA‑256 on export.

