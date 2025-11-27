# EdPsych Connect World

## Overview
EdPsych Connect World is an AI-powered platform designed to revolutionize Special Educational Needs (SEN) support. It integrates holistic assessment, automated intervention planning, and collaborative input into a seamless ecosystem.

## Key Features

### 🧠 ECCA Framework (New)
The **Educational Context & Capabilities Assessment (ECCA)** is our flagship framework. It moves beyond simple diagnostics to provide a 360-degree view of a student's profile across 7 core domains:
- Cognition & Learning
- Communication & Interaction
- Social, Emotional & Mental Health (SEMH)
- Physical & Sensory
- Independence & Self-Care
- Contextual Factors (Home/School)

### 🤝 Collaborative Input System (New)
Securely gather insights from parents, teachers, and specialists without requiring them to create an account.
- **Token-Based Access**: Unique, secure links for each collaborator.
- **Role-Specific Forms**: Tailored questions for parents vs. teachers.
- **Real-Time Integration**: Feedback is automatically mapped to the student's ECCA profile.

### 📚 Assessment Library
Access over 50 standardized, evidence-based assessment templates valid for EHCP applications.
- Dyslexia Screeners
- Sensory Profiles
- Social Skills Audits
- Emotional Regulation Scales

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env`.
4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

### Running the Development Server
```bash
npm run dev
```

### Running Tests
```bash
npx cypress run
```

## 🚀 Beta Programme

EdPsych Connect World is currently in **closed beta**. Beta testers help shape the future of educational psychology software.

### Beta Access
Access the beta programme at: [www.edpsychconnect.com/beta-login](https://www.edpsychconnect.com/beta-login)

### Available Beta Codes
| Code | Target Audience | Max Uses |
|------|-----------------|----------|
| `BETA2025` | General beta access | 100 |
| `EDPSYCH-BETA` | Educational Psychologists | 50 |
| `EP-BETA-UK` | UK Educational Psychologists | 200 |
| `TEACHER-BETA` | Teachers | 500 |
| `SENCO-BETA` | SENCOs/SEND Coordinators | 100 |
| `RESEARCH-BETA` | Researchers | 30 |
| `LA-BETA-2025` | Local Authorities | 25 |
| `FOUNDER-ACCESS` | Key stakeholders | 10 |

### Beta Features
- ✅ Full platform access based on user role
- ✅ Beta feedback widget for direct developer communication
- ✅ Priority support for beta testers
- ✅ Early access to new features

### Beta Terms
Beta testers agree to:
- Provide constructive feedback
- Report bugs and issues
- Keep beta features confidential
- Accept that features may change

