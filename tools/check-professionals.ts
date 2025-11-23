
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const professionals = await prisma.marketplaceProfessional.findMany({
    include: {
      user: true
    }
  });

  console.log(`Found ${professionals.length} professionals.`);
  professionals.forEach(p => {
    console.log(`- ${p.user.name} (ID: ${p.id})`);
    console.log(`  Regions: ${p.la_panel_regions.join(', ')}`);
    console.log(`  Status: ${p.la_panel_status}`);
    console.log(`  Specialties: ${p.specialties.join(', ')}`);
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
