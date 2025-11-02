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
      role: 'superadmin',
      permissions: ['admin', 'superadmin', 'manage_users', 'manage_courses', 'manage_research'],
      isEmailVerified: true,
      profile: {
        create: {
          bio: 'Founder of EdPsych Connect - DEdPsych, CPsychol, HCPC Registered',
          credentials: 'DEdPsych, CPsychol, HCPC PYL042340',
        }
      }
    },
  });

  console.log('✅ Admin user created:', admin.email);
  console.log('📧 Email:', admin.email);
  console.log('🔐 Password: EdPsych2025!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });