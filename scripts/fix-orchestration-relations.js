/**
 * FIX ORCHESTRATION RELATIONS
 *
 * Fixes relation names to match Prisma conventions
 */

const fs = require('fs');
const path = require('path');

const SCHEMA_PATH = path.join(__dirname, '..', 'prisma', 'schema.prisma');

console.log('🔧 Fixing Orchestration Relations...\n');

// Read schema
let schema = fs.readFileSync(SCHEMA_PATH, 'utf8');

// Remove the incorrectly named relations we added
const incorrectRelations = [
  '  // Relations - Platform Orchestration Layer\n  student_profiles            StudentProfile[]\n  class_rosters               ClassRoster[]\n  lesson_plans                LessonPlan[]\n  student_lesson_assignments  StudentLessonAssignment[]\n  student_progress_snapshots  StudentProgressSnapshot[]\n  multi_agency_access         MultiAgencyAccess[]\n  parent_child_links          ParentChildLink[]\n  voice_commands              VoiceCommand[]\n  automated_actions           AutomatedAction[]',
  '  // Relations - Platform Orchestration Layer\n  class_rosters_teaching      ClassRoster[]\n  lesson_plans_created        LessonPlan[]\n  multi_agency_access         MultiAgencyAccess?\n  parent_child_links          ParentChildLink[]\n  voice_commands              VoiceCommand[]',
  '  student_profile            StudentProfile?\n  lesson_assignments         StudentLessonAssignment[]\n  progress_snapshots         StudentProgressSnapshot[]\n  parent_links               ParentChildLink[]'
];

// Remove all incorrect relations
incorrectRelations.forEach(incorrect => {
  schema = schema.replace(incorrect, '');
});

// Add correct relations to tenants model (before @@index)
const tenantsCorrect = `
  // Relations - Platform Orchestration Layer
  StudentProfile              StudentProfile[]             @relation("TenantToStudentProfile")
  ClassRoster                 ClassRoster[]                @relation("TenantToClassRoster")
  LessonPlan                  LessonPlan[]                 @relation("TenantToLessonPlan")
  StudentLessonAssignment     StudentLessonAssignment[]    @relation("TenantToStudentLessonAssignment")
  StudentProgressSnapshot     StudentProgressSnapshot[]    @relation("TenantToStudentProgressSnapshot")
  MultiAgencyAccess           MultiAgencyAccess[]          @relation("TenantToMultiAgencyAccess")
  ParentChildLink             ParentChildLink[]            @relation("TenantToParentChildLink")
  VoiceCommand                VoiceCommand[]               @relation("TenantToVoiceCommand")
  AutomatedAction             AutomatedAction[]            @relation("TenantToAutomatedAction")
`;

