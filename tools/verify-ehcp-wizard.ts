
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyEHCPWizard() {
  console.log('🧙 Verifying EHCP Wizard Logic...');

  try {
    // 1. Find our Test Student
    const student = await prisma.students.findFirst({
      where: { unique_id: 'RISK-TEST-001' },
      include: { tenants: true }
    });

    if (!student) {
      throw new Error('Test student not found. Run seed-la-cases.ts first.');
    }

    console.log(`✅ Found Student: ${student.first_name} ${student.last_name} (ID: ${student.id})`);

    // 2. Simulate "Create New EHCP" (Persistence)
    console.log('\n--- Testing Persistence ---');
    const planDetails = {
      status: 'draft',
      section_a: { child_views: 'I like school.' },
      section_b: { primary_need: 'SEMH' }
    };

    const ehcp = await prisma.ehcps.create({
      data: {
        tenant_id: student.tenant_id,
        student_id: student.id.toString(), // Schema uses String for student_id in ehcps
        plan_details: planDetails,
        status: 'draft'
      }
    });

    console.log(`✅ EHCP Draft Created (ID: ${ehcp.id})`);
    console.log(`   Status: ${ehcp.status}`);

    // 3. Verify Statutory Timeline Logic (20-Week Clock)
    // The clock is tied to the CASE, not just the EHCP document.
    // Let's find the active case for this student.
    console.log('\n--- Testing Statutory Timeline Logic ---');
    
    const activeCase = await prisma.cases.findFirst({
      where: { 
        student_id: student.id,
        status: { not: 'closed' }
      },
      orderBy: { referral_date: 'desc' }
    });

    if (activeCase) {
      const referralDate = new Date(activeCase.referral_date);
      const deadline = new Date(referralDate);
      deadline.setDate(deadline.getDate() + (20 * 7)); // 20 weeks

      const now = new Date();
      const weeksOpen = Math.floor((now.getTime() - referralDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
      const weeksLeft = 20 - weeksOpen;

      console.log(`✅ Linked Case Found (ID: ${activeCase.id})`);
      console.log(`   Referral Date: ${referralDate.toISOString().split('T')[0]}`);
      console.log(`   Statutory Deadline: ${deadline.toISOString().split('T')[0]}`);
      console.log(`   Weeks Open: ${weeksOpen}`);
      console.log(`   Weeks Remaining: ${weeksLeft}`);

      if (weeksOpen > 18) {
        console.log('   ⚠️  CRITICAL ALERT: Deadline Imminent (< 2 weeks)');
      } else if (weeksOpen > 16) {
        console.log('   ⚠️  WARNING: Deadline Approaching');
      } else {
        console.log('   ✅ On Track');
      }
    } else {
      console.log('⚠️  No active case found for this student. Timeline cannot be calculated.');
    }

    // 4. Verify AI Integration (Mock Check)
    console.log('\n--- Testing AI Integration Availability ---');
    // We can't easily call the Next.js API route from here without fetch/server running,
    // but we can verify the API route file exists.
    const fs = require('fs');
    const aiRoutePath = 'src/app/api/ai/chat/route.ts';
    if (fs.existsSync(aiRoutePath)) {
        console.log(`✅ AI Chat API Route exists at ${aiRoutePath}`);
    } else {
        console.error(`❌ AI Chat API Route MISSING at ${aiRoutePath}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyEHCPWizard();
