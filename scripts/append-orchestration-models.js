/**
 * APPEND ORCHESTRATION MODELS (SAFE APPROACH)
 *
 * This script safely appends orchestration models to the schema
 * Then provides exact manual instructions for adding relations
 */

const fs = require('fs');
const path = require('path');

const SCHEMA_PATH = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const ORCHESTRATION_PATH = path.join(__dirname, '..', 'prisma', 'schema-extensions', 'orchestration.prisma');

console.log('🔧 Safe Orchestration Schema Integration\n');
console.log('==========================================\n');

// Step 1: Create backup
console.log('📁 Creating backup...');
const backup = path.join(__dirname, '..', 'prisma', `schema-backup-${Date.now()}.prisma`);
fs.copyFileSync(SCHEMA_PATH, backup);
console.log(`✅ Backup: ${path.basename(backup)}\n`);

// Step 2: Read files
let schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
const orchestration = fs.readFileSync(ORCHESTRATION_PATH, 'utf8');

// Step 3: Extract just the model definitions (not the relations instructions at bottom)
const orchestrationModels = [];
const modelRegex = /^model\s+(\w+)\s+\{[\s\S]*?^}/gm;
let match;
while ((match = modelRegex.exec(orchestration)) !== null) {
  orchestrationModels.push(match[0]);
}

console.log(`📦 Found ${orchestrationModels.length} orchestration models:\n`);
orchestrationModels.forEach((model, i) => {
  const modelName = model.match(/^model\s+(\w+)/)[1];
  console.log(`   ${i + 1}. ${modelName}`);
});
console.log('');

// Step 4: Append models to schema
const orchestrationSection = `

// ============================================================================
// PLATFORM ORCHESTRATION LAYER
// ============================================================================
//
// PURPOSE: "No child left behind again" - The invisible intelligence that
// connects all features into a seamless, automated system.
//
// FEATURES:
// - Auto-built student profiles from ALL interactions (no manual setup)
// - Instant lesson differentiation for entire class
// - Voice command interface for teachers
// - Multi-agency collaboration (teachers, EPs, parents)
// - Automated interventions and parent notifications
//
// ============================================================================

${orchestrationModels.join('\n\n')}

// ============================================================================
// END OF PLATFORM ORCHESTRATION LAYER
// ============================================================================
`;

schema += orchestrationSection;

// Step 5: Write updated schema
fs.writeFileSync(SCHEMA_PATH, schema);
console.log('✅ Orchestration models appended to schema\n');

// Step 6: Verify
const updatedSchema = fs.readFileSync(SCHEMA_PATH, 'utf8');
const totalModels = (updatedSchema.match(/^model \w+ \{/gm) || []).length;
console.log(`✅ Total models in schema: ${totalModels}\n`);

// Step 7: Provide manual instructions
console.log('==========================================');
console.log('⚠️  MANUAL STEP REQUIRED');
console.log('==========================================\n');

console.log('The orchestration models have been added, but you need to add');
console.log('3 relation blocks manually to avoid conflicts.\n');

console.log('📝 STEP 1: Edit prisma/schema.prisma\n');

console.log('🔹 Find the "tenants" model (around line 64)');
console.log('🔹 Locate this section:');
console.log('');
console.log('  study_buddy_agent_analytics StudyBuddyAgentAnalytics[]');
console.log('');
console.log('🔹 Add AFTER that line (before @@index):');
console.log('');
console.log('  // Relations - Platform Orchestration Layer');
console.log('  student_profiles            StudentProfile[]');
console.log('  class_rosters               ClassRoster[]');
console.log('  lesson_plans                LessonPlan[]');
console.log('  student_lesson_assignments  StudentLessonAssignment[]');
console.log('  student_progress_snapshots  StudentProgressSnapshot[]');
console.log('  multi_agency_access         MultiAgencyAccess[]');
console.log('  parent_child_links          ParentChildLink[]');
console.log('  voice_commands              VoiceCommand[]');
console.log('  automated_actions           AutomatedAction[]');
console.log('');

console.log('─────────────────────────────────────────\n');

console.log('🔹 Find the "users" model (around line 146)');
console.log('🔹 Locate this section:');
console.log('');
console.log('  conversational_ai_sessions  ConversationalAISession[]');
console.log('');
console.log('🔹 Add AFTER that line (before @@index):');
console.log('');
console.log('  // Relations - Platform Orchestration Layer');
console.log('  class_rosters_teaching      ClassRoster[]');
console.log('  lesson_plans_created        LessonPlan[]');
console.log('  multi_agency_access         MultiAgencyAccess?');
console.log('  parent_child_links          ParentChildLink[]');
console.log('  voice_commands              VoiceCommand[]');
console.log('');

console.log('─────────────────────────────────────────\n');

console.log('🔹 Find the "students" model (around line 259)');
console.log('🔹 Locate this section:');
console.log('');
console.log('  cases   cases[]');
console.log('');
console.log('🔹 Add AFTER that line (before @@unique):');
console.log('');
console.log('  // Relations - Platform Orchestration Layer');
console.log('  student_profile            StudentProfile?');
console.log('  lesson_assignments         StudentLessonAssignment[]');
console.log('  progress_snapshots         StudentProgressSnapshot[]');
console.log('  parent_links               ParentChildLink[]');
console.log('');

console.log('==========================================');
console.log('📝 STEP 2: Run Prisma Format');
console.log('==========================================\n');

console.log('After adding the 3 relation blocks, run:');
console.log('');
console.log('  npx prisma format');
console.log('');
console.log('This will auto-fix relation names on both sides.\n');

console.log('==========================================');
console.log('📝 STEP 3: Run Migration');
console.log('==========================================\n');

console.log('Once Prisma format succeeds, run:');
console.log('');
console.log('  npx prisma migrate dev --name add_orchestration_layer');
console.log('');

console.log('==========================================');
console.log('✅ Summary');
console.log('==========================================\n');

console.log(`✅ Backup created: ${path.basename(backup)}`);
console.log(`✅ ${orchestrationModels.length} orchestration models added`);
console.log('⏳ 3 manual relation blocks needed (5 minutes)');
console.log('');
console.log('💡 TIP: Open prisma/schema.prisma in VS Code');
console.log('    Use Ctrl+F to find "tenants", "users", "students"');
console.log('    Copy/paste the relation blocks shown above');
console.log('');
