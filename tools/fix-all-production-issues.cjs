const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Refusing to connect.');
}

if (process.env.CONFIRM_PRODUCTION_FIX_ALL !== 'YES') {
  throw new Error('Refusing to run. Set CONFIRM_PRODUCTION_FIX_ALL=YES to proceed.');
}

const FOUNDER_PASSWORD = process.env.PRODUCTION_FOUNDER_PASSWORD;
const DEMO_PASSWORD = process.env.PRODUCTION_DEMO_PASSWORD;
const BETA_PASSWORD = process.env.PRODUCTION_BETA_PASSWORD;

if (!FOUNDER_PASSWORD || !DEMO_PASSWORD || !BETA_PASSWORD) {
  throw new Error(
    'Missing required env vars: PRODUCTION_FOUNDER_PASSWORD, PRODUCTION_DEMO_PASSWORD, PRODUCTION_BETA_PASSWORD'
  );
}

// Uses DATABASE_URL
const prisma = new PrismaClient();

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
    
    const founderHash = await bcrypt.hash(FOUNDER_PASSWORD, 12);
    const demoHash = await bcrypt.hash(DEMO_PASSWORD, 12);
    const betaHash = await bcrypt.hash(BETA_PASSWORD, 12);
    
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
    console.log(`   ✅ Fixed ${demoEmails.length} demo accounts (password not printed)`);
    
    // Fix beta tester
    await prisma.users.updateMany({
      where: { email: 'beta_tester@demo.com' },
      data: { password_hash: betaHash, is_active: true }
    });
    console.log('   ✅ Beta tester account fixed (password not printed)');

    // ================================================================
    // 3. VERIFY EVERYTHING
    // ================================================================
    console.log('\n3. VERIFICATION...');
    
    // Verify founder login
    const founder = await prisma.users.findUnique({
      where: { email: 'scott.ipatrick@edpsychconnect.com' }
    });
    if (founder) {
      const valid = await bcrypt.compare(FOUNDER_PASSWORD, founder.password_hash);
      console.log(`   Founder login: ${valid ? '✅ WORKS' : '❌ BROKEN'}`);
    }
    
    // Verify demo login
    const demo = await prisma.users.findUnique({
      where: { email: 'teacher@demo.com' }
    });
    if (demo) {
      const valid = await bcrypt.compare(DEMO_PASSWORD, demo.password_hash);
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
    console.log('  Password: (set via PRODUCTION_FOUNDER_PASSWORD)');
    console.log('  URL: https://www.edpsychconnect.com/en/login');
    console.log('\nDEMO ACCOUNTS (password set via env):');
    console.log('  teacher@demo.com, student@demo.com, parent@demo.com');
    console.log('  ep@demo.com, admin@demo.com, researcher@demo.com');
    console.log('\nBETA TESTER:');
    console.log('  Email: beta_tester@demo.com');
    console.log('  Password: (set via PRODUCTION_BETA_PASSWORD)');
    console.log('='.repeat(70));
    
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
