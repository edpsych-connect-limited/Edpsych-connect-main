# EdPsych Connect — Implementation Pack v12
**Author:** AI Dr Patrick (Autonomous)  
**Region:** UK (GB English)  
**Purpose:** Beta consolidation and release candidate. Finalise deployment, monitoring, documentation, and training. This marks readiness for live Beta testing under controlled conditions.

---

## 0) Overview
- Validate that all technical, data, policy, and UX workstreams (v1–v11) integrate seamlessly.  
- Ensure production readiness: infrastructure resilience, governance compliance, accessibility parity, and support enablement.  
- Generate documentation site, release notes, and training assets for Beta launch.

---

## 1) Deployment Checklist — Beta Readiness
**Folder:** `docs/BETA/deployment-checklist.md`

### 1.1 Infrastructure
- ✅ IaC validated (`terraform plan` clean, drift check).  
- ✅ Backups tested and integrity verified (Postgres, Redis, Mongo, Neo4j).  
- ✅ WAF policies applied (OWASP + rate limits + bot detection).  
- ✅ HTTPS/TLS 1.2+ enforced with HSTS preload.  
- ✅ DNS failover verified.  
- ✅ Secrets rotation automation active.

### 1.2 Application
- ✅ E2E, a11y, performance tests (v8) passed in staging.  
- ✅ Feature flags tested (new vs legacy UIs).  
- ✅ Consent flow and anonymisation verified (v10).  
- ✅ All endpoints authenticated + scoped JWT claims validated.  
- ✅ Sentry/Telemetry tags added for major features.

### 1.3 Compliance & Policy
- ✅ DPIA & ROPA completed and signed.  
- ✅ DPA, AUP, and safeguarding policies published.  
- ✅ Retention enforcement job active.  
- ✅ DUA board and governance records updated.

### 1.4 Content & Training
- ✅ 48 video scripts completed (V1–V48).  
- ✅ Parent explainers published (v10).  
- ✅ Teacher/SLT/EP quick starts exported.  
- ✅ Internal FAQ & support chatbot trained (non-generative, scripted responses only).

---

## 2) Monitoring & Alert Tuning
**Folder:** `docs/OPS/monitoring-alerts.md`

### 2.1 Observability Stack
- **Metrics:** Prometheus + Grafana (self-hosted or managed).  
- **Traces:** OpenTelemetry → Tempo → Grafana dashboards.  
- **Logs:** Loki (JSON structured, pii=false).  
- **Error tracking:** Sentry (frontend + backend).  
- **Engagement analytics:** PostHog (privacy-respecting, cookieless mode for pupils).

### 2.2 Key Dashboards
| Dashboard | Metrics |
|------------|----------|
| System Health | uptime, latency, errors, CPU/mem, WAF hits |
| QA Quality | test pass rate, a11y debt, performance score |
| Reliability | SLO compliance, error budget burn, alert noise |
| Engagement | active pupils, streaks, parental logins, mission completions |

### 2.3 Alert Routing
- Primary: engineering Slack channel or Teams webhook.  
- Secondary: email to `ops@edpsychconnect.app`.  
- Escalation: DPO for data/security events.

---

## 3) Release Notes — Structure & Workflow
**Folder:** `docs/BETA/release-notes-template.md`

### 3.1 Internal (Engineering)
- Changelog by pack (v1–v12).  
- Known issues & mitigations.  
- Rollback procedure link.  

### 3.2 SLT Summary
- Feature highlights relevant to pedagogy, wellbeing, safeguarding.  
- KPIs achieved: stability, accessibility, engagement.  

### 3.3 Public Beta
- Announcement text (plain English).  
- Privacy statement reaffirmation.  
- Feedback form (Google Form or internal portal) for educators, pupils, parents.

---

## 4) Documentation Site Build
**Folder:** `/docs/site/`

### 4.1 Framework
- **Docusaurus 3** (preferred) or Next.js static export.  
- Auto-import from `/docs/**` tree (architecture, UX, data, deploy, training).  
- Theming: EdPsych Connect palette, WCAG AA compliant.  
- Search: Algolia DocSearch or local index.  
- Footer: DPO contact, safeguarding links, licence.

### 4.2 Example Config — `docusaurus.config.js`
```js
export default {
  title: 'EdPsych Connect Docs',
  tagline: 'Building confident learners and educators',
  url: 'https://docs.edpsychconnect.app',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  favicon: '/img/favicon.ico',
  presets: [
    ['classic', {
      docs: { routeBasePath: '/', sidebarPath: './sidebars.js' },
      theme: { customCss: './src/css/custom.css' }
    }]
  ],
  themeConfig: {
    navbar: { title: 'EdPsych Connect', logo: { alt: 'Logo', src: 'img/logo.svg' } },
    footer: { style: 'dark', copyright: `© ${new Date().getFullYear()} EdPsych Connect` }
  }
}
```

---

## 5) Post-Beta Plan
**Folder:** `docs/BETA/post-beta-plan.md`

### 5.1 Feedback Capture
- **Internal:** structured retrospectives (SLT, EPs, Teachers).  
- **External:** feedback forms, anonymised analytics, sentiment dashboard.  
- **Students:** guided group sessions (parental consent required).  

### 5.2 Iteration Cycle
- Triaging Beta issues → Milestone tagging in GitHub → Weekly sprints.  
- User feedback → backlog → next release candidate.

### 5.3 Success Metrics
- System uptime ≥ 99.9%.  
- Accessibility WCAG 2.2 AA compliance verified.  
- Engagement increase ≥ 25% over baseline.  
- Pupil satisfaction ≥ 80% (survey).  
- Educator administrative time reduction ≥ 30%.

---

## 6) Training Videos V43–V48 (Staff CPD & EP Advanced Tools)
**Folder:** `docs/TRAINING/VIDEO_PLAYLIST.md` (append)
| ID | Title | Focus |
|----|--------|--------|
| V43 | Introduction to the Beta Platform | Key changes, navigation, feature highlights. |
| V44 | Data-Driven Practice for EPs | Using anonymised insights to inform strategy. |
| V45 | Advanced SLT Tools | Performance, QA, reliability dashboards. |
| V46 | Handling Data Requests | Using consent logs, exports, and retention tools. |
| V47 | Supporting Pupil Wellbeing | Integrating wellbeing data responsibly. |
| V48 | Continuous Improvement Loop | How to give structured feedback for product growth. |

**Example Script (V44)**
```markdown
### V44 – Data-Driven Practice for EPs
Explore how anonymised pupil data can help identify learning patterns early.
We’ll review the Research Exports dashboard and demonstrate safe analytical workflows.
Remember: always work within consent boundaries and ethical approval.
```

---

## 7) Launch Assets
- **Landing page** copy: “Empowering educators, engaging learners.”  
- **Press kit** (logos, mission statement, screenshots).  
- **Beta signup form** (invite-only; DPO consent required for testers).  
- **Safeguarding statement** prominently displayed.

---

## 8) Next Autonomous Steps
- Prepare **v13** – Production transition (versioning, scaling, licensing, SLT expansion pack).  
- Merge all Implementation Packs v1–v12 into unified architecture index and export with signatures.  
- Create Beta retrospective board template and deliver documentation site MVP.

