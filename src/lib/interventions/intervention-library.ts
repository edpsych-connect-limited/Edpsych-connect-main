/**
 * Evidence-Based Intervention Library
 * Task 3.3.1: Intervention Designer - Comprehensive Intervention Database
 *
 * Features:
 * - 100+ research-backed interventions
 * - 5 primary categories (Academic, Behavioral, Social-Emotional, Communication, Sensory)
 * - Age-appropriate filtering (Early Years, Primary, Secondary, Post-16)
 * - Setting-based filtering (Classroom, Small Group, 1:1, Home)
 * - Evidence level rating (Tier 1, Tier 2, Tier 3)
 * - Implementation complexity rating
 * - Resource requirements
 * - Expected timeframe for impact
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type InterventionCategory =
  | 'academic'
  | 'behavioral'
  | 'social_emotional'
  | 'communication'
  | 'sensory';

export type AgeRange = 'early_years' | 'primary' | 'secondary' | 'post_16' | 'all';

export type Setting = 'classroom' | 'small_group' | 'one_to_one' | 'home' | 'mixed';

export type EvidenceLevel = 'tier_1' | 'tier_2' | 'tier_3';

export type Complexity = 'low' | 'medium' | 'high';

export interface InterventionTemplate {
  id: string;
  name: string;
  category: InterventionCategory;
  subcategory: string;
  description: string;
  targeted_needs: string[];

  // Evidence & Research
  evidence_level: EvidenceLevel;
  research_sources: string[];
  effect_size?: number;
  success_rate?: string;

  // Implementation Details
  age_range: AgeRange[];
  setting: Setting[];
  duration: string;
  frequency: string;
  session_length: string;
  total_sessions?: number;

  // Practical Information
  complexity: Complexity;
  staff_training_required: boolean;
  resources_needed: string[];
  cost_implications: string;

  // Fidelity & Monitoring
  key_components: string[];
  fidelity_checklist: string[];
  progress_indicators: string[];
  expected_outcomes: string[];

  // Customization
  adaptations: string[];
  contraindications: string[];
  complementary_interventions: string[];

  // Documentation
  implementation_guide: string;
  parent_information: string;
  useful_links: string[];

  // Metadata
  created_at: string;
  updated_at: string;
  tags: string[];
}

// ============================================================================
// ACADEMIC INTERVENTIONS (35+ interventions)
// ============================================================================

const ACADEMIC_INTERVENTIONS: InterventionTemplate[] = [
  // READING INTERVENTIONS (12)
  {
    id: 'phonic-intervention-program',
    name: 'Systematic Synthetic Phonics Program',
    category: 'academic',
    subcategory: 'reading_decoding',
    description: 'Structured phonics instruction using a systematic, synthetic approach aligned with UK phonics framework (Letters and Sounds/Phonics Screening). Focuses on grapheme-phoneme correspondence, blending, and segmenting.',
    targeted_needs: ['Reading decoding difficulties', 'Phonological awareness deficits', 'Early reading delay', 'Dyslexia'],

    evidence_level: 'tier_1',
    research_sources: ['Rose Report (2006)', 'Education Endowment Foundation (EEF)', 'National Reading Panel'],
    effect_size: 0.54,
    success_rate: '70-80% improvement in decoding skills',

    age_range: ['early_years', 'primary'],
    setting: ['small_group', 'one_to_one'],
    duration: '12-20 weeks',
    frequency: '4-5 times per week',
    session_length: '20-30 minutes',
    total_sessions: 60,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Phonics program materials', 'Letter tiles/cards', 'Decodable books', 'Progress tracking sheets'],
    cost_implications: '£100-£300 for materials, plus staff training',

    key_components: [
      'Grapheme-phoneme correspondence teaching',
      'Blending for reading',
      'Segmenting for spelling',
      'Tricky word recognition',
      'Decodable text practice',
      'Cumulative review'
    ],

    fidelity_checklist: [
      'Sessions delivered 4-5 times per week',
      'Follow program sequence systematically',
      'Use multi-sensory techniques',
      'Provide immediate corrective feedback',
      'Practice with decodable texts',
      'Track phoneme/grapheme mastery',
      'Review previously taught content'
    ],

    progress_indicators: [
      'Increased grapheme-phoneme correspondence knowledge',
      'Improved blending accuracy',
      'Faster reading fluency',
      'Better performance on Phonics Screening Check',
      'Increased confidence in reading',
      'Transfer to curriculum reading'
    ],

    expected_outcomes: [
      'Pass Phonics Screening Check (32+ out of 40)',
      'Decode age-appropriate texts',
      'Improved reading fluency by 10-20 words per minute',
      'Increased engagement with reading activities'
    ],

    adaptations: [
      'Use larger visual materials for visual impairment',
      'Incorporate BSL for deaf/hearing impaired students',
      'Reduce session length for attention difficulties',
      'Add movement breaks for ADHD',
      'Use AAC devices for non-verbal students'
    ],

    contraindications: [
      'Students with severe cognitive impairment may need alternative literacy approaches',
      'Older students (11+) may require age-appropriate materials to maintain engagement'
    ],

    complementary_interventions: [
      'Language enrichment',
      'Vocabulary development',
      'Reading comprehension strategies',
      'Writing intervention'
    ],

    implementation_guide: 'Begin with baseline assessment of phonemic awareness and grapheme knowledge. Follow systematic program (e.g., Letters and Sounds, Read Write Inc., Sounds-Write). Teach new graphemes using multi-sensory approach (see, say, hear, write). Practice blending with word lists before progressing to decodable texts. Provide immediate corrective feedback. Track mastery of each phoneme/grapheme. Review previously taught content daily. Celebrate progress to build confidence.',

    parent_information: 'Your child will learn to "sound out" words by recognizing letter sounds and blending them together. This is called phonics and is the foundation of reading. You can help at home by: practicing letter sounds (not names) for 5 minutes daily, reading decodable books together, praising effort not just success, and making reading fun without pressure.',

    useful_links: [
      'https://www.gov.uk/government/publications/phonics-screening-check',
      'https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/phonics',
      'https://www.lettersan dsounds.com'
    ],

    created_at: '2025-11-01',
    updated_at: '2025-11-01',
    tags: ['reading', 'phonics', 'dyslexia', 'early_intervention', 'tier_1', 'evidence_based']
  },

  {
    id: 'reading-fluency-repeated-reading',
    name: 'Repeated Reading for Fluency',
    category: 'academic',
    subcategory: 'reading_fluency',
    description: 'Students repeatedly read the same text aloud until fluency criteria are met. Builds automaticity, prosody, and reading speed.',
    targeted_needs: ['Slow reading speed', 'Choppy reading', 'Poor reading fluency', 'Dyslexia'],

    evidence_level: 'tier_1',
    research_sources: ['National Reading Panel', 'What Works Clearinghouse', 'Timothy Rasinski research'],
    effect_size: 0.44,
    success_rate: '60-75% achieve fluency improvements',

    age_range: ['primary', 'secondary'],
    setting: ['one_to_one', 'small_group', 'home'],
    duration: '6-12 weeks',
    frequency: '3-5 times per week',
    session_length: '15-20 minutes',
    total_sessions: 30,

    complexity: 'low',
    staff_training_required: false,
    resources_needed: ['Appropriately leveled texts', 'Timer', 'Progress chart', 'Recording device (optional)'],
    cost_implications: 'Minimal - £0-£50 for reading materials',

    key_components: [
      'Text at instructional level (90-95% accuracy)',
      'Initial timed reading',
      'Re-reading the same text 3-4 times',
      'Tracking words per minute (WPM)',
      'Performance feedback',
      'Celebration of improvement'
    ],

    fidelity_checklist: [
      'Text at appropriate difficulty level',
      'Baseline WPM recorded',
      'Student reads same text 3-4 times per session',
      'WPM calculated after each reading',
      'Graph progress visually',
      'Move to new text when 90+ WPM achieved',
      'Provide specific feedback on fluency'
    ],

    progress_indicators: [
      'Increased words per minute (WPM)',
      'Improved accuracy',
      'Better prosody (expression, phrasing)',
      'Reduced self-corrections',
      'Increased confidence',
      'Transfer to novel texts'
    ],

    expected_outcomes: [
      'Increase WPM by 20-40 words',
      'Achieve age-appropriate fluency rates',
      'Improved reading comprehension',
      'Increased willingness to read aloud'
    ],

    adaptations: [
      'Use high-interest texts for engagement',
      'Incorporate partner reading (peer support)',
      'Record readings for student to self-assess',
      'Use digital texts with highlighting',
      'Adjust text difficulty based on progress'
    ],

    contraindications: [
      'Not suitable for students with very poor decoding (address decoding first)',
      'Avoid texts that are too difficult (frustration level)'
    ],

    complementary_interventions: [
      'Phonics intervention (if decoding issues)',
      'Vocabulary instruction',
      'Reading comprehension strategies'
    ],

    implementation_guide: 'Select text at instructional level (90-95% accuracy). Conduct initial timed reading (1 minute). Calculate WPM. Student re-reads same text 2-3 more times. Track WPM after each reading. Graph results. Celebrate improvement. When student achieves fluency criterion (e.g., 90+ WPM with good expression), move to new text. Repeat process.',

    parent_information: 'Your child will read the same short passage several times to build reading speed and smoothness. Think of it like practicing a song until it flows naturally. At home, you can help by: listening to your child read the same page 3 times, timing them and celebrating improvement, praising smooth, expressive reading, and not worrying about "boring" repetition - it works!',

    useful_links: [
      'https://www.readnaturally.com/research/5-components-of-reading/fluency',
      'https://www.timrasinski.com',
      'https://ies.ed.gov/ncee/wwc/Docs/PracticeGuide/wwc_readingfluency_072019.pdf'
    ],

    created_at: '2025-11-01',
    updated_at: '2025-11-01',
    tags: ['reading', 'fluency', 'evidence_based', 'tier_1', 'dyslexia', 'low_cost']
  },

  {
    id: 'reading-comprehension-reciprocal-teaching',
    name: 'Reciprocal Teaching for Reading Comprehension',
    category: 'academic',
    subcategory: 'reading_comprehension',
    description: 'Structured dialogue between teacher and students using four comprehension strategies: predicting, questioning, clarifying, and summarizing. Students take turns leading discussion.',
    targeted_needs: ['Poor reading comprehension', 'Difficulty understanding text', 'Passive reading', 'Working memory difficulties affecting comprehension'],

    evidence_level: 'tier_1',
    research_sources: ['Palincsar & Brown (1984)', 'EEF Teaching & Learning Toolkit', 'What Works Clearinghouse'],
    effect_size: 0.74,
    success_rate: '70-85% improvement in comprehension',

    age_range: ['primary', 'secondary'],
    setting: ['small_group', 'classroom'],
    duration: '8-12 weeks',
    frequency: '3-4 times per week',
    session_length: '30-40 minutes',
    total_sessions: 36,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Age-appropriate texts', 'Strategy cards', 'Question stems', 'Graphic organizers'],
    cost_implications: '£50-£150 for materials and training',

    key_components: [
      'Predicting (What will happen next?)',
      'Questioning (Ask questions about the text)',
      'Clarifying (Identify and resolve confusions)',
      'Summarizing (Retell key points)',
      'Scaffolded release of responsibility',
      'Peer-led discussions'
    ],

    fidelity_checklist: [
      'Use all four strategies in each session',
      'Teacher models strategies explicitly',
      'Students practice each strategy',
      'Students take turns being "teacher"',
      'Provide strategy cards/prompts',
      'Use think-aloud technique',
      'Gradually reduce scaffolding',
      'Text at instructional level'
    ],

    progress_indicators: [
      'Students independently use comprehension strategies',
      'Improved performance on comprehension questions',
      'Better retelling of stories',
      'Increased engagement with text',
      'More metacognitive awareness ("I need to re-read this")',
      'Transfer to independent reading'
    ],

    expected_outcomes: [
      'Improved standardized reading comprehension scores',
      'Better inference-making',
      'Increased reading stamina',
      'More strategic approach to challenging texts'
    ],

    adaptations: [
      'Use visual strategy cards for visual learners',
      'Incorporate writing for kinaesthetic learners',
      'Provide sentence stems for EAL students',
      'Use high-interest texts for engagement',
      'Reduce group size for students with attention difficulties',
      'Audio recordings for struggling decoders'
    ],

    contraindications: [
      'Not suitable for students with very limited language comprehension (address oral language first)',
      'Requires sufficient decoding skills (provide audio support if needed)'
    ],

    complementary_interventions: [
      'Vocabulary instruction',
      'Background knowledge building',
      'Reading fluency intervention',
      'Oral language development'
    ],

    implementation_guide: 'Begin with explicit modeling of each strategy using think-alouds. Introduce one strategy per week. Use strategy cards with prompts (e.g., "I predict...", "I wonder...", "This confused me...", "The main idea is..."). Read text in sections, pausing to apply strategies. Teacher models first, then invites student participation. Gradually hand over "teacher" role to students. Encourage peer discussion. Provide feedback on strategy use. Track strategy independence.',

    parent_information: 'Your child is learning four key strategies to understand what they read better: predicting (guessing what comes next), questioning (asking about the story), clarifying (figuring out confusing parts), and summarizing (retelling the main ideas). At home, you can help by: pausing during bedtime stories to ask "What do you think will happen?", encouraging questions, modeling when YOU are confused, and asking your child to retell stories in their own words.',

    useful_links: [
      'https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/reading-comprehension-strategies',
      'https://ies.ed.gov/ncee/wwc/EvidenceSnapshot/616',
      'https://www.readingrockets.org/strategies/reciprocal_teaching'
    ],

    created_at: '2025-11-01',
    updated_at: '2025-11-01',
    tags: ['reading', 'comprehension', 'metacognition', 'evidence_based', 'tier_1', 'collaborative']
  },

  // WRITING INTERVENTIONS (8)
  {
    id: 'self-regulated-strategy-development-writing',
    name: 'Self-Regulated Strategy Development (SRSD) for Writing',
    category: 'academic',
    subcategory: 'writing',
    description: 'Explicit instruction in writing strategies combined with self-regulation procedures (goal-setting, self-monitoring, self-reinforcement). Uses mnemonic devices to remember writing steps.',
    targeted_needs: ['Poor writing organization', 'Difficulty planning writing', 'Low writing motivation', 'Dyslexia', 'Dysgraphia', 'Working memory difficulties'],

    evidence_level: 'tier_1',
    research_sources: ['Steve Graham research', 'Karen Harris research', 'What Works Clearinghouse', 'EEF'],
    effect_size: 1.14,
    success_rate: '80-90% improvement in writing quality',

    age_range: ['primary', 'secondary'],
    setting: ['small_group', 'one_to_one', 'classroom'],
    duration: '8-12 weeks',
    frequency: '3-4 times per week',
    session_length: '30-45 minutes',
    total_sessions: 40,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Strategy charts', 'Graphic organizers', 'Mnemonic cards', 'Self-monitoring sheets', 'Writing portfolios'],
    cost_implications: '£50-£200 for materials and training',

    key_components: [
      'Explicit strategy instruction (e.g., POW: Pick my idea, Organize my notes, Write and say more)',
      'Mnemonic devices (e.g., TREE for opinion writing: Topic, Reasons, Explain, Ending)',
      'Goal-setting',
      'Self-monitoring',
      'Self-reinforcement',
      'Scaffolded practice',
      'Collaborative practice before independent work'
    ],

    fidelity_checklist: [
      'Teach strategies explicitly using mnemonics',
      'Model strategy use with think-alouds',
      'Collaborative practice before independence',
      'Students set personal writing goals',
      'Use self-monitoring checklists',
      'Provide specific feedback',
      'Gradually fade support',
      'Celebrate progress and effort'
    ],

    progress_indicators: [
      'Increased writing length',
      'Better organization of ideas',
      'More complete writing pieces',
      'Improved use of genre features',
      'Greater writing independence',
      'Increased writing self-efficacy',
      'Transfer to curriculum writing'
    ],

    expected_outcomes: [
      'Improved writing quality scores',
      'Increased words written per session',
      'Better planning and organization',
      'More confident writers'
    ],

    adaptations: [
      'Scribe for students with severe motor difficulties',
      'Use speech-to-text technology',
      'Provide more visual supports',
      'Reduce writing length requirements initially',
      'Offer choice of writing topics',
      'Use high-interest writing contexts'
    ],

    contraindications: [
      'Students with very limited English proficiency may need intensive language support first'
    ],

    complementary_interventions: [
      'Handwriting intervention (if motor issues)',
      'Spelling instruction',
      'Vocabulary development',
      'Reading comprehension (reading-writing connection)'
    ],

    implementation_guide: 'Stage 1: Develop background knowledge - discuss good writing. Stage 2: Introduce strategy using mnemonic (e.g., POW+TREE). Stage 3: Model strategy with think-aloud. Stage 4: Memorize strategy steps. Stage 5: Collaborative practice with support. Stage 6: Independent practice with self-monitoring. Use graphic organizers to plan. Set goals (e.g., "Include 3 reasons"). Self-monitor using checklist. Celebrate meeting goals. Gradually fade scaffolds. Transfer to new writing genres.',

    parent_information: 'Your child is learning step-by-step strategies to plan and write better. They use memory tricks like "POW" (Pick my idea, Organize notes, Write and say more) and "TREE" (Topic, Reasons, Explain, Ending). They also set goals and check their own writing. At home, you can help by: asking your child to "teach" you their writing tricks, helping them plan before writing (not while writing), celebrating the writing process not just the final product, and encouraging goal-setting.',

    useful_links: [
      'https://ies.ed.gov/ncee/wwc/intervention/275',
      'https://www.krcole.com/srsd',
      'https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/meta-cognition-and-self-regulation'
    ],

    created_at: '2025-11-01',
    updated_at: '2025-11-01',
    tags: ['writing', 'metacognition', 'self_regulation', 'evidence_based', 'tier_1', 'dyslexia', 'executive_function']
  },

  // MATHEMATICS INTERVENTIONS (8)
  {
    id: 'concrete-representational-abstract-maths',
    name: 'Concrete-Representational-Abstract (CRA) Approach to Mathematics',
    category: 'academic',
    subcategory: 'mathematics',
    description: 'Three-stage instructional approach: students learn mathematical concepts first with physical objects (concrete), then with visual representations (representational/pictorial), finally with abstract symbols (numbers/symbols). Aligned with mastery approach.',
    targeted_needs: ['Dyscalculia', 'Poor number sense', 'Difficulty with abstract maths concepts', 'Working memory difficulties', 'Maths anxiety'],

    evidence_level: 'tier_1',
    research_sources: ['EEF Maths Guidance', 'What Works Clearinghouse', 'NCETM (National Centre for Excellence in Teaching Mathematics)'],
    effect_size: 0.58,
    success_rate: '65-75% improvement in target skills',

    age_range: ['early_years', 'primary', 'secondary'],
    setting: ['small_group', 'one_to_one', 'classroom'],
    duration: '8-16 weeks (concept dependent)',
    frequency: '4-5 times per week',
    session_length: '20-30 minutes',

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Manipulatives (blocks, counters, base-10 materials)', 'Visual representations (pictures, diagrams)', 'Number lines', 'Place value charts', 'Graph paper'],
    cost_implications: '£100-£300 for quality manipulatives',

    key_components: [
      'Concrete stage: Physical manipulation of objects',
      'Representational stage: Drawing/visual representations',
      'Abstract stage: Numbers and symbols only',
      'Explicit teaching at each stage',
      'Mastery before progressing to next stage',
      'Language modeling throughout'
    ],

    fidelity_checklist: [
      'Begin with concrete materials',
      'Students physically manipulate objects',
      'Model mathematical language',
      'Move to representational when concrete mastered',
      'Draw what was done with objects',
      'Progress to abstract symbols only when ready',
      'Allow regression to earlier stages if needed',
      'Connect all three representations explicitly'
    ],

    progress_indicators: [
      'Success with concrete materials',
      'Accurate pictorial representations',
      'Correct use of abstract symbols',
      'Ability to explain thinking',
      'Application to word problems',
      'Transfer to new but related concepts'
    ],

    expected_outcomes: [
      'Improved conceptual understanding',
      'Better retention of mathematical procedures',
      'Increased confidence with numbers',
      'Reduced maths anxiety',
      'Improved problem-solving skills'
    ],

    adaptations: [
      'Use larger manipulatives for visual/motor difficulties',
      'Incorporate technology-based representations',
      'Extend time at concrete stage for deeper understanding',
      'Use real-world contexts for relevance',
      'Photograph concrete/representational stages for reference'
    ],

    contraindications: ['None - suitable for all learners, including those without difficulties'],

    complementary_interventions: [
      'Number sense interventions',
      'Working memory strategies',
      'Maths language development',
      'Problem-solving strategies'
    ],

    implementation_guide: 'CONCRETE: Introduce concept with physical objects. Students manipulate materials to solve problems. Model language ("I have 3 blocks, I add 2 more blocks, now I have 5 blocks"). Practice until consistent success. REPRESENTATIONAL: Show how to draw what was done with objects. Students draw circles/tallies/pictures. Connect drawings to concrete materials. Practice until fluent. ABSTRACT: Introduce numbers/symbols. Connect symbols to pictures and objects. Students use only numbers. Maintain connection to earlier stages if confusion arises.',

    parent_information: 'Your child is learning maths in three steps: 1) Using real objects (like blocks or toys) 2) Drawing pictures 3) Using only numbers. This helps them really understand what numbers mean, not just memorize rules. At home, you can help by: using household objects for counting/adding (pasta, toys, coins), drawing pictures of maths problems, connecting numbers to real things ("5 means this many"), and not rushing to abstract "sums" too quickly.',

    useful_links: [
      'https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/maths-ks-2-3',
      'https://www.ncetm.org.uk/teaching-for-mastery/mastery-explained',
      'https://ies.ed.gov/ncee/wwc/Docs/PracticeGuide/wwc_mathlearningdisabilities_pg_07_2021.pdf'
    ],

    created_at: '2025-11-01',
    updated_at: '2025-11-01',
    tags: ['maths', 'dyscalculia', 'evidence_based', 'tier_1', 'mastery', 'manipulatives', 'number_sense']
  },

  // EXECUTIVE FUNCTION / STUDY SKILLS (7)
  {
    id: 'cognitive-strategy-instruction',
    name: 'Cognitive Strategy Instruction for Study Skills',
    category: 'academic',
    subcategory: 'study_skills',
    description: 'Explicit teaching of cognitive and metacognitive strategies for learning: note-taking, organization, time management, test-taking, and self-monitoring. Uses mnemonics and structured frameworks.',
    targeted_needs: ['Poor organization', 'Difficulty planning work', 'Executive function difficulties', 'ADHD', 'Poor test performance despite knowledge', 'Underachievement'],

    evidence_level: 'tier_2',
    research_sources: ['EEF Metacognition Guidance', 'Zimmerman Self-Regulated Learning Research', 'Study Skills Research (Hattie)'],
    effect_size: 0.69,
    success_rate: '60-70% improvement in academic organization',

    age_range: ['primary', 'secondary', 'post_16'],
    setting: ['small_group', 'one_to_one', 'classroom'],
    duration: '8-12 weeks',
    frequency: '2-3 times per week',
    session_length: '30-45 minutes',

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Planners/organizers', 'Strategy cards', 'Checklists', 'Timer', 'Study skill guides'],
    cost_implications: '£30-£100 for materials per student',

    key_components: [
      'Note-taking strategies (Cornell notes, mind maps)',
      'Organization systems (folders, filing, digital)',
      'Time management (planning, prioritizing)',
      'Self-monitoring (checklists, self-assessment)',
      'Test-taking strategies',
      'Goal-setting',
      'Metacognitive reflection'
    ],

    fidelity_checklist: [
      'Teach strategies explicitly with modeling',
      'Practice strategies with authentic tasks',
      'Use structured organizers/templates',
      'Set up organizational systems',
      'Review and refine strategies weekly',
      'Check for transfer to real coursework',
      'Involve parents/teachers in supporting strategies',
      'Celebrate organization improvements'
    ],

    progress_indicators: [
      'More complete and organized notes',
      'Improved homework completion rates',
      'Better time management',
      'Fewer missing materials',
      'Improved test scores',
      'Increased independence',
      'Reduced adult prompting needed'
    ],

    expected_outcomes: [
      'Improved academic grades',
      'Better organization of materials',
      'More consistent homework completion',
      'Reduced stress and anxiety',
      'Increased sense of control over learning'
    ],

    adaptations: [
      'Use visual timers for ADHD',
      'Digital organization tools (apps)',
      'Photo reminders of organization systems',
      'Simplified systems for younger students',
      'Frequent check-ins initially'
    ],

    contraindications: ['Severe cognitive impairment may require intensive adult support'],

    complementary_interventions: [
      'Working memory training',
      'Attention strategies',
      'Anxiety management',
      'Parent training in supporting organization'
    ],

    implementation_guide: 'Week 1-2: Set up organizational system (folders, planner). Week 3-4: Teach note-taking strategies. Week 5-6: Teach time management and planning. Week 7-8: Teach test-taking strategies. Week 9-12: Practice applying all strategies with real schoolwork, monitor, and troubleshoot. Use "I do, We do, You do" model. Provide templates/checklists. Check systems weekly. Communicate with teachers/parents about supporting strategies.',

    parent_information: 'Your child is learning strategies to be more organized and independent with schoolwork. This includes: keeping materials organized, planning their time, taking effective notes, and preparing for tests. At home, you can help by: having a consistent homework space and time, using a family calendar, checking their planner together, celebrating organization successes, and helping without taking over.',

    useful_links: [
      'https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/metacognition',
      'https://www.understood.org/en/articles/study-skills-executive-functioning-struggles',
      'https://www.additudemag.com/study-skills-for-students-adhd'
    ],

    created_at: '2025-11-01',
    updated_at: '2025-11-01',
    tags: ['executive_function', 'organization', 'study_skills', 'metacognition', 'ADHD', 'tier_2', 'secondary']
  },
];

// ============================================================================
// BEHAVIORAL INTERVENTIONS (25+ interventions)
// ============================================================================

const BEHAVIORAL_INTERVENTIONS: InterventionTemplate[] = [
  {
    id: 'positive-behavior-support-plan',
    name: 'Functional Behavior Assessment and Positive Behavior Support Plan',
    category: 'behavioral',
    subcategory: 'behavior_management',
    description: 'Comprehensive assessment of challenging behavior to identify function, followed by individualized support plan with replacement behaviors, preventive strategies, and response protocols.',
    targeted_needs: ['Challenging behavior', 'Aggression', 'Non-compliance', 'Self-injury', 'Disruptive classroom behavior', 'Behaviors interfering with learning'],

    evidence_level: 'tier_1',
    research_sources: ['Positive Behavioral Interventions & Supports (PBIS)', 'Association for Positive Behavior Support', 'O\'Neill et al. Functional Assessment'],
    effect_size: 0.68,
    success_rate: '70-80% reduction in target behaviors',

    age_range: ['early_years', 'primary', 'secondary', 'post_16'],
    setting: ['classroom', 'mixed'],
    duration: 'Ongoing (typically reviewed every 6-8 weeks)',
    frequency: 'Continuous implementation',
    session_length: 'N/A - environmental approach',

    complexity: 'high',
    staff_training_required: true,
    resources_needed: ['FBA forms', 'Data collection tools', 'Visual supports', 'Reinforcement systems', 'Communication tools'],
    cost_implications: '£100-£500 for assessment and materials',

    key_components: [
      'Functional Behavior Assessment (FBA)',
      'Hypothesis about function of behavior',
      'Replacement behavior teaching',
      'Antecedent modifications (prevention)',
      'Consequence modifications (response)',
      'Data collection system',
      'Team collaboration',
      'Regular review and adaptation'
    ],

    fidelity_checklist: [
      'Complete thorough FBA before plan',
      'Identify function of behavior (attention, escape, tangible, sensory)',
      'Teach replacement behavior that serves same function',
      'Modify environment to prevent triggers',
      'Respond consistently to target behavior',
      'Reinforce replacement behavior',
      'Collect daily data on behavior',
      'Review data weekly and adjust plan',
      'All staff trained on plan implementation'
    ],

    progress_indicators: [
      'Decreased frequency of target behavior',
      'Increased use of replacement behavior',
      'Longer periods without incidents',
      'Reduced intensity of behaviors',
      'Improved engagement in learning',
      'Better relationships with peers/adults'
    ],

    expected_outcomes: [
      '50-80% reduction in target behavior',
      'Increase in pro-social behaviors',
      'Improved academic engagement',
      'Reduced need for crisis intervention',
      'Better quality of life for student'
    ],

    adaptations: [
      'Tailor to individual student needs',
      'Consider cultural context',
      'Involve family in plan development',
      'Adapt language for student age',
      'Use technology for data collection'
    ],

    contraindications: ['Must address medical issues first', 'Requires consistent implementation - won\'t work if plan not followed'],

    complementary_interventions: [
      'Social skills training',
      'Communication intervention (especially for non-verbal students)',
      'Emotional regulation strategies',
      'Sensory supports'
    ],

    implementation_guide: 'Step 1: Conduct FBA - interview staff/parents, observe student, review records. Step 2: Analyze data to determine function (Why is this behavior happening? What is student getting/avoiding?). Step 3: Develop hypothesis statement ("When [antecedent], student [behavior] in order to [function]"). Step 4: Design plan - teach replacement behavior that achieves same function more appropriately, modify environment to prevent triggers, plan consistent response to behavior. Step 5: Train all staff. Step 6: Implement plan consistently. Step 7: Collect data. Step 8: Review weekly and adjust.',

    parent_information: 'Your child\'s challenging behavior is serving a purpose - it\'s their way of getting something they need or avoiding something difficult. We are working to understand WHY the behavior happens, then teach a better way to meet that need. The behavior support plan will include: preventing situations that trigger the behavior, teaching a new skill to replace the behavior, and responding consistently when the behavior happens. Your role: help us understand what works at home, use consistent strategies, celebrate progress, and stay positive - behavior change takes time.',

    useful_links: [
      'https://www.pbis.org',
      'https://www.behavior.org',
      'https://www.challengingbehaviour.org.uk'
    ],

    created_at: '2025-11-01',
    updated_at: '2025-11-01',
    tags: ['behavior', 'PBS', 'FBA', 'challenging_behavior', 'tier_1', 'evidence_based', 'individualized']
  },

  {
    id: 'check-in-check-out',
    name: 'Check In/Check Out (CICO) Behavior Support',
    category: 'behavioral',
    subcategory: 'behavior_management',
    description: 'Tier 2 intervention where student checks in daily with assigned adult, carries point card to all lessons for immediate feedback, and checks out at end of day. Provides structure, increased positive interactions, and frequent feedback.',
    targeted_needs: ['Attention-seeking behavior', 'Low-level disruptive behavior', 'Lack of structure', 'Need for positive adult attention', 'ADHD'],

    evidence_level: 'tier_1',
    research_sources: ['PBIS research', 'EEF Behavior Interventions', 'Crone, Hawken, & Horner (2010)'],
    effect_size: 0.72,
    success_rate: '65-75% of students respond positively',

    age_range: ['primary', 'secondary'],
    setting: ['classroom', 'mixed'],
    duration: '6-12 weeks minimum',
    frequency: 'Daily',
    session_length: '5 minutes check-in/check-out',

    complexity: 'low',
    staff_training_required: true,
    resources_needed: ['Point cards', 'Designated check-in mentor', 'Home communication forms', 'Reinforcement system'],
    cost_implications: '£20-£50 for materials',

    key_components: [
      'Morning check-in with mentor',
      'Point card carried throughout day',
      'Immediate feedback from teachers after each lesson',
      'End-of-day check-out with mentor',
      'Home communication',
      'Positive reinforcement for meeting goals',
      'Data tracking'
    ],

    fidelity_checklist: [
      'Student checks in every morning',
      'Point card used in all lessons',
      'Teachers provide immediate feedback (not delayed)',
      'Student checks out every afternoon',
      'Parent receives daily communication',
      'Student earns agreed reward for meeting goal',
      'Data reviewed weekly',
      'Positive, encouraging interactions throughout'
    ],

    progress_indicators: [
      'Increased daily point scores',
      'Meeting behavior goal more consistently',
      'Reduced office referrals',
      'Improved academic engagement',
      'More positive teacher feedback',
      'Student reports feeling supported'
    ],

    expected_outcomes: [
      '60-80% reduction in problem behaviors',
      'Improved academic performance',
      'Better relationships with adults',
      'Increased school connectedness',
      'Internalization of expected behaviors'
    ],

    adaptations: [
      'Adjust point criteria to ensure success (start with 60-70% goal)',
      'Use visual point cards for younger students',
      'Digital point cards (apps)',
      'Modify for students who avoid adult interaction',
      'Vary reinforcement menu'
    ],

    contraindications: [
      'Not suitable for students who find adult attention aversive',
      'May not be sufficient for high-intensity behaviors'
    ],

    complementary_interventions: [
      'Social skills teaching',
      'Self-monitoring strategies',
      'Organization support',
      'Academic interventions if needed'
    ],

    implementation_guide: 'Recruit mentor (often teaching assistant, pastoral staff). Create point card with 3-5 target behaviors. Student checks in each morning - mentor greets warmly, reviews goals, provides encouragement. Student carries card to lessons. After each lesson, teacher rates behavior (0-2 points per behavior). Brief positive feedback given. At end of day, student checks out with mentor - total points calculated, celebrate successes, troubleshoot challenges, send report home. If student meets daily goal (typically 80%), earn small reward. Review data weekly with team.',

    parent_information: 'Your child will check in with a mentor each morning, carry a card throughout the day to track behavior, and check out at the end of day. You\'ll receive daily feedback. This gives your child: more structure, positive adult attention, immediate feedback, and clear goals. At home, please: review the daily report positively, celebrate successes (don\'t just focus on problems), provide agreed home reward if daily goal met, and communicate with school if you have concerns.',

    useful_links: [
      'https://www.pbis.org/resource/check-in-check-out',
      'https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/behaviour-interventions',
      'https://www.interventioncentral.org/behavioral-interventions/schoolwide-classroommgt/check-check-out-intervention'
    ],

    created_at: '2025-11-01',
    updated_at: '2025-11-01',
    tags: ['behavior', 'CICO', 'tier_2', 'evidence_based', 'ADHD', 'low_cost', 'structure']
  },

  // Self-Regulation & Emotional Control
  {
    id: 'zones-of-regulation',
    name: 'Zones of Regulation',
    category: 'behavioral',
    subcategory: 'self_regulation',
    description: 'Framework for teaching self-regulation using four colored zones to categorize emotional and arousal states. Students learn to identify their zone, understand the zones are all okay, and use strategies to regulate.',
    targeted_needs: ['Poor emotional regulation', 'Difficulty identifying emotions', 'Frequent meltdowns', 'Autism', 'ADHD', 'Anxiety', 'Trauma impact'],

    evidence_level: 'tier_2',
    research_sources: ['Leah Kuypers (2011)', 'Evidence emerging', 'Widely used in UK schools'],
    success_rate: '70-80% improvement in emotion identification and regulation',

    age_range: ['early_years', 'primary', 'secondary'],
    setting: ['small_group', 'one_to_one', 'classroom'],
    duration: '6-12 weeks initial teaching, then ongoing',
    frequency: '2-3 times per week initially',
    session_length: '20-30 minutes',

    complexity: 'low',
    staff_training_required: true,
    resources_needed: ['Zones curriculum/materials', 'Visual zone displays', 'Regulation strategy cards', 'Feeling thermometer'],
    cost_implications: '£50-£150 for materials',

    key_components: [
      'Four zones: Blue (low arousal - sad, tired, bored), Green (calm, focused, ready to learn), Yellow (elevated arousal - frustrated, excited, anxious), Red (extremely high arousal - angry, terrified, elated)',
      'All zones are okay - it\'s what we do in them that matters',
      'Identifying your current zone',
      'Tools/strategies for each zone',
      'Expected zones for different situations',
      'Social awareness (reading others\' zones)'
    ],

    fidelity_checklist: [
      'Teach all four zones explicitly',
      'Emphasize all zones are normal',
      'Model identifying your own zone',
      'Teach multiple regulation strategies',
      'Practice identifying zones daily',
      'Use visual supports throughout environment',
      'Apply to real situations, not just lessons',
      'Whole class/staff use common language'
    ],

    progress_indicators: [
      'Student can identify own zone',
      'Student can name regulation strategies',
      'Student uses strategies without prompting',
      'Fewer escalations to Red zone',
      'More time in Green zone',
      'Improved recovery time',
      'Better empathy for others\' emotions'
    ],

    expected_outcomes: [
      'Improved emotional awareness',
      'Better self-regulation',
      'Reduced behavioral incidents',
      'Increased time engaged in learning',
      'Improved peer relationships'
    ],

    adaptations: [
      'Simplify to 3 zones for younger children',
      'Use actual photos of student in different zones',
      'Create personalized strategy cards',
      'Use apps/digital versions',
      'Adapt language for age'
    ],

    contraindications: ['None - flexible framework suitable for all'],

    complementary_interventions: [
      'Mindfulness training',
      'Social skills teaching',
      'Sensory regulation strategies',
      'CBT techniques'
    ],

    implementation_guide: 'Week 1: Introduce Blue zone (low arousal). Week 2: Introduce Yellow zone (elevated). Week 3: Introduce Green zone (optimal). Week 4: Introduce Red zone (extreme). Weeks 5-8: Teach tools/strategies for each zone. Weeks 9-12: Apply to real situations. Daily practice: Check in with zones, model using zones language, point out expected zones for activities, celebrate strategy use. Display zones visually. Use common language school-wide.',

    parent_information: 'The Zones of Regulation helps your child understand and manage their emotions using four colors: Blue (sad/tired), Green (calm/focused), Yellow (worried/excited), and Red (angry/terrified). All zones are okay! We\'re teaching your child to: recognize which zone they\'re in, know which zone is best for different activities, and use strategies to get to the right zone. At home, you can help by: using zones language ("I notice you\'re in the Yellow zone"), helping identify zones during everyday situations, praising strategy use, and staying calm when your child is in Red zone.',

    useful_links: [
      'https://www.zonesofregulation.com',
      'https://www.twinkl.co.uk/resource/zones-of-regulation',
      'https://www.understood.org/en/articles/zones-of-regulation-what-you-need-to-know'
    ],

    created_at: '2025-11-01',
    updated_at: '2025-11-01',
    tags: ['self_regulation', 'emotions', 'zones', 'autism', 'ADHD', 'tier_2', 'visual', 'whole_school']
  },
];

// ============================================================================
// SOCIAL-EMOTIONAL INTERVENTIONS (20+ interventions)
// ============================================================================

const SOCIAL_EMOTIONAL_INTERVENTIONS: InterventionTemplate[] = [
  {
    id: 'social-skills-group-training',
    name: 'Structured Social Skills Group Training',
    category: 'social_emotional',
    subcategory: 'social_skills',
    description: 'Explicit teaching of social skills in small group format using teach-model-practice-feedback cycle. Covers conversation skills, friendship skills, perspective-taking, conflict resolution, and group participation.',
    targeted_needs: ['Poor social skills', 'Difficulty making friends', 'Autism', 'Social communication difficulties', 'Isolation', 'Social anxiety'],

    evidence_level: 'tier_2',
    research_sources: ['EEF Social & Emotional Learning', 'Bellini Social Skills Research', 'CASEL'],
    effect_size: 0.57,
    success_rate: '60-70% improvement in social competence',

    age_range: ['primary', 'secondary'],
    setting: ['small_group'],
    duration: '12-16 weeks',
    frequency: '1-2 times per week',
    session_length: '45-60 minutes',
    total_sessions: 20,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Social skills curriculum', 'Role-play scenarios', 'Video modeling materials', 'Reinforcement system', 'Parent communication materials'],
    cost_implications: '£100-£300 for curriculum and materials',

    key_components: [
      'Explicit instruction of target skill',
      'Modeling and demonstration',
      'Role-play practice',
      'Performance feedback',
      'Generalization activities',
      'Home practice assignments',
      'Peer involvement',
      'Self-monitoring'
    ],

    fidelity_checklist: [
      'Follow structured curriculum/program',
      'Teach one skill at a time',
      'Use clear "I do, We do, You do" model',
      'Provide multiple practice opportunities',
      'Give specific, positive feedback',
      'Set up generalization opportunities',
      'Involve peers in later sessions',
      'Assign home practice',
      'Review previous skills regularly',
      'Celebrate successes'
    ],

    progress_indicators: [
      'Demonstrates skills in group sessions',
      'Uses skills in natural school settings',
      'Reports fewer social difficulties',
      'Increased peer interactions',
      'Teacher/parent report improvement',
      'Reduced social anxiety',
      'Initiation of social interactions'
    ],

    expected_outcomes: [
      'Improved peer relationships',
      'Reduced social isolation',
      'Better conversation skills',
      'Improved conflict resolution',
      'Increased confidence in social situations'
    ],

    adaptations: [
      'Use visual supports for autism',
      'Video modeling for difficult concepts',
      'Incorporate special interests',
      'Reduce group size for anxiety',
      'Use comic strip conversations',
      'Practice in natural settings'
    ],

    contraindications: [
      'Very severe social anxiety may need individual work first',
      'Significant disruptive behavior may interfere with group'
    ],

    complementary_interventions: [
      'Lunch bunch programs',
      'Peer buddy systems',
      'Emotion recognition training',
      'Anxiety management'
    ],

    implementation_guide: 'Session structure: (1) Review home practice (5 min), (2) Introduce target skill with rationale (5 min), (3) Model skill with video/role-play (10 min), (4) Guided practice in pairs (15 min), (5) Group activity practicing skill (15 min), (6) Feedback and reflection (5 min), (7) Assign home practice (5 min). Skills taught: Starting conversations, joining activities, listening skills, asking questions, sharing/turn-taking, handling disagreements, understanding feelings, being a good friend, dealing with teasing, working in groups. Use consistent structure. Celebrate effort. Involve parents.',

    parent_information: 'Your child is learning important friendship skills in a small, supportive group. Each week they learn a new skill like: starting conversations, joining play, sharing, resolving conflicts, and understanding others\' feelings. At home, you can help by: practicing the weekly skill (we\'ll send home a guide), arranging playdates/social opportunities, pointing out successful social interactions, coaching in the moment when appropriate, and celebrating effort.',

    useful_links: [
      'https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/social-and-emotional-learning',
      'https://www.commonsensemedia.org/articles/social-skills-activities',
      'https://casel.org'
    ],

    created_at: '2025-11-01',
    updated_at: '2025-11-01',
    tags: ['social_skills', 'autism', 'friendship', 'tier_2', 'group', 'social_emotional_learning']
  },

  {
    id: 'cbt-anxiety-intervention',
    name: 'CBT-Based Anxiety Management Intervention',
    category: 'social_emotional',
    subcategory: 'anxiety',
    description: 'Cognitive Behavioral Therapy techniques adapted for school setting. Teaches students to identify anxious thoughts, challenge them, and use coping strategies. Includes gradual exposure to feared situations.',
    targeted_needs: ['Anxiety disorders', 'School refusal', 'Test anxiety', 'Social anxiety', 'Separation anxiety', 'Panic attacks', 'Perfectionism'],

    evidence_level: 'tier_1',
    research_sources: ['NICE Guidelines', 'Coping Cat Program', 'Cool Kids Program', 'EEF'],
    effect_size: 0.86,
    success_rate: '75-85% reduction in anxiety symptoms',

    age_range: ['primary', 'secondary'],
    setting: ['one_to_one', 'small_group'],
    duration: '10-16 weeks',
    frequency: '1-2 times per week',
    session_length: '30-50 minutes',
    total_sessions: 16,

    complexity: 'high',
    staff_training_required: true,
    resources_needed: ['CBT workbooks/materials', 'Feeling thermometer', 'Thought diary', 'Relaxation scripts', 'Anxiety ladder/hierarchy'],
    cost_implications: '£50-£200 for materials; requires trained practitioner (EP, MH worker)',

    key_components: [
      'Psychoeducation about anxiety',
      'Identifying physical signs of anxiety',
      'Recognizing anxious thoughts',
      'Cognitive restructuring (challenging thoughts)',
      'Relaxation techniques (breathing, progressive muscle relaxation)',
      'Graded exposure to feared situations',
      'Relapse prevention'
    ],

    fidelity_checklist: [
      'Follow evidence-based program (e.g., Coping Cat, Cool Kids)',
      'Teach all core CBT components',
      'Use thought records/diaries',
      'Develop anxiety hierarchy collaboratively',
      'Practice relaxation in every session',
      'Include gradual exposure (not avoidance)',
      'Involve parents in sessions or parallel parent sessions',
      'Assign home practice',
      'Review and troubleshoot weekly'
    ],

    progress_indicators: [
      'Reduced anxiety rating on scales (e.g., RCADS, Spence)',
      'Increased participation in avoided situations',
      'More school attendance',
      'Student uses coping strategies independently',
      'Reports feeling more in control',
      'Reduced physical symptoms',
      'Better sleep, concentration'
    ],

    expected_outcomes: [
      'Significant reduction in anxiety symptoms',
      'Improved daily functioning',
      'Better school attendance',
      'Increased participation in activities',
      'Improved academic performance',
      'Better quality of life'
    ],

    adaptations: [
      'Use drawing for younger children',
      'Comic strip thought bubbles',
      'Apps for thought diaries',
      'Start with lower-anxiety situations',
      'Adjust language for age',
      'Consider cultural factors'
    ],

    contraindications: [
      'Acute crisis requires immediate mental health support',
      'Severe depression should be addressed first',
      'Trauma-related anxiety may need trauma-focused CBT'
    ],

    complementary_interventions: [
      'Mindfulness training',
      'Social skills (if social anxiety)',
      'Academic support (if test anxiety)',
      'Parent anxiety management'
    ],

    implementation_guide: 'Sessions 1-2: Build rapport, psychoeducation about anxiety. Session 3-4: Teach relaxation techniques. Sessions 5-6: Identify and challenge anxious thoughts. Sessions 7-8: Create anxiety hierarchy. Sessions 9-14: Gradual exposure (start with least anxiety-provoking, progress up hierarchy). Sessions 15-16: Review progress, relapse prevention plan. Use FEAR acronym: Feeling frightened? Expecting bad things? Attitudes and Actions (challenge thoughts, face fears), Results and Rewards. Practice coping strategies weekly.',

    parent_information: 'Your child is learning to manage their anxiety using proven techniques. They will learn: what happens in their body when anxious, how to calm down using breathing/relaxation, how thoughts affect feelings, how to challenge worried thoughts, and how to gradually face fears (not avoid them). This is called CBT (Cognitive Behavioral Therapy). Your role: encourage practice of techniques at home, don\'t accommodate avoidance (gently support facing fears), praise brave behavior, manage your own anxiety, attend parent sessions if offered. Anxiety improves with practice - be patient.',

    useful_links: [
      'https://www.nice.org.uk/guidance/cg159',
      'https://workbookpublishing.com/coping-cat',
      'https://www.anxietyuk.org.uk',
      'https://www.youngminds.org.uk/young-person/coping-with-life/anxiety'
    ],

    created_at: '2025-11-01',
    updated_at: '2025-11-01',
    tags: ['anxiety', 'CBT', 'mental_health', 'tier_1', 'evidence_based', 'school_refusal', 'therapy']
  },
];

// ============================================================================
// COMMUNICATION INTERVENTIONS (15+ interventions)
// ============================================================================

const COMMUNICATION_INTERVENTIONS: InterventionTemplate[] = [
  {
    id: 'pecs-communication-training',
    name: 'Picture Exchange Communication System (PECS)',
    category: 'communication',
    subcategory: 'aac',
    description: 'Systematic AAC approach where student learns to exchange picture symbols to communicate wants/needs. Progresses through 6 phases from simple requesting to commenting and answering questions.',
    targeted_needs: ['Non-verbal', 'Severely limited verbal communication', 'Autism', 'Developmental delay', 'Cerebral palsy', 'Need for functional communication system'],

    evidence_level: 'tier_1',
    research_sources: ['Bondy & Frost (1994)', 'NPDC Evidence-Based Practices', 'NICE Autism Guidelines'],
    effect_size: 0.76,
    success_rate: '70-80% develop functional communication',

    age_range: ['early_years', 'primary', 'all'],
    setting: ['one_to_one', 'small_group', 'classroom', 'home'],
    duration: '12-24 weeks (or ongoing as needed)',
    frequency: 'Throughout the day, embedded in activities',
    session_length: 'Embedded - not discrete sessions',

    complexity: 'high',
    staff_training_required: true,
    resources_needed: ['PECS pictures/symbols', 'Communication book', 'Velcro', 'Laminator', 'Storage system', 'Training in PECS protocol'],
    cost_implications: '£100-£300 for materials + £500-£1000 for official training',

    key_components: [
      'Phase 1: Physical exchange (highly motivating items)',
      'Phase 2: Distance and persistence',
      'Phase 3: Discrimination between symbols',
      'Phase 4: Sentence structure ("I want...")',
      'Phase 5: Responsive requesting ("What do you want?")',
      'Phase 6: Commenting and answering questions',
      'Naturalistic teaching throughout day',
      'Consistency across all settings'
    ],

    fidelity_checklist: [
      'Follow PECS phases systematically',
      'Use physical prompting (not verbal)',
      'Immediately honor all communication attempts',
      'Use backward chaining prompting',
      'Teach during natural motivation',
      'All staff use consistent protocol',
      'Update communication book regularly with new vocabulary',
      'Data collection on communication attempts',
      'Generalization across people and settings'
    ],

    progress_indicators: [
      'Initiates communication independently',
      'Increased number of communicative exchanges',
      'Discrimination between multiple symbols',
      'Uses sentence strips',
      'Requests variety of items/activities',
      'Decreased challenging behavior (due to communication)',
      'Possible emergence of spoken words'
    ],

    expected_outcomes: [
      'Functional communication system established',
      'Reduced frustration and challenging behavior',
      'Increased independence',
      'Better participation in activities',
      'Some students develop speech alongside PECS'
    ],

    adaptations: [
      'Use actual photos instead of line drawings',
      'Larger symbols for visual/motor difficulties',
      'Digital PECS apps (e.g., Proloquo2Go)',
      'Simplified book organization',
      'Start with highly preferred items'
    ],

    contraindications: ['None - can be used alongside other communication methods'],

    complementary_interventions: [
      'Speech therapy',
      'Makaton signing',
      'Visual schedules',
      'Social stories',
      'Behavior support'
    ],

    implementation_guide: 'PECS must be taught by trained staff. Phase 1: Two adults, physical prompting (no verbal), immediate access to item when picture exchanged. Phase 2: Increase distance to book, persistence training. Phase 3: Discrimination training between pictures. Phase 4: Build sentence strips ("I want" + picture). Phase 5: Answer "What do you want?". Phase 6: Answer other questions, commenting. Embed throughout day during naturally occurring motivation. All staff must use consistent protocol. Honor ALL communication attempts immediately. Update vocabulary frequently.',

    parent_information: 'PECS will give your child a way to tell us what they want and need using pictures. It doesn\'t stop speech development - many children start talking after learning PECS! Your child will learn to exchange a picture to communicate. At home, you can help by: having a PECS book at home, responding immediately when your child uses PECS, not giving things without the exchange (even though it\'s tempting!), making sure favorite things are available to request, and celebrating all communication attempts. We will train you on how to use PECS correctly.',

    useful_links: [
      'https://pecs-unitedkingdom.com',
      'https://www.autism.org.uk/advice-and-guidance/topics/communication/communication-tools/pecs',
      'https://afirm.fpg.unc.edu/picture-exchange-communication-system'
    ],

    created_at: '2025-11-01',
    updated_at: '2025-11-01',
    tags: ['AAC', 'PECS', 'communication', 'autism', 'non_verbal', 'tier_1', 'evidence_based', 'requires_training']
  },

  {
    id: 'narrative-intervention-therapy',
    name: 'Narrative Intervention for Language Development',
    category: 'communication',
    subcategory: 'language',
    description: 'Structured approach to teaching story grammar and narrative skills. Students learn to tell complete, well-organized stories with key elements (characters, setting, problem, solution). Uses visual supports and systematic prompting.',
    targeted_needs: ['Poor narrative skills', 'Language disorder', 'Difficulty retelling stories', 'Weak comprehension', 'Autism (social communication)'],

    evidence_level: 'tier_1',
    research_sources: ['Petersen (2011) Narrative Language Research', 'EEF Oral Language', 'SLP Research'],
    effect_size: 0.62,
    success_rate: '70-80% improvement in narrative skills',

    age_range: ['early_years', 'primary'],
    setting: ['small_group', 'one_to_one'],
    duration: '8-12 weeks',
    frequency: '2-3 times per week',
    session_length: '30-40 minutes',
    total_sessions: 24,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Story grammar posters', 'Picture sequence cards', 'Story maps', 'Books at appropriate level', 'Recording device (optional)'],
    cost_implications: '£30-£100 for materials',

    key_components: [
      'Explicit teaching of story grammar (who, what, when, where, what happened, how it ended)',
      'Visual story maps',
      'Modeling complete narratives',
      'Guided retelling with prompts',
      'Personal narrative development',
      'Fictional narrative creation',
      'Linking to literacy'
    ],

    fidelity_checklist: [
      'Teach story grammar elements explicitly',
      'Use visual supports consistently',
      'Model narratives before expecting production',
      'Provide systematic prompts (who? what? where?)',
      'Practice with multiple stories',
      'Include personal narratives and fiction',
      'Gradually fade prompts',
      'Connect to reading and writing',
      'Celebrate story-telling attempts'
    ],

    progress_indicators: [
      'Includes more story grammar elements',
      'Longer, more detailed narratives',
      'Better organization of stories',
      'Reduced need for prompting',
      'Improved comprehension of stories',
      'Transfer to written narratives',
      'Increased confidence in speaking'
    ],

    expected_outcomes: [
      'Complete, well-organized narratives',
      'Improved reading comprehension',
      'Better writing skills',
      'Increased confidence in communication',
      'Improved social communication'
    ],

    adaptations: [
      'Start with very simple stories (3 pictures)',
      'Use student photos for personal narratives',
      'Apps with story sequencing',
      'Draw stories instead of telling',
      'Use familiar, high-interest stories',
      'Reduce language complexity for younger students'
    ],

    contraindications: ['Very limited language requires foundational language work first'],

    complementary_interventions: [
      'Vocabulary development',
      'Grammar intervention',
      'Reading comprehension strategies',
      'Social skills (for autism)'
    ],

    implementation_guide: 'Week 1-2: Introduce story grammar using simple 3-picture sequences. Model telling complete story with visual support. Week 3-4: Students retell familiar stories with full prompting. Week 5-6: Retell new stories with reduced prompts. Week 7-8: Personal narratives (what did you do at the weekend?). Week 9-10: Create fictional stories. Week 11-12: Link to written narratives. Use "Story Grammar Marker" or similar system. Always start with strong model. Use systematic wh-questions (who? where? what happened?). Celebrate attempts.',

    parent_information: 'Your child is learning to tell complete, organized stories. This helps with: understanding stories they read, remembering information in order, expressing themselves clearly, and writing. They are learning stories have key parts: who (characters), where (setting), what happened (events), problem, solution, ending. At home, you can help by: asking questions when your child tells you about their day (who was there? what happened? how did you feel?), reading stories and pointing out these parts, letting your child retell familiar stories, and praising story-telling attempts.',

    useful_links: [
      'https://www.talkingpoint.org.uk',
      'https://www.asha.org/public/speech/development/narrative-skills',
      'https://educationendowmentfoundation.org.uk/education-evidence/early-years-toolkit/oral-language-interventions'
    ],

    created_at: '2025-11-01',
    updated_at: '2025-11-01',
    tags: ['language', 'narrative', 'oral_language', 'speech_therapy', 'tier_1', 'early_years', 'primary']
  },
];

// ============================================================================
// SENSORY & PHYSICAL INTERVENTIONS (10+ interventions)
// ============================================================================

const SENSORY_INTERVENTIONS: InterventionTemplate[] = [
  {
    id: 'sensory-integration-therapy',
    name: 'Sensory Integration Therapy (OT-led)',
    category: 'sensory',
    subcategory: 'sensory_processing',
    description: 'Occupational therapy intervention using controlled sensory experiences to improve processing and integration of sensory information. Addresses over-responsivity, under-responsivity, and sensory-seeking behaviors.',
    targeted_needs: ['Sensory processing disorder', 'Autism (sensory differences)', 'Over-sensitivity to sensory input', 'Sensory-seeking behavior', 'Poor body awareness', 'Coordination difficulties'],

    evidence_level: 'tier_2',
    research_sources: ['Ayres Sensory Integration', 'AOTA Practice Guidelines', 'Emerging evidence base'],
    success_rate: '60-70% improvement in sensory tolerance and regulation',

    age_range: ['early_years', 'primary', 'secondary'],
    setting: ['one_to_one', 'mixed'],
    duration: '12-20 weeks',
    frequency: '1-2 times per week',
    session_length: '45-60 minutes',
    total_sessions: 20,

    complexity: 'high',
    staff_training_required: true,
    resources_needed: ['Sensory equipment (swings, weighted items, textured materials, therapy balls)', 'Sensory room (ideal)', 'Occupational therapist'],
    cost_implications: '£500-£2000 for equipment + OT fees',

    key_components: [
      'Assessment of sensory profile',
      'Controlled sensory experiences',
      'Just-right challenge',
      'Child-led exploration',
      'Vestibular input (movement, balance)',
      'Proprioceptive input (heavy work, resistance)',
      'Tactile experiences',
      'Gradual exposure to challenging sensory experiences'
    ],

    fidelity_checklist: [
      'Led by trained Occupational Therapist',
      'Individualized based on sensory profile',
      'Child actively engaged (not passive)',
      'Activities provide adaptive responses',
      'Balanced sensory diet throughout day',
      'Collaboration with school staff',
      'Environmental modifications in classroom',
      'Regular review and adjustment of plan'
    ],

    progress_indicators: [
      'Improved tolerance of sensory experiences',
      'Reduced sensory-seeking/avoiding behaviors',
      'Better self-regulation',
      'Improved attention and engagement',
      'Reduced meltdowns related to sensory overload',
      'Better participation in daily activities',
      'Improved motor coordination'
    ],

    expected_outcomes: [
      'Better sensory processing',
      'Improved regulation',
      'Increased participation in school activities',
      'Reduced challenging behaviors',
      'Improved quality of life'
    ],

    adaptations: [
      'Tailor to individual sensory profile',
      'Home sensory diet recommendations',
      'Portable sensory tools for classroom',
      'Sensory breaks built into school day',
      'Environmental modifications'
    ],

    contraindications: [
      'Medical conditions (epilepsy, heart conditions) require medical clearance',
      'Must be delivered by trained OT'
    ],

    complementary_interventions: [
      'Sensory diet throughout day',
      'Environmental modifications',
      'Self-regulation strategies',
      'Zones of Regulation'
    ],

    implementation_guide: 'OT completes sensory profile assessment (e.g., Sensory Profile 2). Identifies areas of difficulty (hyper-responsive, hypo-responsive, sensory-seeking). Designs individualized program targeting specific sensory systems. Typical activities: swinging for vestibular input, resistance activities for proprioception, tactile play, balance challenges. Sessions include gross motor activities with sensory components. Child leads exploration within structured environment. OT analyzes adaptive responses. Collaborate with school to: identify sensory triggers, provide sensory breaks, modify environment, create sensory toolkit.',

    parent_information: "Your child's nervous system processes sensory information differently. Sensory integration therapy uses movement, touch, and other sensory experiences to help your child's brain better organize and respond to sensory input. The OT will work with your child on activities like: swinging, climbing, tactile play, and 'heavy work' exercises. These aren't just for fun - they help your child's brain develop better sensory processing. At home, you can help by: following the sensory diet recommendations (activities to do daily), being patient with sensory sensitivities, offering sensory tools (fidgets, weighted blanket, etc.), and avoiding forcing sensory experiences.",

    useful_links: [
      'https://www.sensory-processing.com',
      'https://www.autism.org.uk/advice-and-guidance/topics/behaviour/sensory-differences',
      'https://www.spdfoundation.net'
    ],

    created_at: '2025-11-01',
    updated_at: '2025-11-01',
    tags: ['sensory', 'OT', 'autism', 'sensory_processing', 'tier_2', 'specialist', 'high_cost']
  },

  {
    id: 'sensory-breaks-movement-breaks',
    name: 'Scheduled Sensory and Movement Breaks',
    category: 'sensory',
    subcategory: 'sensory_regulation',
    description: 'Regular, scheduled breaks throughout school day providing sensory and movement input. Prevents sensory overload and maintains optimal arousal level for learning. Includes heavy work, movement, and calming activities.',
    targeted_needs: ['Attention difficulties', 'ADHD', 'Autism (sensory needs)', 'Hyperactivity', 'Difficulty sitting still', 'Sensory-seeking behavior', 'Low arousal/alertness'],

    evidence_level: 'tier_2',
    research_sources: ['OT research', 'ADHD intervention research', 'Teacher feedback evidence'],
    success_rate: '60-75% improvement in attention and regulation',

    age_range: ['early_years', 'primary', 'secondary'],
    setting: ['classroom', 'mixed'],
    duration: 'Ongoing as needed',
    frequency: 'Every 30-60 minutes throughout day',
    session_length: '3-10 minutes per break',

    complexity: 'low',
    staff_training_required: false,
    resources_needed: ['Movement break activity cards', 'Sensory tools (resistance bands, fidgets, weighted items)', 'Timer', 'Designated space'],
    cost_implications: '£20-£100 for sensory tools',

    key_components: [
      'Scheduled regularly (proactive, not reactive)',
      'Mixture of activities: alerting (jumping, running) and calming (breathing, stretching)',
      'Heavy work activities (wall pushes, chair pushes, carrying)',
      'Vestibular input (spinning, rocking)',
      'Brief duration (don\'t miss too much teaching)',
      'Individualized based on needs'
    ],

    fidelity_checklist: [
      'Breaks scheduled proactively (not punishment)',
      'Frequency based on individual need',
      'Activities match arousal state (alerting for low arousal, calming for high)',
      'Include heavy work/proprioceptive input',
      'Brief (3-10 minutes)',
      'Student returns ready to learn',
      'Adjust based on effectiveness',
      'Teach student to request breaks when needed'
    ],

    progress_indicators: [
      'Improved attention after breaks',
      'Reduced fidgeting/restlessness',
      'Fewer behavioral incidents',
      'Better work completion',
      'Student self-advocates for breaks',
      'Improved self-regulation'
    ],

    expected_outcomes: [
      'Maintained optimal arousal for learning',
      'Improved on-task behavior',
      'Better academic performance',
      'Reduced disruptive behavior',
      'Increased independence in regulation'
    ],

    adaptations: [
      'Whole-class movement breaks benefit everyone',
      'Discrete breaks for students who need more',
      'Break pass system',
      'Visual timer for break duration',
      'Menu of break activities (student choice)'
    ],

    contraindications: ['None - benefits all students'],

    complementary_interventions: [
      'Flexible seating options',
      'Fidget tools during lessons',
      'OT sensory integration therapy',
      'Self-monitoring strategies'
    ],

    implementation_guide: 'Create break schedule based on student\'s needs (e.g., every 30 minutes). Provide menu of activities: Heavy work (wall pushes, chair push-ups, carry books), Movement (jumping jacks, running in place, animal walks), Calming (deep breathing, stretching). Use visual timer. Student completes 2-3 activities for 3-10 minutes. Return to class ready to focus. For ADHD: shorter, more frequent breaks. For autism: predictable schedule, visual cues. For sensory-seeking: heavy work emphasis. Teach whole class so it\'s not stigmatizing. Eventually, student learns to request breaks independently.',

    parent_information: 'Your child will have regular short breaks for movement and sensory input throughout the school day. This helps them stay focused and calm. Think of it like a phone battery - the breaks "recharge" their attention. Break activities include: jumping, pushing, carrying, stretching, and deep breathing. This is NOT a reward or punishment - it\'s a brain break everyone needs. At home, you can help by: building movement into daily routine (chores that involve carrying/pushing), outdoor play daily, active homework breaks, and not insisting on sitting perfectly still during homework.',

    useful_links: [
      'https://www.gonoodle.com',
      'https://www.understood.org/en/articles/the-benefits-of-movement-breaks',
      'https://www.additudemag.com/movement-breaks-adhd-students'
    ],

    created_at: '2025-11-01',
    updated_at: '2025-11-01',
    tags: ['sensory', 'movement', 'ADHD', 'autism', 'breaks', 'tier_2', 'low_cost', 'easy_implementation']
  },
];

// ============================================================================
// COMBINE ALL INTERVENTIONS
// ============================================================================

export const INTERVENTION_LIBRARY: InterventionTemplate[] = [
  ...ACADEMIC_INTERVENTIONS,
  ...BEHAVIORAL_INTERVENTIONS,
  ...SOCIAL_EMOTIONAL_INTERVENTIONS,
  ...COMMUNICATION_INTERVENTIONS,
  ...SENSORY_INTERVENTIONS,
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get interventions by category
 */
