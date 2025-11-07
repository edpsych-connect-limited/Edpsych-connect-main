# Platform Orchestration Layer - Schema Integration Guide

**Date**: 2025-11-03
**Purpose**: Integrate 10 orchestration models into main schema.prisma
**Status**: Ready for Implementation
**Risk Level**: Medium (Adding new models + relations to existing models)

---

## 📋 Overview

This guide provides step-by-step instructions to integrate the Platform Orchestration Layer database models into the main schema.prisma file.

**What's Being Added**:
- 10 new database models (539 lines)
- Relations to 3 existing models (tenants, users, students)
- Proper indexes for performance
- Multi-tenant scoping on all models

**Impact**:
- No changes to existing model structures
- Only additive changes (new models + new relations)
- Backward compatible with existing code
- Requires database migration after integration

---

## ⚠️ Pre-Integration Checklist

Before proceeding, ensure:
- [ ] Backup current schema.prisma file ✅ (Already exists: schema.backup.prisma)
- [ ] Database backup created
- [ ] No pending migrations
- [ ] Development environment ready for testing
- [ ] Prisma CLI installed (`npx prisma --version`)

---

## 📦 Step 1: Add New Models at End of Schema

**Location**: Add after line 3853 (end of current schema.prisma)

**Section to Add**: Copy all 10 models from `prisma/schema-extensions/orchestration.prisma` (lines 16-502)

### Models Being Added:

1. **StudentProfile** (49 lines)
   - Auto-built learning profile from all interactions
   - Strengths/struggles auto-identification
   - Behavioral patterns tracking
   - AI-powered readiness predictions

2. **ClassRoster** (35 lines)
   - Teacher's class structure
   - Auto-grouping by performance level
   - Voice command settings

3. **LessonPlan** (43 lines)
   - Teacher-created lessons
   - Curriculum-linked
   - Differentiation tracking

4. **LessonActivity** (33 lines)
   - Individual activities within lessons
   - Differentiated versions storage

5. **StudentLessonAssignment** (44 lines)
   - Personalized lesson assignments
   - Performance tracking
   - Automated trigger flags

6. **StudentActivityResponse** (32 lines)
   - Fine-grained activity tracking
   - Behavioral data capture
   - AI difficulty analysis

7. **StudentProgressSnapshot** (48 lines)
   - Point-in-time progress records
   - Weekly/monthly/term snapshots
   - Multi-agency relevant data

8. **MultiAgencyAccess** (42 lines)
   - Role-based access control
   - Student scoping by role
   - Action permissions

9. **ParentChildLink** (36 lines)
   - Parent-child relationships
   - Communication preferences
   - Verification status

10. **VoiceCommand** (36 lines)
    - Voice interface audit trail
    - Intent interpretation logging
    - Performance metrics

11. **AutomatedAction** (39 lines)
    - System automation audit trail
    - Approval workflow tracking
    - Outcome recording

### Implementation:

```bash
# Navigate to prisma directory
cd C:\Users\scott\Desktop\package\prisma

# Open schema.prisma in your editor
# Scroll to end of file (line 3853)
# Add the following header comment:
```

```prisma
// ============================================================================
// PLATFORM ORCHESTRATION LAYER MODELS
// ============================================================================
// Added: 2025-11-03
// Purpose: Invisible intelligence connecting all features
// Vision: "No child left behind again" through automatic differentiation
// ============================================================================
```

Then copy models from `schema-extensions/orchestration.prisma` (lines 20-502).

---

## 🔗 Step 2: Add Relations to Existing Models

### 2.1 Add to `tenants` model (around line 64-144)

**Location**: Inside `model tenants` after existing relations (around line 137)

**Add These Lines**:

```prisma
  // Relations - Platform Orchestration Layer
  student_profiles           StudentProfile[]
  class_rosters              ClassRoster[]
  lesson_plans               LessonPlan[]
  student_lesson_assignments StudentLessonAssignment[]
  student_progress_snapshots StudentProgressSnapshot[]
  multi_agency_access        MultiAgencyAccess[]
  parent_child_links         ParentChildLink[]
  voice_commands             VoiceCommand[]
  automated_actions          AutomatedAction[]
```

**Where Exactly**: Insert after line 138 (after `study_buddy_agent_analytics StudyBuddyAgentAnalytics[]`)

---

### 2.2 Add to `students` model (around line 259-280)

**Location**: Inside `model students` after existing relations (around line 274)

**Current Last Line**:
```prisma
  cases   cases[]
```

**Add These Lines After**:

```prisma
  // Relations - Platform Orchestration Layer
  student_profile     StudentProfile?
  lesson_assignments  StudentLessonAssignment[]
  activity_responses  StudentActivityResponse[]
  progress_snapshots  StudentProgressSnapshot[]
  parent_links        ParentChildLink[]
```

---

### 2.3 Add to `users` model (around line 146-253)

**Location**: Inside `model users` after existing relations (around line 247)

**Current Last Line**:
```prisma
  conversational_ai_sessions  ConversationalAISession[]
```

**Add These Lines After**:

```prisma
  // Relations - Platform Orchestration Layer
  class_rosters_teaching  ClassRoster[]
  lesson_plans_created    LessonPlan[]
  multi_agency_access     MultiAgencyAccess?
  parent_child_links      ParentChildLink[]
  voice_commands          VoiceCommand[]
```

---

## 🗂️ Step 3: Verify Schema Integrity

After making all changes, run validation:

```bash
# Format the schema (auto-fixes formatting issues)
npx prisma format

# Validate schema syntax
npx prisma validate

# Check for errors
# Should output: "The schema is valid ✓"
```

**Common Errors to Watch For**:
- ❌ Missing commas in relation lists
- ❌ Typos in model names
- ❌ Missing `?` for optional relations
- ❌ Missing `[]` for array relations
- ❌ Incorrect indentation (Prisma is whitespace-sensitive)

---

## 🚀 Step 4: Create Database Migration

Once schema validates successfully:

```bash
# Generate migration files
npx prisma migrate dev --name add_platform_orchestration_layer

# This will:
# 1. Create new tables for all 10 models
# 2. Add foreign key constraints
# 3. Create indexes
# 4. Apply migration to development database
```

**Expected Output**:
```
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "edpsych_db", schema "public" at "localhost:5432"

Applying migration `20251103_add_platform_orchestration_layer`

The following migrations have been created and applied from new schema changes:

migrations/
  └─ 20251103_add_platform_orchestration_layer/
      └─ migration.sql

✔ Generated Prisma Client to ./node_modules/@prisma/client
```

---

## 📊 Step 5: Verify Database Changes

```bash
# Check that all tables were created
npx prisma db pull --print

# Open Prisma Studio to inspect new tables
npx prisma studio

# In Studio, verify:
# ✓ StudentProfile table exists
# ✓ ClassRoster table exists
# ✓ LessonPlan table exists
# ✓ StudentLessonAssignment table exists
# ✓ StudentActivityResponse table exists
# ✓ StudentProgressSnapshot table exists
# ✓ MultiAgencyAccess table exists
# ✓ ParentChildLink table exists
# ✓ VoiceCommand table exists
# ✓ AutomatedAction table exists
# ✓ All foreign keys point to correct tables
# ✓ All indexes were created
```

---

## 🧪 Step 6: Test Integration with Code

Create a test file to verify Prisma Client recognizes new models:

```typescript
// test-orchestration-schema.ts
import prisma from '@/lib/prismaSafe';

async function testOrchestrationSchema() {
  try {
    console.log('Testing Platform Orchestration Layer schema integration...\n');

    // Test 1: Check StudentProfile model
    const profileCount = await prisma.studentProfile.count();
    console.log('✓ StudentProfile model accessible:', profileCount);

    // Test 2: Check ClassRoster model
    const classCount = await prisma.classRoster.count();
    console.log('✓ ClassRoster model accessible:', classCount);

    // Test 3: Check LessonPlan model
    const lessonCount = await prisma.lessonPlan.count();
    console.log('✓ LessonPlan model accessible:', lessonCount);

    // Test 4: Check StudentLessonAssignment model
    const assignmentCount = await prisma.studentLessonAssignment.count();
    console.log('✓ StudentLessonAssignment model accessible:', assignmentCount);

    // Test 5: Check MultiAgencyAccess model
    const accessCount = await prisma.multiAgencyAccess.count();
    console.log('✓ MultiAgencyAccess model accessible:', accessCount);

    // Test 6: Check ParentChildLink model
    const linkCount = await prisma.parentChildLink.count();
    console.log('✓ ParentChildLink model accessible:', linkCount);

    // Test 7: Check VoiceCommand model
    const voiceCount = await prisma.voiceCommand.count();
    console.log('✓ VoiceCommand model accessible:', voiceCount);

    // Test 8: Check AutomatedAction model
    const actionCount = await prisma.automatedAction.count();
    console.log('✓ AutomatedAction model accessible:', actionCount);

    console.log('\n✅ All orchestration models integrated successfully!');

  } catch (error) {
    console.error('❌ Schema integration test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testOrchestrationSchema();
```

Run the test:
```bash
npx tsx test-orchestration-schema.ts
```

---

## 📝 Step 7: Update TypeScript Types

Prisma Client types are auto-generated, but verify they're imported correctly in services:

```typescript
// src/lib/orchestration/profile-builder.service.ts
import { StudentProfile, Prisma } from '@prisma/client';

// Should now work without errors:
const profile: StudentProfile = { ... };
```

---

## 🔄 Step 8: Rollback Plan (If Needed)

If integration fails or causes issues:

```bash
# Rollback last migration
npx prisma migrate dev --rollback

# Restore backup schema
cp prisma/schema.backup.prisma prisma/schema.prisma

# Regenerate Prisma Client
npx prisma generate
```

---

## ✅ Integration Complete Checklist

- [ ] All 10 models added to schema.prisma
- [ ] Relations added to tenants model
- [ ] Relations added to students model
- [ ] Relations added to users model
- [ ] Schema validates with `npx prisma validate`
- [ ] Migration created and applied successfully
- [ ] All tables exist in database
- [ ] Prisma Studio shows new tables
- [ ] Test script runs without errors
- [ ] TypeScript types work in services
- [ ] No breaking changes to existing code

---

## 📊 Expected Database Structure After Integration

### New Tables Created (10):

| Table Name | Primary Key | Foreign Keys | Indexes |
|------------|-------------|--------------|---------|
| **StudentProfile** | id (cuid) | tenant_id, student_id | 4 indexes |
| **ClassRoster** | id (cuid) | tenant_id, teacher_id | 3 indexes |
| **LessonPlan** | id (cuid) | tenant_id, class_roster_id, teacher_id | 5 indexes |
| **LessonActivity** | id (cuid) | lesson_plan_id | 2 indexes |
| **StudentLessonAssignment** | id (cuid) | tenant_id, student_id, lesson_plan_id, student_profile_id | 5 indexes |
| **StudentActivityResponse** | id (cuid) | student_assignment_id, activity_id | 4 indexes |
| **StudentProgressSnapshot** | id (cuid) | tenant_id, student_id, student_profile_id | 4 indexes |
| **MultiAgencyAccess** | id (cuid) | tenant_id, user_id | 3 indexes + unique |
| **ParentChildLink** | id (cuid) | tenant_id, parent_id, child_id | 3 indexes + unique |
| **VoiceCommand** | id (cuid) | tenant_id, user_id | 4 indexes |
| **AutomatedAction** | id (cuid) | tenant_id, student_id (optional) | 5 indexes |

### Foreign Key Relationships:

```
tenants (1) ----< StudentProfile (many)
tenants (1) ----< ClassRoster (many)
tenants (1) ----< LessonPlan (many)
tenants (1) ----< StudentLessonAssignment (many)
tenants (1) ----< StudentProgressSnapshot (many)
tenants (1) ----< MultiAgencyAccess (many)
tenants (1) ----< ParentChildLink (many)
tenants (1) ----< VoiceCommand (many)
tenants (1) ----< AutomatedAction (many)

users (1) ----< ClassRoster (many)
users (1) ----< LessonPlan (many)
users (1) ----< MultiAgencyAccess (1)
users (1) ----< ParentChildLink (many)
users (1) ----< VoiceCommand (many)

students (1) ----< StudentProfile (1)
students (1) ----< StudentLessonAssignment (many)
students (1) ----< StudentProgressSnapshot (many)
students (1) ----< ParentChildLink (many)

ClassRoster (1) ----< LessonPlan (many)
LessonPlan (1) ----< LessonActivity (many)
LessonPlan (1) ----< StudentLessonAssignment (many)
LessonActivity (1) ----< StudentActivityResponse (many)
StudentProfile (1) ----< StudentLessonAssignment (many)
StudentProfile (1) ----< StudentProgressSnapshot (many)
StudentProfile (1) ----< AutomatedAction (many)
StudentLessonAssignment (1) ----< StudentActivityResponse (many)
```

---

## 🚨 Troubleshooting

### Error: "Unknown field"
**Cause**: Typo in relation name
**Fix**: Double-check relation names match model names exactly (camelCase)

### Error: "Type mismatch"
**Cause**: Foreign key type doesn't match referenced field
**Fix**: Ensure `tenant_id Int` matches `tenants.id @id @default(autoincrement())`

### Error: "Unique constraint failed"
**Cause**: Duplicate unique indexes
**Fix**: Check for `@@unique` conflicts with existing indexes

### Migration Fails
**Cause**: Database connection issue or insufficient permissions
**Fix**: Verify DATABASE_URL in .env, check PostgreSQL is running

### TypeScript Errors After Integration
**Cause**: Prisma Client not regenerated
**Fix**: Run `npx prisma generate` to update types

---

## 📧 Support

If you encounter issues during integration:
1. Check error messages carefully
2. Verify each step was completed
3. Review schema.prisma for syntax errors
4. Check database logs for migration issues
5. Consult Prisma docs: https://www.prisma.io/docs

---

## ✅ Success Criteria

Integration is successful when:
- ✅ `npx prisma validate` passes
- ✅ Migration applies without errors
- ✅ All 10 tables visible in Prisma Studio
- ✅ Test script runs successfully
- ✅ No TypeScript errors in orchestration services
- ✅ Existing code still works (backward compatible)

---

**Next Steps After Integration**:
1. Generate seed data (see SEED-DATA-GENERATION-GUIDE.md)
2. Set up React Query provider
3. Run end-to-end tests
4. Deploy to production

**Current Status**: Ready for schema integration
**Estimated Time**: 30-45 minutes
**Risk Level**: Medium (test thoroughly before production)
