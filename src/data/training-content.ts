/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

export interface TrainingLesson {
  id: string;
  title: string;
  duration: string;
  type: 'Video' | 'Quiz' | 'Reading' | 'Workshop';
  description: string;
}

export interface TrainingCurriculum {
  id: string;
  title: string;
  description: string;
  lessons: TrainingLesson[];
  resources: { title: string; type: string; url: string }[];
}

export const TRAINING_CONTENT: Record<string, TrainingCurriculum> = {
  'admin-training': {
    id: 'admin-training',
    title: 'Administrator Certification: Governance & Compliance',
    description: 'A rigorous certification for System Administrators ensuring full alignment with KCSIE 2024, UK GDPR, and ISO 27001 standards. Master the governance of your EdPsych Connect instance.',
    lessons: [
      {
        id: 'adm-101',
        title: 'Platform Architecture & Multi-Tenant Hierarchy',
        duration: '15 mins',
        type: 'Video',
        description: 'Deep dive into the logical separation of data between Tenants, Schools, and Users to ensure data sovereignty.'
      },
      {
        id: 'adm-102',
        title: 'Advanced RBAC & Least Privilege Security',
        duration: '25 mins',
        type: 'Workshop',
        description: 'Configuring granular permission sets for SENCOs, EPs, and external agencies based on the Principle of Least Privilege.'
      },
      {
        id: 'adm-103',
        title: 'GDPR, Article 30 & Data Processing',
        duration: '30 mins',
        type: 'Video',
        description: 'Maintaining Records of Processing Activities (ROPA) and managing Subject Access Requests (SARs) within the platform.'
      },
      {
        id: 'adm-104',
        title: 'Interoperability: MIS & API Connectors',
        duration: '20 mins',
        type: 'Video',
        description: 'Establishing secure, encrypted pipelines with SIMS, Arbor, and Bromcom using Wonde or Groupcall standards.'
      },
      {
        id: 'adm-105',
        title: 'Forensic Auditing & Incident Response',
        duration: '15 mins',
        type: 'Reading',
        description: 'Utilizing immutable audit logs for security investigations and compliance reporting.'
      }
    ],
    resources: [
      { title: 'Governance & Compliance Handbook (v2.4)', type: 'PDF', url: '#' },
      { title: 'Role-Based Access Control Matrix Template', type: 'XLSX', url: '#' },
      { title: 'DPIA (Data Protection Impact Assessment) Reference', type: 'PDF', url: '#' }
    ]
  },
  'teacher-training': {
    id: 'teacher-training',
    title: 'Inclusive Classroom Practitioner (EEF Aligned)',
    description: 'Evidence-based strategies aligned with the Education Endowment Foundation (EEF) guidance reports and the SEND Code of Practice 2015. Empower your practice with high-leverage interventions.',
    lessons: [
      {
        id: 'tch-101',
        title: 'The Graduated Response (SEND CoP Section 6)',
        duration: '20 mins',
        type: 'Video',
        description: 'Rigorous application of the Assess-Plan-Do-Review cycle to meet statutory requirements.'
      },
      {
        id: 'tch-102',
        title: 'Cognitive Science in the Classroom',
        duration: '35 mins',
        type: 'Video',
        description: 'Identifying barriers related to Working Memory, Processing Speed, and Executive Function using the ECCA screener.'
      },
      {
        id: 'tch-103',
        title: 'High-Leverage Tier 1 Interventions',
        duration: '45 mins',
        type: 'Workshop',
        description: 'Implementing EEF-recommended strategies: Metacognition, Scaffolding, and Explicit Instruction.'
      },
      {
        id: 'tch-104',
        title: 'Precision Monitoring with Goal Attainment Scaling',
        duration: '25 mins',
        type: 'Video',
        description: 'Constructing standardized 5-point GAS rubrics to measure micro-progress in heterogeneous cohorts.'
      },
      {
        id: 'tch-105',
        title: 'Statutory Evidence Gathering',
        duration: '15 mins',
        type: 'Reading',
        description: 'Compiling defensible evidence for EHC Needs Assessments that withstands panel scrutiny.'
      }
    ],
    resources: [
      { title: 'EEF "SEN in Mainstream Schools" Summary', type: 'PDF', url: '#' },
      { title: 'Tier 1 Intervention Fidelity Checklists', type: 'PDF', url: '#' },
      { title: 'Standardized GAS Rubric Generator', type: 'Tool', url: '#' }
    ]
  },
  'ep-training': {
    id: 'ep-training',
    title: 'Advanced Clinical Practice (HCPC/BPS Standards)',
    description: 'For HCPC-registered psychologists. This track aligns with BPS best practice guidelines, focusing on the ECCA Framework (CHC Theory) and defensible statutory advice writing.',
    lessons: [
      {
        id: 'ep-101',
        title: 'ECCA Framework & CHC Theory Alignment',
        duration: '45 mins',
        type: 'Video',
        description: 'Mapping the 8 ECCA domains to Cattell-Horn-Carroll broad and narrow abilities for robust formulation.'
      },
      {
        id: 'ep-102',
        title: 'Dynamic Assessment: Tzuriel & Feuerstein',
        duration: '60 mins',
        type: 'Workshop',
        description: 'Advanced Test-Teach-Retest protocols to assess modifiability and learning potential.'
      },
      {
        id: 'ep-103',
        title: 'Psychometrics: Confidence Intervals & Reliability',
        duration: '30 mins',
        type: 'Video',
        description: 'Critical statistical analysis of assessment data to prevent over-interpretation of scores.'
      },
      {
        id: 'ep-104',
        title: 'Defensible Advice (Children & Families Act 2014)',
        duration: '40 mins',
        type: 'Video',
        description: 'Structuring Appendix D advice that precisely specifies provision (Section F) to meet needs (Section B).'
      },
      {
        id: 'ep-105',
        title: 'Supervision & Reflective Practice Logs',
        duration: '20 mins',
        type: 'Reading',
        description: 'Using the platform to maintain HCPC audit-ready CPD and supervision records.'
      }
    ],
    resources: [
      { title: 'ECCA Clinical Administration Manual', type: 'PDF', url: '#' },
      { title: 'Model Appendix D Templates (Tribunal Tested)', type: 'DOCX', url: '#' },
      { title: 'Cognitive Profile Analysis Matrix', type: 'XLSX', url: '#' }
    ]
  },
  'researcher-training': {
    id: 'researcher-training',
    title: 'Educational Data Science & Ethics (BERA)',
    description: 'Designed for doctoral researchers and academic partners. Adheres to BERA Ethical Guidelines 2024 for conducting rigorous, longitudinal educational research.',
    lessons: [
      {
        id: 'res-101',
        title: 'Longitudinal Study Design & Sampling',
        duration: '25 mins',
        type: 'Video',
        description: 'Defining inclusion criteria, power analysis, and cohort tracking within the platform ecosystem.'
      },
      {
        id: 'res-102',
        title: 'BERA Ethics: Consent & Anonymization',
        duration: '30 mins',
        type: 'Video',
        description: 'Managing dynamic consent flows and k-anonymity data stripping for GDPR compliance.'
      },
      {
        id: 'res-103',
        title: 'Time-Series Data Collection Points',
        duration: '20 mins',
        type: 'Workshop',
        description: 'Configuring automated data capture triggers for high-frequency longitudinal measurement.'
      },
      {
        id: 'res-104',
        title: 'Data Pipelines: R, Python & SPSS',
        duration: '15 mins',
        type: 'Video',
        description: 'Exporting clean, structured datasets compatible with major statistical packages.'
      }
    ],
    resources: [
      { title: 'BERA Ethical Application Template', type: 'DOCX', url: '#' },
      { title: 'EdPsych Connect Data Dictionary (v3.0)', type: 'PDF', url: '#' },
      { title: 'R Analysis Scripts for Longitudinal Data', type: 'ZIP', url: '#' }
    ]
  },
  'integration-training': {
    id: 'integration-training',
    title: 'Technical Integration Specialist',
    description: 'For IT professionals. Master the secure integration of EdPsych Connect using OAuth2, OpenID Connect, and RESTful APIs aligned with DfE Data Standards.',
    lessons: [
      {
        id: 'int-101',
        title: 'OAuth2 Authentication & Token Rotation',
        duration: '20 mins',
        type: 'Video',
        description: 'Implementing secure machine-to-machine authentication flows with automatic token rotation.'
      },
      {
        id: 'int-102',
        title: 'CBDS & CTF Data Synchronization',
        duration: '35 mins',
        type: 'Video',
        description: 'Mapping internal data structures to the DfE Common Basic Data Set (CBDS) for seamless interoperability.'
      },
      {
        id: 'int-103',
        title: 'Webhooks & Event-Driven Architecture',
        duration: '25 mins',
        type: 'Workshop',
        description: 'Building real-time integrations using HMAC-signed webhooks for assessment events.'
      },
      {
        id: 'int-104',
        title: 'Enterprise SSO (SAML 2.0 / OIDC)',
        duration: '20 mins',
        type: 'Video',
        description: 'Configuring Azure AD, Google Workspace, or Okta for centralized identity management.'
      }
    ],
    resources: [
      { title: 'API Reference Documentation (OpenAPI 3.0)', type: 'Link', url: '#' },
      { title: 'Postman Collection for Developers', type: 'JSON', url: '#' },
      { title: 'Security Architecture Whitepaper', type: 'PDF', url: '#' }
    ]
  }
};
