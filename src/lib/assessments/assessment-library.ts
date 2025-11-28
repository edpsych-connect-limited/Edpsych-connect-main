import { logger } from "@/lib/logger";
/**
 * Assessment Library
 * Task 3.2.1: Comprehensive Assessment Templates
 *
 * Copyright-safe assessment framework for Educational Psychologists
 * 50+ evidence-based assessment templates across all domains
 *
 * IMPORTANT: These are assessment frameworks and recording tools,
 * not copyrighted assessment instruments. EPs can record observations
 * and scores from standardized assessments they're qualified to administer.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface AssessmentTemplate {
  id: string;
  name: string;
  category: AssessmentCategory;
  subcategory: string;
  description: string;
  age_range: string;
  administration_time: string; // in minutes
  purpose: string;
  domains: AssessmentDomain[];
  qualification_required: QualificationLevel;
  is_standardized: boolean;
  norm_referenced: boolean;
  scoring_method: 'manual' | 'automated' | 'hybrid';
  sections: AssessmentSection[];
  interpretation_guidelines: string[];
  references: string[];
  tags: string[];
}

export type AssessmentCategory =
  | 'cognitive'
  | 'language_communication'
  | 'literacy'
  | 'numeracy'
  | 'social_emotional'
  | 'behavioural'
  | 'adaptive'
  | 'developmental'
  | 'sensory'
  | 'executive_function'
  | 'observation'
  | 'screening';

export type AssessmentDomain =
  | 'verbal_comprehension'
  | 'perceptual_reasoning'
  | 'working_memory'
  | 'processing_speed'
  | 'reading'
  | 'writing'
  | 'spelling'
  | 'numeracy'
  | 'receptive_language'
  | 'expressive_language'
  | 'pragmatic_language'
  | 'attention'
  | 'hyperactivity'
  | 'impulsivity'
  | 'emotional_regulation'
  | 'social_skills'
  | 'adaptive_behaviour'
  | 'motor_skills'
  | 'sensory_processing';

export type QualificationLevel =
  | 'none' // observations, checklists
  | 'teacher' // teacher-administered
  | 'senco' // SENCO level
  | 'ep' // Educational Psychologist
  | 'specialist'; // Clinical/Specialist EP

export interface AssessmentSection {
  section_id: string;
  title: string;
  description: string;
  items: AssessmentItem[];
  scoring_instructions?: string;
}

export interface AssessmentItem {
  item_id: string;
  question_text: string;
  item_type: 'multiple_choice' | 'rating_scale' | 'yes_no' | 'text' | 'numeric' | 'observation';
  options?: string[];
  rating_scale?: {
    min: number;
    max: number;
    labels: { value: number; label: string }[];
  };
  scoring_value?: number;
  domain: AssessmentDomain;
}

// ============================================================================
// ASSESSMENT LIBRARY - 50+ TEMPLATES
// ============================================================================

export const ASSESSMENT_LIBRARY: AssessmentTemplate[] = [
  // ==========================================================================
  // COGNITIVE ASSESSMENTS (Copyright-safe recording frameworks)
  // ==========================================================================

  {
    id: 'cognitive-profile-recording',
    name: 'Cognitive Profile Recording Form',
    category: 'cognitive',
    subcategory: 'General Ability',
    description: 'Framework for recording standardized cognitive assessment results administered by qualified EPs',
    age_range: '6-16',
    administration_time: '60-90',
    purpose: 'Record results from standardized cognitive assessments (WISC, BAS, WASI, etc.)',
    domains: ['verbal_comprehension', 'perceptual_reasoning', 'working_memory', 'processing_speed'],
    qualification_required: 'ep',
    is_standardized: true,
    norm_referenced: true,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'verbal-comp',
        title: 'Verbal Comprehension Index',
        description: 'Record scores from verbal reasoning subtests',
        items: [
          {
            item_id: 'vc-1',
            question_text: 'Similarities Raw Score',
            item_type: 'numeric',
            domain: 'verbal_comprehension',
          },
          {
            item_id: 'vc-2',
            question_text: 'Vocabulary Raw Score',
            item_type: 'numeric',
            domain: 'verbal_comprehension',
          },
          {
            item_id: 'vc-3',
            question_text: 'Comprehension Raw Score',
            item_type: 'numeric',
            domain: 'verbal_comprehension',
          },
          {
            item_id: 'vc-composite',
            question_text: 'Verbal Comprehension Index Score',
            item_type: 'numeric',
            domain: 'verbal_comprehension',
          },
        ],
      },
      {
        section_id: 'perceptual-reasoning',
        title: 'Perceptual Reasoning Index',
        description: 'Record scores from non-verbal reasoning subtests',
        items: [
          {
            item_id: 'pr-1',
            question_text: 'Block Design Raw Score',
            item_type: 'numeric',
            domain: 'perceptual_reasoning',
          },
          {
            item_id: 'pr-2',
            question_text: 'Matrix Reasoning Raw Score',
            item_type: 'numeric',
            domain: 'perceptual_reasoning',
          },
          {
            item_id: 'pr-composite',
            question_text: 'Perceptual Reasoning Index Score',
            item_type: 'numeric',
            domain: 'perceptual_reasoning',
          },
        ],
      },
      {
        section_id: 'working-memory',
        title: 'Working Memory Index',
        description: 'Record scores from working memory subtests',
        items: [
          {
            item_id: 'wm-1',
            question_text: 'Digit Span Raw Score',
            item_type: 'numeric',
            domain: 'working_memory',
          },
          {
            item_id: 'wm-2',
            question_text: 'Letter-Number Sequencing Raw Score',
            item_type: 'numeric',
            domain: 'working_memory',
          },
          {
            item_id: 'wm-composite',
            question_text: 'Working Memory Index Score',
            item_type: 'numeric',
            domain: 'working_memory',
          },
        ],
      },
      {
        section_id: 'processing-speed',
        title: 'Processing Speed Index',
        description: 'Record scores from processing speed subtests',
        items: [
          {
            item_id: 'ps-1',
            question_text: 'Coding Raw Score',
            item_type: 'numeric',
            domain: 'processing_speed',
          },
          {
            item_id: 'ps-2',
            question_text: 'Symbol Search Raw Score',
            item_type: 'numeric',
            domain: 'processing_speed',
          },
          {
            item_id: 'ps-composite',
            question_text: 'Processing Speed Index Score',
            item_type: 'numeric',
            domain: 'processing_speed',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'Standard scores have M=100, SD=15',
      'Average range: 85-115',
      'Clinically significant discrepancy: >23 points between indices',
      'Consider confidence intervals when interpreting',
      'Compare to educational attainment for diagnostic clarity',
    ],
    references: [
      'Wechsler, D. (2014). WISC-V Technical Manual',
      'Elliott, C.D. & Smith, P. (2011). BAS-III Administration Guide',
    ],
    tags: ['cognitive', 'IQ', 'standardized', 'ep-only'],
  },

  // ==========================================================================
  // LITERACY ASSESSMENTS
  // ==========================================================================

  {
    id: 'reading-accuracy-recording',
    name: 'Reading Accuracy Assessment',
    category: 'literacy',
    subcategory: 'Reading',
    description: 'Recording framework for standardized reading accuracy measures',
    age_range: '5-16',
    administration_time: '15-20',
    purpose: 'Record single word reading accuracy from standardized assessments',
    domains: ['reading'],
    qualification_required: 'teacher',
    is_standardized: true,
    norm_referenced: true,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'word-reading',
        title: 'Word Reading Test',
        description: 'Record scores from single word reading assessment (e.g., WRAT, TOWRE)',
        items: [
          {
            item_id: 'wr-raw',
            question_text: 'Raw Score (words read correctly)',
            item_type: 'numeric',
            domain: 'reading',
          },
          {
            item_id: 'wr-standard',
            question_text: 'Standard Score',
            item_type: 'numeric',
            domain: 'reading',
          },
          {
            item_id: 'wr-age-equivalent',
            question_text: 'Reading Age Equivalent',
            item_type: 'text',
            domain: 'reading',
          },
          {
            item_id: 'wr-errors',
            question_text: 'Error Analysis (common error patterns)',
            item_type: 'text',
            domain: 'reading',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'Compare reading age to chronological age',
      'Analyze error patterns (phonetic vs. visual)',
      'Consider fluency as well as accuracy',
      'Link to phonological awareness if discrepancy identified',
    ],
    references: ['TOWRE-2 Manual', 'York Assessment of Reading for Comprehension'],
    tags: ['literacy', 'reading', 'dyslexia', 'screening'],
  },

  {
    id: 'reading-comprehension-assessment',
    name: 'Reading Comprehension Assessment',
    category: 'literacy',
    subcategory: 'Reading',
    description: 'Assess understanding of written text across complexity levels',
    age_range: '7-16',
    administration_time: '20-30',
    purpose: 'Evaluate literal and inferential comprehension skills',
    domains: ['reading'],
    qualification_required: 'teacher',
    is_standardized: true,
    norm_referenced: true,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'comprehension',
        title: 'Reading Comprehension',
        description: 'Record scores from standardized comprehension assessment (e.g., YARC, NGRT)',
        items: [
          {
            item_id: 'rc-raw',
            question_text: 'Raw Score',
            item_type: 'numeric',
            domain: 'reading',
          },
          {
            item_id: 'rc-standard',
            question_text: 'Standard Score',
            item_type: 'numeric',
            domain: 'reading',
          },
          {
            item_id: 'rc-literal',
            question_text: 'Literal Comprehension Subscore',
            item_type: 'numeric',
            domain: 'reading',
          },
          {
            item_id: 'rc-inferential',
            question_text: 'Inferential Comprehension Subscore',
            item_type: 'numeric',
            domain: 'reading',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'Consider discrepancy between decoding and comprehension',
      'Evaluate vocabulary knowledge alongside comprehension',
      'Assess background knowledge impact',
    ],
    references: ['YARC Manual', 'NGRT Technical Manual'],
    tags: ['literacy', 'reading', 'comprehension'],
  },

  {
    id: 'spelling-assessment',
    name: 'Spelling Ability Assessment',
    category: 'literacy',
    subcategory: 'Writing',
    description: 'Record standardized spelling assessment results',
    age_range: '6-16',
    administration_time: '15-20',
    purpose: 'Assess phonological and orthographic spelling skills',
    domains: ['spelling', 'writing'],
    qualification_required: 'teacher',
    is_standardized: true,
    norm_referenced: true,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'spelling',
        title: 'Spelling Test',
        description: 'Record scores from standardized spelling assessment',
        items: [
          {
            item_id: 'sp-raw',
            question_text: 'Raw Score (words spelled correctly)',
            item_type: 'numeric',
            domain: 'spelling',
          },
          {
            item_id: 'sp-standard',
            question_text: 'Standard Score',
            item_type: 'numeric',
            domain: 'spelling',
          },
          {
            item_id: 'sp-age',
            question_text: 'Spelling Age',
            item_type: 'text',
            domain: 'spelling',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'Analyze error types (phonetic, visual, morphological)',
      'Consider impact on written expression',
      'Link to reading accuracy patterns',
    ],
    references: ['Single Word Spelling Test Manual'],
    tags: ['literacy', 'spelling', 'dyslexia'],
  },

  // ==========================================================================
  // NUMERACY ASSESSMENTS
  // ==========================================================================

  {
    id: 'maths-attainment-recording',
    name: 'Mathematics Attainment Recording',
    category: 'numeracy',
    subcategory: 'General Numeracy',
    description: 'Framework for recording standardized maths assessment results',
    age_range: '5-16',
    administration_time: '30-40',
    purpose: 'Record mathematical reasoning and procedural skills',
    domains: ['numeracy'],
    qualification_required: 'teacher',
    is_standardized: true,
    norm_referenced: true,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'numeracy',
        title: 'Mathematics Assessment',
        description: 'Record scores from standardized maths assessment',
        items: [
          {
            item_id: 'math-raw',
            question_text: 'Raw Score',
            item_type: 'numeric',
            domain: 'numeracy',
          },
          {
            item_id: 'math-standard',
            question_text: 'Standard Score',
            item_type: 'numeric',
            domain: 'numeracy',
          },
          {
            item_id: 'math-age',
            question_text: 'Maths Age Equivalent',
            item_type: 'text',
            domain: 'numeracy',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'Compare maths age to reading age and chronological age',
      'Consider working memory impact on calculation',
      'Assess conceptual understanding vs. procedural skills',
    ],
    references: ['WOND Manual', 'NFER Maths Tests'],
    tags: ['numeracy', 'dyscalculia', 'maths'],
  },

  // ==========================================================================
  // LANGUAGE & COMMUNICATION ASSESSMENTS
  // ==========================================================================

  {
    id: 'receptive-language-assessment',
    name: 'Receptive Language Assessment',
    category: 'language_communication',
    subcategory: 'Receptive Language',
    description: 'Assess understanding of spoken language',
    age_range: '4-16',
    administration_time: '15-25',
    purpose: 'Evaluate comprehension of vocabulary and grammar',
    domains: ['receptive_language'],
    qualification_required: 'ep',
    is_standardized: true,
    norm_referenced: true,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'receptive',
        title: 'Receptive Language',
        description: 'Record scores from receptive language assessment (e.g., BPVS, CELF)',
        items: [
          {
            item_id: 'rl-raw',
            question_text: 'Raw Score',
            item_type: 'numeric',
            domain: 'receptive_language',
          },
          {
            item_id: 'rl-standard',
            question_text: 'Standard Score',
            item_type: 'numeric',
            domain: 'receptive_language',
          },
          {
            item_id: 'rl-age',
            question_text: 'Language Age Equivalent',
            item_type: 'text',
            domain: 'receptive_language',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'Compare receptive and expressive language abilities',
      'Consider impact on academic learning',
      'Assess need for speech and language therapy input',
    ],
    references: ['BPVS-3 Manual', 'CELF-5 UK Manual'],
    tags: ['language', 'expressive_language', 'SLCN'],
  },

  {
    id: 'expressive-language-assessment',
    name: 'Expressive Language Assessment',
    category: 'language_communication',
    subcategory: 'Expressive Language',
    description: 'Assess spoken language production',
    age_range: '4-16',
    administration_time: '20-30',
    purpose: 'Evaluate vocabulary usage, grammar, and narrative skills',
    domains: ['expressive_language'],
    qualification_required: 'ep',
    is_standardized: true,
    norm_referenced: true,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'expressive',
        title: 'Expressive Language',
        description: 'Record scores from expressive language assessment',
        items: [
          {
            item_id: 'el-raw',
            question_text: 'Raw Score',
            item_type: 'numeric',
            domain: 'expressive_language',
          },
          {
            item_id: 'el-standard',
            question_text: 'Standard Score',
            item_type: 'numeric',
            domain: 'expressive_language',
          },
          {
            item_id: 'el-age',
            question_text: 'Language Age Equivalent',
            item_type: 'text',
            domain: 'expressive_language',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'Consider discrepancy with receptive language',
      'Assess sentence complexity and grammar',
      'Evaluate word-finding difficulties',
    ],
    references: ['CELF-5 Manual', 'TROG-2 Manual'],
    tags: ['language', 'expressive_language', 'SLCN'],
  },

  // ==========================================================================
  // SOCIAL-EMOTIONAL & BEHAVIORAL ASSESSMENTS
  // ==========================================================================

  {
    id: 'sdq-teacher',
    name: 'Strengths and Difficulties Questionnaire (Teacher)',
    category: 'social_emotional',
    subcategory: 'Behavioural Screening',
    description: 'Brief behavioural screening questionnaire - teacher version',
    age_range: '4-17',
    administration_time: '5-10',
    purpose: 'Screen for emotional and behavioural difficulties',
    domains: ['emotional_regulation', 'social_skills', 'attention', 'hyperactivity'],
    qualification_required: 'teacher',
    is_standardized: true,
    norm_referenced: true,
    scoring_method: 'automated',
    sections: [
      {
        section_id: 'sdq-emotional',
        title: 'Emotional Symptoms',
        description: 'Questions about emotional wellbeing',
        items: [
          {
            item_id: 'sdq-e1',
            question_text: 'Often complains of headaches, stomach-aches',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Not True' },
                { value: 1, label: 'Somewhat True' },
                { value: 2, label: 'Certainly True' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'sdq-e2',
            question_text: 'Many worries, often seems worried',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Not True' },
                { value: 1, label: 'Somewhat True' },
                { value: 2, label: 'Certainly True' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'sdq-e3',
            question_text: 'Often unhappy, down-hearted or tearful',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Not True' },
                { value: 1, label: 'Somewhat True' },
                { value: 2, label: 'Certainly True' },
              ],
            },
            domain: 'emotional_regulation',
          },
        ],
      },
      {
        section_id: 'sdq-conduct',
        title: 'Conduct Problems',
        description: 'Questions about behaviour',
        items: [
          {
            item_id: 'sdq-c1',
            question_text: 'Often has temper tantrums or hot tempers',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Not True' },
                { value: 1, label: 'Somewhat True' },
                { value: 2, label: 'Certainly True' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'sdq-c2',
            question_text: 'Generally obedient, usually does what adults request',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Not True' },
                { value: 1, label: 'Somewhat True' },
                { value: 2, label: 'Certainly True' },
              ],
            },
            domain: 'emotional_regulation',
          },
        ],
      },
      {
        section_id: 'sdq-hyperactivity',
        title: 'Hyperactivity/Inattention',
        description: 'Questions about attention and activity level',
        items: [
          {
            item_id: 'sdq-h1',
            question_text: 'Restless, overactive, cannot stay still for long',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Not True' },
                { value: 1, label: 'Somewhat True' },
                { value: 2, label: 'Certainly True' },
              ],
            },
            domain: 'hyperactivity',
          },
          {
            item_id: 'sdq-h2',
            question_text: 'Constantly fidgeting or squirming',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Not True' },
                { value: 1, label: 'Somewhat True' },
                { value: 2, label: 'Certainly True' },
              ],
            },
            domain: 'hyperactivity',
          },
          {
            item_id: 'sdq-h3',
            question_text: 'Easily distracted, concentration wanders',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Not True' },
                { value: 1, label: 'Somewhat True' },
                { value: 2, label: 'Certainly True' },
              ],
            },
            domain: 'attention',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'Total Difficulties Score: sum of 4 subscales (not Prosocial)',
      'Close to average: 0-13, Slightly raised: 14-16, High: 17-19, Very high: 20-40',
      'SDQ is a screening tool, not a diagnostic instrument',
      'Compare teacher and parent ratings for consistency',
    ],
    references: ['Goodman, R. (1997). SDQ Manual', 'www.sdqinfo.org'],
    tags: ['behavioural', 'screening', 'SDQ'],
  },

  // ==========================================================================
  // ATTENTION & EXECUTIVE FUNCTION
  // ==========================================================================

  {
    id: 'attention-observation-checklist',
    name: 'Classroom Attention Observation Checklist',
    category: 'executive_function',
    subcategory: 'Attention',
    description: 'Structured observation of attention skills in classroom setting',
    age_range: '5-16',
    administration_time: '30-45',
    purpose: 'Document attention patterns during learning activities',
    domains: ['attention', 'working_memory'],
    qualification_required: 'teacher',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'sustained-attention',
        title: 'Sustained Attention',
        description: 'Ability to maintain focus over time',
        items: [
          {
            item_id: 'att-1',
            question_text: 'Completes tasks without frequent breaks',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 5,
              labels: [
                { value: 1, label: 'Never' },
                { value: 2, label: 'Rarely' },
                { value: 3, label: 'Sometimes' },
                { value: 4, label: 'Often' },
                { value: 5, label: 'Always' },
              ],
            },
            domain: 'attention',
          },
          {
            item_id: 'att-2',
            question_text: 'Maintains attention during whole-class teaching',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 5,
              labels: [
                { value: 1, label: 'Never' },
                { value: 3, label: 'Sometimes' },
                { value: 5, label: 'Always' },
              ],
            },
            domain: 'attention',
          },
        ],
      },
      {
        section_id: 'selective-attention',
        title: 'Selective Attention',
        description: 'Ability to filter distractions',
        items: [
          {
            item_id: 'att-3',
            question_text: 'Ignores classroom distractions (noise, movement)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 5,
              labels: [
                { value: 1, label: 'Never' },
                { value: 3, label: 'Sometimes' },
                { value: 5, label: 'Always' },
              ],
            },
            domain: 'attention',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'Scores 1-2: Significant attention difficulties',
      'Scores 3: Moderate difficulties',
      'Scores 4-5: Age-appropriate attention',
      'Consider environmental modifications before referral',
    ],
    references: ['Classroom observation protocols'],
    tags: ['attention', 'ADHD', 'observation', 'executive-function'],
  },

  // ==========================================================================
  // ADAPTIVE BEHAVIOR
  // ==========================================================================

  {
    id: 'adaptive-behaviour-checklist',
    name: 'Adaptive Behaviour Skills Inventory',
    category: 'adaptive',
    subcategory: 'Daily Living Skills',
    description: 'Assessment of practical life skills and independence',
    age_range: '5-18',
    administration_time: '20-30',
    purpose: 'Evaluate self-care, social, and practical skills',
    domains: ['adaptive_behaviour', 'social_skills'],
    qualification_required: 'teacher',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'self-care',
        title: 'Self-Care Skills',
        description: 'Personal hygiene and self-management',
        items: [
          {
            item_id: 'ada-1',
            question_text: 'Independently manages personal hygiene',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Needs full support' },
                { value: 2, label: 'Needs frequent support' },
                { value: 3, label: 'Needs occasional support' },
                { value: 4, label: 'Fully independent' },
              ],
            },
            domain: 'adaptive_behaviour',
          },
        ],
      },
      {
        section_id: 'social-adaptive',
        title: 'Social Skills',
        description: 'Interpersonal and communication skills',
        items: [
          {
            item_id: 'ada-2',
            question_text: 'Initiates and maintains peer relationships',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Significant difficulty' },
                { value: 2, label: 'Some difficulty' },
                { value: 3, label: 'Mostly successful' },
                { value: 4, label: 'Age-appropriate' },
              ],
            },
            domain: 'social_skills',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'Adaptive behaviour crucial for EHCP eligibility',
      'Compare across settings (home, school, community)',
      'Identify specific skill gaps for intervention planning',
    ],
    references: ['Vineland Adaptive Behaviour Scales framework'],
    tags: ['adaptive', 'independence', 'life-skills'],
  },

  // ==========================================================================
  // DEVELOPMENTAL ASSESSMENTS
  // ==========================================================================

  {
    id: 'early-years-observation',
    name: 'Early Years Development Observation',
    category: 'developmental',
    subcategory: 'Early Years',
    description: 'Structured observation framework for EYFS children',
    age_range: '2-5',
    administration_time: '45-60',
    purpose: 'Document developmental progress across EYFS areas',
    domains: ['motor_skills', 'social_skills', 'receptive_language', 'expressive_language'],
    qualification_required: 'teacher',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'communication-language',
        title: 'Communication and Language',
        description: 'Listening, understanding, speaking',
        items: [
          {
            item_id: 'dev-1',
            question_text: 'Understands simple instructions',
            item_type: 'yes_no',
            domain: 'receptive_language',
          },
          {
            item_id: 'dev-2',
            question_text: 'Uses sentences to express ideas',
            item_type: 'yes_no',
            domain: 'expressive_language',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'Compare to EYFS Development Matters guidance',
      'Identify areas of delay for targeted support',
      'Consider referral to SLT if language concerns',
    ],
    references: ['EYFS Development Matters 2021'],
    tags: ['early-years', 'developmental', 'EYFS'],
  },

  // ==========================================================================
  // SENSORY PROCESSING
  // ==========================================================================

  {
    id: 'sensory-profile-classroom',
    name: 'Sensory Processing Classroom Observation',
    category: 'sensory',
    subcategory: 'Sensory Processing',
    description: 'Observe sensory responses in educational environment',
    age_range: '5-16',
    administration_time: '30',
    purpose: 'Identify sensory processing patterns affecting learning',
    domains: ['sensory_processing'],
    qualification_required: 'teacher',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'sensory',
        title: 'Sensory Responses',
        description: 'Reactions to sensory input',
        items: [
          {
            item_id: 'sens-1',
            question_text: 'Seeks or avoids tactile input',
            item_type: 'multiple_choice',
            options: ['Seeks', 'Avoids', 'Typical', 'Not observed'],
            domain: 'sensory_processing',
          },
          {
            item_id: 'sens-2',
            question_text: 'Response to auditory stimuli',
            item_type: 'multiple_choice',
            options: ['Over-responsive', 'Under-responsive', 'Typical', 'Not observed'],
            domain: 'sensory_processing',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'Sensory differences common in autism, ADHD',
      'Consider OT referral if significant impact',
      'Environmental modifications often helpful',
    ],
    references: ['Sensory Profile-2 framework'],
    tags: ['sensory', 'autism', 'occupational-therapy'],
  },

  // ============================================================================
  // ADHD & ATTENTION ASSESSMENTS
  // ============================================================================

  {
    id: 'conners-rating-scale-recording',
    name: 'ADHD Rating Scale Recording Template',
    category: 'behavioural',
    subcategory: 'ADHD',
    description: 'Recording template for ADHD rating scales (Conners, SNAP-IV, or similar) with sections for inattention, hyperactivity, and impulsivity',
    age_range: '3-17',
    administration_time: '15-20',
    purpose: 'Record and analyze ADHD symptom ratings from teachers, parents, and self-report',
    domains: ['attention', 'hyperactivity', 'impulsivity'],
    qualification_required: 'teacher',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'inattention-symptoms',
        title: 'Inattention Symptoms',
        description: 'DSM-5 inattention criteria',
        items: [
          {
            item_id: 'inat-1',
            question_text: 'Fails to give close attention to details or makes careless mistakes',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/Rarely' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Very Often' },
              ],
            },
            domain: 'attention',
          },
          {
            item_id: 'inat-2',
            question_text: 'Has difficulty sustaining attention in tasks or play',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/Rarely' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Very Often' },
              ],
            },
            domain: 'attention',
          },
          {
            item_id: 'inat-3',
            question_text: 'Does not seem to listen when spoken to directly',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/Rarely' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Very Often' },
              ],
            },
            domain: 'attention',
          },
        ],
        scoring_instructions: 'Sum all item scores. Score ≥6 indicates clinically significant inattention symptoms',
      },
      {
        section_id: 'hyperactivity-impulsivity',
        title: 'Hyperactivity-Impulsivity Symptoms',
        description: 'DSM-5 hyperactivity and impulsivity criteria',
        items: [
          {
            item_id: 'hyp-1',
            question_text: 'Fidgets with hands or feet or squirms in seat',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/Rarely' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Very Often' },
              ],
            },
            domain: 'hyperactivity',
          },
          {
            item_id: 'hyp-2',
            question_text: 'Leaves seat when remaining seated is expected',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/Rarely' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Very Often' },
              ],
            },
            domain: 'hyperactivity',
          },
          {
            item_id: 'imp-1',
            question_text: 'Blurts out answers before questions have been completed',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/Rarely' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Very Often' },
              ],
            },
            domain: 'impulsivity',
          },
        ],
        scoring_instructions: 'Sum all item scores. Score ≥6 indicates clinically significant hyperactivity-impulsivity symptoms',
      },
    ],
    interpretation_guidelines: [
      'Compare ratings across informants (parents, teachers, self)',
      'Consider context effects (home vs. school)',
      'Assess functional impairment in multiple settings',
      'Rule out alternative explanations (anxiety, trauma, learning difficulties)',
      'Consider comorbidities (ASD, ODD, anxiety)',
    ],
    references: [
      'DSM-5 ADHD criteria',
      'Conners 3rd Edition',
      'SNAP-IV Teacher and Parent Rating Scale',
    ],
    tags: ['adhd', 'attention', 'hyperactivity', 'impulsivity', 'behaviour'],
  },

  {
    id: 'executive-function-behavioural-rating',
    name: 'Executive Function Behavioural Rating Scale',
    category: 'executive_function',
    subcategory: 'Daily Functioning',
    description: 'Teacher/parent rating of executive function skills in real-world contexts (BRIEF framework)',
    age_range: '5-18',
    administration_time: '15-20',
    purpose: 'Assess executive function difficulties as manifested in daily life',
    domains: ['working_memory', 'attention'],
    qualification_required: 'teacher',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'behaviour-regulation',
        title: 'Behavioural Regulation Index',
        description: 'Inhibitory control, flexibility, emotional control',
        items: [
          {
            item_id: 'br-inhibit',
            question_text: 'Has trouble waiting turn; interrupts others',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 3,
              labels: [
                { value: 1, label: 'Never' },
                { value: 2, label: 'Sometimes' },
                { value: 3, label: 'Often' },
              ],
            },
            domain: 'attention',
          },
          {
            item_id: 'br-shift',
            question_text: 'Resists or has trouble accepting a different way to solve a problem',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 3,
              labels: [
                { value: 1, label: 'Never' },
                { value: 2, label: 'Sometimes' },
                { value: 3, label: 'Often' },
              ],
            },
            domain: 'attention',
          },
          {
            item_id: 'br-emotional',
            question_text: 'Overreacts to small problems',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 3,
              labels: [
                { value: 1, label: 'Never' },
                { value: 2, label: 'Sometimes' },
                { value: 3, label: 'Often' },
              ],
            },
            domain: 'emotional_regulation',
          },
        ],
        scoring_instructions: 'Higher scores indicate greater executive function difficulties',
      },
      {
        section_id: 'metacognition',
        title: 'Metacognition Index',
        description: 'Initiation, planning, organization, working memory, monitoring',
        items: [
          {
            item_id: 'mc-initiate',
            question_text: 'Has trouble getting started on tasks',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 3,
              labels: [
                { value: 1, label: 'Never' },
                { value: 2, label: 'Sometimes' },
                { value: 3, label: 'Often' },
              ],
            },
            domain: 'working_memory',
          },
          {
            item_id: 'mc-wm',
            question_text: 'Forgets what was just said',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 3,
              labels: [
                { value: 1, label: 'Never' },
                { value: 2, label: 'Sometimes' },
                { value: 3, label: 'Often' },
              ],
            },
            domain: 'working_memory',
          },
          {
            item_id: 'mc-organize',
            question_text: 'Has a messy workspace or desk',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 3,
              labels: [
                { value: 1, label: 'Never' },
                { value: 2, label: 'Sometimes' },
                { value: 3, label: 'Often' },
              ],
            },
            domain: 'working_memory',
          },
        ],
        scoring_instructions: 'Higher scores indicate greater metacognitive difficulties',
      },
    ],
    interpretation_guidelines: [
      'Behavioral Regulation Index: inhibition, flexibility, emotional control',
      'Metacognition Index: working memory, planning, organization, monitoring',
      'Consider discrepancies between home and school ratings',
      'Link EF difficulties to academic and social functioning',
    ],
    references: [
      'Gioia et al. (2000). BRIEF - Behavior Rating Inventory of Executive Function',
      'Diamond (2013). Executive Functions framework',
    ],
    tags: ['executive-function', 'planning', 'organization', 'self-regulation'],
  },

  {
    id: 'phonological-awareness-assessment',
    name: 'Phonological Awareness Skills Assessment',
    category: 'literacy',
    subcategory: 'Reading Foundation',
    description: 'Assessment of phonological awareness skills critical for reading development',
    age_range: '4-8',
    administration_time: '20-30',
    purpose: 'Identify phonological processing strengths and weaknesses',
    domains: ['reading'],
    qualification_required: 'teacher',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'rhyme-awareness',
        title: 'Rhyme Recognition and Production',
        description: 'Ability to identify and generate rhymes',
        items: [
          {
            item_id: 'rhyme-recog',
            question_text: 'Can identify which words rhyme (e.g., "Which word rhymes with cat: hat, dog, sun?")',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Unable' },
                { value: 1, label: 'With support' },
                { value: 2, label: 'Mostly independent' },
                { value: 3, label: 'Consistently accurate' },
              ],
            },
            domain: 'reading',
          },
          {
            item_id: 'rhyme-prod',
            question_text: 'Can produce rhyming words (e.g., "Tell me a word that rhymes with dog")',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Unable' },
                { value: 1, label: 'With support' },
                { value: 2, label: 'Mostly independent' },
                { value: 3, label: 'Consistently accurate' },
              ],
            },
            domain: 'reading',
          },
        ],
        scoring_instructions: 'Assess developmentally: rhyme recognition typically emerges before production',
      },
      {
        section_id: 'syllable-awareness',
        title: 'Syllable Segmentation',
        description: 'Ability to segment words into syllables',
        items: [
          {
            item_id: 'syllable-count',
            question_text: 'Can count syllables in spoken words (e.g., "How many beats in banana?")',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Unable' },
                { value: 1, label: 'With support' },
                { value: 2, label: 'Mostly independent' },
                { value: 3, label: 'Consistently accurate' },
              ],
            },
            domain: 'reading',
          },
        ],
      },
      {
        section_id: 'phoneme-awareness',
        title: 'Phoneme Level Skills',
        description: 'Ability to identify, blend, and segment individual phonemes',
        items: [
          {
            item_id: 'phoneme-initial',
            question_text: 'Can identify initial sound in words (e.g., "What sound does dog start with?")',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Unable' },
                { value: 1, label: 'With support' },
                { value: 2, label: 'Mostly independent' },
                { value: 3, label: 'Consistently accurate' },
              ],
            },
            domain: 'reading',
          },
          {
            item_id: 'phoneme-blend',
            question_text: 'Can blend phonemes into words (e.g., "/c/ /a/ /t/ - what word?")',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Unable' },
                { value: 1, label: 'With support' },
                { value: 2, label: 'Mostly independent' },
                { value: 3, label: 'Consistently accurate' },
              ],
            },
            domain: 'reading',
          },
          {
            item_id: 'phoneme-segment',
            question_text: 'Can segment words into phonemes (e.g., "Tell me the sounds in cat")',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Unable' },
                { value: 1, label: 'With support' },
                { value: 2, label: 'Mostly independent' },
                { value: 3, label: 'Consistently accurate' },
              ],
            },
            domain: 'reading',
          },
        ],
        scoring_instructions: 'Phoneme-level skills are strongest predictor of reading success',
      },
    ],
    interpretation_guidelines: [
      'Developmental progression: rhyme → syllable → phoneme awareness',
      'Phoneme blending and segmentation critical for decoding',
      'Difficulties indicate risk for dyslexia/reading difficulties',
      'Phonological awareness is highly trainable through intervention',
    ],
    references: [
      'Wagner & Torgesen (1987) - Phonological awareness in reading',
      'Goswami & Bryant (1990) - Phonological Skills and Learning to Read',
      'UK Letters and Sounds framework',
    ],
    tags: ['phonological-awareness', 'literacy', 'dyslexia', 'reading-foundation'],
  },

  // ============================================================================
  // AUTISM SPECTRUM & SOCIAL COMMUNICATION ASSESSMENTS
  // ============================================================================

  {
    id: 'autism-observation-checklist',
    name: 'Autism Spectrum Observation Checklist',
    category: 'behavioural',
    subcategory: 'Autism',
    description: 'Structured observation checklist for autism spectrum characteristics across social communication, restricted interests, and sensory domains',
    age_range: '2-18',
    administration_time: '30-45',
    purpose: 'Systematic observation to inform autism assessment and referral decisions',
    domains: ['social_skills', 'pragmatic_language', 'sensory_processing'],
    qualification_required: 'senco',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'social-communication',
        title: 'Social Communication and Interaction',
        description: 'Social-emotional reciprocity, nonverbal communication, relationships',
        items: [
          {
            item_id: 'sc-reciprocity',
            question_text: 'Demonstrates back-and-forth conversation and shared interests',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Consistent with peers' },
                { value: 1, label: 'Some difficulties' },
                { value: 2, label: 'Marked difficulties' },
              ],
            },
            domain: 'social_skills',
          },
          {
            item_id: 'sc-nonverbal',
            question_text: 'Uses and understands nonverbal communication (eye contact, gestures, facial expressions)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Consistent with peers' },
                { value: 1, label: 'Some difficulties' },
                { value: 2, label: 'Marked difficulties' },
              ],
            },
            domain: 'social_skills',
          },
          {
            item_id: 'sc-relationships',
            question_text: 'Develops and maintains age-appropriate peer relationships',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Consistent with peers' },
                { value: 1, label: 'Some difficulties' },
                { value: 2, label: 'Marked difficulties' },
              ],
            },
            domain: 'social_skills',
          },
        ],
        scoring_instructions: 'Total score ≥4 indicates potential social communication difficulties warranting further assessment',
      },
      {
        section_id: 'restricted-repetitive',
        title: 'Restricted, Repetitive Patterns of Behavior, Interests, or Activities',
        description: 'Repetitive behaviours, insistence on sameness, fixed interests, sensory sensitivities',
        items: [
          {
            item_id: 'rr-repetitive',
            question_text: 'Shows repetitive motor movements, use of objects, or speech',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Not observed' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
              ],
            },
            domain: 'social_skills',
          },
          {
            item_id: 'rr-sameness',
            question_text: 'Insists on sameness, routines, or rituals; distressed by changes',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Not observed' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
              ],
            },
            domain: 'social_skills',
          },
          {
            item_id: 'rr-interests',
            question_text: 'Has highly restricted, fixated interests that are abnormal in intensity or focus',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Not observed' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
              ],
            },
            domain: 'social_skills',
          },
          {
            item_id: 'rr-sensory',
            question_text: 'Shows hyper- or hypo-reactivity to sensory input or unusual sensory interests',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Not observed' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
              ],
            },
            domain: 'sensory_processing',
          },
        ],
        scoring_instructions: 'Total score ≥4 indicates potential restricted/repetitive behaviours warranting further assessment',
      },
    ],
    interpretation_guidelines: [
      'Observe across multiple contexts (classroom, playground, unstructured time)',
      'Compare to age-matched peers',
      'Consider cultural and linguistic background',
      'This is a screening tool, not a diagnostic instrument',
      'High scores warrant referral for comprehensive autism diagnostic assessment',
      'Consider differential diagnoses (ADHD, anxiety, language disorder)',
    ],
    references: [
      'DSM-5 Autism Spectrum Disorder criteria',
      'ICD-11 Autism Spectrum Disorder',
      'NICE Autism Guidelines (UK)',
    ],
    tags: ['autism', 'asd', 'social-communication', 'neurodevelopmental'],
  },

  {
    id: 'social-skills-assessment',
    name: 'Social Skills and Peer Relationships Assessment',
    category: 'social_emotional',
    subcategory: 'Social Skills',
    description: 'Assessment of social skills, peer interactions, and relationship quality',
    age_range: '5-16',
    administration_time: '20-30',
    purpose: 'Identify social skills strengths and needs to guide intervention',
    domains: ['social_skills'],
    qualification_required: 'teacher',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'peer-interaction',
        title: 'Peer Interaction Skills',
        description: 'Initiating, maintaining, and responding to peer interactions',
        items: [
          {
            item_id: 'pi-initiate',
            question_text: 'Initiates interactions with peers appropriately',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Rarely/Never' },
                { value: 2, label: 'Sometimes' },
                { value: 3, label: 'Often' },
                { value: 4, label: 'Almost Always' },
              ],
            },
            domain: 'social_skills',
          },
          {
            item_id: 'pi-respond',
            question_text: 'Responds appropriately when peers initiate interaction',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Rarely/Never' },
                { value: 2, label: 'Sometimes' },
                { value: 3, label: 'Often' },
                { value: 4, label: 'Almost Always' },
              ],
            },
            domain: 'social_skills',
          },
          {
            item_id: 'pi-maintain',
            question_text: 'Maintains reciprocal interactions (takes turns, shows interest)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Rarely/Never' },
                { value: 2, label: 'Sometimes' },
                { value: 3, label: 'Often' },
                { value: 4, label: 'Almost Always' },
              ],
            },
            domain: 'social_skills',
          },
        ],
        scoring_instructions: 'Higher scores indicate stronger peer interaction skills',
      },
      {
        section_id: 'conflict-resolution',
        title: 'Conflict Resolution and Problem-Solving',
        description: 'Managing disagreements and social problems',
        items: [
          {
            item_id: 'cr-calm',
            question_text: 'Stays calm during disagreements or conflicts',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Rarely/Never' },
                { value: 2, label: 'Sometimes' },
                { value: 3, label: 'Often' },
                { value: 4, label: 'Almost Always' },
              ],
            },
            domain: 'social_skills',
          },
          {
            item_id: 'cr-solve',
            question_text: 'Suggests appropriate solutions to social problems',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Rarely/Never' },
                { value: 2, label: 'Sometimes' },
                { value: 3, label: 'Often' },
                { value: 4, label: 'Almost Always' },
              ],
            },
            domain: 'social_skills',
          },
        ],
      },
      {
        section_id: 'empathy-perspective',
        title: 'Empathy and Perspective-Taking',
        description: 'Understanding others\' feelings and viewpoints',
        items: [
          {
            item_id: 'ep-recognize',
            question_text: 'Recognizes and responds to others\' emotions',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Rarely/Never' },
                { value: 2, label: 'Sometimes' },
                { value: 3, label: 'Often' },
                { value: 4, label: 'Almost Always' },
              ],
            },
            domain: 'social_skills',
          },
          {
            item_id: 'ep-perspective',
            question_text: 'Can understand situations from another person\'s point of view',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Rarely/Never' },
                { value: 2, label: 'Sometimes' },
                { value: 3, label: 'Often' },
                { value: 4, label: 'Almost Always' },
              ],
            },
            domain: 'social_skills',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'Consider age-appropriate expectations for social skills',
      'Identify specific skill deficits for targeted intervention',
      'Consider cultural differences in social norms',
      'Link social skills to broader functioning (academic engagement, wellbeing)',
      'Social skills are teachable through explicit instruction and practice',
    ],
    references: [
      'Gresham & Elliott (2008) - Social Skills Improvement System',
      'Merrell (2002) - School Social Behavior Scales',
    ],
    tags: ['social-skills', 'peer-relationships', 'empathy', 'social-emotional'],
  },

  // ============================================================================
  // ANXIETY & EMOTIONAL WELLBEING ASSESSMENTS
  // ============================================================================

  {
    id: 'anxiety-screening-tool',
    name: 'Anxiety Screening Tool for Children and Young People',
    category: 'social_emotional',
    subcategory: 'Anxiety',
    description: 'Screening tool for identifying anxiety symptoms across multiple domains (generalized, social, separation, specific fears)',
    age_range: '6-18',
    administration_time: '10-15',
    purpose: 'Screen for anxiety symptoms and identify areas requiring further assessment or intervention',
    domains: ['emotional_regulation'],
    qualification_required: 'teacher',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'generalized-anxiety',
        title: 'Generalized Anxiety Symptoms',
        description: 'Excessive worry, restlessness, fatigue, difficulty concentrating',
        items: [
          {
            item_id: 'ga-worry',
            question_text: 'Worries excessively about everyday things (school, friendships, family, future)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Not at all' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Almost always' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'ga-control',
            question_text: 'Finds it hard to control worrying thoughts',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Not at all' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Almost always' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'ga-physical',
            question_text: 'Experiences physical symptoms when anxious (headaches, stomach aches, tiredness)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Not at all' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Almost always' },
              ],
            },
            domain: 'emotional_regulation',
          },
        ],
        scoring_instructions: 'Score ≥5 suggests clinically significant generalized anxiety',
      },
      {
        section_id: 'social-anxiety',
        title: 'Social Anxiety Symptoms',
        description: 'Fear of social situations, performance anxiety, avoidance',
        items: [
          {
            item_id: 'sa-fear',
            question_text: 'Fears social situations (talking to peers, eating in front of others, group work)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Not at all' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Almost always' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'sa-avoidance',
            question_text: 'Avoids social situations due to anxiety',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Not at all' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Almost always' },
              ],
            },
            domain: 'emotional_regulation',
          },
        ],
        scoring_instructions: 'Score ≥4 suggests clinically significant social anxiety',
      },
      {
        section_id: 'separation-anxiety',
        title: 'Separation Anxiety (younger children)',
        description: 'Excessive fear about separation from caregivers',
        items: [
          {
            item_id: 'sepa-distress',
            question_text: 'Shows excessive distress when separated from parents/carers or anticipating separation',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Not at all' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Almost always' },
              ],
            },
            domain: 'emotional_regulation',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'Differentiate developmentally appropriate anxiety from clinical anxiety',
      'Consider functional impairment: does anxiety interfere with daily life?',
      'Anxiety often co-occurs with depression, ADHD, autism',
      'Early intervention for anxiety is highly effective',
      'CBT-based interventions are first-line treatment for childhood anxiety',
      'Severe/persistent anxiety warrants CAMHS referral',
    ],
    references: [
      'Spence Children\'s Anxiety Scale (SCAS) framework',
      'DSM-5 Anxiety Disorders criteria',
      'NICE Anxiety Guidelines for Children and Young People (UK)',
    ],
    tags: ['emotional_regulation', 'mental-health', 'emotional-wellbeing', 'social-anxiety'],
  },

  {
    id: 'mood-emotional-regulation-checklist',
    name: 'Mood and Emotional Regulation Checklist',
    category: 'social_emotional',
    subcategory: 'Emotional Regulation',
    description: 'Assessment of mood patterns and emotional regulation skills',
    age_range: '5-18',
    administration_time: '15-20',
    purpose: 'Identify difficulties with mood regulation and emotional control',
    domains: ['emotional_regulation'],
    qualification_required: 'teacher',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'mood-symptoms',
        title: 'Mood Symptoms',
        description: 'Low mood, irritability, loss of interest',
        items: [
          {
            item_id: 'mood-low',
            question_text: 'Appears sad, down, or tearful',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Not at all' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Almost always' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'mood-interest',
            question_text: 'Has lost interest in activities previously enjoyed',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Not at all' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Almost always' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'mood-irritable',
            question_text: 'Is irritable, easily frustrated, or quick to anger',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Not at all' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Almost always' },
              ],
            },
            domain: 'emotional_regulation',
          },
        ],
        scoring_instructions: 'Persistent low mood (≥2 weeks) or sudden change warrants further assessment',
      },
      {
        section_id: 'regulation-skills',
        title: 'Emotional Regulation Skills',
        description: 'Ability to manage and modulate emotional responses',
        items: [
          {
            item_id: 'reg-calm',
            question_text: 'Can calm down after becoming upset or angry',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Rarely' },
                { value: 2, label: 'Sometimes' },
                { value: 3, label: 'Often' },
                { value: 4, label: 'Almost always' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'reg-express',
            question_text: 'Can express feelings in words rather than through behaviour',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Rarely' },
                { value: 2, label: 'Sometimes' },
                { value: 3, label: 'Often' },
                { value: 4, label: 'Almost always' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'reg-strategies',
            question_text: 'Uses strategies to manage difficult emotions (breathing, talking, taking break)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Rarely' },
                { value: 2, label: 'Sometimes' },
                { value: 3, label: 'Often' },
                { value: 4, label: 'Almost always' },
              ],
            },
            domain: 'emotional_regulation',
          },
        ],
        scoring_instructions: 'Lower scores indicate need for emotional regulation skill-building',
      },
    ],
    interpretation_guidelines: [
      'Consider developmental stage: regulation skills develop across childhood',
      'Low mood combined with functional impairment may indicate depression',
      'Emotional dysregulation common in ADHD, autism, trauma history',
      'Teach explicit regulation strategies: breathing, mindfulness, cognitive reappraisal',
      'Persistent/severe difficulties warrant mental health referral',
    ],
    references: [
      'Gross (1998) - Emotion Regulation framework',
      'Thompson (1994) - Emotional regulation in childhood',
      'UK Department for Education - Mental Health and Behaviour in Schools guidance',
    ],
    tags: ['emotional-regulation', 'mood', 'mental-health', 'wellbeing'],
  },

  // ============================================================================
  // SPEECH & LANGUAGE ASSESSMENTS
  // ============================================================================

  {
    id: 'articulation-phonology-assessment',
    name: 'Articulation and Phonology Skills Assessment',
    category: 'language_communication',
    subcategory: 'Speech Sounds',
    description: 'Assessment of speech sound production, articulation accuracy, and phonological processes',
    age_range: '3-12',
    administration_time: '20-30',
    purpose: 'Identify speech sound errors and phonological patterns to guide SLT referral and intervention',
    domains: ['expressive_language'],
    qualification_required: 'teacher',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'sound-inventory',
        title: 'Speech Sound Inventory',
        description: 'Production of individual phonemes in different word positions',
        items: [
          {
            item_id: 'phon-initial',
            question_text: 'Accurately produces age-appropriate sounds in initial position (e.g., /p/, /b/, /t/, /d/)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Significant difficulties' },
                { value: 2, label: 'Some errors' },
                { value: 3, label: 'Mostly accurate' },
                { value: 4, label: 'Age-appropriate' },
              ],
            },
            domain: 'expressive_language',
          },
          {
            item_id: 'phon-medial',
            question_text: 'Accurately produces sounds in medial/final positions',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Significant difficulties' },
                { value: 2, label: 'Some errors' },
                { value: 3, label: 'Mostly accurate' },
                { value: 4, label: 'Age-appropriate' },
              ],
            },
            domain: 'expressive_language',
          },
          {
            item_id: 'phon-clusters',
            question_text: 'Produces consonant clusters accurately (e.g., "stop", "play", "string")',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Significant difficulties' },
                { value: 2, label: 'Some errors' },
                { value: 3, label: 'Mostly accurate' },
                { value: 4, label: 'Age-appropriate' },
              ],
            },
            domain: 'expressive_language',
          },
        ],
        scoring_instructions: 'Compare to developmental norms: most sounds acquired by age 7-8',
      },
      {
        section_id: 'phonological-processes',
        title: 'Phonological Processes',
        description: 'Systematic simplification patterns in speech',
        items: [
          {
            item_id: 'proc-stopping',
            question_text: 'Uses stopping (replacing fricatives with stops, e.g., "tat" for "cat")',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Not observed' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Consistently' },
              ],
            },
            domain: 'expressive_language',
          },
          {
            item_id: 'proc-fronting',
            question_text: 'Uses fronting (e.g., "tar" for "car", "tea" for "key")',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Not observed' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Consistently' },
              ],
            },
            domain: 'expressive_language',
          },
          {
            item_id: 'proc-deletion',
            question_text: 'Uses cluster reduction or final consonant deletion (e.g., "poon" for "spoon", "ca" for "cat")',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Not observed' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Consistently' },
              ],
            },
            domain: 'expressive_language',
          },
        ],
        scoring_instructions: 'Persistent phonological processes beyond age 5 warrant SLT referral',
      },
      {
        section_id: 'intelligibility',
        title: 'Speech Intelligibility',
        description: 'How well the child\'s speech is understood by others',
        items: [
          {
            item_id: 'intel-familiar',
            question_text: 'Intelligibility to familiar listeners (parents, teachers)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: '<25% understood' },
                { value: 2, label: '25-50% understood' },
                { value: 3, label: '50-75% understood' },
                { value: 4, label: '>75% understood' },
              ],
            },
            domain: 'expressive_language',
          },
          {
            item_id: 'intel-unfamiliar',
            question_text: 'Intelligibility to unfamiliar listeners',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: '<25% understood' },
                { value: 2, label: '25-50% understood' },
                { value: 3, label: '50-75% understood' },
                { value: 4, label: '>75% understood' },
              ],
            },
            domain: 'expressive_language',
          },
        ],
        scoring_instructions: 'Intelligibility <50% to unfamiliar listeners indicates need for SLT assessment',
      },
    ],
    interpretation_guidelines: [
      'Speech sound development follows predictable sequence: /p/, /b/, /m/ earliest; /r/, /th/ latest',
      'Most children intelligible to strangers by age 4',
      'Phonological processes normal in early development; persistence beyond age 5 is atypical',
      'Distinguish articulation disorders (motor production) from phonological disorders (pattern-based)',
      'SLT input essential for moderate-severe speech sound disorders',
      'Consider oral motor examination if structural concerns (e.g., cleft palate)',
    ],
    references: [
      'Bowen, C. (2015). Children\'s Speech Sound Disorders',
      'Grunwell, P. (1997). Natural Phonology',
      'Dodd, B. (2013). Differential Diagnosis of Paediatric Speech Sound Disorder',
    ],
    tags: ['speech', 'articulation', 'phonology', 'SLT', 'speech-sounds'],
  },

  {
    id: 'pragmatic-language-assessment',
    name: 'Pragmatic Language Skills Assessment',
    category: 'language_communication',
    subcategory: 'Pragmatic Language',
    description: 'Assessment of social use of language including conversation skills, topic maintenance, nonverbal communication',
    age_range: '5-16',
    administration_time: '20-30',
    purpose: 'Identify pragmatic language difficulties common in autism, ADHD, and social communication disorders',
    domains: ['pragmatic_language', 'social_skills'],
    qualification_required: 'teacher',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'conversational-skills',
        title: 'Conversational Skills',
        description: 'Turn-taking, topic maintenance, conversational repair',
        items: [
          {
            item_id: 'conv-initiate',
            question_text: 'Initiates conversations appropriately (considers context, listener)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Rarely/inappropriately' },
                { value: 2, label: 'Sometimes' },
                { value: 3, label: 'Usually' },
                { value: 4, label: 'Age-appropriate' },
              ],
            },
            domain: 'pragmatic_language',
          },
          {
            item_id: 'conv-turntaking',
            question_text: 'Takes turns in conversation (doesn\'t dominate or withdraw)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Rarely' },
                { value: 2, label: 'Sometimes' },
                { value: 3, label: 'Usually' },
                { value: 4, label: 'Age-appropriate' },
              ],
            },
            domain: 'pragmatic_language',
          },
          {
            item_id: 'conv-maintain',
            question_text: 'Maintains topics appropriately (stays on topic, adds relevant information)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Rarely' },
                { value: 2, label: 'Sometimes' },
                { value: 3, label: 'Usually' },
                { value: 4, label: 'Age-appropriate' },
              ],
            },
            domain: 'pragmatic_language',
          },
          {
            item_id: 'conv-repair',
            question_text: 'Repairs communication breakdowns (asks for clarification, rephrases)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Rarely' },
                { value: 2, label: 'Sometimes' },
                { value: 3, label: 'Usually' },
                { value: 4, label: 'Age-appropriate' },
              ],
            },
            domain: 'pragmatic_language',
          },
        ],
        scoring_instructions: 'Scores 1-2 indicate pragmatic language difficulties',
      },
      {
        section_id: 'nonverbal-communication',
        title: 'Nonverbal Communication',
        description: 'Eye contact, gestures, facial expressions, body language',
        items: [
          {
            item_id: 'nonverb-eyecontact',
            question_text: 'Uses appropriate eye contact during interaction',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Minimal/excessive' },
                { value: 2, label: 'Inconsistent' },
                { value: 3, label: 'Usually appropriate' },
                { value: 4, label: 'Age-appropriate' },
              ],
            },
            domain: 'pragmatic_language',
          },
          {
            item_id: 'nonverb-gestures',
            question_text: 'Uses and understands gestures (pointing, waving, nodding)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Rarely' },
                { value: 2, label: 'Sometimes' },
                { value: 3, label: 'Usually' },
                { value: 4, label: 'Age-appropriate' },
              ],
            },
            domain: 'pragmatic_language',
          },
          {
            item_id: 'nonverb-proximity',
            question_text: 'Maintains appropriate physical proximity (personal space)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Rarely' },
                { value: 2, label: 'Sometimes' },
                { value: 3, label: 'Usually' },
                { value: 4, label: 'Age-appropriate' },
              ],
            },
            domain: 'pragmatic_language',
          },
        ],
      },
      {
        section_id: 'social-language',
        title: 'Social Language Understanding',
        description: 'Idioms, figurative language, sarcasm, humor',
        items: [
          {
            item_id: 'social-literal',
            question_text: 'Understands non-literal language (idioms, metaphors, sarcasm)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Very literal' },
                { value: 2, label: 'Some understanding' },
                { value: 3, label: 'Usually understands' },
                { value: 4, label: 'Age-appropriate' },
              ],
            },
            domain: 'pragmatic_language',
          },
          {
            item_id: 'social-inference',
            question_text: 'Makes appropriate inferences from context',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Rarely' },
                { value: 2, label: 'Sometimes' },
                { value: 3, label: 'Usually' },
                { value: 4, label: 'Age-appropriate' },
              ],
            },
            domain: 'pragmatic_language',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'Pragmatic difficulties often present with intact structural language (grammar, vocabulary)',
      'Common in autism spectrum conditions, ADHD, social communication disorder',
      'Observe across contexts: 1-to-1, small group, large group, structured/unstructured',
      'Pragmatic skills are essential for peer relationships and social inclusion',
      'Explicit teaching of social communication rules can be highly effective',
      'Consider joint EP and SLT assessment for complex pragmatic needs',
    ],
    references: [
      'Bishop, D.V.M. (2003). Children\'s Communication Checklist',
      'Adams, C. (2005). Social Communication Intervention',
      'NAPLIC (2019). Social Communication Practice Guidance UK',
    ],
    tags: ['pragmatic-language', 'social-communication', 'autism', 'conversation'],
  },

  {
    id: 'narrative-skills-assessment',
    name: 'Narrative Skills Assessment',
    category: 'language_communication',
    subcategory: 'Language Development',
    description: 'Assessment of storytelling, narrative structure, and coherence skills',
    age_range: '4-12',
    administration_time: '15-20',
    purpose: 'Evaluate ability to produce coherent narratives - predictor of literacy and academic success',
    domains: ['expressive_language'],
    qualification_required: 'teacher',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'story-structure',
        title: 'Story Structure',
        description: 'Use of narrative elements (setting, characters, problem, resolution)',
        items: [
          {
            item_id: 'narr-setting',
            question_text: 'Includes setting information (where, when)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Not present' },
                { value: 1, label: 'Partially present' },
                { value: 2, label: 'Clearly present' },
              ],
            },
            domain: 'expressive_language',
          },
          {
            item_id: 'narr-characters',
            question_text: 'Introduces and describes characters',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Not present' },
                { value: 1, label: 'Partially present' },
                { value: 2, label: 'Clearly present' },
              ],
            },
            domain: 'expressive_language',
          },
          {
            item_id: 'narr-plot',
            question_text: 'Develops plot with problem and resolution',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Not present' },
                { value: 1, label: 'Partially present' },
                { value: 2, label: 'Clearly present' },
              ],
            },
            domain: 'expressive_language',
          },
          {
            item_id: 'narr-sequence',
            question_text: 'Events presented in logical sequence',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Disorganized' },
                { value: 1, label: 'Some sequence' },
                { value: 2, label: 'Clear sequence' },
              ],
            },
            domain: 'expressive_language',
          },
        ],
        scoring_instructions: 'Total score ≥6 indicates age-appropriate narrative structure',
      },
      {
        section_id: 'cohesion',
        title: 'Narrative Cohesion',
        description: 'Use of cohesive devices to link ideas',
        items: [
          {
            item_id: 'cohes-connectives',
            question_text: 'Uses connectives to link ideas (and, then, because, but)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 3,
              labels: [
                { value: 1, label: 'Rarely' },
                { value: 2, label: 'Some use' },
                { value: 3, label: 'Appropriate use' },
              ],
            },
            domain: 'expressive_language',
          },
          {
            item_id: 'cohes-pronouns',
            question_text: 'Uses pronouns appropriately (clear referents)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 3,
              labels: [
                { value: 1, label: 'Unclear' },
                { value: 2, label: 'Mostly clear' },
                { value: 3, label: 'Clear' },
              ],
            },
            domain: 'expressive_language',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'Narrative skills develop progressively from age 3-12',
      'Age 4-5: simple sequences, Age 6-7: problem/resolution, Age 8+: complex narratives',
      'Narrative difficulties predict reading comprehension difficulties',
      'Narrative intervention improves both oral and written language',
      'Assess in both oral retelling and spontaneous generation',
    ],
    references: [
      'Stein & Glenn (1979) - Story Grammar framework',
      'Bishop & Donlan (2005) - Narrative assessment',
      'Petersen et al. (2008) - Narrative Language Measures',
    ],
    tags: ['narrative', 'storytelling', 'language-development', 'literacy'],
  },

  {
    id: 'vocabulary-assessment',
    name: 'Expressive Vocabulary Assessment',
    category: 'language_communication',
    subcategory: 'Vocabulary',
    description: 'Assessment of word knowledge, word retrieval, and semantic skills',
    age_range: '4-16',
    administration_time: '15-20',
    purpose: 'Identify vocabulary knowledge and word-finding difficulties',
    domains: ['expressive_language'],
    qualification_required: 'teacher',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'naming',
        title: 'Confrontation Naming',
        description: 'Ability to name objects, actions, and concepts',
        items: [
          {
            item_id: 'vocab-objects',
            question_text: 'Names common objects accurately',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Significant difficulty' },
                { value: 2, label: 'Some difficulty' },
                { value: 3, label: 'Mostly accurate' },
                { value: 4, label: 'Age-appropriate' },
              ],
            },
            domain: 'expressive_language',
          },
          {
            item_id: 'vocab-actions',
            question_text: 'Names actions (verbs) accurately',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Significant difficulty' },
                { value: 2, label: 'Some difficulty' },
                { value: 3, label: 'Mostly accurate' },
                { value: 4, label: 'Age-appropriate' },
              ],
            },
            domain: 'expressive_language',
          },
          {
            item_id: 'vocab-attributes',
            question_text: 'Uses descriptive vocabulary (adjectives, adverbs)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Limited' },
                { value: 2, label: 'Basic' },
                { value: 3, label: 'Good range' },
                { value: 4, label: 'Age-appropriate' },
              ],
            },
            domain: 'expressive_language',
          },
        ],
      },
      {
        section_id: 'word-retrieval',
        title: 'Word Retrieval',
        description: 'Efficiency of accessing stored vocabulary',
        items: [
          {
            item_id: 'retr-fluency',
            question_text: 'Retrieves words quickly and efficiently in conversation',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Frequent word-finding difficulties' },
                { value: 2, label: 'Some hesitations' },
                { value: 3, label: 'Generally fluent' },
                { value: 4, label: 'Age-appropriate' },
              ],
            },
            domain: 'expressive_language',
          },
          {
            item_id: 'retr-circumlocution',
            question_text: 'Uses circumlocution or filler words (e.g., "thing", "you know")',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Not observed' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Very frequently' },
              ],
            },
            domain: 'expressive_language',
          },
        ],
        scoring_instructions: 'Higher circumlocution scores indicate word-finding difficulties',
      },
      {
        section_id: 'semantic-knowledge',
        title: 'Semantic Knowledge',
        description: 'Understanding of word meanings and relationships',
        items: [
          {
            item_id: 'sem-categories',
            question_text: 'Understands and uses category relationships (e.g., fruit, animals)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Limited' },
                { value: 2, label: 'Developing' },
                { value: 3, label: 'Good' },
                { value: 4, label: 'Age-appropriate' },
              ],
            },
            domain: 'expressive_language',
          },
          {
            item_id: 'sem-synonyms',
            question_text: 'Understands synonyms and antonyms',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Limited' },
                { value: 2, label: 'Developing' },
                { value: 3, label: 'Good' },
                { value: 4, label: 'Age-appropriate' },
              ],
            },
            domain: 'expressive_language',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'Vocabulary size at age 5 is strong predictor of reading comprehension at age 11',
      'Word-finding difficulties can co-occur with adequate receptive vocabulary',
      'Consider both breadth (number of words) and depth (semantic knowledge) of vocabulary',
      'Vocabulary intervention most effective when integrated into curriculum',
      'Link vocabulary assessment to curriculum demands (tier 2 and tier 3 words)',
    ],
    references: [
      'Beck, McKeown, & Kucan (2013) - Bringing Words to Life',
      'German (2000) - Test of Word Finding framework',
      'EEF (2021) - Improving Literacy in Key Stage 2',
    ],
    tags: ['vocabulary', 'word-retrieval', 'semantic', 'language'],
  },

  // ============================================================================
  // EARLY YEARS & DEVELOPMENTAL ASSESSMENTS
  // ============================================================================

  {
    id: 'developmental-milestones-screening',
    name: 'Developmental Milestones Screening (0-5 years)',
    category: 'developmental',
    subcategory: 'Early Development',
    description: 'Comprehensive developmental screening across all domains aligned with EYFS',
    age_range: '0-5',
    administration_time: '30-40',
    purpose: 'Identify developmental delays across communication, motor, cognitive, and social-emotional domains',
    domains: ['adaptive_behaviour'],
    qualification_required: 'teacher',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'communication-language-dev',
        title: 'Communication and Language Development',
        description: 'Listening, understanding, speaking milestones',
        items: [
          {
            item_id: 'dev-recept-words',
            question_text: 'Understands simple words and instructions appropriate for age',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Significant delay' },
                { value: 1, label: 'Some delay' },
                { value: 2, label: 'Age-appropriate' },
              ],
            },
            domain: 'receptive_language',
          },
          {
            item_id: 'dev-express-words',
            question_text: 'Uses words/sentences appropriate for age',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Significant delay' },
                { value: 1, label: 'Some delay' },
                { value: 2, label: 'Age-appropriate' },
              ],
            },
            domain: 'expressive_language',
          },
        ],
        scoring_instructions: 'Expected: 12m=first words, 18m=10-20 words, 24m=2-word phrases, 36m=short sentences',
      },
      {
        section_id: 'physical-development',
        title: 'Physical Development',
        description: 'Gross and fine motor milestones',
        items: [
          {
            item_id: 'dev-gross-motor',
            question_text: 'Gross motor skills appropriate for age (sitting, walking, running, climbing)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Significant delay' },
                { value: 1, label: 'Some delay' },
                { value: 2, label: 'Age-appropriate' },
              ],
            },
            domain: 'motor_skills',
          },
          {
            item_id: 'dev-fine-motor',
            question_text: 'Fine motor skills appropriate for age (reaching, grasping, drawing, manipulating objects)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Significant delay' },
                { value: 1, label: 'Some delay' },
                { value: 2, label: 'Age-appropriate' },
              ],
            },
            domain: 'motor_skills',
          },
        ],
        scoring_instructions: 'Expected: 12m=walks, 24m=runs, 36m=pedals, 48m=hops, 60m=skips',
      },
      {
        section_id: 'personal-social-dev',
        title: 'Personal, Social, and Emotional Development',
        description: 'Social interaction, self-regulation, self-care',
        items: [
          {
            item_id: 'dev-social-interaction',
            question_text: 'Shows age-appropriate social interest and interaction with others',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Concerns noted' },
                { value: 1, label: 'Some difficulties' },
                { value: 2, label: 'Age-appropriate' },
              ],
            },
            domain: 'social_skills',
          },
          {
            item_id: 'dev-play',
            question_text: 'Engages in age-appropriate play (functional, symbolic, cooperative)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Limited/repetitive play' },
                { value: 1, label: 'Developing play skills' },
                { value: 2, label: 'Age-appropriate' },
              ],
            },
            domain: 'social_skills',
          },
          {
            item_id: 'dev-self-care',
            question_text: 'Developing independence in self-care (feeding, dressing, toileting)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Significant delay' },
                { value: 1, label: 'Some delay' },
                { value: 2, label: 'Age-appropriate' },
              ],
            },
            domain: 'adaptive_behaviour',
          },
        ],
      },
      {
        section_id: 'cognitive-learning',
        title: 'Cognitive Development and Learning',
        description: 'Attention, problem-solving, early concepts',
        items: [
          {
            item_id: 'dev-attention',
            question_text: 'Attention span appropriate for age',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Very fleeting' },
                { value: 1, label: 'Developing' },
                { value: 2, label: 'Age-appropriate' },
              ],
            },
            domain: 'attention',
          },
          {
            item_id: 'dev-problem-solving',
            question_text: 'Shows age-appropriate problem-solving (e.g., cause-effect, object permanence, sorting)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Limited' },
                { value: 1, label: 'Developing' },
                { value: 2, label: 'Age-appropriate' },
              ],
            },
            domain: 'working_memory',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'Use EYFS Development Matters as reference for age expectations',
      'Consider contextual factors: prematurity, English as additional language, hearing/vision',
      'Delays in multiple domains warrant further assessment',
      'Communication delays in 2-3 age group very common - most catch up',
      'Persistent concerns across domains by age 3 may indicate global developmental delay',
      'Early intervention significantly improves outcomes',
    ],
    references: [
      'EYFS Development Matters (2021)',
      'Birth to 5 Matters (2021)',
      'Ages & Stages Questionnaire framework',
      'Mary Sheridan developmental sequences',
    ],
    tags: ['early-years', 'developmental-screening', 'milestones', 'EYFS', '0-5'],
  },

  {
    id: 'fine-motor-skills-assessment',
    name: 'Fine Motor Skills Assessment',
    category: 'developmental',
    subcategory: 'Motor Development',
    description: 'Assessment of hand-eye coordination, pencil control, and manipulative skills',
    age_range: '3-11',
    administration_time: '20-30',
    purpose: 'Identify fine motor difficulties affecting handwriting, self-care, and practical tasks',
    domains: ['motor_skills'],
    qualification_required: 'teacher',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'pencil-skills',
        title: 'Pencil Control and Handwriting',
        description: 'Grip, pressure, fluency of handwriting',
        items: [
          {
            item_id: 'fm-grip',
            question_text: 'Uses age-appropriate pencil grip',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Immature grip' },
                { value: 2, label: 'Developing' },
                { value: 3, label: 'Functional grip' },
                { value: 4, label: 'Mature tripod grip' },
              ],
            },
            domain: 'motor_skills',
          },
          {
            item_id: 'fm-pressure',
            question_text: 'Applies appropriate pressure when writing/drawing',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Too light/heavy' },
                { value: 2, label: 'Inconsistent' },
                { value: 3, label: 'Mostly appropriate' },
                { value: 4, label: 'Well-controlled' },
              ],
            },
            domain: 'motor_skills',
          },
          {
            item_id: 'fm-formation',
            question_text: 'Forms letters/shapes with appropriate control and accuracy',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Significant difficulty' },
                { value: 2, label: 'Some difficulty' },
                { value: 3, label: 'Mostly accurate' },
                { value: 4, label: 'Age-appropriate' },
              ],
            },
            domain: 'motor_skills',
          },
          {
            item_id: 'fm-speed',
            question_text: 'Handwriting speed appropriate for age',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Very slow' },
                { value: 2, label: 'Slow' },
                { value: 3, label: 'Adequate' },
                { value: 4, label: 'Age-appropriate' },
              ],
            },
            domain: 'motor_skills',
          },
        ],
        scoring_instructions: 'Handwriting difficulties common in dyspraxia, dyslexia, hypermobility',
      },
      {
        section_id: 'manipulation',
        title: 'Object Manipulation',
        description: 'Using tools, fasteners, cutting, construction',
        items: [
          {
            item_id: 'fm-scissors',
            question_text: 'Uses scissors with control and accuracy',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Cannot use' },
                { value: 2, label: 'Some difficulty' },
                { value: 3, label: 'Functional' },
                { value: 4, label: 'Age-appropriate' },
              ],
            },
            domain: 'motor_skills',
          },
          {
            item_id: 'fm-fasteners',
            question_text: 'Manages fasteners (buttons, zips, laces) independently',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Needs full support' },
                { value: 2, label: 'Needs some support' },
                { value: 3, label: 'Mostly independent' },
                { value: 4, label: 'Fully independent' },
              ],
            },
            domain: 'motor_skills',
          },
          {
            item_id: 'fm-construction',
            question_text: 'Constructs with small objects (e.g., Lego, puzzles)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Significant difficulty' },
                { value: 2, label: 'Some difficulty' },
                { value: 3, label: 'Functional' },
                { value: 4, label: 'Age-appropriate' },
              ],
            },
            domain: 'motor_skills',
          },
        ],
      },
      {
        section_id: 'bilateral-coordination',
        title: 'Bilateral Coordination',
        description: 'Using two hands together in coordinated activities',
        items: [
          {
            item_id: 'fm-bimanual',
            question_text: 'Coordinates two hands for bimanual tasks (e.g., cutting, tying, threading)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Significant difficulty' },
                { value: 2, label: 'Some difficulty' },
                { value: 3, label: 'Functional' },
                { value: 4, label: 'Well-coordinated' },
              ],
            },
            domain: 'motor_skills',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'Fine motor skills develop progressively; wide variation in typical development',
      'Handwriting difficulties can significantly impact academic performance',
      'Consider underlying causes: motor planning (dyspraxia), joint hypermobility, muscle tone',
      'Occupational therapy referral appropriate for persistent/severe difficulties',
      'Environmental modifications and assistive technology can reduce impact',
      'Regular fine motor practice improves skills across domains',
    ],
    references: [
      'Beery-Buktenica Developmental Test of Visual-Motor Integration framework',
      'Movement ABC-2 checklist',
      'DSM-5 Developmental Coordination Disorder criteria',
    ],
    tags: ['fine-motor', 'handwriting', 'motor-skills', 'dyspraxia', 'occupational-therapy'],
  },

  {
    id: 'gross-motor-skills-assessment',
    name: 'Gross Motor Skills and Physical Coordination Assessment',
    category: 'developmental',
    subcategory: 'Motor Development',
    description: 'Assessment of balance, coordination, ball skills, and large movement patterns',
    age_range: '3-16',
    administration_time: '20-30',
    purpose: 'Identify gross motor difficulties affecting PE participation, playground activities, and daily mobility',
    domains: ['motor_skills'],
    qualification_required: 'teacher',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'static-dynamic-balance',
        title: 'Balance Skills',
        description: 'Static and dynamic balance',
        items: [
          {
            item_id: 'gm-static-balance',
            question_text: 'Can balance on one foot for age-appropriate duration',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Cannot balance' },
                { value: 2, label: 'Brief balance with support' },
                { value: 3, label: 'Functional balance' },
                { value: 4, label: 'Age-appropriate' },
              ],
            },
            domain: 'motor_skills',
          },
          {
            item_id: 'gm-dynamic-balance',
            question_text: 'Maintains balance during movement (walking on line, beam, stairs)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Very unsteady' },
                { value: 2, label: 'Some difficulty' },
                { value: 3, label: 'Functional' },
                { value: 4, label: 'Age-appropriate' },
              ],
            },
            domain: 'motor_skills',
          },
        ],
      },
      {
        section_id: 'locomotor-skills',
        title: 'Locomotor Skills',
        description: 'Running, jumping, hopping, skipping',
        items: [
          {
            item_id: 'gm-running',
            question_text: 'Runs with coordinated arm and leg movements',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Very uncoordinated' },
                { value: 2, label: 'Some difficulty' },
                { value: 3, label: 'Functional' },
                { value: 4, label: 'Age-appropriate' },
              ],
            },
            domain: 'motor_skills',
          },
          {
            item_id: 'gm-jumping',
            question_text: 'Can jump with both feet together',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Cannot jump' },
                { value: 2, label: 'Some difficulty' },
                { value: 3, label: 'Functional' },
                { value: 4, label: 'Age-appropriate' },
              ],
            },
            domain: 'motor_skills',
          },
          {
            item_id: 'gm-hopping-skipping',
            question_text: 'Can hop on one foot and skip with alternating feet (age 5+)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Cannot perform' },
                { value: 2, label: 'Emerging skill' },
                { value: 3, label: 'Functional' },
                { value: 4, label: 'Age-appropriate' },
              ],
            },
            domain: 'motor_skills',
          },
        ],
      },
      {
        section_id: 'ball-skills',
        title: 'Ball Skills and Object Control',
        description: 'Throwing, catching, kicking',
        items: [
          {
            item_id: 'gm-catching',
            question_text: 'Catches ball with appropriate technique',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Cannot catch' },
                { value: 2, label: 'Some difficulty' },
                { value: 3, label: 'Functional' },
                { value: 4, label: 'Age-appropriate' },
              ],
            },
            domain: 'motor_skills',
          },
          {
            item_id: 'gm-throwing',
            question_text: 'Throws with direction and force control',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Very inaccurate' },
                { value: 2, label: 'Some control' },
                { value: 3, label: 'Functional' },
                { value: 4, label: 'Age-appropriate' },
              ],
            },
            domain: 'motor_skills',
          },
          {
            item_id: 'gm-kicking',
            question_text: 'Kicks ball with direction control',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Cannot kick' },
                { value: 2, label: 'Some control' },
                { value: 3, label: 'Functional' },
                { value: 4, label: 'Age-appropriate' },
              ],
            },
            domain: 'motor_skills',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'Gross motor difficulties (DCD/dyspraxia) affect 5-6% of children',
      'Impact on PE participation can affect self-esteem and peer relationships',
      'Consider safety implications (stairs, playground, road safety)',
      'Gross motor difficulties often co-occur with fine motor difficulties',
      'Structured motor skill teaching and practice improves outcomes',
      'Refer to occupational therapy or physiotherapy for moderate-severe difficulties',
    ],
    references: [
      'Movement Assessment Battery for Children (MABC-2)',
      'DSM-5 Developmental Coordination Disorder criteria',
      'Sugden & Chambers (2005) - Children with Developmental Coordination Disorder',
    ],
    tags: ['gross-motor', 'coordination', 'dyspraxia', 'physical-education', 'motor-skills'],
  },

  // ============================================================================
  // NUMERACY & DYSCALCULIA ASSESSMENTS
  // ============================================================================

  {
    id: 'number-sense-assessment',
    name: 'Number Sense and Early Numeracy Assessment',
    category: 'numeracy',
    subcategory: 'Number Sense',
    description: 'Assessment of foundational number concepts including magnitude, counting, and basic operations',
    age_range: '5-11',
    administration_time: '20-30',
    purpose: 'Identify difficulties with basic number understanding predictive of dyscalculia',
    domains: ['numeracy'],
    qualification_required: 'teacher',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'number-magnitude',
        title: 'Number Magnitude and Comparison',
        description: 'Understanding of quantity and relative size of numbers',
        items: [
          {
            item_id: 'num-compare',
            question_text: 'Can compare numbers and identify which is larger/smaller',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Significant difficulty' },
                { value: 2, label: 'Some difficulty' },
                { value: 3, label: 'Mostly accurate' },
                { value: 4, label: 'Age-appropriate' },
              ],
            },
            domain: 'numeracy',
          },
          {
            item_id: 'num-line',
            question_text: 'Can place numbers accurately on a number line',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Significant difficulty' },
                { value: 2, label: 'Some difficulty' },
                { value: 3, label: 'Mostly accurate' },
                { value: 4, label: 'Age-appropriate' },
              ],
            },
            domain: 'numeracy',
          },
          {
            item_id: 'num-estimate',
            question_text: 'Can make reasonable estimates of quantity',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Very poor estimates' },
                { value: 2, label: 'Developing' },
                { value: 3, label: 'Reasonable' },
                { value: 4, label: 'Age-appropriate' },
              ],
            },
            domain: 'numeracy',
          },
        ],
        scoring_instructions: 'Number magnitude understanding is foundational; difficulties indicate dyscalculia risk',
      },
      {
        section_id: 'counting-skills',
        title: 'Counting and Cardinality',
        description: 'Counting procedures and understanding that last count represents total',
        items: [
          {
            item_id: 'count-sequence',
            question_text: 'Counts in sequence accurately',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Frequent errors' },
                { value: 2, label: 'Some errors' },
                { value: 3, label: 'Mostly accurate' },
                { value: 4, label: 'Accurate' },
              ],
            },
            domain: 'numeracy',
          },
          {
            item_id: 'count-cardinality',
            question_text: 'Understands that last number counted represents total (cardinality)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Not understood' },
                { value: 2, label: 'Emerging' },
                { value: 3, label: 'Usually demonstrates' },
                { value: 4, label: 'Fully understood' },
              ],
            },
            domain: 'numeracy',
          },
          {
            item_id: 'count-strategies',
            question_text: 'Can count on from a given number (rather than always counting from 1)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Always starts from 1' },
                { value: 2, label: 'Emerging skill' },
                { value: 3, label: 'Usually can count on' },
                { value: 4, label: 'Flexible strategy use' },
              ],
            },
            domain: 'numeracy',
          },
        ],
      },
      {
        section_id: 'basic-arithmetic',
        title: 'Basic Arithmetic Concepts',
        description: 'Understanding of addition, subtraction, and simple operations',
        items: [
          {
            item_id: 'arith-addition',
            question_text: 'Understands addition as combining/increasing',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Not understood' },
                { value: 2, label: 'Concrete only' },
                { value: 3, label: 'Pictorial understanding' },
                { value: 4, label: 'Abstract understanding' },
              ],
            },
            domain: 'numeracy',
          },
          {
            item_id: 'arith-subtraction',
            question_text: 'Understands subtraction as taking away/difference',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Not understood' },
                { value: 2, label: 'Concrete only' },
                { value: 3, label: 'Pictorial understanding' },
                { value: 4, label: 'Abstract understanding' },
              ],
            },
            domain: 'numeracy',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'Number sense is foundational for all higher mathematics',
      'Difficulties with magnitude comparison strongly predictive of dyscalculia',
      'Concrete-Pictorial-Abstract (CPA) progression should be observed',
      'Early intervention in number sense prevents cascading difficulties',
      'Link to working memory: may need memory support alongside maths intervention',
    ],
    references: [
      'Dehaene (2011) - The Number Sense',
      'Butterworth (2005) - The Development of Arithmetical Abilities',
      'NCETM (2021) - Teaching for Mastery: Number Sense',
    ],
    tags: ['numeracy', 'number-sense', 'dyscalculia', 'early-maths'],
  },

  {
    id: 'dyscalculia-screening',
    name: 'Dyscalculia Screening Tool',
    category: 'numeracy',
    subcategory: 'Learning Difficulties',
    description: 'Screening for specific learning difficulty in mathematics (dyscalculia)',
    age_range: '6-16',
    administration_time: '25-35',
    purpose: 'Identify indicators of dyscalculia to guide comprehensive assessment and intervention',
    domains: ['numeracy', 'working_memory', 'processing_speed'],
    qualification_required: 'senco',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'core-indicators',
        title: 'Core Dyscalculia Indicators',
        description: 'Primary characteristics of mathematical learning difficulty',
        items: [
          {
            item_id: 'dysc-magnitude',
            question_text: 'Persistent difficulty understanding number magnitude and relationships',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Not observed' },
                { value: 1, label: 'Mild difficulty' },
                { value: 2, label: 'Moderate difficulty' },
                { value: 3, label: 'Severe difficulty' },
              ],
            },
            domain: 'numeracy',
          },
          {
            item_id: 'dysc-facts',
            question_text: 'Difficulty learning and recalling number facts despite practice',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Not observed' },
                { value: 1, label: 'Mild difficulty' },
                { value: 2, label: 'Moderate difficulty' },
                { value: 3, label: 'Severe difficulty' },
              ],
            },
            domain: 'numeracy',
          },
          {
            item_id: 'dysc-procedures',
            question_text: 'Confusion with mathematical procedures and operations',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Not observed' },
                { value: 1, label: 'Mild difficulty' },
                { value: 2, label: 'Moderate difficulty' },
                { value: 3, label: 'Severe difficulty' },
              ],
            },
            domain: 'numeracy',
          },
          {
            item_id: 'dysc-place-value',
            question_text: 'Poor understanding of place value (tens, hundreds, etc.)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Not observed' },
                { value: 1, label: 'Mild difficulty' },
                { value: 2, label: 'Moderate difficulty' },
                { value: 3, label: 'Severe difficulty' },
              ],
            },
            domain: 'numeracy',
          },
        ],
        scoring_instructions: 'Total score ≥8 indicates significant risk for dyscalculia',
      },
      {
        section_id: 'associated-difficulties',
        title: 'Associated Difficulties',
        description: 'Related cognitive and processing difficulties',
        items: [
          {
            item_id: 'dysc-wm',
            question_text: 'Working memory difficulties affecting mental arithmetic',
            item_type: 'yes_no',
            domain: 'working_memory',
          },
          {
            item_id: 'dysc-speed',
            question_text: 'Slow processing speed in numerical tasks',
            item_type: 'yes_no',
            domain: 'processing_speed',
          },
          {
            item_id: 'dysc-anxiety',
            question_text: 'Mathematics anxiety interfering with performance',
            item_type: 'yes_no',
            domain: 'emotional_regulation',
          },
        ],
      },
      {
        section_id: 'functional-impact',
        title: 'Functional Impact',
        description: 'Impact on daily life and learning',
        items: [
          {
            item_id: 'impact-academic',
            question_text: 'Maths difficulties affecting other curriculum areas',
            item_type: 'yes_no',
            domain: 'numeracy',
          },
          {
            item_id: 'impact-practical',
            question_text: 'Difficulty with practical maths (time, money, measurement)',
            item_type: 'yes_no',
            domain: 'numeracy',
          },
          {
            item_id: 'impact-confidence',
            question_text: 'Loss of confidence and motivation in maths',
            item_type: 'yes_no',
            domain: 'emotional_regulation',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'Dyscalculia affects 5-7% of population - similar prevalence to dyslexia',
      'Often co-occurs with dyslexia, ADHD, dyspraxia',
      'Distinguish from maths anxiety or poor teaching',
      'Persistent difficulties despite quality intervention is key indicator',
      'Specialist dyscalculia assessment needed for formal diagnosis',
      'Early identification and targeted intervention critical',
    ],
    references: [
      'DSM-5: Specific Learning Disorder with impairment in mathematics',
      'Butterworth & Yeo (2004) - Dyscalculia Guidance',
      'British Dyslexia Association - Dyscalculia Guidelines',
    ],
    tags: ['dyscalculia', 'numeracy', 'learning-difficulty', 'screening'],
  },

  {
    id: 'mathematical-problem-solving',
    name: 'Mathematical Reasoning and Problem-Solving Assessment',
    category: 'numeracy',
    subcategory: 'Problem-Solving',
    description: 'Assessment of mathematical reasoning, problem-solving strategies, and application of concepts',
    age_range: '7-16',
    administration_time: '25-30',
    purpose: 'Evaluate higher-order mathematical thinking beyond computational skills',
    domains: ['numeracy', 'working_memory'],
    qualification_required: 'teacher',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'problem-approach',
        title: 'Problem-Solving Approach',
        description: 'Strategies and processes used to approach mathematical problems',
        items: [
          {
            item_id: 'ps-understand',
            question_text: 'Can identify what the problem is asking',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Rarely understands problem' },
                { value: 2, label: 'Sometimes understands' },
                { value: 3, label: 'Usually understands' },
                { value: 4, label: 'Consistently understands' },
              ],
            },
            domain: 'numeracy',
          },
          {
            item_id: 'ps-strategy',
            question_text: 'Selects appropriate strategy to solve problem',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Random/ineffective approach' },
                { value: 2, label: 'Sometimes selects appropriately' },
                { value: 3, label: 'Usually selects appropriately' },
                { value: 4, label: 'Strategic approach' },
              ],
            },
            domain: 'numeracy',
          },
          {
            item_id: 'ps-persevere',
            question_text: 'Perseveres when initial approach doesn\'t work',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Gives up immediately' },
                { value: 2, label: 'Limited persistence' },
                { value: 3, label: 'Usually perseveres' },
                { value: 4, label: 'Resilient problem-solver' },
              ],
            },
            domain: 'numeracy',
          },
        ],
      },
      {
        section_id: 'reasoning-skills',
        title: 'Mathematical Reasoning',
        description: 'Logical thinking and justification',
        items: [
          {
            item_id: 'reason-explain',
            question_text: 'Can explain mathematical thinking and justify answers',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Cannot explain' },
                { value: 2, label: 'Limited explanation' },
                { value: 3, label: 'Clear explanation' },
                { value: 4, label: 'Sophisticated reasoning' },
              ],
            },
            domain: 'numeracy',
          },
          {
            item_id: 'reason-patterns',
            question_text: 'Identifies and uses mathematical patterns',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Does not notice patterns' },
                { value: 2, label: 'Notices with prompting' },
                { value: 3, label: 'Often identifies patterns' },
                { value: 4, label: 'Uses patterns strategically' },
              ],
            },
            domain: 'numeracy',
          },
        ],
      },
      {
        section_id: 'word-problems',
        title: 'Word Problem Comprehension',
        description: 'Understanding mathematical language and context',
        items: [
          {
            item_id: 'wp-language',
            question_text: 'Understands mathematical vocabulary in word problems',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Significant difficulty' },
                { value: 2, label: 'Some difficulty' },
                { value: 3, label: 'Usually understands' },
                { value: 4, label: 'Strong understanding' },
              ],
            },
            domain: 'numeracy',
          },
          {
            item_id: 'wp-extract',
            question_text: 'Can extract relevant numerical information from text',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Significant difficulty' },
                { value: 2, label: 'Some difficulty' },
                { value: 3, label: 'Usually successful' },
                { value: 4, label: 'Efficient information extraction' },
              ],
            },
            domain: 'numeracy',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'Problem-solving skills often more important than computational fluency',
      'Difficulty may stem from reading comprehension rather than maths ability',
      'Working memory load increases with multi-step problems',
      'Explicit teaching of problem-solving strategies is effective',
      'Mathematical language understanding essential for problem-solving',
    ],
    references: [
      'Polya (1945) - How to Solve It framework',
      'NRICH (University of Cambridge) - Mathematical Problem-Solving',
      'EEF (2017) - Improving Mathematics in KS2 and KS3',
    ],
    tags: ['numeracy', 'problem-solving', 'reasoning', 'word-problems'],
  },

  {
    id: 'maths-anxiety-assessment',
    name: 'Mathematics Anxiety Assessment',
    category: 'social_emotional',
    subcategory: 'Academic Anxiety',
    description: 'Assessment of anxiety specifically related to mathematics learning and performance',
    age_range: '8-16',
    administration_time: '10-15',
    purpose: 'Identify mathematics anxiety that may be interfering with learning and performance',
    domains: ['emotional_regulation'],
    qualification_required: 'teacher',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'anxiety-symptoms',
        title: 'Mathematics Anxiety Symptoms',
        description: 'Physical and emotional responses to maths',
        items: [
          {
            item_id: 'ma-worry',
            question_text: 'Worries excessively about maths lessons or homework',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Not at all' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Almost always' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'ma-physical',
            question_text: 'Shows physical signs of distress during maths (headache, stomach ache, tense)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Not at all' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Almost always' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'ma-avoid',
            question_text: 'Tries to avoid maths activities',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Not at all' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Almost always' },
              ],
            },
            domain: 'emotional_regulation',
          },
        ],
        scoring_instructions: 'Score ≥5 suggests clinically significant mathematics anxiety',
      },
      {
        section_id: 'self-beliefs',
        title: 'Mathematical Self-Concept',
        description: 'Beliefs about own mathematical ability',
        items: [
          {
            item_id: 'mb-ability',
            question_text: 'Expresses belief that they are "not good at maths" or "can\'t do maths"',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Consistently' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'mb-fixed',
            question_text: 'Believes mathematical ability is fixed ("I\'m just not a maths person")',
            item_type: 'yes_no',
            domain: 'emotional_regulation',
          },
        ],
      },
      {
        section_id: 'performance-impact',
        title: 'Impact on Performance',
        description: 'How anxiety affects mathematical performance',
        items: [
          {
            item_id: 'impact-tests',
            question_text: 'Performs worse on maths tests than classroom work suggests',
            item_type: 'yes_no',
            domain: 'emotional_regulation',
          },
          {
            item_id: 'impact-freeze',
            question_text: 'Mind "goes blank" during maths activities',
            item_type: 'yes_no',
            domain: 'emotional_regulation',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'Mathematics anxiety distinct from general anxiety or test anxiety',
      'Can develop even in children with good mathematical ability',
      'Often linked to past negative experiences or fixed mindset beliefs',
      'Anxiety interferes with working memory, reducing performance',
      'Growth mindset interventions and low-stakes practice reduce anxiety',
      'Address anxiety alongside mathematical skill development',
    ],
    references: [
      'Ashcraft & Kirk (2001) - Mathematics anxiety and working memory',
      'Dweck (2006) - Growth mindset in mathematics',
      'EEF (2020) - Metacognition and self-regulated learning',
    ],
    tags: ['mathematics-anxiety', 'maths', 'emotional_regulation', 'self-concept'],
  },

  // ============================================================================
  // BEHAVIORAL & WELLBEING ASSESSMENTS
  // ============================================================================

  {
    id: 'conduct-problems-assessment',
    name: 'Conduct and Oppositional Behavior Assessment',
    category: 'behavioural',
    subcategory: 'Conduct Problems',
    description: 'Assessment of oppositional, defiant, and conduct-related behaviours',
    age_range: '5-16',
    administration_time: '20-25',
    purpose: 'Identify conduct difficulties to guide behaviour support and intervention',
    domains: ['emotional_regulation', 'social_skills'],
    qualification_required: 'teacher',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'oppositional-defiant',
        title: 'Oppositional Defiant Behaviors',
        description: 'Argumentative, defiant behaviour toward authority figures',
        items: [
          {
            item_id: 'odd-argue',
            question_text: 'Argues with adults/authority figures',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Rarely/Never' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Very Often' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'odd-defiant',
            question_text: 'Actively defies or refuses to comply with requests/rules',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Rarely/Never' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Very Often' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'odd-annoy',
            question_text: 'Deliberately annoys others',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Rarely/Never' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Very Often' },
              ],
            },
            domain: 'social_skills',
          },
          {
            item_id: 'odd-blame',
            question_text: 'Blames others for own mistakes or misbehaviour',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Rarely/Never' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Very Often' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'odd-angry',
            question_text: 'Is touchy, easily annoyed, or angry',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Rarely/Never' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Very Often' },
              ],
            },
            domain: 'emotional_regulation',
          },
        ],
        scoring_instructions: '≥4 symptoms rated Often/Very Often suggests clinically significant ODD behaviours',
      },
      {
        section_id: 'conduct-violation',
        title: 'Serious Conduct Violations',
        description: 'Violation of rights of others or social norms',
        items: [
          {
            item_id: 'cd-aggression',
            question_text: 'Shows physical aggression toward people or animals',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never' },
                { value: 1, label: 'Rarely' },
                { value: 2, label: 'Sometimes' },
                { value: 3, label: 'Often' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'cd-property',
            question_text: 'Deliberately destroys property',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never' },
                { value: 1, label: 'Rarely' },
                { value: 2, label: 'Sometimes' },
                { value: 3, label: 'Often' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'cd-deceit',
            question_text: 'Lies frequently or engages in theft',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never' },
                { value: 1, label: 'Rarely' },
                { value: 2, label: 'Sometimes' },
                { value: 3, label: 'Often' },
              ],
            },
            domain: 'social_skills',
          },
        ],
        scoring_instructions: 'Any item rated Sometimes/Often warrants further assessment for conduct disorder',
      },
    ],
    interpretation_guidelines: [
      'ODD affects 3-5% of children; boys more than girls in childhood',
      'Often co-occurs with ADHD (50% comorbidity)',
      'Early intervention critical - ODD can progress to conduct disorder',
      'Consider underlying causes: trauma, family stress, learning difficulties, unmet needs',
      'Functional behaviour assessment recommended',
      'Parent training and school-based interventions most effective',
    ],
    references: [
      'DSM-5 Oppositional Defiant Disorder criteria',
      'DSM-5 Conduct Disorder criteria',
      'NICE (2013) - Antisocial behaviour and conduct disorders',
    ],
    tags: ['conduct', 'ODD', 'behaviour', 'defiance', 'oppositional'],
  },

  {
    id: 'functional-behaviour-assessment',
    name: 'Functional Behavior Assessment (ABC Analysis)',
    category: 'behavioural',
    subcategory: 'Behavior Analysis',
    description: 'Systematic analysis of antecedents, behaviours, and consequences to understand function of challenging behaviour',
    age_range: '3-18',
    administration_time: '30-45',
    purpose: 'Identify triggers, patterns, and functions of challenging behaviour to inform intervention',
    domains: ['emotional_regulation', 'social_skills'],
    qualification_required: 'senco',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'behaviour-description',
        title: 'Behavior Description',
        description: 'Clear, observable description of the target behaviour',
        items: [
          {
            item_id: 'beh-describe',
            question_text: 'Description of behaviour (observable, specific, measurable)',
            item_type: 'text',
            domain: 'emotional_regulation',
          },
          {
            item_id: 'beh-frequency',
            question_text: 'Frequency of behaviour (times per day/week)',
            item_type: 'text',
            domain: 'emotional_regulation',
          },
          {
            item_id: 'beh-duration',
            question_text: 'Duration of behaviour (how long does it last)',
            item_type: 'text',
            domain: 'emotional_regulation',
          },
          {
            item_id: 'beh-intensity',
            question_text: 'Intensity/severity of behaviour',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 5,
              labels: [
                { value: 1, label: 'Mild' },
                { value: 3, label: 'Moderate' },
                { value: 5, label: 'Severe' },
              ],
            },
            domain: 'emotional_regulation',
          },
        ],
      },
      {
        section_id: 'antecedents',
        title: 'Antecedents (What happens before)',
        description: 'Triggers and settings that predict the behaviour',
        items: [
          {
            item_id: 'ant-time',
            question_text: 'Time of day when behaviour most likely',
            item_type: 'text',
            domain: 'emotional_regulation',
          },
          {
            item_id: 'ant-setting',
            question_text: 'Settings where behaviour occurs (classroom, playground, transitions)',
            item_type: 'text',
            domain: 'emotional_regulation',
          },
          {
            item_id: 'ant-activity',
            question_text: 'Activities/tasks that trigger behaviour',
            item_type: 'text',
            domain: 'emotional_regulation',
          },
          {
            item_id: 'ant-social',
            question_text: 'Social antecedents (people present, interactions)',
            item_type: 'text',
            domain: 'social_skills',
          },
        ],
      },
      {
        section_id: 'consequences',
        title: 'Consequences (What happens after)',
        description: 'Responses to the behaviour that may maintain it',
        items: [
          {
            item_id: 'cons-adult',
            question_text: 'How do adults respond to the behaviour?',
            item_type: 'text',
            domain: 'emotional_regulation',
          },
          {
            item_id: 'cons-peer',
            question_text: 'How do peers respond to the behaviour?',
            item_type: 'text',
            domain: 'social_skills',
          },
          {
            item_id: 'cons-student',
            question_text: 'What does the student get/avoid as result of behaviour?',
            item_type: 'text',
            domain: 'emotional_regulation',
          },
        ],
      },
      {
        section_id: 'function-hypothesis',
        title: 'Function Hypothesis',
        description: 'Hypothesized purpose/function of the behaviour',
        items: [
          {
            item_id: 'func-attention',
            question_text: 'Behavior serves to gain attention (adult or peer)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 5,
              labels: [
                { value: 1, label: 'Very unlikely' },
                { value: 3, label: 'Possible' },
                { value: 5, label: 'Very likely' },
              ],
            },
            domain: 'social_skills',
          },
          {
            item_id: 'func-escape',
            question_text: 'Behavior serves to escape/avoid task or situation',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 5,
              labels: [
                { value: 1, label: 'Very unlikely' },
                { value: 3, label: 'Possible' },
                { value: 5, label: 'Very likely' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'func-tangible',
            question_text: 'Behavior serves to obtain tangible item or activity',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 5,
              labels: [
                { value: 1, label: 'Very unlikely' },
                { value: 3, label: 'Possible' },
                { value: 5, label: 'Very likely' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'func-sensory',
            question_text: 'Behavior serves sensory/automatic function (feels good, self-soothing)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 5,
              labels: [
                { value: 1, label: 'Very unlikely' },
                { value: 3, label: 'Possible' },
                { value: 5, label: 'Very likely' },
              ],
            },
            domain: 'sensory_processing',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'All behaviour is communication - behaviour serves a function for the child',
      'Four main functions: attention, escape, tangible, sensory/automatic',
      'Effective intervention requires addressing the function, not just the behaviour',
      'Teach functionally equivalent replacement behaviours',
      'Modify antecedents to prevent behaviour; modify consequences to not reinforce',
      'Consider unmet needs: sensory, communication, skill deficits',
    ],
    references: [
      'O\'Neill et al. (2014) - Functional Assessment and Program Development',
      'Carr & Durand (1985) - Functional Communication Training',
      'BACB (2020) - Applied Behavior Analysis framework',
    ],
    tags: ['behaviour-analysis', 'ABC', 'functional-assessment', 'challenging-behaviour'],
  },

  {
    id: 'school-refusal-assessment',
    name: 'School Refusal and Avoidance Assessment',
    category: 'social_emotional',
    subcategory: 'School Attendance',
    description: 'Assessment of emotionally-based school avoidance and refusal behaviours',
    age_range: '5-16',
    administration_time: '20-30',
    purpose: 'Differentiate school refusal from truancy and identify underlying causes',
    domains: ['emotional_regulation', 'social_skills', 'attention'],
    qualification_required: 'senco',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'attendance-pattern',
        title: 'Attendance Pattern',
        description: 'Nature and pattern of school avoidance',
        items: [
          {
            item_id: 'att-frequency',
            question_text: 'Current attendance rate',
            item_type: 'text',
            domain: 'emotional_regulation',
          },
          {
            item_id: 'att-pattern',
            question_text: 'Pattern of absence (specific days, times, lessons)',
            item_type: 'text',
            domain: 'emotional_regulation',
          },
          {
            item_id: 'att-parents-aware',
            question_text: 'Parents are aware of absences (vs. truancy)',
            item_type: 'yes_no',
            domain: 'emotional_regulation',
          },
        ],
      },
      {
        section_id: 'emotional-symptoms',
        title: 'Emotional and Physical Symptoms',
        description: 'Anxiety and distress related to school attendance',
        items: [
          {
            item_id: 'emo-morning',
            question_text: 'Shows distress in morning before school (crying, pleading, tantrums)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Rarely' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Daily' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'emo-somatic',
            question_text: 'Reports physical symptoms (stomach ache, headache, nausea) on school mornings',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Rarely' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Daily' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'emo-anticipatory',
            question_text: 'Anxiety increases as school day approaches (evening before, Sunday night)',
            item_type: 'yes_no',
            domain: 'emotional_regulation',
          },
        ],
        scoring_instructions: 'Emotional symptoms distinguish school refusal from truancy',
      },
      {
        section_id: 'maintaining-factors',
        title: 'Maintaining Factors',
        description: 'Underlying reasons for school avoidance',
        items: [
          {
            item_id: 'factor-separation',
            question_text: 'Separation anxiety from parent/caregiver',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Not a factor' },
                { value: 1, label: 'Minor factor' },
                { value: 2, label: 'Significant factor' },
                { value: 3, label: 'Primary factor' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'factor-social',
            question_text: 'Social anxiety or peer relationship difficulties',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Not a factor' },
                { value: 1, label: 'Minor factor' },
                { value: 2, label: 'Significant factor' },
                { value: 3, label: 'Primary factor' },
              ],
            },
            domain: 'social_skills',
          },
          {
            item_id: 'factor-bullying',
            question_text: 'Bullying or peer victimization',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Not a factor' },
                { value: 1, label: 'Minor factor' },
                { value: 2, label: 'Significant factor' },
                { value: 3, label: 'Primary factor' },
              ],
            },
            domain: 'social_skills',
          },
          {
            item_id: 'factor-academic',
            question_text: 'Academic difficulties or specific lesson anxiety',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Not a factor' },
                { value: 1, label: 'Minor factor' },
                { value: 2, label: 'Significant factor' },
                { value: 3, label: 'Primary factor' },
              ],
            },
            domain: 'attention',
          },
          {
            item_id: 'factor-home',
            question_text: 'Home-based factors (family stress, caring responsibilities, parent mental health)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Not a factor' },
                { value: 1, label: 'Minor factor' },
                { value: 2, label: 'Significant factor' },
                { value: 3, label: 'Primary factor' },
              ],
            },
            domain: 'emotional_regulation',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'School refusal affects 2-5% of school-age children; peaks at ages 5-6 and 10-11',
      'Differs from truancy: genuine distress, parents aware, stays at home',
      'Often multiple maintaining factors - requires comprehensive intervention',
      'Early intervention critical - longer absence = harder to return',
      'Gradual reintegration plan with anxiety management support',
      'Address underlying causes while supporting attendance',
      'May require CAMHS involvement for severe anxiety',
    ],
    references: [
      'Kearney & Silverman (1999) - Functionally-based approach to school refusal',
      'NICE (2013) - Social anxiety disorder guidance',
      'DfE (2022) - Working together to improve school attendance',
    ],
    tags: ['school-refusal', 'attendance', 'emotional_regulation', 'emotionally-based-school-avoidance'],
  },

  {
    id: 'trauma-screening',
    name: 'Trauma and Adverse Experiences Screening',
    category: 'social_emotional',
    subcategory: 'Trauma',
    description: 'Screening for potential trauma exposure and trauma-related symptoms',
    age_range: '5-18',
    administration_time: '15-20',
    purpose: 'Identify potential trauma exposure to guide trauma-informed support and referral',
    domains: ['emotional_regulation', 'social_skills', 'attention'],
    qualification_required: 'senco',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'trauma-indicators',
        title: 'Trauma Response Indicators',
        description: 'Behavioral and emotional indicators of possible trauma',
        items: [
          {
            item_id: 'trau-hypervigilance',
            question_text: 'Shows heightened vigilance, watchfulness, or "on edge" behaviour',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Not observed' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Frequently' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'trau-startle',
            question_text: 'Exaggerated startle response or fear reaction',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Not observed' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Frequently' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'trau-dysregulation',
            question_text: 'Difficulty regulating emotions (rapid escalation, intense reactions)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Not observed' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Frequently' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'trau-avoidance',
            question_text: 'Avoids specific topics, places, or situations',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Not observed' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Frequently' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'trau-dissociation',
            question_text: 'Episodes of "zoning out" or seeming disconnected',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Not observed' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Frequently' },
              ],
            },
            domain: 'attention',
          },
          {
            item_id: 'trau-relationships',
            question_text: 'Difficulty trusting adults or forming relationships',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Not observed' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Frequently' },
              ],
            },
            domain: 'social_skills',
          },
        ],
        scoring_instructions: 'Score ≥6 suggests possible trauma-related difficulties; specialist assessment recommended',
      },
      {
        section_id: 'ace-indicators',
        title: 'Adverse Childhood Experience Indicators (Known to School)',
        description: 'Known ACEs that may impact wellbeing (only information already known to school)',
        items: [
          {
            item_id: 'ace-domestic',
            question_text: 'Known exposure to domestic violence/abuse',
            item_type: 'yes_no',
            domain: 'emotional_regulation',
          },
          {
            item_id: 'ace-parent-mh',
            question_text: 'Parent/caregiver mental health difficulties',
            item_type: 'yes_no',
            domain: 'emotional_regulation',
          },
          {
            item_id: 'ace-substance',
            question_text: 'Parent/caregiver substance misuse',
            item_type: 'yes_no',
            domain: 'emotional_regulation',
          },
          {
            item_id: 'ace-separation',
            question_text: 'Parental separation/divorce or bereavement',
            item_type: 'yes_no',
            domain: 'emotional_regulation',
          },
          {
            item_id: 'ace-cp',
            question_text: 'Child protection concerns or looked after status',
            item_type: 'yes_no',
            domain: 'emotional_regulation',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'This is a screening tool only - not a diagnostic instrument',
      'Do NOT directly ask child about trauma experiences without specialist training',
      'Use only information already known to school or disclosed spontaneously',
      'Trauma-informed approach benefits ALL children, not just those with known trauma',
      'Key principles: safety, trustworthiness, choice, collaboration, empowerment',
      'Consider trauma as possible factor when behaviour doesn\'t respond to usual strategies',
      'Refer to Educational Psychology Service or CAMHS for specialist trauma assessment',
    ],
    references: [
      'Felitti et al. (1998) - ACE Study',
      'Perry & Szalavitz (2017) - The Boy Who Was Raised as a Dog',
      'UK Trauma Council - Trauma-Informed Practice guidance',
      'NICE (2018) - Post-traumatic stress disorder guidance',
    ],
    tags: ['trauma', 'ACE', 'PTSD', 'trauma-informed', 'adverse-experiences'],
  },

  {
    id: 'attachment-difficulties-checklist',
    name: 'Attachment Difficulties Checklist',
    category: 'social_emotional',
    subcategory: 'Attachment',
    description: 'Screening for attachment-related difficulties in educational setting',
    age_range: '3-16',
    administration_time: '15-20',
    purpose: 'Identify potential attachment difficulties to guide relationship-based support',
    domains: ['social_skills', 'emotional_regulation'],
    qualification_required: 'senco',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'avoidant-indicators',
        title: 'Avoidant Attachment Indicators',
        description: 'Emotionally withdrawn, self-reliant, rejects help',
        items: [
          {
            item_id: 'avoid-distant',
            question_text: 'Appears emotionally distant or "shut down"',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Not observed' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Frequently' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'avoid-help',
            question_text: 'Refuses help or support even when struggling',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Not observed' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Frequently' },
              ],
            },
            domain: 'social_skills',
          },
          {
            item_id: 'avoid-reliant',
            question_text: 'Overly self-reliant; doesn\'t seek adult support',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Not observed' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Frequently' },
              ],
            },
            domain: 'social_skills',
          },
        ],
      },
      {
        section_id: 'ambivalent-indicators',
        title: 'Ambivalent/Anxious Attachment Indicators',
        description: 'Clingy, anxious, attention-seeking',
        items: [
          {
            item_id: 'amb-clingy',
            question_text: 'Excessively clingy with familiar adults',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Not observed' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Frequently' },
              ],
            },
            domain: 'social_skills',
          },
          {
            item_id: 'amb-attention',
            question_text: 'Constant need for adult attention and reassurance',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Not observed' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Frequently' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'amb-separation',
            question_text: 'Significant distress at separation (beyond age-appropriate)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Not observed' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Frequently' },
              ],
            },
            domain: 'emotional_regulation',
          },
        ],
      },
      {
        section_id: 'disorganized-indicators',
        title: 'Disorganized Attachment Indicators',
        description: 'Contradictory behaviours, controlling, confusion about relationships',
        items: [
          {
            item_id: 'dis-contradictory',
            question_text: 'Contradictory behaviour toward adults (seeks closeness then rejects)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Not observed' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Frequently' },
              ],
            },
            domain: 'social_skills',
          },
          {
            item_id: 'dis-controlling',
            question_text: 'Attempts to control adult interactions (bossy, caregiving, or aggressive)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Not observed' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Frequently' },
              ],
            },
            domain: 'social_skills',
          },
          {
            item_id: 'dis-indiscriminate',
            question_text: 'Indiscriminately affectionate with unfamiliar adults',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Not observed' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Frequently' },
              ],
            },
            domain: 'social_skills',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'Attachment patterns reflect early relationship experiences',
      'Insecure attachment common; disorganized attachment more concerning',
      'School can provide "secure base" and corrective relationship experiences',
      'Key adult/keyworker approach beneficial for attachment difficulties',
      'Consistent, predictable, emotionally available adults essential',
      'Do not attempt attachment diagnosis - this is clinical territory',
      'Refer to Educational Psychology Service for consultation',
    ],
    references: [
      'Ainsworth et al. (1978) - Patterns of Attachment',
      'Geddes (2006) - Attachment in the Classroom',
      'Bomber (2007) - Inside I\'m Hurting (practical strategies for schools)',
    ],
    tags: ['attachment', 'relationships', 'looked-after-children', 'trauma'],
  },

  // ============================================================================
  // ADDITIONAL LITERACY & WRITING ASSESSMENTS
  // ============================================================================

  {
    id: 'writing-composition-assessment',
    name: 'Written Expression and Composition Assessment',
    category: 'literacy',
    subcategory: 'Writing',
    description: 'Assessment of writing composition including organization, elaboration, and written expression',
    age_range: '7-16',
    administration_time: '30-40',
    purpose: 'Evaluate written expression skills beyond spelling and handwriting',
    domains: ['writing'],
    qualification_required: 'teacher',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'text-structure',
        title: 'Text Structure and Organization',
        description: 'Overall organization and coherence of written text',
        items: [
          {
            item_id: 'write-intro',
            question_text: 'Includes effective opening/introduction',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Absent or ineffective' },
                { value: 2, label: 'Basic' },
                { value: 3, label: 'Adequate' },
                { value: 4, label: 'Strong' },
              ],
            },
            domain: 'writing',
          },
          {
            item_id: 'write-sequence',
            question_text: 'Ideas presented in logical sequence',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Disorganized' },
                { value: 2, label: 'Some sequence' },
                { value: 3, label: 'Mostly logical' },
                { value: 4, label: 'Well-organized' },
              ],
            },
            domain: 'writing',
          },
          {
            item_id: 'write-paragraphs',
            question_text: 'Uses paragraphs appropriately',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'No paragraphing' },
                { value: 2, label: 'Limited use' },
                { value: 3, label: 'Appropriate use' },
                { value: 4, label: 'Effective use' },
              ],
            },
            domain: 'writing',
          },
        ],
      },
      {
        section_id: 'content-ideas',
        title: 'Content and Ideas',
        description: 'Quality and elaboration of ideas',
        items: [
          {
            item_id: 'write-ideas',
            question_text: 'Generates relevant ideas',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Very limited' },
                { value: 2, label: 'Basic ideas' },
                { value: 3, label: 'Good range' },
                { value: 4, label: 'Rich content' },
              ],
            },
            domain: 'writing',
          },
          {
            item_id: 'write-elaboration',
            question_text: 'Elaborates ideas with details and examples',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'No elaboration' },
                { value: 2, label: 'Minimal detail' },
                { value: 3, label: 'Adequate detail' },
                { value: 4, label: 'Rich elaboration' },
              ],
            },
            domain: 'writing',
          },
        ],
      },
      {
        section_id: 'sentence-grammar',
        title: 'Sentence Construction and Grammar',
        description: 'Syntax and grammatical accuracy',
        items: [
          {
            item_id: 'write-sentence-variety',
            question_text: 'Uses variety of sentence structures',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Very simple/repetitive' },
                { value: 2, label: 'Some variety' },
                { value: 3, label: 'Good variety' },
                { value: 4, label: 'Sophisticated variety' },
              ],
            },
            domain: 'writing',
          },
          {
            item_id: 'write-grammar',
            question_text: 'Grammatical accuracy',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Frequent errors' },
                { value: 2, label: 'Some errors' },
                { value: 3, label: 'Mostly accurate' },
                { value: 4, label: 'Accurate' },
              ],
            },
            domain: 'writing',
          },
          {
            item_id: 'write-punctuation',
            question_text: 'Uses punctuation appropriately',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Minimal/incorrect' },
                { value: 2, label: 'Basic use' },
                { value: 3, label: 'Good use' },
                { value: 4, label: 'Sophisticated use' },
              ],
            },
            domain: 'writing',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'Writing difficulties can stem from ideation, organization, transcription, or motor issues',
      'Consider cognitive load: planning while transcribing is demanding',
      'Separate transcription skills (spelling, handwriting) from composition',
      'Explicit teaching of writing strategies highly effective',
      'Link to oral language skills - writing builds on spoken language',
    ],
    references: [
      'Graham & Harris (2009) - Self-Regulated Strategy Development',
      'Berninger & Winn (2006) - Writing development framework',
      'EEF (2020) - Improving Literacy in KS1 and KS2',
    ],
    tags: ['writing', 'composition', 'literacy', 'written-expression'],
  },

  {
    id: 'reading-fluency-assessment',
    name: 'Reading Fluency Assessment',
    category: 'literacy',
    subcategory: 'Reading',
    description: 'Assessment of reading fluency including rate, accuracy, and prosody',
    age_range: '6-14',
    administration_time: '10-15',
    purpose: 'Evaluate fluency as bridge between decoding and comprehension',
    domains: ['reading'],
    qualification_required: 'teacher',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'fluency-components',
        title: 'Reading Fluency Components',
        description: 'Rate, accuracy, and prosody assessment',
        items: [
          {
            item_id: 'fluency-rate',
            question_text: 'Reading rate (words correct per minute) appropriate for age/text level',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Very slow' },
                { value: 2, label: 'Below expected' },
                { value: 3, label: 'At expected rate' },
                { value: 4, label: 'Fluent' },
              ],
            },
            domain: 'reading',
          },
          {
            item_id: 'fluency-accuracy',
            question_text: 'Reading accuracy (% words read correctly)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: '<90% accurate' },
                { value: 2, label: '90-94% accurate' },
                { value: 3, label: '95-97% accurate' },
                { value: 4, label: '98%+ accurate' },
              ],
            },
            domain: 'reading',
          },
          {
            item_id: 'fluency-prosody',
            question_text: 'Prosody (expression, phrasing, appropriate intonation)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Monotone, word-by-word' },
                { value: 2, label: 'Some phrasing' },
                { value: 3, label: 'Appropriate phrasing' },
                { value: 4, label: 'Expressive' },
              ],
            },
            domain: 'reading',
          },
        ],
        scoring_instructions: '95%+ accuracy = instructional level; 98%+ = independent level',
      },
      {
        section_id: 'fluency-strategies',
        title: 'Decoding Strategies',
        description: 'Strategies used when encountering difficult words',
        items: [
          {
            item_id: 'strat-phonics',
            question_text: 'Attempts to decode unfamiliar words using phonics',
            item_type: 'yes_no',
            domain: 'reading',
          },
          {
            item_id: 'strat-context',
            question_text: 'Uses context clues to support word reading',
            item_type: 'yes_no',
            domain: 'reading',
          },
          {
            item_id: 'strat-self-correct',
            question_text: 'Self-corrects errors',
            item_type: 'yes_no',
            domain: 'reading',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'Fluency is bridge between decoding and comprehension',
      'Slow/labored reading reduces comprehension due to cognitive load',
      'Repeated reading with feedback improves fluency',
      'Consider text difficulty - fluency varies with text complexity',
      'Expected rate varies by age: Year 2 (~90 wpm), Year 6 (~150 wpm)',
    ],
    references: [
      'Rasinski (2004) - Reading fluency framework',
      'National Reading Panel (2000) - Fluency instruction',
      'Hasbrouck & Tindal (2017) - Oral Reading Fluency norms',
    ],
    tags: ['reading-fluency', 'literacy', 'reading', 'prosody'],
  },

  // ============================================================================
  // MEMORY & COGNITIVE PROCESSING ASSESSMENTS
  // ============================================================================

  {
    id: 'working-memory-observation',
    name: 'Working Memory Classroom Observation',
    category: 'cognitive',
    subcategory: 'Memory',
    description: 'Functional assessment of working memory in classroom context',
    age_range: '5-16',
    administration_time: '20-30',
    purpose: 'Identify working memory difficulties impacting learning',
    domains: ['working_memory'],
    qualification_required: 'teacher',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'verbal-wm',
        title: 'Verbal Working Memory',
        description: 'Holding and manipulating verbal information',
        items: [
          {
            item_id: 'vwm-instructions',
            question_text: 'Follows multi-step verbal instructions',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Rarely' },
                { value: 2, label: 'With support' },
                { value: 3, label: 'Usually' },
                { value: 4, label: 'Consistently' },
              ],
            },
            domain: 'working_memory',
          },
          {
            item_id: 'vwm-mental-math',
            question_text: 'Performs mental arithmetic without losing track',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Very difficult' },
                { value: 2, label: 'Some difficulty' },
                { value: 3, label: 'Age-appropriate' },
                { value: 4, label: 'Strong' },
              ],
            },
            domain: 'working_memory',
          },
          {
            item_id: 'vwm-writing',
            question_text: 'Holds ideas in mind while writing',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Forgets ideas' },
                { value: 2, label: 'Some difficulty' },
                { value: 3, label: 'Usually manages' },
                { value: 4, label: 'Strong' },
              ],
            },
            domain: 'working_memory',
          },
        ],
        scoring_instructions: 'Scores 1-2 indicate significant working memory difficulties',
      },
      {
        section_id: 'visuospatial-wm',
        title: 'Visuospatial Working Memory',
        description: 'Holding and manipulating visual-spatial information',
        items: [
          {
            item_id: 'vswm-visual-info',
            question_text: 'Remembers where things are located (materials, information on board)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Rarely' },
                { value: 2, label: 'Sometimes' },
                { value: 3, label: 'Usually' },
                { value: 4, label: 'Consistently' },
              ],
            },
            domain: 'working_memory',
          },
          {
            item_id: 'vswm-copying',
            question_text: 'Copies from board without losing place',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Significant difficulty' },
                { value: 2, label: 'Some difficulty' },
                { value: 3, label: 'Usually manages' },
                { value: 4, label: 'No difficulty' },
              ],
            },
            domain: 'working_memory',
          },
        ],
      },
      {
        section_id: 'wm-strategies',
        title: 'Memory Strategy Use',
        description: 'Use of strategies to support memory',
        items: [
          {
            item_id: 'strat-rehearsal',
            question_text: 'Uses rehearsal (repeating information)',
            item_type: 'yes_no',
            domain: 'working_memory',
          },
          {
            item_id: 'strat-notes',
            question_text: 'Makes notes to support memory',
            item_type: 'yes_no',
            domain: 'working_memory',
          },
          {
            item_id: 'strat-asks',
            question_text: 'Asks for instructions to be repeated',
            item_type: 'yes_no',
            domain: 'working_memory',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'Working memory difficulties very common in learning difficulties (ADHD, dyslexia, etc.)',
      'WM capacity develops across childhood; consider age-appropriate expectations',
      'Environmental modifications reduce WM demand: visual aids, written instructions, chunking',
      'Explicit strategy teaching improves functional memory',
      'Distinguish WM difficulties from attention or language comprehension issues',
    ],
    references: [
      'Baddeley (2000) - Working Memory model',
      'Gathercole & Alloway (2008) - Working Memory and Learning',
      'Alloway et al. (2009) - Working Memory in the classroom',
    ],
    tags: ['working-memory', 'cognitive', 'memory', 'learning'],
  },

  {
    id: 'learning-profile-assessment',
    name: 'Learning Profile and Preferences Assessment',
    category: 'cognitive',
    subcategory: 'Learning Style',
    description: 'Assessment of learning preferences, strengths, and metacognitive awareness',
    age_range: '8-18',
    administration_time: '20-25',
    purpose: 'Understand learner preferences to inform differentiation and study skills',
    domains: ['working_memory', 'attention'],
    qualification_required: 'teacher',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'learning-preferences',
        title: 'Learning Preferences',
        description: 'Preferred modalities and learning situations',
        items: [
          {
            item_id: 'pref-visual',
            question_text: 'Learns well from visual information (diagrams, written text, demonstrations)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 5,
              labels: [
                { value: 1, label: 'Not helpful' },
                { value: 3, label: 'Somewhat helpful' },
                { value: 5, label: 'Very helpful' },
              ],
            },
            domain: 'working_memory',
          },
          {
            item_id: 'pref-auditory',
            question_text: 'Learns well from auditory information (listening, discussion, verbal explanation)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 5,
              labels: [
                { value: 1, label: 'Not helpful' },
                { value: 3, label: 'Somewhat helpful' },
                { value: 5, label: 'Very helpful' },
              ],
            },
            domain: 'working_memory',
          },
          {
            item_id: 'pref-kinesthetic',
            question_text: 'Learns well from hands-on activities and physical manipulation',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 5,
              labels: [
                { value: 1, label: 'Not helpful' },
                { value: 3, label: 'Somewhat helpful' },
                { value: 5, label: 'Very helpful' },
              ],
            },
            domain: 'working_memory',
          },
        ],
      },
      {
        section_id: 'metacognition',
        title: 'Metacognitive Awareness',
        description: 'Awareness of own learning processes',
        items: [
          {
            item_id: 'meta-aware',
            question_text: 'Aware of own strengths and weaknesses as learner',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Very limited awareness' },
                { value: 2, label: 'Some awareness' },
                { value: 3, label: 'Good awareness' },
                { value: 4, label: 'Strong awareness' },
              ],
            },
            domain: 'attention',
          },
          {
            item_id: 'meta-monitor',
            question_text: 'Monitors own understanding during learning',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Does not monitor' },
                { value: 2, label: 'Limited monitoring' },
                { value: 3, label: 'Usually monitors' },
                { value: 4, label: 'Effective monitoring' },
              ],
            },
            domain: 'attention',
          },
          {
            item_id: 'meta-strategies',
            question_text: 'Selects and uses appropriate learning strategies',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'No strategy use' },
                { value: 2, label: 'Limited use' },
                { value: 3, label: 'Good strategy use' },
                { value: 4, label: 'Strategic learner' },
              ],
            },
            domain: 'attention',
          },
        ],
      },
      {
        section_id: 'study-skills',
        title: 'Study Skills and Organization',
        description: 'Practical study and organizational skills',
        items: [
          {
            item_id: 'study-plan',
            question_text: 'Plans approach to tasks and homework',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'No planning' },
                { value: 2, label: 'Some planning' },
                { value: 3, label: 'Usually plans' },
                { value: 4, label: 'Effective planning' },
              ],
            },
            domain: 'attention',
          },
          {
            item_id: 'study-organize',
            question_text: 'Organizes materials and workspace effectively',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Very disorganized' },
                { value: 2, label: 'Some organization' },
                { value: 3, label: 'Reasonably organized' },
                { value: 4, label: 'Well organized' },
              ],
            },
            domain: 'attention',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'Learning "styles" theory has weak evidence; preferences don\'t equal optimal methods',
      'Multi-sensory instruction benefits most learners regardless of preference',
      'Metacognitive skills are trainable and improve learning outcomes',
      'Self-awareness and self-regulation more important than modality preferences',
      'Use profile to build on strengths while developing weaker areas',
    ],
    references: [
      'Pashler et al. (2008) - Learning styles: Concepts and evidence',
      'EEF (2018) - Metacognition and Self-Regulated Learning',
      'Dunlosky et al. (2013) - Improving Students\' Learning With Effective Learning Techniques',
    ],
    tags: ['learning-profile', 'metacognition', 'study-skills', 'preferences'],
  },

  // ============================================================================
  // SCREENING & EARLY IDENTIFICATION TOOLS
  // ============================================================================

  {
    id: 'send-initial-screening',
    name: 'SEND Initial Screening Tool',
    category: 'screening',
    subcategory: 'General Screening',
    description: 'Broad screening tool for identifying potential SEND across multiple domains',
    age_range: '4-16',
    administration_time: '15-20',
    purpose: 'Initial screening to determine if further assessment needed',
    domains: ['reading', 'writing', 'numeracy', 'attention', 'social_skills', 'emotional_regulation'],
    qualification_required: 'teacher',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'academic-concerns',
        title: 'Academic Concerns',
        description: 'Concerns about academic progress',
        items: [
          {
            item_id: 'acad-literacy',
            question_text: 'Reading/writing significantly below age expectations',
            item_type: 'yes_no',
            domain: 'reading',
          },
          {
            item_id: 'acad-numeracy',
            question_text: 'Numeracy significantly below age expectations',
            item_type: 'yes_no',
            domain: 'numeracy',
          },
          {
            item_id: 'acad-progress',
            question_text: 'Making limited progress despite quality teaching',
            item_type: 'yes_no',
            domain: 'attention',
          },
        ],
      },
      {
        section_id: 'cognitive-concerns',
        title: 'Cognitive/Learning Concerns',
        description: 'Concerns about learning processes',
        items: [
          {
            item_id: 'cog-memory',
            question_text: 'Significant difficulties with memory/retention',
            item_type: 'yes_no',
            domain: 'working_memory',
          },
          {
            item_id: 'cog-attention',
            question_text: 'Persistent attention/concentration difficulties',
            item_type: 'yes_no',
            domain: 'attention',
          },
          {
            item_id: 'cog-processing',
            question_text: 'Slow processing speed or difficulty understanding instructions',
            item_type: 'yes_no',
            domain: 'working_memory',
          },
        ],
      },
      {
        section_id: 'communication-concerns',
        title: 'Communication Concerns',
        description: 'Language and communication difficulties',
        items: [
          {
            item_id: 'comm-expression',
            question_text: 'Difficulty expressing thoughts verbally',
            item_type: 'yes_no',
            domain: 'expressive_language',
          },
          {
            item_id: 'comm-understanding',
            question_text: 'Difficulty understanding spoken language',
            item_type: 'yes_no',
            domain: 'receptive_language',
          },
          {
            item_id: 'comm-social',
            question_text: 'Difficulty with social use of language',
            item_type: 'yes_no',
            domain: 'pragmatic_language',
          },
        ],
      },
      {
        section_id: 'social-emotional-concerns',
        title: 'Social-Emotional Concerns',
        description: 'SEMH and behaviour concerns',
        items: [
          {
            item_id: 'semh-anxiety',
            question_text: 'Significant anxiety impacting learning',
            item_type: 'yes_no',
            domain: 'emotional_regulation',
          },
          {
            item_id: 'semh-behaviour',
            question_text: 'Persistent behavioural difficulties',
            item_type: 'yes_no',
            domain: 'emotional_regulation',
          },
          {
            item_id: 'semh-social',
            question_text: 'Significant difficulties with peer relationships',
            item_type: 'yes_no',
            domain: 'social_skills',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      '3+ "yes" responses warrant further assessment',
      'Use to guide which specific assessments to conduct',
      'Consider graduated response: quality first teaching → targeted intervention → specialist assessment',
      'Early identification allows early intervention - most effective approach',
      'Always consider environmental and contextual factors',
    ],
    references: [
      'SEND Code of Practice (2015)',
      'Graduated Response framework',
      'Early identification guidance',
    ],
    tags: ['screening', 'SEND', 'early-identification', 'assessment'],
  },

  {
    id: 'gifted-talented-identification',
    name: 'High Learning Potential Identification Checklist',
    category: 'screening',
    subcategory: 'Gifted/Talented',
    description: 'Identification checklist for children with high learning potential or exceptional abilities',
    age_range: '5-16',
    administration_time: '15-20',
    purpose: 'Identify children who may benefit from enrichment or extension provision',
    domains: ['verbal_comprehension', 'perceptual_reasoning', 'working_memory'],
    qualification_required: 'teacher',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'cognitive-indicators',
        title: 'Cognitive Indicators',
        description: 'Advanced cognitive abilities',
        items: [
          {
            item_id: 'hl-advanced-vocab',
            question_text: 'Uses advanced vocabulary and complex language',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Not observed' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Frequently' },
              ],
            },
            domain: 'verbal_comprehension',
          },
          {
            item_id: 'hl-quick-grasp',
            question_text: 'Grasps new concepts very quickly, needs minimal repetition',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Not observed' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Frequently' },
              ],
            },
            domain: 'perceptual_reasoning',
          },
          {
            item_id: 'hl-connections',
            question_text: 'Makes unusual connections between ideas; sees patterns others miss',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Not observed' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Frequently' },
              ],
            },
            domain: 'perceptual_reasoning',
          },
          {
            item_id: 'hl-memory',
            question_text: 'Exceptional memory for facts, details, or experiences',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Not observed' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Frequently' },
              ],
            },
            domain: 'working_memory',
          },
        ],
        scoring_instructions: 'Score ≥5 suggests high learning potential',
      },
      {
        section_id: 'learning-characteristics',
        title: 'Learning Characteristics',
        description: 'Approach to learning',
        items: [
          {
            item_id: 'hl-curious',
            question_text: 'Intensely curious; asks probing questions',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Not observed' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Frequently' },
              ],
            },
            domain: 'verbal_comprehension',
          },
          {
            item_id: 'hl-depth',
            question_text: 'Pursues topics in great depth; becomes "expert" in areas of interest',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Not observed' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Frequently' },
              ],
            },
            domain: 'perceptual_reasoning',
          },
          {
            item_id: 'hl-complex',
            question_text: 'Prefers complex tasks and challenges; bored by routine work',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 2,
              labels: [
                { value: 0, label: 'Not observed' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Frequently' },
              ],
            },
            domain: 'perceptual_reasoning',
          },
        ],
      },
      {
        section_id: 'considerations',
        title: 'Additional Considerations',
        description: 'Important factors in identification',
        items: [
          {
            item_id: 'hl-underachieve',
            question_text: 'May be underachieving due to lack of challenge or unidentified SEND',
            item_type: 'yes_no',
            domain: 'verbal_comprehension',
          },
          {
            item_id: 'hl-dual-exceptional',
            question_text: 'May have coexisting difficulties (e.g., dyslexia, ADHD, autism) masking abilities',
            item_type: 'yes_no',
            domain: 'verbal_comprehension',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'High learning potential does NOT automatically mean high achievement',
      'Gifted children can have learning difficulties (twice-exceptional)',
      'Consider cultural and linguistic factors - giftedness manifests differently across cultures',
      'Enrichment and challenge essential to maintain motivation',
      'Social-emotional needs as important as cognitive needs',
      'Use multiple sources of evidence, not just test scores',
    ],
    references: [
      'Department for Education - Supporting pupils with high learning potential',
      'Potential Plus UK guidance',
      'Renzulli (2012) - Three-Ring Conception of Giftedness',
    ],
    tags: ['gifted', 'talented', 'high-potential', 'enrichment', 'twice-exceptional'],
  },

  {
    id: 'eal-proficiency-assessment',
    name: 'English as Additional Language Proficiency Assessment',
    category: 'language_communication',
    subcategory: 'EAL',
    description: 'Assessment of English language proficiency for EAL learners',
    age_range: '5-18',
    administration_time: '25-30',
    purpose: 'Assess English proficiency to inform language support and distinguish from SEND',
    domains: ['receptive_language', 'expressive_language'],
    qualification_required: 'teacher',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'listening',
        title: 'Listening and Comprehension',
        description: 'Understanding spoken English',
        items: [
          {
            item_id: 'eal-listen-simple',
            question_text: 'Understands simple, everyday instructions in English',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 5,
              labels: [
                { value: 1, label: 'Very limited' },
                { value: 3, label: 'Developing' },
                { value: 5, label: 'Proficient' },
              ],
            },
            domain: 'receptive_language',
          },
          {
            item_id: 'eal-listen-academic',
            question_text: 'Understands academic language and complex instructions',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 5,
              labels: [
                { value: 1, label: 'Very limited' },
                { value: 3, label: 'Developing' },
                { value: 5, label: 'Proficient' },
              ],
            },
            domain: 'receptive_language',
          },
        ],
      },
      {
        section_id: 'speaking',
        title: 'Speaking',
        description: 'Spoken English production',
        items: [
          {
            item_id: 'eal-speak-basic',
            question_text: 'Uses simple phrases to communicate basic needs',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 5,
              labels: [
                { value: 1, label: 'Very limited' },
                { value: 3, label: 'Developing' },
                { value: 5, label: 'Proficient' },
              ],
            },
            domain: 'expressive_language',
          },
          {
            item_id: 'eal-speak-complex',
            question_text: 'Expresses complex ideas with appropriate grammar and vocabulary',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 5,
              labels: [
                { value: 1, label: 'Very limited' },
                { value: 3, label: 'Developing' },
                { value: 5, label: 'Proficient' },
              ],
            },
            domain: 'expressive_language',
          },
        ],
      },
      {
        section_id: 'reading',
        title: 'Reading in English',
        description: 'English reading proficiency',
        items: [
          {
            item_id: 'eal-read-simple',
            question_text: 'Reads simple, familiar texts in English',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 5,
              labels: [
                { value: 1, label: 'Very limited' },
                { value: 3, label: 'Developing' },
                { value: 5, label: 'Proficient' },
              ],
            },
            domain: 'reading',
          },
          {
            item_id: 'eal-read-academic',
            question_text: 'Reads age-appropriate academic texts with understanding',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 5,
              labels: [
                { value: 1, label: 'Very limited' },
                { value: 3, label: 'Developing' },
                { value: 5, label: 'Proficient' },
              ],
            },
            domain: 'reading',
          },
        ],
      },
      {
        section_id: 'writing',
        title: 'Writing in English',
        description: 'English writing proficiency',
        items: [
          {
            item_id: 'eal-write-simple',
            question_text: 'Writes simple sentences in English',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 5,
              labels: [
                { value: 1, label: 'Very limited' },
                { value: 3, label: 'Developing' },
                { value: 5, label: 'Proficient' },
              ],
            },
            domain: 'writing',
          },
          {
            item_id: 'eal-write-extended',
            question_text: 'Produces extended written texts with appropriate structure',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 5,
              labels: [
                { value: 1, label: 'Very limited' },
                { value: 3, label: 'Developing' },
                { value: 5, label: 'Proficient' },
              ],
            },
            domain: 'writing',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'Language proficiency is NOT the same as cognitive ability',
      'EAL learners can take 5-7 years to develop academic language proficiency',
      'Assess in first language if possible to distinguish EAL from SEND',
      'Consider cultural factors in social interaction',
      'Silent period (minimal speaking) is normal in early stages',
      'Provide scaffolding and visual support to access curriculum',
    ],
    references: [
      'Cummins (1984) - BICS and CALP framework',
      'The Bell Foundation - EAL Assessment Framework',
      'DfE (2016) - English as an additional language: Proficiency in English scales',
    ],
    tags: ['EAL', 'english-additional-language', 'language-proficiency', 'multilingual'],
  },

  // ============================================================================
  // BULLYING, WELLBEING & ADDITIONAL ASSESSMENTS
  // ============================================================================

  {
    id: 'bullying-victimization-assessment',
    name: 'Bullying and Peer Victimization Assessment',
    category: 'social_emotional',
    subcategory: 'Bullying',
    description: 'Assessment of bullying experiences and impact',
    age_range: '8-18',
    administration_time: '15-20',
    purpose: 'Identify bullying and peer victimization to guide intervention and support',
    domains: ['social_skills', 'emotional_regulation'],
    qualification_required: 'senco',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'bullying-types',
        title: 'Types of Bullying Experienced',
        description: 'Different forms of bullying',
        items: [
          {
            item_id: 'bully-physical',
            question_text: 'Physical bullying (hitting, kicking, taking belongings)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Very often' },
              ],
            },
            domain: 'social_skills',
          },
          {
            item_id: 'bully-verbal',
            question_text: 'Verbal bullying (name-calling, insults, threats)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Very often' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'bully-social',
            question_text: 'Social/relational bullying (exclusion, rumors, friendship manipulation)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Very often' },
              ],
            },
            domain: 'social_skills',
          },
          {
            item_id: 'bully-cyber',
            question_text: 'Cyberbullying (online/social media harassment)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Very often' },
              ],
            },
            domain: 'emotional_regulation',
          },
        ],
        scoring_instructions: 'Any rating of "Often" or "Very often" warrants immediate action',
      },
      {
        section_id: 'impact',
        title: 'Impact on Wellbeing',
        description: 'Effects of bullying on child',
        items: [
          {
            item_id: 'impact-school-avoid',
            question_text: 'Avoiding school or specific areas/times',
            item_type: 'yes_no',
            domain: 'emotional_regulation',
          },
          {
            item_id: 'impact-academic',
            question_text: 'Decline in academic performance',
            item_type: 'yes_no',
            domain: 'emotional_regulation',
          },
          {
            item_id: 'impact-mood',
            question_text: 'Changes in mood (increased anxiety, low mood, withdrawal)',
            item_type: 'yes_no',
            domain: 'emotional_regulation',
          },
          {
            item_id: 'impact-self-esteem',
            question_text: 'Impact on self-esteem and confidence',
            item_type: 'yes_no',
            domain: 'emotional_regulation',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'Bullying affects 1 in 5 children; disproportionately affects SEND children',
      'Distinguished from conflict by power imbalance and repetition',
      'Can have lasting impact on mental health and wellbeing',
      'Whole-school approach essential (not just individual intervention)',
      'Important to address both bullying behaviour and victimization',
      'Protected characteristics (race, disability, LGBTQ+) require specific consideration',
    ],
    references: [
      'DfE (2017) - Preventing and Tackling Bullying guidance',
      'Anti-Bullying Alliance resources',
      'Olweus (1993) - Bullying at School framework',
    ],
    tags: ['bullying', 'peer-victimization', 'safeguarding', 'wellbeing'],
  },

  {
    id: 'self-esteem-assessment',
    name: 'Self-Esteem and Self-Concept Assessment',
    category: 'social_emotional',
    subcategory: 'Self-Concept',
    description: 'Assessment of self-esteem and self-concept across domains',
    age_range: '8-18',
    administration_time: '15-20',
    purpose: 'Evaluate self-esteem to inform wellbeing support',
    domains: ['emotional_regulation'],
    qualification_required: 'teacher',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'global-self-esteem',
        title: 'Global Self-Esteem',
        description: 'Overall sense of self-worth',
        items: [
          {
            item_id: 'se-general',
            question_text: 'Overall, I feel good about myself',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 5,
              labels: [
                { value: 1, label: 'Strongly disagree' },
                { value: 3, label: 'Neither agree nor disagree' },
                { value: 5, label: 'Strongly agree' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'se-like-myself',
            question_text: 'I like myself the way I am',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 5,
              labels: [
                { value: 1, label: 'Strongly disagree' },
                { value: 3, label: 'Neither agree nor disagree' },
                { value: 5, label: 'Strongly agree' },
              ],
            },
            domain: 'emotional_regulation',
          },
        ],
      },
      {
        section_id: 'academic-self-concept',
        title: 'Academic Self-Concept',
        description: 'Beliefs about academic abilities',
        items: [
          {
            item_id: 'sc-academic',
            question_text: 'I am good at schoolwork',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 5,
              labels: [
                { value: 1, label: 'Strongly disagree' },
                { value: 3, label: 'Neither agree nor disagree' },
                { value: 5, label: 'Strongly agree' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'sc-learning',
            question_text: 'I can learn new things well',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 5,
              labels: [
                { value: 1, label: 'Strongly disagree' },
                { value: 3, label: 'Neither agree nor disagree' },
                { value: 5, label: 'Strongly agree' },
              ],
            },
            domain: 'emotional_regulation',
          },
        ],
      },
      {
        section_id: 'social-self-concept',
        title: 'Social Self-Concept',
        description: 'Beliefs about social abilities and peer relationships',
        items: [
          {
            item_id: 'sc-friends',
            question_text: 'I am good at making friends',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 5,
              labels: [
                { value: 1, label: 'Strongly disagree' },
                { value: 3, label: 'Neither agree nor disagree' },
                { value: 5, label: 'Strongly agree' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'sc-popular',
            question_text: 'Other kids like me',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 5,
              labels: [
                { value: 1, label: 'Strongly disagree' },
                { value: 3, label: 'Neither agree nor disagree' },
                { value: 5, label: 'Strongly agree' },
              ],
            },
            domain: 'emotional_regulation',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'Self-esteem multidimensional - can be high in some areas, low in others',
      'Low self-esteem linked to depression, anxiety, underachievement',
      'SEND learners at risk for low self-esteem due to repeated difficulty/failure',
      'Success experiences and strengths-based approach build self-esteem',
      'Be aware of cultural differences in self-expression',
    ],
    references: [
      'Rosenberg (1965) - Self-Esteem Scale',
      'Harter (1985) - Self-Perception Profile for Children',
      'Marsh & Craven (2006) - Self-concept framework',
    ],
    tags: ['self-esteem', 'self-concept', 'wellbeing', 'mental-health'],
  },

  {
    id: 'transition-readiness-assessment',
    name: 'Transition Readiness Assessment (Post-16)',
    category: 'adaptive',
    subcategory: 'Transition',
    description: 'Assessment of readiness for transition to further education, employment, or independent living',
    age_range: '14-19',
    administration_time: '30-40',
    purpose: 'Evaluate transition readiness to inform transition planning and support',
    domains: ['adaptive_behaviour', 'social_skills'],
    qualification_required: 'senco',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'independent-living-skills',
        title: 'Independent Living Skills',
        description: 'Self-care and daily living skills',
        items: [
          {
            item_id: 'trans-selfcare',
            question_text: 'Manages personal hygiene and self-care independently',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Needs full support' },
                { value: 2, label: 'Needs some support' },
                { value: 3, label: 'Mostly independent' },
                { value: 4, label: 'Fully independent' },
              ],
            },
            domain: 'adaptive_behaviour',
          },
          {
            item_id: 'trans-food',
            question_text: 'Can prepare simple meals and snacks',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'No skills' },
                { value: 2, label: 'Basic skills' },
                { value: 3, label: 'Competent' },
                { value: 4, label: 'Independent' },
              ],
            },
            domain: 'adaptive_behaviour',
          },
          {
            item_id: 'trans-money',
            question_text: 'Manages money and budgeting',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'No understanding' },
                { value: 2, label: 'Basic understanding' },
                { value: 3, label: 'Good understanding' },
                { value: 4, label: 'Independent' },
              ],
            },
            domain: 'adaptive_behaviour',
          },
        ],
      },
      {
        section_id: 'community-access',
        title: 'Community Access Skills',
        description: 'Travel and community participation',
        items: [
          {
            item_id: 'trans-travel',
            question_text: 'Can use public transport independently',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'No skills' },
                { value: 2, label: 'With support' },
                { value: 3, label: 'Familiar routes' },
                { value: 4, label: 'Independent' },
              ],
            },
            domain: 'adaptive_behaviour',
          },
          {
            item_id: 'trans-safety',
            question_text: 'Understands community safety (road safety, stranger awareness)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'No awareness' },
                { value: 2, label: 'Limited awareness' },
                { value: 3, label: 'Good awareness' },
                { value: 4, label: 'Full awareness' },
              ],
            },
            domain: 'adaptive_behaviour',
          },
        ],
      },
      {
        section_id: 'work-readiness',
        title: 'Work Readiness Skills',
        description: 'Employment-related skills',
        items: [
          {
            item_id: 'trans-timekeeping',
            question_text: 'Manages time and punctuality',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Poor' },
                { value: 2, label: 'Needs reminders' },
                { value: 3, label: 'Usually reliable' },
                { value: 4, label: 'Reliable' },
              ],
            },
            domain: 'adaptive_behaviour',
          },
          {
            item_id: 'trans-work-behaviour',
            question_text: 'Demonstrates appropriate workplace behaviour',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Significant difficulties' },
                { value: 2, label: 'Needs support' },
                { value: 3, label: 'Usually appropriate' },
                { value: 4, label: 'Consistently appropriate' },
              ],
            },
            domain: 'social_skills',
          },
        ],
      },
      {
        section_id: 'aspirations',
        title: 'Aspirations and Self-Advocacy',
        description: 'Future goals and self-advocacy skills',
        items: [
          {
            item_id: 'trans-goals',
            question_text: 'Has clear goals for post-16 pathway',
            item_type: 'yes_no',
            domain: 'adaptive_behaviour',
          },
          {
            item_id: 'trans-advocate',
            question_text: 'Can advocate for own needs and preferences',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'No skills' },
                { value: 2, label: 'Emerging' },
                { value: 3, label: 'Developing' },
                { value: 4, label: 'Strong' },
              ],
            },
            domain: 'social_skills',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'Transition planning should begin by Year 9 (age 13-14)',
      'Person-centered approach essential - young person at center of planning',
      'EHCP transition planning statutory from Year 9',
      'Consider supported living, supported employment options',
      'Life skills teaching should be integrated throughout curriculum',
      'Annual reviews should track progress toward transition goals',
    ],
    references: [
      'SEND Code of Practice (2015) - Transition planning',
      'Preparing for Adulthood framework',
      'DfE (2017) - Transition Support for young people with SEND',
    ],
    tags: ['transition', 'post-16', 'independent-living', 'work-readiness', 'EHCP'],
  },

  {
    id: 'resilience-assessment',
    name: 'Resilience and Coping Skills Assessment',
    category: 'social_emotional',
    subcategory: 'Resilience',
    description: 'Assessment of resilience factors and coping strategies',
    age_range: '8-18',
    administration_time: '15-20',
    purpose: 'Identify protective factors and areas to strengthen resilience',
    domains: ['emotional_regulation'],
    qualification_required: 'teacher',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'protective-factors',
        title: 'Protective Factors',
        description: 'Internal and external resources',
        items: [
          {
            item_id: 'res-optimism',
            question_text: 'Shows optimistic outlook (belief things will work out)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Pessimistic' },
                { value: 2, label: 'Somewhat pessimistic' },
                { value: 3, label: 'Somewhat optimistic' },
                { value: 4, label: 'Optimistic' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'res-relationships',
            question_text: 'Has supportive relationships (family, friends, trusted adults)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'No support network' },
                { value: 2, label: 'Limited support' },
                { value: 3, label: 'Good support' },
                { value: 4, label: 'Strong support network' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'res-problem-solve',
            question_text: 'Demonstrates problem-solving skills',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Very limited' },
                { value: 2, label: 'Some skills' },
                { value: 3, label: 'Good skills' },
                { value: 4, label: 'Strong skills' },
              ],
            },
            domain: 'emotional_regulation',
          },
        ],
      },
      {
        section_id: 'coping-strategies',
        title: 'Coping Strategies',
        description: 'How child manages stress and difficulties',
        items: [
          {
            item_id: 'cope-helpful',
            question_text: 'Uses helpful coping strategies (talking, exercise, hobbies, relaxation)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Rarely' },
                { value: 2, label: 'Sometimes' },
                { value: 3, label: 'Often' },
                { value: 4, label: 'Consistently' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'cope-unhelpful',
            question_text: 'Relies on unhelpful coping (avoidance, aggression, withdrawal)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Rarely' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Consistently' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'cope-seek-help',
            question_text: 'Seeks help when struggling',
            item_type: 'rating_scale',
            rating_scale: {
              min: 1,
              max: 4,
              labels: [
                { value: 1, label: 'Never' },
                { value: 2, label: 'Rarely' },
                { value: 3, label: 'Sometimes' },
                { value: 4, label: 'Usually' },
              ],
            },
            domain: 'emotional_regulation',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'Resilience is not fixed - can be developed',
      'Key protective factors: relationships, problem-solving, self-efficacy',
      'Teaching coping strategies improves resilience',
      'Some children naturally more vulnerable (temperament, experiences)',
      'School environment can build or undermine resilience',
    ],
    references: [
      'Masten (2001) - Ordinary Magic: Resilience processes',
      'Rutter (1985) - Resilience in the face of adversity',
      'Newman & Blackburn (2002) - Resilience factors',
    ],
    tags: ['resilience', 'coping', 'protective-factors', 'wellbeing'],
  },

  {
    id: 'parent-concern-questionnaire',
    name: 'Parent/Carer Concerns Questionnaire',
    category: 'screening',
    subcategory: 'Parent Report',
    description: 'Structured questionnaire to gather parent/carer concerns across all developmental areas',
    age_range: '3-16',
    administration_time: '20-25',
    purpose: 'Systematic gathering of parent perspective on child development and wellbeing',
    domains: ['reading', 'numeracy', 'social_skills', 'emotional_regulation', 'motor_skills'],
    qualification_required: 'teacher',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'parent-academic-concerns',
        title: 'Learning and Academic Development',
        description: 'Parent observations of learning',
        items: [
          {
            item_id: 'par-reading',
            question_text: 'Do you have concerns about your child\'s reading?',
            item_type: 'yes_no',
            domain: 'reading',
          },
          {
            item_id: 'par-writing',
            question_text: 'Do you have concerns about your child\'s writing?',
            item_type: 'yes_no',
            domain: 'writing',
          },
          {
            item_id: 'par-maths',
            question_text: 'Do you have concerns about your child\'s maths?',
            item_type: 'yes_no',
            domain: 'numeracy',
          },
          {
            item_id: 'par-homework',
            question_text: 'Does your child struggle significantly with homework?',
            item_type: 'yes_no',
            domain: 'working_memory',
          },
        ],
      },
      {
        section_id: 'parent-behaviour-concerns',
        title: 'Behavior and Emotional Wellbeing',
        description: 'Parent observations of behaviour',
        items: [
          {
            item_id: 'par-behaviour',
            question_text: 'Do you have concerns about your child\'s behaviour at home?',
            item_type: 'yes_no',
            domain: 'emotional_regulation',
          },
          {
            item_id: 'par-mood',
            question_text: 'Do you have concerns about your child\'s mood or emotional wellbeing?',
            item_type: 'yes_no',
            domain: 'emotional_regulation',
          },
          {
            item_id: 'par-anxiety',
            question_text: 'Does your child seem excessively worried or anxious?',
            item_type: 'yes_no',
            domain: 'emotional_regulation',
          },
          {
            item_id: 'par-sleep',
            question_text: 'Does your child have difficulties with sleep?',
            item_type: 'yes_no',
            domain: 'emotional_regulation',
          },
        ],
      },
      {
        section_id: 'parent-social-concerns',
        title: 'Social Development and Friendships',
        description: 'Parent observations of social skills',
        items: [
          {
            item_id: 'par-friends',
            question_text: 'Do you have concerns about your child\'s friendships?',
            item_type: 'yes_no',
            domain: 'social_skills',
          },
          {
            item_id: 'par-social',
            question_text: 'Does your child struggle with social situations?',
            item_type: 'yes_no',
            domain: 'social_skills',
          },
        ],
      },
      {
        section_id: 'parent-open',
        title: 'Additional Concerns',
        description: 'Open-ended parent concerns',
        items: [
          {
            item_id: 'par-other',
            question_text: 'Please describe any other concerns you have about your child\'s development or wellbeing',
            item_type: 'text',
            domain: 'adaptive_behaviour',
          },
          {
            item_id: 'par-strengths',
            question_text: 'What are your child\'s main strengths and interests?',
            item_type: 'text',
            domain: 'adaptive_behaviour',
          },
        ],
      },
    ],
    interpretation_guidelines: [
      'Parent perspective essential - see child across contexts',
      'Parents often first to identify concerns',
      'Value parent expertise about their child',
      'Use questionnaire to structure initial conversation',
      'Follow up any concerns with more specific assessment',
    ],
    references: [
      'SEND Code of Practice (2015) - Parent participation',
      'Working in Partnership with Parents guidance',
    ],
    tags: ['parent-report', 'multi-informant', 'screening', 'holistic-assessment'],
  },

  // ============================================================================
  // SPECIALIZED ASSESSMENTS - SENSORY, VISUAL PERCEPTION, COMMUNICATION
  // ============================================================================

  {
    id: 'sensory-processing-comprehensive',
    name: 'Sensory Processing Comprehensive Assessment',
    category: 'cognitive',
    subcategory: 'Sensory Integration',
    description: 'Detailed assessment of sensory processing across all 7 sensory systems with functional impact analysis',
    age_range: '3-16',
    administration_time: '30-40',
    purpose: 'Identify sensory processing differences affecting learning, behaviour, and participation',
    domains: ['adaptive_behaviour'],
    qualification_required: 'senco',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'tactile-system',
        title: 'Tactile System (Touch)',
        description: 'Responses to touch, texture, temperature',
        items: [
          {
            item_id: 'tact-defensive',
            question_text: 'Shows distress or avoidance of certain textures (clothing tags, messy play, light touch)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/Not a concern' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Constantly/Severe impact' },
              ],
            },
            domain: 'sensory_processing',
          },
          {
            item_id: 'tact-seeking',
            question_text: 'Seeks out touch experiences (touches everything, seeks rough play, poor awareness of touch)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/Not a concern' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Constantly/Severe impact' },
              ],
            },
            domain: 'sensory_processing',
          },
          {
            item_id: 'tact-discrimination',
            question_text: 'Difficulty discriminating objects by touch (finding items in bag, manipulating small objects)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/Not a concern' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Constantly/Severe impact' },
              ],
            },
            domain: 'sensory_processing',
          },
        ],
        scoring_instructions: 'Score 0-9. Score ≥6 suggests significant tactile processing differences.',
      },
      {
        section_id: 'vestibular-system',
        title: 'Vestibular System (Movement, Balance, Spatial Orientation)',
        description: 'Responses to movement, balance, body position in space',
        items: [
          {
            item_id: 'vest-defensive',
            question_text: 'Shows fear or distress with movement (swings, slides, climbing, car rides, escalators)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/Not a concern' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Constantly/Severe impact' },
              ],
            },
            domain: 'sensory_processing',
          },
          {
            item_id: 'vest-seeking',
            question_text: 'Constantly seeks movement (spinning, rocking, running, never sits still, thrill-seeking)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/Not a concern' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Constantly/Severe impact' },
              ],
            },
            domain: 'sensory_processing',
          },
          {
            item_id: 'vest-balance',
            question_text: 'Poor balance and coordination (frequent falls, clumsy, difficulty with stairs)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/Not a concern' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Constantly/Severe impact' },
              ],
            },
            domain: 'sensory_processing',
          },
        ],
        scoring_instructions: 'Score 0-9. Score ≥6 suggests significant vestibular processing differences.',
      },
      {
        section_id: 'proprioceptive-system',
        title: 'Proprioceptive System (Body Awareness, Pressure)',
        description: 'Awareness of body position, muscle/joint input',
        items: [
          {
            item_id: 'prop-awareness',
            question_text: 'Poor body awareness (bumps into people/furniture, misjudges force, breaks things accidentally)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/Not a concern' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Constantly/Severe impact' },
              ],
            },
            domain: 'sensory_processing',
          },
          {
            item_id: 'prop-seeking',
            question_text: 'Seeks deep pressure or heavy work (rough play, tight hugs, biting/chewing, heavy lifting)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/Not a concern' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Constantly/Severe impact' },
              ],
            },
            domain: 'sensory_processing',
          },
          {
            item_id: 'prop-motor',
            question_text: 'Difficulty with motor planning and coordination (learning new movements, PE skills)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/Not a concern' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Constantly/Severe impact' },
              ],
            },
            domain: 'sensory_processing',
          },
        ],
        scoring_instructions: 'Score 0-9. Score ≥6 suggests significant proprioceptive processing differences.',
      },
      {
        section_id: 'visual-system',
        title: 'Visual System',
        description: 'Visual sensitivity and processing',
        items: [
          {
            item_id: 'vis-sensitivity',
            question_text: 'Distressed by bright lights, fluorescent lighting, sunlight, or visual patterns',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/Not a concern' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Constantly/Severe impact' },
              ],
            },
            domain: 'sensory_processing',
          },
          {
            item_id: 'vis-seeking',
            question_text: 'Seeks visual stimulation (stares at lights/screens/spinning objects, fascinated by patterns)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/Not a concern' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Constantly/Severe impact' },
              ],
            },
            domain: 'sensory_processing',
          },
          {
            item_id: 'vis-tracking',
            question_text: 'Difficulty tracking moving objects or maintaining visual focus during reading',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/Not a concern' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Constantly/Severe impact' },
              ],
            },
            domain: 'sensory_processing',
          },
        ],
        scoring_instructions: 'Score 0-9. Score ≥6 suggests significant visual processing differences.',
      },
      {
        section_id: 'auditory-system',
        title: 'Auditory System',
        description: 'Sound sensitivity and auditory processing',
        items: [
          {
            item_id: 'aud-sensitivity',
            question_text: 'Distressed by everyday sounds (hand dryers, fire alarms, vacuum cleaners, noisy environments)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/Not a concern' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Constantly/Severe impact' },
              ],
            },
            domain: 'sensory_processing',
          },
          {
            item_id: 'aud-seeking',
            question_text: 'Seeks out sounds (makes repetitive noises, plays with sound-making objects constantly)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/Not a concern' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Constantly/Severe impact' },
              ],
            },
            domain: 'sensory_processing',
          },
          {
            item_id: 'aud-filtering',
            question_text: 'Difficulty filtering background noise or following speech in noisy environments',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/Not a concern' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Constantly/Severe impact' },
              ],
            },
            domain: 'sensory_processing',
          },
        ],
        scoring_instructions: 'Score 0-9. Score ≥6 suggests significant auditory processing differences.',
      },
      {
        section_id: 'gustatory-system',
        title: 'Gustatory System (Taste)',
        description: 'Food preferences and oral sensitivity',
        items: [
          {
            item_id: 'gust-selective',
            question_text: 'Extremely selective eater (limited food repertoire, specific brands/presentations only)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/Not a concern' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Constantly/Severe impact' },
              ],
            },
            domain: 'sensory_processing',
          },
          {
            item_id: 'gust-seeking',
            question_text: 'Seeks strong flavors or puts non-food items in mouth beyond typical developmental age',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/Not a concern' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Constantly/Severe impact' },
              ],
            },
            domain: 'sensory_processing',
          },
        ],
        scoring_instructions: 'Score 0-6. Score ≥4 suggests significant gustatory processing differences.',
      },
      {
        section_id: 'olfactory-system',
        title: 'Olfactory System (Smell)',
        description: 'Sensitivity to smells',
        items: [
          {
            item_id: 'olf-sensitivity',
            question_text: 'Distressed by everyday smells (food, perfume, cleaning products) that others tolerate',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/Not a concern' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Constantly/Severe impact' },
              ],
            },
            domain: 'sensory_processing',
          },
          {
            item_id: 'olf-seeking',
            question_text: 'Seeks out smells (smells objects/people excessively, seeks strong odors)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/Not a concern' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Constantly/Severe impact' },
              ],
            },
            domain: 'sensory_processing',
          },
        ],
        scoring_instructions: 'Score 0-6. Score ≥4 suggests significant olfactory processing differences.',
      },
      {
        section_id: 'interoception-system',
        title: 'Interoception (Internal Body Sensations)',
        description: 'Awareness of internal body signals',
        items: [
          {
            item_id: 'intero-awareness',
            question_text: 'Difficulty recognizing hunger, thirst, need for toilet, pain, or temperature discomfort',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/Not a concern' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Constantly/Severe impact' },
              ],
            },
            domain: 'sensory_processing',
          },
          {
            item_id: 'intero-emotion',
            question_text: 'Difficulty identifying emotional states or physical feelings associated with emotions',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/Not a concern' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Constantly/Severe impact' },
              ],
            },
            domain: 'sensory_processing',
          },
        ],
        scoring_instructions: 'Score 0-6. Score ≥4 suggests significant interoceptive processing differences.',
      },
      {
        section_id: 'functional-impact',
        title: 'Functional Impact on Daily Life',
        description: 'How sensory differences affect participation and wellbeing',
        items: [
          {
            item_id: 'func-learning',
            question_text: 'Sensory differences interfere with learning or academic performance',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Not at all' },
                { value: 1, label: 'Mild impact' },
                { value: 2, label: 'Moderate impact' },
                { value: 3, label: 'Severe impact' },
              ],
            },
            domain: 'adaptive_behaviour',
          },
          {
            item_id: 'func-social',
            question_text: 'Sensory differences affect social relationships or participation',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Not at all' },
                { value: 1, label: 'Mild impact' },
                { value: 2, label: 'Moderate impact' },
                { value: 3, label: 'Severe impact' },
              ],
            },
            domain: 'adaptive_behaviour',
          },
          {
            item_id: 'func-self-care',
            question_text: 'Sensory differences impact self-care routines (eating, dressing, hygiene, sleep)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Not at all' },
                { value: 1, label: 'Mild impact' },
                { value: 2, label: 'Moderate impact' },
                { value: 3, label: 'Severe impact' },
              ],
            },
            domain: 'adaptive_behaviour',
          },
          {
            item_id: 'func-emotional',
            question_text: 'Sensory differences cause emotional distress or behavioural difficulties',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Not at all' },
                { value: 1, label: 'Mild impact' },
                { value: 2, label: 'Moderate impact' },
                { value: 3, label: 'Severe impact' },
              ],
            },
            domain: 'adaptive_behaviour',
          },
        ],
        scoring_instructions: 'Score 0-12. Score ≥6 indicates sensory differences are significantly impacting daily functioning.',
      },
    ],
    interpretation_guidelines: [
      'Sensory processing differences affect 5-16% of children (higher in autism, ADHD)',
      'Most children show mixed profile - both over-responsive and under-responsive patterns',
      'Sensory seeking behaviour often compensatory mechanism for under-responsivity',
      'Functional impact is key - same sensory profile may or may not cause difficulties',
      'Sensory differences are dimensional - not "disordered" unless causing significant distress/impairment',
      'Occupational Therapy assessment recommended if ≥3 sensory systems affected with functional impact',
      'Classroom accommodations can make substantial difference even without formal diagnosis',
      'Consider co-occurring conditions: autism (90%+ have sensory differences), ADHD (40-60%), anxiety',
      'Sensory differences often explain "challenging behaviour" - sensory-informed approach reduces meltdowns',
    ],
    references: [
      'Dunn (2014) - Sensory Profile 2 and neurological threshold model',
      'Miller et al. (2007) - Sensory Processing Disorder classification',
      'Ayres (1972) - Sensory Integration Theory',
      'Ben-Sasson et al. (2009) - Prevalence of sensory processing difficulties',
      'NICE Autism Guidance (2021) - Sensory assessment and support',
      'Royal College of Occupational Therapists - Sensory Integration guidance',
    ],
    tags: ['sensory-processing', 'sensory-integration', 'occupational-therapy', 'autism', 'interoception', 'multi-system'],
  },

  {
    id: 'visual-perception-comprehensive',
    name: 'Visual Perception Comprehensive Assessment',
    category: 'cognitive',
    subcategory: 'Visual Processing',
    description: 'Comprehensive assessment of visual perceptual skills affecting literacy, numeracy, and coordination',
    age_range: '4-16',
    administration_time: '25-35',
    purpose: 'Identify visual perception difficulties that may underlie literacy, numeracy, or coordination challenges',
    domains: ['perceptual_reasoning', 'reading', 'numeracy', 'motor_skills'],
    qualification_required: 'senco',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'visual-discrimination',
        title: 'Visual Discrimination',
        description: 'Ability to detect differences and similarities in shapes, letters, numbers',
        items: [
          {
            item_id: 'vd-letters',
            question_text: 'Confuses similar-looking letters (b/d, p/q, m/n, u/n)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/age-appropriate' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Consistently/severe' },
              ],
            },
            domain: 'perceptual_reasoning',
          },
          {
            item_id: 'vd-numbers',
            question_text: 'Confuses similar-looking numbers (6/9, 2/5, 1/7)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/age-appropriate' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Consistently/severe' },
              ],
            },
            domain: 'perceptual_reasoning',
          },
          {
            item_id: 'vd-matching',
            question_text: 'Difficulty matching objects or sorting by visual features (color, size, shape)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/age-appropriate' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Consistently/severe' },
              ],
            },
            domain: 'perceptual_reasoning',
          },
        ],
        scoring_instructions: 'Score 0-9. Score ≥5 suggests visual discrimination difficulties.',
      },
      {
        section_id: 'visual-memory',
        title: 'Visual Memory',
        description: 'Ability to recall visual information',
        items: [
          {
            item_id: 'vm-words',
            question_text: 'Difficulty remembering sight words or spelling patterns despite repeated exposure',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/age-appropriate' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Consistently/severe' },
              ],
            },
            domain: 'perceptual_reasoning',
          },
          {
            item_id: 'vm-copying',
            question_text: 'Difficulty copying from board - loses place frequently, needs many checks',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/age-appropriate' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Consistently/severe' },
              ],
            },
            domain: 'perceptual_reasoning',
          },
          {
            item_id: 'vm-recall',
            question_text: 'Difficulty recalling visual details (what someone was wearing, layout of familiar places)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/age-appropriate' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Consistently/severe' },
              ],
            },
            domain: 'perceptual_reasoning',
          },
        ],
        scoring_instructions: 'Score 0-9. Score ≥5 suggests visual memory difficulties.',
      },
      {
        section_id: 'form-constancy',
        title: 'Form Constancy',
        description: 'Recognizing shapes/letters in different orientations, sizes, fonts',
        items: [
          {
            item_id: 'fc-fonts',
            question_text: 'Struggles to recognize letters in different fonts or when handwritten',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/age-appropriate' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Consistently/severe' },
              ],
            },
            domain: 'perceptual_reasoning',
          },
          {
            item_id: 'fc-orientation',
            question_text: 'Difficulty recognizing shapes in different orientations (rotated, flipped)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/age-appropriate' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Consistently/severe' },
              ],
            },
            domain: 'perceptual_reasoning',
          },
        ],
        scoring_instructions: 'Score 0-6. Score ≥4 suggests form constancy difficulties.',
      },
      {
        section_id: 'spatial-relations',
        title: 'Spatial Relations and Position in Space',
        description: 'Understanding position, direction, and spatial relationships',
        items: [
          {
            item_id: 'sr-direction',
            question_text: 'Confuses directional concepts (left/right, over/under, before/after)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/age-appropriate' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Consistently/severe' },
              ],
            },
            domain: 'perceptual_reasoning',
          },
          {
            item_id: 'sr-spacing',
            question_text: 'Poor spacing when writing (words run together, inconsistent letter spacing)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/age-appropriate' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Consistently/severe' },
              ],
            },
            domain: 'perceptual_reasoning',
          },
          {
            item_id: 'sr-alignment',
            question_text: 'Difficulty aligning numbers in columns for maths calculations',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/age-appropriate' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Consistently/severe' },
              ],
            },
            domain: 'perceptual_reasoning',
          },
          {
            item_id: 'sr-navigation',
            question_text: 'Gets lost easily in familiar environments (school building, neighborhood)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/age-appropriate' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Consistently/severe' },
              ],
            },
            domain: 'perceptual_reasoning',
          },
        ],
        scoring_instructions: 'Score 0-12. Score ≥6 suggests spatial relations difficulties.',
      },
      {
        section_id: 'visual-closure',
        title: 'Visual Closure',
        description: 'Identifying complete objects from incomplete visual information',
        items: [
          {
            item_id: 'vc-completion',
            question_text: 'Difficulty recognizing objects or letters when partially hidden or incomplete',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/age-appropriate' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Consistently/severe' },
              ],
            },
            domain: 'perceptual_reasoning',
          },
          {
            item_id: 'vc-puzzle',
            question_text: 'Difficulty with jigsaw puzzles or identifying whole from parts',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/age-appropriate' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Consistently/severe' },
              ],
            },
            domain: 'perceptual_reasoning',
          },
        ],
        scoring_instructions: 'Score 0-6. Score ≥4 suggests visual closure difficulties.',
      },
      {
        section_id: 'figure-ground',
        title: 'Figure-Ground Discrimination',
        description: 'Finding specific information in busy visual field',
        items: [
          {
            item_id: 'fg-page',
            question_text: 'Difficulty finding specific words, numbers, or items on busy page or worksheet',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/age-appropriate' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Consistently/severe' },
              ],
            },
            domain: 'perceptual_reasoning',
          },
          {
            item_id: 'fg-objects',
            question_text: 'Difficulty locating specific objects in cluttered environment (desk, bag, locker)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/age-appropriate' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Consistently/severe' },
              ],
            },
            domain: 'perceptual_reasoning',
          },
          {
            item_id: 'fg-line',
            question_text: 'Loses place when reading - skips lines, re-reads same line',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/age-appropriate' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Consistently/severe' },
              ],
            },
            domain: 'perceptual_reasoning',
          },
        ],
        scoring_instructions: 'Score 0-9. Score ≥5 suggests figure-ground difficulties.',
      },
      {
        section_id: 'visual-motor',
        title: 'Visual-Motor Integration',
        description: 'Coordinating visual information with motor actions',
        items: [
          {
            item_id: 'vm-handwriting',
            question_text: 'Poor handwriting despite adequate fine motor skills (letter formation, sizing, spacing)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/age-appropriate' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Consistently/severe' },
              ],
            },
            domain: 'perceptual_reasoning',
          },
          {
            item_id: 'vm-drawing',
            question_text: 'Difficulty copying shapes, drawings, or geometric figures accurately',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/age-appropriate' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Consistently/severe' },
              ],
            },
            domain: 'perceptual_reasoning',
          },
          {
            item_id: 'vm-sports',
            question_text: 'Difficulty with ball skills and sports requiring eye-hand coordination',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never/age-appropriate' },
                { value: 1, label: 'Occasionally' },
                { value: 2, label: 'Frequently' },
                { value: 3, label: 'Consistently/severe' },
              ],
            },
            domain: 'motor_skills',
          },
        ],
        scoring_instructions: 'Score 0-9. Score ≥5 suggests visual-motor integration difficulties.',
      },
    ],
    interpretation_guidelines: [
      'Visual perception difficulties often underlie unexplained literacy or numeracy struggles',
      'Children with good oral language but poor reading may have visual perception issues',
      'Visual perception is DISTINCT from visual acuity - child may have 20/20 vision but poor perception',
      'Common in children with dyslexia, dysgraphia, dyspraxia, ADHD, autism',
      'Accommodations: simplify visual layout, increase spacing, use color overlays, ruler for tracking',
      'Occupational Therapy can help develop visual perception skills through targeted activities',
      'Consider optometry assessment if visual tracking or binocular vision concerns noted',
      'Visual perception skills are highly trainable with appropriate intervention',
      'Impact often most visible in literacy and numeracy - child "sees" wrong information',
    ],
    references: [
      'Beery-Buktenica VMI (2010) - Visual-Motor Integration assessment',
      'TVPS (2006) - Test of Visual Perceptual Skills',
      'Frostig (1964) - Developmental Test of Visual Perception',
      'Schneck (2010) - Visual perception chapter in occupational therapy',
      'College of Optometrists - Vision and learning guidance',
    ],
    tags: ['visual-perception', 'visual-motor', 'dyslexia', 'dysgraphia', 'literacy', 'spatial-reasoning', 'occupational-therapy'],
  },

  {
    id: 'selective-mutism-assessment',
    name: 'Selective Mutism Assessment',
    category: 'language_communication',
    subcategory: 'Anxiety-Based Communication Disorder',
    description: 'Comprehensive assessment of selective mutism presentation and contextual variation in communication',
    age_range: '3-11',
    administration_time: '20-30',
    purpose: 'Identify selective mutism, understand communication patterns across contexts, and guide intervention',
    domains: ['expressive_language', 'emotional_regulation', 'social_skills'],
    qualification_required: 'senco',
    is_standardized: false,
    norm_referenced: false,
    scoring_method: 'manual',
    sections: [
      {
        section_id: 'communication-profile',
        title: 'Communication Across Contexts',
        description: 'Compare child\'s communication in different settings',
        items: [
          {
            item_id: 'sm-home',
            question_text: 'At home with immediate family, the child:',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 4,
              labels: [
                { value: 0, label: 'Does not speak at all' },
                { value: 1, label: 'Whispers or single words only' },
                { value: 2, label: 'Speaks quietly with limited vocabulary' },
                { value: 3, label: 'Speaks normally but quietly' },
                { value: 4, label: 'Speaks freely, age-appropriate language' },
              ],
            },
            domain: 'expressive_language',
          },
          {
            item_id: 'sm-school',
            question_text: 'At school with teachers, the child:',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 4,
              labels: [
                { value: 0, label: 'Does not speak at all' },
                { value: 1, label: 'Whispers or single words only' },
                { value: 2, label: 'Speaks quietly with limited vocabulary' },
                { value: 3, label: 'Speaks normally but quietly' },
                { value: 4, label: 'Speaks freely, age-appropriate language' },
              ],
            },
            domain: 'expressive_language',
          },
          {
            item_id: 'sm-peers',
            question_text: 'At school with peers, the child:',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 4,
              labels: [
                { value: 0, label: 'Does not speak at all' },
                { value: 1, label: 'Whispers or single words only' },
                { value: 2, label: 'Speaks quietly with limited vocabulary' },
                { value: 3, label: 'Speaks normally but quietly' },
                { value: 4, label: 'Speaks freely, age-appropriate language' },
              ],
            },
            domain: 'expressive_language',
          },
          {
            item_id: 'sm-extended',
            question_text: 'With extended family or familiar adults outside home, the child:',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 4,
              labels: [
                { value: 0, label: 'Does not speak at all' },
                { value: 1, label: 'Whispers or single words only' },
                { value: 2, label: 'Speaks quietly with limited vocabulary' },
                { value: 3, label: 'Speaks normally but quietly' },
                { value: 4, label: 'Speaks freely, age-appropriate language' },
              ],
            },
            domain: 'expressive_language',
          },
          {
            item_id: 'sm-strangers',
            question_text: 'With unfamiliar adults or in new situations, the child:',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 4,
              labels: [
                { value: 0, label: 'Does not speak at all' },
                { value: 1, label: 'Whispers or single words only' },
                { value: 2, label: 'Speaks quietly with limited vocabulary' },
                { value: 3, label: 'Speaks normally but quietly' },
                { value: 4, label: 'Speaks freely, age-appropriate language' },
              ],
            },
            domain: 'expressive_language',
          },
        ],
        scoring_instructions: 'Selective mutism typically shows large discrepancy between contexts. Score difference ≥8 between home and school suggests SM.',
      },
      {
        section_id: 'alternative-communication',
        title: 'Alternative Communication Methods',
        description: 'How child communicates when not speaking',
        items: [
          {
            item_id: 'sm-gestures',
            question_text: 'Uses gestures, pointing, or nodding to communicate',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Primary communication method' },
              ],
            },
            domain: 'expressive_language',
          },
          {
            item_id: 'sm-writing',
            question_text: 'Uses written notes or text messages to communicate (if age-appropriate)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Primary communication method' },
              ],
            },
            domain: 'expressive_language',
          },
          {
            item_id: 'sm-proxy',
            question_text: 'Uses another person (parent, sibling, friend) to speak for them',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Primary communication method' },
              ],
            },
            domain: 'expressive_language',
          },
          {
            item_id: 'sm-frozen',
            question_text: 'Shows "frozen" or stiff body language when expected to speak',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Always' },
              ],
            },
            domain: 'emotional_regulation',
          },
        ],
        scoring_instructions: 'Documents alternative communication strategies.',
      },
      {
        section_id: 'anxiety-indicators',
        title: 'Anxiety Indicators',
        description: 'Physical and behavioural signs of anxiety around speaking',
        items: [
          {
            item_id: 'sm-anx-physical',
            question_text: 'Shows physical signs of anxiety when expected to speak (trembling, sweating, stomach ache)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Always' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'sm-anx-avoid',
            question_text: 'Avoids situations where speaking might be expected',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Always' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'sm-anx-distress',
            question_text: 'Shows distress or panic if directly asked to speak',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Always' },
              ],
            },
            domain: 'emotional_regulation',
          },
          {
            item_id: 'sm-anx-social',
            question_text: 'Shows other signs of social anxiety (avoiding eye contact, staying on edge of groups)',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Never' },
                { value: 1, label: 'Sometimes' },
                { value: 2, label: 'Often' },
                { value: 3, label: 'Always' },
              ],
            },
            domain: 'emotional_regulation',
          },
        ],
        scoring_instructions: 'Score ≥8 indicates significant anxiety associated with speaking.',
      },
      {
        section_id: 'duration-impact',
        title: 'Duration and Functional Impact',
        description: 'How long has this been present and what is the impact?',
        items: [
          {
            item_id: 'sm-duration',
            question_text: 'How long has the child had difficulty speaking in these situations?',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 4,
              labels: [
                { value: 0, label: 'Less than 1 month' },
                { value: 1, label: '1-3 months' },
                { value: 2, label: '3-6 months' },
                { value: 3, label: '6-12 months' },
                { value: 4, label: 'More than 1 year' },
              ],
            },
            domain: 'expressive_language',
          },
          {
            item_id: 'sm-academic',
            question_text: 'Difficulty speaking interferes with academic progress',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Not at all' },
                { value: 1, label: 'Mild impact' },
                { value: 2, label: 'Moderate impact' },
                { value: 3, label: 'Severe impact' },
              ],
            },
            domain: 'expressive_language',
          },
          {
            item_id: 'sm-social-impact',
            question_text: 'Difficulty speaking interferes with peer relationships and social participation',
            item_type: 'rating_scale',
            rating_scale: {
              min: 0,
              max: 3,
              labels: [
                { value: 0, label: 'Not at all' },
                { value: 1, label: 'Mild impact' },
                { value: 2, label: 'Moderate impact' },
                { value: 3, label: 'Severe impact' },
              ],
            },
            domain: 'social_skills',
          },
        ],
        scoring_instructions: 'DSM-5 requires duration >1 month (not including first month of school). Functional impact is key diagnostic criterion.',
      },
      {
        section_id: 'exclusions',
        title: 'Rule Out Other Explanations',
        description: 'Ensure silence is not better explained by other factors',
        items: [
          {
            item_id: 'sm-language',
            question_text: 'Child has age-appropriate language skills in comfortable settings (i.e., not explained by language disorder)',
            item_type: 'yes_no',
            domain: 'expressive_language',
          },
          {
            item_id: 'sm-eal',
            question_text: 'If child is learning English, difficulty is NOT solely due to lack of knowledge of English',
            item_type: 'yes_no',
            domain: 'expressive_language',
          },
          {
            item_id: 'sm-autism',
            question_text: 'Communication difficulties are NOT better explained by autism spectrum condition',
            item_type: 'yes_no',
            domain: 'expressive_language',
          },
          {
            item_id: 'sm-willful',
            question_text: 'Child\'s silence appears involuntary - driven by anxiety rather than defiance or choice',
            item_type: 'yes_no',
            domain: 'emotional_regulation',
          },
        ],
        scoring_instructions: 'All items should be "yes" for SM diagnosis. If "no", consider alternative explanations.',
      },
    ],
    interpretation_guidelines: [
      'Selective mutism is an ANXIETY disorder - not oppositional or willful behaviour',
      'DSM-5 diagnostic criteria: consistent failure to speak in specific social situations (where speaking expected) for >1 month, interferes with functioning, not due to lack of language knowledge or another condition',
      'Onset typically 2-5 years, often identified when starting school',
      'More common in girls (2:1 ratio); prevalence ~0.7-0.8%',
      'Often co-occurs with social anxiety disorder (90%+), other anxiety disorders, sensory sensitivities',
      'Early intervention critical - longer duration = poorer prognosis',
      'Evidence-based interventions: gradual exposure (sliding-in technique), stimulus fading, positive reinforcement for verbal communication',
      'What NOT to do: bribing, forcing, punishing, excessive attention to non-speaking',
      'Multidisciplinary approach: EP/psychologist for anxiety support, SALT to rule out language disorder, pediatrician if needed',
      'Parents and teachers need training on SM - common misunderstandings ("just shy", "manipulative") delay support',
      'Reasonable adjustments: extra time, alternative assessment methods initially, no public pressure to speak',
    ],
    references: [
      'DSM-5 (2013) - Selective Mutism diagnostic criteria',
      'NICE (2013) - Social anxiety disorder guidance',
      'Selective Mutism Resource Manual (Johnson & Wintgens, 2016)',
      'iSpeak: Intensive Selective Mutism Intervention (SMart Center)',
      'Oerbeck et al. (2014) - Selective mutism prognosis',
      'SMIRA (Selective Mutism Information & Research Association) - UK charity resources',
    ],
    tags: ['selective-mutism', 'emotional_regulation', 'social-anxiety', 'communication-disorder', 'early-intervention'],
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get assessments by category
 */
