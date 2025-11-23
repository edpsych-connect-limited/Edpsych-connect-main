import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const eccaFramework = {
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

    {
      id: 'ecca-domain-attention-executive-function',
      name: 'Attention and Executive Function',
      description: `
Executive functions are cognitive control processes that enable goal-directed behavior and
self-regulation. Based on Diamond's (2013) framework, this domain assesses three core executive
functions: inhibitory control (selective attention, response inhibition), working memory (covered
in Domain 1), and cognitive flexibility (set-shifting, perspective-taking). These processes are
foundational for learning, social interaction, and adaptive behavior across contexts.
      `.trim(),
      order_index: 2,

      observation_prompts: {
        key_questions: [
          'How does the child maintain focus on tasks amid distractions?',
          'Can they inhibit impulsive responses when needed?',
          'How flexibly do they shift between tasks or perspectives?',
          'Can they plan and organize their approach to complex tasks?',
          'How do they regulate their attention (sustain, shift, divide)?',
        ],

        observation_contexts: [
          'Sustained attention tasks (reading, writing, independent work)',
          'Group activities with competing demands',
          'Transitions between activities or subjects',
          'Problem-solving requiring planning',
          'Social situations requiring perspective-taking',
          'Tasks requiring impulse control (waiting turn, not calling out)',
        ],

        what_to_notice: [
          'Ability to sustain focus on age-appropriate tasks',
          'Response to distractions (external and internal)',
          'Flexibility when task demands change',
          'Impulsivity levels (cognitive and motor)',
          'Use of self-regulation strategies',
          'Difference between structured and unstructured contexts',
        ],
      },

      task_suggestions: [
        {
          task: 'Go/No-Go Task',
          description: 'Respond to target stimuli but inhibit response to non-targets (e.g., clap for red, stay still for blue)',
          age_appropriate: '5-18',
          materials: 'Colored cards or verbal cues',
          dynamic_component: 'Teach self-talk strategy ("wait, check, respond") and retest',
        },
        {
          task: 'Trail Making / Sequencing Tasks',
          description: 'Connect items in sequence (numbers then letters alternating, or by category)',
          age_appropriate: '7-18',
          materials: 'Printed worksheets or drawn circles with numbers/letters',
          dynamic_component: 'Teach planning strategy ("look ahead before starting") and retest',
        },
        {
          task: 'Wisconsin Card Sort Analogue',
          description: 'Sort items by one rule, then switch to different rule when cued (color→shape→number)',
          age_appropriate: '6-18',
          materials: 'Cards with multiple attributes',
          dynamic_component: 'Teach set-shifting strategy ("old rule off, new rule on") and retest',
        },
        {
          task: 'Tower of London / Planning Tasks',
          description: 'Move items from start to goal configuration with rules (e.g., only one disk moved at a time)',
          age_appropriate: '7-18',
          materials: 'Physical or drawn tower puzzle',
          dynamic_component: 'Teach "think ahead" and "work backwards" strategies, then retest',
        },
        {
          task: 'Sustained Attention to Response Task (SART)',
          description: 'Respond to frequent stimuli but withhold for rare targets (tests vigilance and inhibition)',
          age_appropriate: '8-18',
          materials: 'Number sequences or letter strings',
          dynamic_component: 'Teach self-monitoring strategy ("check yourself") and retest',
        },
      ],

      key_indicators: {
        strengths: [
          'Maintains sustained attention on age-appropriate tasks',
          'Inhibits impulsive responses effectively',
          'Shifts flexibly between tasks and strategies',
          'Plans and organizes approach to complex problems',
          'Uses self-regulation strategies independently',
          'Monitors own performance and corrects errors',
        ],
        needs: [
          'Difficulty sustaining attention beyond brief periods',
          'Impulsive responding (motor or verbal)',
          'Struggles to shift between tasks or rules',
          'Difficulty planning multi-step tasks',
          'Limited use of self-regulation strategies',
          'Does not monitor or correct own errors',
          'Performance highly variable across contexts',
        ],
      },

      parent_questions: [
        {
          question: 'How long can your child focus on activities they enjoy vs. activities they find less interesting?',
          response_type: 'narrative',
          prompts: ['TV/gaming vs. homework?', 'Do they stick with tasks when challenging?'],
        },
        {
          question: 'Have you noticed impulsivity in your child? (acting before thinking, interrupting, difficulty waiting)',
          response_type: 'narrative',
          prompts: ['Examples?', 'Contexts where more/less pronounced?'],
        },
        {
          question: 'How does your child handle transitions or changes to plans?',
          response_type: 'narrative',
          prompts: ['Flexible or rigid?', 'Need warnings/preparation?'],
        },
        {
          question: 'Does your child use any strategies to stay focused or manage their behavior?',
          response_type: 'narrative',
          prompts: ['Fidget tools, timers, reminders, breaking tasks into steps?'],
        },
      ],

      teacher_questions: [
        {
          question: 'How does the child\'s attention compare to peers in structured vs. unstructured activities?',
          response_type: 'narrative',
          prompts: ['Carpet time vs. group work?', 'Classroom vs. playground?'],
        },
        {
          question: 'What executive function strengths have you observed? (planning, organization, self-monitoring)',
          response_type: 'narrative',
          prompts: ['Specific examples?'],
        },
        {
          question: 'What impulsivity or inflexibility challenges have you noticed?',
          response_type: 'narrative',
          prompts: ['Calling out, not waiting turn, rigidity with rules?'],
        },
        {
          question: 'How does the child respond to behavioral supports already in place?',
          response_type: 'narrative',
          prompts: ['Visual schedules, timers, movement breaks?'],
        },
      ],

      child_prompts: [
        {
          prompt: 'What helps you pay attention in class?',
          age_range: '5-18',
          method: 'conversation',
        },
        {
          prompt: 'What do you do when you feel distracted or your mind wanders?',
          age_range: '7-18',
          method: 'conversation',
        },
        {
          prompt: 'How do you feel when plans change suddenly? What helps?',
          age_range: '7-18',
          method: 'conversation',
        },
        {
          prompt: 'What do you do when a task feels too big or tricky?',
          age_range: '6-18',
          method: 'conversation',
        },
      ],

      interpretation_guidance: {
        patterns_to_consider: [
          'Profile across inhibition, flexibility, and planning',
          'Context effects (structured vs. unstructured, novel vs. familiar)',
          'Relationship between attention and working memory (Domain 1)',
          'Impact of motivation and interest on executive function',
          'Effectiveness of mediated learning and strategy teaching',
          'Developmental trajectory (EF develops through adolescence)',
        ],

        theoretical_links: [
          'Diamond\'s (2013) Three Core Executive Functions (inhibition, working memory, cognitive flexibility)',
          'Barkley\'s Model of ADHD and Executive Function',
          'Miyake et al. (2000) Unity and Diversity of Executive Functions',
          'Posner & Rothbart Attention Networks (alerting, orienting, executive control)',
        ],

        functional_implications: [
          'Classroom attention and participation',
          'Following rules and behavioral expectations',
          'Problem-solving and planning',
          'Social flexibility and perspective-taking',
          'Emotional regulation (related to inhibitory control)',
          'Academic organization and time management',
        ],
      },

      strength_descriptors: [
        'Strong capacity for sustained, focused attention',
        'Effective inhibitory control (resists distraction, inhibits impulses)',
        'Flexible thinking and adapting to new situations',
        'Plans and organizes approach to tasks systematically',
        'Monitors own performance and corrects errors',
        'Uses self-regulation strategies independently',
      ],

      need_descriptors: [
        'Difficulty sustaining attention on tasks',
        'Impulsive responding (verbal or motor)',
        'Struggles with cognitive flexibility and set-shifting',
        'Limited planning and organizational skills',
        'Does not monitor or correct own errors',
        'Requires significant external regulation and support',
      ],

      suggested_interventions: [
        {
          intervention: 'Cognitive Training for Executive Functions',
          evidence_base: 'CogMed, Cognifit (UK adaptations); Diamond & Lee (2011)',
          description: 'Structured programs targeting inhibition, working memory, and cognitive flexibility',
          suitability: 'Moderate to significant need',
        },
        {
          intervention: 'Self-Regulation Strategy Teaching',
          evidence_base: 'Harris & Graham SRSD; Reid & Lienemann metacognitive strategies',
          description: 'Explicit teaching: self-talk, self-monitoring, goal-setting, planning strategies',
          suitability: 'All need levels',
        },
        {
          intervention: 'Environmental Modifications',
          evidence_base: 'DuPaul & Stoner (2014) - ADHD in Schools',
          description: 'Preferential seating, reduced distractions, visual schedules, clear routines, movement breaks',
          suitability: 'All need levels',
        },
        {
          intervention: 'Mindfulness and Attention Training',
          evidence_base: 'Mindfulness in Schools Project (MiSP); Zylowska et al. (2008)',
          description: 'Age-appropriate mindfulness practices to improve attentional control',
          suitability: 'Mild to moderate need; age 8+',
        },
        {
          intervention: 'Goal-Setting and Planning Frameworks',
          evidence_base: 'Goal Attainment Scaling; Solution-Focused approaches',
          description: 'Structured goal-setting, breaking tasks into steps, use of checklists and visual planners',
          suitability: 'All need levels',
        },
      ],
    },

    {
      id: 'ecca-domain-processing-speed',
      name: 'Processing Speed and Efficiency',
      description: `
Processing speed refers to the rate at which cognitive operations are executed—how quickly
information is perceived, processed, and responded to. Slow processing speed does not indicate
lower intelligence but affects the efficiency of learning, particularly in timed or fast-paced
environments. This domain assesses both perceptual speed (visual/auditory) and motor speed
(response execution), drawing on information processing theory and neuropsychological research.
      `.trim(),
      order_index: 3,

      observation_prompts: {
        key_questions: [
          'How quickly does the child process and respond to information?',
          'Is there a difference between accuracy and speed?',
          'How does time pressure affect performance?',
          'Do they process visual information faster than auditory (or vice versa)?',
          'What happens to processing speed when tired or stressed?',
        ],

        observation_contexts: [
          'Timed academic tasks (maths facts, spelling tests)',
          'Copying from board or book',
          'Following rapid verbal instructions',
          'Reading fluency tasks',
          'Quick-response classroom activities',
          'Transitions between activities',
        ],

        what_to_notice: [
          'Time taken to initiate responses',
          'Speed vs. accuracy trade-off',
          'Fatigue effects over extended tasks',
          'Difference between simple and complex processing',
          'Response to time pressure or pace changes',
          'Visual vs. auditory processing differences',
        ],
      },

      task_suggestions: [
        {
          task: 'Symbol Coding / Digit-Symbol Substitution',
          description: 'Match symbols to numbers using a key, working as quickly and accurately as possible',
          age_appropriate: '6-18',
          materials: 'Coding worksheet with symbol key',
          dynamic_component: 'Teach scanning strategy and efficiency tips, then retest',
        },
        {
          task: 'Rapid Automatic Naming (RAN)',
          description: 'Name familiar items (colors, letters, numbers) as quickly as possible',
          age_appropriate: '5-18',
          materials: 'RAN cards or sheets',
          dynamic_component: 'Practice with feedback on pacing, then retest',
        },
        {
          task: 'Visual Search Tasks',
          description: 'Find target items in an array as quickly as possible (e.g., find all letter "A"s)',
          age_appropriate: '5-18',
          materials: 'Printed search tasks or letter/number grids',
          dynamic_component: 'Teach systematic scanning strategy, then retest',
        },
        {
          task: 'Simple Reaction Time',
          description: 'Respond as quickly as possible to a single stimulus (tap when you see/hear signal)',
          age_appropriate: '5-18',
          materials: 'Timer or stopwatch',
          dynamic_component: 'Practice motor readiness and anticipation, then retest',
        },
        {
          task: 'Choice Reaction Time',
          description: 'Respond differently to different stimuli (left hand for red, right hand for blue)',
          age_appropriate: '6-18',
          materials: 'Colored cards or verbal cues',
          dynamic_component: 'Practice discrimination and motor planning, then retest',
        },
        {
          task: 'Copying Speed (Near vs. Far)',
          description: 'Copy text from near point (paper on desk) and far point (board), comparing speed',
          age_appropriate: '6-18',
          materials: 'Text samples, clipboard',
          dynamic_component: 'Teach visual chunking and motor efficiency, then retest',
        },
      ],

      key_indicators: {
        strengths: [
          'Processes information quickly and efficiently',
          'Maintains speed without sacrificing accuracy',
          'Responds rapidly to verbal and visual stimuli',
          'Speed remains consistent across modalities',
          'Copes well with time pressure',
          'Recovers quickly from brief breaks',
        ],
        needs: [
          'Slow to process and respond to information',
          'Speed-accuracy trade-off (fast but error-prone, or slow but accurate)',
          'Significant fatigue effects over time',
          'Modality differences (slow visual or slow auditory processing)',
          'Struggles under time pressure',
          'Requires extended time for task completion',
        ],
      },

      parent_questions: [
        {
          question: 'Does your child seem to need more time than others to process information or complete tasks?',
          response_type: 'narrative',
          prompts: ['Getting dressed, eating, homework?', 'Faster with some tasks than others?'],
        },
        {
          question: 'How does your child respond when rushed or under time pressure?',
          response_type: 'narrative',
          prompts: ['Morning routines, timed homework?', 'Quality of work when rushed?'],
        },
        {
          question: 'Have you noticed if your child processes things they see faster/slower than things they hear?',
          response_type: 'narrative',
          prompts: ['Visual learner vs. auditory learner?'],
        },
        {
          question: 'Does your child seem to tire easily during tasks requiring concentration?',
          response_type: 'narrative',
          prompts: ['Energy levels throughout the day?'],
        },
      ],

      teacher_questions: [
        {
          question: 'How does the child\'s pace of work compare to peers?',
          response_type: 'narrative',
          prompts: ['Consistently slow, or task-dependent?', 'Finishing classwork/tests?'],
        },
        {
          question: 'Does the child sacrifice accuracy for speed, or vice versa?',
          response_type: 'narrative',
          prompts: ['Rushed errors vs. slow meticulousness?'],
        },
        {
          question: 'In which activities or subjects is processing speed most/least a concern?',
          response_type: 'narrative',
          prompts: ['Maths facts, reading fluency, written tasks?'],
        },
        {
          question: 'What accommodations have supported the child\'s processing speed needs?',
          response_type: 'narrative',
          prompts: ['Extra time, reduced workload, breaking tasks into chunks?'],
        },
      ],

      child_prompts: [
        {
          prompt: 'Do you feel like you have enough time to finish your work in class?',
          age_range: '6-18',
          method: 'conversation',
        },
        {
          prompt: 'What happens when you try to work really quickly?',
          age_range: '7-18',
          method: 'conversation',
        },
        {
          prompt: 'Is it easier for you to understand things when you see them or when you hear them?',
          age_range: '7-18',
          method: 'conversation',
        },
        {
          prompt: 'What helps you work faster without making mistakes?',
          age_range: '7-18',
          method: 'conversation',
        },
      ],

      interpretation_guidance: {
        patterns_to_consider: [
          'Simple vs. complex processing speed',
          'Visual vs. auditory processing modality differences',
          'Motor speed vs. cognitive speed',
          'Fatigue effects and sustained performance',
          'Impact of motivation and task interest',
          'Relationship to working memory (Domain 1) and attention (Domain 2)',
        ],

        theoretical_links: [
          'Information Processing Theory (perception, cognition, response)',
          'Kail\'s (1991) Global Processing Speed Development',
          'Fry & Hale (1996) Processing Speed and Working Memory Development',
          'Salthouse\'s (1996) Processing Speed Theory of Adult Cognition',
        ],

        functional_implications: [
          'Completing classwork within time limits',
          'Reading fluency and comprehension (word recognition speed)',
          'Maths fluency (rapid recall of facts)',
          'Note-taking and copying from board',
          'Test performance (timed assessments)',
          'Participation in fast-paced activities',
        ],
      },

      strength_descriptors: [
        'Processes information quickly and efficiently',
        'Rapid response to visual and auditory stimuli',
        'Maintains processing speed across contexts',
        'Balances speed with accuracy effectively',
        'Copes well with time pressure and deadlines',
      ],

      need_descriptors: [
        'Slow processing of information across contexts',
        'Requires significantly extended time for task completion',
        'Processing speed deteriorates with fatigue',
        'Struggles to balance speed and accuracy',
        'Difficulty coping with timed tasks or fast-paced activities',
      ],

      suggested_interventions: [
        {
          intervention: 'Reasonable Adjustments: Extended Time',
          evidence_base: 'JCQ (Joint Council for Qualifications) Access Arrangements; Equality Act 2010',
          description: 'Provide 25%-100% additional time for tasks, assessments, and transitions',
          suitability: 'All need levels',
        },
        {
          intervention: 'Fluency-Building Activities',
          evidence_base: 'Precision Teaching; Reading Fluency interventions (Fuchs et al. 2001)',
          description: 'Repeated practice with feedback on speed and accuracy (math facts, reading, writing)',
          suitability: 'Mild to moderate need',
        },
        {
          intervention: 'Task Modification: Reduce Output Demands',
          evidence_base: 'Universal Design for Learning (CAST)',
          description: 'Reduce quantity of work, provide scaffolds, allow alternative outputs (typing vs. handwriting)',
          suitability: 'All need levels',
        },
        {
          intervention: 'Strategy Teaching: Efficiency Skills',
          evidence_base: 'Metacognitive strategy instruction',
          description: 'Teach efficiency strategies: scanning, chunking, skimming, prioritizing, time management',
          suitability: 'Moderate need; age 8+',
        },
        {
          intervention: 'Assistive Technology',
          evidence_base: 'UK DfE guidance on AT for SEND',
          description: 'Text-to-speech, speech-to-text, graphic organizers, timers, word processors',
          suitability: 'Moderate to significant need',
        },
      ],
    },

    {
      id: 'ecca-domain-learning-memory',
      name: 'Learning and Memory Consolidation',
      description: `
This domain assesses how children encode, store, and retrieve information over time—the process
of turning experiences into durable learning. It explores verbal and visual learning, retention
over delays, retrieval strategies, and transfer of learning to new contexts. Grounded in memory
systems research (Tulving, Squire, Craik & Lockhart), this domain identifies how learning
difficulties may arise from encoding problems, storage/consolidation issues, or retrieval deficits.
      `.trim(),
      order_index: 4,

      observation_prompts: {
        key_questions: [
          'How effectively does the child learn new information?',
          'Do they retain information over time (minutes, hours, days)?',
          'What retrieval strategies do they use?',
          'Is there a difference between recognition and recall?',
          'Can they transfer learned skills to new contexts?',
        ],

        observation_contexts: [
          'Learning new concepts or procedures',
          'Retention of previously taught material',
          'Recall of instructions given earlier',
          'Application of learned strategies to novel tasks',
          'Episodic memory (personal experiences)',
          'Semantic memory (facts, concepts, vocabulary)',
        ],

        what_to_notice: [
          'Encoding strategies used (rehearsal, elaboration, organization)',
          'Retention over short and long delays',
          'Difference between immediate and delayed recall',
          'Recognition vs. recall performance',
          'Transfer and generalization of learning',
          'Impact of interference and forgetting',
        ],
      },

      task_suggestions: [
        {
          task: 'Story Learning and Delayed Recall',
          description: 'Present a short story, test immediate recall, then test again after 20-30 min delay',
          age_appropriate: '5-18',
          materials: 'Age-appropriate narrative text',
          dynamic_component: 'Teach elaborative encoding (making connections, imagery) and retest',
        },
        {
          task: 'Word List Learning (Verbal)',
          description: 'Present list of words, test immediate recall, then delayed recall after interference task',
          age_appropriate: '7-18',
          materials: 'Word lists (semantically related or unrelated)',
          dynamic_component: 'Teach categorical organization strategy and retest',
        },
        {
          task: 'Visual Pattern Learning',
          description: 'Show visual designs/patterns, then test recognition and reproduction after delay',
          age_appropriate: '5-18',
          materials: 'Printed designs or drawn patterns',
          dynamic_component: 'Teach visualization and verbal labeling strategies, then retest',
        },
        {
          task: 'Procedural Learning Task',
          description: 'Teach multi-step procedure (e.g., origami fold, sequence of movements), test retention',
          age_appropriate: '5-18',
          materials: 'Task-specific (paper, objects)',
          dynamic_component: 'Teach self-verbalization during learning, then retest',
        },
        {
          task: 'Paired-Associate Learning',
          description: 'Learn word pairs, then test recall of second word when given first',
          age_appropriate: '7-18',
          materials: 'Word pair lists',
          dynamic_component: 'Teach mnemonic strategies (imagery, sentence generation) and retest',
        },
        {
          task: 'Transfer Task',
          description: 'Teach strategy in one context, then assess spontaneous use in different but related context',
          age_appropriate: '6-18',
          materials: 'Context-specific tasks',
          dynamic_component: 'Explicitly prompt transfer and discuss strategy generalization',
        },
      ],

      key_indicators: {
        strengths: [
          'Learns new information efficiently',
          'Retains information over time with minimal forgetting',
          'Uses effective encoding strategies spontaneously',
          'Strong retrieval of learned information',
          'Transfers and applies learning to new contexts',
          'Recognition and recall both strong',
        ],
        needs: [
          'Difficulty encoding new information despite repeated exposure',
          'Rapid forgetting even after apparent initial learning',
          'Limited use of encoding or retrieval strategies',
          'Recognition better than recall (retrieval deficit)',
          'Poor transfer of learning to new contexts',
          'Inconsistent retrieval (knows something one day, forgets the next)',
        ],
      },

      parent_questions: [
        {
          question: 'How easily does your child learn new things (facts, routines, skills)?',
          response_type: 'narrative',
          prompts: ['Need many repetitions?', 'Differences across types of information?'],
        },
        {
          question: 'Does your child remember things learned yesterday/last week/last month?',
          response_type: 'narrative',
          prompts: ['Examples of good vs. poor retention?'],
        },
        {
          question: 'What strategies does your child use to help remember new information?',
          response_type: 'narrative',
          prompts: ['Repetition, making connections, using imagery?'],
        },
        {
          question: 'Can your child apply what they\'ve learned in one situation to a different situation?',
          response_type: 'narrative',
          prompts: ['Examples of transfer, or lack thereof?'],
        },
      ],

      teacher_questions: [
        {
          question: 'How does the child\'s retention of taught material compare to peers?',
          response_type: 'narrative',
          prompts: ['Same day vs. next day vs. next week?'],
        },
        {
          question: 'What learning strategies have you observed the child using effectively (or not using)?',
          response_type: 'narrative',
          prompts: ['Note-taking, rehearsal, self-testing, mnemonics?'],
        },
        {
          question: 'In which subjects or types of learning does the child show strongest/weakest retention?',
          response_type: 'narrative',
          prompts: ['Verbal vs. visual? Facts vs. procedures?'],
        },
        {
          question: 'Does the child\'s performance suggest encoding difficulties, storage problems, or retrieval issues?',
          response_type: 'narrative',
          prompts: ['Never learned it, or learned but forgot?'],
        },
      ],

      child_prompts: [
        {
          prompt: 'What helps you remember things you learn at school?',
          age_range: '6-18',
          method: 'conversation',
        },
        {
          prompt: 'Do you ever know something one day but forget it the next? What happens?',
          age_range: '7-18',
          method: 'conversation',
        },
        {
          prompt: 'Is it easier for you to remember pictures and things you see, or words and things you hear?',
          age_range: '7-18',
          method: 'conversation',
        },
        {
          prompt: 'What do you do when you really need to remember something important?',
          age_range: '6-18',
          method: 'conversation',
        },
      ],

      interpretation_guidance: {
        patterns_to_consider: [
          'Encoding vs. storage vs. retrieval deficits',
          'Verbal vs. visual memory discrepancies',
          'Immediate vs. delayed recall patterns',
          'Recognition vs. recall differences',
          'Strategic vs. automatic processing',
          'Transfer and generalization capacity',
          'Relationship to working memory (Domain 1)',
        ],

        theoretical_links: [
          'Tulving (1972) Episodic and Semantic Memory Systems',
          'Craik & Lockhart (1972) Levels of Processing',
          'Squire\'s (1992) Declarative vs. Procedural Memory',
          'Retrieval Practice and Spacing Effects (Bjork, Roediger)',
          'Schema Theory (Bartlett, Anderson)',
        ],

        functional_implications: [
          'Retention of taught curriculum',
          'Building on prior learning',
          'Exam and test performance',
          'Homework completion (remembering what to do)',
          'Following through on instructions over time',
          'Academic progress and cumulative learning',
        ],
      },

      strength_descriptors: [
        'Excellent capacity for learning new information',
        'Strong retention over time with minimal forgetting',
        'Effective use of encoding and retrieval strategies',
        'Transfers learning to new contexts readily',
        'Both recognition and recall are strong',
        'Builds on prior knowledge effectively',
      ],

      need_descriptors: [
        'Difficulty learning and retaining new information',
        'Rapid forgetting even after initial apparent learning',
        'Limited use of encoding or retrieval strategies',
        'Poor transfer of learning to new situations',
        'Recognition significantly better than recall (retrieval deficit)',
        'Inconsistent access to learned information',
      ],

      suggested_interventions: [
        {
          intervention: 'Explicit Strategy Teaching: Encoding Strategies',
          evidence_base: 'Pressley & Woloshyn (1995) - Cognitive Strategy Instruction',
          description: 'Teach elaboration, organization, imagery, mnemonics, self-testing, spaced practice',
          suitability: 'All need levels',
        },
        {
          intervention: 'Retrieval Practice and Spaced Repetition',
          evidence_base: 'Roediger & Karpicke (2006) - Testing Effect; Dunlosky et al. (2013)',
          description: 'Low-stakes quizzing, cumulative review, distributed practice schedules',
          suitability: 'All need levels',
        },
        {
          intervention: 'Multisensory Learning Approaches',
          evidence_base: 'Orton-Gillingham; VAKT (Visual-Auditory-Kinesthetic-Tactile)',
          description: 'Engage multiple sensory modalities during encoding to strengthen memory traces',
          suitability: 'All need levels',
        },
        {
          intervention: 'Scaffolded Transfer and Generalization',
          evidence_base: 'Pea (1987) Distributed Intelligence; Salomon & Perkins (1989)',
          description: 'Explicit prompts for transfer, varied practice contexts, metacognitive reflection',
          suitability: 'All need levels',
        },
        {
          intervention: 'Memory Aids and External Supports',
          evidence_base: 'Assistive technology for learning disabilities',
          description: 'Visual organizers, note-taking frameworks, cue cards, technology (audio recorders, revision apps)',
          suitability: 'Moderate to significant need',
        },
        {
          intervention: 'Pre-Teaching and Advance Organizers',
          evidence_base: 'Ausubel (1968) Advance Organizers; Pre-teaching vocabulary',
          description: 'Introduce key concepts/vocabulary before main teaching to facilitate encoding',
          suitability: 'All need levels',
        },
      ],
    },
  ],

  status: 'active',
  is_proprietary: true,
  copyright_holder: 'EdPsych Connect Limited',
};

async function main() {
  console.log('Seeding ECCA Framework...');

  // 1. Create or Update the Framework
  const framework = await prisma.assessmentFramework.upsert({
    where: { abbreviation: eccaFramework.abbreviation },
    update: {
      name: eccaFramework.name,
      version: eccaFramework.version,
      domain: eccaFramework.domain,
      description: eccaFramework.description,
      purpose: eccaFramework.purpose,
      age_range_min: eccaFramework.age_range_min,
      age_range_max: eccaFramework.age_range_max,
      evidence_base: eccaFramework.evidence_base,
      theoretical_frameworks: eccaFramework.theoretical_frameworks,
      administration_guide: eccaFramework.administration_guide,
      time_estimate_minutes: eccaFramework.time_estimate_minutes,
      interpretation_guide: eccaFramework.interpretation_guide,
      qualitative_descriptors: eccaFramework.qualitative_descriptors,
      status: eccaFramework.status,
      is_proprietary: eccaFramework.is_proprietary,
      copyright_holder: eccaFramework.copyright_holder,
    },
    create: {
      name: eccaFramework.name,
      abbreviation: eccaFramework.abbreviation,
      version: eccaFramework.version,
      domain: eccaFramework.domain,
      description: eccaFramework.description,
      purpose: eccaFramework.purpose,
      age_range_min: eccaFramework.age_range_min,
      age_range_max: eccaFramework.age_range_max,
      evidence_base: eccaFramework.evidence_base,
      theoretical_frameworks: eccaFramework.theoretical_frameworks,
      administration_guide: eccaFramework.administration_guide,
      time_estimate_minutes: eccaFramework.time_estimate_minutes,
      interpretation_guide: eccaFramework.interpretation_guide,
      qualitative_descriptors: eccaFramework.qualitative_descriptors,
      status: eccaFramework.status,
      is_proprietary: eccaFramework.is_proprietary,
      copyright_holder: eccaFramework.copyright_holder,
    },
  });

  console.log(`Framework '${framework.name}' seeded.`);

  // 2. Seed Domains
  for (const domain of eccaFramework.domains) {
    // We need to find if the domain exists for this framework to update it, or create it.
    // Since there is no unique constraint on (framework_id, id) or similar in the schema provided (only id is unique),
    // we can try to find by ID if we keep IDs consistent, or delete all domains and recreate them.
    // The schema has `id` as UUID but the data has string IDs like 'ecca-domain-working-memory'.
    // If the schema `id` is just a string (which it is), we can use the IDs from the data.

    await prisma.assessmentDomain.upsert({
      where: { id: domain.id },
      update: {
        framework_id: framework.id,
        name: domain.name,
        description: domain.description,
        order_index: domain.order_index,
        observation_prompts: domain.observation_prompts,
        task_suggestions: domain.task_suggestions,
        key_indicators: domain.key_indicators,
        parent_questions: domain.parent_questions,
        teacher_questions: domain.teacher_questions,
        child_prompts: domain.child_prompts,
        interpretation_guidance: domain.interpretation_guidance,
        strength_descriptors: domain.strength_descriptors,
        need_descriptors: domain.need_descriptors,
        suggested_interventions: domain.suggested_interventions,
      },
      create: {
        id: domain.id,
        framework_id: framework.id,
        name: domain.name,
        description: domain.description,
        order_index: domain.order_index,
        observation_prompts: domain.observation_prompts,
        task_suggestions: domain.task_suggestions,
        key_indicators: domain.key_indicators,
        parent_questions: domain.parent_questions,
        teacher_questions: domain.teacher_questions,
        child_prompts: domain.child_prompts,
        interpretation_guidance: domain.interpretation_guidance,
        strength_descriptors: domain.strength_descriptors,
        need_descriptors: domain.need_descriptors,
        suggested_interventions: domain.suggested_interventions,
      },
    });
    console.log(`Domain '${domain.name}' seeded.`);
  }

  console.log('ECCA Framework seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
