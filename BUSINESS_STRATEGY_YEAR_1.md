# 🚀 EdPsych Connect: Year 1 Business Strategy & Valuation Guide

## 1. Decoding the Pricing Labels (The "Why")

You asked why I labelled the tiers "Worker", "Sticky", and "Compliance". This is not just marketing jargon; it describes the **economic behavior** of the customer at that level.

### 🔵 Tier 2: PRO = "The Worker" (Productivity)
*   **Who:** The Independent EP.
*   **Behavior:** They trade money for time. They are a "Worker" using a tool.
*   **Why they buy:** "This tool writes my reports 50% faster."
*   **Risk:** If a cheaper tool comes out next month, they might switch.
*   **Revenue Quality:** Good, but volatile.

### 🟣 Tier 3: INSTITUTIONAL = "Sticky" (Retention)
*   **Who:** Schools & MATs.
*   **Behavior:** They embed the software into their daily life.
*   **Why "Sticky"?** Once a school sets up student rosters, assigns "Squads" (Gamification), and parents start using the portal, **removing the software becomes painful.**
*   **Revenue Quality:** High. Schools rarely change software mid-year. This is your **Foundation**.

### ⚫ Tier 4: LA ENTERPRISE = "Compliance" (Barrier Removal)
*   **Who:** Local Authorities.
*   **Behavior:** They buy based on risk mitigation and policy.
*   **Why "Compliance"?** They *want* the features, but they *cannot* buy unless you tick the boxes: Data Sovereignty (BYOD), ISO27001, GDPR.
*   **Revenue Quality:** Massive. Multi-year contracts. But hard to close.

---

## 2. Year 1 Operational Plan: From Vision to Business

You are currently a "Founder-Led" company. To scale, you need to transition to a "Team-Led" company.

### Phase 1: The "Lean" Team (Months 1-6)
*   **Goal:** Reach £10k Monthly Recurring Revenue (MRR).
*   **Team Needed:**
    1.  **Founder (You):** Vision, Clinical Lead, "Face" of the brand. (Cost: £0 - Equity).
    2.  **Lead Developer (Contractor/Agency):** Maintains the code, fixes bugs. (Cost: £3k-£5k/mo).
    3.  **Customer Success / Admin (Part-time):** Onboards schools, answers "How do I reset my password?" emails. (Cost: £1.5k/mo).
*   **Total Burn:** ~£5k - £7k / month.
*   **Break-even:** ~150 Pro Users OR ~15 Schools.

### Phase 2: The "Growth" Team (Months 6-12)
*   **Goal:** Reach £50k MRR.
*   **Additions:**
    1.  **Sales Lead (Commission heavy):** Someone who knows how to talk to MAT CEOs and LAs.
    2.  **Marketing Freelancer:** Content creation (Blogs, LinkedIn) to drive traffic.

---

## 3. Valuation: What is EdPsych Connect Worth?

SaaS (Software as a Service) companies are valued based on a multiple of their **Annual Recurring Revenue (ARR)**.

### The Formula
$$ \text{Valuation} = \text{ARR} \times \text{Multiple} $$

*   **ARR:** Total yearly value of all subscriptions.
*   **Multiple:** Depends on growth rate, churn (how many leave), and market size.
    *   *Average SaaS Multiple:* 5x - 8x ARR.
    *   *High Growth AI SaaS:* 10x - 15x ARR.

### Scenario A: The "Lifestyle" Business (Year 1 Conservative)
*   100 Independent EPs (£49/mo) = £58.8k/yr
*   20 Schools (£499/yr) = £10k/yr
*   **Total ARR:** ~£69k
*   **Valuation (5x):** **~£350,000**

### Scenario B: The "Traction" Business (Year 2 Target)
*   500 Independent EPs = £294k/yr
*   100 Schools = £50k/yr
*   2 Local Authorities (£25k each) = £50k/yr
*   **Total ARR:** ~£400k
*   **Valuation (8x):** **~£3.2 Million**

### Scenario C: The "Exit" (Acquisition by LA or Major EdTech)
*   If you capture 10% of the UK market.
*   **Valuation:** **£10 Million+**

**Key Takeaway:** To sell to an LA, you don't sell the *company* usually; you sell a *license*. But if you want to sell the *company*, you need **Recurring Revenue** (Subscriptions), not just one-off sales.

---

## 4. The "AI Fear" Factor: Handling Data Privacy

**The Concern:** "Will OpenAI train on my student's sensitive data?"
**The Reality:** Enterprise agreements with AI providers (OpenAI Enterprise, Azure OpenAI) **contractually guarantee** zero data retention for training.

### Your Defense Strategy:
1.  **Zero-Training Policy:** We use API endpoints where data is NOT used for training models.
2.  **Anonymization Layer:** We strip PII (Names, DOBs) *before* sending text to the AI. The AI sees "Student A", not "John Smith".
3.  **BYOD (Bring Your Own Database):** For LAs, the data never leaves their controlled environment (except transiently for AI processing).

*(See the accompanying AI Privacy Whitepaper for the technical details to give to LAs)*
