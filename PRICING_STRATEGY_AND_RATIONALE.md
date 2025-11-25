# 💰 EdPsych Connect: Financial Strategy & Pricing Rationale

## Executive Summary
As the financial architect for EdPsych Connect, I have designed a **Hybrid SaaS + Marketplace** pricing model. This structure is designed to maximize **Recurring Revenue (ARR)** through subscriptions while capturing **High-Margin Transactional Revenue** through the AI and Algorithm Marketplace.

Our platform is not just a case management tool; it is an ecosystem. The pricing reflects the value delivered across three distinct customer segments: **Individual Practitioners**, **Schools/Institutions**, and **Local Authorities (LAs)**.

---

## 1. Product Inventory & Value Drivers
Before pricing, we must acknowledge what we are selling. The platform consists of four core value pillars:

| Pillar | Key Features | Value Proposition |
| :--- | :--- | :--- |
| **Core Workflow** | Case Management, Reports, Interventions, Compliance. | **Efficiency:** Saves time on administrative tasks. |
| **AI Suite** | "Study Buddy", "Problem Solver", "Automated Reporting", "Voice Commands". | **Augmentation:** Acts as a force multiplier for EPs. |
| **Gamification** | "Battle Royale", "Squads", "Merits", "House System". | **Engagement:** Keeps students and schools active on the platform. |
| **Infrastructure** | "BYOD" (Data Sovereignty), "Multi-Tenant", "Analytics". | **Compliance:** Solves the "Data Ownership" blocker for LAs. |

---

## 2. The Pricing Tiers (The "Menu")

We have defined four distinct tiers in the system configuration (`prisma/seed-system-config.ts`). Here is the financial rationale for each.

### 🟢 Tier 1: FREE (The Hook)
*   **Target:** Trainee EPs, Independent EPs testing the waters.
*   **Price:** **£0 / month**
*   **Features:**
    *   Basic Case Management (Up to 5 active cases).
    *   Limited AI "Problem Solver" queries (5/day).
    *   Read-only access to Marketplace.
*   **Rationale:** Low barrier to entry. We capture the user early (Trainees) and lock them into our ecosystem before they qualify.

### 🔵 Tier 2: PRO (The Practitioner)
*   **Target:** Independent EPs, Private Practice.
*   **Price:** **£49 / user / month**
*   **Features:**
    *   Unlimited Cases & Reports.
    *   **Full AI Suite:** Unlimited "Problem Solver" & "Report Writer".
    *   **Marketplace:** Buy/Sell Algorithms.
    *   **Voice Commands:** Full dictation support.
*   **Rationale:** This is a productivity tool. If the AI saves them 1 hour of report writing per month, the subscription pays for itself. **High Margin.**

### 🟣 Tier 3: INSTITUTIONAL (The School)
*   **Target:** Individual Schools, Small Multi-Academy Trusts (MATs).
*   **Price:** **£499 / school / year** (Volume discounts available).
*   **Features:**
    *   **Multi-User:** Teachers, SENCOs, EPs all in one place.
    *   **Gamification Engine:** "Battle Royale", "Squads" enabled for students.
    *   **Parent Portal:** Automated communication.
    *   **Intervention Tracking:** School-wide analytics.
*   **Rationale:** **Stickiness.** Once a school sets up their "Houses" and "Squads" in our system, the switching cost becomes incredibly high. This tier drives long-term retention (LTV).

### ⚫ Tier 4: LA ENTERPRISE (The Authority)
*   **Target:** Local Authorities, Large MATs (50+ schools).
*   **Price:** **Custom / Contract (Starting at £25k/year)**
*   **Features:**
    *   **BYOD (Bring Your Own Database):** Complete Data Sovereignty.
    *   **White Label:** Their branding, their URL.
    *   **API Access:** Integration with existing MIS (SIMS, Arbor).
    *   **Dedicated CSM:** Priority Support.
*   **Rationale:** **Compliance & Scale.** The "BYOD" feature is the key differentiator against competitors. LAs are risk-averse; offering them physical control of their data removes their biggest objection.

---

## 3. The "Hidden" Revenue Streams

Beyond subscriptions, the platform is designed for transactional revenue:

1.  **Algorithm Marketplace:**
    *   Users can write scoring algorithms (e.g., "Dyslexia Screener v2") and sell them.
    *   **We take a 20% commission** on every transaction.
    *   *Rationale:* Crowdsources innovation while generating passive revenue.

2.  **AI Token Overage:**
    *   Enterprise clients with massive usage (e.g., analyzing 10,000 student reports) pay for extra AI tokens.
    *   *Rationale:* Protects our margins against heavy users.

---

## 4. Implementation Status & Next Steps

### Current Status
*   **Database:** All tiers (`FREE`, `PRO`, `INSTITUTIONAL`, `LA_ENTERPRISE`) are seeded in the database.
*   **Code:** The `TenantDatabaseConfig` (BYOD) model is live.
*   **Stripe:** Currently running in **Mock Mode** (`src/lib/stripe-institution-service.ts`).

### The "Financial Guru" Recommendation
To operationalize this, we need to:
1.  **Create these Products in Stripe:** I can generate a script to sync these tiers to your Stripe Dashboard automatically.
2.  **Activate the Billing Portal:** Enable the UI for users to upgrade/downgrade.
3.  **Enforce Limits:** Ensure the code actually checks `max_cases` or `ai_requests_per_day` before allowing actions.

**Do you want me to proceed with generating the Stripe Sync Script to make these products real?**
