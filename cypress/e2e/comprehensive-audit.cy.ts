// Comprehensive Page Audit
// Generated from frontend_pages_list.txt

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

describe('Comprehensive Page Audit (Smoke Test)', () => {
    // We want to skip login for public pages, but some might redirect to login.
    // We just want to ensure NO 500 errors occur.
    
    pages.forEach((page) => {
        it(`should load ${page} without crashing (500 error)`, () => {
            // We use cy.request for speed where possible, but cy.visit is better for catching client-side crashes
            // cy.visit is slower. Let's use request first to check status code.
            
            cy.request({
                url: page,
                failOnStatusCode: false
            }).then((resp) => {
                // Success (200), Client Error (40x) are "acceptable" in terms of "server didn't crash".
                // Server Error (5xx) is a FAIL.
                expect(resp.status).to.not.be.gte(500);
            });
        });
    });
});
