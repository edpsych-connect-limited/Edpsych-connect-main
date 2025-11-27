const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// PRODUCTION DATABASE
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_rSnga68XPqve@ep-delicate-grass-abi62lhk-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'
    }
  }
});

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
      where: { email: 'scott.ipatrick@edpsychconnect.com' }
    });
    
    if (existing) {
      console.log('\n2. ✅ Founder account already exists! Resetting password...');
      const newHash = await bcrypt.hash('Founder2025!', 12);
      await prisma.users.update({
        where: { id: existing.id },
        data: { 
          password_hash: newHash,
          is_active: true,
          role: 'SUPER_ADMIN'
        }
      });
      console.log('   ✅ Password reset to Founder2025!');
    } else {
      console.log('\n2. Creating new founder account...');
      
      // Get first tenant
      const tenant = await prisma.tenants.findFirst();
      if (!tenant) {
        console.log('   ❌ No tenant found! Cannot create user.');
        return;
      }
      
      const hashedPassword = await bcrypt.hash('Founder2025!', 12);
      
      const founder = await prisma.users.create({
        data: {
          tenant_id: tenant.id,
          email: 'scott.ipatrick@edpsychconnect.com',
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
      where: { email: 'scott.ipatrick@edpsychconnect.com' }
    });
    const isValid = await bcrypt.compare('Founder2025!', verify.password_hash);
    console.log(`   Password valid: ${isValid ? '✅ YES' : '❌ NO'}`);
    console.log(`   Active: ${verify.is_active ? '✅ YES' : '❌ NO'}`);
    console.log(`   Role: ${verify.role}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('LOGIN CREDENTIALS:');
    console.log('  Email: scott.ipatrick@edpsychconnect.com');
    console.log('  Password: Founder2025!');
    console.log('  URL: https://www.edpsychconnect.com/en/login');
    console.log('='.repeat(60));
    
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
