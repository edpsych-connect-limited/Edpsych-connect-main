# EdPsych Connect Beta Login Credentials

**Document Classification:** CONFIDENTIAL - Beta Testers Only  
**Last Updated:** December 2025  
**Platform URL:** https://www.edpsychconnect.world

---

## 🔐 Demo Accounts (All Roles)

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | admin@demo.com | Test123! | Full platform access |
| **Educational Psychologist** | ep@demo.com | Test123! | EP dashboard, assessments, EHCP |
| **Teacher** | teacher@demo.com | Test123! | Class management, interventions |
| **Parent** | parent@demo.com | Test123! | Parent portal, child progress |
| **Student** | student@demo.com | Test123! | Student learning portal |
| **Researcher** | researcher@demo.com | Test123! | Research hub, data analytics |

---

## 👩‍🏫 Test Family Accounts

These accounts are linked together to demonstrate parent-child and teacher-student relationships:

### Teacher Account
- **Email:** teacher@test.edpsych.com
- **Password:** Test123!
- **Name:** Sarah Mitchell
- **Role:** Teacher
- **Assigned Class:** Year 3 Oak

### Student Account
- **Email:** amara.singh@test.edpsych.com
- **Password:** Test123!
- **Name:** Amara Singh
- **Role:** Student (Year 3)
- **SEN Status:** SEN Support

### Parent Account
- **Email:** priya.singh@test.edpsych.com
- **Password:** Test123!
- **Name:** Priya Singh
- **Role:** Parent
- **Linked Child:** Amara Singh

### Educational Psychologist Account
- **Email:** dr.patel@test.edpsych.com
- **Password:** Test123!
- **Name:** Dr. Priya Patel
- **Role:** Educational Psychologist
- **Caseload:** Amara Singh

---

## 🌟 Caroline Marriott Pilot Account

**Special pilot user with full access for evaluation:**

- **Email:** caroline.marriott@pathfinder.edu
- **Password:** Pathfinder2025!
- **Name:** Caroline Marriott
- **Role:** Teacher + Beta Tester
- **School:** Pathfinder Primary School
- **Special Access:** Full beta features enabled

See detailed guide: `docs/PATHFINDER_PILOT_GUIDE_CAROLINE.md`

---

## 📋 Quick Start Test Paths

### 1. Teacher Flow
```
1. Login as teacher@demo.com
2. View Dashboard → See class overview
3. Navigate to Interventions → Browse 100+ interventions
4. Create Assessment → Use ECCA framework
5. View Reports → Generate progress reports
```

### 2. EP Flow
```
1. Login as ep@demo.com
2. View Caseload → See assigned students
3. Run ECCA Assessment → Full cognitive profile
4. Create EHCP → AI-assisted drafting
5. Generate Report → LA-compliant format
```

### 3. Parent Flow
```
1. Login as parent@demo.com
2. View Child's Progress → See Amara's data
3. Message Teacher → Communication portal
4. View Interventions → Home support strategies
```

### 4. Researcher Flow
```
1. Login as researcher@demo.com
2. View Research Hub → Evidence base
3. Access Datasets → Anonymized data
4. Ethics Submission → Research approval workflow
```

---

## 🎯 Key Features to Test

### Core Platform
- [ ] Dashboard loads with real data
- [ ] Navigation works across all sections
- [ ] Videos play correctly (HeyGen integration)
- [ ] Forms validate and submit

### Assessment System
- [ ] ECCA Framework assessment flow
- [ ] Multi-informant input forms
- [ ] Report generation (PDF)

### Interventions Library
- [ ] Browse 100+ evidence-based interventions
- [ ] Filter by category, evidence level
- [ ] Create custom intervention plans

### Marketplace (CPD)
- [ ] Browse training courses
- [ ] View course details
- [ ] Checkout flow (test mode)

### Blog & Resources
- [ ] View blog posts (Dr Scott I-Patrick author)
- [ ] Category/tag filtering
- [ ] Search functionality

---

## ⚠️ Important Notes

1. **Test Environment:** These credentials are for the production beta test environment.
2. **Data:** Demo accounts have pre-seeded data for testing.
3. **Payments:** Stripe is in TEST mode - use card 4242 4242 4242 4242.
4. **Feedback:** Use the Beta Feedback widget (bottom-right) to report issues.
5. **Support:** Contact support@edpsychconnect.world for assistance.

---

## 🔄 Database Seeding Commands

If accounts need to be re-seeded:

```bash
# Seed admin tenant
npx tsx prisma/seed-admin.ts

# Seed orchestration data (classes, students)
npx tsx prisma/seed-orchestration.ts

# Seed test users (demo accounts)
npx tsx prisma/seed-test-users.ts

# Seed blog content
npx tsx prisma/seed-blog.ts

# Seed help center articles
npx tsx prisma/seed-help-center.ts

# Seed training courses
npx tsx prisma/seed-courses-from-csv.ts
```

---

## 📊 Pre-Seeded Demo Data

| Data Type | Count | Description |
|-----------|-------|-------------|
| Users | 10+ | Various roles for testing |
| Students | 25+ | Across Year 1-6 |
| Classes | 6 | Full year group coverage |
| Cases | 5+ | Active SEND cases |
| Assessments | 3+ | Sample assessments |
| Interventions | 100+ | Evidence-based library |
| Blog Posts | 10+ | Platform & research content |
| CPD Courses | 12+ | Professional development |

---

**Document Version:** 1.0  
**Author:** EdPsych Connect Platform Team  
**For Internal Distribution Only**
