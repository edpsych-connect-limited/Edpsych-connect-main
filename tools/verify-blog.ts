
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const postCount = await prisma.blogPost.count();
  const categoryCount = await prisma.blogCategory.count();
  const tagCount = await prisma.blogTag.count();

  console.log(`Blog Verification:`);
  console.log(`- Posts: ${postCount}`);
  console.log(`- Categories: ${categoryCount}`);
  console.log(`- Tags: ${tagCount}`);

  if (postCount === 0) {
    console.error('❌ Blog seeding failed or was incomplete.');
    process.exit(1);
  } else {
    console.log('✅ Blog content verified.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
