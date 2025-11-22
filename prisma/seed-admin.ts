import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // 1. CREATE DEFAULT TENANT
  console.log('📦 Creating default tenant...');
  const tenant = await prisma.tenants.upsert({
    where: { subdomain: 'demo' },
    update: {},
    create: {
      name: 'EdPsych Connect Demo School',
      subdomain: 'demo',
      tenant_type: 'SCHOOL',
      status: 'active',
      contact_email: 'scott@edpsychconnect.com',
      urn: 'DEMO001',
      la_code: 'DEMO',
      postcode: 'HP5 1AA',
      settings: {
        theme: 'professional',
        features_enabled: ['all']
      }
    },
  });
  console.log(`✅ Tenant created: ${tenant.name} (ID: ${tenant.id})\n`);

  // 2. CREATE ADMIN USER
  console.log('👤 Creating admin user...');
  
  // Hash password securely
  const password = 'Admin123!'; // CHANGE THIS AFTER FIRST LOGIN
  const hashedPassword = await bcrypt.hash(password, 10);

  const adminUser = await prisma.users.upsert({
    where: { email: 'scott@edpsychconnect.com' },
    update: {},
    create: {
      tenant_id: tenant.id,
      email: 'scott@edpsychconnect.com',
      password_hash: hashedPassword,
      name: 'Dr Scott Ighavongbe-Patrick',
      firstName: 'Scott',
      lastName: 'Ighavongbe-Patrick',
      role: 'SUPER_ADMIN',
      permissions: [
        'ALL_ACCESS',
        'MANAGE_TENANTS',
        'MANAGE_USERS',
        'MANAGE_STUDENTS',
        'MANAGE_COURSES',
        'MANAGE_RESEARCH',
        'VIEW_ANALYTICS',
        'SYSTEM_ADMIN'
      ],
      isEmailVerified: true,
      is_active: true,
    },
  });
  console.log(`✅ Admin user created: ${adminUser.email} (ID: ${adminUser.id})`);
  console.log(`   Password: ${password}\n`);

  // 3. CREATE DEMO SUBSCRIPTION
  console.log('💳 Creating demo subscription...');
  const subscription = await prisma.subscriptions.create({
    data: {
      tenant_id: tenant.id,
      tier: 'SCHOOL_SMALL',
      plan_type: 'Demo Trial',
      payment_status: 'active',
      amount_paid: 0,
      start_date: new Date(),
      end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      is_active: true,
      max_schools: 1,
      max_users: 50,
      max_students: 500,
    },
  });
  console.log(`✅ Subscription created: ${subscription.tier} (ID: ${subscription.id})\n`);

  // 4. CREATE PROFESSIONAL PROFILE
  console.log('👨‍⚕️ Creating professional profile...');
  const professional = await prisma.professionals.upsert({
    where: { user_id: adminUser.id },
    update: {},
    create: {
      user_id: adminUser.id,
      tenant_id: tenant.id,
      professional_type: 'Educational Psychologist',
      specialisation: 'SEND Support & Assessment',
      qualifications: [
        'DEdPsych',
        'CPsychol',
        'HCPC Registered'
      ],
      student_ids: [],
    },
  });
  console.log(`✅ Professional profile created (ID: ${professional.id})\n`);

  console.log('🎉 DATABASE SEEDED SUCCESSFULLY!\n');
  console.log('=' .repeat(60));
  console.log('📋 LOGIN CREDENTIALS:');
  console.log('=' .repeat(60));
  console.log(`Email:    ${adminUser.email}`);
  console.log(`Password: ${password}`);
  console.log(`Tenant:   ${tenant.subdomain}.edpsychconnect.com`);
  console.log('=' .repeat(60));
  console.log('\n⚠️  IMPORTANT: Change your password after first login!\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });