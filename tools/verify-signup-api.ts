
import { prisma } from '../src/lib/prisma';

const BASE_URL = 'http://127.0.0.1:3000';

async function main() {
  const timestamp = Date.now();
  const email = `test.signup.${timestamp}@example.com`;
  const password = 'TestPassword123!';
  const firstName = 'Test';
  const lastName = 'User';
  const role = 'TEACHER';
  const organization = 'Test School';

  console.log(`1. Attempting signup for ${email}...`);
  
  const res = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      firstName,
      lastName,
      role,
      organization,
      phone: '1234567890'
    })
  });

  const data = await res.json();
  console.log('Signup Response:', JSON.stringify(data, null, 2));

  if (!res.ok || !data.success) {
    throw new Error(`Signup failed: ${res.status} ${JSON.stringify(data)}`);
  }

  console.log('2. Verifying user in database...');
  const user = await prisma.users.findUnique({
    where: { email },
    include: { tenants: true }
  });

  if (!user) {
    throw new Error('User not found in database after signup');
  }

  console.log('User found:', {
    id: user.id,
    email: user.email,
    tenant: user.tenants?.name
  });

  if (user.tenants?.name !== organization) {
    throw new Error(`Tenant name mismatch. Expected ${organization}, got ${user.tenants?.name}`);
  }

  console.log('✅ Signup Flow Verified Successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
