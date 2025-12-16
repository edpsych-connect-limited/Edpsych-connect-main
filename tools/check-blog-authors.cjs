const { PrismaClient } = require('@prisma/client');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Refusing to connect.');
}

const prisma = new PrismaClient();

async function main() {
  console.log('Checking blog posts in PRODUCTION database...\n');
  
  try {
    const posts = await prisma.blogPost.findMany({
      select: {
        id: true,
        title: true,
        author_name: true,
        is_published: true,
      }
    });
    
    console.log(`Found ${posts.length} blog posts:\n`);
    
    for (const post of posts) {
      console.log(`ID: ${post.id}`);
      console.log(`  Title: ${post.title.substring(0, 50)}...`);
      console.log(`  Author: ${post.author_name}`);
      console.log(`  Published: ${post.is_published}`);
      console.log('');
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