//Fix tenants model
schema = schema.replace(
  /(study_buddy_agent_analytics\s+StudyBuddyAgentAnalytics\[\])\s+(@@index\[)/,
  `$1${tenantsCorrect}\n  $2`
);

// Add correct relations to users model (before @@index)
const usersCorrect = `
  // Relations - Platform Orchestration Layer
  ClassRosterTeacher          ClassRoster[]                @relation("UserToClassRoster")
  LessonPlanCreator           LessonPlan[]                 @relation("UserToLessonPlan")
  MultiAgencyAccessUser       MultiAgencyAccess?           @relation("UserToMultiAgencyAccess")
  ParentChildLinkParent       ParentChildLink[]            @relation("UserToParentChildLink")
  VoiceCommandUser            VoiceCommand[]               @relation("UserToVoiceCommand")
`;

// Fix users model
schema = schema.replace(
  /(conversational_ai_sessions\s+ConversationalAISession\[\])\s+(@@index\[)/,
  `$1${usersCorrect}\n  $2`
);

// Add correct relations to students model (before @@unique)
const studentsCorrect = `
  // Relations - Platform Orchestration Layer
  StudentProfile              StudentProfile?              @relation("StudentToStudentProfile")
  StudentLessonAssignment     StudentLessonAssignment[]    @relation("StudentToStudentLessonAssignment")
  StudentProgressSnapshot     StudentProgressSnapshot[]    @relation("StudentToStudentProgressSnapshot")
  ParentChildLinkChild        ParentChildLink[]            @relation("StudentToParentChildLink")

`;

// Fix students model
schema = schema.replace(
  /(model students \{[^}]*cases\s+cases\[\])\s+(@@unique)/gs,
  `$1\n${studentsCorrect}  $2`
);

// Now fix the relations in orchestration models to use these relation names
const relationFixes = [
  // StudentProfile
  { from: '@relation(fields: [tenant_id]', to: '@relation("TenantToStudentProfile", fields: [tenant_id]' },
  { from: 'student             students                  @relation(fields: [student_id]', to: 'student             students                  @relation("StudentToStudentProfile", fields: [student_id]' },

  // ClassRoster
  { from: 'tenant       tenants      @relation(fields: [tenant_id], references: [id], onDelete: Cascade)\n  teacher      users        @relation(fields: [teacher_id]', to: 'tenant       tenants      @relation("TenantToClassRoster", fields: [tenant_id], references: [id], onDelete: Cascade)\n  teacher      users        @relation("UserToClassRoster", fields: [teacher_id]' },

  // LessonPlan
  { from: '  tenant              tenants                   @relation(fields: [tenant_id], references: [id], onDelete: Cascade)\n  class_roster        ClassRoster               @relation(fields: [class_roster_id], references: [id], onDelete: Cascade)\n  teacher             users                     @relation(fields: [teacher_id]', to: '  tenant              tenants                   @relation("TenantToLessonPlan", fields: [tenant_id], references: [id], onDelete: Cascade)\n  class_roster        ClassRoster               @relation(fields: [class_roster_id], references: [id], onDelete: Cascade)\n  teacher             users                     @relation("UserToLessonPlan", fields: [teacher_id]' },

  // StudentLessonAssignment
  { from: '  tenant             tenants                   @relation(fields: [tenant_id], references: [id], onDelete: Cascade)\n  student            students                  @relation(fields: [student_id]', to: '  tenant             tenants                   @relation("TenantToStudentLessonAssignment", fields: [tenant_id], references: [id], onDelete: Cascade)\n  student            students                  @relation("StudentToStudentLessonAssignment", fields: [student_id]' },

  // StudentProgressSnapshot
  { from: '  tenant          tenants        @relation(fields: [tenant_id], references: [id], onDelete: Cascade)\n  student         students       @relation(fields: [student_id]', to: '  tenant          tenants        @relation("TenantToStudentProgressSnapshot", fields: [tenant_id], references: [id], onDelete: Cascade)\n  student         students       @relation("StudentToStudentProgressSnapshot", fields: [student_id]' },

  // MultiAgencyAccess
  { from: '  tenant tenants @relation(fields: [tenant_id], references: [id], onDelete: Cascade)\n  user   users   @relation(fields: [user_id]', to: '  tenant tenants @relation("TenantToMultiAgencyAccess", fields: [tenant_id], references: [id], onDelete: Cascade)\n  user   users   @relation("UserToMultiAgencyAccess", fields: [user_id]' },

  // ParentChildLink
  { from: '  tenant tenants  @relation(fields: [tenant_id], references: [id], onDelete: Cascade)\n  parent users    @relation(fields: [parent_id], references: [id], onDelete: Cascade)\n  child  students @relation(fields: [child_id]', to: '  tenant tenants  @relation("TenantToParentChildLink", fields: [tenant_id], references: [id], onDelete: Cascade)\n  parent users    @relation("UserToParentChildLink", fields: [parent_id], references: [id], onDelete: Cascade)\n  child  students @relation("StudentToParentChildLink", fields: [child_id]' },

  // VoiceCommand
  { from: '  tenant tenants @relation(fields: [tenant_id], references: [id], onDelete: Cascade)\n  user   users   @relation(fields: [user_id], references: [id], onDelete: Cascade)\n\n  @@index([tenant_id])\n  @@index([user_id])', to: '  tenant tenants @relation("TenantToVoiceCommand", fields: [tenant_id], references: [id], onDelete: Cascade)\n  user   users   @relation("UserToVoiceCommand", fields: [user_id], references: [id], onDelete: Cascade)\n\n  @@index([tenant_id])\n  @@index([user_id])' },

  // AutomatedAction
  { from: '  tenant          tenants         @relation(fields: [tenant_id], references: [id], onDelete: Cascade)\n  student_profile StudentProfile? @relation(fields: [student_id], references: [id])', to: '  tenant          tenants         @relation("TenantToAutomatedAction", fields: [tenant_id], references: [id], onDelete: Cascade)\n  student_profile StudentProfile? @relation(fields: [student_id], references: [id])' },
];

// Apply all relation fixes
relationFixes.forEach(fix => {
  schema = schema.replace(fix.from, fix.to);
});

// Also need to fix AutomatedAction's student_id field reference (should reference student_profile_id not student_id for StudentProfile)
schema = schema.replace(
  'model AutomatedAction {\n  id         String @id @default(cuid())\n  tenant_id  Int\n\n  // Action Details\n  action_type  String // "profile_updated", "intervention_triggered", "lesson_assigned", "parent_notified", "level_changed"\n  triggered_by String // "assessment_complete", "struggle_pattern", "success_pattern", "ehcp_due", "time_based"\n\n  // Target\n  target_type String // "student", "class", "lesson", "intervention"\n  target_id   String\n  student_id  Int? // If action relates to specific student',
  'model AutomatedAction {\n  id         String @id @default(cuid())\n  tenant_id  Int\n\n  // Action Details\n  action_type  String // "profile_updated", "intervention_triggered", "lesson_assigned", "parent_notified", "level_changed"\n  triggered_by String // "assessment_complete", "struggle_pattern", "success_pattern", "ehcp_due", "time_based"\n\n  // Target\n  target_type String // "student", "class", "lesson", "intervention"\n  target_id   String\n  student_profile_id String? // If action relates to specific student profile'
);

schema = schema.replace(
  '  tenant          tenants         @relation("TenantToAutomatedAction", fields: [tenant_id], references: [id], onDelete: Cascade)\n  student_profile StudentProfile? @relation(fields: [student_id], references: [id])',
  '  tenant          tenants         @relation("TenantToAutomatedAction", fields: [tenant_id], references: [id], onDelete: Cascade)\n  student_profile StudentProfile? @relation(fields: [student_profile_id], references: [id])'
);

schema = schema.replace(
  '  @@index([action_type])\n  @@index([student_id])',
  '  @@index([action_type])\n  @@index([student_profile_id])'
);

// Write fixed schema
fs.writeFileSync(SCHEMA_PATH, schema);

console.log('✅ Relations fixed!\n');
console.log('🚀 Next: Run npx prisma migrate dev --name add_orchestration_layer\n');
