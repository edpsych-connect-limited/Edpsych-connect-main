const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'postgres://neondb_owner:npg_zkQMGCh0ZO8L@ep-steep-boat-abz9lg8e-pooler.eu-west-2.aws.neon.tech/neondb?connect_timeout=15&sslmode=require'
      }
    }
  });
  
  console.log('Checking founder account...\n');
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'scott.ipatrick@edpsychconnect.com' }
    });
    
    if (!user) {
      console.log('❌ User NOT FOUND in database!');
      return;
    }
    
    console.log('✅ User found:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Password hash exists:', !!user.password);
    console.log('   Hash length:', user.password?.length || 0);
    
    const testPassword = 'Founder2025!';
    const isValid = await bcrypt.compare(testPassword, user.password || '');
    console.log('\n   Password "Founder2025!" valid:', isValid);
    
    if (!isValid) {
      console.log('\n⚠️ Password mismatch - resetting password...');
      const newHash = await bcrypt.hash('Founder2025!', 12);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: newHash }
      });
      console.log('✅ Password reset to "Founder2025!"');
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
