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
  console.log('Checking founder account in USERS table...\n');
  
  try {
    const user = await prisma.users.findUnique({
      where: { email: 'scott.ipatrick@edpsychconnect.com' }
    });
    
    if (!user) {
      console.log('❌ User NOT FOUND in database!');
      console.log('\nLet me search for all users with scott in email...');
      const scottUsers = await prisma.users.findMany({
        where: { email: { contains: 'scott' } }
      });
      console.log('Found:', scottUsers.map(u => u.email));
      return;
    }
    
    console.log('✅ User found:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Name:', user.name);
    console.log('   Role:', user.role);
    console.log('   is_active:', user.is_active);
    console.log('   Password hash exists:', !!user.password_hash);
    console.log('   Hash length:', user.password_hash?.length || 0);
    console.log('   Hash preview:', user.password_hash?.substring(0, 30) + '...');
    
    // Test password verification
    const testPassword = 'Founder2025!';
    const isValid = await bcrypt.compare(testPassword, user.password_hash || '');
    console.log('\n   Password "Founder2025!" valid:', isValid);
    
    if (!isValid) {
      console.log('\n⚠️ Password mismatch - resetting password...');
      const newHash = await bcrypt.hash('Founder2025!', 12);
      console.log('   New hash:', newHash.substring(0, 30) + '...');
      
      await prisma.users.update({
        where: { id: user.id },
        data: { password_hash: newHash }
      });
      console.log('✅ Password reset to "Founder2025!"');
      
      // Verify the reset
      const updatedUser = await prisma.users.findUnique({
        where: { email: 'scott.ipatrick@edpsychconnect.com' }
      });
      const verifyReset = await bcrypt.compare('Founder2025!', updatedUser?.password_hash || '');
      console.log('   Verification after reset:', verifyReset);
    } else {
      console.log('\n✅ Password is already correct!');
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
