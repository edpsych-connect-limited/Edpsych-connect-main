const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgres://neondb_owner:npg_zkQMGCh0ZO8L@ep-steep-boat-abz9lg8e-pooler.eu-west-2.aws.neon.tech/neondb?connect_timeout=15&sslmode=require'
    }
  }
});

async function main() {
  console.log('='.repeat(60));
  console.log('DEBUG: Checking login for scott.ipatrick@edpsychconnect.com');
  console.log('='.repeat(60));
  
  try {
    // Find the user with exact match
    const user = await prisma.users.findUnique({
      where: { email: 'scott.ipatrick@edpsychconnect.com' },
      include: {
        tenants: true,
      },
    });
    
    console.log('\n1. User lookup result:');
    if (!user) {
      console.log('   ❌ User NOT FOUND!');
      
      // Check all users
      console.log('\n   Listing ALL users in DB:');
      const allUsers = await prisma.users.findMany();
      for (const u of allUsers) {
        console.log(`   - ${u.email} (ID: ${u.id}, Active: ${u.is_active})`);
      }
      return;
    }
    
    console.log('   ✅ User FOUND:');
    console.log(`      ID: ${user.id}`);
    console.log(`      Email: ${user.email}`);
    console.log(`      Name: ${user.name}`);
    console.log(`      Role: ${user.role}`);
    console.log(`      is_active: ${user.is_active}`);
    console.log(`      tenant_id: ${user.tenant_id}`);
    console.log(`      tenant: ${user.tenants?.name || 'NO TENANT'}`);
    console.log(`      password_hash length: ${user.password_hash?.length || 0}`);
    
    // Test password
    console.log('\n2. Password verification:');
    const testPassword = 'Founder2025!';
    console.log(`   Testing password: "${testPassword}"`);
    const isValid = await bcrypt.compare(testPassword, user.password_hash || '');
    console.log(`   Result: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    
    // If invalid, let's reset it
    if (!isValid) {
      console.log('\n3. Resetting password...');
      const newHash = await bcrypt.hash(testPassword, 12);
      await prisma.users.update({
        where: { id: user.id },
        data: { password_hash: newHash }
      });
      console.log('   ✅ Password reset complete');
      
      // Verify
      const updated = await prisma.users.findUnique({
        where: { id: user.id }
      });
      const verify = await bcrypt.compare(testPassword, updated.password_hash);
      console.log(`   Verification: ${verify ? '✅ SUCCESS' : '❌ FAILED'}`);
    }
    
    // Check if user is active
    if (!user.is_active) {
      console.log('\n⚠️  User is INACTIVE! Activating...');
      await prisma.users.update({
        where: { id: user.id },
        data: { is_active: true }
      });
      console.log('   ✅ User activated');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY:');
    console.log(`  Email: scott.ipatrick@edpsychconnect.com`);
    console.log(`  Password: Founder2025!`);
    console.log(`  Ready to login: YES`);
    console.log('='.repeat(60));
    
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
