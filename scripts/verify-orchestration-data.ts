import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyData() {
  console.log('\n🔍 Verifying Orchestration Layer Data...\n');

  try {
    const profiles = await prisma.studentProfile.count();
    const classes = await prisma.classRoster.count();
    const lessons = await prisma.lessonPlan.count();
    const activities = await prisma.lessonActivity.count();
    const assignments = await prisma.studentLessonAssignment.count();
    const responses = await prisma.studentActivityResponse.count();
    const snapshots = await prisma.studentProgressSnapshot.count();
    const multiAgency = await prisma.multiAgencyAccess.count();
    const parentLinks = await prisma.parentChildLink.count();
    const voiceCommands = await prisma.voiceCommand.count();
    const actions = await prisma.automatedAction.count();

    console.log('📊 Database Record Counts:');
    console.log(`   ✓ StudentProfiles:              ${profiles}`);
    console.log(`   ✓ ClassRosters:                 ${classes}`);
    console.log(`   ✓ LessonPlans:                  ${lessons}`);
    console.log(`   ✓ LessonActivities:             ${activities}`);
    console.log(`   ✓ StudentLessonAssignments:     ${assignments}`);
    console.log(`   ✓ StudentActivityResponses:     ${responses}`);
    console.log(`   ✓ StudentProgressSnapshots:     ${snapshots}`);
    console.log(`   ✓ MultiAgencyAccess:            ${multiAgency}`);
    console.log(`   ✓ ParentChildLinks:             ${parentLinks}`);
    console.log(`   ✓ VoiceCommands:                ${voiceCommands}`);
    console.log(`   ✓ AutomatedActions:             ${actions}`);

    const total = profiles + classes + lessons + activities + assignments +
                  responses + snapshots + multiAgency + parentLinks + voiceCommands + actions;

    console.log(`\n   📈 Total Records: ${total}`);

    if (total > 0) {
      console.log('\n✅ Platform Orchestration Layer data verified successfully!');
    } else {
      console.log('\n⚠️  No orchestration data found. Run seed script: npx tsx prisma/seed-orchestration.ts');
    }

  } catch (error) {
    console.error('❌ Error verifying data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyData();
