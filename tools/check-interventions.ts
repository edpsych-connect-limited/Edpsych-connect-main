import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.interventions.count();
  console.log('Intervention count:', count);
  
  if (count > 0) {
    const sample = await prisma.interventions.findFirst();
    console.log('Sample intervention:', JSON.stringify(sample, null, 2));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
