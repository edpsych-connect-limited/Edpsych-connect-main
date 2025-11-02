/**
 * EdPsych Connect Cognitive Assessment (ECCA)
 * Version 1.0
 *
 * Copyright © 2025 EdPsych Connect Limited. All rights reserved.
 *
 * EVIDENCE BASE:
 * - Vygotsky, L. S. (1978). Mind in Society: Development of Higher Psychological Processes
 * - Feuerstein, R. (1979). Dynamic Assessment of Retarded Performers
 * - Baddeley, A. (2000). The episodic buffer: a new component of working memory?
 * - Diamond, A. (2013). Executive Functions. Annual Review of Psychology
 * - Gathercole, S. E., & Alloway, T. P. (2008). Working Memory and Learning
 * - Dockrell, J. E., & McShane, J. (1992). Children's Learning Difficulties
 *
 * THEORETICAL FRAMEWORKS:
 * - Vygotskian Socio-Cultural Theory (Zone of Proximal Development)
 * - Feuerstein's Mediated Learning Experience
 * - Information Processing Theory (Atkinson-Shiffrin Model)
 * - Executive Function Framework (Diamond, 2013)
 * - Working Memory Model (Baddeley & Hitch, 1974; updated 2000)
 *
 * KEY PRINCIPLES:
 * - Dynamic assessment approach (test-teach-retest)
 * - Strengths-based observation
 * - Qualitative descriptors (not standardized scores)
 * - EP professional judgment central
 * - Collaborative multi-informant input
 * - Evidence-to-provision mapping
 */

import { AssessmentFramework } from '@/types/assessments';

