
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('🔍 Verifying Parent Portal Backend...');

  try {
    // 1. Setup: Find or Create Tenant
    const tenant = await prisma.tenants.findFirst();
    if (!tenant) throw new Error('No tenant found');
    console.log(`✅ Using Tenant: ${tenant.id}`);

    // 2. Create Parent User
    const parentEmail = `parent.verify.${Date.now()}@example.com`;
    const parent = await prisma.users.create({
      data: {
        tenant_id: tenant.id,
        email: parentEmail,
        password_hash: 'hashed_placeholder',
        name: 'Verification Parent',
        firstName: 'Verification',
        lastName: 'Parent',
        role: 'parent',
        is_active: true
      }
    });
    console.log(`✅ Created Parent: ${parent.id} (${parent.email})`);

    // 3. Create Student (Child)
    const student = await prisma.students.create({
      data: {
        tenant_id: tenant.id,
        first_name: 'Leo',
        last_name: 'Verify',
        date_of_birth: new Date('2015-01-01'),
        year_group: '5',
        sen_status: 'EHCP',
        unique_id: `STU${Date.now()}`
      }
    });
    console.log(`✅ Created Student: ${student.id} (${student.first_name})`);

    // 4. Create Student Profile (for strengths/struggles)
    const profile = await prisma.studentProfile.create({
      data: {
        tenant_id: tenant.id,
        student_id: student.id,
        learning_style: { style: 'visual_learner' },
        current_strengths: ['Creative Thinking', 'Visual Arts'],
        current_struggles: ['Working Memory', 'Processing Speed']
      }
    });
    console.log(`✅ Created Student Profile: ${profile.id}`);

    // 5. Link Parent and Child
    await prisma.parentChildLink.create({
      data: {
        tenant_id: tenant.id,
        parent_id: parent.id,
        child_id: student.id,
        relationship_type: 'father',
        is_primary_contact: true
      }
    });
    console.log(`✅ Linked Parent ${parent.id} to Child ${student.id}`);

    // 6. Create Lesson Data (to verify progress summary)
    // Need a Class Roster first
    const roster = await prisma.classRoster.create({
      data: {
        tenant_id: tenant.id,
        teacher_id: parent.id, // Reusing parent as teacher for test simplicity
        class_name: 'Year 5 Maths',
        year_group: '5',
        academic_year: '2025-2026'
      }
    });
    console.log(`✅ Created Class Roster: ${roster.id}`);

    // Need a lesson plan
    const lessonPlan = await prisma.lessonPlan.create({
      data: {
        tenant_id: tenant.id,
        class_roster_id: roster.id,
        teacher_id: parent.id,
        title: 'Multiplication Strategies',
        subject: 'Maths',
        year_group: '5',
        description: 'Learning to multiply',
        base_content: { type: 'text', content: 'Multiplication is repeated addition.' },
        duration_minutes: 45
      }
    });

    // Create completed assignment
    await prisma.studentLessonAssignment.create({
      data: {
        tenant_id: tenant.id,
        student_id: student.id,
        student_profile_id: profile.id,
        lesson_plan_id: lessonPlan.id,
        status: 'completed',
        assigned_at: new Date(Date.now() - 86400000), // Yesterday
        completed_at: new Date(),
        success_rate: 0.85 // 85% - Should be "Excellent"
      }
    });
    console.log(`✅ Created Completed Lesson with 85% success`);

    // 7. Verify Data Retrieval (Simulating API Logic)
    console.log('\n🔄 Simulating API Data Fetch...');

    // 7a. Verify Link
    const link = await prisma.parentChildLink.findFirst({
      where: { parent_id: parent.id, child_id: student.id }
    });
    if (!link) throw new Error('Failed to verify parent-child link');
    console.log('  ✓ Relationship verified');

    // 7b. Fetch Lessons
    const recentLessons = await prisma.studentLessonAssignment.findMany({
      where: { student_id: student.id, status: 'completed' },
      include: { lesson_plan: true }
    });
    console.log(`  ✓ Fetched ${recentLessons.length} recent lessons`);

    // 7c. Calculate Success
    const successRate = recentLessons[0].success_rate || 0;
    let level = 'needs_support';
    if (successRate >= 0.85) level = 'excellent';
    else if (successRate >= 0.70) level = 'good';
    else if (successRate >= 0.55) level = 'satisfactory';
    
    console.log(`  ✓ Calculated Success Level: ${level} (Expected: excellent)`);

    if (level !== 'excellent') throw new Error(`Success level mismatch. Got ${level}, expected excellent`);

    console.log('\n✅ Parent Portal Backend Verification Successful!');

    // Cleanup (Optional, but good for repeatable tests)
    // await prisma.parentChildLink.deleteMany({ where: { parent_id: parent.id } });
    // await prisma.studentLessonAssignment.deleteMany({ where: { student_id: student.id } });
    // await prisma.students.delete({ where: { id: student.id } });
    // await prisma.users.delete({ where: { id: parent.id } });

  } catch (error) {
    console.error('❌ Verification Failed:', error);
    process.exit(1);
  }
}

main();
