
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'teacher@demo.com';
  
  console.log(`Resetting onboarding for ${email}...`);

  const user = await prisma.users.findUnique({
    where: { email }
  });

  if (!user) {
    console.error('User not found');
    process.exit(1);
  }

  // Delete progress
  await prisma.onboarding_progress.deleteMany({
    where: { user_id: user.id }
  });

  // Reset user flags
  await prisma.users.update({
    where: { id: user.id },
    data: {
      onboarding_completed: false,
      onboarding_skipped: false,
      onboarding_step: 1,
      onboarding_started_at: null,
      onboarding_completed_at: null
    }
  });

  console.log('Onboarding reset successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
