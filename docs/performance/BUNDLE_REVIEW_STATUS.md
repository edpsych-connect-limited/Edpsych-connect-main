# Bundle Review Status

This log tracks bundle size review evidence and reductions for core pages.

Status key: [ ] pending, [~] in progress, [x] done

## Scope
- Dashboard
- Assessments list + wizard
- Cases list + detail
- EHCP list + modules
- Reports creation

## Evidence Log
- [x] Baseline build stats recorded (top 10 bundles)
- [~] Top 5 bundles identified and prioritized (route mapping partially complete)
- [~] Reduction plan documented (dynamic imports, dependency removal)
- [x] Build stats updated after reductions
- [ ] p95 impact verified against `docs/observability/SLI_SLO.md`

## Notes
- Keep deltas in KB and % with date stamps.
- 2026-01-21: Build completed with warnings; Next build output did not include bundle sizes.
- 2026-01-21: Bundle analyzer reports generated for client/edge/node.
- 2026-01-21: Analyzer reports note "No bundles were parsed"; sizes may be limited to original module sizes.
- 2026-01-21: Top chunk sizes captured from build output; page mapping sourced from app router client-reference manifests.
- 2026-01-21: Post-reduction build completed with webpack cache warnings; new chunk sizes captured for delta comparison.
- 2026-01-21: Post-assessment-report lazy-load build completed; top chunk sizes unchanged from prior reduction run.
- 2026-01-21: Post-EHCP lazy-load build completed; top chunk sizes unchanged.
- 2026-01-22: Build completed; analyzer outputs saved (client/edge/node); captured top client chunk sizes via analyzer statSize.
- 2026-01-22: Post-intervention deferral build completed; top chunk sizes unchanged from prior run.
- 2026-01-22: Post-beta icon swap build completed; top chunk sizes unchanged from prior run.
- 2026-01-22: Post-battle icon swap build completed; react-icons chunk removed from top list.

## Reduction Plan (Initial)
- Move PDF generation to lazy-loaded imports on subscription invoices (jsPDF only when downloading).
- Split training dashboard chart bundle into a dynamic client-only chunk.
- After chart/PDF split, re-measure chunks for `/training/dashboard` and `/subscription`.
- Lazy-load assessment PDF report generation and avoid client-side jsPDF type imports.
- Lazy-load EHCP PDF export to keep jsPDF off the list view bundle.
- Defer recharts by dynamically loading institutional performance charts.
- Next targets: audit where `recharts` is loaded; defer chart components on admin analytics.
- Next targets: isolate Three.js demo visuals behind dynamic import and only load in demo routes.
  - 2026-01-22: Deferred gamification battle royale + coding dojo engines via dynamic import.
- 2026-01-22: Deferred intervention library dataset import in `/interventions/library` to reduce shared dashboard bundle.
- 2026-01-22: Deferred intervention library and designer components via dynamic import in interventions pages.
- 2026-01-22: Replaced beta register react-icons/fa bundle with lucide-react to reduce 8e1d74a4 chunk.
- 2026-01-22: Replaced battle royale react-icons/fa with lucide-react to reduce gamification bundle weight.

## Capture Method (Baseline + After)
1) Record build stats output (top 10 bundles) and store evidence file path.
2) List the top 5 bundles with size, page association, and suspected causes.
3) Document planned reductions with owners and target dates.
4) Re-run build stats and record deltas in the log below.

