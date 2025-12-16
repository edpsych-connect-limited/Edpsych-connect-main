const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Refusing to connect.');
}

const prisma = new PrismaClient();

async function main() {
  const email = process.env.DEBUG_LOGIN_EMAIL || 'scott.ipatrick@edpsychconnect.com';

  console.log('='.repeat(60));
  console.log(`DEBUG: Checking login for ${email}`);
  console.log('='.repeat(60));
  
  try {
    // Find the user with exact match
    const user = await prisma.users.findUnique({
      where: { email },
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
    
    // Optional password reset (explicit)
    const shouldReset = process.env.CONFIRM_PASSWORD_RESET === 'YES';
    const newPassword = process.env.DEBUG_LOGIN_NEW_PASSWORD;

    if (shouldReset) {
      if (!newPassword) {
        throw new Error('CONFIRM_PASSWORD_RESET=YES requires DEBUG_LOGIN_NEW_PASSWORD');
      }

      console.log('\n2. Resetting password (not printing plaintext)...');
      const newHash = await bcrypt.hash(newPassword, 12);
      await prisma.users.update({
        where: { id: user.id },
        data: { password_hash: newHash }
      });
      console.log('   ✅ Password reset complete');
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
    console.log(`  Email: ${email}`);
    console.log(`  Ready to login: YES`);
    console.log('='.repeat(60));
    
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
