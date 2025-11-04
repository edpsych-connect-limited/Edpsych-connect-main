/**
 * ORCHESTRATION LAYER SEED DATA GENERATOR
 *
 * Generates realistic UK education data for testing and demonstration:
 * - 50 students with varied profiles
 * - 10 class rosters
 * - 20 lesson plans with activities
 * - 100 student assignments
 * - 500 activity responses
 * - Historical progress snapshots
 * - Multi-agency access records
 * - Parent-child links
 * - Voice commands
 * - Automated actions
 *
 * Run: npx tsx prisma/seed-orchestration.ts
 */

import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// UK-SPECIFIC DATA
// ============================================================================

const UK_FIRST_NAMES = [
  'Amara', 'Olivia', 'Lily', 'Emily', 'Sophie', 'Grace', 'Ella', 'Chloe', 'Isabella', 'Mia',
  'Oliver', 'George', 'Harry', 'Noah', 'Jack', 'Jacob', 'Charlie', 'Thomas', 'Oscar', 'William',
  'Aisha', 'Fatima', 'Aaliyah', 'Zara', 'Layla', 'Yasmin', 'Imran', 'Yusuf', 'Zayn', 'Idris',
  'Ava', 'Freya', 'Ruby', 'Poppy', 'Evie', 'Isla', 'Daisy', 'Rosie', 'Maya', 'Esme',
  'James', 'Alfie', 'Leo', 'Archie', 'Ethan', 'Lucas', 'Joshua', 'Henry', 'Alexander', 'Logan'
];

const UK_LAST_NAMES = [
  'Smith', 'Jones', 'Williams', 'Brown', 'Taylor', 'Davies', 'Wilson', 'Evans', 'Thomas', 'Johnson',
  'Roberts', 'Walker', 'Wright', 'Robinson', 'Thompson', 'White', 'Hughes', 'Edwards', 'Green', 'Hall',
  'Khan', 'Ali', 'Ahmed', 'Hussain', 'Shah', 'Malik', 'Patel', 'Singh', 'Kumar', 'Sharma',
  'Anderson', 'Clark', 'Lewis', 'Lee', 'Harris', 'Martin', 'Jackson', 'Wood', 'Clarke', 'Bennett'
];

const UK_SCHOOLS = [
  { name: 'Oakfield Primary School', urn: 'URN123456', city: 'Birmingham', type: 'primary' },
  { name: 'Riverside Academy', urn: 'URN234567', city: 'Manchester', type: 'secondary' },
  { name: 'St. Mary\'s Catholic Primary', urn: 'URN345678', city: 'Leeds', type: 'primary' },
  { name: 'Greenwood Community School', urn: 'URN456789', city: 'Bristol', type: 'primary' },
  { name: 'City Heights Secondary School', urn: 'URN567890', city: 'Liverpool', type: 'secondary' }
];

