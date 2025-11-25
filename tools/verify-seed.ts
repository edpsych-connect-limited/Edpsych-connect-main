import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tiers = await prisma.tierConfiguration.findMany();
  console.log('Tiers:', tiers);
  
  const config = await prisma.systemConfig.findMany();
  console.log('System Configs:', config.length);

  const tips = await prisma.parentalTip.findMany();
  console.log('Parental Tips:', tips.length);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
