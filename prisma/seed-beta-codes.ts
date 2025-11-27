/**
 * Seed Beta Access Codes
 * 
 * Run with: npx tsx prisma/seed-beta-codes.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const betaCodes = [
  {
    code: 'BETA2025',
    maxUses: 100,
    remainingUses: 100,
    features: ['full_access', 'feedback_widget', 'beta_badge'],
    metadata: { description: 'General beta access code for 2025' },
    expiresAt: new Date('2025-12-31T23:59:59Z'),
  },
  {
    code: 'EDPSYCH-BETA',
    maxUses: 50,
    remainingUses: 50,
    features: ['full_access', 'feedback_widget', 'beta_badge', 'priority_support'],
    metadata: { description: 'Educational Psychologist beta access' },
    expiresAt: new Date('2025-12-31T23:59:59Z'),
  },
  {
    code: 'FOUNDER-ACCESS',
    maxUses: 10,
    remainingUses: 10,
    features: ['full_access', 'feedback_widget', 'beta_badge', 'priority_support', 'founder_status'],
    metadata: { description: 'Founder-level access for key stakeholders' },
    expiresAt: new Date('2026-12-31T23:59:59Z'),
  },
  {
    code: 'EP-BETA-UK',
    maxUses: 200,
    remainingUses: 200,
    role: 'EP',
    features: ['full_access', 'feedback_widget', 'beta_badge', 'ep_tools'],
    metadata: { description: 'UK Educational Psychologist beta programme' },
    expiresAt: new Date('2025-12-31T23:59:59Z'),
  },
  {
    code: 'TEACHER-BETA',
    maxUses: 500,
    remainingUses: 500,
    role: 'TEACHER',
    features: ['full_access', 'feedback_widget', 'beta_badge', 'classroom_tools'],
    metadata: { description: 'Teacher beta access' },
    expiresAt: new Date('2025-12-31T23:59:59Z'),
  },
  {
    code: 'SENCO-BETA',
    maxUses: 100,
    remainingUses: 100,
    role: 'SENCO',
    features: ['full_access', 'feedback_widget', 'beta_badge', 'send_tools', 'ehcp_support'],
    metadata: { description: 'SENCO/SEND Coordinator beta access' },
    expiresAt: new Date('2025-12-31T23:59:59Z'),
  },
  {
    code: 'LA-BETA-2025',
    maxUses: 25,
    remainingUses: 25,
    features: ['full_access', 'feedback_widget', 'beta_badge', 'la_dashboard', 'multi_school'],
    metadata: { description: 'Local Authority beta access' },
    expiresAt: new Date('2025-12-31T23:59:59Z'),
  },
  {
    code: 'RESEARCH-BETA',
    maxUses: 30,
    remainingUses: 30,
    role: 'RESEARCHER',
    features: ['full_access', 'feedback_widget', 'beta_badge', 'research_tools', 'data_export'],
    metadata: { description: 'Research institution beta access' },
    expiresAt: new Date('2025-12-31T23:59:59Z'),
  },
];

async function main() {
  console.log('🔐 Seeding beta access codes...');

  for (const codeData of betaCodes) {
    const existing = await prisma.betaAccessCode.findUnique({
      where: { code: codeData.code },
    });

    if (existing) {
      console.log(`  ⏭️  ${codeData.code} already exists, skipping`);
      continue;
    }

    await prisma.betaAccessCode.create({
      data: codeData,
    });
    console.log(`  ✅ Created: ${codeData.code} (max ${codeData.maxUses} uses, expires ${codeData.expiresAt?.toDateString()})`);
  }

  // Summary
  const totalCodes = await prisma.betaAccessCode.count();
  console.log(`\n✅ Beta codes seeded successfully. Total codes: ${totalCodes}`);

  // List all codes
  console.log('\n📋 Available Beta Codes:');
  const allCodes = await prisma.betaAccessCode.findMany({
    select: { code: true, maxUses: true, current_uses: true, expiresAt: true, role: true },
    orderBy: { code: 'asc' },
  });

  for (const c of allCodes) {
    const roleTag = c.role ? ` [${c.role}]` : '';
    const expiryTag = c.expiresAt ? ` (expires ${c.expiresAt.toDateString()})` : '';
    console.log(`  • ${c.code}${roleTag} - ${c.current_uses}/${c.maxUses} used${expiryTag}`);
  }
}

main()
  .catch((e) => {
    console.error('Error seeding beta codes:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
