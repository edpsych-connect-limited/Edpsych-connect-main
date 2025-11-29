/**
 * UK Healthcare Terminology Constants
 * 
 * This file defines healthcare terminology constants and code systems
 * used for FHIR integration in the UK context.
 */

// Base URIs for code systems
export const UK_SNOMED_SYSTEM = 'http://snomed.info/sct';
export const UK_READ_SYSTEM = 'http://read.info/readv2';
export const UK_CORE_PROFILE_BASE = 'https://fhir.nhs.uk/StructureDefinition';
export const EDU_EXTENSION_SYSTEM = 'https://edpsych-connect.org/fhir/extensions';

// UK Ethnic Categories (based on NHS Data Dictionary)
export const UK_ETHNIC_CATEGORIES: Record<string, string> = {
  'A': 'British, Mixed British',
  'B': 'Irish',
  'C': 'Any other White background',
  'D': 'White and Black Caribbean',
  'E': 'White and Black African',
  'F': 'White and Asian',
  'G': 'Any other mixed background',
  'H': 'Indian',
  'J': 'Pakistani',
  'K': 'Bangladeshi',
  'L': 'Any other Asian background',
  'M': 'Caribbean',
  'N': 'African',
  'P': 'Any other Black background',
  'R': 'Chinese',
  'S': 'Any other ethnic group',
  'Z': 'Not stated'
};

// UK Special Educational Needs (SEN) Categories
export const UK_SEN_CATEGORIES: Record<string, string> = {
  'SPLD': 'Specific Learning Difficulty',
  'MLD': 'Moderate Learning Difficulty',
  'SLD': 'Severe Learning Difficulty',
  'PMLD': 'Profound and Multiple Learning Difficulty',
  'SEMH': 'Social, Emotional and Mental Health',
  'SLCN': 'Speech, Language and Communication Needs',
  'ASD': 'Autistic Spectrum Disorder',
  'VI': 'Visual Impairment',
  'HI': 'Hearing Impairment',
  'MSI': 'Multi-Sensory Impairment',
  'PD': 'Physical Disability',
  'OTH': 'Other Difficulty/Disability',
  'NSA': 'SEN support but no specialist assessment'
};

// UK Key Stages
export const UK_KEY_STAGES: Record<string, string> = {
  'EYFS': 'Early Years Foundation Stage',
  'KS1': 'Key Stage 1',
  'KS2': 'Key Stage 2',
  'KS3': 'Key Stage 3',
  'KS4': 'Key Stage 4',
  'KS5': 'Key Stage 5 (Sixth Form)'
};

// NHS Digital Organization Types
export const NHS_ORGANIZATION_TYPES: Record<string, string> = {
  'PR': 'Provider',
  'CT': 'Commissioner',
  'HB': 'Health Board',
  'LA': 'Local Authority',
  'TR': 'NHS Trust',
  'FT': 'NHS Foundation Trust',
  'PCT': 'Primary Care Trust',
  'CCG': 'Clinical Commissioning Group',
  'GPP': 'GP Practice'
};

// Mental Health Assessment Types
export const MENTAL_HEALTH_ASSESSMENT_TYPES: Record<string, string> = {
  'SDQ': 'Strengths and Difficulties Questionnaire',
  'RCADS': 'Revised Children\'s Anxiety and Depression Scale',
  'WEMWBS': 'Warwick-Edinburgh Mental Wellbeing Scale',
  'PHQ9': 'Patient Health Questionnaire-9',
  'GAD7': 'Generalised Anxiety Disorder Assessment-7',
  'CORS': 'Child Outcome Rating Scale',
  'CGAS': 'Children\'s Global Assessment Scale',
  'HONOS': 'Health of the Nation Outcome Scales'
};

// Educational Assessment Types
export const EDUCATIONAL_ASSESSMENT_TYPES: Record<string, string> = {
  'SAT': 'Standard Assessment Tests',
  'GCSE': 'General Certificate of Secondary Education',
  'ALEVEL': 'Advanced Level',
  'READING': 'Reading Assessment',
  'SPELLING': 'Spelling Assessment',
  'MATHS': 'Mathematics Assessment',
  'WRITING': 'Writing Assessment',
  'COGNITIVE': 'Cognitive Ability Test',
  'BEHAVIOR': 'Behaviour Assessment',
  'SOCIAL': 'Social Skills Assessment'
};

// Educational Settings
export const EDUCATIONAL_SETTINGS: Record<string, string> = {
  'MAINSTREAM': 'Mainstream School',
  'SPECIAL': 'Special School',
  'RESOURCE': 'Resource Provision within Mainstream',
  'PRU': 'Pupil Referral Unit',
  'HOSPITAL': 'Hospital School',
  'HOME': 'Home Education',
  'COLLEGE': 'Further Education College',
  'UNIVERSITY': 'University'
};

// NHS Clinical Terms (using simplified subset)
export const NHS_CLINICAL_TERMS: Record<string, string> = {
  'DYSL': 'Dyslexia',
  'DYSC': 'Dyscalculia',
  'DYSG': 'Dysgraphia',
  'ADHD': 'Attention Deficit Hyperactivity Disorder',
  'ASD': 'Autism Spectrum Disorder',
  'ANX': 'Anxiety',
  'DEP': 'Depression',
  'OCD': 'Obsessive Compulsive Disorder',
  'PTSD': 'Post-Traumatic Stress Disorder',
  'CD': 'Conduct Disorder',
  'ODD': 'Oppositional Defiant Disorder',
  'SP': 'Specific Phobia',
  'SAD': 'Social Anxiety Disorder',
  'SLD': 'Speech and Language Disorder'
};