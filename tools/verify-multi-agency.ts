
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('🔍 Verifying Multi-Agency Collaboration...');

  try {
    // 1. Setup: Find dependencies
    const tenant = await prisma.tenants.findFirst();
    if (!tenant) throw new Error('No tenant found');

    const user = await prisma.users.findFirst({ where: { tenant_id: tenant.id } });
    if (!user) throw new Error('No user found');

    const student = await prisma.students.findFirst({ where: { tenant_id: tenant.id } });
    if (!student) throw new Error('No student found');

    let kase = await prisma.cases.findFirst({ where: { student_id: student.id } });
    if (!kase) {
      console.log('⚠️ No case found, creating one...');
      kase = await prisma.cases.create({
        data: {
          tenant_id: tenant.id,
          student_id: student.id,
          status: 'active',
          priority: 'medium',
          type: 'statutory',
          referral_date: new Date()
        }
      });
    }

    const framework = await prisma.assessmentFramework.findFirst();
    if (!framework) throw new Error('No framework found');

    console.log(`✅ Dependencies found: Tenant ${tenant.id}, User ${user.id}, Student ${student.id}, Framework ${framework.id}`);

    // 2. Create Assessment Instance
    const instance = await prisma.assessmentInstance.create({
      data: {
        tenant_id: tenant.id,
        framework_id: framework.id,
        case_id: kase.id,
        student_id: student.id,
        conducted_by: user.id,
        status: 'in_progress',
        title: 'Verification Assessment'
      }
    });
    console.log(`✅ Created Assessment Instance: ${instance.id}`);

    // 3. Create Collaboration Invitation
    const token = `verify-token-${Date.now()}`;
    const collaboration = await prisma.assessmentCollaboration.create({
      data: {
        instance_id: instance.id,
        contributor_type: 'teacher',
        contributor_name: 'Mrs. Verify',
        contributor_email: 'verify@school.com',
        invitation_token: token,
        status: 'pending',
        responses: {},
        invitation_method: 'email',
        invitation_sent_at: new Date()
      }
    });
    console.log(`✅ Created Collaboration Invitation: ${collaboration.id} (Token: ${token})`);

    // 4. Verify Access (Simulate GET /api/assessments/collaborations/[token])
    const found = await prisma.assessmentCollaboration.findUnique({
      where: { invitation_token: token },
      include: {
        instance: {
          include: {
            student: true
          }
        }
      }
    });

    if (!found) throw new Error('Could not find collaboration by token');
    if (found.instance.student.id !== student.id) throw new Error('Linked to wrong student');
    console.log(`✅ Verified Access: Token resolves to student ${found.instance.student.first_name}`);

    // 5. Verify Submission (Simulate POST /api/assessments/collaborations/[token])
    const submissionData = {
      responses: { q1: 'The child is doing well.' },
      narrative_input: 'Observed good focus today.',
      observation_context: 'Classroom'
    };

    const updated = await prisma.assessmentCollaboration.update({
      where: { id: collaboration.id },
      data: {
        ...submissionData,
        status: 'submitted',
        submitted_at: new Date()
      }
    });

    if (updated.status !== 'submitted') throw new Error('Status update failed');
    if ((updated.responses as any).q1 !== 'The child is doing well.') throw new Error('Response persistence failed');
    console.log(`✅ Verified Submission: Status is '${updated.status}' and data persisted.`);

    // 6. Cleanup
    await prisma.assessmentCollaboration.delete({ where: { id: collaboration.id } });
    await prisma.assessmentInstance.delete({ where: { id: instance.id } });
    console.log('✅ Cleanup complete');

  } catch (error) {
    console.error('❌ Verification Failed:', error);
    process.exit(1);
  }
}

main();
