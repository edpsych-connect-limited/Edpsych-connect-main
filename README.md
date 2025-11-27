# EdPsych Connect

> **Transforming Educational Psychology Practice Through AI-Powered Innovation**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://vercel.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-proprietary-red)](LICENSE)

## 🎯 Overview

**EdPsych Connect** is a comprehensive, multi-tenant SaaS platform designed for UK educational psychologists, schools, Local Authorities, and SEND coordinators. Built by Dr Scott I-Patrick DEdPsych CPsychol (HCPC: PYL041054), it combines evidence-based assessment frameworks with AI-powered insights to revolutionise Special Educational Needs and Disabilities (SEND) support.

### 🏢 Company Information
- **Company:** EdPsych Connect Limited
- **Company Number:** 14989115
- **Founded:** 2023
- **Founder:** Dr Scott I-Patrick DEdPsych CPsychol
- **Website:** [www.edpsychconnect.com](https://www.edpsychconnect.com)

---

## ✨ Key Features

### 🧠 ECCA Framework
The **Educational Context & Capabilities Assessment (ECCA)** is our flagship framework, providing a 360-degree view of a student's profile across 7 core domains:
- **Cognition & Learning** - Memory, processing speed, executive function
- **Communication & Interaction** - Speech, language, social communication
- **Social, Emotional & Mental Health (SEMH)** - Emotional regulation, wellbeing
- **Physical & Sensory** - Motor skills, sensory processing
- **Independence & Self-Care** - Daily living skills, self-management
- **Contextual Factors** - Home and school environment considerations

### 🤝 Collaborative Input System
Securely gather insights from parents, teachers, and specialists:
- **Token-Based Access** - Unique, secure links for each collaborator (no account required)
- **Role-Specific Forms** - Tailored questions for parents vs. teachers
- **Real-Time Integration** - Feedback automatically mapped to the student's ECCA profile

### 📚 Assessment Library
Over 50 standardised, evidence-based assessment templates valid for EHCP applications:
- Dyslexia Screeners
- Sensory Profiles
- Social Skills Audits
- Emotional Regulation Scales
- Executive Function Assessments
- Attachment & Behaviour Profiles

### 🎮 Gamified Learning
- **Battle Royale** - Educational game with UK National Curriculum questions (KS1-KS4)
- **Adaptive Difficulty** - Questions adjust to student ability
- **Achievement System** - Badges, streaks, and leaderboards
- **Accessible Mode** - Text-only version for screen reader users

### 🎙️ AI-Powered Features
- **Voice Assistant** - UK English (en-GB) voice commands
- **AI Chatbot** - Educational support and guidance
- **AI Blog Generation** - Evidence-based content creation
- **Central Nervous System (CNS)** - AI orchestration layer

### 🏫 Multi-Tenancy
- Full tenant isolation for schools, LAs, and independent practices
- Role-based access control (RBAC) with 19+ user roles
- GDPR-compliant data handling

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ (LTS recommended)
- **npm** 9+ or **yarn** 1.22+
- **PostgreSQL** 14+ (or Neon serverless)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/edpsych-connect-limited/Edpsych-connect-main.git
   cd Edpsych-connect-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   
   Required variables:
   ```env
   # Database (Neon PostgreSQL)
   DATABASE_URL="postgres://user:password@host/database?sslmode=require"
   
   # Authentication
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Redis (optional, for rate limiting)
   REDIS_URL="redis://default:password@host:port"
   
   # AI Services (optional)
   OPENAI_API_KEY="sk-..."
   ANTHROPIC_API_KEY="sk-ant-..."
   
   # Stripe (optional, for payments)
   STRIPE_SECRET_KEY="sk_test_..."
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Seed initial data (optional)**
   ```bash
   npx tsx prisma/seed-all.ts
   ```

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm start
```

### Running Tests
```bash
# Unit tests
npm test

# E2E tests (Cypress)
npx cypress run

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

---

## 🧪 Beta Programme

EdPsych Connect is currently in **closed beta**. Beta testers help shape the future of educational psychology software.

### Beta Access
Register at: [www.edpsychconnect.com/en/beta-register](https://www.edpsychconnect.com/en/beta-register)

Or login with a beta code at: [www.edpsychconnect.com/en/beta-login](https://www.edpsychconnect.com/en/beta-login)

### Beta Access Codes
| Code | Target Audience | Max Uses | Expires |
|------|-----------------|----------|---------|
| `BETA2025` | General beta access | 100 | 31 Dec 2025 |
| `EDPSYCH-BETA` | Educational Psychologists | 50 | 31 Dec 2025 |
| `EP-BETA-UK` | UK Educational Psychologists | 200 | 31 Dec 2025 |
| `TEACHER-BETA` | Teachers | 500 | 31 Dec 2025 |
| `SENCO-BETA` | SENCOs/SEND Coordinators | 100 | 31 Dec 2025 |
| `RESEARCH-BETA` | Researchers | 30 | 31 Dec 2025 |
| `LA-BETA-2025` | Local Authorities | 25 | 31 Dec 2025 |
| `FOUNDER-ACCESS` | Key stakeholders | 10 | 31 Dec 2026 |

### Beta Features
- ✅ Full platform access based on user role
- ✅ Beta feedback widget for direct developer communication
- ✅ Priority support for beta testers
- ✅ Early access to new features
- ✅ Experimental feature toggles

### Beta Terms
Beta testers agree to:
- Provide constructive feedback
- Report bugs and issues via the feedback widget
- Keep beta features confidential
- Accept that features may change

---

## 📁 Project Structure

```
EdPsych-Connect/
├── prisma/                 # Database schema and migrations
│   ├── schema.prisma       # Prisma schema (180+ models)
│   └── seed-*.ts           # Seed scripts
├── public/                 # Static assets
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── [locale]/       # Internationalised routes
│   │   └── api/            # API routes
│   ├── components/         # React components
│   │   ├── ui/             # Base UI components
│   │   ├── dashboard/      # Dashboard widgets
│   │   ├── battle-royale/  # Gamified learning
│   │   └── voice/          # Voice assistant
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   │   ├── prisma.ts       # Database client
│   │   ├── rate-limit.ts   # Redis-backed rate limiting
│   │   └── stripe.ts       # Payment integration
│   └── services/           # Business logic services
├── cypress/                # E2E tests
├── docs/                   # Documentation
└── tools/                  # Development utilities
```

---

## 🔒 Security

### Rate Limiting
API endpoints are protected with Redis-backed rate limiting:
| Endpoint | Limit | Window |
|----------|-------|--------|
| Login | 5 attempts | 1 minute |
| Beta validation | 10 attempts | 1 minute |
| API general | 100 requests | 1 minute |
| Feedback | 5 submissions | 1 minute |
| Password reset | 3 attempts | 1 hour |

### Authentication
- Session-based authentication with Prisma adapter
- Role-based access control (RBAC)
- Tenant isolation for multi-tenancy
- GDPR-compliant data handling

### Security Headers
- CORS restricted to allowed origins
- Content Security Policy (CSP)
- X-Frame-Options, X-Content-Type-Options
- HSTS for HTTPS enforcement

---

## 🧰 Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5.0 |
| **Styling** | Tailwind CSS 3.4 |
| **Database** | PostgreSQL (Neon serverless) |
| **ORM** | Prisma 5.x |
| **Caching** | Redis Cloud |
| **Payments** | Stripe |
| **AI** | OpenAI, Anthropic, xAI |
| **Monitoring** | Sentry, Web Vitals |
| **Deployment** | Vercel |
| **Testing** | Cypress, Jest |

---

## 📖 Documentation

- [Platform Documentation](docs/PLATFORM_DOCUMENTATION.md)
- [API Reference](docs/API_REFERENCE.md)
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [E2E Testing Guide](docs/E2E-TESTING-GUIDE.md)
- [Data Privacy Whitepaper](docs/AI_DATA_PRIVACY_WHITEPAPER.md)

---

## 🤝 Contributing

EdPsych Connect is currently a proprietary project. For partnership or collaboration enquiries, contact:

- **Email:** help@edpsychconnect.com
- **Website:** [www.edpsychconnect.com/contact](https://www.edpsychconnect.com/en/contact)

---

## 📜 License

Copyright © 2023-2025 EdPsych Connect Limited. All rights reserved.

This software is proprietary and confidential. Unauthorised copying, distribution, or use is strictly prohibited.

---

## 🙏 Acknowledgements

- **Founder:** Dr Scott I-Patrick DEdPsych CPsychol
- **Research Foundation:** Based on doctoral research at Newcastle University (TEAM-UP study)
- **Framework:** ECCA (Educational Context & Capabilities Assessment)
- **Community:** UK educational psychologists, teachers, SENCOs, and families who provided feedback

---

**Built with ❤️ for UK Education**

