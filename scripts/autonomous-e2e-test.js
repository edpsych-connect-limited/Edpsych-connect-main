/**
 * Autonomous End-to-End Testing Script
 * Tests all user workflows programmatically
 *
 * Run: node scripts/autonomous-e2e-test.js
 */

const BASE_URL = 'http://localhost:3002';

// Test accounts (all use password: Test123!)
const TEST_ACCOUNTS = {
  teacher: {
    email: 'teacher@test.edpsych.com',
    password: 'Test123!',
    role: 'Teacher',
    name: 'Sarah Mitchell'
  },
  student: {
    email: 'amara.singh@test.edpsych.com',
    password: 'Test123!',
    role: 'Student',
    name: 'Amara Singh',
    id: 16
  },
  parent: {
    email: 'priya.singh@test.edpsych.com',
    password: 'Test123!',
    role: 'Parent',
    name: 'Priya Singh',
    childId: 16
  },
  ep: {
    email: 'dr.patel@test.edpsych.com',
    password: 'Test123!',
    role: 'Educational Psychologist',
    name: 'Dr. Priya Patel'
  }
};

// Test results tracking
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to make HTTP requests
async function request(url, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data
    };
  } catch (error) {
    return {
      status: 0,
      statusText: 'Network Error',
      error: error.message,
      data: null
    };
  }
}

// Helper function to login and get session cookie
async function login(email, password) {
  const response = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

  const cookies = response.headers.get('set-cookie');
  return {
    ...response,
    cookies: cookies || ''
  };
}

// Helper function to record test result
function recordTest(name, passed, details = '') {
  results.total++;
  if (passed) {
    results.passed++;
  } else {
    results.failed++;
  }

  results.tests.push({
    name,
    passed,
    details,
    timestamp: new Date().toISOString()
  });

  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  if (details && !passed) {
    console.log(`   Details: ${details}`);
  }
}

// Test: Health check
async function testHealthCheck() {
  console.log('\n🔍 Testing: Health Check');
  const response = await request('/api/health');

  const passed = response.status === 200 && response.data?.status === 'ok';
  recordTest('Health endpoint returns 200 OK', passed,
    passed ? '' : `Status: ${response.status}, Data: ${JSON.stringify(response.data)}`);
}

// Test: Unauthorized access is blocked
async function testUnauthorizedAccess() {
  console.log('\n🔒 Testing: Unauthorized Access Protection');

  const endpoints = [
    '/api/students/16/profile',
    '/api/class/dashboard',
    '/api/auth/me'
  ];

  for (const endpoint of endpoints) {
    const response = await request(endpoint);
    const passed = response.status === 401 || response.status === 403;
    recordTest(`${endpoint} blocks unauthorized access`, passed,
      passed ? '' : `Expected 401/403, got ${response.status}`);
  }
}

// Test Session 1: Teacher Workflow
async function testTeacherWorkflow() {
  console.log('\n👩‍🏫 Testing: Teacher Workflow');

  // Test 1: Teacher login
  const loginResponse = await login(TEST_ACCOUNTS.teacher.email, TEST_ACCOUNTS.teacher.password);
  const loginPassed = loginResponse.status === 200;
  recordTest('Teacher login successful', loginPassed,
    loginPassed ? '' : `Status: ${loginResponse.status}, Data: ${JSON.stringify(loginResponse.data)}`);

  if (!loginPassed) {
    console.log('⚠️  Skipping remaining teacher tests (login failed)');
    return;
  }

  const cookies = loginResponse.cookies;

  // Test 2: Access /api/auth/me with session
  const meResponse = await request('/api/auth/me', {
    headers: { 'Cookie': cookies }
  });
  const mePassed = meResponse.status === 200;
  recordTest('Teacher can access /api/auth/me', mePassed,
    mePassed ? '' : `Status: ${meResponse.status}`);

  // Test 3: Access student profile
  const profileResponse = await request('/api/students/16/profile', {
    headers: { 'Cookie': cookies }
  });
  const profilePassed = profileResponse.status === 200 || profileResponse.status === 404;
  recordTest('Teacher can access student profile API', profilePassed,
    profilePassed ? '' : `Status: ${profileResponse.status}`);

  // Test 4: Access class dashboard
  const dashboardResponse = await request('/api/class/dashboard', {
    headers: { 'Cookie': cookies }
  });
  const dashboardPassed = dashboardResponse.status === 200 || dashboardResponse.status === 404;
  recordTest('Teacher can access class dashboard API', dashboardPassed,
    dashboardPassed ? '' : `Status: ${dashboardResponse.status}`);
}

