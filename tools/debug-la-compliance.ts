
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Debugging LA Compliance API...');
  
  const email = 'la_admin@demo.com';
  const user = await prisma.users.findUnique({
    where: { email },
    include: { tenants: true }
  });

  if (!user) {
    console.error(`User ${email} not found!`);
    return;
  }
  
  console.log(`User found: ID=${user.id}, Role=${user.role}, TenantID=${user.tenant_id}`);
  
  if (!['ADMIN', 'LA_ADMIN'].includes(user.role) && !['admin', 'la_admin'].includes(user.role.toLowerCase())) {
     console.error(`Invalid role: ${user.role}`);
  }

  const laTenantId = user.tenant_id;
  console.log(`Querying EHCPApplication for tenant ${laTenantId}...`);

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 12); // Period 12 months

  try {
    const applications = await prisma.eHCPApplication.findMany({
      where: {
        la_tenant_id: laTenantId,
        referral_date: { gte: startDate },
      }
    });
    
    console.log(`Found ${applications.length} applications.`);
  } catch (e) {
    console.error('Error querying applications:', e);
  }
}

main()
  .catch(console.error)
  .finally(async () => await prisma.$disconnect());