export const eccaFramework: AssessmentFramework = {
  id: 'ecca-v1',
  name: 'EdPsych Connect Cognitive Assessment',
  abbreviation: 'ECCA',
  version: '1.0',
  domain: 'Cognitive & Learning',

  description: `
The EdPsych Connect Cognitive Assessment (ECCA) is a dynamic, strengths-based assessment
tool designed for Educational Psychologists to explore cognitive processes that underpin
learning. Unlike standardized tests that provide normative scores, ECCA focuses on
qualitative observation, mediated learning experiences, and identification of both
strengths and areas for development within the child's zone of proximal development.

ECCA is not a replacement for professional judgment but a structured framework to guide
systematic observation, collaborative input gathering, and evidence-based interpretation.
  `.trim(),

  purpose: `
ECCA is designed to:
1. Guide EP observation of cognitive processes in authentic learning contexts
2. Identify cognitive strengths that can be leveraged for learning
3. Explore barriers to learning and their cognitive underpinnings
4. Assess learning potential through dynamic, mediated assessment
5. Generate evidence-based recommendations for provision
6. Facilitate multi-informant collaboration (EP, parent, teacher, child)
7. Map cognitive profiles to appropriate interventions and support
  `.trim(),

  age_range_min: 5,
  age_range_max: 18,

  evidence_base: {
    primary_research: [
      {
        citation: 'Vygotsky, L. S. (1978). Mind in Society: Development of Higher Psychological Processes. Harvard University Press.',
        relevance: 'Zone of Proximal Development - foundation for dynamic assessment approach',
      },
      {
        citation: 'Feuerstein, R., Rand, Y., & Hoffman, M. B. (1979). The Dynamic Assessment of Retarded Performers: The Learning Potential Assessment Device. University Park Press.',
        relevance: 'Mediated Learning Experience - test-teach-retest methodology',
      },
      {
        citation: 'Baddeley, A. (2000). The episodic buffer: a new component of working memory? Trends in Cognitive Sciences, 4(11), 417-423.',
        relevance: 'Working Memory Model - theoretical framework for memory assessment',
      },
      {
        citation: 'Diamond, A. (2013). Executive Functions. Annual Review of Psychology, 64, 135-168.',
        relevance: 'Executive Function Framework - attention, inhibition, cognitive flexibility',
      },
      {
        citation: 'Gathercole, S. E., & Alloway, T. P. (2008). Working Memory and Learning: A Practical Guide for Teachers. SAGE.',
        relevance: 'Working memory in educational contexts - practical applications',
      },
    ],
    supporting_research: [
      {
        citation: 'Dockrell, J. E., & McShane, J. (1992). Children\'s Learning Difficulties: A Cognitive Approach. Blackwell.',
        relevance: 'Cognitive approach to understanding learning difficulties',
      },
      {
        citation: 'Lidz, C. S., & Elliott, J. G. (Eds.). (2000). Dynamic Assessment: Prevailing Models and Applications. JAI Press.',
        relevance: 'Contemporary dynamic assessment approaches',
      },
    ],
  },

  theoretical_frameworks: [
    'Vygotskian Socio-Cultural Theory',
    'Feuerstein Mediated Learning Experience',
    'Information Processing Theory',
    'Executive Function Framework',
    'Working Memory Model',
  ],

  administration_guide: {
    overview: `
ECCA is administered through systematic observation across four cognitive domains.
The EP conducts observations in naturalistic learning contexts, uses mediated learning
experiences to explore learning potential, and integrates collaborative input from
parents, teachers, and the child themselves.
    `.trim(),

    steps: [
      {
        step: 1,
        title: 'Preparation and Context Review',
        description: 'Review referral information, previous assessments, and gather initial context from teachers and parents.',
        time_estimate: '30-45 minutes',
        key_actions: [
          'Review case file and referral information',
          'Identify specific cognitive concerns or questions',
          'Prepare observation materials (age-appropriate tasks)',
          'Arrange observation opportunities in natural learning contexts',
        ],
      },
      {
        step: 2,
        title: 'Domain-by-Domain Observation',
        description: 'Systematically observe the child across the four cognitive domains using guided prompts and suggested tasks.',
        time_estimate: '90-120 minutes (across multiple sessions)',
        key_actions: [
          'Conduct observations in natural learning contexts',
          'Use mediated learning experiences (test-teach-retest)',
          'Note strengths and learning strategies',
          'Explore barriers and their cognitive basis',
          'Document observations narratively',
        ],
      },
      {
        step: 3,
        title: 'Collaborative Input Gathering',
        description: 'Invite and integrate perspectives from parents, teachers, and the child.',
        time_estimate: '30-60 minutes',
        key_actions: [
          'Send structured input forms to parents and teachers',
          'Conduct child consultation using age-appropriate methods',
          'Review and integrate collaborative input',
          'Identify areas of consensus and divergence',
        ],
      },
      {
        step: 4,
        title: 'Professional Interpretation and Formulation',
        description: 'Synthesize observations and collaborative input into a coherent cognitive profile.',
        time_estimate: '60-90 minutes',
        key_actions: [
          'Identify cognitive strengths and their functional impact',
          'Explore cognitive needs and their learning implications',
          'Consider interactions between cognitive domains',
          'Apply theoretical frameworks to interpret patterns',
          'Develop evidence-based formulation',
        ],
      },
      {
        step: 5,
        title: 'Recommendations and Provision Mapping',
        description: 'Generate evidence-based recommendations mapped to appropriate provisions.',
        time_estimate: '45-60 minutes',
        key_actions: [
          'Link cognitive profile to evidence-based interventions',
          'Specify provisions (WHAT/WHO/WHERE/HOW OFTEN)',
          'Ensure provisions are school-deliverable',
          'Map recommendations to EHCP sections if applicable',
          'Consider monitoring and review arrangements',
        ],
      },
    ],

    materials_needed: [
      'Age-appropriate learning tasks (provided in framework)',
      'Observation recording sheets',
      'Collaborative input forms (digital or paper)',
      'Quiet space for focused observation',
      'Access to natural learning contexts (classroom, playground)',
    ],

    important_notes: [
      'ECCA is not a standardized test and does not produce normative scores',
      'All observations are interpreted through EP professional judgment',
      'Dynamic assessment (test-teach-retest) is essential, not optional',
      'Focus on what the child CAN do with support (Zone of Proximal Development)',
      'Strengths-based approach throughout',
      'Multiple observations across contexts recommended',
    ],
  },

  time_estimate_minutes: 180,

  interpretation_guide: {
    principles: [
      {
        title: 'Strengths-Based Interpretation',
        description: 'Always begin with cognitive strengths. What can the child do well? What strategies do they use successfully? How can strengths be leveraged?',
      },
      {
        title: 'Zone of Proximal Development',
        description: 'Focus on what the child can achieve with support. What mediated learning experiences led to progress? What level of scaffolding is needed?',
      },
      {
        title: 'Pattern Recognition',
        description: 'Look for patterns across domains. Are difficulties domain-specific or generalized? Do strengths in one domain compensate for needs in another?',
      },
      {
        title: 'Functional Impact',
        description: 'Consider the real-world implications. How do cognitive profiles affect classroom learning, social interaction, independence?',
      },
      {
        title: 'Theoretical Coherence',
        description: 'Apply theoretical frameworks to make sense of observations. Does the profile align with executive function theory, working memory models, etc.?',
      },
    ],

    red_flags: [
      'Significant discrepancy between observed strengths and needs',
      'Minimal response to mediated learning (limited learning potential)',
      'Profile inconsistent with previous assessments or teacher observations',
      'Possible sensory or neurological factors that require investigation',
      'Emotional or wellbeing factors affecting cognitive performance',
    ],

    common_pitfalls: [
      'Over-reliance on single observations or contexts',
      'Deficit-focused language (always balance needs with strengths)',
      'Ignoring child and family perspectives',
      'Recommendations that are not evidence-based or school-deliverable',
      'Missing interactions between cognitive domains',
    ],
  },

  qualitative_descriptors: {
    strength_levels: [
      {
        level: 'Significant Strength',
        description: 'Consistently strong performance across multiple contexts with minimal support needed',
        indicators: ['Independent application', 'Teaching others', 'Generalization across contexts'],
      },
      {
        level: 'Emerging Strength',
        description: 'Developing competence with some support; potential for further development',
        indicators: ['Success with scaffolding', 'Variable performance', 'Responds well to teaching'],
      },
      {
        level: 'Within Expected Range',
        description: 'Age-appropriate performance with typical support',
        indicators: ['Adequate for age', 'Typical progress', 'Standard teaching approaches effective'],
      },
    ],

    need_levels: [
      {
        level: 'Area for Development',
        description: 'Some difficulty evident; benefits from targeted support',
        indicators: ['Inconsistent performance', 'Needs additional scaffolding', 'Responds to targeted intervention'],
      },
      {
        level: 'Significant Need',
        description: 'Marked difficulty affecting learning; requires substantial support',
        indicators: ['Persistent difficulty', 'Limited independent progress', 'Requires specialized intervention'],
      },
      {
        level: 'Priority Need',
        description: 'Substantial barrier to learning; urgent intervention required',
        indicators: ['Severe difficulty', 'Major impact on access to learning', 'Intensive support essential'],
      },
    ],
  },

  domains: [
    {
      id: 'ecca-domain-working-memory',
      name: 'Working Memory and Information Processing',
      description: `
Working memory is the ability to hold and manipulate information in mind over short periods.
It is crucial for following multi-step instructions, mental arithmetic, reading comprehension,
and problem-solving. Based on Baddeley's Working Memory Model (2000), this domain assesses
the phonological loop, visuospatial sketchpad, episodic buffer, and central executive.
      `.trim(),
      order_index: 1,

      observation_prompts: {
        key_questions: [
          'How does the child manage multi-step instructions?',
          'Can they hold information in mind while processing?',
          'Do they use strategies to support memory (rehearsal, visualization)?',
          'How do they cope with cognitive load in learning tasks?',
          'Can they update information when task demands change?',
        ],

        observation_contexts: [
          'Following classroom instructions (verbal and written)',
          'Mental arithmetic or number tasks',
          'Reading comprehension (holding earlier text in mind)',
          'Practical tasks requiring multiple steps',
          'Problem-solving activities',
        ],

        what_to_notice: [
          'Ability to follow multi-step instructions without repetition',
          'Use of memory strategies (repetition, chunking, visualization)',
          'Impact of distractions on memory performance',
          'Difference between verbal and visual memory tasks',
          'Learning when information is presented in chunks vs. all at once',
        ],
      },

      task_suggestions: [
        {
          task: 'Digit Span (Forward and Backward)',
          description: 'Present sequences of numbers and ask child to repeat. Forward tests capacity; backward tests manipulation.',
          age_appropriate: '5-18',
          materials: 'None (verbal)',
          dynamic_component: 'Teach chunking strategy and retest',
        },
        {
          task: 'Following Multi-Step Instructions',
          description: 'Give progressively complex instructions (e.g., "Touch your nose, then point to the door, then clap twice")',
          age_appropriate: '5-18',
          materials: 'None (context-based)',
          dynamic_component: 'Teach rehearsal strategy and retest',
        },
        {
          task: 'Mental Arithmetic',
          description: 'Age-appropriate arithmetic without paper/pencil (holding numbers in mind)',
          age_appropriate: '7-18',
          materials: 'None (verbal)',
          dynamic_component: 'Teach visualization strategy and retest',
        },
        {
          task: 'Story Retelling with Questions',
          description: 'Read short story, ask comprehension questions requiring integration of earlier and later information',
          age_appropriate: '5-18',
          materials: 'Age-appropriate text',
          dynamic_component: 'Teach note-taking strategy and retest',
        },
      ],

      key_indicators: {
        strengths: [
          'Follows multi-step instructions independently',
          'Uses effective memory strategies spontaneously',
          'Can hold information in mind while processing',
          'Transfers learning across contexts',
          'Manages cognitive load effectively',
        ],
        needs: [
          'Loses track of instructions midway',
          'Struggles with tasks requiring mental manipulation',
          'Does not use memory strategies without prompting',
          'Performance deteriorates with increased cognitive load',
          'Difficulty integrating new information with existing knowledge',
        ],
      },

      parent_questions: [
        {
          question: 'How does your child manage instructions at home (e.g., "Get your shoes, coat, and bag")?',
          response_type: 'narrative',
          prompts: ['Do they need reminders?', 'Do they do one thing then forget the rest?', 'Do they use strategies like lists?'],
        },
        {
          question: 'What strategies does your child use to remember things (homework, appointments, etc.)?',
          response_type: 'narrative',
          prompts: ['Do they use technology, notes, or verbal rehearsal?', 'Do strategies work for them?'],
        },
        {
          question: 'Have you noticed any patterns in when your child remembers or forgets things?',
          response_type: 'narrative',
          prompts: ['Time of day?', 'When stressed or tired?', 'Type of information?'],
        },
      ],

      teacher_questions: [
        {
          question: 'How does the child manage classroom instructions compared to peers?',
          response_type: 'narrative',
          prompts: ['Do they need instructions repeated?', 'Do they ask for clarification?', 'Do they start tasks independently?'],
        },
        {
          question: 'What memory strategies have you observed the child using (or not using)?',
          response_type: 'narrative',
          prompts: ['Rehearsal, note-taking, asking for repetition?'],
        },
        {
          question: 'In which subjects or activities does the child show stronger/weaker working memory?',
          response_type: 'narrative',
          prompts: ['Literacy vs. numeracy?', 'Verbal vs. visual tasks?'],
        },
      ],

      child_prompts: [
        {
          prompt: 'What do you do when you need to remember lots of things?',
          age_range: '7-18',
          method: 'conversation',
        },
        {
          prompt: 'Is it easier for you to remember things you hear or things you see?',
          age_range: '7-18',
          method: 'conversation',
        },
        {
          prompt: 'What helps you remember instructions at school?',
          age_range: '5-18',
          method: 'conversation',
        },
      ],

      interpretation_guidance: {
        patterns_to_consider: [
          'Verbal vs. visual working memory discrepancy',
          'Impact of cognitive load on performance',
          'Effectiveness of mediated learning and strategy teaching',
          'Relationship between working memory and attention',
          'Compensation strategies already in use',
        ],

        theoretical_links: [
          'Baddeley\'s Working Memory Model (phonological loop, visuospatial sketchpad, episodic buffer, central executive)',
          'Information Processing Theory (encoding, storage, retrieval)',
          'Cognitive Load Theory (intrinsic, extraneous, germane load)',
        ],

        functional_implications: [
          'Following classroom instructions',
          'Reading comprehension (holding earlier text in mind)',
          'Mental arithmetic',
          'Problem-solving',
          'Note-taking',
          'Organization and planning',
        ],
      },

      strength_descriptors: [
        'Excellent capacity to hold multiple pieces of information in mind',
        'Effective use of memory strategies (rehearsal, chunking, visualization)',
        'Strong ability to manipulate information mentally',
        'Manages cognitive load effectively across tasks',
        'Transfers learning and strategies across contexts',
      ],

      need_descriptors: [
        'Difficulty holding multiple pieces of information in mind',
        'Struggles to follow multi-step instructions without support',
        'Limited use of memory strategies spontaneously',
        'Performance deteriorates rapidly with cognitive load',
        'Needs additional time and repetition to process information',
      ],

      suggested_interventions: [
        {
          intervention: 'Working Memory Training Programs',
          evidence_base: 'Cogmed, Jungle Memory (UK-based)',
          description: 'Structured programs targeting working memory capacity through adaptive training',
          suitability: 'Significant need level',
        },
        {
          intervention: 'Strategy Teaching',
          evidence_base: 'Gathercole & Alloway (2008) - Working Memory and Learning',
          description: 'Explicit teaching of memory strategies: rehearsal, chunking, visualization, note-taking',
          suitability: 'All need levels',
        },
        {
          intervention: 'Reduce Cognitive Load Approaches',
          evidence_base: 'Cognitive Load Theory (Sweller)',
          description: 'Breaking tasks into smaller steps, visual aids, pre-teaching vocabulary, reducing extraneous load',
          suitability: 'All need levels',
        },
        {
          intervention: 'Memory Aids and Scaffolds',
          evidence_base: 'Assistive technology approaches',
          description: 'Visual timetables, checklists, technology (voice recorders, reminder apps), written instructions',
          suitability: 'All need levels',
        },
      ],
    },

    // Additional domains would follow the same structure:
    // - Attention and Executive Function
    // - Processing Speed and Efficiency
    // - Learning and Memory Consolidation
  ],

  status: 'active',
  is_proprietary: true,
  copyright_holder: 'EdPsych Connect Limited',
};
