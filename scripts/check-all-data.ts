import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const tenants = await prisma.tenants.findMany({
    select: { id: true, name: true, subdomain: true }
  });

  console.log('Tenants:', tenants);

  for (const tenant of tenants) {
    const studentCount = await prisma.students.count({ where: { tenant_id: tenant.id } });
    const profileCount = await prisma.studentProfile.count({ where: { tenant_id: tenant.id } });
    console.log(`\nTenant ${tenant.id} (${tenant.subdomain}):`);
    console.log(`  Students: ${studentCount}`);
    console.log(`  Profiles: ${profileCount}`);
  }

  await prisma.$disconnect();
}

check();
