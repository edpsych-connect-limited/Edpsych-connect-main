# Beta Access Credentials & Testing Guide

**CONFIDENTIAL - INTERNAL USE ONLY**
**Last Updated:** December 13, 2025

This document contains the login credentials for all Beta testing accounts currently seeded in the production database. These accounts cover all user roles and specific pilot scenarios.

## 1. Executive & Founder Access

| Role | Name | Email | Password | Purpose |
|------|------|-------|----------|---------|
| **Founder (Super Admin)** | Dr Scott Ighavongbe-Patrick | `scott.ipatrick@edpsychconnect.com` | `Founder2025!` | Full system oversight, all permissions. |
| **System Admin** | Admin User | `scott@edpsychconnect.com` | `Admin123!` | General system administration and tenant management. |

## 2. Pathfinder Pilot (VIP)

**Critical Account:** This account is for the Head of Children's Services at Buckinghamshire Council. It has **SUPER_ADMIN** privileges to allow evaluation of the entire platform ecosystem (LA, School, EP, Parent views).

| Role | Name | Email | Password | Context |
|------|------|-------|----------|---------|
| **Super Admin (VIP)** | Caroline Marriott | `caroline.marriott@edpsychconnect.com` | `Bucks2025!Pilot` | **Buckinghamshire Council Pilot.** Full access to all dashboards, EHCP workflows, and analytics. |

## 3. Core Team Admins

All team admins have `SUPER_ADMIN` access to assist with testing and demonstrations.

| Name | Email | Password |
|------|-------|----------|
| Dr Piers Worth | `piers.worth@edpsychconnect.com` | `Team2025!` |
| Hayley Baverstock | `hayley.baverstock@edpsychconnect.com` | `Team2025!` |
| Hannah Patrick | `hannah.patrick@edpsychconnect.com` | `Team2025!` |
| Louis Young | `louis.young@edpsychconnect.com` | `Team2025!` |
| Samantha Patrick | `samantha.patrick@edpsychconnect.com` | `Team2025!` |
| Michelle Garreth | `michelle.garreth@edpsychconnect.com` | `Team2025!` |
| George Randall | `george.randall@edpsychconnect.com` | `Team2025!` |
| Cora Sargent | `cora.sargent@edpsychconnect.com` | `Team2025!` |
| Bevan Givens | `bevan.givens@edpsychconnect.com` | `Team2025!` |
| Sue Podolska | `sue.podolska@edpsychconnect.com` | `Team2025!` |

## 4. Functional Test Accounts (E2E Scenarios)

Use these accounts to test specific user journeys (e.g., a teacher assigning work, a student completing it, a parent viewing the report).

| Role | Email | Password | Key Features to Test |
|------|-------|----------|----------------------|
| **Teacher** | `teacher@demo.com` | `Test123!` | Classroom Cockpit, Lesson Planning, Student Reports, Voice Assistant. |
| **Student** | `student@demo.com` | `Test123!` | Student Dashboard, Games, Assignments, Mood Tracking. |
| **Parent** | `parent@demo.com` | `Test123!` | Parent Portal, Progress Reports, Messaging. |
| **Ed. Psychologist** | `ep@demo.com` | `Test123!` | EP Dashboard, Case Management, Report Writing. |
| **LA Admin** | `la_admin@demo.com` | `Test123!` | LA Dashboard, EHCP Panel, School Oversight. |

## 5. Beta Testing Checklist

Before opening to external testers, please verify:

1.  **Login Flow:** Confirm all accounts above can log in successfully.
2.  **Role Switching:** Ensure the Founder/VIP accounts can switch between different dashboard views (if applicable) or access all areas.
3.  **Data Persistence:** Create a test item (e.g., a lesson plan or case note) and verify it saves.
4.  **Voice/AI:** Test the "EdPsych Assistant" with a simple query like "How do I create an EHCP?" to verify the new formatting.
5.  **Blog Generation:** Check the `/blog` page to see the latest automated content.

## 6. Emergency Reset

If credentials need to be reset or data wiped, run the following commands in the terminal:

```bash
# Reset and re-seed all test users
npx tsx prisma/seed-test-users.ts

# Reset Caroline Marriott's account
npx tsx prisma/seed-caroline-marriott.ts
```
