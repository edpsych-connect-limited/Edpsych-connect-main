
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.users.findUnique({
    where: { email: 'parent@demo.com' },
  });
  console.log(user ? 'User found' : 'User not found');
  if (user) {
      console.log('User ID:', user.id);
      console.log('Password hash:', user.password_hash);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
