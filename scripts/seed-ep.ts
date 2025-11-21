import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting EP Seeding...');

  // 1. Get Demo Tenant
  const demoTenant = await prisma.tenants.findUnique({
    where: { subdomain: 'demo-school' }
  });

  if (!demoTenant) {
    console.error('❌ Demo tenant not found. Run seed-world.ts first.');
    return;
  }

  // 2. Create EP User
  const epPassword = await hash('ep123', 12);
  const epUser = await prisma.users.upsert({
    where: { email: 'dr.stone@edpsych.connect' },
    update: {},
    create: {
      email: 'dr.stone@edpsych.connect',
      name: 'Dr. Emily Stone',
      password_hash: epPassword,
      role: 'PROFESSIONAL', // Assuming this maps to EP
      tenant_id: demoTenant.id,
      is_active: true,
      firstName: 'Emily',
      lastName: 'Stone'
    }
  });

  // 3. Create Professional Profile
  await prisma.professionals.upsert({
    where: { user_id: epUser.id },
    update: {},
    create: {
      user_id: epUser.id,
      tenant_id: demoTenant.id,
      professional_type: 'Educational Psychologist',
      specialisation: 'Neurodevelopmental Disorders',
      qualifications: ['PhD Psychology', 'HCPC Registered'],
      student_ids: [] // Will be populated as they are assigned
    }
  });

  console.log(`👩‍⚕️ EP Ready: ${epUser.name}`);

  // 4. Create some dummy assessments (if needed)
  // This would populate the 'assessments' table
  
  console.log('✅ EP Seeding Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
