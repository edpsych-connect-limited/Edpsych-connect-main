const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding admin user...');

  // Hash the password
  const hashedPassword = await bcrypt.hash('EdPsych2025!', 10);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'scott@edpsychconnect.com' },
    update: {},
    create: {
      email: 'scott@edpsychconnect.com',
      password: hashedPassword,
      firstName: 'Scott',
      lastName: 'Ighavongbe-Patrick',
      name: 'Dr. Scott Ighavongbe-Patrick',
      role: 'superadmin',
      permissions: ['admin', 'superadmin', 'manage_users', 'manage_courses', 'manage_research'],
      isEmailVerified: true,
    },
  });

  console.log('✅ Admin user created successfully!');
  console.log('📧 Email:', admin.email);
  console.log('👤 Name:', admin.name);
  console.log('🔐 Password: EdPsych2025!');
  console.log('');
  console.log('🎯 You can now login at: http://localhost:3000/login');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });