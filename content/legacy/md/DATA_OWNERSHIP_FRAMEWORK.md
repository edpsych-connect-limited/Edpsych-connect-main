# EdPsych Connect Limited - Data Ownership Framework
## User-First, Privacy-First, Ethics-First

**Version**: 1.0
**Last Updated**: November 2025
**Status**: Production Implementation
**Compliance**: UK GDPR, Data Protection Act 2018, BPS Code of Ethics, HCPC Standards

---

## CORE PRINCIPLE

**Users own their data. Absolutely. Completely. Irrevocably.**

EdPsych Connect Limited is a **Data Processor**, not a Data Controller.
Educational Psychologists using our platform are **Data Controllers**.

---

## LEGAL FRAMEWORK

### Data Controller vs Data Processor

**User/EP (Data Controller)**:
- ✅ Owns all assessment data
- ✅ Owns all case records
- ✅ Owns all generated reports
- ✅ Owns all client information
- ✅ Makes all decisions about data use
- ✅ Controls data sharing
- ✅ Controls data retention
- ✅ Controls data deletion

**EdPsych Connect Limited (Data Processor)**:
- ✅ Provides secure storage infrastructure
- ✅ Provides processing tools and features
- ✅ Processes data ONLY on user instructions
- ✅ Maintains security and confidentiality
- ✅ CANNOT access user data without explicit permission
- ✅ CANNOT share user data with third parties
- ✅ CANNOT use user data for own purposes (except opted-in research)

---

## USER RIGHTS (UK GDPR)

### 1. Right to Access
**Implementation**:
- Users can download ALL their data anytime
- Formats: JSON (complete), CSV (tabular), PDF (reports)
- No limits on exports
- Instant delivery

**Technical**: `GET /api/user/data-export`

### 2. Right to Portability
**Implementation**:
- Standard data formats (JSON, CSV)
- Compatible with other systems
- Includes all metadata
- Migration-ready structure

**Technical**: Data export includes schema documentation

### 3. Right to Erasure ("Right to be Forgotten")
**Implementation**:
- One-click account deletion
- All data permanently deleted within 30 days
- Anonymized research contributions retained (if opted-in)
- Deletion confirmation provided

**Technical**: `DELETE /api/user/account` → cascades all data deletion

### 4. Right to Rectification
**Implementation**:
- Users can edit/correct any data anytime
- Full edit history maintained
- No restrictions on corrections

**Technical**: Standard CRUD operations with audit trail

### 5. Right to Restrict Processing
**Implementation**:
- Users can pause account processing
- Data retained but not processed
- Reactivation anytime

**Technical**: Account status = "restricted"

### 6. Right to Object
**Implementation**:
- Users can object to any data processing
- Opt-out of optional features
- Granular control over all processing activities

**Technical**: Feature flags per user

---

## TECHNICAL IMPLEMENTATION

### Security Architecture

```
┌─────────────────────────────────────────────┐
│ USER DATA PROTECTION                        │
├─────────────────────────────────────────────┤
│                                             │
│ Layer 1: Encryption at Rest                │
│ → AES-256 encryption                        │
│ → Separate encryption keys per user         │
│ → Keys stored in hardware security modules  │
│                                             │
│ Layer 2: Encryption in Transit              │
│ → TLS 1.3 for all communications            │
│ → Certificate pinning                       │
│ → Perfect forward secrecy                   │
│                                             │
│ Layer 3: Access Controls                    │
│ → Role-based access control (RBAC)         │
│ → Multi-factor authentication (MFA)        │
│ → IP whitelisting (optional)               │
│ → Session management                        │
│                                             │
│ Layer 4: Audit Logging                     │
│ → All access logged                         │
│ → Immutable audit trail                     │
│ → User-visible access logs                  │
│ → Anomaly detection                         │
│                                             │
│ Layer 5: Data Isolation                    │
│ → Multi-tenancy with tenant isolation      │
│ → No cross-tenant data leakage             │
│ → Separate database schemas per institution│
│                                             │
└─────────────────────────────────────────────┘
```

### Database Schema

```typescript
// User Data Ownership
model User {
  id: string @id
  email: string @unique

  // Data Ownership
  data_ownership_status: "CONTROLLER" // User is always controller
  data_processor: "EdPsych Connect Limited"
  data_ownership_accepted_at: DateTime

  // Rights Exercise
  data_exports: DataExport[]
  data_deletions: DataDeletion[]
  access_log: AccessLog[]

  // Research Contribution (Optional)
  research_opt_in: boolean @default(false)
  research_opt_in_date: DateTime?
  research_opt_out_date: DateTime?
  research_contributions: ResearchContribution[]
}

// Data Export (Right to Portability)
model DataExport {
  id: string @id
  user_id: string
  requested_at: DateTime @default(now())
  format: "JSON" | "CSV" | "PDF"
  status: "PENDING" | "READY" | "DOWNLOADED" | "EXPIRED"
  download_url: string?
  download_expires_at: DateTime
  downloaded_at: DateTime?
  file_size: bigint?

  user: User @relation(fields: [user_id], references: [id])
  @@index([user_id])
}

// Data Deletion (Right to Erasure)
model DataDeletion {
  id: string @id
  user_id: string
  requested_at: DateTime @default(now())
  deletion_type: "PARTIAL" | "FULL_ACCOUNT"
  deleted_items: json // List of deleted entities
  completed_at: DateTime?
  verification_code: string
  verified_at: DateTime?

  user: User @relation(fields: [user_id], references: [id])
  @@index([user_id])
}

// Access Log (Transparency)
model AccessLog {
  id: string @id
  user_id: string
  accessed_at: DateTime @default(now())
  access_type: "LOGIN" | "DATA_READ" | "DATA_WRITE" | "EXPORT" | "DELETE"
  entity_type: string?
  entity_id: string?
  ip_address: string
  user_agent: string
  location: string?

  user: User @relation(fields: [user_id], references: [id])
  @@index([user_id, accessed_at])
}
```

---

## PLATFORM GUARANTEES

### What We NEVER Do

❌ **NEVER sell or share user data with third parties**
❌ **NEVER use user data to train AI models (unless opted-in for research)**
❌ **NEVER access user data without explicit permission**
❌ **NEVER track users for advertising purposes**
❌ **NEVER share data with data brokers**
❌ **NEVER monetize user data**

### What We ALWAYS Do

✅ **ALWAYS encrypt user data (at rest and in transit)**
✅ **ALWAYS maintain audit logs (user-visible)**
✅ **ALWAYS honor deletion requests (within 30 days)**
✅ **ALWAYS provide data exports (unlimited, free)**
✅ **ALWAYS operate transparently**
✅ **ALWAYS comply with UK GDPR, BPS, HCPC standards**

---

## RESEARCH CONTRIBUTION (OPTIONAL OPT-IN)

### Informed Consent Model

Users can **optionally** contribute anonymized data to EdPsych Connect's research foundation:

**What Is Shared (If Opted-In)**:
- ✅ Anonymized intervention outcomes
- ✅ De-identified assessment profiles
- ✅ Aggregated provision effectiveness data
- ✅ Platform usage patterns (fully anonymous)

**What Is NEVER Shared (Even With Opt-In)**:
- ❌ Names (children, parents, EPs)
- ❌ Schools, locations
- ❌ Dates of birth, case numbers
- ❌ Raw case notes
- ❌ Any identifiable information

**Anonymization Standards**:
- Differential privacy techniques
- K-anonymity (K≥5)
- ICO guidelines compliance
- NHS Digital standards
- Independent audit annually
- Mathematically impossible to re-identify

