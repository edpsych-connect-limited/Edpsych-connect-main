const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Refusing to connect.');
}

if (process.env.CONFIRM_PRODUCTION_FIX !== 'YES') {
  throw new Error('Refusing to run. Set CONFIRM_PRODUCTION_FIX=YES to proceed.');
}

const BETA_TESTER_PASSWORD = process.env.PRODUCTION_BETA_TESTER_PASSWORD;
const DEMO_ACCOUNTS_PASSWORD = process.env.PRODUCTION_DEMO_ACCOUNTS_PASSWORD;

if (!BETA_TESTER_PASSWORD || !DEMO_ACCOUNTS_PASSWORD) {
  throw new Error('Missing PRODUCTION_BETA_TESTER_PASSWORD or PRODUCTION_DEMO_ACCOUNTS_PASSWORD.');
}

// Uses DATABASE_URL
const prisma = new PrismaClient();

async function main() {
  console.log('='.repeat(70));
  console.log('FIXING PRODUCTION DATABASE ISSUES');
  console.log('='.repeat(70));
  
  try {
    // 1. Fix Beta Tester users - ensure they have proper passwords
    console.log('\n1. FIXING BETA TESTER ACCOUNTS...');
    
    const betaTesters = await prisma.users.findMany({
      where: {
        OR: [
          { role: 'beta_tester' },
          { role: 'BETA_TESTER' },
          { email: { contains: 'beta' } }
        ]
      }
    });
    
    console.log(`   Found ${betaTesters.length} beta tester accounts`);
    
    const hashedPassword = await bcrypt.hash(BETA_TESTER_PASSWORD, 12);
    
    for (const tester of betaTesters) {
      await prisma.users.update({
        where: { id: tester.id },
        data: { 
          password_hash: hashedPassword,
          is_active: true
        }
      });
      console.log(`   ✅ Fixed: ${tester.email}`);
    }
    
    // 2. Ensure all demo accounts work
    console.log('\n2. FIXING ALL DEMO ACCOUNTS...');
    
    const demoAccounts = [
      'teacher@demo.com',
      'student@demo.com', 
      'parent@demo.com',
      'ep@demo.com',
      'admin@demo.com',
      'researcher@demo.com'
    ];
    
    const demoPassword = await bcrypt.hash(DEMO_ACCOUNTS_PASSWORD, 12);
    
    for (const email of demoAccounts) {
      const user = await prisma.users.findUnique({ where: { email } });
      if (user) {
        await prisma.users.update({
          where: { id: user.id },
          data: { 
            password_hash: demoPassword,
            is_active: true
          }
        });
        console.log(`   ✅ Fixed: ${email}`);
      } else {
        console.log(`   ⚠️  Not found: ${email}`);
      }
    }
    
    // 3. List all unique roles in the system
    console.log('\n3. ALL ROLES IN PRODUCTION DATABASE:');
    const roles = await prisma.users.groupBy({
      by: ['role'],
      _count: { role: true }
    });
    
    for (const r of roles) {
      console.log(`   ${r.role}: ${r._count.role} users`);
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('PRODUCTION DATABASE FIX COMPLETE');
    console.log('='.repeat(70));
    
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
