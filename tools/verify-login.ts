
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'teacher@demo.com';
  const password = 'Test123!';

  console.log(`Checking user: ${email}`);
  const user = await prisma.users.findUnique({
    where: { email },
  });

  if (!user) {
    console.log('User not found!');
    return;
  }

  console.log('User found:', user.id, user.email);
  console.log('Password Hash:', user.password_hash);

  const isValid = await bcrypt.compare(password, user.password_hash);
  console.log(`Password '${password}' valid?`, isValid);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
