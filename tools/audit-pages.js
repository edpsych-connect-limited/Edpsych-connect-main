const fs = require('fs');
const http = require('http');

console.log('Starting Comprehensive Page Audit...');
// Use strict mode for fetch if using newer node, but http.get is safer for older environments.
// We'll use the native fetch if available (Node 18+), else http.

const BASE_URL = 'http://localhost:3000';

const pages = [
  '/', // src/app/[locale]/page.tsx
  '/about',
  '/accessibility',
  '/admin',
  '/admin/ethics',
  '/admin/integrations',
  '/ai-agents',
  '/algorithms',
  '/analytics',
  '/assessments',
  '/assessments/new',
  '/assessments/123', // [id]
  '/assessments/123/conduct', // [id]
  '/assessments/tasks/digit-span',
  '/blog',
  '/blog/test-slug', // [slug]
  '/cases',
  '/cases/new',
  '/cases/123', // [id]
  '/collaborate',
  '/collaborate/thank-you',
  '/collaborate/test-token', // [token]
  '/contact',
  '/dashboard',
  '/demo',
  '/demo/assessment',
  '/demo/coding',
  '/demo/ehcp',
  '/demo/gamification',
  '/demo/golden-thread',
  '/demo/interventions',
  '/demo/onboarding',
  '/demo/tracking',
  '/demo/training',
  '/demo/translator',
  '/diagnostic',
  '/ehcp',
  '/ehcp/new',
  '/ehcp/123', // [id]
  '/ehcp/modules',
  '/ehcp/modules/annual-reviews',
  '/ehcp/modules/mediation-tribunal',
  '/ehcp/modules/phase-transfers',
  '/ehcp/modules/compliance-risk',
  '/ehcp/modules/resource-costing',
  '/ehcp/modules/golden-thread',
  '/ehcp/modules/sen2-returns',
  '/forgot-password',
  '/gamification',
  '/gdpr',
  '/help',
  '/help/test-slug', // [slug]
  '/institutional-management',
  '/interventions',
  '/interventions/library',
  '/interventions/new',
  '/interventions/123', // [id]
  '/landing',
  '/login',
  '/marketplace',
  '/marketplace/dashboard',
  '/marketplace/la-panel',
  '/marketplace/register',
  '/networking',
  '/onboarding',
  '/parents',
  '/pricing',
  '/privacy',
  '/progress',
  '/reports',
  '/reports/create',
  '/research',
  '/research/ethics',
  '/settings',
  '/signup',
  '/subscription',
  '/subscription/addon',
  '/teachers',
  '/terms',
  '/test-auth',
  '/test-navigation',
  '/training',
  '/training/certificates',
  '/training/checkout/123', // [productId]
  '/training/courses',
  '/training/courses/123', // [id]
  '/training/courses/123/learn', // [id]
  '/training/dashboard',
  '/training/marketplace',
  '/beta-login',
  '/beta-register',
  '/school/ehcp-request',
  '/la/dashboard',
  '/la/applications/123', // [id]
  '/professional/portal',
  '/careers',
  '/forum',
  '/problem-solver',
  '/senco',
  '/outcomes'
];

async function checkUrl(url) {
    return new Promise((resolve) => {
        const fullUrl = BASE_URL + url;
        const req = http.get(fullUrl, (res) => {
            // consume response body to free up memory
            res.resume();
            resolve({
                url,
                status: res.statusCode,
                ok: res.statusCode < 500
            });
        });

        req.on('error', (e) => {
            resolve({
                url,
                status: 'ERROR',
                error: e.message,
                ok: false
            });
        });
        
        req.setTimeout(120000, () => {
             req.destroy();
             resolve({
                url,
                status: 'TIMEOUT',
                ok: false
             });
        });
    });
}

async function runAudit() {
    const results = [];
    const failures = [];
    
    // Process in chunks to avoid overwhelming the server
    const CHUNK_SIZE = 2;
    for (let i = 0; i < pages.length; i += CHUNK_SIZE) {
        const chunk = pages.slice(i, i + CHUNK_SIZE);
        const promises = chunk.map(page => checkUrl(page));
        const chunkResults = await Promise.all(promises);
        
        chunkResults.forEach(r => {
            results.push(r);
            if (!r.ok || r.status >= 500) {
                failures.push(r);
                console.error(`❌ FAIL: ${r.url} - ${r.status}`);
            } else {
                console.log(`✅ PASS: ${r.url} - ${r.status}`);
            }
        });
    }

    const report = {
        total: results.length,
        passed: results.length - failures.length,
        failed: failures.length,
        details: results
    };

    fs.writeFileSync('audit_report_node.json', JSON.stringify(report, null, 2));
    console.log(`\nAudit Complete. Passed: ${report.passed}/${report.total}`);
    
    if (failures.length > 0) {
        console.log('\nFailures:');
        failures.forEach(f => console.log(`${f.url}: ${f.status}`));
        process.exit(1);
    } else {
        process.exit(0);
    }
}

runAudit();
