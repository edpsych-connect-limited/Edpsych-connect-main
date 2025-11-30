# Bring Your Own Data (BYOD)
## EdPsych Connect's Data Autonomy Guarantee

**Document Version:** 1.0  
**Last Updated:** November 2025  
**Classification:** Public

---

## Executive Summary

EdPsych Connect operates on a fundamental principle: **your data belongs to you**.

Unlike traditional SaaS platforms that create vendor lock-in by holding your data hostage, we've architected our platform to ensure Local Authorities, schools, and families maintain complete ownership and control of their information at all times.

This document explains our "Bring Your Own Data" (BYOD) approach and how it guarantees your data autonomy.

---

## The Problem with Traditional Platforms

Most educational technology platforms operate on a model that benefits the vendor, not the customer:

| Traditional Model | Impact on You |
|------------------|---------------|
| Data stored on vendor servers | Loss of direct control |
| Proprietary data formats | Difficult/expensive to migrate |
| Limited export options | Vendor lock-in |
| Unclear data ownership | Legal ambiguity |
| Vendor-controlled retention | Can't enforce your own policies |
| Shared infrastructure | Data mingling concerns |

**The result:** You become dependent on the vendor. Switching costs become prohibitive. Your data—about vulnerable children—sits on servers you don't control, in formats you can't easily access.

---

## The EdPsych Connect BYOD Approach

### Core Principles

#### 1. **Data Ownership is Non-Negotiable**
Your data is yours. Full stop. We provide the tools; you retain complete ownership. This is contractually guaranteed, not just a marketing claim.

#### 2. **No Vendor Lock-In**
Every piece of data you put into EdPsych Connect can be exported at any time, in standard open formats (JSON, CSV, PDF). No proprietary formats. No export fees. No restrictions.

#### 3. **Deployment Flexibility**
Choose where your data lives:
- Your own servers
- Your own cloud tenancy
- Our managed infrastructure (fully isolated)
- A hybrid of the above

#### 4. **Transparency by Design**
Our platform is built on open standards. You can inspect how your data is stored, processed, and transmitted. No black boxes.

---

## Deployment Options

### Option 1: Self-Hosted (Maximum Control)

```
┌─────────────────────────────────────────────────────┐
│              YOUR INFRASTRUCTURE                     │
│  ┌─────────────────────────────────────────────┐    │
│  │         EdPsych Connect Platform            │    │
│  │  ┌─────────────┐  ┌─────────────────────┐   │    │
│  │  │  Your Data  │  │  Application Layer  │   │    │
│  │  │  (Database) │  │   (Your Servers)    │   │    │
│  │  └─────────────┘  └─────────────────────┘   │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  ✓ Complete control                                  │
│  ✓ Your security policies                           │
│  ✓ Your backup procedures                           │
│  ✓ Your IT team manages                             │
└─────────────────────────────────────────────────────┘
```

**Best for:** LAs with strong IT capabilities who require maximum control over sensitive SEND data.

**What we provide:**
- Docker containers for easy deployment
- Comprehensive installation documentation
- Configuration guidance
- Update packages (you control when to apply)
- Support via secure channels

**What you manage:**
- Server infrastructure
- Database administration
- Backups and disaster recovery
- Security patches
- User access

---

### Option 2: Dedicated Cloud (Balanced Approach)

```
┌─────────────────────────────────────────────────────┐
│           EDPSYCH CONNECT MANAGED CLOUD             │
│  ┌─────────────────────────────────────────────┐    │
│  │       YOUR ISOLATED ENVIRONMENT              │    │
│  │  ┌─────────────┐  ┌─────────────────────┐   │    │
│  │  │  Your Data  │  │  Your Application   │   │    │
│  │  │  (Isolated) │  │    Instance         │   │    │
│  │  └─────────────┘  └─────────────────────┘   │    │
│  │                                              │    │
│  │  🔒 Encrypted at rest and in transit        │    │
│  │  🔒 Logically separated from other tenants  │    │
│  │  🔒 UK data residency guaranteed            │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  Other LA    │   Other LA    │   Other LA           │
│  (Isolated)  │   (Isolated)  │   (Isolated)         │
└─────────────────────────────────────────────────────┘
```

