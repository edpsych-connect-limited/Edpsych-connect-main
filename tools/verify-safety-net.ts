
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🛡️  Verifying Safety Net Architecture...\n');

  // 1. Check Automated Actions (The "Self-Driving" Logic)
  const totalActions = await prisma.automatedAction.count();
  const pendingApproval = await prisma.automatedAction.count({
    where: { requires_approval: true }
  });
  const autonomousActions = await prisma.automatedAction.count({
    where: { requires_approval: false }
  });

  console.log('🤖 Automated Actions Analysis:');
  console.log(`   - Total Actions Triggered: ${totalActions}`);
  console.log(`   - "Advisory Mode" (Pending Human Review): ${pendingApproval}`);
  console.log(`   - "Autonomous Mode" (Self-Executed): ${autonomousActions}`);

  if (totalActions > 0) {
    console.log('   ✅ "Self-Driving" logic is active and generating actions.');
  } else {
    console.log('   ❌ No automated actions found. Simulation may need more time or logic check.');
  }

  // 2. Check Audit Logs (The "Forensic" Layer)
  // Note: In the simulation seed, we might not have explicitly created AuditLog entries 
  // unless the application logic triggers them via database hooks or service calls.
  // However, the AutomatedAction table itself serves as a specialized audit log for AI decisions.
  
  const auditLogs = await prisma.auditLog.count();
  console.log('\n📋 System Audit Logs:');
  console.log(`   - Total Log Entries: ${auditLogs}`);

  // 3. Check for Specific "High Risk" Interventions
  const interventions = await prisma.automatedAction.findMany({
    where: { 
      action_type: 'intervention_triggered',
      requires_approval: true 
    },
    take: 5
  });

  if (interventions.length > 0) {
    console.log('\n⚠️  Sample Flagged Interventions (Safety Net Caught These):');
    interventions.forEach(action => {
      const data = action.action_data as any;
      console.log(`   - [${action.triggered_by}] -> ${data?.details || 'No details'}`);
    });
  }

  console.log('\n✅ Safety Net Verification Complete.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
