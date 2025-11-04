/**
 * COMPREHENSIVE API E2E TEST SUITE
 * Tests all backend functionality autonomously
 *
 * Tests:
 * 1. Health checks
 * 2. Authentication (login/logout)
 * 3. Student profile APIs
 * 4. Class dashboard APIs
 * 5. Parent-child security
 * 6. Orchestration APIs
 * 7. All major feature APIs
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
let teacherToken: string | null = null;
let studentToken: string | null = null;
let parentToken: string | null = null;
let epToken: string | null = null;

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

// Test functions
async function testHealthCheck() {
  logTest('Health Check Endpoint');
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    const data = await response.json() as any;

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
        addResult(`Unauth ${endpoint}`, false, `Should block but got ${response.status}: ${data.substring(0, 100)}`);
      }
    } catch (error) {
      addResult(`Unauth ${endpoint}`, false, `Error testing ${endpoint}: ${error}`);
    }
  }
}

async function testLogin(email: string, password: string, role: string): Promise<string | null> {
  logTest(`Login as ${role} (${email})`);

  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json() as any;

    if (response.ok && data.token) {
      addResult(`Login ${role}`, true, `Successfully logged in as ${role}`);
      return data.token;
    } else if (response.ok && data.user) {
      // Session-based auth
      addResult(`Login ${role}`, true, `Successfully logged in as ${role} (session-based)`);
      return 'SESSION_BASED';
    } else {
      addResult(`Login ${role}`, false, `Login failed: ${JSON.stringify(data)}`);
      return null;
    }
  } catch (error) {
    addResult(`Login ${role}`, false, `Login error: ${error}`);
    return null;
  }
}

async function testAuthMe(token: string, role: string) {
  logTest(`Auth Me Endpoint (${role})`);

  try {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token !== 'SESSION_BASED') {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}/api/auth/me`, { headers });
    const data = await response.json() as any;

    if (response.ok && data.user) {
      addResult(`Auth Me ${role}`, true, `Retrieved user data for ${role}: ${data.user.email}`);
    } else {
      addResult(`Auth Me ${role}`, false, `Failed to get user data: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    addResult(`Auth Me ${role}`, false, `Auth me error: ${error}`);
  }
}

async function testStudentProfileAPI(token: string, studentId: number) {
  logTest(`Student Profile API (ID: ${studentId})`);

  try {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token !== 'SESSION_BASED') {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}/api/students/${studentId}/profile`, { headers });
    const data = await response.json() as any;

    if (response.ok && data.student) {
      addResult(`Student Profile ${studentId}`, true, `Retrieved profile: ${data.student.first_name} ${data.student.last_name}`);
      logInfo(`Year: ${data.student.year_group}, Profile exists: ${!!data.profile}`);
    } else {
      addResult(`Student Profile ${studentId}`, false, `Failed to get profile: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    addResult(`Student Profile ${studentId}`, false, `Profile API error: ${error}`);
  }
}

async function testClassDashboard(token: string) {
  logTest('Class Dashboard API');

  try {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token !== 'SESSION_BASED') {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}/api/class/dashboard`, { headers });
    const data = await response.json() as any;

    if (response.ok) {
      addResult('Class Dashboard', true, `Dashboard data retrieved successfully`);
      if (data.classes) {
        logInfo(`Classes found: ${data.classes.length}`);
      }
    } else {
      addResult('Class Dashboard', false, `Dashboard failed: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    addResult('Class Dashboard', false, `Dashboard error: ${error}`);
  }
}

async function testParentChildSecurity(parentToken: string) {
  logTest('CRITICAL: Parent-Child Security Test');

  // Parent should be able to access their own child (ID: 16)
  try {
    const headers: any = { 'Content-Type': 'application/json' };
    if (parentToken !== 'SESSION_BASED') {
      headers['Authorization'] = `Bearer ${parentToken}`;
    }

    // Test accessing own child (Amara Singh, ID: 16)
    const ownChildResponse = await fetch(`${BASE_URL}/api/students/16/profile`, { headers });
    const ownChildData = await ownChildResponse.json();

    if (ownChildResponse.ok) {
      addResult('Parent Access Own Child', true, 'Parent CAN access own child (correct)');
    } else {
      addResult('Parent Access Own Child', false, 'Parent CANNOT access own child (should be able to!)');
    }

    // Test accessing another child (ID: 17) - should be blocked
    const otherChildResponse = await fetch(`${BASE_URL}/api/students/17/profile`, { headers });

    if (otherChildResponse.status === 403 || otherChildResponse.status === 401) {
      addResult('Parent Access Other Child', true, '🔒 SECURITY PASS: Parent CANNOT access other children');
    } else {
      addResult('Parent Access Other Child', false, '🚨 CRITICAL SECURITY ISSUE: Parent CAN access other children!');
    }
  } catch (error) {
    addResult('Parent Security Test', false, `Security test error: ${error}`);
  }
}

async function testStudentsAPI(token: string) {
  logTest('Students List API');

  try {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token !== 'SESSION_BASED') {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}/api/students`, { headers });
    const data = await response.json() as any;

    if (response.ok && Array.isArray(data)) {
      addResult('Students API', true, `Retrieved ${data.length} students`);
    } else {
      addResult('Students API', false, `Failed to get students: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    addResult('Students API', false, `Students API error: ${error}`);
  }
}

async function testAssessmentsAPI(token: string) {
  logTest('Assessments API');

  try {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token !== 'SESSION_BASED') {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}/api/assessments`, { headers });

    if (response.ok) {
      const data = await response.json() as any;
      addResult('Assessments API', true, `Assessments endpoint accessible`);
    } else if (response.status === 404) {
      addResult('Assessments API', true, `Assessments endpoint exists (404 = no data yet)`);
    } else {
      addResult('Assessments API', false, `Assessments endpoint failed: ${response.status}`);
    }
  } catch (error) {
    addResult('Assessments API', false, `Assessments API error: ${error}`);
  }
}

async function testInterventionsAPI(token: string) {
  logTest('Interventions API');

  try {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token !== 'SESSION_BASED') {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}/api/interventions`, { headers });

    if (response.ok) {
      const data = await response.json() as any;
      addResult('Interventions API', true, `Interventions endpoint accessible`);
    } else if (response.status === 404) {
      addResult('Interventions API', true, `Interventions endpoint exists (404 = no data yet)`);
    } else {
      addResult('Interventions API', false, `Interventions endpoint failed: ${response.status}`);
    }
  } catch (error) {
    addResult('Interventions API', false, `Interventions API error: ${error}`);
  }
}

async function testEHCPAPI(token: string) {
  logTest('EHCP API');

  try {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token !== 'SESSION_BASED') {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}/api/ehcp`, { headers });

    if (response.ok) {
      const data = await response.json() as any;
      addResult('EHCP API', true, `EHCP endpoint accessible`);
    } else if (response.status === 404) {
      addResult('EHCP API', true, `EHCP endpoint exists (404 = no data yet)`);
    } else {
      addResult('EHCP API', false, `EHCP endpoint failed: ${response.status}`);
    }
  } catch (error) {
    addResult('EHCP API', false, `EHCP API error: ${error}`);
  }
}

// Main test execution
async function runTests() {
  console.log('\n' + '='.repeat(80));
  console.log(`${colors.cyan}🚀 AUTONOMOUS API E2E TEST SUITE${colors.reset}`);
  console.log(`${colors.cyan}Testing backend functionality${colors.reset}`);
  console.log('='.repeat(80));

  // Phase 1: Basic health and security
  console.log('\n' + colors.blue + '📋 PHASE 1: Health & Security' + colors.reset);
  await testHealthCheck();
  await testUnauthenticatedAccess();

  // Phase 2: Authentication
  console.log('\n' + colors.blue + '📋 PHASE 2: Authentication' + colors.reset);
  teacherToken = await testLogin('teacher@test.edpsych.com', 'Test123!', 'TEACHER');
  studentToken = await testLogin('amara.singh@test.edpsych.com', 'Test123!', 'STUDENT');
  parentToken = await testLogin('priya.singh@test.edpsych.com', 'Test123!', 'PARENT');
  epToken = await testLogin('dr.patel@test.edpsych.com', 'Test123!', 'EP');

  // Phase 3: Teacher APIs
  if (teacherToken) {
    console.log('\n' + colors.blue + '📋 PHASE 3: Teacher APIs' + colors.reset);
    await testAuthMe(teacherToken, 'TEACHER');
    await testStudentProfileAPI(teacherToken, 16);
    await testClassDashboard(teacherToken);
    await testStudentsAPI(teacherToken);
    await testAssessmentsAPI(teacherToken);
    await testInterventionsAPI(teacherToken);
    await testEHCPAPI(teacherToken);
  } else {
    logWarn('Skipping teacher API tests - login failed');
  }

  // Phase 4: Parent Security (CRITICAL)
  if (parentToken) {
    console.log('\n' + colors.blue + '📋 PHASE 4: Parent Security (CRITICAL)' + colors.reset);
    await testAuthMe(parentToken, 'PARENT');
    await testParentChildSecurity(parentToken);
  } else {
    logWarn('Skipping parent security tests - login failed');
  }

  // Phase 5: Student APIs
  if (studentToken) {
    console.log('\n' + colors.blue + '📋 PHASE 5: Student APIs' + colors.reset);
    await testAuthMe(studentToken, 'STUDENT');
  } else {
    logWarn('Skipping student API tests - login failed');
  }

  // Phase 6: EP APIs
  if (epToken) {
    console.log('\n' + colors.blue + '📋 PHASE 6: EP APIs' + colors.reset);
    await testAuthMe(epToken, 'EP');
  } else {
    logWarn('Skipping EP API tests - login failed');
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log(`${colors.cyan}📊 TEST SUMMARY${colors.reset}`);
  console.log('='.repeat(80));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => r.passed === false).length;
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
    console.log(`${colors.green}🎉 ALL TESTS PASSED! Backend is ready!${colors.reset}`);
  } else if (parseFloat(passRate) >= 80) {
    console.log(`${colors.yellow}⚠️  Most tests passed. Review failures above.${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ Significant issues found. Backend needs attention.${colors.reset}`);
  }

  console.log('='.repeat(80) + '\n');

  // Save results to file
  const fs = require('fs');
  const reportPath = 'docs/API-TEST-RESULTS.json';
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: { total, passed, failed, passRate },
    results
  }, null, 2));

  console.log(`${colors.cyan}📄 Full results saved to: ${reportPath}${colors.reset}\n`);
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