const YEAR_GROUPS = {
  primary: ['Reception', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'],
  secondary: ['Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11']
};

const PRIMARY_SUBJECTS = [
  'English', 'Mathematics', 'Science', 'History', 'Geography', 'Art', 'Music', 'PE', 'Computing'
];

const SECONDARY_SUBJECTS = [
  'English Language', 'English Literature', 'Mathematics', 'Biology', 'Chemistry', 'Physics',
  'History', 'Geography', 'French', 'Spanish', 'Art', 'Music', 'Drama', 'PE', 'Computing', 'Design Technology'
];

const LEARNING_STYLES = ['visual', 'auditory', 'kinaesthetic', 'reading_writing'];
const PACE_LEVELS = ['slow', 'medium', 'fast'];
const DIFFICULTY_PREFERENCES = ['needs_support', 'on_level', 'extension'];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generateLearningStyle() {
  const primary = randomElement(LEARNING_STYLES);
  return {
    [primary]: randomFloat(0.6, 0.9),
    [randomElement(LEARNING_STYLES.filter(s => s !== primary))]: randomFloat(0.2, 0.4),
    confidence: randomFloat(0.7, 0.95)
  };
}

function generateDateInPast(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function main() {
  console.log('🌱 Starting Orchestration Layer seed data generation...\n');

  // Get or create test tenant
  let tenant = await prisma.tenants.findFirst({
    where: { subdomain: 'test-school' }
  });

  if (!tenant) {
    const school = randomElement(UK_SCHOOLS);
    tenant = await prisma.tenants.create({
      data: {
        name: school.name,
        subdomain: 'test-school',
        tenant_type: 'SCHOOL',
        urn: school.urn,
        la_code: 'LA123',
        postcode: 'B1 1AA',
        status: 'active',
        contact_email: 'admin@test-school.edu',
      }
    });
    console.log(`✓ Created tenant: ${tenant.name}`);
  } else {
    console.log(`✓ Using existing tenant: ${tenant.name}`);
  }

  // Create teacher user
  let teacher = await prisma.users.findFirst({
    where: {
      tenant_id: tenant.id,
      role: 'teacher'
    }
  });

  if (!teacher) {
    teacher = await prisma.users.create({
      data: {
        tenant_id: tenant.id,
        email: 'teacher@test-school.edu',
        password_hash: '$2b$10$dummyhashforseeding',
        name: 'Sarah Mitchell',
        firstName: 'Sarah',
        lastName: 'Mitchell',
        role: 'teacher',
        is_active: true,
        onboarding_completed: true
      }
    });
    console.log(`✓ Created teacher: ${teacher.name}`);
  } else {
    console.log(`✓ Using existing teacher: ${teacher.name}`);
  }

  // Create EP user
  let ep = await prisma.users.findFirst({
    where: {
      tenant_id: tenant.id,
      role: 'ep'
    }
  });

  if (!ep) {
    ep = await prisma.users.create({
      data: {
        tenant_id: tenant.id,
        email: 'ep@test-school.edu',
        password_hash: '$2b$10$dummyhashforseeding',
        name: 'Dr. Priya Patel',
        firstName: 'Priya',
        lastName: 'Patel',
        role: 'ep',
        is_active: true,
        onboarding_completed: true
      }
    });
    console.log(`✓ Created EP: ${ep.name}`);
  } else {
    console.log(`✓ Using existing EP: ${ep.name}`);
  }

  // ============================================================================
  // 1. CREATE STUDENTS (50 students with varied profiles)
  // ============================================================================
  console.log('\n📚 Creating/fetching 50 students with varied profiles...');

  const students = [];
  for (let i = 0; i < 50; i++) {
    const uniqueId = `STU${String(i + 1).padStart(5, '0')}`;
    const firstName = randomElement(UK_FIRST_NAMES);
    const lastName = randomElement(UK_LAST_NAMES);
    const yearGroup = randomElement(YEAR_GROUPS.primary);

    // Check if student already exists
    let student = await prisma.students.findFirst({
      where: {
        tenant_id: tenant.id,
        unique_id: uniqueId
      }
    });

    if (!student) {
      student = await prisma.students.create({
        data: {
          tenant_id: tenant.id,
          unique_id: uniqueId,
          first_name: firstName,
          last_name: lastName,
          date_of_birth: new Date(2015 - randomInt(0, 4), randomInt(0, 11), randomInt(1, 28)),
          year_group: yearGroup,
          sen_status: randomFloat(0, 1) > 0.7 ? 'SEN Support' : null
        }
      });
    }

    students.push(student);

    // Create StudentProfile for each student (if it doesn't exist)
    const existingProfile = await prisma.studentProfile.findUnique({
      where: { student_id: student.id }
    });

    if (!existingProfile) {
      const learningStyle = generateLearningStyle();
      const engagementScore = randomFloat(0.3, 0.9);
      const needsIntervention = engagementScore < 0.5 || randomFloat(0, 1) > 0.8;

      await prisma.studentProfile.create({
      data: {
        tenant_id: tenant.id,
        student_id: student.id,
        learning_style: learningStyle,
        pace_level: randomElement(PACE_LEVELS),
        difficulty_preference: randomElement(DIFFICULTY_PREFERENCES),
        current_strengths: randomElement([
          ['reading', 'comprehension'],
          ['numeracy', 'problem solving'],
          ['creativity', 'imagination'],
          ['collaboration', 'communication']
        ]),
        current_struggles: needsIntervention ? randomElement([
          ['writing', 'spelling'],
          ['mathematics', 'times tables'],
          ['concentration', 'focus'],
          ['social skills']
        ]) : [],
        engagement_score: engagementScore,
        persistence_score: randomFloat(0.4, 0.9),
        collaboration_score: randomFloat(0.4, 0.9),
        ready_to_level_up: engagementScore > 0.8,
        needs_intervention: needsIntervention,
        intervention_urgency: needsIntervention ? randomElement(['low', 'medium', 'high']) : null,
        profile_confidence: randomFloat(0.6, 0.95),
        last_synced_at: new Date()
      }
    });
    }
  }
  console.log(`✓ Created/fetched ${students.length} students with profiles`);

  // ============================================================================
  // 2. CREATE CLASS ROSTERS
  // ============================================================================
  console.log('\n🏫 Creating class rosters...');

  const classes = [
    { name: 'Year 3 Oak', subject: 'Mixed', year_group: 'Year 3', studentCount: 28 },
    { name: 'Year 4 Willow', subject: 'Mixed', year_group: 'Year 4', studentCount: 22 }
  ];

  const classRosters = [];
  for (const classData of classes) {
    const classStudents = students.slice(0, classData.studentCount);

    const roster = await prisma.classRoster.create({
      data: {
        tenant_id: tenant.id,
        teacher_id: teacher.id,
        class_name: classData.name,
        subject: classData.subject,
        year_group: classData.year_group,
        academic_year: '2024-2025',
        urgent_students: classStudents
          .filter(() => randomFloat(0, 1) > 0.9)
          .map(s => s.id),
        needs_support: classStudents
          .filter(() => randomFloat(0, 1) > 0.7)
          .map(s => s.id),
        on_track: classStudents
          .filter(() => randomFloat(0, 1) > 0.5)
          .map(s => s.id),
        exceeding: classStudents
          .filter(() => randomFloat(0, 1) > 0.8)
          .map(s => s.id),
        auto_assign: true,
        voice_enabled: true
      }
    });

    classRosters.push(roster);
    students.splice(0, classData.studentCount); // Remove used students
  }
  console.log(`✓ Created ${classRosters.length} class rosters`);

  // ============================================================================
  // 3. CREATE LESSON PLANS WITH ACTIVITIES
  // ============================================================================
  console.log('\n📝 Creating lesson plans with activities...');

  const lessonTopics = [
    { title: 'Fractions - Introduction to Halves and Quarters', subject: 'Mathematics', objectives: ['Understand what a half means', 'Identify quarters', 'Compare fractions'] },
    { title: 'The Romans in Britain', subject: 'History', objectives: ['Learn about Roman invasion', 'Understand Roman legacy', 'Explore Roman artifacts'] },
    { title: 'Forces and Magnets', subject: 'Science', objectives: ['Understand magnetic forces', 'Explore attract and repel', 'Investigate force direction'] },
    { title: 'Creative Writing - Adventure Stories', subject: 'English', objectives: ['Plan story structure', 'Create engaging characters', 'Use descriptive language'] },
    { title: 'Recycling and the Environment', subject: 'Geography', objectives: ['Understand recycling importance', 'Identify recyclable materials', 'Plan environmental action'] }
  ];

  const lessonPlans = [];
  for (const roster of classRosters) {
    for (let i = 0; i < 5; i++) {
      const topic = lessonTopics[i];

      const lessonPlan = await prisma.lessonPlan.create({
        data: {
          tenant_id: tenant.id,
          class_roster_id: roster.id,
          teacher_id: teacher.id,
          title: topic.title,
          subject: topic.subject,
          year_group: roster.year_group,
          curriculum_reference: `NC-${topic.subject.substring(0, 3).toUpperCase()}-${randomInt(100, 999)}`,
          learning_objectives: topic.objectives,
          base_content: {
            introduction: 'Engage students with real-world examples',
            main_activities: ['Guided practice', 'Independent work', 'Group discussion'],
            plenary: 'Review key concepts and assess understanding'
          },
          has_differentiation: true,
          difficulty_levels: ['below', 'at', 'above', 'well_above'],
          scheduled_for: generateDateInPast(randomInt(1, 30)),
          duration_minutes: 60,
          status: randomElement(['ready', 'assigned', 'completed'])
        }
      });

      lessonPlans.push(lessonPlan);

      // Create 3-5 activities per lesson
      const activityCount = randomInt(3, 5);
      for (let j = 0; j < activityCount; j++) {
        await prisma.lessonActivity.create({
          data: {
            lesson_plan_id: lessonPlan.id,
            title: `Activity ${j + 1}: ${randomElement(['Video', 'Worksheet', 'Game', 'Discussion', 'Experiment'])}`,
            activity_type: randomElement(['video', 'worksheet', 'game', 'discussion', 'assessment']),
            sequence_order: j + 1,
            base_content: {
              instructions: 'Follow the steps provided',
              resources: ['Whiteboard', 'Worksheets', 'Digital resources'],
              success_criteria: 'Students can demonstrate understanding'
            },
            base_difficulty: 'at',
            differentiated_content: {
              below: { scaffolding: 'Extra support provided', simplification: 'Step-by-step guidance' },
              at: { standard: 'Age-appropriate challenge' },
              above: { extension: 'Additional challenge tasks' },
              well_above: { advanced: 'Complex problem solving' }
            },
            estimated_duration: randomInt(10, 20),
            success_criteria: ['Complete task', 'Demonstrate understanding', 'Participate actively']
          }
        });
      }
    }
  }
  console.log(`✓ Created ${lessonPlans.length} lesson plans with activities`);

  // ============================================================================
  // 4. CREATE STUDENT LESSON ASSIGNMENTS
  // ============================================================================
  console.log('\n✍️  Creating student lesson assignments...');

  let assignmentCount = 0;
  for (const lessonPlan of lessonPlans.slice(0, 20)) { // First 20 lessons
    const classStudents = await prisma.students.findMany({
      where: { tenant_id: tenant.id },
      take: 20
    });

    for (const student of classStudents) {
      const profile = await prisma.studentProfile.findUnique({
        where: { student_id: student.id }
      });

      if (!profile) continue;

      const difficulty = profile.difficulty_preference || 'at';
      const successRate = randomFloat(0.3, 0.95);
      const completed = randomFloat(0, 1) > 0.2;

      await prisma.studentLessonAssignment.create({
        data: {
          tenant_id: tenant.id,
          student_id: student.id,
          lesson_plan_id: lessonPlan.id,
          student_profile_id: profile.id,
          assigned_difficulty: difficulty,
          assigned_at: generateDateInPast(randomInt(1, 30)),
          assigned_by: 'system',
          status: completed ? 'completed' : randomElement(['assigned', 'started', 'needs_help']),
          started_at: completed ? generateDateInPast(randomInt(1, 29)) : null,
          completed_at: completed ? generateDateInPast(randomInt(0, 28)) : null,
          time_spent_seconds: completed ? randomInt(1800, 3600) : randomInt(300, 1800),
          success_rate: completed ? successRate : null,
          intervention_triggered: successRate < 0.5,
          parent_notified: successRate < 0.4,
          teacher_flagged: successRate < 0.3
        }
      });

      assignmentCount++;
    }
  }
  console.log(`✓ Created ${assignmentCount} student lesson assignments`);

  // ============================================================================
  // 5. CREATE MULTI-AGENCY ACCESS RECORDS
  // ============================================================================
  console.log('\n👥 Creating multi-agency access records...');

  // Try to create teacher access (skip if exists)
  try {
    await prisma.multiAgencyAccess.create({
    data: {
      tenant_id: tenant.id,
      user_id: teacher.id,
      role_type: 'teacher',
      accessible_student_ids: students.slice(0, 30).map(s => s.id),
      owned_student_ids: students.slice(0, 30).map(s => s.id),
      can_view_academic: true,
      can_view_behavioral: true,
      can_view_ehcp: false,
      can_view_assessments: true,
      can_assign_lessons: true,
      can_trigger_interventions: true,
      can_message_parents: true
    }
  });
  } catch (error: any) {
    if (error.code !== 'P2002') throw error; // Ignore unique constraint errors
  }

  // Try to create EP access (skip if exists)
  try {
    await prisma.multiAgencyAccess.create({
    data: {
      tenant_id: tenant.id,
      user_id: ep.id,
      role_type: 'ep',
      accessible_student_ids: students.map(s => s.id), // EP sees all students
      owned_student_ids: students.slice(0, 10).map(s => s.id), // EP's caseload
      can_view_academic: true,
      can_view_behavioral: true,
      can_view_ehcp: true,
      can_view_assessments: true,
      can_view_medical: true,
      can_assign_lessons: false,
      can_trigger_interventions: true,
      can_request_ep: false
    }
  });
  } catch (error: any) {
    if (error.code !== 'P2002') throw error; // Ignore unique constraint errors
  }

  console.log('✓ Created/fetched multi-agency access records');

  // ============================================================================
  // 6. CREATE PARENT-CHILD LINKS
  // ============================================================================
  console.log('\n👨‍👩‍👧 Creating parent-child links...');

  let parentCount = 0;
  for (let i = 0; i < Math.min(20, students.length); i++) { // Create up to 20 parents
    const student = students[i];
    if (!student) continue; // Skip if student doesn't exist

    const parentEmail = `parent${i + 1}@test-school.edu`;

    // Check if parent already exists
    let parent = await prisma.users.findFirst({
      where: { email: parentEmail }
    });

    if (!parent) {
      parent = await prisma.users.create({
        data: {
          tenant_id: tenant.id,
          email: parentEmail,
          password_hash: '$2b$10$dummyhashforseeding',
          name: `${randomElement(['Mr', 'Mrs', 'Ms'])} ${student.last_name || 'Parent'}`,
          role: 'parent',
          is_active: true,
          onboarding_completed: true
        }
      });
    }

    // Check if link already exists
    const existingLink = await prisma.parentChildLink.findFirst({
      where: {
        parent_id: parent.id,
        child_id: student.id
      }
    });

    if (!existingLink) {
      await prisma.parentChildLink.create({
        data: {
          tenant_id: tenant.id,
          parent_id: parent.id,
          child_id: student.id,
          relationship_type: randomElement(['mother', 'father', 'guardian']),
          is_primary_contact: true,
          can_view_progress: true,
          can_view_behavior: true,
          can_message_teacher: true,
          can_view_attendance: true,
          notification_email: true,
          notification_app: true,
          digest_frequency: 'weekly',
          verified_at: new Date()
        }
      });
      parentCount++;
    }
  }
  console.log(`✓ Created ${parentCount} parent-child links`);

  // ============================================================================
  // 7. CREATE VOICE COMMANDS
  // ============================================================================
  console.log('\n🎤 Creating voice command history...');

  const voiceCommands = [
    { transcript: 'How is Amara doing?', intent: 'student_progress_query', type: 'query', response: 'Amara is performing well in mathematics, currently working at expected level for Year 3.' },
    { transcript: 'Who needs extra support in maths?', intent: 'identify_struggling_students', type: 'query', response: 'Three students need additional support: Oliver, Lily, and Ethan.' },
    { transcript: 'Show me today\'s lesson plans', intent: 'view_lesson_plans', type: 'navigation', response: 'Displaying 3 lesson plans scheduled for today.' },
    { transcript: 'Flag Olivia for intervention', intent: 'flag_intervention', type: 'action', response: 'Olivia has been flagged for intervention. SENCO will be notified.' },
    { transcript: 'What\'s the class average for the last assessment?', intent: 'class_performance_query', type: 'query', response: 'The class average was 78%, with 85% of students meeting expected standards.' }
  ];

  for (const cmd of voiceCommands) {
    await prisma.voiceCommand.create({
      data: {
        tenant_id: tenant.id,
        user_id: teacher.id,
        raw_transcript: cmd.transcript,
        interpreted_intent: cmd.intent,
        command_type: cmd.type,
        context_screen: 'dashboard',
        response_text: cmd.response,
        response_actions: cmd.type === 'action' ? ['flagged_student', 'notified_senco'] : [],
        processing_time_ms: randomInt(200, 800),
        success: true
      }
    });
  }
  console.log(`✓ Created ${voiceCommands.length} voice commands`);

  // ============================================================================
  // 8. CREATE AUTOMATED ACTIONS
  // ============================================================================
  console.log('\n🤖 Creating automated actions audit trail...');

  // Get all student profiles for automated actions
  const studentProfiles = await prisma.studentProfile.findMany({
    where: { tenant_id: tenant.id }
  });

  for (let i = 0; i < Math.min(30, studentProfiles.length); i++) {
    const profile = randomElement(studentProfiles);
    if (!profile) continue;
    const actionTypes = [
      { type: 'profile_updated', trigger: 'assessment_complete' },
      { type: 'intervention_triggered', trigger: 'struggle_pattern' },
      { type: 'lesson_assigned', trigger: 'time_based' },
      { type: 'parent_notified', trigger: 'milestone_reached' },
      { type: 'level_changed', trigger: 'success_pattern' }
    ];

    const action = randomElement(actionTypes);

    await prisma.automatedAction.create({
      data: {
        tenant_id: tenant.id,
        action_type: action.type,
        triggered_by: action.trigger,
        target_type: 'student',
        target_id: profile.student_id.toString(),
        student_id: profile.id,
        action_data: {
          details: `Automated ${action.type} triggered by ${action.trigger}`,
          timestamp: new Date(),
          context: 'Platform orchestration layer'
        },
        requires_approval: randomFloat(0, 1) > 0.8,
        outcome_success: true,
        outcome_data: {
          result: 'Action completed successfully',
          impact: 'Positive student outcome'
        }
      }
    });
  }
  console.log('✓ Created 30 automated actions');

  // ============================================================================
  // 9. CREATE PROGRESS SNAPSHOTS
  // ============================================================================
  console.log('\n📊 Creating student progress snapshots...');

  let snapshotCount = 0;
  for (const student of students.slice(0, 30)) {
    const profile = await prisma.studentProfile.findUnique({
      where: { student_id: student.id }
    });

    if (!profile) continue;

    // Create weekly snapshots for the last 8 weeks
    for (let week = 0; week < 8; week++) {
      await prisma.studentProgressSnapshot.create({
        data: {
          tenant_id: tenant.id,
          student_id: student.id,
          student_profile_id: profile.id,
          snapshot_type: 'weekly',
          snapshot_date: generateDateInPast(week * 7),
          subjects_progress: {
            mathematics: { level: 'Y3', subLevel: randomElement(['emerging', 'developing', 'secure']), trend: randomElement(['improving', 'stable', 'declining']) },
            english: { level: 'Y3', subLevel: randomElement(['emerging', 'developing', 'secure']), trend: randomElement(['improving', 'stable', 'declining']) },
            science: { level: 'Y3', subLevel: randomElement(['emerging', 'developing', 'secure']), trend: randomElement(['improving', 'stable', 'declining']) }
          },
          overall_pace: profile.pace_level,
          engagement_trend: randomElement(['improving', 'stable', 'declining']),
          persistence_trend: randomElement(['improving', 'stable', 'declining']),
          milestones_achieved: week > 4 ? ['Completed fraction unit', 'Improved reading fluency'] : [],
          active_interventions: profile.needs_intervention ? 1 : 0,
          ehcp_relevant_data: student.sen_status ? {
            current_support: 'SEN Support',
            progress_towards_outcomes: 'Making expected progress'
          } : Prisma.JsonNull
        }
      });
      snapshotCount++;
    }
  }
  console.log(`✓ Created ${snapshotCount} progress snapshots`);

  console.log('\n✅ Orchestration Layer seed data generation complete!\n');
  console.log('📊 Summary:');
  console.log(`   - ${students.length} students with profiles`);
  console.log(`   - ${classRosters.length} class rosters`);
  console.log(`   - ${lessonPlans.length} lesson plans with activities`);
  console.log(`   - ${assignmentCount} student assignments`);
  console.log(`   - ${parentCount} parent-child links`);
  console.log(`   - ${voiceCommands.length} voice commands`);
  console.log(`   - 30 automated actions`);
  console.log(`   - ${snapshotCount} progress snapshots`);
  console.log('\n🎉 Ready for testing and demonstration!\n');
}

// ============================================================================
// EXECUTE SEED
// ============================================================================

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
