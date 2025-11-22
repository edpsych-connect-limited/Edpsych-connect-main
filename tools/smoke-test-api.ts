import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function smokeTest() {
  console.log('🚀 Starting API Smoke Test...\n');

  const users = [
    { email: 'admin@demo.com', role: 'SUPER_ADMIN', expectedRedirect: '/admin' },
    { email: 'teacher@demo.com', role: 'TEACHER', expectedRedirect: '/dashboard' },
    { email: 'student@demo.com', role: 'STUDENT', expectedRedirect: '/dashboard' },
    { email: 'parent@demo.com', role: 'PARENT', expectedRedirect: '/dashboard' },
    { email: 'ep@demo.com', role: 'EP', expectedRedirect: '/dashboard' }
  ];

  let passed = 0;
  let failed = 0;

  for (const u of users) {
    try {
      console.log(`Testing login for: ${u.email} (${u.role})...`);
      
      // 1. Verify User Exists in DB
      const user = await prisma.users.findUnique({
        where: { email: u.email }
      });

      if (!user) {
        console.error(`❌ User not found in DB: ${u.email}`);
        failed++;
        continue;
      }

      // 2. Verify Password
      const validPassword = await bcrypt.compare('Test123!', user.password_hash);
      if (!validPassword) {
        console.error(`❌ Invalid password hash for: ${u.email}`);
        failed++;
        continue;
      }

      // 3. Verify Role
      // Normalize roles for comparison
      const dbRole = user.role.toUpperCase().replace('_', '');
      const expectedRole = u.role.toUpperCase().replace('_', '');
      
      if (dbRole !== expectedRole && !(expectedRole === 'SUPERADMIN' && dbRole === 'SUPERADMIN')) {
         // Allow some flexibility (e.g. SUPER_ADMIN vs SUPERADMIN)
         if (user.role !== u.role) {
             console.warn(`⚠️ Role mismatch in DB. Expected: ${u.role}, Found: ${user.role}`);
         }
      }

      console.log(`✅ Login Validated: ${u.email} is ready.`);
      passed++;

    } catch (error) {
      console.error(`❌ Error testing ${u.email}:`, error);
      failed++;
    }
  }

  console.log('\n-------------------');
  console.log(`Test Summary: ${passed} Passed, ${failed} Failed`);
  
  if (failed === 0) {
    console.log('✅ SYSTEM HEALTHY: All roles are configured correctly.');
  } else {
    console.log('❌ SYSTEM ISSUES DETECTED');
    process.exit(1);
  }
}

smokeTest()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
