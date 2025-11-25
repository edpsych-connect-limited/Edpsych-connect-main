# Remediation Roadmap: EdPsych Connect World
**Date:** 2024-05-22
**Status:** Draft
**Objective:** Eliminate "Ghost Features" and connect all services to the restored Database Schema.

## Phase 1: Foundation (Authentication) 🔴 CRITICAL
**Goal:** Enable real user sign-up, login, and session management using the `users` table.
- [x] **Task 1.1:** Install `@next-auth/prisma-adapter`.
- [x] **Task 1.2:** Rewrite `src/lib/auth.ts` to use `PrismaAdapter(prisma)`.
- [x] **Task 1.3:** Remove `demoUsers` and hardcoded mocks.
- [x] **Task 1.4:** Verify `LoginForm` works with real DB users.

## Phase 2: The Missing Orchestrator 🟠 HIGH
**Goal:** Fix the broken "AI Tutor" and "System Status" dashboards.
- [x] **Task 2.1:** Create `src/app/api/orchestrator/tutor/route.ts`.
- [x] **Task 2.2:** Implement `POST` handler to receive tutoring requests.
- [x] **Task 2.3:** Connect handler to `ai-integration.ts` (Real AI).
- [x] **Task 2.4:** Save results to `ConversationalAISession` table (Schema corrected).

## Phase 3: Curriculum & Data Persistence 🟡 MEDIUM
**Goal:** Ensure lesson plans and assessments are saved to the database.
- [x] **Task 3.1:** Refactor `src/services/curriculum-service.ts`.
- [x] **Task 3.2:** Replace manual interfaces with `@prisma/client` types (Integrated in save method).
- [x] **Task 3.3:** Implement `saveLessonPlan` using `prisma.lessonPlan.create`.

## Phase 4: AI Unification 🟢 LOW
**Goal:** Remove mock AI engines and use the central AI Integration.
- [x] **Task 4.1:** Refactor `src/services/ai-service.ts`.
- [x] **Task 4.2:** Replace `studentModelEngine` mocks with calls to `aiIntegration`.
