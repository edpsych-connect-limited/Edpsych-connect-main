const fs = require('fs');

console.log('Starting Final Page Audit...');
const BASE_URL = 'http://localhost:3000';
const OUT_FILE = 'audit_final_report.json';

const pages = [
  '/', 
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
  '/assessments/123',
  '/assessments/123/conduct',
  '/assessments/tasks/digit-span',
  '/blog',
  '/blog/test-slug',
  '/cases',
  '/cases/new',
  '/cases/123',
  '/collaborate',
  '/collaborate/thank-you',
  '/collaborate/test-token',
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
  '/ehcp/123',
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
  '/help/test-slug',
  '/institutional-management',
  '/interventions',
  '/interventions/library',
  '/interventions/new',
  '/interventions/123',
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
  '/training/checkout/123',
  '/training/courses',
  '/training/courses/123',
  '/training/courses/123/learn',
  '/training/dashboard',
  '/training/marketplace',
  '/beta-login',
  '/beta-register',
  '/school/ehcp-request',
  '/la/dashboard',
  '/la/applications/123',
  '/professional/portal',
  '/careers',
  '/forum',
  '/problem-solver',
  '/senco',
  '/outcomes'
];

async function checkUrl(url) {
    try {
        const fullUrl = BASE_URL + url;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 min timeout

        const res = await fetch(fullUrl, { 
            signal: controller.signal,
            method: 'GET' 
        });
        
        clearTimeout(timeoutId);

        return {
            url,
            status: res.status,
            ok: res.status < 500, // We accept 404/403/401 as "server is alive and handling logic"
            redirects: res.redirected
        };
    } catch (e) {
        return {
            url,
            status: 'ERROR',
            error: e.name === 'AbortError' ? 'TIMEOUT' : e.message,
            ok: false
        };
    }
}

async function runAudit() {
    const results = [];
    const failures = [];
    
    // Process in small serial chunks to avoid overloading
    const CHUNK_SIZE = 3;
    
    for (let i = 0; i < pages.length; i += CHUNK_SIZE) {
        const chunk = pages.slice(i, i + CHUNK_SIZE);
        console.log(`Processing chunk ${i/CHUNK_SIZE + 1}... (${chunk.join(', ')})`);
        
        try {
            const chunkResults = await Promise.all(chunk.map(checkUrl));
            
            chunkResults.forEach(r => {
                results.push(r);
                if (!r.ok) failures.push(r);
                console.log(`${r.ok ? '✅' : '❌'} ${r.url} : ${r.status}`);
            });

            // Write progress to file incrementally
            fs.writeFileSync(OUT_FILE, JSON.stringify({
                total_processed: results.length,
                pending: pages.length - results.length,
                failures: failures,
                results: results
            }, null, 2));

        } catch (err) {
            console.error('Chunk failed:', err);
        }
    }

    console.log('Audit Finished.');
}

runAudit();
