# 📘 EdPsych Connect – Developer’s Manual

**Version:** 1.0
**Date:** November 25, 2025
**Status:** Live Document

---

## 5.1 System Architecture

EdPsych Connect is a modern, enterprise-grade educational psychology platform built on a **Next.js** full-stack architecture.

### 🏗️ High-Level Overview
*   **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, Framer Motion.
*   **Backend:** Next.js API Routes (Serverless Functions), Prisma ORM.
*   **Database:** PostgreSQL (hosted on Neon/Vercel).
*   **AI Layer:** `OrchestratorService` managing interactions with OpenAI/Anthropic.
*   **Authentication:** NextAuth.js (v4) with JWT strategy.
*   **Payments:** Stripe Integration.

### 🧩 Key Modules
1.  **Orchestrator (`src/services/orchestrator-service.ts`)**: The "brain" of the application. Handles AI request routing, context management, and fallback logic.
2.  **Assessment Engine**: Manages the flow of psychological assessments, report generation, and data visualization.
3.  **Training Hub**: Video-based learning platform with gamification (Merits, Quizzes).
4.  **Marketplace**: Digital asset store for educational resources.

---

## 5.2 Development Environment

### 🛠️ Tools Required
*   **Node.js**: **20.x** (required).
*   **Package Manager**: `npm` (preferred) or `pnpm`.
*   **Database**: PostgreSQL (Local instance or Docker container).
*   **IDE**: VS Code (Recommended extensions: ESLint, Prettier, Prisma, Tailwind CSS).

> Note: This repo enforces Node **20.x** via `package.json` engines + CI smoke checks. Newer majors (e.g. Node 24) will fail `npm run verify:ci` by design.

### ⚙️ Setup Instructions
1.  **Clone the Repository:**
    ```bash
    git clone <repo-url>
    cd EdpsychConnect
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Environment Configuration:**
    Copy `.env.example` to `.env` and populate:
    ```env
    DATABASE_URL="postgresql://..."
    NEXTAUTH_SECRET="<generated-secret>"
    OPENAI_API_KEY="sk-..."
    HEYGEN_API_KEY="<optional>"
    ```
4.  **Database Setup:**
    ```bash
    npx prisma generate
    npx prisma db push
    npx prisma db seed
    ```
5.  **Start Development Server:**
    ```bash
    npm run dev
    ```

---

## 5.3 Coding Standards

### 📝 Style Guides
*   **TypeScript**: Strict mode enabled. No `any` types allowed in new code.
*   **Components**: Functional components with named exports.
*   **Styling**: Tailwind CSS utility classes. Avoid custom CSS files where possible.

### 🔍 Linting & Formatting
*   **ESLint**: Run `npm run lint` to check for issues.
*   **Prettier**: Code is automatically formatted on save (if configured) or via commit hooks.

### 🧪 Testing Protocols
*   **Unit/Integration**: Jest (Planned).
*   **End-to-End (E2E)**: Cypress.
    *   Run tests: `npx cypress run`
    *   Open runner: `npx cypress open`
*   **Validation**: `npm run validate` runs a custom validation suite for architectural integrity.

---

## 5.4 Workflows

### 🔄 CI/CD Pipelines
*   **Provider**: Vercel.
*   **Trigger**: Push to `main` branch.
*   **Checks**: Build verification, Linting, Type checking.

### 🌿 Branching Strategy
*   `main`: Production-ready code.
*   `develop`: Integration branch (optional).
*   `feature/*`: New features (e.g., `feature/ai-chat`).
*   `fix/*`: Bug fixes (e.g., `fix/login-error`).

### 🚀 Deployment
*   **Automatic**: Push to `main` triggers Vercel deployment.
*   **Manual**: `vercel --prod` (requires CLI).
*   **Database Changes**: Always run `npx prisma migrate deploy` against production DB after deployment.

---

## 5.5 Troubleshooting

### 🐞 Common Errors
*   **Prisma Client Error**: "Prisma Client has not been initialized."
    *   *Fix*: Run `npx prisma generate` and restart the dev server.
*   **NextAuth Session Null**:
    *   *Fix*: Check `NEXTAUTH_SECRET` and `NEXTAUTH_URL` in `.env`. Ensure database has user records.
*   **Hydration Mismatch**:
    *   *Fix*: Ensure server and client render the same HTML. Avoid using `window` or `localStorage` during initial render.

### 🛠️ Debugging Steps
1.  Check terminal output for server-side errors.
2.  Check browser console for client-side errors.
3.  Use `console.log` in API routes (logs appear in terminal/Vercel logs).
4.  Use React DevTools to inspect component state.

---

## 5.6 Extensibility

### ➕ Adding New Modules
1.  **Schema**: Define new models in `prisma/schema.prisma`.
2.  **API**: Create routes in `src/app/api/<module>/route.ts`.
3.  **UI**: Create pages in `src/app/[locale]/<module>/page.tsx`.
4.  **Service**: Encapsulate business logic in `src/services/<module>-service.ts`.

### 🔌 Integrating Third-Party Services
*   Use the **Service Pattern**. Create a dedicated service file (e.g., `stripe-service.ts`) to handle external API calls.
*   Store API keys in `.env`.
*   Never expose secrets to the client side (no `NEXT_PUBLIC_` prefix for secrets).

---

## 5.7 Security Practices

### 🔒 Secure Coding
*   **Input Validation**: Use Zod schemas to validate all API inputs.
*   **Authorization**: Check `session` and `user.role` in every protected API route and Page.
*   **Data Access**: Use Prisma's `select` to return only necessary fields (avoid leaking password hashes).

### 🛡️ Vulnerability Management
*   Run `npm audit` regularly.
*   Keep dependencies updated.
*   Use Sentry for error tracking in production.

---

## 5.8 Knowledge Transfer

### 🎓 Onboarding Checklist
- [ ] Access to GitHub Repository.
- [ ] Access to Vercel Project.
- [ ] Access to Neon/Postgres Database.
- [ ] Local environment set up and running.
- [ ] Successful run of `npm run test` (or Cypress).
- [ ] Read `BUSINESS_STRATEGY_YEAR_1.md` to understand the domain.

### ❓ Developer FAQs
*   **Q: How do I reset the database?**
    *   A: `npx prisma migrate reset` (Caution: Deletes all data).
*   **Q: Where are the AI prompts defined?**
    *   A: Look in `src/lib/ai/prompts.ts` or `src/services/orchestrator-service.ts`.
