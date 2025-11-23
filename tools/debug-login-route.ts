
import { POST } from '../src/app/api/auth/login/route';
import { NextRequest } from 'next/server';

// Mock NextRequest
class MockRequest extends NextRequest {
  constructor(body: any) {
    super('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
}

async function main() {
  const email = 'teacher@demo.com';
  const password = 'Test123!';

  console.log(`Testing login route for: ${email}`);
  
  const req = new MockRequest({ email, password });
  
  try {
    const response = await POST(req);
    const data = await response.json();
    
    console.log('Response Status:', response.status);
    console.log('Response Body:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error calling POST:', error);
  }
}

main();
