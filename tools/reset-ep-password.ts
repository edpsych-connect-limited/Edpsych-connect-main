
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Test123!', 10);
  await prisma.users.update({
    where: { email: 'ep@demo.com' },
    data: { password_hash: hashedPassword },
  });
  console.log('Password updated for ep@demo.com');
}

main().catch(console.error).finally(() => prisma.$disconnect());