**User Control**:
- Opt-in required (never automatic)
- Granular control (choose what to share)
- Revocable anytime (opt-out instantly)
- Transparent (see exactly what's shared)
- Impact visible (how data contributed to research)

---

## COMPLIANCE CERTIFICATIONS

### Current Certifications
- ✅ UK GDPR Compliant
- ✅ Data Protection Act 2018 Compliant
- ✅ BPS Code of Ethics Aligned
- ✅ HCPC Standards Aligned

### In Progress (2025)
- ⏳ ISO 27001 (Information Security)
- ⏳ SOC 2 Type II (Service Organization Controls)
- ⏳ Cyber Essentials Plus (UK Gov)
- ⏳ NHS Digital Data Security & Protection Toolkit

### Planned (2026)
- 📋 ISO 27701 (Privacy Information Management)
- 📋 BSI Kitemark for Data Privacy

---

## TRANSPARENCY REPORTS

### Annual Transparency Report

EdPsych Connect publishes annual transparency reports covering:

1. **Data Requests**
   - Number of law enforcement requests
   - Number of requests complied with
   - Types of data requested

2. **Security Incidents**
   - Number of security incidents
   - Nature of incidents
   - Response actions taken

3. **Data Breaches**
   - Number of data breaches (if any)
   - ICO notifications
   - User notifications
   - Remediation actions

4. **User Rights Exercised**
   - Data export requests
   - Deletion requests
   - Restriction requests
   - Average response times

5. **Research Contributions**
   - Number of opted-in users
   - Anonymized data contributed
   - Research outputs published
   - Impact on UK SEND field

---

## USER INTERFACE

### Data Control Dashboard

Every user has access to a **Data Control Dashboard**:

```
My Data Control Centre
├── Overview
│   ├── Total data stored
│   ├── Storage used
│   ├── Last backup
│   └── Data ownership status
│
├── Export Data
│   ├── Download all data (JSON/CSV/PDF)
│   ├── Export history
│   └── Scheduled exports
│
├── Access Log
│   ├── Who accessed my data
│   ├── When and from where
│   ├── What actions were taken
│   └── Filter and download logs
│
├── Delete Data
│   ├── Delete specific items
│   ├── Delete full account
│   ├── Deletion requests history
│   └── Recovery options (30-day window)
│
├── Research Contribution
│   ├── Opt-in status
│   ├── What I'm contributing
│   ├── Research impact
│   └── Opt-out
│
└── Privacy Settings
    ├── Data retention preferences
    ├── Access controls
    ├── Security settings
    └── Notification preferences
```

---

## LEGAL DOCUMENTATION

### Terms of Service

**Key Clause**:
> "You retain full ownership of all data you create, upload, or store on EdPsych Connect. EdPsych Connect Limited acts solely as a Data Processor under UK GDPR. We do not claim any ownership rights over your data and will only process it according to your explicit instructions."

### Privacy Policy

**Key Clause**:
> "Your privacy is not for sale. We will never sell, rent, or share your data with third parties for marketing, advertising, or any commercial purpose. Your data is yours, and only yours."

### Data Processing Agreement (DPA)

Available to all users, compliant with UK GDPR Article 28.

---

## PROFESSIONAL STANDARDS ALIGNMENT

### BPS Code of Ethics

**Principle 1: Respect**
→ Implemented via user data ownership and control

**Principle 2: Competence**
→ Tools support, not replace, EP judgment

**Principle 3: Responsibility**
→ Transparent operations, ethical business model

**Principle 4: Integrity**
→ Honest data practices, no hidden agendas

### HCPC Standards of Conduct, Performance and Ethics

**Standard 2: Communicate appropriately**
→ Transparent communication about data practices

**Standard 5: Keep records securely**
→ ISO 27001 security, encryption, access controls

**Standard 9: Get informed consent**
→ Explicit opt-in for research contributions

**Standard 10: Keep information confidential**
→ User data ownership, no third-party sharing

---

## INCIDENT RESPONSE

### Data Breach Protocol

1. **Detection** (within 24 hours)
   - Automated monitoring
   - Security team alerted

2. **Assessment** (within 48 hours)
   - Scope of breach determined
   - Affected users identified

3. **Notification** (within 72 hours)
   - ICO notified (if required)
   - Affected users notified
   - Remediation plan shared

4. **Remediation** (immediate)
   - Vulnerability patched
   - Security enhanced
   - Independent audit conducted

5. **Transparency** (within 30 days)
   - Public incident report
   - Lessons learned shared
   - Preventative measures implemented

---

## CONTACT

### Data Protection Officer

**Name**: [To be appointed]
**Email**: dpo@edpsychconnect.com
**Role**: Oversees data protection compliance

### User Support

**Data Ownership Questions**: privacy@edpsychconnect.com
**Data Export Requests**: exports@edpsychconnect.com
**Data Deletion Requests**: deletion@edpsychconnect.com
**Security Concerns**: security@edpsychconnect.com

---

## VERSION HISTORY

**Version 1.0** (November 2025)
- Initial framework
- Core principles established
- Technical architecture defined
- BPS/HCPC alignment confirmed

---

**This framework is a living document and will be updated as technology, regulations, and professional standards evolve. Users will be notified of any material changes.**

**Last Review**: November 2025
**Next Review**: May 2026
**Review Frequency**: Semi-annual

---

© 2025 EdPsych Connect Limited. All rights reserved.
Registered in England and Wales. Company Number: [TBC]
Registered Office: [TBC]

**Mission**: Empowering Educational Psychologists through ethical, user-first technology that keeps children at the centre of everything we do.
