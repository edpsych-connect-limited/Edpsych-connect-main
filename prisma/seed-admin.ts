import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

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
  const shouldPrintPassword = process.env.PRINT_SEED_PASSWORD === 'true';

  let password = process.env.SEED_ADMIN_PASSWORD;
  if (!password) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'SEED_ADMIN_PASSWORD must be set when running seed-admin in production (refusing to generate or hardcode a password).'
      );
    }

    // Development convenience: generate a strong random password if none is provided.
    password = crypto.randomBytes(18).toString('base64url');
    console.log('⚠️  SEED_ADMIN_PASSWORD not set; generated a one-time password for this seed run.');
    console.log('   (Set SEED_ADMIN_PASSWORD to control this and avoid printing secrets in logs.)');
  }

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
  if (process.env.SEED_ADMIN_PASSWORD) {
    console.log(`   Password: ${shouldPrintPassword ? password : '(from SEED_ADMIN_PASSWORD)'}\n`);
  } else {
    console.log(`   Password: ${password}\n`);
  }

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
  if (process.env.SEED_ADMIN_PASSWORD) {
    console.log(`Password: ${shouldPrintPassword ? password : '(from SEED_ADMIN_PASSWORD)'}\n`);
    if (!shouldPrintPassword) {
      console.log('To print the password in this seed run output, set PRINT_SEED_PASSWORD=true');
    }
  } else {
    console.log(`Password: ${password}`);
  }
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