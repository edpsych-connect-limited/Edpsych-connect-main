import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding LA Admin...');
  
  const tenant = await prisma.tenants.findFirst({
    where: { subdomain: 'demo' }
  });

  if (!tenant) {
    console.error('Tenant not found');
    return;
  }

  const password = await bcrypt.hash('Test123!', 10);

  await prisma.users.upsert({
    where: { email: 'la_admin@demo.com' },
    update: {
      password_hash: password,
      role: 'LA_ADMIN',
      tenant_id: tenant.id,
      is_active: true
    },
    create: {
      email: 'la_admin@demo.com',
      password_hash: password,
      name: 'LA Admin',
      firstName: 'LA',
      lastName: 'Admin',
      role: 'LA_ADMIN',
      tenant_id: tenant.id,
      is_active: true,
      isEmailVerified: true,
      permissions: ['MANAGE_LA', 'VIEW_ALL_CASES']
    }
  });

  console.log('LA Admin seeded: la_admin@demo.com / Test123!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
