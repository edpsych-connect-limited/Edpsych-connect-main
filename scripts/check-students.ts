import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const students = await prisma.students.findMany({
    where: { tenant_id: 1 },
    select: { id: true, first_name: true, last_name: true, year_group: true },
    take: 10
  });

  console.log(`Found ${students.length} students:`);
  students.forEach(s => console.log(`  - ${s.first_name} ${s.last_name} (${s.year_group}, ID: ${s.id})`));

  await prisma.$disconnect();
}

check();
