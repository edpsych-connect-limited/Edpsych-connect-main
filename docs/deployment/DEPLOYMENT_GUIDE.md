# Deployment Guide: EdPsych Connect World

This guide outlines the steps to deploy the EdPsych Connect platform to production.

## 1. Prerequisites

Before deploying, ensure you have the following:

- **Vercel Account**: For hosting the Next.js application.
- **PostgreSQL Database**: A production-ready database (e.g., Vercel Postgres, Neon, Supabase, or AWS RDS).
- **OpenAI API Key**: For the AI Tutor and Curriculum features.
- **NextAuth Secret**: A secure random string for session encryption.

## 2. Environment Variables

Configure the following environment variables in your production environment (e.g., Vercel Project Settings):

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Connection string for PostgreSQL | `postgres://user:pass@host:5432/db` |
| `NEXTAUTH_URL` | The canonical URL of your site | `https://edpsych-connect.vercel.app` |
| `NEXTAUTH_SECRET` | Secret for signing session tokens | `(generate with openssl rand -base64 32)` |
| `OPENAI_API_KEY` | API Key for OpenAI (GPT-4) | `sk-...` |
| `STRIPE_SECRET_KEY` | Stripe Secret Key (Live) | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Secret | `whsec_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Public Key | `pk_live_...` |

## 3. Deployment Steps (Vercel)

### Option A: Git Integration (Recommended)
1.  Push your code to a Git repository (GitHub, GitLab, Bitbucket).
2.  Import the project in Vercel.
3.  Configure the **Environment Variables** as listed above.
4.  Click **Deploy**. Vercel will automatically detect Next.js and build the project.

### Option B: Vercel CLI
1.  Install Vercel CLI: `npm i -g vercel`
2.  Login: `vercel login`
3.  Deploy: `vercel --prod`

## 4. Database Migration

After deployment, you must apply the database schema to the production database.

1.  **From your local machine** (connected to production DB via `.env` or direct string):
    ```bash
    npx prisma migrate deploy
    ```
    *Note: Ensure `DATABASE_URL` points to the production database.*

2.  **Seed Data (Optional)**:
    If you need initial data (e.g., admin users, tiers):
    ```bash
    npx prisma db seed
    ```

## 5. Post-Deployment Verification (Live Site Review)

Once deployed, perform the following checks:

1.  **Health Check**: Visit `/api/orchestrator/status` and ensure it returns `{"status":"ok"}`.
2.  **Authentication**: Sign up a new user and log in.
3.  **AI Tutor**: Navigate to the AI Tutor and send a message. Verify a response is received.
4.  **Curriculum**: Generate a lesson plan and verify it saves to the database.
5.  **Stripe**: Test the subscription flow (if live payments are enabled).

## 6. Troubleshooting

- **Build Fails**: Check the build logs in Vercel. Ensure `npm run validate:build` passes locally.
- **Database Errors**: Verify `DATABASE_URL` is correct and migrations have been applied.
- **AI Errors**: Check `OPENAI_API_KEY` and ensure you have quota available.

