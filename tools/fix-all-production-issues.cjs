const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// PRODUCTION DATABASE - the one Vercel actually uses
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_rSnga68XPqve@ep-delicate-grass-abi62lhk-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'
    }
  }
});

async function main() {
  console.log('='.repeat(70));
  console.log('COMPREHENSIVE PRODUCTION DATABASE FIX');
  console.log('='.repeat(70));
  
  try {
    // ================================================================
    // 1. FIX BLOG POST AUTHORS - Remove fake names
    // ================================================================
    console.log('\n1. FIXING BLOG POST AUTHORS...');
    
    const blogResult = await prisma.blogPost.updateMany({
      data: {
        author_name: 'Dr Scott I-Patrick DEdPsych CPsychol',
        author_email: 'scott@edpsychconnect.world',
        author_bio: 'Founder & Managing Director, EdPsych Connect Limited. Chartered Child and Adolescent Educational Psychologist with over a decade of experience supporting children and young people across early years to college education.'
      }
    });
    console.log(`   ✅ Updated ${blogResult.count} blog posts with correct author`);

    // ================================================================
    // 2. FIX ALL USER PASSWORDS - Ensure they work
    // ================================================================
    console.log('\n2. FIXING USER PASSWORDS...');
    
    const founderHash = await bcrypt.hash('Founder2025!', 12);
    const demoHash = await bcrypt.hash('Test123!', 12);
    const betaHash = await bcrypt.hash('BetaTest2025!', 12);
    
    // Fix founder account
    await prisma.users.updateMany({
      where: { email: 'scott.ipatrick@edpsychconnect.com' },
      data: { 
        password_hash: founderHash, 
        is_active: true,
        role: 'SUPER_ADMIN',
        permissions: ['ALL_ACCESS']
      }
    });
    console.log('   ✅ Founder account fixed');
    
    // Fix scott@edpsychconnect.com
    await prisma.users.updateMany({
      where: { email: 'scott@edpsychconnect.com' },
      data: { 
        password_hash: founderHash, 
        is_active: true,
        role: 'SUPER_ADMIN',
        permissions: ['ALL_ACCESS']
      }
    });
    console.log('   ✅ Secondary founder account fixed');
    
    // Fix all demo accounts
    const demoEmails = [
      'teacher@demo.com', 'student@demo.com', 'parent@demo.com',
      'ep@demo.com', 'admin@demo.com', 'researcher@demo.com',
      'super_admin@demo.com', 'school_admin@demo.com', 'headteacher@demo.com',
      'deputy_head@demo.com', 'subject_lead@demo.com', 'class_teacher@demo.com',
      'teaching_assistant@demo.com', 'sen_coordinator@demo.com', 'edpsych@demo.com'
    ];
    
    for (const email of demoEmails) {
      await prisma.users.updateMany({
        where: { email },
        data: { password_hash: demoHash, is_active: true }
      });
    }
    console.log(`   ✅ Fixed ${demoEmails.length} demo accounts (password: Test123!)`);
    
    // Fix beta tester
    await prisma.users.updateMany({
      where: { email: 'beta_tester@demo.com' },
      data: { password_hash: betaHash, is_active: true }
    });
    console.log('   ✅ Beta tester account fixed (password: BetaTest2025!)');

    // ================================================================
    // 3. VERIFY EVERYTHING
    // ================================================================
    console.log('\n3. VERIFICATION...');
    
    // Verify founder login
    const founder = await prisma.users.findUnique({
      where: { email: 'scott.ipatrick@edpsychconnect.com' }
    });
    if (founder) {
      const valid = await bcrypt.compare('Founder2025!', founder.password_hash);
      console.log(`   Founder login: ${valid ? '✅ WORKS' : '❌ BROKEN'}`);
    }
    
    // Verify demo login
    const demo = await prisma.users.findUnique({
      where: { email: 'teacher@demo.com' }
    });
    if (demo) {
      const valid = await bcrypt.compare('Test123!', demo.password_hash);
      console.log(`   Demo login: ${valid ? '✅ WORKS' : '❌ BROKEN'}`);
    }
    
    // Verify blog authors
    const blogs = await prisma.blogPost.findMany({ select: { author_name: true } });
    const allCorrect = blogs.every(b => b.author_name.includes('Scott'));
    console.log(`   Blog authors: ${allCorrect ? '✅ ALL CORRECT' : '❌ STILL FAKE'}`);

    // ================================================================
    // SUMMARY
    // ================================================================
    console.log('\n' + '='.repeat(70));
    console.log('WORKING CREDENTIALS:');
    console.log('='.repeat(70));
    console.log('\nFOUNDER (Full Access):');
    console.log('  Email: scott.ipatrick@edpsychconnect.com');
    console.log('  Password: Founder2025!');
    console.log('  URL: https://www.edpsychconnect.com/en/login');
    console.log('\nDEMO ACCOUNTS (password: Test123!):');
    console.log('  teacher@demo.com, student@demo.com, parent@demo.com');
    console.log('  ep@demo.com, admin@demo.com, researcher@demo.com');
    console.log('\nBETA TESTER:');
    console.log('  Email: beta_tester@demo.com');
    console.log('  Password: BetaTest2025!');
    console.log('='.repeat(70));
    
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