## Bundle Log (Fill In)
| Date | Page/Route | Bundle/Chunk | Size (KB) | Delta (KB / %) | Notes | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| YYYY-MM-DD | Dashboard | app/dashboard.js | 000 | 0 / 0% | baseline | docs/performance/build-stats-YYYY-MM-DD.txt |
| YYYY-MM-DD | Assessments | app/assessments.js | 000 | -0 / -0% | after reduction | docs/performance/build-stats-YYYY-MM-DD.txt |
| 2026-01-21 | N/A | N/A | N/A | N/A | Baseline build completed; bundle sizes not emitted in console output. | docs/performance/build-stats-2026-01-21.txt |
| 2026-01-21 | N/A | N/A | N/A | N/A | Bundle analyzer reports generated (client/edge/node). | docs/performance/client.html |
| 2026-01-21 | Shared/vendor (route mapping pending) | b536a0f1.fd5e8f5628eedaf7.js | 653.56 | 0 / 0% | Heavy bundle; contains chart/canvas/three/ace/d3 modules. | docs/performance/chunk-sizes-2026-01-21.txt |
| 2026-01-21 | /:locale/interventions/library; /:locale/interventions/new; /:locale/parent/dashboard; /:locale/school/dashboard; /:locale/teacher-dashboard | 9915-014565fd99e7f287.js | 582.18 | 0 / 0% | Shared across dashboards; chart/pdf/three/moment/ace modules. | docs/performance/chunk-sizes-2026-01-21.txt |
| 2026-01-21 | /:locale/institutional-management | 7143-77251ab5e5f59b5f.js | 403.76 | 0 / 0% | Stripe + chart + lodash + ace modules. | docs/performance/chunk-sizes-2026-01-21.txt |
| 2026-01-21 | /:locale/ehcp; /:locale/ehcp/*; /:locale/assessments/:id/conduct; /:locale/demo/assessment; /:locale/subscription* | 164f4fb6-36e485247c9e3b53.js | 321.69 | 0 / 0% | Shared across EHCP + subscription; chart/pdf/canvas/ace modules. | docs/performance/chunk-sizes-2026-01-21.txt |
| 2026-01-21 | Shared/vendor (route mapping pending) | 4363.4a57b2862049070f.js | 195.27 | 0 / 0% | Shared bundle; canvas/three/ace modules. | docs/performance/chunk-sizes-2026-01-21.txt |
| 2026-01-21 | Shared/vendor (route mapping pending) | b536a0f1.fd5e8f5628eedaf7.js | 653.56 | 0 / 0% | Post-reduction re-measure; chart/canvas/three/ace/d3 modules remain. | docs/performance/chunk-sizes-2026-01-21-post-reduction.txt |
| 2026-01-21 | /:locale/interventions/library; /:locale/interventions/new; /:locale/parent/dashboard; /:locale/school/dashboard; /:locale/teacher-dashboard | 9915-014565fd99e7f287.js | 582.18 | 0 / 0% | Post-reduction re-measure; chart/pdf/three/moment/ace modules remain. | docs/performance/chunk-sizes-2026-01-21-post-reduction.txt |
| 2026-01-21 | Shared/vendor (route mapping pending) | 8591.80d4cd7443236e03.js | 403.20 | -0.56 / -0.1% | Post-reduction re-measure; chart/stripe/lodash/ace modules remain. | docs/performance/chunk-sizes-2026-01-21-post-reduction.txt |
| 2026-01-21 | /:locale/ehcp; /:locale/ehcp/*; /:locale/assessments/:id/conduct; /:locale/demo/assessment | 164f4fb6-0aef2e9c384bc52b.js | 321.69 | 0 / 0% | Post-reduction re-measure; chart/pdf/canvas/ace modules remain. | docs/performance/chunk-sizes-2026-01-21-post-reduction.txt |
| 2026-01-21 | N/A | N/A | N/A | 0 / 0% | Post-assessment-report build; top chunk sizes unchanged. | docs/performance/chunk-sizes-2026-01-21-post-reduction.txt |
| 2026-01-21 | N/A | N/A | N/A | 0 / 0% | Post-EHCP PDF lazy-load build; top chunk sizes unchanged. | docs/performance/chunk-sizes-2026-01-21-post-ehcp.txt |
| 2026-01-22 | /:locale/beta-register; /:locale/gamification | 8e1d74a4-0fc54008b22907ff.js | 1628.85 | TBD | Analyzer statSize (raw); large stat size despite low parsed size. | docs/performance/chunk-sizes-2026-01-22.txt |
| 2026-01-22 | Shared/vendor (route mapping pending) | b536a0f1.fd5e8f5628eedaf7.js | 1428.59 | TBD | Analyzer statSize (raw) for Three.js bundle. | docs/performance/chunk-sizes-2026-01-22.txt |
| 2026-01-22 | Shared/vendor (route mapping pending) | 8591.80d4cd7443236e03.js | 1135.69 | TBD | Analyzer statSize (raw); recharts/d3/lodash group. | docs/performance/chunk-sizes-2026-01-22.txt |
| 2026-01-22 | /:locale/teacher-dashboard; /:locale/interventions/library; /:locale/interventions/new | 9915-5d8aaa21ebafc250.js | 758.33 | TBD | Analyzer statSize (raw); intervention-library payload still large. | docs/performance/chunk-sizes-2026-01-22.txt |
| 2026-01-22 | main-app | 3794-d7a823c5a988a2d8.js | 694.71 | TBD | Analyzer statSize (raw); shared base bundle. | docs/performance/chunk-sizes-2026-01-22.txt |
| 2026-01-22 | N/A | N/A | N/A | 0 / 0% | Post-intervention deferral build; top chunk sizes unchanged. | docs/performance/chunk-sizes-2026-01-22-post-interventions.txt |
| 2026-01-22 | N/A | N/A | N/A | 0 / 0% | Post-beta icon swap build; top chunk sizes unchanged. | docs/performance/chunk-sizes-2026-01-22-post-beta-icons.txt |
| 2026-01-22 | N/A | N/A | N/A | 0 / 0% | Post-battle icon swap build; react-icons chunk removed from top list. | docs/performance/chunk-sizes-2026-01-22-post-battle-icons.txt |
