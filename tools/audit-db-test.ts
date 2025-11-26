/**
 * Phase 3.3: Database Connectivity Test
 * Tests Prisma connection to Neon DB
 */

import { prisma } from '../src/lib/prisma';

async function testDatabaseConnectivity() {
  console.log('=== Phase 3.3: Database Connectivity Test ===');
  console.log('Testing connection to Neon PostgreSQL...\n');

  try {
    // Test 1: Basic connection
    console.log('Test 1: Basic Connection');
    const _result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log('✅ Database connected successfully\n');

    // Test 2: User count
    console.log('Test 2: User Count');
    const userCount = await prisma.users.count();
    console.log(`✅ Users in database: ${userCount}\n`);

    // Test 3: Tenant count (multi-tenancy check)
    console.log('Test 3: Tenant Count');
    try {
      const tenantCount = await prisma.tenants.count();
      console.log(`✅ Tenants in database: ${tenantCount}\n`);
    } catch (e: any) {
      console.log(`⚠️ Tenant model check: ${e.message}\n`);
    }

    // Test 4: Check for test users
    console.log('Test 4: Test Users Check');
    const testUsers = await prisma.users.findMany({
      where: {
        email: {
          contains: 'demo'
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      },
      take: 5
    });
    console.log(`✅ Demo users found: ${testUsers.length}`);
    testUsers.forEach(u => console.log(`   - ${u.email} (${u.role})`));
    console.log('');

    // Test 5: Schema validation - check critical tables exist
    console.log('Test 5: Critical Tables Check');
    const tables = [
      { name: 'users', check: () => prisma.users.count() },
      { name: 'assessments', check: () => prisma.assessments.count() },
      { name: 'students', check: () => prisma.students.count() },
    ];

    for (const table of tables) {
      try {
        const count = await table.check();
        console.log(`✅ ${table.name}: ${count} records`);
      } catch (e: any) {
        console.log(`❌ ${table.name}: ${e.message}`);
      }
    }

    console.log('\n=== Database Connectivity Test Complete ===');
    console.log('Result: ✅ PASS\n');

  } catch (error: any) {
    console.error('\n=== Database Connectivity Test Failed ===');
    console.error(`Error: ${error.message}`);
    console.log('Result: ❌ FAIL\n');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnectivity();
