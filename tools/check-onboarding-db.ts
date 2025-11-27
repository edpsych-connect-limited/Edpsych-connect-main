
import { prisma } from '../src/lib/prisma';

async function main() {
  try {
    console.log('Checking onboarding_progress table...');
    const count = await prisma.onboarding_progress.count();
    console.log(`Found ${count} onboarding_progress records.`);
    
    const user = await prisma.users.findFirst();
    if (user) {
        console.log(`Found user: ${user.email} (ID: ${user.id})`);
        const progress = await prisma.onboarding_progress.findUnique({
            where: { user_id: user.id }
        });
        console.log('User progress:', progress);
    } else {
        console.log('No users found.');
    }

  } catch (error) {
    console.error('Error accessing onboarding_progress:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