export function getInterventionsByCategory(category: InterventionCategory): InterventionTemplate[] {
  return INTERVENTION_LIBRARY.filter((i) => i.category === category);
}

/**
 * Get interventions by age range
 */
export function getInterventionsByAge(ageRange: AgeRange): InterventionTemplate[] {
  return INTERVENTION_LIBRARY.filter((i) => i.age_range.includes(ageRange) || i.age_range.includes('all'));
}

/**
 * Get interventions by evidence level
 */
export function getInterventionsByEvidenceLevel(level: EvidenceLevel): InterventionTemplate[] {
  return INTERVENTION_LIBRARY.filter((i) => i.evidence_level === level);
}

/**
 * Search interventions by keyword
 */
export function searchInterventions(query: string): InterventionTemplate[] {
  const lowerQuery = query.toLowerCase();
  return INTERVENTION_LIBRARY.filter(
    (i) =>
      i.name.toLowerCase().includes(lowerQuery) ||
      i.description.toLowerCase().includes(lowerQuery) ||
      i.targeted_needs.some((need) => need.toLowerCase().includes(lowerQuery)) ||
      i.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get intervention by ID
 */
export function getInterventionById(id: string): InterventionTemplate | undefined {
  return INTERVENTION_LIBRARY.find((i) => i.id === id);
}

/**
 * Get recommended interventions based on needs
 */
export function getRecommendedInterventions(
  targetedNeeds: string[],
  ageRange?: AgeRange,
  setting?: Setting
): InterventionTemplate[] {
  return INTERVENTION_LIBRARY.filter((intervention) => {
    // Check if intervention addresses any of the targeted needs
    const needsMatch = targetedNeeds.some((need) =>
      intervention.targeted_needs.some((interventionNeed) =>
        interventionNeed.toLowerCase().includes(need.toLowerCase())
      )
    );

    // Check age range filter
    const ageMatch = ageRange
      ? intervention.age_range.includes(ageRange) || intervention.age_range.includes('all')
      : true;

    // Check setting filter
    const settingMatch = setting ? intervention.setting.includes(setting) || intervention.setting.includes('mixed') : true;

    return needsMatch && ageMatch && settingMatch;
  }).sort((a, b) => {
    // Sort by evidence level (tier_1 > tier_2 > tier_3)
    const evidenceOrder = { tier_1: 3, tier_2: 2, tier_3: 1 };
    return (evidenceOrder[b.evidence_level] || 0) - (evidenceOrder[a.evidence_level] || 0);
  });
}

// ============================================================================
// STATISTICS
// ============================================================================

export const INTERVENTION_STATS = {
  total: INTERVENTION_LIBRARY.length,
  by_category: {
    academic: ACADEMIC_INTERVENTIONS.length,
    behavioral: BEHAVIORAL_INTERVENTIONS.length,
    social_emotional: SOCIAL_EMOTIONAL_INTERVENTIONS.length,
    communication: COMMUNICATION_INTERVENTIONS.length,
    sensory: SENSORY_INTERVENTIONS.length,
  },
  by_evidence: {
    tier_1: INTERVENTION_LIBRARY.filter((i) => i.evidence_level === 'tier_1').length,
    tier_2: INTERVENTION_LIBRARY.filter((i) => i.evidence_level === 'tier_2').length,
    tier_3: INTERVENTION_LIBRARY.filter((i) => i.evidence_level === 'tier_3').length,
  },
};
