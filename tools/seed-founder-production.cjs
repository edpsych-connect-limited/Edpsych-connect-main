const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Refusing to connect.');
}

if (process.env.CONFIRM_PRODUCTION_SEED !== 'YES') {
  throw new Error('Refusing to run. Set CONFIRM_PRODUCTION_SEED=YES to proceed.');
}

const FOUNDER_EMAIL = process.env.FOUNDER_EMAIL;
const FOUNDER_PASSWORD = process.env.FOUNDER_PASSWORD;

if (!FOUNDER_EMAIL || !FOUNDER_PASSWORD) {
  throw new Error('Missing FOUNDER_EMAIL or FOUNDER_PASSWORD.');
}

// Uses DATABASE_URL
const prisma = new PrismaClient();

async function main() {
  console.log('='.repeat(60));
  console.log('SEEDING FOUNDER ACCOUNT IN PRODUCTION DATABASE');
  console.log('='.repeat(60));
  
  try {
    // First, list all existing users
    console.log('\n1. Current users in PRODUCTION database:');
    const users = await prisma.users.findMany({
      select: { id: true, email: true, role: true }
    });
    for (const u of users) {
      console.log(`   ${u.id}: ${u.email} (${u.role})`);
    }
    
    // Check if founder already exists
    const existing = await prisma.users.findUnique({
      where: { email: FOUNDER_EMAIL }
    });
    
    if (existing) {
      console.log('\n2. ✅ Founder account already exists! Resetting password...');
      const newHash = await bcrypt.hash(FOUNDER_PASSWORD, 12);
      await prisma.users.update({
        where: { id: existing.id },
        data: { 
          password_hash: newHash,
          is_active: true,
          role: 'SUPER_ADMIN'
        }
      });
      console.log('   ✅ Password reset complete');
    } else {
      console.log('\n2. Creating new founder account...');
      
      // Get first tenant
      const tenant = await prisma.tenants.findFirst();
      if (!tenant) {
        console.log('   ❌ No tenant found! Cannot create user.');
        return;
      }
      
      const hashedPassword = await bcrypt.hash(FOUNDER_PASSWORD, 12);
      
      const founder = await prisma.users.create({
        data: {
          tenant_id: tenant.id,
          email: FOUNDER_EMAIL,
          password_hash: hashedPassword,
          name: 'Dr Scott Ighavongbe-Patrick',
          firstName: 'Scott',
          lastName: 'Ighavongbe-Patrick',
          role: 'SUPER_ADMIN',
          permissions: ['ALL_ACCESS'],
          isEmailVerified: true,
          is_active: true,
          onboarding_completed: true,
        }
      });
      
      console.log(`   ✅ Created founder account (ID: ${founder.id})`);
    }
    
    // Verify
    console.log('\n3. Verifying login...');
    const verify = await prisma.users.findUnique({
      where: { email: FOUNDER_EMAIL }
    });
    const isValid = await bcrypt.compare(FOUNDER_PASSWORD, verify.password_hash);
    console.log(`   Password valid: ${isValid ? '✅ YES' : '❌ NO'}`);
    console.log(`   Active: ${verify.is_active ? '✅ YES' : '❌ NO'}`);
    console.log(`   Role: ${verify.role}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('LOGIN CREDENTIALS:');
    console.log(`  Email: ${FOUNDER_EMAIL}`);
    console.log('  Password: (not printed)');
    console.log('  URL: https://www.edpsychconnect.com/en/login');
    console.log('='.repeat(60));
    
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
