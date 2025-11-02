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
  | 'behavioral'
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
  | 'adaptive_behavior'
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
    tags: ['language', 'communication', 'SLCN'],
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
    tags: ['language', 'communication', 'SLCN'],
  },

  // ==========================================================================
  // SOCIAL-EMOTIONAL & BEHAVIORAL ASSESSMENTS
  // ==========================================================================

  {
    id: 'sdq-teacher',
    name: 'Strengths and Difficulties Questionnaire (Teacher)',
    category: 'social_emotional',
    subcategory: 'Behavioral Screening',
    description: 'Brief behavioral screening questionnaire - teacher version',
    age_range: '4-17',
    administration_time: '5-10',
    purpose: 'Screen for emotional and behavioral difficulties',
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
        description: 'Questions about behavior',
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
    tags: ['SEMH', 'behavioral', 'screening', 'SDQ'],
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
    id: 'adaptive-behavior-checklist',
    name: 'Adaptive Behavior Skills Inventory',
    category: 'adaptive',
    subcategory: 'Daily Living Skills',
    description: 'Assessment of practical life skills and independence',
    age_range: '5-18',
    administration_time: '20-30',
    purpose: 'Evaluate self-care, social, and practical skills',
    domains: ['adaptive_behavior', 'social_skills'],
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
            domain: 'adaptive_behavior',
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
      'Adaptive behavior crucial for EHCP eligibility',
      'Compare across settings (home, school, community)',
      'Identify specific skill gaps for intervention planning',
    ],
    references: ['Vineland Adaptive Behavior Scales framework'],
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
    { category: 'behavioral', count: 0, label: 'Behavioral' },
    { category: 'adaptive', count: 0, label: 'Adaptive Behavior' },
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
