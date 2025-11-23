import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const students = await prisma.students.findMany({
    where: {
      tenants: {
        subdomain: 'demo'
      }
    }
  });

  console.log('Students in demo tenant:');
  students.forEach(s => {
    console.log(`ID: ${s.id}, Name: ${s.first_name} ${s.last_name}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
