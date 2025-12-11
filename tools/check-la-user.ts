import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.users.findUnique({
    where: { email: 'la_admin@demo.com' },
  });

  if (user) {
    console.log('User found:', user.email);
    console.log('Role:', user.role);
    console.log('Tenant ID:', user.tenant_id);
  } else {
    console.log('User not found');
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
