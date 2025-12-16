
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || process.env.VERIFY_LOGIN_EMAIL;
  const password = process.argv[3] || process.env.VERIFY_LOGIN_PASSWORD;

  if (!email || !password) {
    console.error('Usage: npx tsx tools/verify-login.ts <email> <password>');
    console.error('Or set VERIFY_LOGIN_EMAIL and VERIFY_LOGIN_PASSWORD');
    process.exit(1);
  }

  const requiredEmail: string = email;
  const requiredPassword: string = password;

  console.log(`Checking user: ${requiredEmail}`);
  const user = await prisma.users.findUnique({
    where: { email: requiredEmail },
  });

  if (!user) {
    console.log('User not found!');
    return;
  }

  console.log('User found:', user.id, user.email);
  const isValid = await bcrypt.compare(requiredPassword, user.password_hash);
  console.log('Password valid?', isValid);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