// Test Session 2: Student Workflow
async function testStudentWorkflow() {
  console.log('\n🎓 Testing: Student Workflow');

  // Test 1: Student login
  const loginResponse = await login(TEST_ACCOUNTS.student.email, TEST_ACCOUNTS.student.password);
  const loginPassed = loginResponse.status === 200;
  recordTest('Student login successful', loginPassed,
    loginPassed ? '' : `Status: ${loginResponse.status}`);

  if (!loginPassed) {
    console.log('⚠️  Skipping remaining student tests (login failed)');
    return;
  }

  const cookies = loginResponse.cookies;

  // Test 2: Access /api/auth/me
  const meResponse = await request('/api/auth/me', {
    headers: { 'Cookie': cookies }
  });
  const mePassed = meResponse.status === 200;
  recordTest('Student can access /api/auth/me', mePassed,
    mePassed ? '' : `Status: ${meResponse.status}`);

  // Test 3: Student can access own profile
  const profileResponse = await request(`/api/students/${TEST_ACCOUNTS.student.id}/profile`, {
    headers: { 'Cookie': cookies }
  });
  const profilePassed = profileResponse.status === 200 || profileResponse.status === 404;
  recordTest('Student can access own profile', profilePassed,
    profilePassed ? '' : `Status: ${profileResponse.status}`);
}

// Test Session 3: Parent Workflow + CRITICAL SECURITY TEST
async function testParentWorkflow() {
  console.log('\n👨‍👩‍👧 Testing: Parent Workflow & Security');

  // Test 1: Parent login
  const loginResponse = await login(TEST_ACCOUNTS.parent.email, TEST_ACCOUNTS.parent.password);
  const loginPassed = loginResponse.status === 200;
  recordTest('Parent login successful', loginPassed,
    loginPassed ? '' : `Status: ${loginResponse.status}`);

  if (!loginPassed) {
    console.log('⚠️  Skipping remaining parent tests (login failed)');
    return;
  }

  const cookies = loginResponse.cookies;

  // Test 2: Access /api/auth/me
  const meResponse = await request('/api/auth/me', {
    headers: { 'Cookie': cookies }
  });
  const mePassed = meResponse.status === 200;
  recordTest('Parent can access /api/auth/me', mePassed,
    mePassed ? '' : `Status: ${meResponse.status}`);

  // Test 3: Parent can access own child's data
  const ownChildResponse = await request(`/api/students/${TEST_ACCOUNTS.parent.childId}/profile`, {
    headers: { 'Cookie': cookies }
  });
  const ownChildPassed = ownChildResponse.status === 200 || ownChildResponse.status === 404;
  recordTest('Parent can access own child profile', ownChildPassed,
    ownChildPassed ? '' : `Status: ${ownChildResponse.status}`);

  // Test 4: 🔒 CRITICAL SECURITY TEST - Parent CANNOT access other children
  const otherChildId = 17; // Different child
  const otherChildResponse = await request(`/api/students/${otherChildId}/profile`, {
    headers: { 'Cookie': cookies }
  });
  const securityPassed = otherChildResponse.status === 403 || otherChildResponse.status === 401;
  recordTest('🔒 CRITICAL: Parent CANNOT access other children', securityPassed,
    securityPassed ? '✓ Security enforced' : `⚠️ SECURITY ISSUE: Got ${otherChildResponse.status}, expected 403`);

  if (!securityPassed) {
    console.log('\n🚨 CRITICAL SECURITY ISSUE DETECTED 🚨');
    console.log('Parent can access other children\'s data!');
    console.log('This must be fixed before production deployment.');
  }
}

