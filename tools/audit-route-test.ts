/**
 * Phase 3.1 & 3.2: Route and API Testing
 * Tests all public and protected routes
 */

const AUDIT_BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

interface RouteTest {
  path: string;
  expectedStatus: number[];
  requiresAuth: boolean;
  category: string;
}

const PUBLIC_ROUTES: RouteTest[] = [
  // Landing pages
  { path: '/', expectedStatus: [200, 307, 308], requiresAuth: false, category: 'Landing' },
  { path: '/en', expectedStatus: [200], requiresAuth: false, category: 'Landing' },
  { path: '/en/login', expectedStatus: [200], requiresAuth: false, category: 'Auth' },
  { path: '/en/signup', expectedStatus: [200], requiresAuth: false, category: 'Auth' },
  { path: '/en/forgot-password', expectedStatus: [200], requiresAuth: false, category: 'Auth' },
  { path: '/en/blog', expectedStatus: [200], requiresAuth: false, category: 'Content' },
  { path: '/en/help', expectedStatus: [200], requiresAuth: false, category: 'Content' },
  { path: '/en/pricing', expectedStatus: [200], requiresAuth: false, category: 'Content' },
  { path: '/en/about', expectedStatus: [200], requiresAuth: false, category: 'Content' },
  { path: '/en/contact', expectedStatus: [200], requiresAuth: false, category: 'Content' },
  { path: '/en/privacy', expectedStatus: [200], requiresAuth: false, category: 'Legal' },
  { path: '/en/terms', expectedStatus: [200], requiresAuth: false, category: 'Legal' },
  { path: '/en/demo', expectedStatus: [200], requiresAuth: false, category: 'Demo' },
];

const PROTECTED_ROUTES: RouteTest[] = [
  { path: '/en/dashboard', expectedStatus: [200, 302, 307], requiresAuth: true, category: 'Dashboard' },
  { path: '/en/settings', expectedStatus: [200, 302, 307], requiresAuth: true, category: 'Settings' },
  { path: '/en/assessments', expectedStatus: [200, 302, 307], requiresAuth: true, category: 'Assessments' },
  { path: '/en/cases', expectedStatus: [200, 302, 307], requiresAuth: true, category: 'Cases' },
  { path: '/en/training', expectedStatus: [200, 302, 307], requiresAuth: true, category: 'Training' },
  { path: '/en/interventions', expectedStatus: [200, 302, 307], requiresAuth: true, category: 'Interventions' },
  { path: '/en/ehcp', expectedStatus: [200, 302, 307], requiresAuth: true, category: 'EHCP' },
  { path: '/en/admin', expectedStatus: [200, 302, 307, 403], requiresAuth: true, category: 'Admin' },
];

const API_ROUTES: RouteTest[] = [
  { path: '/api/health', expectedStatus: [200], requiresAuth: false, category: 'Health' },
  { path: '/api/auth/session', expectedStatus: [200, 401], requiresAuth: false, category: 'Auth' },
  { path: '/api/blog', expectedStatus: [200], requiresAuth: false, category: 'Blog' },
  { path: '/api/help/categories', expectedStatus: [200], requiresAuth: false, category: 'Help' },
  { path: '/api/training/courses', expectedStatus: [200, 401], requiresAuth: false, category: 'Training' },
];

interface TestResult {
  route: string;
  category: string;
  status: number;
  expected: number[];
  passed: boolean;
  responseTime: number;
  error?: string;
}

async function testRoute(route: RouteTest): Promise<TestResult> {
  const url = `${AUDIT_BASE_URL}${route.path}`;
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal,
      headers: {
        'User-Agent': 'EdPsych-Audit-Bot/1.0'
      }
    });
    
    clearTimeout(timeout);
    const responseTime = Date.now() - startTime;
    const status = response.status;
    const passed = route.expectedStatus.includes(status);
    
    return {
      route: route.path,
      category: route.category,
      status,
      expected: route.expectedStatus,
      passed,
      responseTime
    };
  } catch (error: any) {
    return {
      route: route.path,
      category: route.category,
      status: 0,
      expected: route.expectedStatus,
      passed: false,
      responseTime: Date.now() - startTime,
      error: error.message
    };
  }
}

async function runTests() {
  console.log('=== Phase 3.1 & 3.2: Route Testing ===\n');
  console.log(`Base URL: ${AUDIT_BASE_URL}\n`);
  
  const results: TestResult[] = [];
  let passed = 0;
  let failed = 0;
  
  // Test public routes
  console.log('--- Public Routes ---\n');
  for (const route of PUBLIC_ROUTES) {
    const result = await testRoute(route);
    results.push(result);
    
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.route} [${result.status}] (${result.responseTime}ms)`);
    if (result.error) console.log(`   Error: ${result.error}`);
    
    if (result.passed) passed++;
    else failed++;
  }
  
  // Test API routes
  console.log('\n--- API Routes ---\n');
  for (const route of API_ROUTES) {
    const result = await testRoute(route);
    results.push(result);
    
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.route} [${result.status}] (${result.responseTime}ms)`);
    if (result.error) console.log(`   Error: ${result.error}`);
    
    if (result.passed) passed++;
    else failed++;
  }
  
  // Test protected routes (expect redirects)
  console.log('\n--- Protected Routes (Unauthenticated) ---\n');
  for (const route of PROTECTED_ROUTES) {
    const result = await testRoute(route);
    results.push(result);
    
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.route} [${result.status}] (${result.responseTime}ms)`);
    if (result.error) console.log(`   Error: ${result.error}`);
    
    if (result.passed) passed++;
    else failed++;
  }
  
  // Summary
  console.log('\n=== Test Summary ===');
  console.log(`Total: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Pass Rate: ${((passed / results.length) * 100).toFixed(1)}%`);
  
  // Performance summary
  const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
  const maxResponseTime = Math.max(...results.map(r => r.responseTime));
  console.log(`\nAvg Response Time: ${avgResponseTime.toFixed(0)}ms`);
  console.log(`Max Response Time: ${maxResponseTime}ms`);
  
  // Failed routes
  if (failed > 0) {
    console.log('\n=== Failed Routes ===');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`❌ ${r.route}: got ${r.status}, expected ${r.expected.join(' or ')}`);
      if (r.error) console.log(`   Error: ${r.error}`);
    });
  }
  
  console.log('\n=== Route Testing Complete ===');
  console.log(`Result: ${failed === 0 ? '✅ PASS' : '⚠️ PARTIAL'}`);
  
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(console.error);
