# 🎯 EdPsych Connect World – Landing Page Master Plan

**Status:** Ready for Execution
**Objective:** Create the world's best self-service landing page that converts visitors into subscribers by showcasing 100% of the platform's backend capabilities without overwhelming them.
**Core Philosophy:** "Invisible Intelligence" – The platform is magic. It just works. No "AI" mentions. No "Educational Psychology Platform" label.

---

## 1. 🏗️ Architecture & Flow

The landing page will be a single, cohesive narrative that guides the user from "Problem" to "Magical Solution" to "Proof" to "Action".

**Section Order:**
1.  **Hero Section:** The "Magic" Hook. High-impact visuals, the "Invisible Intelligence" tagline.
2.  **The "Who Are You?" Router:** 4-way segment selector (LA, School, EP, Researcher) that dynamically adjusts the narrative.
3.  **The "Crisis" & Solution:** Acknowledging the SEN pressure/EHCP crisis and presenting the "Orchestration" solution.
4.  **Flagship Feature Showcase (The "Big Three"):**
    *   **Differentiation Engine:** "Lessons that plan themselves."
    *   **Gamification (Battle Royale):** "Engagement that sustains itself."
    *   **EHCP Automation:** "Paperwork that writes itself."
5.  **Core Capabilities Grid (The "Inventory"):** A visual grid exposing the deep backend features (ECCA, Interventions, Training, etc.).
6.  **Interactive Demos (The "Proof"):**
    *   Differentiation Slider (Before/After).
    *   Gamification Leaderboard Preview.
    *   Problem Solver (limited demo).
7.  **Training & Marketplace:** Showcasing the CPD library and individual course purchases.
8.  **Pricing & Plans:** Clear, transparent tiers (Individual £30/mo, School £75/mo, etc.) with Stripe integration.
9.  **The "Coming Soon" Theatre:** Placeholders for Explainer & Training Videos (building anticipation).
10. **Founder & Vision:** Dr. Scott's story, UK credentials, the "Why".
11. **Trust & Footer:** UK Compliance, GDPR, HCPC, Contact.

---

## 2. 🗣️ Messaging Strategy (The "Invisible" Pivot)

**❌ BANNED TERMS:**
*   "AI" / "Artificial Intelligence"
*   "Educational Psychology Platform"
*   "Chatbot"

**✅ APPROVED TERMINOLOGY:**
*   "Invisible Intelligence"
*   "Platform Orchestration"
*   "Teaching That Adapts Itself"
*   "Reports That Write Themselves"
*   "Evidence-Based Frameworks"
*   "UK SEND Compliance"
*   "Orchestration Layer"

**Tagline:**
*   **Primary:** "No Child Left Behind. The UK's First SEND Orchestration System."
*   **Secondary:** "Experience what feels like magic, works like clockwork, and delivers like expertise multiplied."

---

## 3. 🧩 Feature Exposure Strategy (Backend -> Frontend)

We will expose the backend inventory through specific UI components:

| Backend Module | Frontend Exposure |
| :--- | :--- |
| **ECCA Framework** | "The Engine" Section – Visualizing the 4 cognitive domains. |
| **Intervention Library** | "Intervention Designer" Preview – Filterable list of 100+ strategies. |
| **Training/CPD** | "Professional Growth" Carousel – Course cards with CPD hour badges. |
| **Gamification** | "Battle Royale" Live Ticker – Showing active squads/merits (simulated). |
| **EHCP Automation** | "Time Saver" Calculator – Input hours, see savings. |
| **Subscription** | "Pricing Wizard" – Interactive plan selector. |
| **Research/Ethics** | "Research Portal" Card – Highlighting the ethics approval workflow. |

---

## 4. 🚧 Handling Pending Features

*   **Explainer Videos:** A "Cinema" section with blurred thumbnails and "Coming [Date]" overlays. Users can "Join Waitlist for Premiere".
*   **Tokenisation:** A "Future of SEND" teaser card in the roadmap section.
*   **Training Videos:** "Production in Progress" badges on specific course cards.

---

## 5. 🎨 Visual Design & Polish

*   **Theme:** "Clean Magic". White space, soft gradients (Indigo/Purple), glassmorphism for "invisible" tech feel.
*   **Imagery:** Authentic UK classroom settings, diverse student representation, high-quality UI mockups of the dashboard.
*   **Motion:** Subtle entrance animations (Framer Motion). Elements "assemble" themselves to reinforce the "automatic" message.
*   **Typography:** Clean, readable sans-serif (Inter/Plus Jakarta Sans) with authoritative headings.

---

## 6. 🛠️ Technical Execution Plan

1.  **Refactor `LandingPage.tsx`:** Break into smaller, modular components for maintainability.
2.  **Create New Components:**
    *   `HeroOrchestration.tsx`
    *   `FlagshipDifferentiation.tsx`
    *   `FlagshipGamification.tsx`
    *   `FlagshipEHCP.tsx`
    *   `VideoPremiereSection.tsx`
3.  **Routing Check:** Ensure all "Try Now" buttons route correctly to `/signup` or specific demo pages.
4.  **SEO & Metadata:** Update `layout.tsx` with the new "Orchestration" messaging.

**Next Step:** Begin autonomous execution of the component build.
