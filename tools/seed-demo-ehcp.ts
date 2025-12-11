
import { PrismaClient, SENPrimaryNeed, EHCPApplicationStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding EHCP for Demo Tenant...');

  const tenant = await prisma.tenants.findFirst({
    where: { subdomain: 'demo' }
  });

  if (!tenant) {
    console.error('Demo tenant not found');
    process.exit(1);
  }

  const student = await prisma.users.findFirst({
    where: { email: 'student@demo.com', tenant_id: tenant.id }
  });

  if (!student) {
    console.error('Student not found');
    process.exit(1);
  }

  const caseworker = await prisma.users.findFirst({
    where: { tenant_id: tenant.id }
  });

  if (!caseworker) {
    console.error('Caseworker not found');
    process.exit(1);
  }

  // Calculate dates
  const now = new Date();
  const decisionDue = new Date(now);
  decisionDue.setDate(now.getDate() + 42); // 6 weeks
  const draftDue = new Date(now);
  draftDue.setDate(now.getDate() + 112); // 16 weeks
  const finalDue = new Date(now);
  finalDue.setDate(now.getDate() + 140); // 20 weeks

  // Create EHCP Application
  const ehcp = await prisma.eHCPApplication.create({
    data: {
      la_reference: `LA-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
      la_tenant_id: tenant.id,
      school_tenant_id: tenant.id,
      student_id: student.id.toString(),
      child_name: student.name,
      child_dob: new Date('2015-01-01'),
      primary_need: 'ASD',
      requested_by: 'school',
      requester_name: 'Demo Teacher',
      requester_email: 'teacher@demo.com',
      request_reason: 'Needs support',
      referral_date: now,
      decision_due_date: decisionDue,
      draft_due_date: draftDue,
      final_due_date: finalDue,
      status: 'SUBMITTED',
      caseworker_id: caseworker.id,
      created_by_id: caseworker.id
    }
  });

  console.log(`Created EHCP Application with ID: ${ehcp.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
