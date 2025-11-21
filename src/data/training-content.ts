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
    title: 'Administrator Certification',
    description: 'Master the management of your institution\'s EdPsych Connect instance. This comprehensive course covers user lifecycle management, compliance governance, and advanced analytics configuration.',
    lessons: [
      {
        id: 'adm-101',
        title: 'Platform Architecture & Hierarchy',
        duration: '15 mins',
        type: 'Video',
        description: 'Understanding the relationship between Tenants, Schools, and Users.'
      },
      {
        id: 'adm-102',
        title: 'RBAC & Permission Granularity',
        duration: '25 mins',
        type: 'Workshop',
        description: 'Configuring custom roles and permissions for SENCOs, EPs, and external agencies.'
      },
      {
        id: 'adm-103',
        title: 'GDPR & Data Sovereignty Compliance',
        duration: '30 mins',
        type: 'Video',
        description: 'Ensuring your institution meets UK Data Protection Act 2018 requirements.'
      },
      {
        id: 'adm-104',
        title: 'Bulk Import & MIS Integration',
        duration: '20 mins',
        type: 'Video',
        description: 'Syncing data with SIMS, Arbor, and Bromcom using CSV and API connectors.'
      },
      {
        id: 'adm-105',
        title: 'Audit Logs & Forensic Monitoring',
        duration: '15 mins',
        type: 'Reading',
        description: 'Tracking user activity and investigating security incidents.'
      }
    ],
    resources: [
      { title: 'Admin Best Practices Guide', type: 'PDF', url: '#' },
      { title: 'Role Configuration Matrix', type: 'XLSX', url: '#' },
      { title: 'Data Processing Agreement', type: 'PDF', url: '#' }
    ]
  },
  'teacher-training': {
    id: 'teacher-training',
    title: 'Inclusive Classroom Practitioner',
    description: 'Empower your teaching practice with evidence-based strategies. Learn to identify needs early, implement Tier 1 interventions, and track student progress using Goal Attainment Scaling.',
    lessons: [
      {
        id: 'tch-101',
        title: 'The Graduated Response: Assess, Plan, Do, Review',
        duration: '20 mins',
        type: 'Video',
        description: 'Applying the SEND Code of Practice cycles in daily teaching.'
      },
      {
        id: 'tch-102',
        title: 'Identifying Cognitive & Learning Needs',
        duration: '35 mins',
        type: 'Video',
        description: 'Recognizing signs of Dyslexia, DLD, and Working Memory difficulties.'
      },
      {
        id: 'tch-103',
        title: 'Tier 1 Interventions: The Universal Offer',
        duration: '45 mins',
        type: 'Workshop',
        description: 'Practical strategies for differentiation without additional staffing.'
      },
      {
        id: 'tch-104',
        title: 'Goal Attainment Scaling (GAS) for Teachers',
        duration: '25 mins',
        type: 'Video',
        description: 'Setting SMART targets and measuring small steps of progress.'
      },
      {
        id: 'tch-105',
        title: 'Contributing to Statutory Assessments',
        duration: '15 mins',
        type: 'Reading',
        description: 'How to write high-quality evidence for EHCP applications.'
      }
    ],
    resources: [
      { title: 'Classroom Observation Checklist', type: 'PDF', url: '#' },
      { title: 'Differentiation Strategy Bank', type: 'PDF', url: '#' },
      { title: 'GAS Scoring Rubric', type: 'DOCX', url: '#' }
    ]
  },
  'ep-training': {
    id: 'ep-training',
    title: 'Advanced Clinical Practice',
    description: 'Deepen your expertise with the ECCA Framework. This advanced track focuses on dynamic assessment, complex case formulation, and the legal frameworks surrounding statutory advice.',
    lessons: [
      {
        id: 'ep-101',
        title: 'ECCA Framework Deep Dive',
        duration: '45 mins',
        type: 'Video',
        description: 'Mastering the 8 domains of the EdPsych Connect Cognitive Assessment.'
      },
      {
        id: 'ep-102',
        title: 'Dynamic Assessment Protocols',
        duration: '60 mins',
        type: 'Workshop',
        description: 'Test-Teach-Retest methodologies based on Feuerstein and Vygotsky.'
      },
      {
        id: 'ep-103',
        title: 'Psychometric Interpretation & Bias',
        duration: '30 mins',
        type: 'Video',
        description: 'Critical analysis of standardized scores and confidence intervals.'
      },
      {
        id: 'ep-104',
        title: 'Defensible Statutory Advice Writing',
        duration: '40 mins',
        type: 'Video',
        description: 'Structuring Appendix D advice to withstand tribunal scrutiny.'
      },
      {
        id: 'ep-105',
        title: 'Supervision & Reflective Practice',
        duration: '20 mins',
        type: 'Reading',
        description: 'Using the platform for peer supervision and CPD logging.'
      }
    ],
    resources: [
      { title: 'ECCA Administration Manual', type: 'PDF', url: '#' },
      { title: 'Report Writing Templates', type: 'DOCX', url: '#' },
      { title: 'Cognitive Profile Analyzer', type: 'Tool', url: '#' }
    ]
  },
  'researcher-training': {
    id: 'researcher-training',
    title: 'Educational Data Science',
    description: 'Leverage the platform for large-scale educational research. Learn to design longitudinal studies, manage ethical consent, and export anonymized datasets for analysis.',
    lessons: [
      {
        id: 'res-101',
        title: 'Study Design & Cohort Selection',
        duration: '25 mins',
        type: 'Video',
        description: 'Defining inclusion criteria and sampling methodologies within the platform.'
      },
      {
        id: 'res-102',
        title: 'Ethics, Consent & Anonymization',
        duration: '30 mins',
        type: 'Video',
        description: 'Managing digital consent forms and GDPR-compliant data stripping.'
      },
      {
        id: 'res-103',
        title: 'Longitudinal Data Tracking',
        duration: '20 mins',
        type: 'Workshop',
        description: 'Setting up time-series data collection points.'
      },
      {
        id: 'res-104',
        title: 'Exporting to SPSS, R, and Python',
        duration: '15 mins',
        type: 'Video',
        description: 'Data structure formats and cleaning pipelines.'
      }
    ],
    resources: [
      { title: 'Research Ethics Application Template', type: 'DOCX', url: '#' },
      { title: 'Data Dictionary', type: 'PDF', url: '#' },
      { title: 'R Analysis Scripts', type: 'ZIP', url: '#' }
    ]
  },
  'integration-training': {
    id: 'integration-training',
    title: 'Technical Integration Specialist',
    description: 'For IT professionals and Systems Integrators. Master the API, Webhooks, and SSO configurations to weave EdPsych Connect into your digital ecosystem.',
    lessons: [
      {
        id: 'int-101',
        title: 'API Authentication & Rate Limiting',
        duration: '20 mins',
        type: 'Video',
        description: 'Implementing OAuth2 flows and handling token rotation.'
      },
      {
        id: 'int-102',
        title: 'Wonde & CTF Data Sync',
        duration: '35 mins',
        type: 'Video',
        description: 'Configuring automated student data synchronization pipelines.'
      },
      {
        id: 'int-103',
        title: 'Webhooks & Event Architecture',
        duration: '25 mins',
        type: 'Workshop',
        description: 'Building real-time triggers for assessment completion events.'
      },
      {
        id: 'int-104',
        title: 'SSO Configuration (Azure AD / Google)',
        duration: '20 mins',
        type: 'Video',
        description: 'Setting up SAML 2.0 and OIDC identity providers.'
      }
    ],
    resources: [
      { title: 'API Reference Documentation', type: 'Link', url: '#' },
      { title: 'Postman Collection', type: 'JSON', url: '#' },
      { title: 'Swagger/OpenAPI Spec', type: 'YAML', url: '#' }
    ]
  }
};
