import { ApiClient } from '../api-client';

export async function runAuthTests(api: ApiClient) {
  console.log('  [Auth] Starting tests...');
  
  const testUser = {
    email: `test.integration.${Date.now()}@example.com`,
    password: 'TestPassword123!',
    name: 'Integration Tester'
  };

  // 1. Register
  console.log('  [Auth] Testing Registration...');
  const regRes = await api.post('/api/auth/register', testUser);
  if (regRes.status !== 200 && regRes.status !== 201) {
    throw new Error(`Registration failed: ${regRes.status} ${JSON.stringify(regRes.data)}`);
  }
  console.log('  [Auth] Registration successful.');

  // 2. Login
  console.log('  [Auth] Testing Login...');
  const loginRes = await api.post('/api/auth/login', {
    email: testUser.email,
    password: testUser.password
  });

  if (loginRes.status !== 200) {
    throw new Error(`Login failed: ${loginRes.status} ${JSON.stringify(loginRes.data)}`);
  }

  const token = loginRes.data.token || loginRes.data.session?.sessionToken;
  if (!token) {
    // If using NextAuth, we might not get a token in body but in cookies.
    // For this test, we assume the API returns a token or we need to handle cookies.
    // Let's check if we got a user object at least.
    if (!loginRes.data.user) {
       throw new Error('Login response missing user/token data');
    }
    console.log('  [Auth] Login successful (Session based).');
  } else {
    console.log('  [Auth] Login successful (Token received).');
    api.setToken(token);
  }

  return testUser;
}
