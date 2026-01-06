
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedLACases() {
  console.log('🌱 Seeding LA Cases for Breach Risk Verification...');

  try {
    // 1. Find the Tenant
    const tenant = await prisma.tenants.findFirst({
      where: { name: "Buckinghamshire Council - Children's Services" }
    });

    if (!tenant) {
      throw new Error('Tenant not found. Run seed-caroline-marriott.ts first.');
    }

    console.log(`✅ Found Tenant: ${tenant.name} (ID: ${tenant.id})`);

    // 2. Find or Create a Student
    let student = await prisma.students.findFirst({
      where: { tenant_id: tenant.id }
    });

    if (!student) {
      console.log('Creating a sample student...');
      student = await prisma.students.create({
        data: {
          tenant_id: tenant.id,
          first_name: 'Risk',
          last_name: 'Test-Student',
          date_of_birth: new Date('2015-01-01'),
          unique_id: 'RISK-TEST-001',
          year_group: '5',
          sen_status: 'E'
        }
      });
    }

    console.log(`✅ Using Student: ${student.first_name} ${student.last_name} (ID: ${student.id})`);

    // 3. Create Cases with different risks
    const now = new Date();
    
    // High Risk Case (19 weeks old)
    const highRiskDate = new Date(now);
    highRiskDate.setDate(highRiskDate.getDate() - (19 * 7));
    
    await prisma.cases.create({
      data: {
        tenant_id: tenant.id,
        student_id: student.id,
        status: 'active',
        priority: 'high',
        type: 'statutory',
        referral_date: highRiskDate,
      }
    });
    console.log('✅ Created High Risk Case (19 weeks old)');

    // Medium Risk Case (15 weeks old)
    const mediumRiskDate = new Date(now);
    mediumRiskDate.setDate(mediumRiskDate.getDate() - (15 * 7));
    
    await prisma.cases.create({
      data: {
        tenant_id: tenant.id,
        student_id: student.id,
        status: 'active',
        priority: 'medium',
        type: 'statutory',
        referral_date: mediumRiskDate,
      }
    });
    console.log('✅ Created Medium Risk Case (15 weeks old)');

    // Low Risk Case (2 weeks old)
    const lowRiskDate = new Date(now);
    lowRiskDate.setDate(lowRiskDate.getDate() - (2 * 7));
    
    await prisma.cases.create({
      data: {
        tenant_id: tenant.id,
        student_id: student.id,
        status: 'active',
        priority: 'low',
        type: 'statutory',
        referral_date: lowRiskDate,
      }
    });
    console.log('✅ Created Low Risk Case (2 weeks old)');

  } catch (error) {
    console.error('Error seeding cases:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedLACases();
