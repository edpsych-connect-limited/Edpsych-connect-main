import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SEED_TEST_USERS_PASSWORD = process.env.SEED_TEST_USERS_PASSWORD;

if (!SEED_TEST_USERS_PASSWORD) {
  throw new Error(
    'Missing SEED_TEST_USERS_PASSWORD. Refusing to seed accounts without an explicit password.'
  );
}

async function main() {
  console.log('Seeding LA Admin...');
  
  const tenant = await prisma.tenants.findFirst({
    where: { subdomain: 'demo' }
  });

  if (!tenant) {
    console.error('Tenant not found');
    return;
  }

  const password = await bcrypt.hash(SEED_TEST_USERS_PASSWORD, 10);

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

  console.log('LA Admin seeded: la_admin@demo.com (password set via SEED_TEST_USERS_PASSWORD)');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