**Best for:** LAs who want the benefits of cloud without the overhead of self-hosting.

**What we provide:**
- Fully isolated cloud environment
- Managed infrastructure
- Automated backups
- Security updates applied promptly
- 24/7 monitoring
- UK-based data centres only

**What you retain:**
- Data ownership
- Export rights at any time
- Access audit logs
- Configuration control
- User management

---

### Option 3: Hybrid (Flexible Architecture)

```
┌─────────────────────────────────────────────────────┐
│              YOUR INFRASTRUCTURE                     │
│  ┌──────────────────────┐                           │
│  │   Sensitive Data     │   ← Child records        │
│  │   (On-Premise DB)    │   ← Assessment data      │
│  └──────────┬───────────┘   ← Personal info        │
│             │                                        │
│             │ Encrypted connection                   │
│             │ (Only anonymised/reference data)       │
│             ▼                                        │
└─────────────┼───────────────────────────────────────┘
              │
┌─────────────┼───────────────────────────────────────┐
│             ▼                                        │
│  ┌──────────────────────┐                           │
│  │  EdPsych Connect     │   ← Processing logic     │
│  │  Cloud Platform      │   ← UI/UX                │
│  │  (Reference data     │   ← Workflow management  │
│  │   only)              │   ← Non-sensitive meta   │
│  └──────────────────────┘                           │
│                                                      │
│           EDPSYCH CONNECT CLOUD                      │
└─────────────────────────────────────────────────────┘
```

**Best for:** LAs who need cloud convenience but have policies requiring certain data to remain on-premise.

**What stays on-premise:**
- Child identifiable information
- Full assessment reports
- Sensitive family data

**What uses cloud:**
- Workflow orchestration
- User interface
- Notification systems
- Anonymised analytics

---

## Data Export Guarantee

### Export Formats Available

| Data Type | Formats | Frequency |
|-----------|---------|-----------|
| EHCP Applications | JSON, CSV, PDF | Anytime |
| Professional Reports | PDF, Original format | Anytime |
| Assessment Data | JSON, CSV | Anytime |
| User Records | JSON, CSV | Anytime |
| Audit Logs | JSON, CSV | Anytime |
| Analytics | CSV, Excel | Anytime |
| Full Database | PostgreSQL dump | Anytime |

### Export Process

1. **Self-Service:** Authorised admins can export any data at any time via the platform
2. **Bulk Export:** Request full database export with 24-hour turnaround
3. **Continuous Sync:** API access allows real-time data synchronisation with your systems
4. **Termination Export:** Upon contract end, receive complete data export automatically

### No Export Fees
Unlike some vendors who charge for data export, we provide all export functionality at no additional cost. Your data is yours—we won't charge you to access it.

---

## Technical Architecture

### Open Standards

EdPsych Connect is built entirely on open standards:

- **Database:** PostgreSQL (industry-standard, open-source)
- **API:** RESTful JSON APIs (standard web protocols)
- **Authentication:** OAuth 2.0 / OpenID Connect (compatible with your SSO)
- **File Storage:** Standard file formats (PDF, DOCX, images)
- **Encryption:** AES-256 (government-approved standard)

### No Proprietary Lock-In

We deliberately avoid proprietary technologies that would create dependencies:

| Area | Our Approach | Why It Matters |
|------|--------------|----------------|
| Database | Standard PostgreSQL | Can migrate to any PostgreSQL-compatible system |
| File formats | PDF, JSON, CSV | Open standards readable by any software |
| Authentication | Standard OAuth/OIDC | Works with your existing identity provider |
| APIs | RESTful, documented | Easy to integrate with your other systems |

---

## Security & Compliance

