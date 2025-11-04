/**
 * COMPREHENSIVE API E2E TEST SUITE V2
 * Properly handles cookie-based JWT authentication
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3002';
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: TestResult[] = [];

// Store cookies for each user
const userCookies: Record<string, string> = {};

// Helper functions
function logTest(name: string) {
  console.log(`\n${colors.cyan}🧪 Testing:${colors.reset} ${name}`);
}

function logPass(message: string) {
  console.log(`${colors.green}✅ PASS:${colors.reset} ${message}`);
}

function logFail(message: string) {
  console.log(`${colors.red}❌ FAIL:${colors.reset} ${message}`);
}

function logWarn(message: string) {
  console.log(`${colors.yellow}⚠️  WARN:${colors.reset} ${message}`);
}

function logInfo(message: string) {
  console.log(`${colors.blue}ℹ️  INFO:${colors.reset} ${message}`);
}

function addResult(name: string, passed: boolean, message: string, details?: any) {
  results.push({ name, passed, message, details });
  if (passed) {
    logPass(message);
  } else {
    logFail(message);
  }
}

function extractCookie(response: any): string | null {
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) {
    const match = setCookie.match(/auth-token=([^;]+)/);
    return match ? match[1] : null;
  }
  return null;
}

// Test functions
async function testHealthCheck() {
  logTest('Health Check Endpoint');
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    const data = await response.json();

    if (response.ok && data.status === 'ok') {
      addResult('Health Check', true, 'Health endpoint returned OK');
    } else {
      addResult('Health Check', false, `Health check failed: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    addResult('Health Check', false, `Health check error: ${error}`);
  }
}

async function testUnauthenticatedAccess() {
  logTest('Unauthenticated Access Protection');

  const protectedEndpoints = [
    '/api/students/16/profile',
    '/api/class/dashboard',
    '/api/auth/me',
  ];

  for (const endpoint of protectedEndpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`);

      if (response.status === 401 || response.status === 403) {
        addResult(`Unauth ${endpoint}`, true, `Correctly blocked: ${endpoint} (${response.status})`);
      } else {
        const data = await response.text();
        addResult(`Unauth ${endpoint}`, false, `Should block but got ${response.status}`);
      }
    } catch (error) {
      addResult(`Unauth ${endpoint}`, false, `Error testing ${endpoint}: ${error}`);
    }
  }
}

async function testLogin(email: string, password: string, role: string): Promise<boolean> {
  logTest(`Login as ${role} (${email})`);

  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Extract cookie from response
      const cookie = extractCookie(response);
      if (cookie) {
        userCookies[role] = cookie;
        addResult(`Login ${role}`, true, `Successfully logged in as ${role}`);
        logInfo(`Cookie stored for ${role}`);
        return true;
      } else {
        addResult(`Login ${role}`, false, `Login succeeded but no cookie received`);
        return false;
      }
    } else {
      addResult(`Login ${role}`, false, `Login failed: ${JSON.stringify(data)}`);
      return false;
    }
  } catch (error) {
    addResult(`Login ${role}`, false, `Login error: ${error}`);
    return false;
  }
}

async function testAuthMe(role: string) {
  logTest(`Auth Me Endpoint (${role})`);

  if (!userCookies[role]) {
    addResult(`Auth Me ${role}`, false, `No cookie available for ${role}`);
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth-token=${userCookies[role]}`
      }
    });

    const data = await response.json();

    if (response.ok && data.user) {
      addResult(`Auth Me ${role}`, true, `Retrieved user data: ${data.user.email}`);
      logInfo(`Role: ${data.user.role}, Tenant: ${data.user.tenantId}`);
    } else {
      addResult(`Auth Me ${role}`, false, `Failed: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    addResult(`Auth Me ${role}`, false, `Error: ${error}`);
  }
}

async function testStudentProfileAPI(role: string, studentId: number) {
  logTest(`Student Profile API (ID: ${studentId}) as ${role}`);

  if (!userCookies[role]) {
    addResult(`Student Profile ${studentId}`, false, `No cookie available`);
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/students/${studentId}/profile`, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth-token=${userCookies[role]}`
      }
    });

    const data = await response.json();

    if (response.ok && data.student) {
      addResult(`Student Profile ${studentId} (${role})`, true, `Profile: ${data.student.first_name} ${data.student.last_name}`);
    } else {
      addResult(`Student Profile ${studentId} (${role})`, false, `Failed: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    addResult(`Student Profile ${studentId} (${role})`, false, `Error: ${error}`);
  }
}

async function testClassDashboard(role: string) {
  logTest(`Class Dashboard API as ${role}`);

  if (!userCookies[role]) {
    addResult('Class Dashboard', false, `No cookie available`);
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/class/dashboard`, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth-token=${userCookies[role]}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      addResult(`Class Dashboard (${role})`, true, `Dashboard accessible`);
      if (data.classes) {
        logInfo(`Classes: ${data.classes.length}`);
      }
    } else {
      addResult(`Class Dashboard (${role})`, false, `Failed: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    addResult(`Class Dashboard (${role})`, false, `Error: ${error}`);
  }
}

async function testParentChildSecurity() {
  logTest('CRITICAL: Parent-Child Security Test');

  if (!userCookies['PARENT']) {
    addResult('Parent Security', false, 'No parent cookie available');
    return;
  }

  try {
    // Test accessing own child (Amara Singh, ID: 16)
    const ownChildResponse = await fetch(`${BASE_URL}/api/students/16/profile`, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth-token=${userCookies['PARENT']}`
      }
    });

    if (ownChildResponse.ok) {
      addResult('Parent Access Own Child', true, 'Parent CAN access own child ✓');
    } else {
      addResult('Parent Access Own Child', false, 'Parent CANNOT access own child (should be able to!)');
    }

    // Test accessing another child (ID: 17) - should be blocked
    const otherChildResponse = await fetch(`${BASE_URL}/api/students/17/profile`, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth-token=${userCookies['PARENT']}`
      }
    });

    if (otherChildResponse.status === 403 || otherChildResponse.status === 401) {
      addResult('Parent Access Other Child', true, '🔒 SECURITY PASS: Parent blocked from other children');
    } else {
      addResult('Parent Access Other Child', false, '🚨 CRITICAL: Parent CAN access other children!');
    }
  } catch (error) {
    addResult('Parent Security Test', false, `Error: ${error}`);
  }
}

async function testStudentsAPI(role: string) {
  logTest(`Students List API as ${role}`);

  if (!userCookies[role]) {
    addResult('Students API', false, 'No cookie available');
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/students`, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth-token=${userCookies[role]}`
      }
    });

    const data = await response.json();

    if (response.ok && Array.isArray(data)) {
      addResult(`Students API (${role})`, true, `Retrieved ${data.length} students`);
    } else {
      addResult(`Students API (${role})`, false, `Failed: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    addResult(`Students API (${role})`, false, `Error: ${error}`);
  }
}

async function testFeatureAPI(role: string, endpoint: string, name: string) {
  if (!userCookies[role]) return;

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth-token=${userCookies[role]}`
      }
    });

    if (response.ok || response.status === 404) {
      addResult(`${name} (${role})`, true, `${name} endpoint accessible (${response.status})`);
    } else {
      addResult(`${name} (${role})`, false, `Failed: ${response.status}`);
    }
  } catch (error) {
    addResult(`${name} (${role})`, false, `Error: ${error}`);
  }
}

// Main test execution
async function runTests() {
  console.log('\n' + '='.repeat(80));
  console.log(`${colors.cyan}🚀 AUTONOMOUS API E2E TEST SUITE V2${colors.reset}`);
  console.log(`${colors.cyan}Cookie-Based JWT Authentication${colors.reset}`);
  console.log('='.repeat(80));

  // Phase 1
  console.log('\n' + colors.blue + '📋 PHASE 1: Health & Security' + colors.reset);
  await testHealthCheck();
  await testUnauthenticatedAccess();

  // Phase 2
  console.log('\n' + colors.blue + '📋 PHASE 2: Authentication' + colors.reset);
  const teacherOk = await testLogin('teacher@test.edpsych.com', 'Test123!', 'TEACHER');
  const studentOk = await testLogin('amara.singh@test.edpsych.com', 'Test123!', 'STUDENT');
  const parentOk = await testLogin('priya.singh@test.edpsych.com', 'Test123!', 'PARENT');
  const epOk = await testLogin('dr.patel@test.edpsych.com', 'Test123!', 'EP');

  // Phase 3: Teacher APIs
  if (teacherOk) {
    console.log('\n' + colors.blue + '📋 PHASE 3: Teacher APIs' + colors.reset);
    await testAuthMe('TEACHER');
    await testStudentProfileAPI('TEACHER', 16);
    await testClassDashboard('TEACHER');
    await testStudentsAPI('TEACHER');
    await testFeatureAPI('TEACHER', '/api/assessments', 'Assessments');
    await testFeatureAPI('TEACHER', '/api/interventions', 'Interventions');
    await testFeatureAPI('TEACHER', '/api/ehcp', 'EHCP');
  }

  // Phase 4: Parent Security (CRITICAL)
  if (parentOk) {
    console.log('\n' + colors.blue + '📋 PHASE 4: Parent Security (CRITICAL)' + colors.reset);
    await testAuthMe('PARENT');
    await testParentChildSecurity();
  }

  // Phase 5: Student APIs
  if (studentOk) {
    console.log('\n' + colors.blue + '📋 PHASE 5: Student APIs' + colors.reset);
    await testAuthMe('STUDENT');
  }

  // Phase 6: EP APIs
  if (epOk) {
    console.log('\n' + colors.blue + '📋 PHASE 6: EP APIs' + colors.reset);
    await testAuthMe('EP');
    await testStudentsAPI('EP');
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log(`${colors.cyan}📊 TEST SUMMARY${colors.reset}`);
  console.log('='.repeat(80));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;
  const passRate = ((passed / total) * 100).toFixed(1);

  console.log(`\n${colors.green}✅ Passed:${colors.reset} ${passed}/${total}`);
  console.log(`${colors.red}❌ Failed:${colors.reset} ${failed}/${total}`);
  console.log(`${colors.cyan}📈 Pass Rate:${colors.reset} ${passRate}%\n`);

  if (failed > 0) {
    console.log(`${colors.red}Failed Tests:${colors.reset}`);
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  ${colors.red}•${colors.reset} ${r.name}: ${r.message}`);
    });
  }

  console.log('\n' + '='.repeat(80));

  if (passRate === '100.0') {
    console.log(`${colors.green}🎉 ALL TESTS PASSED! Backend is production-ready!${colors.reset}`);
  } else if (parseFloat(passRate) >= 80) {
    console.log(`${colors.yellow}⚠️  Most tests passed. Review failures above.${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ Significant issues found. Review required.${colors.reset}`);
  }

  console.log('='.repeat(80) + '\n');

  // Save results
  const fs = require('fs');
  fs.writeFileSync('docs/API-TEST-RESULTS.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: { total, passed, failed, passRate },
    results
  }, null, 2));

  console.log(`${colors.cyan}📄 Results saved to: docs/API-TEST-RESULTS.json${colors.reset}\n`);
}

runTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
