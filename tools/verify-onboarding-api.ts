

const BASE_URL = 'http://127.0.0.1:3000';
const EMAIL = 'teacher@demo.com';
const PASSWORD = 'Test123!';

async function main() {
  console.log('1. Logging in...');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD })
  });

  if (!loginRes.ok) {
    throw new Error(`Login failed: ${loginRes.status} ${loginRes.statusText}`);
  }

  const loginData = await loginRes.json();
  
  // Debug headers
  console.log('Login Headers:', JSON.stringify([...loginRes.headers.entries()], null, 2));

  const setCookie = loginRes.headers.get('set-cookie');
  console.log('Set-Cookie Header:', setCookie);

  let cookie = '';
  if (setCookie) {
    // If it's a string, use it directly. If it's an array (in some fetch implementations), join it.
    // But standard fetch returns a string or null.
    // However, if multiple cookies are set, they might be comma separated or separate headers.
    // For simple auth, we just need the auth-token.
    cookie = setCookie.split(';')[0]; // Take the first part which is usually the value
  } else if (loginData.token) {
      // Fallback if API returns token in body (it should based on previous tasks)
      cookie = `auth-token=${loginData.token}`;
  }

  console.log('Using Cookie:', cookie);
  
  const headers = {
    'Content-Type': 'application/json',
    'Cookie': cookie
  };

  console.log('2. Checking initial status...');
  const statusRes = await fetch(`${BASE_URL}/api/onboarding/status`, { headers });
  const statusData = await statusRes.json();
  
  console.log('Status Response:', JSON.stringify(statusData, null, 2));
  console.log('Initial Status:', JSON.stringify(statusData.data?.currentStep, null, 2));
  if (statusData.data.onboardingCompleted) throw new Error('Onboarding should NOT be completed');
  if (statusData.data.currentStep !== 1) throw new Error('Current step should be 1');

  console.log('3. Starting onboarding...');
  const startRes = await fetch(`${BASE_URL}/api/onboarding/start`, { 
    method: 'POST',
    headers 
  });
  const startData = await startRes.json();
  console.log('Start Response:', startData.success);

  console.log('4. Completing Step 1...');
  const step1Res = await fetch(`${BASE_URL}/api/onboarding/update-step`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      step: 1,
      data: { videoWatched: true },
      completed: true,
      timeSpentSeconds: 10
    })
  });
  const step1Data = await step1Res.json();
  console.log('Step 1 Complete:', step1Data.data.nextStep === 2);

  console.log('5. Skipping to end (simulated)...');
  // We'll just call complete directly to verify the final trigger
  const completeRes = await fetch(`${BASE_URL}/api/onboarding/complete`, {
    method: 'POST',
    headers
  });
  const completeData = await completeRes.json();
  console.log('Complete Response:', completeData.success);

  console.log('6. Verifying final status...');
  const finalStatusRes = await fetch(`${BASE_URL}/api/onboarding/status`, { headers });
  const finalStatusData = await finalStatusRes.json();
  
  console.log('Final Status:', finalStatusData.data.onboardingCompleted);
  if (!finalStatusData.data.onboardingCompleted) throw new Error('Onboarding SHOULD be completed');

  console.log('✅ Onboarding Flow Verified Successfully');
}

main().catch(console.error);
