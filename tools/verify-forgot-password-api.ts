
import { prisma } from '../src/lib/prisma';

const BASE_URL = 'http://127.0.0.1:3000';
const EMAIL = 'teacher@demo.com';

async function main() {
  console.log(`1. Requesting password reset for ${EMAIL}...`);
  
  const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL })
  });

  const data = await res.json();
  console.log('Response:', JSON.stringify(data, null, 2));

  if (!res.ok || !data.success) {
    throw new Error(`Forgot password request failed: ${res.status} ${JSON.stringify(data)}`);
  }

  console.log('2. Verifying reset token in database...');
  const user = await prisma.users.findUnique({
    where: { email: EMAIL }
  });

  if (!user?.resetPasswordToken) {
    throw new Error('Reset token not generated in database');
  }

  console.log('Reset Token:', user.resetPasswordToken);
  console.log('Expires:', user.resetPasswordExpires);

  console.log('✅ Forgot Password Flow Verified Successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
