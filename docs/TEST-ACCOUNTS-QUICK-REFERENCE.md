# Test Accounts - Quick Reference Card

**Dev Server**: http://localhost:3002
**Login URL**: http://localhost:3002/login

---

## 🔑 All Test Accounts

**Password for ALL accounts:** `Test123!`

### 👩‍🏫 Teacher Account
- **Email:** `teacher@test.edpsych.com`
- **Name:** Sarah Mitchell
- **Role:** TEACHER
- **Access:** Year 3 Oak class (30+ students)
- **Permissions:** VIEW_STUDENTS, MANAGE_LESSONS, VIEW_REPORTS, ASSIGN_WORK

### 👨‍🎓 Student Account
- **Email:** `amara.singh@test.edpsych.com`
- **Name:** Amara Singh
- **Role:** STUDENT
- **Year Group:** Year 3
- **Student ID:** 16
- **Permissions:** VIEW_OWN_WORK, SUBMIT_WORK, VIEW_OWN_PROGRESS

### 👨‍👩‍👧 Parent Account
- **Email:** `priya.singh@test.edpsych.com`
- **Name:** Priya Singh
- **Role:** PARENT
- **Relationship:** Mother of Amara Singh
- **Permissions:** VIEW_OWN_CHILD, MESSAGE_TEACHER, VIEW_CHILD_PROGRESS

### 🧠 Educational Psychologist Account
- **Email:** `dr.patel@test.edpsych.com`
- **Name:** Dr. Priya Patel
- **Role:** EP
- **Caseload:** Includes Amara Singh
- **Permissions:** VIEW_ALL_STUDENTS, MANAGE_ASSESSMENTS, VIEW_EHCP, MANAGE_INTERVENTIONS, VIEW_ANALYTICS

---

## 🗄️ Test Data

### Tenant
- **Name:** test-school
- **ID:** 2
- **Students:** 50 students across Reception - Year 6

### Key Test Student
- **Name:** Amara Singh
- **ID:** 16
- **Year:** Year 3
- **Class:** Year 3 Oak
- **Has Profile:** Yes (automatically built via orchestration)
- **Has Parent:** Yes (Priya Singh)
- **Has EP:** Yes (Dr. Priya Patel)

---

## 🧪 Quick API Tests

**Note:** These require authentication. Run in browser console while logged in.

### Test Student Profile
```javascript
fetch('/api/students/16/profile')
  .then(r => r.json())
  .then(data => console.log(data));
```

### Test Class Dashboard
```javascript
fetch('/api/class/dashboard')
  .then(r => r.json())
  .then(data => console.log(data));
```

### Test Health Endpoint (No auth required)
```javascript
fetch('/api/health')
  .then(r => r.json())
  .then(data => console.log(data));
```

---

## 📍 Important URLs

| Purpose | URL |
|---------|-----|
| Login | http://localhost:3002/login |
| Admin Dashboard | http://localhost:3002/admin |
| Assessments | http://localhost:3002/assessments |
| Cases | http://localhost:3002/cases |
| EHCP | http://localhost:3002/ehcp |
| Interventions | http://localhost:3002/interventions |
| Progress | http://localhost:3002/progress |
| Blog | http://localhost:3002/blog |
| Training | http://localhost:3002/training |
| Help Center | http://localhost:3002/help |

---

## 🔐 Security Test

**CRITICAL:** Parent should NOT be able to access other students

**Test:**
1. Login as parent: `priya.singh@test.edpsych.com`
2. Try to access another student: http://localhost:3002/api/students/17/profile
3. **Expected:** 403 Forbidden or "Access Denied" error
4. **If you CAN see data:** 🚨 CRITICAL SECURITY ISSUE - report immediately!

---

## ✅ Pre-Test Checklist

Before testing, verify:
- [ ] Dev server running on port 3002
- [ ] Database seeded (50 students in tenant 2)
- [ ] Test accounts created (all 4 accounts)
- [ ] Parent-child link verified (Priya → Amara)
- [ ] Browser DevTools ready (F12)
- [ ] Test results document open (TEST-RESULTS-SESSION-1.md)

---

## 📝 Testing Documents

1. **MANUAL-TESTING-QUICK-START.md** - Full testing guide (7 sessions)
2. **TEST-RESULTS-SESSION-1.md** - Results template (fill this out)
3. **TEST-ACCOUNTS-QUICK-REFERENCE.md** - This document
4. **PLATFORM-STATUS-UPDATE.md** - Overall platform status

---

## 🆘 If You Get Stuck

**Cannot login?**
- Check dev server is running: `curl http://localhost:3002/api/health`
- Verify account exists: Run `npx tsx scripts/verify-test-accounts.ts`
- Check browser console for errors (F12)

**Page not found?**
- Some pages may not have UI yet (only API routes exist)
- Try the admin page first: http://localhost:3002/admin
- Check if you're logged in (authentication required)

**API returns "Unauthorized"?**
- This is CORRECT for unauthenticated requests
- Make sure you're logged in first
- Run API tests in browser console while logged in

---

**Ready to Test?** Open your browser and go to: http://localhost:3002/login

**Start with:** Teacher account (`teacher@test.edpsych.com` / `Test123!`)

**Document everything in:** docs/TEST-RESULTS-SESSION-1.md
