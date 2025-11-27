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
    
    const hashedPassword = await bcrypt.hash('BetaTest2025!', 12);
    
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
    
    const demoPassword = await bcrypt.hash('Test123!', 12);
    
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
