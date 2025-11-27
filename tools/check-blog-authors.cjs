const { PrismaClient } = require('@prisma/client');

// PRODUCTION DATABASE
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_rSnga68XPqve@ep-delicate-grass-abi62lhk-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'
    }
  }
});

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
