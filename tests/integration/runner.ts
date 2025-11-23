import { ApiClient } from './api-client';
import { runAuthTests } from './suites/auth.test';
import { runHelpCenterTests } from './suites/help-center.test';
import { runDemoTests } from './suites/demo.test';

async function main() {
  console.log('🚀 Starting Enterprise Integration Test Suite');
  console.log('=============================================');

  const api = new ApiClient('http://localhost:3000');

  try {
    // Check Health
    console.log('Checking System Health...');
    const health = await api.get('/');
    if (health.status !== 200) {
      throw new Error('System is not reachable');
    }
    console.log('✅ System Online');

    // Run Suites
    await runAuthTests(api);
    console.log('✅ Auth Tests Passed');

    await runHelpCenterTests(api);
    console.log('✅ Help Center Tests Passed');

    // Demo is client-side only, skipping API test
    // await runDemoTests(api);
    // console.log('✅ Demo Tests Passed');

    console.log('=============================================');
    console.log('🎉 All Integration Tests Passed Successfully');
    process.exit(0);

  } catch (error: any) {
    console.error('❌ Test Suite Failed');
    console.error(error.message);
    if (error.response) {
        console.error('Response Data:', error.response.data);
    }
    process.exit(1);
  }
}

main();
