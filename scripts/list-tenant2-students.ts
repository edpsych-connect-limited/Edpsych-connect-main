import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const students = await prisma.students.findMany({
    where: { tenant_id: 2 },
    select: { id: true, first_name: true, last_name: true, year_group: true },
    orderBy: { first_name: 'asc' }
  });

  console.log(`\nFound ${students.length} students in tenant 2 (test-school):\n`);
  students.forEach((s, i) => console.log(`${i+1}. ${s.first_name} ${s.last_name} - ${s.year_group} (ID: ${s.id})`));

  await prisma.$disconnect();
}

check();