### Certifications & Standards

- **ISO 27001:** Information security management (in progress)
- **Cyber Essentials Plus:** UK government security standard
- **GDPR Compliant:** Full compliance with UK data protection law
- **ICO Registration:** Registered data processor

### Your Compliance Benefits

By maintaining data ownership, you:

1. **Satisfy your DPO:** Clear data controller/processor relationship
2. **Meet GDPR Article 20:** Data portability guaranteed
3. **Control retention:** Enforce your own retention policies
4. **Audit confidently:** Full visibility into data handling
5. **Respond to SARs:** Direct access to all personal data

---

## Contractual Guarantees

Our contracts include explicit provisions protecting your data autonomy:

### Data Ownership Clause
> "All data entered into the Platform by or on behalf of the Customer remains the sole property of the Customer. EdPsych Connect Limited acts as a data processor and acquires no ownership rights over Customer data."

### Export Rights Clause
> "The Customer may export any or all of their data at any time during or after the contract term, at no additional charge, in standard open formats as specified in Schedule A."

### No Lock-In Clause
> "Upon termination of this Agreement for any reason, EdPsych Connect Limited shall provide the Customer with a complete export of all Customer data within 30 days, following which all Customer data shall be securely deleted from EdPsych Connect systems."

### Data Deletion Clause
> "Upon written request, EdPsych Connect Limited shall delete all Customer data from its systems within 90 days, providing written certification of deletion."

---

## Comparison: Traditional SaaS vs BYOD

| Aspect | Traditional SaaS | EdPsych Connect BYOD |
|--------|-----------------|---------------------|
| Data location | Vendor's servers | Your choice |
| Export options | Limited/costly | Unlimited/free |
| Format | Often proprietary | Open standards |
| Switching cost | High | Low |
| Vendor dependency | Strong | Minimal |
| Compliance control | Limited | Full |
| Retention policies | Vendor's | Yours |
| Audit access | Restricted | Complete |

---

## Frequently Asked Questions

### Q: If I choose self-hosted, what support do I get?
**A:** Full technical documentation, deployment guides, and access to our support team via secure channels. We'll help you get set up and troubleshoot issues, but you maintain operational control.

### Q: Can I switch between deployment options?
**A:** Yes. Start with our managed cloud, then migrate to self-hosted when ready (or vice versa). We'll assist with the migration at no additional cost.

### Q: What happens to my data if EdPsych Connect ceases trading?
**A:** Our contracts include provisions for this scenario. You would receive a complete data export, and our source code is held in escrow for continuity purposes.

### Q: How do you handle data subject access requests (DSARs)?
**A:** You handle them directly—you have complete access to all data. We provide tools to easily locate and export data related to specific individuals.

### Q: Can I integrate with our existing case management system?
**A:** Yes. Our API allows bidirectional data flow. Keep your existing systems and use EdPsych Connect for specific EHCP workflows, or vice versa.

### Q: What about data shared between LAs and schools?
**A:** Our architecture supports multi-tenancy with clear data boundaries. Schools see only their data; LAs see only applications within their authority. No cross-contamination.

---

## Getting Started

### For IT Teams
1. Review our [Technical Architecture Document](./TECHNICAL_ARCHITECTURE.md)
2. Schedule a technical deep-dive call
3. Discuss deployment options with your security team
4. Proceed with pilot in your preferred configuration

### For Commissioners
1. Watch our [LA EHCP Portal Walkthrough Video](./LA_EHCP_PORTAL_WALKTHROUGH.md)
2. Review this BYOD guarantee
3. Book a demo tailored to your LA's needs
4. Discuss pilot scope and timeline

---

## Contact

**Technical Enquiries:** tech@edpsychconnect.com  
**General Enquiries:** info@edpsychconnect.com  
**Demo Booking:** [Book a Demo](https://edpsychconnect.com/demo)

---

*EdPsych Connect: Your Data. Your Control. Your Children's Futures.*