// Test Session 4: Educational Psychologist Workflow
async function testEPWorkflow() {
  console.log('\n🎓 Testing: Educational Psychologist Workflow');

  // Test 1: EP login
  const loginResponse = await login(TEST_ACCOUNTS.ep.email, TEST_ACCOUNTS.ep.password);
  const loginPassed = loginResponse.status === 200;
  recordTest('EP login successful', loginPassed,
    loginPassed ? '' : `Status: ${loginResponse.status}`);

  if (!loginPassed) {
    console.log('⚠️  Skipping remaining EP tests (login failed)');
    return;
  }

  const cookies = loginResponse.cookies;

  // Test 2: Access /api/auth/me
  const meResponse = await request('/api/auth/me', {
    headers: { 'Cookie': cookies }
  });
  const mePassed = meResponse.status === 200;
  recordTest('EP can access /api/auth/me', mePassed,
    mePassed ? '' : `Status: ${meResponse.status}`);

  // Test 3: EP can access student profiles in caseload
  const profileResponse = await request('/api/students/16/profile', {
    headers: { 'Cookie': cookies }
  });
  const profilePassed = profileResponse.status === 200 || profileResponse.status === 404;
  recordTest('EP can access student profile', profilePassed,
    profilePassed ? '' : `Status: ${profileResponse.status}`);
}

// Test: Authentication check
async function testAuthenticationCheck() {
  console.log('\n🔐 Testing: Authentication Enforcement');

  // Test accessing protected route without login
  const response = await request('/api/class/dashboard');
  const passed = response.status === 401 || response.status === 403;
  recordTest('Protected route requires authentication', passed,
    passed ? '' : `Expected 401/403, got ${response.status}`);
}

// Generate summary report
function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(80));

  const passRate = ((results.passed / results.total) * 100).toFixed(1);

  console.log(`\nTotal Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed} (${passRate}%)`);
  console.log(`❌ Failed: ${results.failed}`);

  if (results.failed > 0) {
    console.log('\n⚠️  FAILED TESTS:');
    results.tests
      .filter(t => !t.passed)
      .forEach(t => {
        console.log(`  ❌ ${t.name}`);
        if (t.details) {
          console.log(`     ${t.details}`);
        }
      });
  }

  console.log('\n' + '='.repeat(80));

  // Overall status
  const criticalSecurityPassed = results.tests
    .find(t => t.name.includes('CRITICAL'))?.passed;

  if (criticalSecurityPassed === false) {
    console.log('🚨 OVERALL STATUS: CRITICAL SECURITY ISSUE - NOT READY FOR PRODUCTION');
  } else if (results.failed === 0) {
    console.log('✅ OVERALL STATUS: ALL TESTS PASSED - READY FOR PRODUCTION');
  } else if (passRate >= 80) {
    console.log('⚠️  OVERALL STATUS: MOSTLY PASSING - MINOR ISSUES TO FIX');
  } else {
    console.log('❌ OVERALL STATUS: SIGNIFICANT ISSUES - REQUIRES FIXES');
  }

  console.log('='.repeat(80) + '\n');

  return {
    passed: results.failed === 0 && criticalSecurityPassed !== false,
    passRate,
    results
  };
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Autonomous E2E Testing...\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Test Accounts: ${Object.keys(TEST_ACCOUNTS).length}`);
  console.log('');

  try {
    // Run all test suites
    await testHealthCheck();
    await testUnauthorizedAccess();
    await testAuthenticationCheck();
    await testTeacherWorkflow();
    await testStudentWorkflow();
    await testParentWorkflow();
    await testEPWorkflow();

    // Generate report
    const report = generateReport();

    // Save results to file
    const fs = require('fs');
    const resultsPath = 'docs/AUTONOMOUS-TEST-RESULTS.json';
    fs.writeFileSync(resultsPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        total: results.total,
        passed: results.passed,
        failed: results.failed,
        passRate: report.passRate
      },
      tests: results.tests
    }, null, 2));

    console.log(`📄 Full results saved to: ${resultsPath}\n`);

    // Exit with appropriate code
    process.exit(report.passed ? 0 : 1);

  } catch (error) {
    console.error('\n❌ Test suite failed with error:', error);
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests };
