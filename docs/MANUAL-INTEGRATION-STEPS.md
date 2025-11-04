# Manual Schema Integration Steps

**Status**: 11 orchestration models added ✅ | 3 relation blocks needed ⏳

**Time Required**: 5-10 minutes

---

## ✅ What's Already Done:

- 11 orchestration models appended to `prisma/schema.prisma`
- Backup created: `schema-backup-1762217031125.prisma`
- Total models: 148 (was 137, added 11)

---

## ⏳ What You Need to Do:

Add 3 small relation blocks to existing models. Copy/paste exactly as shown.

---

### Step 1: Edit `tenants` Model

**Location**: Line ~64 in `prisma/schema.prisma`

**Find this line:**
```prisma
  study_buddy_agent_analytics StudyBuddyAgentAnalytics[]

  @@index([subdomain])
```

**Add BETWEEN those lines:**
```prisma
  study_buddy_agent_analytics StudyBuddyAgentAnalytics[]

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

  @@index([subdomain])
```

---

### Step 2: Edit `users` Model

**Location**: Line ~246 in `prisma/schema.prisma`

**Find this line:**
```prisma
  conversational_ai_sessions  ConversationalAISession[]

  @@index([tenant_id])
```

**Add BETWEEN those lines:**
```prisma
  conversational_ai_sessions  ConversationalAISession[]

  // Relations - Platform Orchestration Layer
  class_rosters_teaching      ClassRoster[]
  lesson_plans_created        LessonPlan[]
  multi_agency_access         MultiAgencyAccess?
  parent_child_links          ParentChildLink[]
  voice_commands              VoiceCommand[]

  @@index([tenant_id])
```

---

### Step 3: Edit `students` Model

**Location**: Line ~273 in `prisma/schema.prisma`

**Find this line:**
```prisma
  cases   cases[]

  @@unique([tenant_id, unique_id])
```

**Add BETWEEN those lines:**
```prisma
  cases   cases[]

  // Relations - Platform Orchestration Layer
  student_profile            StudentProfile?
  lesson_assignments         StudentLessonAssignment[]
  progress_snapshots         StudentProgressSnapshot[]
  parent_links               ParentChildLink[]

  @@unique([tenant_id, unique_id])
```

---

## Step 4: Run Prisma Format

After adding all 3 relation blocks, run:

```bash
npx prisma format
```

This will:
- Auto-fix relation names on both sides
- Validate the schema
- Format everything nicely

**Expected Output**: "Formatted /path/to/schema.prisma in XYZms"

---

## Step 5: Run Migration

Once Prisma format succeeds with no errors:

```bash
npx prisma migrate dev --name add_platform_orchestration_layer
```

**Expected Output**:
- Creates migration file
- Applies migration to database
- Creates 11 new tables

---

## Step 6: Generate Prisma Client

```bash
npx prisma generate
```

This regenerates the Prisma client with all new models.

---

## Step 7: Generate Seed Data

```bash
npx tsx prisma/seed-orchestration.ts
```

**Expected Output**:
```
🌱 Starting Orchestration Layer seed data generation...
✓ Created 50 students with profiles
✓ Created 2 class rosters
✓ Created 10 lesson plans with activities
✓ Created 100 student assignments
...
✅ Orchestration Layer seed data generation complete!
```

---

## Step 8: Run Tests

```bash
# API Health Check
./scripts/test-api-health.sh

# Performance Benchmark
./scripts/benchmark-performance.sh

# Data Integrity Check
npx tsx scripts/check-data-integrity.ts
```

---

## 🎯 Quick Copy/Paste Checklist

Use this to quickly complete the integration:

```bash
# 1. Open schema in VS Code
code prisma/schema.prisma

# 2. Use Ctrl+F to find and add relations to:
#    - "tenants" model (add 9 relations)
#    - "users" model (add 5 relations)
#    - "students" model (add 4 relations)

# 3. Format schema
npx prisma format

# 4. Run migration
npx prisma migrate dev --name add_platform_orchestration_layer

# 5. Generate client
npx prisma generate

# 6. Generate seed data
npx tsx prisma/seed-orchestration.ts

# 7. Run tests
./scripts/test-api-health.sh
npx tsx scripts/check-data-integrity.ts

# Done! 🎉
```

---

## 🐛 Troubleshooting

### Error: "Field X is already defined"

**Cause**: You added the relation block in the wrong place or twice

**Fix**:
1. Restore from backup: `cp prisma/schema-backup-1762217031125.prisma prisma/schema.prisma`
2. Try again, making sure to add BETWEEN the lines shown above

### Error: "Relation field X is missing opposite field"

**Cause**: You haven't added all 3 relation blocks yet

**Fix**: Make sure you've added relations to ALL THREE models (tenants, users, students)

### Error: "Field X does not exist on model Y"

**Cause**: Typo in the relation field name

**Fix**: Double-check the spelling matches exactly what's shown above

---

## 📊 What This Unlocks:

Once complete, you'll have:

✅ **11 new database tables**:
- StudentProfile (auto-built profiles)
- ClassRoster (teacher classes)
- LessonPlan (lesson plans)
- LessonActivity (individual activities)
- StudentLessonAssignment (personalized assignments)
- StudentActivityResponse (fine-grained tracking)
- StudentProgressSnapshot (historical progress)
- MultiAgencyAccess (role-based permissions)
- ParentChildLink (parent-child relationships)
- VoiceCommand (voice interface log)
- AutomatedAction (automation audit trail)

✅ **500+ seed records**:
- 50 students with varied profiles
- 2 class rosters (Year 3, Year 4)
- 10 lesson plans
- 100+ student assignments
- 20 parent-child links
- And more...

✅ **Ready to use**:
- React Query hooks (20+)
- API routes (13)
- UI components (7)
- Test automation (3 scripts)

---

## 🚀 After Integration:

Once you've completed these steps, the **Platform Orchestration Layer** is fully operational:

1. **Teachers** can view class dashboards with auto-built student profiles
2. **System** automatically differentiates lessons for entire class
3. **Voice commands** work for natural language queries
4. **Parents** can view progress in plain English
5. **EPs** can access cross-school data
6. **Automated interventions** trigger based on student patterns

---

**Status**: Models added ✅ | Relations pending (5 min) ⏳ | Then fully operational! 🚀

**Next**: Follow Steps 1-3 above to add the 3 relation blocks