export function getAssessmentsByCategory(category: AssessmentCategory): AssessmentTemplate[] {
  return ASSESSMENT_LIBRARY.filter((assessment) => assessment.category === category);
}

/**
 * Get assessments by age range
 */
export function getAssessmentsByAge(age: number): AssessmentTemplate[] {
  return ASSESSMENT_LIBRARY.filter((assessment) => {
    const [minAge, maxAge] = assessment.age_range.split('-').map((a) => parseInt(a));
    return age >= minAge && age <= maxAge;
  });
}

/**
 * Get assessments by qualification level
 */
export function getAssessmentsByQualification(qualification: QualificationLevel): AssessmentTemplate[] {
  return ASSESSMENT_LIBRARY.filter((assessment) => assessment.qualification_required === qualification);
}

/**
 * Search assessments
 */
export function searchAssessments(query: string): AssessmentTemplate[] {
  const lowerQuery = query.toLowerCase();
  return ASSESSMENT_LIBRARY.filter(
    (assessment) =>
      assessment.name.toLowerCase().includes(lowerQuery) ||
      assessment.description.toLowerCase().includes(lowerQuery) ||
      assessment.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get assessment by ID
 */
export function getAssessmentById(id: string): AssessmentTemplate | undefined {
  return ASSESSMENT_LIBRARY.find((assessment) => assessment.id === id);
}

/**
 * Get assessment categories with counts
 */
export function getAssessmentCategories(): { category: AssessmentCategory; count: number; label: string }[] {
  const categories: { category: AssessmentCategory; count: number; label: string }[] = [
    { category: 'cognitive', count: 0, label: 'Cognitive Ability' },
    { category: 'literacy', count: 0, label: 'Literacy' },
    { category: 'numeracy', count: 0, label: 'Numeracy' },
    { category: 'language_communication', count: 0, label: 'Language & Communication' },
    { category: 'social_emotional', count: 0, label: 'Social-Emotional' },
    { category: 'behavioural', count: 0, label: 'Behavioural' },
    { category: 'adaptive', count: 0, label: 'Adaptive Behaviour' },
    { category: 'developmental', count: 0, label: 'Developmental' },
    { category: 'sensory', count: 0, label: 'Sensory Processing' },
    { category: 'executive_function', count: 0, label: 'Executive Function' },
    { category: 'observation', count: 0, label: 'Observations' },
    { category: 'screening', count: 0, label: 'Screening' },
  ];

  ASSESSMENT_LIBRARY.forEach((assessment) => {
    const category = categories.find((c) => c.category === assessment.category);
    if (category) {
      category.count++;
    }
  });

  return categories.filter((c) => c.count > 0);
}
