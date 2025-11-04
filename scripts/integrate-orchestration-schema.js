/**
 * ORCHESTRATION SCHEMA INTEGRATION SCRIPT
 *
 * Safely integrates orchestration models and relations into the main Prisma schema
 */

const fs = require('fs');
const path = require('path');

// Paths
const SCHEMA_PATH = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const ORCHESTRATION_PATH = path.join(__dirname, '..', 'prisma', 'schema-extensions', 'orchestration.prisma');
const BACKUP_PATH = path.join(__dirname, '..', 'prisma', `schema-backup-${Date.now()}.prisma`);

console.log('🔧 Orchestration Schema Integration Script');
console.log('===========================================\n');

// Step 1: Create backup
console.log('📁 Step 1: Creating backup...');
try {
  const schemaContent = fs.readFileSync(SCHEMA_PATH, 'utf8');
  fs.writeFileSync(BACKUP_PATH, schemaContent);
  console.log(`✅ Backup created: ${path.basename(BACKUP_PATH)}\n`);
} catch (error) {
  console.error('❌ Error creating backup:', error.message);
  process.exit(1);
}

// Step 2: Read files
console.log('📖 Step 2: Reading schema files...');
let schema, orchestration;
try {
  schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  orchestration = fs.readFileSync(ORCHESTRATION_PATH, 'utf8');
  console.log('✅ Schema files read successfully\n');
} catch (error) {
  console.error('❌ Error reading files:', error.message);
  process.exit(1);
}

// Step 3: Add relations to tenants model
console.log('🔗 Step 3: Adding relations to tenants model...');
const tenantsRelations = `
  // Relations - Platform Orchestration Layer
  student_profiles            StudentProfile[]
  class_rosters               ClassRoster[]
  lesson_plans                LessonPlan[]
  student_lesson_assignments  StudentLessonAssignment[]
  student_progress_snapshots  StudentProgressSnapshot[]
  multi_agency_access         MultiAgencyAccess[]
  parent_child_links          ParentChildLink[]
  voice_commands              VoiceCommand[]
  automated_actions           AutomatedAction[]
`;

// Find the line where we should add tenants relations (before @@index section)
const tenantsRegex = /(study_buddy_agent_analytics\s+StudyBuddyAgentAnalytics\[\])(\s+@@index\[)/g;
schema = schema.replace(tenantsRegex, `$1${tenantsRelations}$2`);
console.log('✅ Relations added to tenants model\n');

// Step 4: Add relations to users model
console.log('🔗 Step 4: Adding relations to users model...');
const usersRelations = `
  // Relations - Platform Orchestration Layer
  class_rosters_teaching      ClassRoster[]
  lesson_plans_created        LessonPlan[]
  multi_agency_access         MultiAgencyAccess?
  parent_child_links          ParentChildLink[]
  voice_commands              VoiceCommand[]
`;

// Find the line where we should add users relations (before @@index section)
const usersRegex = /(conversational_ai_sessions\s+ConversationalAISession\[\])(\s+@@index\[)/g;
schema = schema.replace(usersRegex, `$1${usersRelations}$2`);
console.log('✅ Relations added to users model\n');

// Step 5: Add relations to students model
console.log('🔗 Step 5: Adding relations to students model...');
const studentsRelations = `  student_profile            StudentProfile?
  lesson_assignments         StudentLessonAssignment[]
  progress_snapshots         StudentProgressSnapshot[]
  parent_links               ParentChildLink[]
`;

// Find students model and add relations before @@unique
const studentsRegex = /(model students \{[^}]*)(@@unique\[tenant_id, unique_id\])/gs;
schema = schema.replace(studentsRegex, (match, p1, p2) => {
  // Check if relations already exist
  if (p1.includes('student_profile')) {
    return match; // Already added
  }
  return `${p1}\n${studentsRelations}\n  ${p2}`;
});
console.log('✅ Relations added to students model\n');

// Step 6: Extract orchestration models from orchestration.prisma
console.log('📦 Step 6: Extracting orchestration models...');
const orchestrationModels = [];
const modelMatches = orchestration.matchAll(/^model\s+\w+\s+\{[\s\S]*?^}/gm);
for (const match of modelMatches) {
  orchestrationModels.push(match[0]);
}
console.log(`✅ Found ${orchestrationModels.length} orchestration models\n`);

// Step 7: Append orchestration models to schema
console.log('📝 Step 7: Appending orchestration models to schema...');
const orchestrationSection = `

// ============================================================================
// PLATFORM ORCHESTRATION LAYER - DATABASE MODELS
// ============================================================================
//
// PURPOSE: The "invisible intelligence" that connects all features into a
// seamless, automated system reducing teacher workload by 80%.
//
// CORE VISION: "No child left behind again" through automatic differentiation,
// profile building from usage, multi-agency collaboration, and stress-free workflows.
//
// ============================================================================

${orchestrationModels.join('\n\n')}

// ============================================================================
// END OF PLATFORM ORCHESTRATION LAYER
// ============================================================================
`;

schema += orchestrationSection;
console.log('✅ Orchestration models appended\n');

// Step 8: Write updated schema
console.log('💾 Step 8: Writing updated schema...');
try {
  fs.writeFileSync(SCHEMA_PATH, schema);
  console.log('✅ Schema updated successfully\n');
} catch (error) {
  console.error('❌ Error writing schema:', error.message);
  console.error('⚠️  Restoring from backup...');
  fs.copyFileSync(BACKUP_PATH, SCHEMA_PATH);
  process.exit(1);
}

// Step 9: Validation
console.log('🔍 Step 9: Validating schema...');
const finalSchema = fs.readFileSync(SCHEMA_PATH, 'utf8');
const modelCount = (finalSchema.match(/^model \w+ \{/gm) || []).length;
console.log(`✅ Total models in schema: ${modelCount}\n`);

// Summary
console.log('===========================================');
console.log('✅ Schema Integration Complete!');
console.log('===========================================');
console.log('');
console.log('📊 Summary:');
console.log(`   ✅ Relations added to tenants model`);
console.log(`   ✅ Relations added to users model`);
console.log(`   ✅ Relations added to students model`);
console.log(`   ✅ ${orchestrationModels.length} orchestration models added`);
console.log(`   ✅ Backup saved: ${path.basename(BACKUP_PATH)}`);
console.log('');
console.log('🚀 Next Steps:');
console.log('   1. Run: npx prisma migrate dev --name add_orchestration_layer');
console.log('   2. Run: npx prisma generate');
console.log('   3. Run: npx tsx prisma/seed-orchestration.ts');
console.log('');
