import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

const routes = [
  '/',
  '/en',
  '/en/login',
  '/en/register',
  '/en/beta-register',
  '/en/forgot-password',
  '/en/pricing',
  '/en/demo',
  '/en/help',
  '/en/about',
  // Key Role Entry Points (should redirect to login if unauth, not 404)
  '/en/senco',
  '/en/ep/dashboard',
  '/en/la/dashboard',
  '/en/teachers',
  '/en/parents',
];

async function checkRoute(route: string) {
  try {
    const url = `${BASE_URL}${route}`;
    const start = Date.now();
    const response = await fetch(url, { redirect: 'manual' });
    const duration = Date.now() - start;
    
    // We treat 200 (OK), 307/308 (Redirects), and 401 (Unauthorized) as "Existing" routes.
    // 404 is the main failure we are looking for.
    // 500 is a crash.
    
    const status = response.status;
    let result = '✅ OK';
    
    if (status === 404) result = '❌ MISSING (404)';
    else if (status >= 500) result = '❌ CRASH (5xx)';
    else if (status >= 300 && status < 400) result = `➡️ REDIRECT (${status})`;
    else if (status === 401 || status === 403) result = `🔒 AUTH (${status})`;
    
    console.log(`${result.padEnd(20)} | ${route.padEnd(30)} | ${duration}ms`);
    return { route, status, success: status !== 404 && status < 500 };
  } catch (error) {
    console.log(`❌ ERROR (NET)         | ${route.padEnd(30)} | ${(error as Error).message}`);
    return { route, status: 0, success: false };
  }
}

async function runAudit() {
  console.log(`\n🚀 Starting Routing Audit against ${BASE_URL}\n`);
  console.log(`Status               | Route                          | Time`);
  console.log(`---------------------|--------------------------------|-------`);
  
  const results = [];
  for (const route of routes) {
    results.push(await checkRoute(route));
  }
  
  console.log(`\n--------------------------------------------------------------`);
  const failures = results.filter(r => !r.success);
  
  if (failures.length === 0) {
    console.log(`\n✅ AUDIT PASSED: All ${routes.length} routes are accessible.`);
    process.exit(0);
  } else {
    console.log(`\n❌ AUDIT FAILED: ${failures.length} routes failed.`);
    failures.forEach(f => console.log(`   - ${f.route} (${f.status})`));
    process.exit(1);
  }
}

runAudit();
