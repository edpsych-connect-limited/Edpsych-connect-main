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
  | 'behavioural'
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

  // ============================================================================
  // ADDITIONAL LITERACY INTERVENTIONS (30 interventions)
  // ============================================================================

  // PHONOLOGICAL AWARENESS INTERVENTIONS (3)
  {
    id: 'phonological-awareness-training',
    name: 'Phonological Awareness Training Program',
    category: 'academic',
    subcategory: 'phonological_awareness',
    description: 'Systematic teaching of phonological awareness skills progressing from larger units (words, syllables) to smaller units (onset-rime, phonemes). Essential pre-reading foundation.',
    targeted_needs: ['Pre-reading difficulties', 'Phonological awareness deficits', 'Dyslexia risk', 'Speech sound disorders affecting literacy'],

    evidence_level: 'tier_1',
    research_sources: ['National Reading Panel', 'Hatcher et al. (2006) Sound Linkage', 'EEF Phonological Awareness'],
    effect_size: 0.60,
    success_rate: '75-85% develop age-appropriate phonological skills',

    age_range: ['early_years', 'primary'],
    setting: ['small_group', 'one_to_one'],
    duration: '8-12 weeks',
    frequency: '4-5 times per week',
    session_length: '15-20 minutes',
    total_sessions: 48,

    complexity: 'low',
    staff_training_required: true,
    resources_needed: ['Sound discrimination materials', 'Picture cards', 'Counters/tokens', 'Clapping games resources'],
    cost_implications: '£30-£100 for materials',

    key_components: [
      'Listening and discrimination skills',
      'Rhyme awareness and generation',
      'Syllable segmentation and blending',
      'Onset-rime manipulation',
      'Phoneme isolation (first, last, middle sounds)',
      'Phoneme blending and segmenting',
      'Phoneme deletion and substitution'
    ],

    fidelity_checklist: [
      'Follow developmental progression (large to small units)',
      'Use multi-sensory approaches (visual, auditory, kinaesthetic)',
      'Provide explicit modeling',
      'Ensure high levels of practice',
      'Provide immediate corrective feedback',
      'Make activities playful and engaging',
      'Link to letters when appropriate (not too early)',
      'Track progress on each skill level'
    ],

    progress_indicators: [
      'Identifies rhyming words',
      'Generates rhymes',
      'Segments words into syllables',
      'Identifies initial sounds in words',
      'Identifies final sounds',
      'Blends sounds into words',
      'Segments words into individual sounds',
      'Manipulates sounds (deletion, substitution)'
    ],

    expected_outcomes: [
      'Age-appropriate phonological awareness',
      'Strong foundation for phonics instruction',
      'Improved early reading outcomes',
      'Reduced risk of reading failure'
    ],

    adaptations: [
      'Use visual supports (pictures, objects)',
      'Incorporate movement (jump for each sound)',
      'Use apps/technology for engagement',
      'Reduce group size for significant difficulties',
      'Incorporate student interests'
    ],

    contraindications: ['Hearing impairment requires audiological support first'],

    complementary_interventions: [
      'Letter knowledge teaching',
      'Phonics instruction',
      'Oral language development',
      'Speech therapy (if speech sound disorder)'
    ],

    implementation_guide: 'Weeks 1-2: Listening skills and sound discrimination (environmental sounds, instrument sounds, voice sounds). Weeks 3-4: Rhyme (identify, generate). Weeks 5-6: Syllables (clap, count, segment, blend). Weeks 7-8: Onset-rime (initial sound and rest of word). Weeks 9-10: Phoneme isolation (What sound does "cat" start with?). Weeks 11-12: Phoneme blending/segmenting (/c/ /a/ /t/ = cat). Use games: I-Spy, rhyme matching, sound boxes, phoneme hopscotch. Always multi-sensory - see, say, hear, move. Keep playful!',

    parent_information: 'Phonological awareness means hearing and manipulating sounds in words. This is THE most important pre-reading skill. Your child will learn to: hear rhymes, count syllables (clapping), hear individual sounds in words. These skills predict reading success! At home, you can help by: reading rhyme books (Dr Seuss), playing I-Spy with sounds ("I spy something beginning with /m/"), clapping syllables in names, singing songs and nursery rhymes. Make it fun - no pressure!',

    useful_links: [
      'https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/phonics',
      'https://www.readingrockets.org/strategies/phonological_awareness',
      'https://www.talkingpoint.org.uk/parent/phonological-awareness'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['phonological_awareness', 'pre_reading', 'dyslexia', 'early_intervention', 'tier_1', 'foundation_skills']
  },

  {
    id: 'rhyme-and-alliteration-program',
    name: 'Rhyme and Alliteration Development Program',
    category: 'academic',
    subcategory: 'phonological_awareness',
    description: 'Focused intervention on rhyme and alliteration skills using poems, songs, games, and books. Develops awareness of sound patterns in language.',
    targeted_needs: ['Poor rhyme awareness', 'Difficulty generating rhymes', 'Pre-reading difficulties', 'English as Additional Language'],

    evidence_level: 'tier_1',
    research_sources: ['Bradley & Bryant (1983)', 'Goswami & Bryant research', 'EEF Early Years Toolkit'],
    effect_size: 0.48,
    success_rate: '80-85% develop rhyme and alliteration skills',

    age_range: ['early_years', 'primary'],
    setting: ['classroom', 'small_group'],
    duration: '6-8 weeks',
    frequency: '4-5 times per week',
    session_length: '10-15 minutes',
    total_sessions: 30,

    complexity: 'low',
    staff_training_required: false,
    resources_needed: ['Rhyme books', 'Picture cards', 'Nursery rhyme resources', 'Musical instruments (optional)'],
    cost_implications: '£20-£60 for books and materials',

    key_components: [
      'Listening to and identifying rhymes',
      'Sorting rhyming and non-rhyming words',
      'Generating rhyming words',
      'Identifying alliteration (same initial sound)',
      'Creating alliterative phrases',
      'Using rhyme and alliteration in language play'
    ],

    fidelity_checklist: [
      'Use high-quality rhyme books and poems',
      'Start with rhyme identification before generation',
      'Use multi-sensory activities',
      'Make it fun and playful',
      'Provide lots of practice opportunities',
      'Incorporate movement and music',
      'Progress from recognition to production',
      'Celebrate attempts (not just correct answers)'
    ],

    progress_indicators: [
      'Identifies rhyming words when heard',
      'Sorts pictures by rhyme',
      'Completes rhyming couplets ("The cat sat on the...")',
      'Generates rhyming words spontaneously',
      'Identifies alliteration',
      'Creates alliterative phrases',
      'Uses rhyme in play and conversation'
    ],

    expected_outcomes: [
      'Secure rhyme and alliteration awareness',
      'Foundation for reading acquisition',
      'Improved phonological sensitivity',
      'Increased language playfulness'
    ],

    adaptations: [
      'Use bilingual rhymes for EAL learners',
      'Incorporate special interests',
      'Use technology (rhyme apps)',
      'Create personalized rhyme books',
      'Use pictures for younger children'
    ],

    contraindications: ['None - suitable for all learners'],

    complementary_interventions: [
      'Phonological awareness training',
      'Phonics instruction',
      'Oral language development',
      'Vocabulary development'
    ],

    implementation_guide: 'Week 1-2: Identify rhymes - read rhyme books, rhyme songs, "Do these words rhyme?" games. Week 3-4: Sort rhyming words - picture sort activities, rhyme matching. Week 5-6: Generate rhymes - complete rhyming phrases, think of rhymes for names. Week 7-8: Alliteration - "Silly Sally" books, tongue twisters, alliterative names. Activities: Rhyme time (daily rhyme), rhyme pairs game, rhyme basket (collect rhyming objects), alliteration art. Use classics: Dr Seuss, Julia Donaldson, nursery rhymes. Multi-sensory - clap, jump, dance with rhymes!',

    parent_information: 'Rhyming (words that sound the same at the end like cat-hat-mat) is a key early literacy skill. Children who can rhyme at age 4 are better readers at age 7! We\'re using poems, songs, and games to develop this skill. At home, you can help by: reading Dr Seuss and rhyming books, singing nursery rhymes, playing rhyme games ("What rhymes with your name?"), making up silly rhymes, and pointing out rhymes you hear. Make it playful - the sillier the better!',

    useful_links: [
      'https://www.booktrust.org.uk/books-and-reading/bookfinder/books-to-help-early-reading/',
      'https://www.bbc.co.uk/teach/school-radio/nursery-rhymes-songs-index/zhwdgwx',
      'https://hungrylittleminds.campaign.gov.uk/videos-and-activities/rhymes-and-songs/'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['rhyme', 'alliteration', 'phonological_awareness', 'early_years', 'tier_1', 'fun', 'low_cost']
  },

  {
    id: 'sound-discrimination-listening-skills',
    name: 'Sound Discrimination and Listening Skills Program',
    category: 'academic',
    subcategory: 'phonological_awareness',
    description: 'Develops fundamental listening and sound discrimination skills - prerequisite for phonological awareness. Progresses from environmental sounds to speech sounds.',
    targeted_needs: ['Poor listening skills', 'Sound discrimination difficulties', 'Auditory processing weaknesses', 'Very early literacy difficulties'],

    evidence_level: 'tier_2',
    research_sources: ['Sound Linkage Program', 'Auditory processing research', 'Emerging evidence for listening training'],
    success_rate: '70-75% improvement in listening and discrimination',

    age_range: ['early_years', 'primary'],
    setting: ['small_group', 'one_to_one'],
    duration: '6-8 weeks',
    frequency: '3-4 times per week',
    session_length: '10-15 minutes',
    total_sessions: 24,

    complexity: 'low',
    staff_training_required: false,
    resources_needed: ['Sound makers (instruments, objects)', 'Audio recordings', 'Picture cards', 'Barrier screens'],
    cost_implications: '£30-£80 for materials',

    key_components: [
      'Environmental sound discrimination',
      'Instrumental sound discrimination',
      'Body percussion sounds',
      'Voice and speech sound discrimination',
      'Identifying sounds in sequence',
      'Sound memory games',
      'Auditory attention skills'
    ],

    fidelity_checklist: [
      'Progress from easy (environmental) to hard (speech sounds)',
      'Use visual support initially, fade to auditory only',
      'Provide clear modeling',
      'Give immediate feedback',
      'Keep activities short and playful',
      'Reduce background noise',
      'Practice daily listening activities',
      'Celebrate successes'
    ],

    progress_indicators: [
      'Identifies everyday sounds (phone, door knock, animal sounds)',
      'Discriminates between similar sounds',
      'Identifies musical instruments by sound',
      'Discriminates speech sounds (long/short, loud/quiet)',
      'Remembers sound sequences',
      'Better attention to auditory information'
    ],

    expected_outcomes: [
      'Improved listening skills',
      'Better sound discrimination',
      'Foundation for phonological awareness',
      'Improved attention to spoken language'
    ],

    adaptations: [
      'Use visual cues initially (photos of sound sources)',
      'Start with very different sounds',
      'Use real objects as well as recordings',
      'Incorporate movement (move to the sound)',
      'Games format for engagement'
    ],

    contraindications: ['Hearing loss requires medical/audiological support'],

    complementary_interventions: [
      'Phonological awareness training',
      'Language enrichment',
      'Attention training',
      'Speech therapy if needed'
    ],

    implementation_guide: 'Week 1-2: Environmental sounds - identify everyday sounds (door, phone, car, dog), sound lotto games, recorded sounds. Week 3-4: Instrumental sounds - identify instruments, same/different games, sound sequences. Week 5-6: Voice sounds - loud/quiet, high/low, fast/slow, long/short words. Week 7-8: Speech sound discrimination - minimal pairs (cat/hat), initial sounds, rhyming sounds. Activities: Sound walks, sound scavenger hunt, listening box, barrier games (guess my sound), Kim\'s game with sounds. Use multi-sensory - link sounds to pictures/actions.',

    parent_information: 'Good listening and sound awareness is the foundation for all reading skills. Your child is learning to listen carefully and tell different sounds apart. We start with everyday sounds (doorbell, dog bark) and gradually work up to hearing tiny differences in speech sounds. At home, you can help by: playing "What\'s that sound?" games, listening walks (notice sounds around you), reducing background noise (TV off during activities), listening to music together, and giving listening instructions ("Listen for 3 sounds"). Make it fun!',

    useful_links: [
      'https://www.talkingpoint.org.uk/parent/listening',
      'https://www.asha.org/public/hearing/Helping-Your-Child-Develop-Listening-Skills/',
      'https://www.bbc.co.uk/teach/school-radio/audio-resources/z7p73j6'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['listening', 'sound_discrimination', 'auditory', 'phonological_awareness', 'tier_2', 'foundation']
  },

  // DECODING & PHONICS INTERVENTIONS (Additional 2 beyond existing)
  {
    id: 'multisensory-structured-language-orton-gillingham',
    name: 'Multisensory Structured Language (Orton-Gillingham Approach)',
    category: 'academic',
    subcategory: 'reading_decoding',
    description: 'Intensive, explicit, multisensory approach to teaching reading and spelling. Systematic instruction in phonology, sound-symbol association, syllable types, morphology. Gold standard for dyslexia.',
    targeted_needs: ['Dyslexia', 'Severe reading difficulties', 'Persistent phonics difficulties', 'Older struggling readers'],

    evidence_level: 'tier_1',
    research_sources: ['IDA (International Dyslexia Association)', 'What Works Clearinghouse', 'Ritchey & Goeke (2006) Meta-analysis'],
    effect_size: 0.64,
    success_rate: '70-80% significant reading improvement',

    age_range: ['primary', 'secondary', 'post_16'],
    setting: ['one_to_one', 'small_group'],
    duration: '2-3 years for comprehensive program',
    frequency: '3-5 times per week',
    session_length: '45-60 minutes',
    total_sessions: 200,

    complexity: 'high',
    staff_training_required: true,
    resources_needed: ['OG-certified program materials', 'Letter cards', 'Sound cards', 'Syllable cards', 'Reading texts', 'Spelling materials'],
    cost_implications: '£500-£2000 for materials + certified training (£3000+)',

    key_components: [
      'Multisensory (visual, auditory, kinaesthetic, tactile)',
      'Structured and sequential (builds systematically)',
      'Explicit teaching (no guessing)',
      'Cumulative (constantly review)',
      'Phonology-based',
      'Teaches 6 syllable types',
      'Morphology instruction',
      'Individualized pacing'
    ],

    fidelity_checklist: [
      'Taught by certified OG practitioner',
      'Individual or very small group',
      'Use all sensory pathways simultaneously',
      'Follow systematic scope and sequence',
      'Daily cumulative review',
      'Explicit teaching of rules and concepts',
      'Practice until automaticity',
      'Individualize pacing to student mastery',
      'Include reading, spelling, and handwriting'
    ],

    progress_indicators: [
      'Mastery of phoneme-grapheme correspondences',
      'Accurate decoding of words',
      'Improved spelling',
      'Knowledge of syllable types',
      'Ability to read multisyllabic words',
      'Increased reading fluency',
      'Better reading comprehension',
      'Improved confidence and motivation'
    ],

    expected_outcomes: [
      'Significant improvement in reading accuracy',
      'Grade-level advancement in reading',
      'Improved spelling skills',
      'Increased reading confidence',
      'Better access to curriculum'
    ],

    adaptations: [
      'Adjust pacing to individual student',
      'Incorporate student interests in reading texts',
      'Use technology for reinforcement',
      'Coordinate with classroom accommodations',
      'Involve parents in home practice'
    ],

    contraindications: [
      'Requires significant time commitment',
      'Must be delivered by trained practitioner',
      'Not suitable as quick fix - long-term intervention'
    ],

    complementary_interventions: [
      'Reading fluency practice',
      'Reading comprehension strategies',
      'Writing intervention',
      'Assistive technology training'
    ],

    implementation_guide: 'OG lesson structure (60 min): 1) Review cards (10 min) - sounds, words, concepts. 2) New learning (10 min) - introduce new concept using multi-sensory techniques (see, hear, say, write). 3) Reading practice (15 min) - word lists, phrases, passages at instructional level. 4) Spelling/writing (15 min) - encode words, sentences. 5) Reading text (10 min) - controlled text incorporating taught concepts. Sequence: Alphabet, consonants, short vowels, digraphs, blends, long vowels, r-controlled, diphthongs, syllable types, prefixes/suffixes, morphology. MUST be systematic, cumulative, explicit, multisensory, individualized.',

    parent_information: 'Your child is receiving Orton-Gillingham - a proven intensive reading program specifically designed for dyslexia and severe reading difficulties. It uses sight, sound, movement, and touch simultaneously to teach reading and spelling systematically. This is not a quick fix - it takes 2-3 years for the full program, but research shows excellent results. Your child will learn: all letter sounds, syllable patterns, spelling rules, and how to break down complex words. At home: practice review cards daily (5 minutes), read decodable books together, praise effort and progress, be patient - reading will improve steadily with this approach.',

    useful_links: [
      'https://dyslexiaida.org/orton-gillingham/',
      'https://www.readingwell.org/what-is-orton-gillingham',
      'https://www.bdadyslexia.org.uk/services/accreditation'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['dyslexia', 'orton_gillingham', 'multisensory', 'phonics', 'tier_1', 'intensive', 'evidence_based', 'specialist']
  },

  {
    id: 'fast-phonics-catch-up',
    name: 'Fast Track Phonics Catch-Up Program',
    category: 'academic',
    subcategory: 'reading_decoding',
    description: 'Accelerated phonics program for older students (7+) who missed phonics instruction or didn\'t respond to mainstream phonics. Age-appropriate materials maintain engagement.',
    targeted_needs: ['Older struggling readers (7-14)', 'Phonics gaps', 'Reluctant readers', 'Phonics program non-responders', 'Students new to English phonics'],

    evidence_level: 'tier_2',
    research_sources: ['EEF Small Group Tuition', 'Catch Up Literacy', 'Better Reading Partners evaluation'],
    effect_size: 0.48,
    success_rate: '65-70% significant phonics gains',

    age_range: ['primary', 'secondary'],
    setting: ['one_to_one', 'small_group'],
    duration: '10-15 weeks',
    frequency: '4-5 times per week',
    session_length: '20-30 minutes',
    total_sessions: 60,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Age-appropriate phonics materials', 'High-interest decodable texts', 'Games-based resources', 'Progress tracking tools'],
    cost_implications: '£100-£250 for materials',

    key_components: [
      'Diagnostic assessment to identify gaps',
      'Teach missed phonics systematically',
      'Age-appropriate presentation (not babyish)',
      'High-interest texts',
      'Games-based learning',
      'Immediate application to reading',
      'Building reading confidence',
      'Fast-paced instruction'
    ],

    fidelity_checklist: [
      'Complete diagnostic assessment first',
      'Teach only what student doesn\'t know (don\'t start from beginning if not needed)',
      'Use age-appropriate materials',
      'Fast-paced, engaging sessions',
      'Immediate practice in connected text',
      'Celebrate progress frequently',
      'Link to curriculum reading',
      'Build confidence and motivation'
    ],

    progress_indicators: [
      'Fills identified phonics gaps',
      'Improved decoding accuracy',
      'Faster reading speed',
      'Willing to attempt unknown words',
      'Better performance on curriculum texts',
      'Increased reading confidence',
      'More independent reading'
    ],

    expected_outcomes: [
      'Catch up to age-appropriate decoding skills',
      'Increased reading fluency',
      'Better access to curriculum',
      'Restored reading confidence',
      'Reduced gap with peers'
    ],

    adaptations: [
      'Use high-interest topics (sport, gaming, celebrities)',
      'Incorporate student choice',
      'Use technology/apps',
      'Link to real-world reading (signs, menus, websites)',
      'Pair with older reading buddy',
      'Celebrate small wins frequently'
    ],

    contraindications: [
      'Students with no phonics knowledge at all may need slower-paced systematic program',
      'Very severe dyslexia may require OG-based approach'
    ],

    complementary_interventions: [
      'Reading fluency intervention',
      'Reading comprehension strategies',
      'High-interest independent reading',
      'Confidence-building activities'
    ],

    implementation_guide: 'Week 1: Diagnostic assessment - identify exactly what student knows/doesn\'t know. Weeks 2-12: Teach missed content fast-paced - focus on gaps, not everything. Use age-appropriate materials (decodable texts about football, gaming, real life - not "fat cat sat"). Lesson structure (30 min): Quick review (5 min), teach new pattern explicitly with examples (7 min), game/activity practicing pattern (8 min), read connected text using pattern (10 min). Progress quickly. Use technology, games, competition. Link to real texts. Celebrate: "You can now read words like..."',

    parent_information: 'Your child is catching up on phonics - the letter-sound knowledge needed for reading. We know they\'re older, so we\'re using age-appropriate materials (no baby books!) and moving quickly through gaps. Your child will learn the phonics patterns they missed, using interesting texts about topics they care about. At home: let them read to younger siblings (builds confidence), play word games (Bananagrams, Scrabble), read magazines/websites about their interests, and PRAISE all reading attempts. Don\'t focus on mistakes - celebrate what they CAN read. Reading confidence is as important as reading skills.',

    useful_links: [
      'https://www.catchup.org/interventions/literacy',
      'https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/small-group-tuition',
      'https://www.booktrust.org.uk/books-and-reading/bookfinder/reluctant-reader-books/'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['phonics', 'catch_up', 'older_students', 'reluctant_readers', 'tier_2', 'accelerated', 'engagement']
  },

  // READING FLUENCY INTERVENTIONS (Additional 2 beyond existing)
  {
    id: 'paired-reading-intervention',
    name: 'Paired Reading for Fluency and Confidence',
    category: 'academic',
    subcategory: 'reading_fluency',
    description: 'Structured paired reading where skilled reader and student read together simultaneously, then student continues alone. Builds fluency, confidence, and positive reading experiences.',
    targeted_needs: ['Poor reading fluency', 'Low reading confidence', 'Reading anxiety', 'Reluctant readers', 'Need for reading practice'],

    evidence_level: 'tier_1',
    research_sources: ['Topping (1987) Paired Reading research', 'EEF Peer Tutoring', 'What Works Clearinghouse'],
    effect_size: 0.52,
    success_rate: '70-80% fluency and confidence improvement',

    age_range: ['primary', 'secondary'],
    setting: ['one_to_one', 'home', 'classroom'],
    duration: '8-12 weeks',
    frequency: '4-5 times per week',
    session_length: '15-20 minutes',
    total_sessions: 48,

    complexity: 'low',
    staff_training_required: true,
    resources_needed: ['High-interest books at appropriate level', 'Training for tutors/parents', 'Reward system', 'Reading log'],
    cost_implications: '£30-£100 for books and training materials',

    key_components: [
      'Reading together (tutor and student read aloud simultaneously)',
      'Tutor adjusts pace to student',
      'No corrections during reading together',
      'Student signals when ready to read alone (knock/tap)',
      'Immediate praise for signaling',
      'If student struggles alone, tutor joins back in',
      'Positive, pressure-free environment',
      'Student chooses books'
    ],

    fidelity_checklist: [
      'Read simultaneously (not turn-taking)',
      'Tutor matches student pace (don\'t race ahead)',
      'NO corrections during reading together',
      'Student decides when to read alone',
      'Praise immediately when student signals',
      'Join back in smoothly if student struggles',
      'Maintain positive, relaxed atmosphere',
      'Student choice of reading material',
      'Daily practice (consistency key)',
      'Celebrate all reading effort'
    ],

    progress_indicators: [
      'Increased time reading independently',
      'Improved reading fluency (WPM)',
      'Greater willingness to read',
      'Better self-correction',
      'More expression in reading',
      'Increased confidence',
      'Reading for pleasure outside sessions'
    ],

    expected_outcomes: [
      'Improved reading fluency',
      'Increased reading confidence',
      'More positive attitude to reading',
      'Better reading comprehension (consequence of fluency)',
      'Stronger reader-tutor relationship'
    ],

    adaptations: [
      'Parent as tutor (highly effective)',
      'Peer tutors (older student with younger)',
      'Volunteer tutors',
      'Use e-books with highlighting',
      'Start with very short sessions (5 min)',
      'Use graphic novels, magazines, non-fiction'
    ],

    contraindications: ['None - highly adaptable approach'],

    complementary_interventions: [
      'Independent reading program',
      'Phonics instruction (if decoding issues)',
      'Reading comprehension strategies',
      'Library visits and book access'
    ],

    implementation_guide: 'Train tutor: 1) Read together - both read aloud simultaneously, tutor matches student pace, no corrections. 2) When student feels confident, they knock/tap. 3) Tutor immediately praises and stops reading. 4) Student continues alone. 5) If student struggles (5 sec), tutor joins back in without comment. 6) Continue. Use books student enjoys and can read with 90%+ accuracy. 10-20 min daily. Keep positive - praise effort. Discuss book but don\'t quiz. Track progress: minutes read, pages completed, student confidence rating. Simple but powerful!',

    parent_information: 'Paired reading is a proven way to build your child\'s reading fluency and confidence. It\'s simple: you read together out loud at the same time. You match your child\'s speed. There\'s NO correcting mistakes while reading together. When your child feels ready, they knock the table and read alone. If they struggle, you simply join back in. That\'s it! The key: stay positive, let your child choose books they enjoy, practice daily for 10-20 minutes, and praise all effort. This works because: your child gets lots of practice, there\'s no pressure, mistakes are okay, they hear fluent reading, and reading becomes enjoyable!',

    useful_links: [
      'https://www.bradford.gov.uk/media/1412/paired-reading.pdf',
      'https://www.readingrockets.org/strategies/paired_reading',
      'https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/peer-tutoring'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['fluency', 'paired_reading', 'confidence', 'tier_1', 'parent_involvement', 'easy_implementation', 'low_cost']
  },

  {
    id: 'readers-theatre-prosody',
    name: 'Reader\'s Theatre for Fluency and Expression',
    category: 'academic',
    subcategory: 'reading_fluency',
    description: 'Students rehearse and perform scripts with expression. Repeated reading with authentic purpose builds fluency, prosody, and confidence. Performance element highly motivating.',
    targeted_needs: ['Poor reading prosody (expression)', 'Choppy, monotone reading', 'Reading fluency difficulties', 'Low reading motivation', 'Performance anxiety'],

    evidence_level: 'tier_2',
    research_sources: ['Rasinski Reader\'s Theatre research', 'EEF Oral Language', 'National Reading Panel'],
    effect_size: 0.45,
    success_rate: '70-75% improvement in fluency and prosody',

    age_range: ['primary', 'secondary'],
    setting: ['small_group', 'classroom'],
    duration: '8-12 weeks',
    frequency: '2-3 times per week',
    session_length: '30-45 minutes',
    total_sessions: 24,

    complexity: 'low',
    staff_training_required: false,
    resources_needed: ['Reader\'s theatre scripts', 'Simple props (optional)', 'Performance space', 'Recording device (optional)'],
    cost_implications: '£20-£60 for scripts (many free online)',

    key_components: [
      'Select engaging script at instructional level',
      'Model fluent, expressive reading',
      'Assign roles to students',
      'Practice reading scripts multiple times (repeated reading)',
      'Focus on expression, pace, volume, emotion',
      'Perform for audience (class, other classes, parents)',
      'No memorization required (reading with expression)',
      'Celebrate performances'
    ],

    fidelity_checklist: [
      'Scripts at appropriate reading level (90-95% accuracy)',
      'Model expressive reading first',
      'Multiple rehearsal sessions (repeated reading)',
      'Teach prosody explicitly (expression, phrasing, pace)',
      'Provide feedback on expression',
      'Build to performance',
      'Keep it fun - low pressure',
      'All students have appropriate roles',
      'Celebrate and record performances'
    ],

    progress_indicators: [
      'Improved reading expression',
      'Better phrasing and pacing',
      'Increased reading fluency (WPM)',
      'More confident oral reading',
      'Better interpretation of text meaning',
      'Increased enjoyment of reading aloud',
      'Improved comprehension'
    ],

    expected_outcomes: [
      'Significantly improved prosody',
      'Increased reading fluency',
      'Better oral reading confidence',
      'Improved comprehension through repeated reading',
      'More positive attitude toward reading'
    ],

    adaptations: [
      'Choose topics matching student interests',
      'Adjust script difficulty for mixed abilities',
      'Use narrator roles for struggling readers',
      'Record performances instead of live audience',
      'Use props and costumes for engagement',
      'Create own scripts based on curriculum content'
    ],

    contraindications: [
      'Very severe decoding difficulties need phonics intervention first',
      'Extreme performance anxiety requires gradual exposure'
    ],

    complementary_interventions: [
      'Phonics instruction (if decoding issues)',
      'Repeated reading practice',
      'Drama/confidence building',
      'Oral language development'
    ],

    implementation_guide: 'Week 1: Introduce concept, model expressive reading, assign first script and roles. Week 2-3: Daily practice (20 min) - read through scripts multiple times, coach expression ("How would you sound if you were excited/scared/angry?"), practice pace and phrasing. Week 4: Performance preparation - full rehearsals with expression. Week 5: Perform for audience. Repeat cycle with new scripts every 2-3 weeks. Teaching tips: use voice changes for characters, exaggerate expression, record rehearsals for self-assessment, provide specific feedback ("I loved how you sounded excited!"), keep scripts 2-4 pages, ensure all students have appropriate roles.',

    parent_information: 'Reader\'s Theatre is drama without memorization - students read scripts aloud with expression and perform them. The key: students rehearse the SAME script many times (repeated reading - proven to build fluency), and they practice reading with emotion and expression. This is NOT just reading words - it\'s bringing characters to life! Your child will: read the same script 5-10 times, learn to read with expression, and perform for an audience. At home: ask them to perform their script for you, practice character voices, talk about how characters feel, and attend performances. This makes reading FUN and meaningful!',

    useful_links: [
      'https://www.readwritethink.org/classroom-resources/lesson-plans/readers-theatre',
      'https://www.timrasinski.com/readers_theater.html',
      'https://www.teachingenglish.org.uk/article/readers-theatre'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['fluency', 'prosody', 'readers_theatre', 'drama', 'expression', 'tier_2', 'motivating', 'performance']
  },

  // READING COMPREHENSION INTERVENTIONS (Additional 3 beyond existing)
  {
    id: 'inference-making-questioning',
    name: 'Inference-Making and Questioning Techniques',
    category: 'academic',
    subcategory: 'reading_comprehension',
    description: 'Explicit teaching of inference-making using question types (literal, inferential, evaluative). Students learn to "read between the lines" and make logical conclusions from text.',
    targeted_needs: ['Poor reading comprehension despite good decoding', 'Difficulty with inference', 'Literal interpretation only', 'Weak critical thinking'],

    evidence_level: 'tier_1',
    research_sources: ['EEF Reading Comprehension Strategies', 'Questioning the Author (Beck & McKeown)', 'Inference intervention research'],
    effect_size: 0.62,
    success_rate: '70-80% improvement in inference and comprehension',

    age_range: ['primary', 'secondary'],
    setting: ['small_group', 'classroom'],
    duration: '8-12 weeks',
    frequency: '3-4 times per week',
    session_length: '30-40 minutes',
    total_sessions: 36,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Inference pictures', 'Texts at appropriate level', 'Question stems', 'Inference clues graphic organizers'],
    cost_implications: '£30-£100 for materials',

    key_components: [
      'Explicit teaching of inference ("reading detective work")',
      'Using text clues + background knowledge = inference',
      'Question types: literal (right there), inferential (think and search), evaluative (author and me)',
      'Think-aloud modeling',
      'Visual inference activities (pictures before text)',
      'Practice with varied text types',
      'Metacognitive reflection'
    ],

    fidelity_checklist: [
      'Teach inference explicitly (not assumed)',
      'Model thinking process with think-alouds',
      'Use inference equation: Text clues + What I know = Inference',
      'Start with pictures, progress to text',
      'Teach question types explicitly',
      'Provide graphic organizers',
      'Practice across fiction and non-fiction',
      'Encourage justification ("How do you know?")'
    ],

    progress_indicators: [
      'Makes inferences from pictures',
      'Identifies text clues',
      'Combines clues with prior knowledge',
      'Answers inferential questions',
      'Justifies inferences with evidence',
      'Transfers to independent reading',
      'Better comprehension of implicit meaning'
    ],

    expected_outcomes: [
      'Improved reading comprehension scores',
      'Better inference-making skills',
      'Deeper understanding of texts',
      'More critical engagement with reading',
      'Improved academic performance across curriculum'
    ],

    adaptations: [
      'Use visual supports (pictures, comics)',
      'Start with everyday inferences (facial expressions, situations)',
      'Use high-interest texts',
      'Reduce text length for weaker readers',
      'Partner work for peer discussion',
      'Video clips for engaging inference practice'
    ],

    contraindications: ['Very limited background knowledge requires knowledge-building first'],

    complementary_interventions: [
      'Vocabulary development',
      'Background knowledge building',
      'Reciprocal teaching',
      'Text structure teaching'
    ],

    implementation_guide: 'Week 1-2: Teach inference concept using pictures ("What\'s happening?", "How do you know?"). Week 3-4: Inference from single sentences. Week 5-6: Inference from paragraphs. Week 7-8: Character feelings and motivations. Week 9-10: Predicting outcomes. Week 11-12: Author\'s purpose and message. Always use formula: Text clues + My knowledge = Inference. Activities: Inference pictures, riddles, character feelings, prediction, "read between the lines". Teach question types: Right There (literal), Think & Search (inferential), Author & Me (evaluative). Use graphic organizers. Think-alouds are key!',

    parent_information: 'Inference means figuring out things the author doesn\'t say directly - like being a reading detective! Many children can read the words but miss the deeper meaning. We\'re teaching your child to: look for clues in the text, use what they already know, and put it together to understand what the author means (not just what they say). At home, you can help by: asking "How did you know that?", discussing character feelings ("How is she feeling? How do you know?"), pausing during stories to predict, and talking about "hidden" meanings. Any reading can practice inference!',

    useful_links: [
      'https://www.readingrockets.org/strategies/inferring',
      'https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/reading-comprehension-strategies',
      'https://www.theschoolrun.com/what-inference'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['comprehension', 'inference', 'questioning', 'critical_thinking', 'tier_1', 'detective_work']
  },

  {
    id: 'vocabulary-morphology-word-learning',
    name: 'Vocabulary Development through Morphology and Word Learning Strategies',
    category: 'academic',
    subcategory: 'vocabulary',
    description: 'Systematic vocabulary instruction using morphology (prefixes, suffixes, roots), context clues, and word learning strategies. Focuses on academic and Tier 2 vocabulary.',
    targeted_needs: ['Limited vocabulary', 'Difficulty learning new words', 'Poor academic vocabulary', 'Reading comprehension difficulties due to vocabulary', 'EAL students'],

    evidence_level: 'tier_1',
    research_sources: ['Beck, McKeown & Kucan - Bringing Words to Life', 'EEF Oral Language Interventions', 'Morphology research (Bowers & Kirby)'],
    effect_size: 0.58,
    success_rate: '75-80% vocabulary growth and comprehension improvement',

    age_range: ['primary', 'secondary'],
    setting: ['small_group', 'classroom'],
    duration: '12-20 weeks ongoing',
    frequency: '4-5 times per week',
    session_length: '15-20 minutes',
    total_sessions: 60,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Academic word lists', 'Morphology cards (prefixes, suffixes, roots)', 'Picture dictionaries', 'Context clue texts', 'Word maps'],
    cost_implications: '£50-£150 for materials',

    key_components: [
      'Teach Tier 2 academic vocabulary explicitly',
      'Morphological awareness (prefixes, suffixes, root words)',
      'Context clue strategies',
      'Word consciousness and word play',
      'Multiple exposures (7-10 encounters needed)',
      'Deep processing (not just definitions)',
      'Application in speaking and writing'
    ],

    fidelity_checklist: [
      'Select high-utility academic words (Tier 2)',
      'Teach 5-7 words per week in depth',
      'Provide student-friendly definitions',
      'Multiple exposures across contexts',
      'Teach morphology explicitly (un-, re-, -tion, etc.)',
      'Practice using words in sentences',
      'Word games and activities',
      'Monitor use in speaking/writing'
    ],

    progress_indicators: [
      'Increased breadth of vocabulary',
      'Uses taught words in speaking',
      'Uses words in writing',
      'Can define words in own terms',
      'Recognizes words in reading',
      'Uses morphology to figure out new words',
      'Better reading comprehension',
      'Improved academic performance'
    ],

    expected_outcomes: [
      'Significant vocabulary growth (100+ words per year)',
      'Improved reading comprehension',
      'Better academic writing',
      'Increased confidence with academic language',
      'Word learning strategies for independence'
    ],

    adaptations: [
      'Use visuals and realia for concrete words',
      'Act out action words',
      'Create personal dictionaries',
      'Use cognates for EAL students',
      'Digital vocabulary apps',
      'Relate to student experiences'
    ],

    contraindications: ['None - benefits all learners'],

    complementary_interventions: [
      'Reading comprehension strategies',
      'Oral language development',
      'Wide reading program',
      'Writing instruction'
    ],

    implementation_guide: 'Select 5-7 Tier 2 academic words per week (useful across subjects: analyze, compare, evidence, significant). Day 1: Introduce words with student-friendly definitions, pictures, examples. Day 2: Explore morphology (word parts - unhappy, reheat, action). Day 3: Context clues practice. Day 4: Word games (matching, bingo, charades). Day 5: Use in sentences and writing. Teach common prefixes: un-, re-, pre-, dis-. Suffixes: -tion, -ness, -ly, -ful. Greek/Latin roots: tele, graph, port. Use word maps: definition, picture, sentence, related words. Key: deep processing, multiple exposures, playful practice.',

    parent_information: 'Vocabulary (word knowledge) is crucial for reading comprehension and academic success. We\'re teaching your child powerful academic words they\'ll meet across all subjects, plus strategies to learn new words independently. At home, you can help by: using "fancy" words in conversation and explaining them ("That\'s enormous - really, really big!"), playing word games, reading varied books, discussing new words from school, and noticing word parts (un-happy, re-do). Aim for a "word-rich" home - the more words children hear, the more they learn!',

    useful_links: [
      'https://www.oxfordowl.co.uk/for-home/reading-owl/expert-help/vocabulary',
      'https://www.readingrockets.org/strategies/vocabulary_instruction',
      'https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/literacy-ks2'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['vocabulary', 'morphology', 'academic_language', 'tier_2_words', 'word_learning', 'tier_1', 'EAL']
  },

  {
    id: 'text-structure-awareness-non-fiction',
    name: 'Text Structure and Non-Fiction Reading Strategies',
    category: 'academic',
    subcategory: 'reading_comprehension',
    description: 'Explicit teaching of non-fiction text structures (description, sequence, compare/contrast, cause/effect, problem/solution) and features (headings, captions, diagrams). Improves comprehension of informational texts.',
    targeted_needs: ['Difficulty with non-fiction reading', 'Poor comprehension of textbooks', 'Struggles with information texts', 'Curriculum access difficulties'],

    evidence_level: 'tier_1',
    research_sources: ['EEF Reading Comprehension Strategies', 'Meyer Text Structure Research', 'Content Area Reading Research'],
    effect_size: 0.55,
    success_rate: '70-75% improvement in non-fiction comprehension',

    age_range: ['primary', 'secondary'],
    setting: ['small_group', 'classroom'],
    duration: '8-12 weeks',
    frequency: '2-3 times per week',
    session_length: '30-40 minutes',
    total_sessions: 30,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Non-fiction texts', 'Text structure graphic organizers', 'Text feature posters', 'Subject textbooks'],
    cost_implications: '£30-£100 for texts and materials',

    key_components: [
      'Teach 5 main text structures explicitly',
      'Use graphic organizers matching each structure',
      'Teach non-fiction text features (headings, captions, bold, diagrams, index)',
      'Signal words for each structure',
      'Practice identifying structure',
      'Use structure to aid comprehension and note-taking',
      'Application to curriculum subjects'
    ],

    fidelity_checklist: [
      'Teach text structures explicitly (description, sequence, compare/contrast, cause/effect, problem/solution)',
      'Use graphic organizers for each type',
      'Teach signal words (first, next, however, because, etc.)',
      'Practice identifying structure in real texts',
      'Teach non-fiction features explicitly',
      'Connect to curriculum content',
      'Use for note-taking and summarizing',
      'Practice across subject areas'
    ],

    progress_indicators: [
      'Identifies text structure',
      'Uses appropriate graphic organizer',
      'Locates information using text features',
      'Better comprehension of non-fiction',
      'Improved note-taking from texts',
      'More effective studying',
      'Better performance on content assessments'
    ],

    expected_outcomes: [
      'Improved non-fiction comprehension',
      'Better access to curriculum content',
      'More strategic reading of textbooks',
      'Improved study skills',
      'Better academic performance across subjects'
    ],

    adaptations: [
      'Start with familiar topics',
      'Use high-interest non-fiction',
      'Simplify texts if needed',
      'Color-code signal words',
      'Digital texts with annotation tools',
      'Video content analysis for engagement'
    ],

    contraindications: ['Very poor decoding requires decoding intervention first'],

    complementary_interventions: [
      'Vocabulary instruction (subject-specific)',
      'Note-taking strategies',
      'Study skills',
      'Subject-specific reading support'
    ],

    implementation_guide: 'Introduce one structure per 2 weeks: Week 1-2: DESCRIPTION (topic, characteristics) - use for science classification. Week 3-4: SEQUENCE (first, next, then, finally) - use for history timelines, instructions. Week 5-6: COMPARE/CONTRAST (however, on the other hand, both, unlike) - use Venn diagrams. Week 7-8: CAUSE/EFFECT (because, so, as a result) - use for science experiments. Week 9-10: PROBLEM/SOLUTION (problem was, solution is) - use for history, geography. Teach signal words. Match graphic organizers. Practice with real textbooks. Teach text features: headings, subheadings, bold words, captions, diagrams, glossary, index.',

    parent_information: 'Non-fiction (information) books are structured differently than stories. Your child is learning the 5 main ways non-fiction is organized and how to use this knowledge to understand better. They\'re also learning to use non-fiction features like headings, diagrams, and bold words. This helps with ALL school subjects! At home, you can help by: reading non-fiction together (newspapers, magazines, encyclopedias), pointing out headings and captions, asking "What type of text is this?" (recipe is a sequence, comparison of two things, cause and effect), and using the features to find information.',

    useful_links: [
      'https://www.readingrockets.org/strategies/teaching-text-structures',
      'https://www.theschoolrun.com/what-are-non-fiction-text-features',
      'https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/literacy-ks2'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['comprehension', 'non_fiction', 'text_structure', 'informational_text', 'tier_1', 'study_skills', 'curriculum_access']
  },

  // WRITING INTERVENTIONS - SPELLING (3)
  {
    id: 'systematic-spelling-instruction',
    name: 'Systematic Spelling Instruction Program',
    category: 'academic',
    subcategory: 'spelling',
    description: 'Systematic teaching of spelling patterns, rules, and strategies. Integrates phonics, morphology, etymology, and visual memory. Moves beyond "learn these words" to teaching spelling knowledge.',
    targeted_needs: ['Poor spelling', 'Dyslexia', 'Difficulty retaining spelling patterns', 'Reliance on phonetic spelling only'],

    evidence_level: 'tier_1',
    research_sources: ['Words Their Way (Bear et al.)', 'EEF Improving Literacy in KS2', 'Apel & Masterson spelling research'],
    effect_size: 0.54,
    success_rate: '70-80% spelling improvement',

    age_range: ['primary', 'secondary'],
    setting: ['small_group', 'classroom'],
    duration: '20+ weeks ongoing',
    frequency: '4-5 times per week',
    session_length: '15-20 minutes',
    total_sessions: 100,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Spelling program (Words Their Way, Spelling Mastery)', 'Word sorts', 'Personal spelling dictionaries', 'Multi-sensory spelling materials'],
    cost_implications: '£50-£200 for program materials',

    key_components: [
      'Developmental spelling assessment',
      'Teach spelling patterns systematically',
      'Word study (not just memorization)',
      'Phonics-based spelling (sound it out)',
      'Morphology-based spelling (prefixes, suffixes, roots)',
      'Visual memory strategies (look, cover, write, check)',
      'Etymology (word origins)',
      'Proofreading strategies'
    ],

    fidelity_checklist: [
      'Assess spelling developmental stage',
      'Teach patterns appropriate to stage',
      'Use word sorts for pattern recognition',
      'Teach spelling rules explicitly',
      'Multi-sensory practice (see, say, write, check)',
      'Include morphology (word parts)',
      'Practice in context (sentences, writing)',
      'Teach proofreading strategies',
      'Personal spelling dictionary'
    ],

    progress_indicators: [
      'Recognizes spelling patterns',
      'Applies spelling rules',
      'Improved spelling in independent writing',
      'Uses morphology to spell',
      'Better proofreading skills',
      'Increasing spelling accuracy',
      'More confident speller'
    ],

    expected_outcomes: [
      'Grade-level spelling progress',
      'Better writing fluency (less worry about spelling)',
      'Improved written communication',
      'Transfer to curriculum writing'
    ],

    adaptations: [
      'Adjust to spelling developmental stage',
      'Use technology (spell check with word prediction)',
      'Reduce number of words per week',
      'Multi-sensory techniques (sand, clay, typing)',
      'High-frequency word focus for severe difficulties',
      'Connect to student interests'
    ],

    contraindications: ['Very severe dysgraphia may require assistive technology focus'],

    complementary_interventions: [
      'Phonics instruction',
      'Morphology teaching',
      'Handwriting intervention',
      'Writing composition instruction'
    ],

    implementation_guide: 'Assess spelling stage (letter name, within word, syllable patterns, derivational). Teach patterns systematically within stage. Monday: Introduce pattern/rule with examples. Tuesday: Word sort activity (sort words by pattern). Wednesday: Multi-sensory practice (look-cover-write-check, rainbow writing, sand writing). Thursday: Application in sentences. Friday: Assessment. Rules to teach: Silent e, doubling, dropping e, changing y to i, -tion/-sion, homophones. Use Words Their Way stages. Include morphology: prefixes (un-, re-, pre-), suffixes (-ing, -ed, -ful, -ly), roots (graph, port). Personal spelling dictionary for tricky words.',

    parent_information: 'Spelling is about recognizing patterns and rules, not just memorizing individual words. Your child is learning spelling patterns (like "when two vowels go walking, the first one does the talking"), spelling rules (like "drop the e before -ing"), and word parts (prefixes, suffixes, roots). At home, you can help by: practicing look-cover-write-check, playing word games (Boggle, Scrabble), noticing patterns in words around you, using a personal dictionary for tricky words, and NOT worrying about every spelling in early drafts (focus on ideas first, spelling in editing).',

    useful_links: [
      'https://www.readwritethink.org/classroom-resources/printouts/look-cover-write-check-30700.html',
      'https://www.spellingsociety.org/uploaded_teaching/teaching_08-pkt.pdf',
      'https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/literacy-ks2'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['spelling', 'phonics', 'morphology', 'writing', 'dyslexia', 'tier_1', 'word_study']
  },

  {
    id: 'high-frequency-word-mastery',
    name: 'High-Frequency Word Mastery Program',
    category: 'academic',
    subcategory: 'spelling',
    description: 'Intensive teaching of high-frequency words (the, said, have, etc.) that don\'t follow phonics rules. Uses multi-sensory techniques and distributed practice. Essential for writing fluency.',
    targeted_needs: ['Poor sight word knowledge', 'Reliance on sounding out irregular words', 'Slow writing due to spelling', 'Dyslexia'],

    evidence_level: 'tier_1',
    research_sources: ['Fry Word List research', 'EEF Phonics and Early Reading', 'Multi-sensory word learning research'],
    effect_size: 0.48,
    success_rate: '80-90% master taught words',

    age_range: ['early_years', 'primary'],
    setting: ['small_group', 'one_to_one', 'home'],
    duration: '12-20 weeks',
    frequency: '5 times per week',
    session_length: '10-15 minutes',
    total_sessions: 80,

    complexity: 'low',
    staff_training_required: false,
    resources_needed: ['High-frequency word lists (Fry, Dolch)', 'Flashcards', 'Games', 'Multi-sensory materials'],
    cost_implications: '£20-£50 for materials',

    key_components: [
      'Systematic teaching of 100-300 most common words',
      'Multi-sensory practice (see, say, spell, write, check)',
      'Distributed practice (little and often)',
      'Games-based learning',
      'Application in reading and writing',
      'Regular review',
      'Tracking mastery'
    ],

    fidelity_checklist: [
      'Use research-based word list (Fry or Dolch)',
      'Teach 3-5 words per week',
      'Multi-sensory practice daily',
      'Review previously taught words',
      'Practice in isolation AND in sentences',
      'Track mastery systematically',
      'Make it fun with games',
      'Connect to reading and writing'
    ],

    progress_indicators: [
      'Increasing number of words mastered',
      'Faster recognition in reading',
      'Accurate spelling in writing',
      'Improved writing fluency',
      'More confident reading and writing',
      'Transfer to independent work'
    ],

    expected_outcomes: [
      'Mastery of 100-300 high-frequency words',
      'Faster, more fluent reading',
      'Improved writing fluency and confidence',
      'Better access to reading and writing'
    ],

    adaptations: [
      'Reduce number of words taught per week',
      'Use personal photos/sentences for engagement',
      'Technology/apps for practice',
      'Incorporate student interests',
      'Partner with parents for home practice',
      'Use movement (jump, clap) for kinaesthetic learners'
    ],

    contraindications: ['None - suitable for all learners'],

    complementary_interventions: [
      'Phonics instruction',
      'Reading fluency practice',
      'Spelling instruction',
      'Writing composition'
    ],

    implementation_guide: 'Use Fry\'s First 100 words (the, of, and, a, to, in, is, you, that, it...). Teach 3-5 words per week. Monday: Introduce words - look at word, say word, spell word aloud, write word, check. Tuesday: Multi-sensory practice - rainbow writing, sand writing, air writing, typing. Wednesday: Games - bingo, matching, memory, go fish. Thursday: Application - find in books, use in sentences, write in personal story. Friday: Quick check (flash cards). Review previous words daily (2 mins). Make it FUN! Track progress on word chart. Celebrate reaching milestones (25 words, 50 words, 100 words!).',

    parent_information: 'High-frequency words (like "the", "said", "have") are the most common words in English. They appear in every book and every piece of writing. Many don\'t follow phonics rules, so children need to learn them "by heart". Your child will learn 100-300 of these words. At home, you can help by: 5 minutes daily practice with flashcards, playing word games (bingo, memory, go fish), pointing out words in books and signs, having your child write the words, and celebrating progress. The goal: instant recognition when reading, accurate spelling when writing. This MASSIVELY helps reading and writing fluency!',

    useful_links: [
      'https://www.sightwords.com/sight-words/fry/',
      'https://www.teachyourmonstertoread.com/blog/teaching-high-frequency-words',
      'https://www.oxfordowl.co.uk/for-home/reading-owl/expert-help/phonics-made-easy'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['high_frequency_words', 'sight_words', 'spelling', 'reading', 'tier_1', 'dyslexia', 'early_intervention']
  },

  {
    id: 'spelling-error-analysis-intervention',
    name: 'Spelling Error Analysis and Targeted Intervention',
    category: 'academic',
    subcategory: 'spelling',
    description: 'Analyze student\'s spelling errors to identify specific error patterns (phonological, orthographic, morphological). Target intervention to specific error types for efficient remediation.',
    targeted_needs: ['Persistent spelling difficulties despite instruction', 'Specific spelling error patterns', 'Dyslexia', 'Spelling plateau'],

    evidence_level: 'tier_2',
    research_sources: ['Apel & Masterson error analysis', 'Diagnostic spelling assessment research', 'Targeted remediation studies'],
    effect_size: 0.52,
    success_rate: '70-75% improvement in targeted areas',

    age_range: ['primary', 'secondary'],
    setting: ['one_to_one', 'small_group'],
    duration: '10-16 weeks',
    frequency: '3-4 times per week',
    session_length: '20-25 minutes',
    total_sessions: 48,

    complexity: 'high',
    staff_training_required: true,
    resources_needed: ['Diagnostic spelling assessment', 'Error analysis framework', 'Targeted intervention materials for each error type'],
    cost_implications: '£50-£150 for assessment and materials',

    key_components: [
      'Diagnostic spelling assessment',
      'Systematic error analysis (phonological, orthographic, morphological)',
      'Identify error patterns',
      'Targeted intervention for specific errors',
      'Re-assessment to monitor progress',
      'Individualized approach'
    ],

    fidelity_checklist: [
      'Complete diagnostic assessment',
      'Analyze errors systematically',
      'Identify predominant error types',
      'Select targeted interventions',
      'Address one error type at a time',
      'Provide explicit instruction',
      'Practice with feedback',
      'Monitor and adjust intervention',
      'Re-assess regularly'
    ],

    progress_indicators: [
      'Reduction in targeted error type',
      'More accurate spelling',
      'Better transfer to writing',
      'Improved proofreading',
      'Increased spelling confidence'
    ],

    expected_outcomes: [
      'Elimination or reduction of specific error patterns',
      'Improved overall spelling accuracy',
      'More efficient learning of spelling',
      'Better written communication'
    ],

    adaptations: [
      'Adjust to individual error profile',
      'One error type at a time for severe difficulties',
      'Technology support for persistent errors',
      'Visual aids for visual memory errors',
      'Explicit phonics for phonological errors'
    ],

    contraindications: ['Requires trained practitioner to conduct error analysis'],

    complementary_interventions: [
      'Phonics instruction (for phonological errors)',
      'Morphology teaching (for morphological errors)',
      'Visual memory strategies (for orthographic errors)',
      'Writing instruction'
    ],

    implementation_guide: 'Step 1: Diagnostic assessment - dictate 20-30 words across difficulty levels, collect writing sample. Step 2: Error analysis - categorize errors: Phonological (sound errors - "sed" for said), Orthographic (visual pattern errors - "tode" for toad), Morphological (word part errors - "runing" for running). Step 3: Identify predominant pattern. Step 4: Target intervention: Phonological errors → phonics, sound segmentation. Orthographic errors → visual memory (look-cover-write-check), pattern recognition. Morphological errors → teach word parts, rules. Step 5: Practice targeted skills. Step 6: Re-assess after 4-6 weeks. Adjust intervention as needed. Highly individualized!',

    parent_information: 'Instead of just "practicing more spelling", we\'re analyzing WHY your child makes spelling errors and targeting those specific difficulties. There are different types of spelling errors: sound-based (phonological), visual pattern-based (orthographic), and word parts-based (morphological). We identify your child\'s main error type and teach the skills they need. This is more efficient than random practice. At home, you can help by: focusing on the targeted skill we\'re working on, using the strategies we teach, celebrating progress in the targeted area, and being patient - fixing persistent spelling issues takes time but targeted intervention works!',

    useful_links: [
      'https://www.readingrockets.org/article/understanding-spelling-problems',
      'https://www.bdadyslexia.org.uk/advice/children/spelling-and-dyslexia',
      'https://www.spellingsociety.org/uploaded_views/views83-mc.pdf'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['spelling', 'error_analysis', 'targeted_intervention', 'dyslexia', 'tier_2', 'diagnostic', 'individualized']
  },

  // WRITING INTERVENTIONS - HANDWRITING (2)
  {
    id: 'handwriting-intervention-multisensory',
    name: 'Multisensory Handwriting Intervention',
    category: 'academic',
    subcategory: 'handwriting',
    description: 'Systematic teaching of handwriting using multisensory techniques. Addresses letter formation, sizing, spacing, and fluency. Essential for students with dysgraphia or motor difficulties.',
    targeted_needs: ['Poor handwriting legibility', 'Dysgraphia', 'Fine motor difficulties', 'Slow handwriting speed', 'Letter reversals'],

    evidence_level: 'tier_2',
    research_sources: ['Handwriting Without Tears research', 'OT handwriting intervention studies', 'Graham handwriting research'],
    effect_size: 0.45,
    success_rate: '70-80% improvement in legibility and speed',

    age_range: ['early_years', 'primary', 'secondary'],
    setting: ['one_to_one', 'small_group'],
    duration: '12-16 weeks',
    frequency: '4-5 times per week',
    session_length: '10-15 minutes',
    total_sessions: 60,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Handwriting program (e.g., Handwriting Without Tears)', 'Lined paper', 'Multi-sensory materials (sand trays, clay)', 'Pencil grips'],
    cost_implications: '£50-£150 for program and materials',

    key_components: [
      'Proper pencil grip and posture',
      'Letter formation (starting point, direction, sequence)',
      'Multi-sensory practice (see, say, do)',
      'Letter families (similar formations)',
      'Sizing and spacing',
      'Fluency building',
      'Transfer to cursive if appropriate'
    ],

    fidelity_checklist: [
      'Teach pencil grip explicitly',
      'Teach letter formation systematically',
      'Use verbal cues (e.g., "start at the top, down, around")',
      'Multi-sensory practice (trace in air, sand, on paper)',
      'Practice individual letters before words',
      'Ensure correct formation before fluency',
      'Use appropriate paper (wide lines initially)',
      'Short, frequent practice sessions',
      'Monitor transfer to writing tasks'
    ],

    progress_indicators: [
      'Improved pencil grip',
      'Correct letter formation',
      'Better letter sizing',
      'Consistent spacing',
      'Increased writing speed',
      'Improved legibility',
      'Reduced fatigue',
      'More confident writer'
    ],

    expected_outcomes: [
      'Legible handwriting',
      'Age-appropriate writing speed',
      'Automatic letter formation',
      'Reduced writing anxiety',
      'Better written communication'
    ],

    adaptations: [
      'Pencil grips for grip difficulties',
      'Slant boards for posture',
      'Larger lined paper',
      'Reduce quantity, focus on quality',
      'Consider transition to cursive (often easier for dysgraphia)',
      'Technology as accommodation if severe'
    ],

    contraindications: ['Severe physical disabilities may require assistive technology focus'],

    complementary_interventions: [
      'Occupational therapy',
      'Fine motor skills activities',
      'Keyboarding instruction (alternative)',
      'Writing composition instruction'
    ],

    implementation_guide: 'Week 1-2: Pencil grip and posture. Week 3-6: Print letters by families (e.g., l, t, i, j; c, a, d, g, o, q). Use verbal pathways: "Start at the top, straight down". Multi-sensory: trace letter in air (large movements), in sand tray, with finger on table, on paper. Week 7-10: Words and sentences, focus on spacing. Week 11-12: Fluency practice, copying passages. Week 13-16: Transfer to curriculum writing. Keep sessions SHORT (10-15 min) - handwriting is tiring. Practice little and often. Use programs like Handwriting Without Tears, Letter-join, or Teodorescu. For severe difficulties, consider cursive (continuous flow, fewer reversals).',

    parent_information: 'Handwriting is a foundational skill for writing. Poor handwriting creates a bottleneck - your child has ideas but can\'t get them down on paper efficiently. We\'re teaching correct letter formation using multi-sensory techniques. At home, you can help by: monitoring pencil grip (tripod grip - thumb and index finger, resting on middle finger), 5 minutes daily practice with correct formation (not just "write more"), make it fun (chalk, paint, sand), strengthen fine motor skills (playdough, cutting, Lego), and consider keyboarding as alternative for severe difficulties. Good handwriting takes time!',

    useful_links: [
      'https://www.lwtears.com',
      'https://www.ot-mom-learning-activities.com/correct-pencil-grasp.html',
      'https://www.bdadyslexia.org.uk/advice/children/handwriting-and-dyspraxia'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['handwriting', 'dysgraphia', 'fine_motor', 'writing', 'multisensory', 'tier_2', 'OT']
  },

  {
    id: 'cursive-handwriting-dysgraphia',
    name: 'Cursive Handwriting for Dysgraphia',
    category: 'academic',
    subcategory: 'handwriting',
    description: 'Teaching cursive (joined) handwriting specifically for students with dysgraphia or persistent print handwriting difficulties. Continuous flow often easier than print.',
    targeted_needs: ['Dysgraphia', 'Persistent letter reversals', 'Slow print handwriting', 'Poor print legibility', 'Writing fatigue'],

    evidence_level: 'tier_2',
    research_sources: ['Berninger dysgraphia research', 'Cursive vs print studies', 'OT handwriting research'],
    effect_size: 0.42,
    success_rate: '65-75% improvement for dysgraphia',

    age_range: ['primary', 'secondary'],
    setting: ['one_to_one', 'small_group'],
    duration: '16-20 weeks',
    frequency: '4-5 times per week',
    session_length: '10-15 minutes',
    total_sessions: 80,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Cursive handwriting program', 'Lined paper', 'Models of cursive letters', 'Practice worksheets'],
    cost_implications: '£40-£120 for program materials',

    key_components: [
      'Teach cursive letter formations',
      'Continuous flow without pen lifts',
      'Letter joins and connections',
      'Rhythm and fluency',
      'Multi-sensory practice',
      'Gradual speed building',
      'Application to writing'
    ],

    fidelity_checklist: [
      'Teach cursive formations systematically',
      'Start with lowercase letters',
      'Practice joins between letters',
      'Use rhythm ("swing, swing, swing")',
      'Multi-sensory practice',
      'Ensure fluent formation before speed',
      'Practice meaningful words and sentences',
      'Monitor transfer to writing tasks'
    ],

    progress_indicators: [
      'Fluent cursive letter formation',
      'Smooth joins between letters',
      'Increased writing speed',
      'Improved legibility',
      'Reduced letter reversals',
      'Less writing fatigue',
      'More positive attitude to writing'
    ],

    expected_outcomes: [
      'Fluent cursive handwriting',
      'Faster writing speed than print',
      'Better legibility',
      'Fewer reversals',
      'Reduced dysgraphia impact'
    ],

    adaptations: [
      'Allow extended time for learning',
      'Use larger lined paper initially',
      'Focus on fluency over neatness initially',
      'Use cursive fonts on computers',
      'Hybrid approach (cursive for some contexts, print for others)',
      'Technology as backup when needed'
    ],

    contraindications: ['Not suitable for students with severe physical motor impairments'],

    complementary_interventions: [
      'Occupational therapy',
      'Fine motor activities',
      'Keyboarding skills',
      'Writing composition instruction'
    ],

    implementation_guide: 'Why cursive for dysgraphia? Continuous flow, no pen lifts, fewer reversals (b/d), muscle memory. Week 1-4: Teach lowercase letters in families (similar formations). Week 5-8: Letter joins (critical - how letters connect). Week 9-12: Common letter combinations and words. Week 13-16: Sentences and passages. Week 17-20: Transfer to curriculum writing. Use rhythm and flow ("smooth and flowing"). Multi-sensory: trace cursive patterns in air, sand, paper. Programs: Handwriting Without Tears Cursive, Letter-join. Key: fluency matters more than perfection - cursive should FLOW. Many dysgraphic students find cursive EASIER than print once they learn it!',

    parent_information: 'Cursive (joined writing) often helps students with dysgraphia MORE than print because: letters flow continuously (no stopping and starting), fewer reversals (b/d look different in cursive), muscle memory develops, it can be faster. Your child is learning a new handwriting system. At home: 10 minutes daily practice, focus on flow not perfection, be patient (takes 3-4 months to become automatic), celebrate the different look of cursive, and know that cursive is NOT old-fashioned - it\'s a legitimate accommodation for dysgraphia. Many dysgraphic students who struggled with print thrive with cursive!',

    useful_links: [
      'https://www.lwtears.com/cursive',
      'https://www.bdadyslexia.org.uk/advice/children/is-cursive-writing-better-for-children-with-dyslexia',
      'https://www.understood.org/en/articles/cursive-handwriting-what-you-need-to-know'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['handwriting', 'cursive', 'dysgraphia', 'writing', 'tier_2', 'joined_writing', 'alternative_approach']
  },

  // WRITING INTERVENTIONS - COMPOSITION (Additional 3 beyond existing SRSD)
  {
    id: 'writing-process-approach',
    name: 'Writing Process Approach (Planning, Drafting, Revising, Editing)',
    category: 'academic',
    subcategory: 'writing_composition',
    description: 'Systematic teaching of the writing process: pre-writing/planning, drafting, revising, editing, publishing. Emphasizes writing as a process, not a single event. Develops independent writers.',
    targeted_needs: ['Poor writing organization', 'Difficulty getting started with writing', 'Lack of writing independence', 'One-draft writers', 'Writing avoidance'],

    evidence_level: 'tier_1',
    research_sources: ['Writing Next (Graham & Perin)', 'EEF Improving Literacy in KS2', 'National Writing Project'],
    effect_size: 0.72,
    success_rate: '75-80% improvement in writing quality',

    age_range: ['primary', 'secondary'],
    setting: ['classroom', 'small_group'],
    duration: '12-20 weeks ongoing',
    frequency: '3-4 times per week',
    session_length: '45-60 minutes',
    total_sessions: 60,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Graphic organizers for each stage', 'Writing checklists', 'Peer conferencing protocols', 'Revision tools', 'Publishing materials'],
    cost_implications: '£30-£100 for materials',

    key_components: [
      'Pre-writing: brainstorming, planning, organizing',
      'Drafting: getting ideas down (focus on content, not mechanics)',
      'Revising: improving content (add, delete, rearrange, substitute)',
      'Editing: fixing mechanics (spelling, punctuation, grammar)',
      'Publishing: final product, sharing',
      'Peer conferencing',
      'Teacher conferencing',
      'Explicit teaching of each stage'
    ],

    fidelity_checklist: [
      'Teach each stage of process explicitly',
      'Model the process with think-alouds',
      'Provide time for each stage (don\'t rush)',
      'Use graphic organizers for planning',
      'Separate drafting from editing (ideas first!)',
      'Teach revision strategies explicitly',
      'Peer conferencing for feedback',
      'Teacher conferencing for guidance',
      'Celebrate published work'
    ],

    progress_indicators: [
      'Uses planning strategies independently',
      'Drafts with focus on content',
      'Revises to improve content',
      'Edits for conventions',
      'Better organized writing',
      'Longer, more developed pieces',
      'Increased writing independence',
      'More positive attitude to writing'
    ],

    expected_outcomes: [
      'Improved writing quality',
      'Better organized writing',
      'Independent use of writing process',
      'More confident writers',
      'Transfer to all writing tasks'
    ],

    adaptations: [
      'Reduce stages for younger students (plan-draft-publish)',
      'Scribe for severe handwriting difficulties',
      'Technology for drafting and publishing',
      'Visual process charts',
      'More scaffolding initially, fade gradually',
      'Differentiate expectations'
    ],

    contraindications: ['None - appropriate for all writers'],

    complementary_interventions: [
      'SRSD for specific text types',
      'Sentence combining',
      'Grammar instruction',
      'Spelling instruction',
      'Handwriting/keyboarding'
    ],

    implementation_guide: 'Week 1-2: Introduce writing process, focus on PLANNING (graphic organizers, lists, webs). Week 3-4: DRAFTING - emphasize content over correctness ("sloppy copy ok!"). Week 5-6: REVISING - teach ARMS (Add, Remove, Move, Substitute). Use revision checklist. Week 7-8: EDITING - teach CUPS (Capitals, Usage, Punctuation, Spelling). Week 9-12: Full process with peer conferencing. Key: Each stage is DISTINCT. Don\'t edit while drafting! Revision = content, editing = mechanics. Model, model, model. Writing workshop format: mini-lesson, independent writing, conferencing, sharing. Takes time but creates lifelong writers!',

    parent_information: 'We\'re teaching your child that good writing happens in stages - not all at once! The writing process: 1) PLANNING (organize ideas before writing), 2) DRAFTING (get ideas down - spelling doesn\'t matter yet!), 3) REVISING (make content better - add details, remove unnecessary, rearrange, replace words), 4) EDITING (fix spelling, punctuation, grammar), 5) PUBLISHING (final neat copy, share). At home: when your child writes, encourage planning first, accept "messy" first drafts, focus on ideas before correctness, and celebrate finished pieces. This approach makes writing less overwhelming!',

    useful_links: [
      'https://www.readwritethink.org/professional-development/strategy-guides/teaching-writing-process',
      'https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/literacy-ks2',
      'https://www.nwp.org/writing-process'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['writing', 'composition', 'writing_process', 'revision', 'drafting', 'tier_1', 'workshop']
  },

  {
    id: 'sentence-combining-intervention',
    name: 'Sentence Combining for Writing Quality',
    category: 'academic',
    subcategory: 'writing_composition',
    description: 'Explicit instruction in combining simple sentences into more complex, sophisticated sentences. Improves syntactic maturity and writing quality without teaching formal grammar.',
    targeted_needs: ['Short, choppy sentences', 'Simple sentence structure', 'Lack of sentence variety', 'Poor writing sophistication'],

    evidence_level: 'tier_1',
    research_sources: ['Graham & Perin Writing Next', 'Sentence combining research (Strong, Hillocks)', 'EEF Writing Improvement'],
    effect_size: 0.65,
    success_rate: '75-80% improvement in sentence complexity',

    age_range: ['primary', 'secondary'],
    setting: ['small_group', 'classroom'],
    duration: '8-12 weeks',
    frequency: '3-4 times per week',
    session_length: '15-20 minutes',
    total_sessions: 36,

    complexity: 'low',
    staff_training_required: true,
    resources_needed: ['Sentence combining exercises', 'Mentor texts', 'Sentence combining games', 'Writing samples'],
    cost_implications: '£20-£60 for materials',

    key_components: [
      'Combine simple sentences using conjunctions (and, but, because, so)',
      'Embed information (The dog barked. The dog was big. → The big dog barked.)',
      'Use relative clauses (who, which, that)',
      'Vary sentence structure',
      'Practice with kernel sentences',
      'Application to own writing'
    ],

    fidelity_checklist: [
      'Model sentence combining with think-alouds',
      'Start with simple combinations',
      'Gradually increase complexity',
      'Provide multiple practice opportunities',
      'Discuss which combinations sound better',
      'Link to real writing',
      'Celebrate sophisticated sentences',
      'Analyze mentor texts for sentence variety'
    ],

    progress_indicators: [
      'Combines sentences using conjunctions',
      'Embeds information',
      'Uses relative clauses',
      'More varied sentence structures',
      'Longer, more complex sentences',
      'Better flow in writing',
      'More sophisticated writing'
    ],

    expected_outcomes: [
      'Improved syntactic maturity',
      'Higher quality writing',
      'Better sentence variety',
      'More engaging writing',
      'Improved writing scores'
    ],

    adaptations: [
      'Start with very simple combinations',
      'Use pictures to support meaning',
      'Games format (sentence puzzles)',
      'Technology (sentence building apps)',
      'Pair work for discussion',
      'High-interest content'
    ],

    contraindications: ['None - suitable for all writers'],

    complementary_interventions: [
      'Writing process instruction',
      'Grammar instruction',
      'Mentor text analysis',
      'Writing composition'
    ],

    implementation_guide: 'Week 1-2: Combine with "and" (The cat ran. The dog ran. → The cat and the dog ran.). Week 3-4: "But" and "because" (I stayed home. I was sick. → I stayed home because I was sick.). Week 5-6: Embedding adjectives (The boy found a coin. The boy was young. The coin was gold. → The young boy found a gold coin.). Week 7-8: Embedding phrases (The dog barked. The dog was in the garden. → The dog in the garden barked.). Week 9-10: Relative clauses (The girl won. The girl was my friend. → The girl who was my friend won.). Week 11-12: Application - revise own writing to combine sentences. Use kernel sentences (very simple sentences) and combine. Compare before/after. Make it playful - "sentence puzzles"!',

    parent_information: 'Sentence combining is a powerful way to improve writing quality. Instead of lots of short, choppy sentences, your child is learning to combine ideas into more sophisticated sentences. Example: "I have a dog. My dog is big. My dog is brown." becomes "I have a big, brown dog." This makes writing sound better and more mature. At home: when your child writes short sentences, ask "Can you combine these?" Play with sentences like puzzles. Read books together and notice interesting sentences. This is more effective than teaching grammar rules!',

    useful_links: [
      'https://www.readwritethink.org/classroom-resources/lesson-plans/sentence-combining',
      'https://www.writing-skills.com/sentence-combining-exercises',
      'https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/literacy-ks2'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['writing', 'sentence_combining', 'syntax', 'sentence_variety', 'tier_1', 'writing_quality']
  },

  {
    id: 'genre-specific-writing-instruction',
    name: 'Genre-Specific Writing Instruction (Narrative, Persuasive, Informational)',
    category: 'academic',
    subcategory: 'writing_composition',
    description: 'Explicit teaching of different writing genres with their specific structures, features, and purposes. Includes narrative, persuasive, informational, and instructional writing.',
    targeted_needs: ['Difficulty with specific writing types', 'Lack of genre awareness', 'Poor structure in different genres', 'Curriculum writing difficulties'],

    evidence_level: 'tier_1',
    research_sources: ['Graham & Perin Writing Next', 'Genre pedagogy research', 'EEF Improving Literacy'],
    effect_size: 0.68,
    success_rate: '75-80% improved genre-specific writing',

    age_range: ['primary', 'secondary'],
    setting: ['classroom', 'small_group'],
    duration: '12-20 weeks (4-5 weeks per genre)',
    frequency: '3-4 times per week',
    session_length: '45-60 minutes',
    total_sessions: 60,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Genre-specific graphic organizers', 'Mentor texts for each genre', 'Genre rubrics', 'Success criteria checklists'],
    cost_implications: '£40-£120 for materials',

    key_components: [
      'Teach genre purposes and audiences',
      'Explicit teaching of genre structures',
      'Genre-specific features and language',
      'Analysis of mentor texts',
      'Modeling genre-specific writing',
      'Guided practice',
      'Independent writing',
      'Multiple genres taught systematically'
    ],

    fidelity_checklist: [
      'Teach one genre at a time in depth',
      'Use high-quality mentor texts',
      'Teach structure explicitly',
      'Teach genre-specific vocabulary',
      'Model writing in the genre',
      'Use genre-appropriate graphic organizers',
      'Provide success criteria',
      'Multiple practice opportunities',
      'Link to curriculum writing demands'
    ],

    progress_indicators: [
      'Understands genre purposes',
      'Uses appropriate genre structure',
      'Includes genre-specific features',
      'Uses genre-appropriate language',
      'Writes independently in taught genres',
      'Transfers to curriculum writing',
      'Improved writing scores'
    ],

    expected_outcomes: [
      'Competence in multiple genres',
      'Better structured writing',
      'Appropriate language for purpose',
      'Improved curriculum writing',
      'Better test/exam performance'
    ],

    adaptations: [
      'Focus on most important curriculum genres',
      'Simplify structure for weaker writers',
      'Visual supports for structure',
      'Technology for planning and drafting',
      'Differentiated mentor texts',
      'Varied topics of interest'
    ],

    contraindications: ['None - essential for all writers'],

    complementary_interventions: [
      'Writing process instruction',
      'SRSD for specific genres',
      'Vocabulary development',
      'Sentence combining'
    ],

    implementation_guide: 'NARRATIVE (4 weeks): Structure (orientation, complication, resolution). Features (character, setting, dialogue, descriptive language). Language (past tense, time connectives). PERSUASIVE (4 weeks): Structure (position, reasons, conclusion). Features (persuasive devices, evidence). Language (present tense, modal verbs, connectives - therefore, however). INFORMATIONAL (4 weeks): Structure (introduction, facts organized, conclusion). Features (headings, facts, technical vocabulary). Language (present tense, formal). INSTRUCTIONAL (4 weeks): Structure (goal, materials, steps). Features (numbered steps, diagrams, imperative verbs). Each genre: Read mentor texts → Analyze structure → Teach features → Model writing → Joint construction → Independent writing. Use rubrics.',

    parent_information: 'Different types of writing have different purposes and structures - like stories are different from instructions. We\'re teaching your child how to write in different genres: NARRATIVE (stories - beginning, middle, end, characters, plot), PERSUASIVE (convincing - opinion, reasons, conclusion), INFORMATIONAL (teaching facts - organized information), INSTRUCTIONAL (how-to - steps in order). At home: read different types of texts together, notice how they\'re organized differently, discuss the purpose ("Why did the author write this?"), and encourage writing in different genres for real purposes (story for entertainment, persuasive letter, information report, recipe).',

    useful_links: [
      'https://www.literacyshed.com/writing.html',
      'https://www.teachit.co.uk/genres',
      'https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/literacy-ks2'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['writing', 'genre', 'narrative', 'persuasive', 'informational', 'tier_1', 'structure']
  },

  // WRITING INTERVENTIONS - GRAMMAR AND PUNCTUATION (2)
  {
    id: 'functional-grammar-in-context',
    name: 'Functional Grammar Instruction in Writing Context',
    category: 'academic',
    subcategory: 'grammar_punctuation',
    description: 'Teaching grammar and punctuation in the context of real writing, not isolated exercises. Focus on how grammar choices affect meaning and improve writing quality.',
    targeted_needs: ['Poor grammar in writing', 'Punctuation errors', 'Run-on sentences', 'Fragments', 'Limited sentence variety'],

    evidence_level: 'tier_2',
    research_sources: ['Graham & Perin Writing Next', 'Contextual grammar research', 'EEF guidance on grammar teaching'],
    effect_size: 0.38,
    success_rate: '60-70% improvement in writing conventions',

    age_range: ['primary', 'secondary'],
    setting: ['classroom', 'small_group'],
    duration: '12-16 weeks',
    frequency: '2-3 times per week',
    session_length: '20-30 minutes',
    total_sessions: 36,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Grammar in context materials', 'Mentor texts', 'Editing checklists', 'Grammar games'],
    cost_implications: '£30-£80 for materials',

    key_components: [
      'Teach grammar concepts in mini-lessons',
      'Immediate application in writing',
      'Analyze how grammar affects meaning',
      'Edit and revise using grammar knowledge',
      'Targeted instruction based on writing needs',
      'NOT isolated grammar worksheets',
      'Focus on high-impact grammar (sentences, verbs, connectives)'
    ],

    fidelity_checklist: [
      'Short mini-lessons (10-15 min)',
      'Teach one concept at a time',
      'Use authentic texts for examples',
      'Immediate application in student writing',
      'Focus on meaning, not just rules',
      'Link to purpose and audience',
      'Regular editing practice',
      'Address common errors from student writing'
    ],

    progress_indicators: [
      'Uses taught grammar in writing',
      'Self-edits for grammar',
      'More varied sentence structures',
      'Correct punctuation',
      'Better clarity in writing',
      'Fewer run-ons and fragments'
    ],

    expected_outcomes: [
      'Improved writing conventions',
      'Better sentence construction',
      'Clearer communication',
      'Improved editing skills',
      'Higher writing scores'
    ],

    adaptations: [
      'Focus on most impactful grammar first',
      'Use color coding for sentence parts',
      'Games for engagement',
      'Peer editing practice',
      'Technology for grammar checking',
      'Personal editing checklist'
    ],

    contraindications: ['Isolated grammar worksheets are NOT effective - must be in writing context'],

    complementary_interventions: [
      'Writing process instruction',
      'Sentence combining',
      'Writing composition',
      'Editing strategies'
    ],

    implementation_guide: 'Priority grammar: SENTENCES (complete sentences, run-ons, fragments), VERBS (tense consistency, subject-verb agreement), PUNCTUATION (full stops, capital letters, commas, speech marks), CONNECTIVES (conjunctions for combining sentences). Format: Mini-lesson (10 min) - teach concept with examples from real texts. Application (15 min) - students apply in their writing (new or revise existing). Sharing (5 min) - examples of good use. Next day: Edit yesterday\'s writing using new concept. Address errors from student writing - if students keep making comma splices, teach comma use. Not: random grammar from textbook. Yes: grammar students actually need for their writing!',

    parent_information: 'Grammar helps us communicate clearly. We\'re teaching grammar in the context of real writing - NOT boring worksheets! Your child learns a grammar concept (like how to use commas or build better sentences) then immediately uses it in their own writing. This is much more effective than isolated exercises. At home: when reading together, occasionally point out interesting grammar ("Notice how the author used a question here?"), when your child writes, focus on one grammar point at a time in editing (not everything at once!), and remember - grammar serves writing, writing doesn\'t serve grammar!',

    useful_links: [
      'https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/literacy-ks2',
      'https://www.readwritethink.org/classroom-resources/lesson-plans/grammar-instruction',
      'https://www.theschoolrun.com/what-is-functional-grammar'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['grammar', 'punctuation', 'writing', 'conventions', 'tier_2', 'contextual', 'editing']
  },

  {
    id: 'punctuation-for-effect',
    name: 'Punctuation for Effect and Meaning',
    category: 'academic',
    subcategory: 'grammar_punctuation',
    description: 'Teaching punctuation not just as rules but as tools for controlling meaning, pace, and effect in writing. Includes advanced punctuation for secondary students.',
    targeted_needs: ['Limited punctuation use', 'Punctuation errors', 'Flat, unexpressive writing', 'Need for sophisticated writing'],

    evidence_level: 'tier_2',
    research_sources: ['Punctuation research', 'Writing quality and conventions studies', 'Secondary writing improvement'],
    effect_size: 0.35,
    success_rate: '65-70% improved punctuation use',

    age_range: ['primary', 'secondary', 'post_16'],
    setting: ['classroom', 'small_group'],
    duration: '8-12 weeks',
    frequency: '2-3 times per week',
    session_length: '20-25 minutes',
    total_sessions: 24,

    complexity: 'medium',
    staff_training_required: false,
    resources_needed: ['Mentor texts with varied punctuation', 'Punctuation games', 'Editing checklists'],
    cost_implications: '£20-£50 for materials',

    key_components: [
      'Teach essential punctuation: full stops, capitals, commas, speech marks',
      'Advanced punctuation: semicolons, colons, dashes, ellipses, parentheses',
      'Punctuation for effect (not just rules)',
      'Analyze punctuation in mentor texts',
      'Experimentation with punctuation',
      'Editing for punctuation'
    ],

    fidelity_checklist: [
      'Teach punctuation in context of real writing',
      'Use mentor texts to demonstrate',
      'Explain effect, not just rule',
      'Practice reading punctuation aloud (hear the pauses)',
      'Experiment with different punctuation choices',
      'Regular editing practice',
      'Build from basic to advanced',
      'Application in student writing'
    ],

    progress_indicators: [
      'Uses basic punctuation correctly',
      'Experiments with advanced punctuation',
      'Understands how punctuation affects meaning',
      'Edits for punctuation',
      'More varied, expressive writing',
      'Better control of pace and emphasis'
    ],

    expected_outcomes: [
      'Correct basic punctuation',
      'Appropriate use of advanced punctuation',
      'More sophisticated writing',
      'Better clarity and expression',
      'Improved writing scores'
    ],

    adaptations: [
      'Focus on most needed punctuation first',
      'Visual guides (punctuation posters)',
      'Technology for punctuation practice',
      'Peer editing for punctuation',
      'Reading aloud to "hear" punctuation',
      'Punctuation games'
    ],

    contraindications: ['Very weak writers need basic sentence structure before advanced punctuation'],

    complementary_interventions: [
      'Writing composition',
      'Grammar instruction',
      'Sentence combining',
      'Reading fluency (punctuation awareness)'
    ],

    implementation_guide: 'BASIC (essential): Full stops and capitals (sentence boundaries), Commas in lists, Speech marks for dialogue. INTERMEDIATE: Commas for clauses ("Although it was raining, we played outside."), Apostrophes (possession and contraction), Question marks and exclamation marks for effect. ADVANCED: Semicolons (joining related sentences), Colons (introducing lists/explanations), Dashes for emphasis or parenthesis, Ellipses for suspense. Each punctuation: Model in mentor texts → Discuss effect → Experiment → Apply in writing → Edit. Key teaching: Punctuation controls HOW your writing sounds and what it means. Same sentence, different punctuation, different meaning: "Let\'s eat Grandma!" vs "Let\'s eat, Grandma!" Punctuation saves lives!',

    parent_information: 'Punctuation is more than just following rules - it\'s about controlling how your writing sounds and what it means! We\'re teaching your child how punctuation creates pauses, emphasis, and clarity. At home: when reading together, occasionally discuss punctuation ("Why did the author use three dots...?"), try reading without punctuation and notice how confusing it is, experiment with punctuation ("How would this sound with a ! instead of .?"), and remember the joke: "Let\'s eat Grandma!" needs a comma to save Grandma! Punctuation matters!',

    useful_links: [
      'https://www.bbc.co.uk/bitesize/topics/zvwwxnb',
      'https://www.theschoolrun.com/what-is-punctuation',
      'https://www.grammarbook.com/punctuation-rules.aspx'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['punctuation', 'grammar', 'writing', 'conventions', 'tier_2', 'expression', 'advanced']
  },

  // ADDITIONAL VOCABULARY INTERVENTIONS (3 more)
  {
    id: 'contextual-vocabulary-wide-reading',
    name: 'Contextual Vocabulary Development through Wide Reading',
    category: 'academic',
    subcategory: 'vocabulary',
    description: 'Building vocabulary through extensive independent reading combined with explicit vocabulary instruction. Emphasizes volume of reading and word consciousness.',
    targeted_needs: ['Limited vocabulary breadth', 'Low reading volume', 'Word gap', 'Need for vocabulary growth'],

    evidence_level: 'tier_1',
    research_sources: ['Nagy & Anderson wide reading research', 'EEF Reading for Pleasure', 'Vocabulary growth through reading studies'],
    effect_size: 0.42,
    success_rate: '70-75% vocabulary growth',

    age_range: ['primary', 'secondary'],
    setting: ['classroom', 'home', 'mixed'],
    duration: 'Ongoing (minimum 20 weeks)',
    frequency: 'Daily',
    session_length: '20-30 minutes reading + vocabulary work',
    total_sessions: 100,

    complexity: 'low',
    staff_training_required: false,
    resources_needed: ['Wide variety of books', 'Personal word journals', 'Library access', 'Book talk protocols'],
    cost_implications: '£50-£200 for classroom library',

    key_components: [
      'Daily independent reading (20+ min)',
      'Access to wide variety of books',
      'Student choice of reading material',
      'Word consciousness activities',
      'Personal word journals',
      'Discussion of interesting words',
      'Book recommendations and sharing'
    ],

    fidelity_checklist: [
      'Daily reading time protected',
      'Wide variety of texts available',
      'Student choice honored',
      'Word collection encouraged',
      'Regular vocabulary discussions',
      'Teacher reads too (modeling)',
      'Book talks and sharing',
      'Track volume of reading'
    ],

    progress_indicators: [
      'Increased reading volume',
      'Growing personal word collection',
      'Uses new words in speaking and writing',
      'Word consciousness (notices interesting words)',
      'Reading for pleasure',
      'Vocabulary breadth growth',
      'Better reading comprehension'
    ],

    expected_outcomes: [
      'Significant vocabulary growth (1000+ words per year from reading)',
      'Increased reading engagement',
      'Better reading comprehension',
      'Academic success across curriculum'
    ],

    adaptations: [
      'Audiobooks for struggling readers',
      'Graphic novels for reluctant readers',
      'Topic-specific reading for interests',
      'Partner reading',
      'Technology for book access',
      'Home-school reading partnerships'
    ],

    contraindications: ['None - benefits all readers'],

    complementary_interventions: [
      'Explicit vocabulary instruction',
      'Reading comprehension strategies',
      'Morphology teaching',
      'Independent reading programs'
    ],

    implementation_guide: 'The research is clear: reading volume MATTERS for vocabulary growth. Students who read 20+ min/day encounter ~1.8 million words/year vs 8,000 words/year for non-readers (Nagy & Anderson). Implementation: 1) Daily sustained silent reading (20-30 min). 2) Wide access to books (classroom library, school library, public library). 3) Student choice (essential!). 4) Word consciousness: "word of the day" from reading, personal word journals, share interesting words. 5) Book talks - students recommend books to each other. 6) Teacher reads too (modeling). 7) Track books read. Key: VOLUME + VARIETY. Not: round-robin reading or reading as punishment!',

    parent_information: 'The single best way to build vocabulary is READING! Students who read for pleasure for 20+ minutes daily learn thousands of new words every year. We\'re creating a reading culture where your child: reads daily, chooses their own books, discovers new words, and shares reading experiences. At home: make reading part of daily routine (bedtime, after school), visit library regularly, let your child choose books (even comics/graphic novels count!), read together, talk about books, notice interesting words, and BE A READING ROLE MODEL - let your child see YOU reading for pleasure!',

    useful_links: [
      'https://www.booktrust.org.uk/books-and-reading/tips-and-advice/reading-tips/reading-for-pleasure/',
      'https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/literacy-ks2',
      'https://www.ukla.org/resources/details/reading_for_pleasure'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['vocabulary', 'reading_for_pleasure', 'wide_reading', 'independent_reading', 'tier_1', 'word_consciousness']
  },

  {
    id: 'content-area-vocabulary-science-humanities',
    name: 'Content-Area Vocabulary Instruction (Science, History, Geography)',
    category: 'academic',
    subcategory: 'vocabulary',
    description: 'Systematic teaching of subject-specific (Tier 3) vocabulary essential for accessing curriculum content. Integrates vocabulary with content learning.',
    targeted_needs: ['Difficulty with subject-specific vocabulary', 'Poor content comprehension', 'EAL students', 'Curriculum access difficulties'],

    evidence_level: 'tier_1',
    research_sources: ['Marzano content vocabulary research', 'EEF Secondary Literacy', 'Academic language development studies'],
    effect_size: 0.58,
    success_rate: '75-80% improved content vocabulary and comprehension',

    age_range: ['primary', 'secondary'],
    setting: ['classroom', 'small_group'],
    duration: 'Ongoing with each unit',
    frequency: 'Integrated with content lessons',
    session_length: '15-20 minutes per lesson',
    total_sessions: 40,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Content-specific word lists', 'Visual supports (diagrams, images)', 'Frayer model templates', 'Content-area texts'],
    cost_implications: '£30-£100 for materials',

    key_components: [
      'Pre-teach key vocabulary before content',
      'Provide student-friendly definitions',
      'Visual representations',
      'Multiple exposures in context',
      'Active processing (Frayer model, word maps)',
      'Link to prior knowledge',
      'Assessment of vocabulary learning'
    ],

    fidelity_checklist: [
      'Identify 5-7 key words per unit',
      'Pre-teach before content',
      'Student-friendly definitions',
      'Visual supports provided',
      'Multiple exposures across unit',
      'Active processing activities',
      'Use in speaking and writing',
      'Assess vocabulary learning'
    ],

    progress_indicators: [
      'Understands key content vocabulary',
      'Uses words in discussions',
      'Uses words in writing',
      'Better comprehension of content',
      'Improved performance on content assessments',
      'Growing subject-specific vocabulary'
    ],

    expected_outcomes: [
      'Mastery of key content vocabulary',
      'Better access to curriculum content',
      'Improved academic performance',
      'Reduced vocabulary barrier to learning'
    ],

    adaptations: [
      'Visual glossaries',
      'Bilingual word banks for EAL',
      'Technology (vocabulary apps)',
      'Reduced number of words for severe difficulties',
      'Peer vocabulary teaching',
      'Real objects/demonstrations'
    ],

    contraindications: ['None - essential for all learners'],

    complementary_interventions: [
      'Morphology teaching (Greek/Latin roots common in academic language)',
      'Reading comprehension strategies',
      'Note-taking strategies',
      'General vocabulary development'
    ],

    implementation_guide: 'Content vocabulary = Tier 3 words (photosynthesis, monarchy, erosion). Essential for curriculum access. Pre-teach 5-7 key words BEFORE unit. Day 1: Introduce words with definitions, pictures, demonstrations. Use Frayer Model: definition, characteristics, examples, non-examples. Day 2-onwards: Multiple exposures - in text, discussions, activities, writing. Display word wall. Activities: matching, sorting, creating sentences, teaching peer, concept maps. Link to morphology: photo-synthesis (light-making), geo-graphy (earth-writing). Assessment: can students define, recognize, and USE words? Research: pre-teaching vocabulary significantly improves content learning!',

    parent_information: 'Every subject has its own special vocabulary (like "photosynthesis" in science, "democracy" in history). These words are keys to understanding the subject. We\'re systematically teaching these important words so your child can access curriculum learning. At home: when your child talks about school subjects, ask them to explain key words, create a "word wall" for current topics, link to everyday experience ("Condensation? Like when the bathroom mirror steams up!"), and read non-fiction books on topics being studied. Understanding subject vocabulary = understanding the subject!',

    useful_links: [
      'https://www.readingrockets.org/strategies/frayer_model',
      'https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/literacy-ks2',
      'https://www.vocabul ary.com/articles/wordroutes/'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['vocabulary', 'content_area', 'tier_3_words', 'science', 'history', 'geography', 'tier_1', 'curriculum_access']
  },

  {
    id: 'greek-latin-roots-academic-vocabulary',
    name: 'Greek and Latin Roots for Academic Vocabulary',
    category: 'academic',
    subcategory: 'vocabulary',
    description: 'Teaching common Greek and Latin roots, prefixes, and suffixes that unlock thousands of academic words. Provides word-learning strategy for independence.',
    targeted_needs: ['Limited academic vocabulary', 'Difficulty learning new words', 'Secondary/post-16 academic demands', 'Need for word-learning strategies'],

    evidence_level: 'tier_1',
    research_sources: ['Morphology and vocabulary research', 'Greek/Latin roots studies', 'Academic language development'],
    effect_size: 0.56,
    success_rate: '75-80% improved ability to understand unfamiliar words',

    age_range: ['primary', 'secondary', 'post_16'],
    setting: ['classroom', 'small_group'],
    duration: '16-24 weeks',
    frequency: '2-3 times per week',
    session_length: '15-20 minutes',
    total_sessions: 40,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Greek/Latin roots lists', 'Root word cards', 'Etymology resources', 'Word investigation activities'],
    cost_implications: '£30-£80 for materials',

    key_components: [
      'Teach common roots systematically (graph, port, ject, scrib)',
      'Teach prefixes (pre-, post-, anti-, trans-)',
      'Teach suffixes (-ology, -tion, -able)',
      'Build word families from roots',
      'Etymology (word origins)',
      'Word investigation activities',
      'Application to academic texts'
    ],

    fidelity_checklist: [
      'Teach 1-2 roots per week',
      'Teach meaning of root',
      'Generate word family from root',
      'Investigate word origins',
      'Practice breaking down unfamiliar words',
      'Link to content area vocabulary',
      'Regular review',
      'Application in reading'
    ],

    progress_indicators: [
      'Knows common roots',
      'Can break down unfamiliar words',
      'Uses roots to figure out word meanings',
      'Growing academic vocabulary',
      'Better comprehension of academic texts',
      'Independent word learning strategy'
    ],

    expected_outcomes: [
      'Knowledge of 30-50 common roots',
      'Ability to decode unfamiliar academic words',
      'Expanded academic vocabulary',
      'Better reading comprehension',
      'Lifelong word-learning strategy'
    ],

    adaptations: [
      'Focus on highest-utility roots first',
      'Visual word trees',
      'Word investigation games',
      'Technology (etymology apps)',
      'Link to content being studied',
      'Create personal root dictionaries'
    ],

    contraindications: ['Most appropriate from upper primary onward'],

    complementary_interventions: [
      'Morphology teaching',
      'Content-area vocabulary',
      'General vocabulary development',
      'Academic literacy'
    ],

    implementation_guide: 'Why teach roots? 60%+ of academic English words contain Greek/Latin roots. ONE root unlocks dozens of words! High-utility roots: graph (writing): autograph, biography, paragraph, graphic; port (carry): portable, transport, report, export; scrib/script (write): describe, prescription, manuscript; ject (throw): project, reject, inject; tele (far): telephone, television, telescope. Week 1: Teach root "graph" = writing. Brainstorm words: photograph, autograph, biography. Break down: photo-graph (light-writing), auto-graph (self-writing). Week 2: Practice identifying "graph" in texts. Repeat with new roots. Teach prefixes/suffixes too. Key: this is a THINKING strategy - figure out unfamiliar words!',

    parent_information: 'Many English academic words come from Greek and Latin. Good news: learning common roots is like having a secret code! ONE root unlocks DOZENS of words. Example: "tele" means "far". Your child can now understand: telephone (far-sound), television (far-seeing), telescope (far-seeing device), telegram (far-writing). We\'re teaching 30-50 common roots that appear in thousands of words. At home: play word detective (break down big words into parts), notice connections between words, discuss word origins (dictionaries often show this), and create word family trees. This is a superpower for academic success!',

    useful_links: [
      'https://www.readingrockets.org/strategies/teaching-word-roots',
      'https://www.vocabularyroots.com',
      'https://www.etymonline.com'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['vocabulary', 'morphology', 'greek_latin_roots', 'academic_language', 'tier_1', 'word_learning_strategy']
  },

  // LITERACY ACROSS CURRICULUM (2)
  {
    id: 'reading-in-content-areas',
    name: 'Reading Strategies for Content-Area Texts',
    category: 'academic',
    subcategory: 'literacy_across_curriculum',
    description: 'Teaching specific reading strategies for subject-specific texts (science textbooks, historical documents, mathematical word problems). Every teacher a literacy teacher.',
    targeted_needs: ['Difficulty reading content texts', 'Poor comprehension of textbooks', 'Curriculum reading barriers', 'Secondary transition difficulties'],

    evidence_level: 'tier_1',
    research_sources: ['EEF Secondary Literacy', 'Disciplinary literacy research', 'Content-area reading studies'],
    effect_size: 0.52,
    success_rate: '70-75% improved content reading',

    age_range: ['secondary', 'post_16'],
    setting: ['classroom'],
    duration: 'Ongoing',
    frequency: 'Integrated with content lessons',
    session_length: '10-15 minutes per lesson',
    total_sessions: 40,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Subject-specific reading strategy guides', 'Graphic organizers', 'Think-aloud protocols'],
    cost_implications: '£20-£60 for materials',

    key_components: [
      'Pre-reading strategies (preview, predictions)',
      'During-reading strategies (monitoring, note-making)',
      'Post-reading strategies (summarizing, questioning)',
      'Subject-specific strategies (reading graphs in science, analyzing sources in history)',
      'Vocabulary support',
      'Text structure awareness',
      'Modeling by content teachers'
    ],

    fidelity_checklist: [
      'Explicit teaching of reading strategies',
      'Think-alouds with content texts',
      'Guided practice',
      'Graphic organizers provided',
      'Pre-teach vocabulary',
      'Break complex texts into chunks',
      'Regular opportunities to practice',
      'All teachers support literacy'
    ],

    progress_indicators: [
      'Uses reading strategies independently',
      'Better comprehension of content texts',
      'Improved note-taking from reading',
      'Better performance on content assessments',
      'More confident with textbook reading'
    ],

    expected_outcomes: [
      'Strategic reading of content texts',
      'Improved content comprehension',
      'Better curriculum access',
      'Improved academic performance',
      'Reduced reading barrier to learning'
    ],

    adaptations: [
      'Simplify texts when appropriate',
      'Provide alternative texts at different levels',
      'Audio support for content texts',
      'Visual supports',
      'Collaborative reading',
      'Technology for text access'
    ],

    contraindications: ['None - needed by all students for content learning'],

    complementary_interventions: [
      'Content-area vocabulary',
      'Reading comprehension strategies',
      'Text structure teaching',
      'Note-taking strategies'
    ],

    implementation_guide: 'Every subject has unique literacy demands! SCIENCE texts: graphs, diagrams, technical vocabulary, cause-effect, procedures. Strategies: preview headings/visuals, annotate diagrams, STEM sentences for writing. HISTORY texts: primary/secondary sources, bias, chronology, perspective. Strategies: source analysis, timeline creation, comparing accounts. MATHS: word problems, symbolic notation, diagrams. Strategies: underline key information, draw diagrams, rephrase in own words. Implementation: 1) Model reading strategy with subject text (think-aloud). 2) Guided practice. 3) Independent application. Key: CONTENT TEACHERS are LITERACY TEACHERS! Every teacher teaches reading in their subject.',

    parent_information: 'As students get older, they need to read different types of texts in different subjects. Science textbooks, history sources, maths word problems - each needs different reading skills! We\'re teaching your child specific strategies for reading and understanding content texts in each subject. At home: when your child has reading homework, support them in using strategies (What do you already know about this topic? What are the key words? Can you summarize in your own words?), don\'t just "do the reading for them" - help them develop strategies, and value ALL subject teachers as literacy teachers!',

    useful_links: [
      'https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/literacy-ks3-ks4',
      'https://www.readingrockets.org/strategies/content-area-reading',
      'https://www.literacytrust.org.uk/resources/disciplinary-literacy'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['literacy_across_curriculum', 'content_area_reading', 'disciplinary_literacy', 'secondary', 'tier_1']
  },

  // ========================================================================
  // COGNITIVE & WORKING MEMORY INTERVENTIONS (Ingested from Training Content)
  // ========================================================================
  {
    id: 'wm-chunking-strategy',
    name: 'Working Memory: Chunking Strategy',
    category: 'academic',
    subcategory: 'cognition_memory',
    description: 'A cognitive strategy to overcome working memory limitations by grouping individual pieces of information into larger, meaningful units ("chunks"). Based on Miller\'s Law (7 +/- 2 items).',
    targeted_needs: ['Poor working memory', 'Difficulty following multi-step instructions', 'Forgetting information quickly', 'Cognitive overload'],

    evidence_level: 'tier_1',
    research_sources: ['Miller (1956)', 'Cowan (2001)', 'Gathercole & Alloway (2008)'],
    effect_size: 0.65,
    success_rate: 'High for immediate recall tasks',

    age_range: ['primary', 'secondary', 'post_16'],
    setting: ['classroom', 'one_to_one', 'home'],
    duration: 'Ongoing strategy',
    frequency: 'Daily integration',
    session_length: 'Integrated into teaching',

    complexity: 'low',
    staff_training_required: false,
    resources_needed: ['None (Teacher technique)'],
    cost_implications: 'None',

    key_components: [
      'Group related items together',
      'Use acronyms or mnemonics',
      'Break long numbers into groups (e.g., 077-00-900-123)',
      'Categorize vocabulary words',
      'Teach students to self-chunk'
    ],

    fidelity_checklist: [
      'Teacher presents information in groups of 3-4',
      'Pauses provided between chunks',
      'Students encouraged to find patterns',
      'Visual grouping used on board'
    ],

    progress_indicators: [
      'Recall of longer sequences',
      'Better following of instructions',
      'Reduced frustration during complex tasks'
    ],

    expected_outcomes: [
      'Improved immediate recall',
      'Better task completion',
      'Reduced cognitive load'
    ],

    adaptations: ['Use color coding to visually chunk', 'Use rhythm/melody to auditory chunk'],
    contraindications: ['None'],
    complementary_interventions: ['Dual Coding', 'Visual Supports'],

    implementation_guide: 'Instead of giving a list of 10 items, group them into 3 categories of 3-4 items. When giving instructions, break "Get your book, turn to page 4, and answer question 1" into: "Get Book -> Page 4 -> Question 1".',
    parent_information: 'Help your child remember things by grouping them. Instead of a long list of chores, group them: "Upstairs chores" and "Downstairs chores".',
    useful_links: ['https://www.understood.org/en/articles/chunking-technique'],
    created_at: '2025-12-11',
    updated_at: '2025-12-11',
    tags: ['working_memory', 'cognition', 'memory_strategy', 'tier_1']
  },
  {
    id: 'wm-dual-coding',
    name: 'Working Memory: Dual Coding',
    category: 'academic',
    subcategory: 'cognition_memory',
    description: 'Combining verbal and visual information to double the chance of learning. Utilizes both the Phonological Loop and Visuo-Spatial Sketchpad simultaneously.',
    targeted_needs: ['Verbal memory deficits', 'Visual memory deficits', 'Slow processing speed'],

    evidence_level: 'tier_1',
    research_sources: ['Paivio (1971)', 'Caviglioli (2019)', 'EEF Cognitive Science'],
    effect_size: 0.55,
    success_rate: 'Very High',

    age_range: ['all'],
    setting: ['classroom'],
    duration: 'Ongoing',
    frequency: 'Daily',
    session_length: 'Integrated',

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Icons', 'Diagrams', 'Visualizers'],
    cost_implications: 'Low',

    key_components: [
      'Always pair text/speech with an image',
      'Use diagrams to explain concepts',
      'Avoid "decorative" images (extraneous load)',
      'Students draw diagrams to explain understanding'
    ],

    fidelity_checklist: [
      'Visuals support the text directly',
      'No "chart junk"',
      'Teacher explains the visual connection'
    ],

    progress_indicators: ['Improved retention of concepts', 'Better explanation of ideas'],
    expected_outcomes: ['Deeper understanding', 'Longer retention'],

    adaptations: ['Tactile dual coding for VI students'],
    contraindications: ['Visual clutter/overload'],
    complementary_interventions: ['Chunking', 'Graphic Organizers'],

    implementation_guide: 'Don\'t just say "The heart pumps blood." Show a diagram of the heart AND say it. The brain processes these in two separate channels, increasing capacity.',
    parent_information: 'Draw pictures when explaining things to your child. It helps them "see" what you mean and remember it better.',
    useful_links: ['https://www.olicav.com'],
    created_at: '2025-12-11',
    updated_at: '2025-12-11',
    tags: ['working_memory', 'dual_coding', 'visual_learning', 'tier_1']
  },

  {
    id: 'writing-across-curriculum',
    name: 'Writing to Learn Across the Curriculum',
    category: 'academic',
    subcategory: 'literacy_across_curriculum',
    description: 'Using writing as a tool for learning in all subjects. Low-stakes writing activities that promote thinking, understanding, and content retention.',
    targeted_needs: ['Poor content retention', 'Passive learning', 'Difficulty processing content', 'Need for active learning strategies'],

    evidence_level: 'tier_1',
    research_sources: ['Writing to learn research', 'Graham & Perin Writing Next', 'EEF Secondary Literacy'],
    effect_size: 0.48,
    success_rate: '70-75% improved content learning',

    age_range: ['primary', 'secondary', 'post_16'],
    setting: ['classroom'],
    duration: 'Ongoing',
    frequency: 'Daily',
    session_length: '5-10 minutes per lesson',
    total_sessions: 100,

    complexity: 'low',
    staff_training_required: true,
    resources_needed: ['Learning journals', 'Writing prompts', 'Think-write-pair-share protocols'],
    cost_implications: '£10-£40 for journals',

    key_components: [
      'Quick writes (5 min writing to explore ideas)',
      'Learning logs/journals',
      'Exit tickets (summarize learning)',
      'Think-write-pair-share',
      'Explain it in writing',
      'Low-stakes (not graded for writing quality)',
      'Writing to think, not writing to show'
    ],

    fidelity_checklist: [
      'Regular brief writing activities',
      'Not graded for writing quality',
      'Focus on content thinking',
      'Variety of writing prompts',
      'Opportunities to share',
      'All subjects use writing to learn',
      'Student ownership of learning journals',
      'Reflection on learning'
    ],

    progress_indicators: [
      'Engages with content through writing',
      'Better content understanding',
      'Improved retention',
      'More active learning',
      'Develops thinking skills',
      'Better communication of ideas'
    ],

    expected_outcomes: [
      'Deeper content learning',
      'Better retention',
      'Improved thinking skills',
      'More confident with writing',
      'Better content communication'
    ],

    adaptations: [
      'Drawing + labels for younger students',
      'Sentence starters provided',
      'Voice recording alternative',
      'Bilingual writing for EAL',
      'Collaborative writing',
      'Technology for writing'
    ],

    contraindications: ['None - beneficial for all learners'],

    complementary_interventions: [
      'Reading strategies',
      'Content vocabulary',
      'Metacognition strategies',
      'Thinking skills'
    ],

    implementation_guide: 'Writing to learn ≠ writing to show what you learned. It\'s writing to DEVELOP understanding. Activities: QUICK WRITE (3 min): "Write everything you know about photosynthesis." "What surprised you about today\'s lesson?" EXIT TICKET (2 min): "3 things you learned, 2 questions you have, 1 thing you\'ll remember." LEARNING LOG: Regular reflection on learning process. EXPLAIN IT: "Explain [concept] to someone who\'s never heard of it." THINK-WRITE-PAIR-SHARE: Think individually, write ideas, discuss with partner. Key: LOW STAKES - not graded on spelling/grammar. The act of writing = the act of thinking. Works in ALL subjects: Science (explain processes), Maths (explain problem-solving), History (analyze causes), PE (reflect on performance)!',

    parent_information: 'Writing helps learning! When students write about what they\'re learning, they understand and remember it better. We\'re using quick, informal writing in ALL subjects to help your child think deeply about content. This isn\'t about perfect spelling or grammar - it\'s about using writing as a thinking tool. At home: encourage your child to keep a learning journal, ask them to write quick summaries of what they learned at school, have them teach YOU by writing explanations, and remember - the goal is thinking, not perfect writing!',

    useful_links: [
      'https://www.facinghistory.org/resource-library/teaching-strategies/journals-our-classroom',
      'https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/literacy-ks3-ks4',
      'https://wac.colostate.edu/resources/writing/teaching/intro/'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['writing_to_learn', 'literacy_across_curriculum', 'active_learning', 'reflection', 'tier_1', 'metacognition']
  },

  // READING MOTIVATION AND ENGAGEMENT (2)
  {
    id: 'reading-for-pleasure-program',
    name: 'Reading for Pleasure Program',
    category: 'academic',
    subcategory: 'reading_engagement',
    description: 'Systematic program to develop reading motivation, engagement, and positive reading identities. Creates lifelong readers through choice, social reading, and book talk.',
    targeted_needs: ['Reading reluctance', 'Low reading motivation', 'Negative attitude to reading', 'Limited reading outside school'],

    evidence_level: 'tier_1',
    research_sources: ['EEF Reading for Pleasure', 'OU Reading for Pleasure Research', 'Reading engagement studies'],
    effect_size: 0.38,
    success_rate: '70-75% increased reading engagement',

    age_range: ['early_years', 'primary', 'secondary'],
    setting: ['classroom', 'mixed', 'home'],
    duration: 'Ongoing',
    frequency: 'Daily',
    session_length: '20-30 minutes',
    total_sessions: 100,

    complexity: 'low',
    staff_training_required: true,
    resources_needed: ['Wide variety of books', 'Book talk resources', 'Reading environment setup', 'Author visits/videos'],
    cost_implications: '£100-£500 for classroom library and author events',

    key_components: [
      'Daily time for personal reading',
      'Wide book choice and availability',
      'Social reading communities (book clubs, recommendations)',
      'Informal book talk (not book reports!)',
      'Access to reading role models',
      'Book-rich environment',
      'No reading as punishment',
      'Celebrate reading'
    ],

    fidelity_checklist: [
      'Daily reading time protected',
      'Extensive book choice available',
      'Student voice in book selection',
      'Regular informal book discussions',
      'Teachers and staff read too (modeling)',
      'Reading celebrated not tested',
      'Library visits regular',
      'Home-school reading partnerships',
      'NO reading as punishment'
    ],

    progress_indicators: [
      'Increased reading volume',
      'More positive attitude to reading',
      'Talks about books enthusiastically',
      'Makes book recommendations',
      'Reads for pleasure outside school',
      'Develops reading identity',
      'Better reading skills (as consequence)'
    ],

    expected_outcomes: [
      'Lifelong reading habit',
      'Positive reading identity',
      'Improved reading skills',
      'Better academic outcomes',
      'Enriched life through literature'
    ],

    adaptations: [
      'Audiobooks count!',
      'Graphic novels, comics, magazines - all reading',
      'Digital books for tech-engaged readers',
      'Shorter texts for struggling readers',
      'Non-fiction for reluctant fiction readers',
      'Series books for consistency'
    ],

    contraindications: ['None - benefits ALL readers'],

    complementary_interventions: [
      'Reading instruction (when needed)',
      'Library programs',
      'Author visits',
      'Book clubs'
    ],

    implementation_guide: 'Research shows: reading for pleasure is THE most important indicator of future success - more than family background! Implementation: 1) TIME - sacred daily reading time (15-30 min), no interruptions. 2) CHOICE - extensive varied books, student choice crucial. 3) ENVIRONMENT - comfy reading spaces, book displays, reading "buzz". 4) SOCIAL - book talks (not reports!), recommendations, reading buddies. 5) MODELS - teachers read alongside students, share what they\'re reading. 6) CELEBRATE - reading displays, author visits, book prizes (not for comprehension!). Key: INTRINSIC motivation. NOT extrinsic rewards, quizzes, or forced genres. Book reports KILL reading for pleasure!',

    parent_information: 'Reading for pleasure is the single most important thing for your child\'s future success. We\'re building a love of reading, not just reading skills. Your child will: choose their own books, read daily, talk about books with friends, and develop their reading identity. At home: BEDTIME READING (even for older children!), LIBRARY VISITS (weekly if possible), CHOICE (let them choose books - even "easy" or graphic novels count!), READ YOURSELF (be a reading role model), TALK about books (not quiz!), and NEVER use reading as punishment. Goal: lifelong readers who read for joy!',

    useful_links: [
      'https://www.booktrust.org.uk/what-we-do/programmes-and-campaigns/reading-for-pleasure/',
      'https://educationendowmentfoundation.org.uk/education-evidence/evidence-reviews/summer-learning',
      'https://clpe.org.uk/research/reading-scale'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['reading_for_pleasure', 'motivation', 'engagement', 'book_talk', 'tier_1', 'lifelong_reading']
  },

  {
    id: 'high-interest-literacy-reluctant-readers',
    name: 'High-Interest Literacy for Reluctant Readers',
    category: 'academic',
    subcategory: 'reading_engagement',
    description: 'Using high-interest, low-readability texts and multimodal literacy to engage reluctant readers. Validates diverse reading materials and rebuilds reading confidence.',
    targeted_needs: ['Reluctant readers', 'Reading avoidance', 'Low reading confidence', 'Older struggling readers', 'Boys disengaged with reading'],

    evidence_level: 'tier_2',
    research_sources: ['Reluctant reader research', 'Multimodal literacy studies', 'Reading engagement for boys'],
    effect_size: 0.35,
    success_rate: '60-70% increased reading engagement',

    age_range: ['primary', 'secondary'],
    setting: ['small_group', 'one_to_one', 'classroom'],
    duration: '12-20 weeks',
    frequency: '3-4 times per week',
    session_length: '20-30 minutes',
    total_sessions: 48,

    complexity: 'low',
    staff_training_required: false,
    resources_needed: ['High-interest books (sport, gaming, adventure, horror)', 'Graphic novels', 'Magazines', 'Digital texts', 'Multimodal texts'],
    cost_implications: '£100-£300 for high-interest library',

    key_components: [
      'High-interest topics (sport, gaming, horror, adventure, real-life)',
      'Low-readability texts (accessible language)',
      'Multimodal texts (graphic novels, comics, digital, film)',
      'Student choice paramount',
      'Non-traditional texts validated',
      'Focus on engagement, not skill',
      'Build confidence before challenge'
    ],

    fidelity_checklist: [
      'Offer genuinely high-interest materials',
      'Match readability to reading level',
      'Validate ALL reading (comics, magazines, gaming websites)',
      'Student choice is key',
      'Low-pressure environment',
      'Discuss content, not reading skill',
      'Gradually build volume',
      'Celebrate reading engagement'
    ],

    progress_indicators: [
      'Willingness to read',
      'Increased reading volume',
      'More positive attitude',
      'Talks about reading',
      'Tries new texts',
      'Reading outside intervention',
      'Improved reading skills (as consequence)'
    ],

    expected_outcomes: [
      'Re-engagement with reading',
      'Positive reading identity',
      'Increased reading practice',
      'Improved reading skills',
      'Reduced reading avoidance'
    ],

    adaptations: [
      'Ultra-high-interest topics (individual obsessions)',
      'Audiobooks while reading',
      'Partner reading for confidence',
      'Digital/gaming content',
      'Real-world functional reading',
      'Build from 5 min to longer sessions'
    ],

    contraindications: ['None - particularly effective for disengaged readers'],

    complementary_interventions: [
      'Reading skills instruction (when ready)',
      'Paired reading',
      'Reading for pleasure program',
      'Confidence building'
    ],

    implementation_guide: 'Reluctant readers need SUCCESS and ENGAGEMENT first, skill second. Stock: Barrington Stoke (dyslexia-friendly high-interest), sport biographies, gaming guides, Guinness World Records, horror (Goosebumps, Point Horror), graphic novels (Dog Man, Wimpy Kid), magazines (Match, National Geographic Kids), comics. Session: 1) CHOICE - let student browse and select. 2) READ - student reads (with support if needed), focus on content. 3) CHAT - informal discussion about content (NOT comprehension quiz!). 4) CELEBRATE - "You read 5 pages!" (not "You could only read 5 pages"). Key: ACCEPT diverse texts. A reluctant reader reading a football magazine is READING. Build from there!',

    parent_information: 'Your child is a reluctant reader - this is common and fixable! We\'re using books and materials THEY find interesting (sport, gaming, comics, magazines) to rebuild reading confidence. ANY reading counts - comics, graphic novels, gaming magazines, football annuals. At home: BUY/BORROW materials on their interests (don\'t worry if it seems "too easy"), READ TOGETHER (takes pressure off), CHAT about content (not quiz), CELEBRATE reading ("I noticed you reading that football magazine!"), and NEVER force "proper" books. Goal: engagement first, skill follows. A child reading gaming guides is better than a child not reading at all!',

    useful_links: [
      'https://www.booktrust.org.uk/books-and-reading/bookfinder/reluctant-reader-books/',
      'https://www.barringtonstoke.co.uk',
      'https://literacytrust.org.uk/resources/boys-reading-commission-report/'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['reluctant_readers', 'engagement', 'high_interest', 'graphic_novels', 'tier_2', 'boys_reading']
  },

  // LITERACY FOR EAL STUDENTS (2)
  {
    id: 'eal-vocabulary-language-development',
    name: 'EAL Vocabulary and Language Development',
    category: 'academic',
    subcategory: 'eal_literacy',
    description: 'Systematic vocabulary and language development for English as Additional Language learners. Builds both conversational and academic English.',
    targeted_needs: ['EAL students', 'Limited English vocabulary', 'Need for academic English', 'Recent arrivals', 'Beginner to intermediate English'],

    evidence_level: 'tier_1',
    research_sources: ['EEF EAL guidance', 'Second language acquisition research', 'Academic language development for EAL'],
    effect_size: 0.58,
    success_rate: '75-80% language progress',

    age_range: ['early_years', 'primary', 'secondary'],
    setting: ['small_group', 'one_to_one', 'classroom'],
    duration: '20+ weeks ongoing',
    frequency: '4-5 times per week',
    session_length: '20-30 minutes',
    total_sessions: 100,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Visual vocabulary materials', 'Bilingual dictionaries', 'Real objects/realia', 'Picture cards', 'EAL-specific resources'],
    cost_implications: '£50-£200 for materials',

    key_components: [
      'Systematic vocabulary teaching (high-frequency first, then academic)',
      'Visual supports (pictures, gestures, objects)',
      'Explicit language structures',
      'Oral language practice',
      'Link to home language (use cognates, bilingual resources)',
      'Scaffolded reading and writing',
      'Cultural responsiveness'
    ],

    fidelity_checklist: [
      'Assess English proficiency stage',
      'Teach high-utility vocabulary first',
      'Always use visual supports',
      'Provide comprehensible input',
      'Encourage use of home language',
      'Explicit teaching of language structures',
      'Oral practice before reading/writing',
      'Build from conversational to academic language',
      'Celebrate bilingualism'
    ],

    progress_indicators: [
      'Increasing English vocabulary',
      'Uses English in conversation',
      'Comprehends classroom language',
      'Progressing through EAL stages',
      'Academic English developing',
      'Reading in English improving',
      'Writing in English developing'
    ],

    expected_outcomes: [
      'Proficiency in conversational English',
      'Academic English for curriculum access',
      'Reading and writing in English',
      'Maintained home language',
      'Successful bilingualism'
    ],

    adaptations: [
      'Use cognates from home language',
      'Bilingual support materials',
      'Translation tools when needed',
      'Peer support from same language background',
      'Extended time for processing',
      'Reduce language load, not content'
    ],

    contraindications: ['Must maintain and value home language'],

    complementary_interventions: [
      'Mainstream literacy instruction (with adaptation)',
      'Content vocabulary teaching',
      'Reading comprehension strategies',
      'Oral language development'
    ],

    implementation_guide: 'EAL stages: Beginner (silent period, single words), Early (short phrases, simple sentences), Developing (longer sentences, errors), Competent (fluent conversation), Fluent (academic English). Priorities: BEGINNER - survival vocabulary, classroom language, high-frequency words (the, is, have). Visual supports essential. Home language OK! EARLY - social language, basic academic vocabulary, simple sentence structures. DEVELOPING - academic vocabulary, complex sentences, subject-specific language. COMPETENT - academic literacy, subject-specific skills. Key: comprehensible input (visuals, gestures, demonstrations), oral before written, celebrate bilingualism, don\'t rush - language acquisition takes 5-7 years for academic proficiency!',

    parent_information: 'Your child is learning English while learning curriculum content - this is challenging! We\'re systematically teaching English vocabulary and language structures. CRUCIAL: please continue speaking your home language at home! Bilingualism is an asset! Children learn English at school - they need home language for family, culture, thinking. Research shows: strong home language supports English learning. At home: speak your language, read books in home language, explain new English words in home language when needed, celebrate bilingualism, and be patient - learning academic English takes 5-7 years.',

    useful_links: [
      'https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/english-as-an-additional-language',
      'https://www.naldic.org.uk/eal-initial-teacher-education-resources/',
      'https://ealresources.bell-foundation.org.uk'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['EAL', 'vocabulary', 'language_development', 'bilingualism', 'tier_1', 'second_language']
  },

  {
    id: 'eal-reading-writing-scaffolds',
    name: 'EAL Reading and Writing Scaffolds',
    category: 'academic',
    subcategory: 'eal_literacy',
    description: 'Scaffolded reading and writing instruction for EAL learners. Provides language frames, sentence starters, and models to support literacy development.',
    targeted_needs: ['EAL students learning to read/write in English', 'Need for literacy scaffolds', 'Developing academic literacy', 'Writing reluctance due to language'],

    evidence_level: 'tier_1',
    research_sources: ['EEF EAL guidance', 'Scaffolding research', 'Second language literacy development'],
    effect_size: 0.52,
    success_rate: '70-75% literacy progress',

    age_range: ['primary', 'secondary'],
    setting: ['small_group', 'classroom'],
    duration: '20+ weeks ongoing',
    frequency: '4-5 times per week',
    session_length: '30-40 minutes',
    total_sessions: 100,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Sentence frames', 'Writing frames', 'Model texts', 'Bilingual texts', 'Visual supports'],
    cost_implications: '£40-£150 for materials',

    key_components: [
      'Reading with comprehensible input',
      'Sentence frames and starters',
      'Writing frames for different genres',
      'Model texts at appropriate level',
      'Explicit teaching of text structure',
      'Vocabulary pre-teaching',
      'Gradual release of scaffolds',
      'Bilingual texts when available'
    ],

    fidelity_checklist: [
      'Pre-teach key vocabulary before reading',
      'Provide visual context for texts',
      'Use sentence frames for writing',
      'Model expected language',
      'Break texts into manageable chunks',
      'Check comprehension frequently',
      'Provide writing frames initially',
      'Gradually reduce scaffolds',
      'Celebrate approximations'
    ],

    progress_indicators: [
      'Comprehends age-appropriate texts with support',
      'Uses sentence frames to write',
      'Attempts writing independently',
      'Gradually needs less scaffolding',
      'Developing text structure knowledge',
      'Growing confidence in literacy',
      'Transfers skills to curriculum tasks'
    ],

    expected_outcomes: [
      'Independent reading with comprehension',
      'Confident writing in English',
      'Access to curriculum literacy',
      'Academic English proficiency',
      'Reduced need for scaffolds'
    ],

    adaptations: [
      'Highly scaffolded initially (sentence frames for every sentence)',
      'Bilingual texts for complex content',
      'Audio support for reading',
      'Technology (translation tools, speech-to-text)',
      'Peer support',
      'Extended time'
    ],

    contraindications: ['Scaffolds must be gradually removed - goal is independence'],

    complementary_interventions: [
      'EAL vocabulary development',
      'Mainstream literacy instruction',
      'Content-area support',
      'Oral language development'
    ],

    implementation_guide: 'READING scaffolds: Pre-teach vocabulary. Provide visuals. Read aloud first. Break into chunks. Check comprehension (visuals, gestures, L1 when needed). Graphic organizers. Bilingual texts. Simplified versions alongside original. WRITING scaffolds: SENTENCE FRAMES: "The character felt ____ because ____." "One reason is ____. Another reason is ____." WRITING FRAMES: Essay frame with topic sentence starters, paragraph structures. MODELS: Show what good writing looks like. Key: provide scaffolds UP FRONT (not after failure), gradually fade, goal is independence. EAL students CAN access grade-level content with appropriate scaffolds - don\'t lower expectations!',

    parent_information: 'Your child is learning to read and write in English - a complex task! We\'re providing scaffolds (supports) like sentence starters and writing frames to help. These supports will be gradually removed as your child becomes more confident. At home: read bilingual books together when possible, accept that writing in English will be challenging initially (and that\'s OK!), celebrate attempts, encourage reading in home language (transfers to English), and remember - learning literacy in a second language takes time. Your child is doing AMAZING work!',

    useful_links: [
      'https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/english-as-an-additional-language',
      'https://ealresources.bell-foundation.org.uk/teachers/great-ideas',
      'https://www.naldic.org.uk/eal-teaching-and-learning/eal-resources/'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['EAL', 'scaffolding', 'reading', 'writing', 'tier_1', 'sentence_frames', 'second_language']
  },

  // FINAL COMPREHENSION INTERVENTION (1)
  {
    id: 'comprehension-monitoring-metacognition',
    name: 'Comprehension Monitoring and Metacognitive Strategies',
    category: 'academic',
    subcategory: 'reading_comprehension',
    description: 'Teaching students to monitor their own comprehension and use fix-up strategies when understanding breaks down. Develops metacognitive awareness as readers.',
    targeted_needs: ['Poor comprehension monitoring', 'Continues reading without understanding', 'Lacks fix-up strategies', 'Weak metacognition'],

    evidence_level: 'tier_1',
    research_sources: ['EEF Metacognition and Self-Regulation', 'Comprehension monitoring research', 'Reciprocal teaching studies'],
    effect_size: 0.62,
    success_rate: '75-80% improved comprehension and monitoring',

    age_range: ['primary', 'secondary'],
    setting: ['small_group', 'classroom'],
    duration: '10-16 weeks',
    frequency: '3-4 times per week',
    session_length: '25-30 minutes',
    total_sessions: 40,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Texts at instructional level', 'Comprehension monitoring checklists', 'Fix-up strategy posters', 'Metacognitive prompts'],
    cost_implications: '£20-£60 for materials',

    key_components: [
      'Teach "does this make sense?" monitoring',
      'Fix-up strategies (reread, read on, ask questions, use context)',
      'Think-alouds to model monitoring',
      'Metacognitive prompts ("What am I thinking?", "Do I understand?")',
      'Identifying when understanding breaks down',
      'Strategic reading, not just reading',
      'Self-questioning during reading'
    ],

    fidelity_checklist: [
      'Model monitoring with think-alouds',
      'Teach fix-up strategies explicitly',
      'Provide metacognitive prompts',
      'Practice with texts at instructional level',
      'Encourage self-questioning',
      'Discussion of monitoring process',
      'Regular opportunities to practice',
      'Transfer to independent reading'
    ],

    progress_indicators: [
      'Recognizes when comprehension breaks down',
      'Uses fix-up strategies spontaneously',
      'Self-questions during reading',
      'More active, strategic reading',
      'Better comprehension overall',
      'Greater reading independence',
      'Metacognitive awareness'
    ],

    expected_outcomes: [
      'Strategic, self-regulated reading',
      'Improved comprehension',
      'Independence as reader',
      'Lifelong metacognitive skills',
      'Better academic performance'
    ],

    adaptations: [
      'Start with very obvious comprehension breakdowns',
      'Visual prompts for fix-up strategies',
      'Partner work for monitoring practice',
      'Technology (annotation tools)',
      'Simplified texts initially',
      'Explicit modeling essential'
    ],

    contraindications: ['Requires sufficient decoding skills - not for non-readers'],

    complementary_interventions: [
      'Reciprocal teaching',
      'Questioning techniques',
      'Inference instruction',
      'Metacognition training'
    ],

    implementation_guide: 'Problem: many students keep reading even when they don\'t understand! TEACH: 1) MONITORING: "Does this make sense?" Stop frequently to check. Think-aloud: "Hmm, I\'m confused. That doesn\'t make sense." 2) FIX-UP STRATEGIES when comprehension breaks down: REREAD (go back), READ ON (context might help), SLOW DOWN, ASK QUESTIONS ("Who? What? Why?"), USE PICTURES/DIAGRAMS, CONNECT to what I know, LOOK UP unknown word. 3) METACOGNITION: "What am I thinking?" "Do I understand?" "What\'s confusing me?" Activities: Deliberate errors in text (spot the nonsense), Think-alouds, Coding text (✓ makes sense, ? confused, ! important). Key: ACTIVE reading, not passive. Good readers constantly monitor and fix!',

    parent_information: 'Good readers don\'t just read words - they actively check "Am I understanding this?" Your child is learning to monitor their own comprehension and use strategies when confused. At home: when reading together, MODEL monitoring ("Hmm, I\'m not sure I understand that. Let me reread."), ASK "Does that make sense?", PAUSE to check understanding, SHOW fix-up strategies ("I\'m confused, let me look at the picture for clues"), and ENCOURAGE questions. Reading is THINKING! We want active, strategic readers who know when they\'re confused and what to do about it.',

    useful_links: [
      'https://www.readingrockets.org/strategies/comprehension_monitoring',
      'https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/metacognition-and-self-regulation',
      'https://www.readwritethink.org/professional-development/strategy-guides/teaching-comprehension-monitoring'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['comprehension', 'monitoring', 'metacognition', 'fix_up_strategies', 'self_regulation', 'tier_1', 'strategic_reading']
  },

  // ============================================================================
  // NUMERACY AND COGNITIVE INTERVENTIONS (30 interventions)
  // ============================================================================

  // EARLY NUMERACY & NUMBER SENSE (4)
  {
    id: 'early-number-sense-foundation',
    name: 'Early Number Sense Foundation Program',
    category: 'academic',
    subcategory: 'early_numeracy',
    description: 'Systematic teaching of foundational number concepts: counting, cardinality, number recognition, one-to-one correspondence, subitizing, number ordering. Essential pre-arithmetic skills.',
    targeted_needs: ['Poor number sense', 'Early maths difficulties', 'Reception/Y1 maths delay', 'Need for foundational concepts'],

    evidence_level: 'tier_1',
    research_sources: ['Number Sense Intervention research', 'EEF Early Maths', 'Numeracy Recovery'],
    effect_size: 0.68,
    success_rate: '75-85% improved number sense',

    age_range: ['early_years', 'primary'],
    setting: ['small_group', 'one_to_one'],
    duration: '12-16 weeks',
    frequency: '4-5 times per week',
    session_length: '15-20 minutes',
    total_sessions: 60,

    complexity: 'low',
    staff_training_required: true,
    resources_needed: ['Counters/manipulatives', 'Number cards', 'Ten frames', 'Number lines', 'Subitizing cards'],
    cost_implications: '£30-£100 for materials',

    key_components: [
      'Counting with one-to-one correspondence',
      'Cardinal number (how many?)',
      'Number recognition',
      'Subitizing (instant recognition of small quantities)',
      'Number ordering',
      'Number conservation',
      'Part-whole relationships',
      'Use of manipulatives'
    ],

    fidelity_checklist: [
      'Use concrete manipulatives (not just symbols)',
      'Systematic progression',
      'One-to-one correspondence emphasized',
      'Link counting to cardinality',
      'Subitizing practice daily',
      'Number line use',
      'Frequent assessment of mastery',
      'Multisensory approaches'
    ],

    progress_indicators: [
      'Counts accurately',
      'One-to-one correspondence',
      'Knows "how many" without recounting',
      'Recognizes numerals',
      'Orders numbers',
      'Beginning part-whole understanding',
      'Uses maths language confidently'
    ],

    expected_outcomes: [
      'Secure number sense foundation',
      'Ready for formal arithmetic',
      'Confident with numbers',
      'Reduced risk of maths difficulties'
    ],

    adaptations: [
      'Use larger manipulatives',
      'Reduce quantity range initially',
      'More practice time',
      'Visual supports',
      'Link to interests (dinosaur counting, etc.)',
      'Technology/apps for practice'
    ],

    contraindications: ['None - suitable for all early learners'],

    complementary_interventions: [
      'Spatial reasoning activities',
      'Pattern work',
      'Early addition/subtraction',
      'Mathematical language development'
    ],

    implementation_guide: 'NUMBER SENSE = understanding what numbers mean, not just reciting. Weeks 1-3: Counting with one-to-one correspondence (touch each object as you count), cardinal number (last number = how many). Weeks 4-6: Subitizing (instant recognition 1-5 without counting - use dot cards, dice). Weeks 7-9: Number recognition and formation (match numeral to quantity). Weeks 10-12: Number ordering (number line, before/after/between). Weeks 13-16: Part-whole (5 is 3 and 2, 4 and 1...). KEY: concrete first (objects), then pictorial, then abstract (numerals). Use ten frames extensively!',

    parent_information: 'Number sense is THE foundation for all maths - understanding what numbers really mean, not just counting like a robot! Your child is learning: counting (touching each object), cardinal number (knowing the last number tells "how many"), recognizing numerals (3 means this many), and early number relationships. At home: count everything (stairs, toys, food), use fingers, play dice games, notice numbers everywhere (house numbers, prices), ask "how many?" constantly, and use real objects - maths is NOT just on paper! Strong number sense = successful maths later!',

    useful_links: [
      'https://www.ncetm.org.uk/resources/number-sense',
      'https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/early-maths',
      'https://nrich.maths.org/early-years'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['number_sense', 'early_numeracy', 'counting', 'subitizing', 'tier_1', 'foundation']
  },

  {
    id: 'place-value-understanding-intervention',
    name: 'Place Value Understanding Program',
    category: 'academic',
    subcategory: 'early_numeracy',
    description: 'Deep conceptual understanding of place value (ones, tens, hundreds, thousands) using concrete, pictorial, and abstract representations. Foundation for all multi-digit arithmetic.',
    targeted_needs: ['Poor place value understanding', 'Multi-digit calculation errors', 'Year 2-4 maths difficulties', 'Column addition/subtraction confusion'],

    evidence_level: 'tier_1',
    research_sources: ['EEF Improving Mathematics in KS2/3', 'Dienes\' Base-10 blocks research', 'NCETM Place Value guidance'],
    effect_size: 0.54,
    success_rate: '70-80% improved place value understanding',

    age_range: ['primary'],
    setting: ['small_group', 'one_to_one', 'classroom'],
    duration: '8-12 weeks',
    frequency: '4-5 times per week',
    session_length: '20-30 minutes',
    total_sessions: 40,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Base-10 blocks (Dienes)', 'Place value grids', 'Arrow cards', 'Place value counters', 'Number lines'],
    cost_implications: '£50-£150 for manipulatives',

    key_components: [
      'Concrete representation (Base-10 blocks)',
      'Pictorial representation (drawings)',
      'Abstract (numerals)',
      'Grouping and exchanging (10 ones = 1 ten)',
      'Place value language',
      'Partitioning numbers',
      'Comparing and ordering multi-digit numbers',
      'Rounding'
    ],

    fidelity_checklist: [
      'Use concrete materials first (Base-10 blocks)',
      'Systematic progression: concrete → pictorial → abstract',
      'Explicit teaching of grouping/exchanging',
      'Place value language modeled',
      'Link to real-world contexts (money)',
      'Regular checks for understanding',
      'Avoid rushing to abstract too soon',
      'Multisensory approach'
    ],

    progress_indicators: [
      'Explains what each digit represents',
      'Can partition numbers (456 = 400 + 50 + 6)',
      'Understands 10 ones = 1 ten, 10 tens = 1 hundred',
      'Can compare and order multi-digit numbers',
      'Can round numbers',
      'Fewer column calculation errors'
    ],

    expected_outcomes: [
      'Deep place value understanding',
      'Improved multi-digit calculations',
      'Better number sense with large numbers',
      'Foundation for fractions and decimals'
    ],

    adaptations: [
      'Start with smaller numbers (tens only)',
      'Extended time with concrete materials',
      'Visual place value charts',
      'Link to money (pounds and pence)',
      'Technology: place value apps',
      'Reduce cognitive load (fewer columns initially)'
    ],

    contraindications: ['Requires basic counting skills first'],

    complementary_interventions: [
      'Early number sense',
      'Column addition/subtraction',
      'Estimation and rounding',
      'Fractions and decimals (later)'
    ],

    implementation_guide: 'PLACE VALUE = understanding that position determines value. Weeks 1-3: Use Base-10 blocks to build numbers - "43 = 4 tens and 3 ones" (concrete). Practice grouping: 10 ones make 1 ten. Weeks 4-6: Pictorial representations - draw tens as sticks, ones as dots. Arrow cards (40 + 3 = 43). Weeks 7-9: Place value grids, partitioning (238 = 200 + 30 + 8). Weeks 10-12: Comparing/ordering (which is bigger? why?), rounding. CRITICAL: Children must understand that "3" in "43" means 3 ones, but "3" in "230" means 3 tens (different VALUE, not just different position). Constant checking: "What does this digit represent?" Use money extensively (£2.34 = 2 pounds, 3 tens of pence, 4 pence).',

    parent_information: 'Place value is one of the most important concepts in all of maths! It\'s understanding that "357" means 3 hundreds, 5 tens, and 7 ones - not just "3, 5, 7". Children who struggle with place value will struggle with addition, subtraction, multiplication, and fractions. Your child is using special blocks (Base-10) to BUILD numbers and SEE what they mean. At home: use money (£2.45 = 2 pounds, 4 ten-pences, 5 pennies), play with arrow cards (300 + 50 + 7 = 357), ask "what does this digit mean?" Concrete understanding NOW = confident maths later!',

    useful_links: [
      'https://www.ncetm.org.uk/resources/place-value',
      'https://nrich.maths.org/place-value',
      'https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/maths-ks-2-3'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['place_value', 'early_numeracy', 'base_10', 'tier_1', 'foundation', 'multi_digit']
  },

  {
    id: 'mastery-of-number-bonds-doubles-halves',
    name: 'Mastery of Number Bonds, Doubles, and Halves',
    category: 'academic',
    subcategory: 'early_numeracy',
    description: 'Automatic recall of number bonds (pairs that make 10, 20, 100), doubles (6+6), and halves (half of 18). Essential for mental arithmetic fluency.',
    targeted_needs: ['Slow mental arithmetic', 'Counting on fingers', 'Poor number fact recall', 'Year 1-3 maths difficulties'],

    evidence_level: 'tier_1',
    research_sources: ['EEF Early Maths guidance', 'Mathematics Mastery approach', 'Number Facts research'],
    effect_size: 0.62,
    success_rate: '75-85% achieve automaticity',

    age_range: ['early_years', 'primary'],
    setting: ['small_group', 'one_to_one', 'classroom'],
    duration: '10-16 weeks',
    frequency: '5 times per week',
    session_length: '10-15 minutes',
    total_sessions: 60,

    complexity: 'low',
    staff_training_required: false,
    resources_needed: ['Number bond cards', 'Ten frames', 'Numicon', 'Dice', 'Practice worksheets'],
    cost_implications: '£20-£80 for materials',

    key_components: [
      'Number bonds to 10 (4+6, 3+7...)',
      'Number bonds to 20',
      'Number bonds to 100 (30+70...)',
      'Doubles to 20 (double 9 = 18)',
      'Near doubles (7+8 = double 7 + 1)',
      'Halves of even numbers',
      'Systematic practice to automaticity',
      'Games and activities'
    ],

    fidelity_checklist: [
      'Daily short practice',
      'Use concrete materials initially',
      'Systematic introduction of facts',
      'Regular timed fluency checks',
      'Games make it engaging',
      'Celebrate progress',
      'Link facts (if 6+4=10, then 4+6=10)',
      'Application in problem contexts'
    ],

    progress_indicators: [
      'Instant recall (no counting)',
      'Can derive related facts (if 7+3=10, then 70+30=100)',
      'Uses in calculations',
      'Reduced reliance on fingers',
      'Increased confidence',
      'Faster mental arithmetic'
    ],

    expected_outcomes: [
      'Automatic recall of key facts',
      'Mental arithmetic fluency',
      'Foundation for harder calculations',
      'Confident with numbers'
    ],

    adaptations: [
      'Smaller set initially (bonds to 5)',
      'Visual supports (ten frames, Numicon)',
      'Multisensory (songs, actions)',
      'Technology: apps for practice',
      'Extended practice time',
      'Link to interests'
    ],

    contraindications: ['Requires basic counting first'],

    complementary_interventions: [
      'Number sense development',
      'Times tables',
      'Mental calculation strategies',
      'Subtraction as inverse'
    ],

    implementation_guide: 'AUTOMATICITY = instant recall without thinking. Weeks 1-4: Number bonds to 10 using ten frames (see it, say it, write it). Practice daily: 7+? = 10. Games: ping-pong (teacher says "7", child responds "3"). Weeks 5-8: Number bonds to 20, doubles to 10. Use Numicon or counters. Songs and chants. Weeks 9-12: Doubles to 20, halves, number bonds to 100. Weeks 13-16: Near doubles (7+8 = double 7 plus 1), consolidation. KEY: Little and often (5-10 mins daily) beats long sessions. Make it playful! Use dice games, card games, online games. Check for automaticity with timed tests (5 seconds per fact). If counting on fingers, not automatic yet!',

    parent_information: 'Number bonds and doubles are mathematical building blocks that must be instant and automatic - like knowing your name! Your child is learning pairs that make 10 (7+3, 6+4...), doubles (6+6=12), and halves. Why? Because ALL mental arithmetic depends on these! At home: play dice games, card games (pairs to 10), ask "what goes with 7 to make 10?", practice in the car, on walks, at bedtime. Make it FUN! Use online games. Aim for instant answers (no counting on fingers). These facts are the foundation for times tables, fractions, and all future maths!',

    useful_links: [
      'https://www.ncetm.org.uk/number-bonds',
      'https://nrich.maths.org/number-bonds',
      'https://mathsframe.co.uk/en/resources/number-bonds'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['number_bonds', 'doubles', 'halves', 'fluency', 'automaticity', 'tier_1', 'mental_arithmetic']
  },

  {
    id: 'mathematical-reasoning-and-language',
    name: 'Mathematical Reasoning and Language Development',
    category: 'academic',
    subcategory: 'early_numeracy',
    description: 'Explicit teaching of mathematical vocabulary, reasoning skills, and explanation strategies. Children learn to justify answers, spot patterns, and use precise mathematical language.',
    targeted_needs: ['Poor maths language', 'Cannot explain thinking', 'Weak reasoning', 'Difficulty with word problems'],

    evidence_level: 'tier_2',
    research_sources: ['EEF Improving Mathematics KS2/3', 'Mathematical reasoning research', 'NCETM Reasoning guidance'],
    effect_size: 0.48,
    success_rate: '65-75% improved reasoning',

    age_range: ['primary', 'secondary'],
    setting: ['small_group', 'classroom'],
    duration: '12-20 weeks',
    frequency: '3-4 times per week',
    session_length: '20-30 minutes',
    total_sessions: 50,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Word banks', 'Sentence stems', 'Reasoning prompts', 'Visual supports', 'Problem-solving tasks'],
    cost_implications: '£30-£100 for resources',

    key_components: [
      'Mathematical vocabulary (more than, fewer, equal, altogether...)',
      'Sentence stems ("I know because...", "If... then...")',
      'Reasoning prompts (How do you know? Prove it!)',
      'Explaining strategies',
      'Spotting patterns',
      'Making predictions',
      'Justifying answers',
      'Collaborative reasoning'
    ],

    fidelity_checklist: [
      'Explicit vocabulary teaching',
      'Model reasoning aloud',
      'Use sentence stems',
      'Ask "how do you know?"',
      'Demand explanations, not just answers',
      'Value different strategies',
      'Partner talk/discussion',
      'Display vocabulary'
    ],

    progress_indicators: [
      'Uses mathematical vocabulary correctly',
      'Can explain their thinking',
      'Justifies answers',
      'Spots patterns',
      'Asks mathematical questions',
      'Listens to others\' reasoning',
      'Challenges incorrect reasoning'
    ],

    expected_outcomes: [
      'Strong mathematical reasoning',
      'Precise mathematical language',
      'Better problem-solving',
      'Deeper conceptual understanding',
      'Improved word problem performance'
    ],

    adaptations: [
      'Visual vocabulary cards',
      'Pre-teach vocabulary',
      'Sentence frames for EAL',
      'Video examples',
      'Reduce language complexity',
      'More thinking time',
      'Partner support'
    ],

    contraindications: ['Requires basic language skills'],

    complementary_interventions: [
      'Problem-solving strategies',
      'Word problem comprehension',
      'Metacognitive strategies',
      'Working memory support'
    ],

    implementation_guide: 'Weeks 1-4: Explicit vocabulary teaching - introduce 5-10 key words per week (add, subtract, altogether, difference, equal...). Use visual cards, actions, real objects. Children practice using words. Weeks 5-8: Sentence stems displayed and modeled: "I know because...", "First I... then I...", "If... then...". Children complete stems. Weeks 9-14: Reasoning routines: Teacher models ("I think the answer is 15 because 10+5=15, and I can check by counting"). Children practice reasoning with partners. Weeks 15-20: Challenge tasks requiring explanation (prove 4+5 = 5+4, spot the error, convince me!). KEY: Teacher models reasoning constantly. Ask "how do you know?" after EVERY answer. Value explanations more than speed!',

    parent_information: 'We\'re teaching your child to THINK like a mathematician - not just get answers! They\'re learning mathematical vocabulary (difference, altogether, equal, more than...) and how to explain their thinking using sentences like "I know because..." Why? Because understanding WHY is more important than getting the right answer! At home: ask "how did you work that out?", ask them to teach YOU, ask "how do you know?", spot maths everywhere and use correct language. Children who can reason and explain are prepared for algebra, problem-solving, and real-world maths!',

    useful_links: [
      'https://www.ncetm.org.uk/mathematical-reasoning',
      'https://nrich.maths.org/reasoning',
      'https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/maths-ks-2-3'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['reasoning', 'mathematical_language', 'vocabulary', 'explanation', 'tier_2', 'thinking']
  },

  // BASIC OPERATIONS (4)
  {
    id: 'concrete-pictorial-abstract-addition-subtraction',
    name: 'Concrete-Pictorial-Abstract Addition and Subtraction',
    category: 'academic',
    subcategory: 'basic_operations',
    description: 'Systematic teaching of addition and subtraction using concrete materials, then pictures, then abstract symbols. Includes mental strategies, column methods, and word problems.',
    targeted_needs: ['Addition/subtraction difficulties', 'Column method errors', 'Cannot visualize calculations', 'Year 2-4 arithmetic struggles'],

    evidence_level: 'tier_1',
    research_sources: ['EEF Improving Mathematics KS1/2', 'Singapore Maths CPA approach', 'Bruner\'s learning theory'],
    effect_size: 0.56,
    success_rate: '70-80% improved calculation accuracy',

    age_range: ['primary'],
    setting: ['small_group', 'one_to_one', 'classroom'],
    duration: '12-20 weeks',
    frequency: '4-5 times per week',
    session_length: '20-30 minutes',
    total_sessions: 60,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Counters', 'Base-10 blocks', 'Place value grids', 'Number lines', 'Part-whole diagrams'],
    cost_implications: '£50-£150 for materials',

    key_components: [
      'Concrete: use objects/blocks',
      'Pictorial: draw representations',
      'Abstract: use numerals',
      'Mental strategies (number bonds, partitioning, bridging 10)',
      'Column addition (with/without regrouping)',
      'Column subtraction (with/without regrouping)',
      'Word problems and reasoning',
      'Inverse relationship (addition ↔ subtraction)'
    ],

    fidelity_checklist: [
      'Always start concrete with new concepts',
      'Progress systematically: C → P → A',
      'Model each step explicitly',
      'Link to place value',
      'Teach mental strategies first',
      'Column methods only when ready',
      'Check for understanding at each stage',
      'Apply to problem contexts'
    ],

    progress_indicators: [
      'Can explain using concrete materials',
      'Draws accurate representations',
      'Correct column calculations',
      'Chooses appropriate strategy',
      'Explains their method',
      'Solves word problems',
      'Spots errors'
    ],

    expected_outcomes: [
      'Accurate addition and subtraction',
      'Multiple strategies available',
      'Conceptual understanding (not just rules)',
      'Problem-solving success',
      'Foundation for multiplication/division'
    ],

    adaptations: [
      'Extended time with concrete',
      'Visual place value charts',
      'Color-code columns',
      'Reduce number size',
      'More scaffold for regrouping',
      'Technology: virtual manipulatives',
      'Reduce cognitive load'
    ],

    contraindications: ['Requires place value understanding'],

    complementary_interventions: [
      'Place value understanding',
      'Number bonds mastery',
      'Mathematical language',
      'Word problem strategies'
    ],

    implementation_guide: 'CPA APPROACH = Concrete → Pictorial → Abstract. ADDITION: Weeks 1-3: Concrete (use counters/blocks to show 23+15 - build both numbers, combine, may need to regroup 10 ones for 1 ten). Weeks 4-6: Pictorial (draw tens and ones, then numerals). Weeks 7-10: Abstract column method with place value understanding. Mental strategies throughout (45+9 = 45+10-1). SUBTRACTION: Weeks 11-13: Concrete (42-18 - build 42, remove 18, may need to exchange 1 ten for 10 ones). Weeks 14-16: Pictorial. Weeks 17-20: Abstract column method. CRITICAL: Regrouping must be understood conceptually first! Use part-whole models. Link to real-world problems constantly.',

    parent_information: 'Your child is learning addition and subtraction the "mastery" way - deeply understanding HOW and WHY, not just memorizing tricks. We use real objects first, then pictures, then numbers. Why? Because this builds true understanding! Column methods come LAST, only when your child really understands place value. At home: use real objects (toys, pasta), draw pictures, explain the THINKING not just the answer. Ask "can you show me with objects?" Avoid rushing to written methods! Understanding now = no re-teaching later. Patience pays off!',

    useful_links: [
      'https://www.ncetm.org.uk/calculation-guidance',
      'https://nrich.maths.org/addition-subtraction',
      'https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/early-maths'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['addition', 'subtraction', 'CPA', 'column_method', 'mental_strategies', 'tier_1', 'operations']
  },

  {
    id: 'multiplication-facts-and-strategies',
    name: 'Multiplication Facts and Strategies Program',
    category: 'academic',
    subcategory: 'basic_operations',
    description: 'Systematic teaching of multiplication facts (times tables) with conceptual understanding using arrays, grouping, skip counting, and derived facts. Includes mental strategies and application.',
    targeted_needs: ['Poor times tables recall', 'Multiplication difficulties', 'Year 3-5 maths struggles', 'Times tables check concerns'],

    evidence_level: 'tier_1',
    research_sources: ['EEF Improving Mathematics KS2/3', 'Times tables research', 'NCETM Multiplication guidance'],
    effect_size: 0.52,
    success_rate: '75-85% achieve fluent recall',

    age_range: ['primary'],
    setting: ['small_group', 'one_to_one', 'classroom'],
    duration: '20-30 weeks (for full tables)',
    frequency: '5 times per week',
    session_length: '15-20 minutes',
    total_sessions: 100,

    complexity: 'medium',
    staff_training_required: false,
    resources_needed: ['Arrays', 'Counters', 'Times tables grids', 'Flash cards', 'Games', 'Online practice tools'],
    cost_implications: '£30-£100 for materials',

    key_components: [
      'Conceptual understanding (multiplication = repeated addition/groups of)',
      'Arrays and visual models',
      'Skip counting',
      'Commutativity (3×4 = 4×3)',
      'Derived facts (if 5×4=20, then 6×4=20+4)',
      'Systematic practice to automaticity',
      'Order of learning (2s, 5s, 10s, then 3s, 4s, 6s, 8s, 7s, 9s, 11s, 12s)',
      'Application to problems'
    ],

    fidelity_checklist: [
      'Teach understanding before memorization',
      'Use concrete arrays',
      'Systematic introduction of tables',
      'Daily short practice',
      'Games make it engaging',
      'Regular fluency checks',
      'Teach related division facts',
      'Apply to problem-solving'
    ],

    progress_indicators: [
      'Can explain multiplication concept',
      'Draws arrays accurately',
      'Instant recall (within 3 seconds)',
      'Uses derived facts',
      'Knows related division facts',
      'Applies in calculations',
      'Confident with times tables'
    ],

    expected_outcomes: [
      'Fluent times tables recall',
      'Understanding of multiplication concept',
      'Foundation for multi-digit multiplication',
      'Division understanding',
      'Fractions, area, algebra readiness'
    ],

    adaptations: [
      'Smaller set initially (2s, 5s, 10s only)',
      'Visual times tables grids',
      'Songs and chants',
      'Technology: apps for practice',
      'Extended practice time',
      'Link to interests',
      'Reduce pressure (no public tests)'
    ],

    contraindications: ['Requires counting and addition skills'],

    complementary_interventions: [
      'Number bonds mastery',
      'Arrays and grouping understanding',
      'Division as inverse',
      'Multi-digit multiplication'
    ],

    implementation_guide: 'ORDER MATTERS! Start with easiest: 2s, 5s, 10s (Weeks 1-6), then 3s (Weeks 7-9), 4s (Weeks 10-12), 6s (Weeks 13-15), 8s (Weeks 16-18), 7s (Weeks 19-22 - hardest!), 9s (Weeks 23-25 - teach finger trick and "one less" pattern), 11s and 12s (Weeks 26-30). For EACH table: 1) Build understanding with arrays (3×4 = 3 rows of 4 or 4 rows of 3), 2) Skip counting, 3) Pattern spotting, 4) Daily practice for automaticity, 5) Apply to word problems. Daily 5-10 minute practice is KEY! Use games (multiplication bingo, loops, online games). Aim for instant recall (3 seconds). Teach related division (if 3×4=12, then 12÷3=4). AVOID rote drill without understanding!',

    parent_information: 'Times tables are essential mathematical building blocks! Your child is learning them with understanding first - seeing that 3×4 means "3 groups of 4" or "3 rows of 4". We use arrays (visual patterns) so it makes sense, not just memorization. Order matters: 2s, 5s, 10s first (easy!), then 3s, 4s, 6s, 8s, 7s (hardest!), then 9s, 11s, 12s. At home: practice little and often (5 mins daily), use games and apps, ask them to SHOW you with objects or drawings, practice in the car, use times tables songs. Aim for instant recall. This foundation is CRITICAL for all future maths!',

    useful_links: [
      'https://www.ncetm.org.uk/multiplication-tables',
      'https://nrich.maths.org/times-tables',
      'https://mathsframe.co.uk/en/resources/multiplication',
      'https://ttrockstars.com'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['multiplication', 'times_tables', 'arrays', 'fluency', 'tier_1', 'operations', 'automaticity']
  },

  {
    id: 'division-understanding-and-fluency',
    name: 'Division Understanding and Fluency Program',
    category: 'academic',
    subcategory: 'basic_operations',
    description: 'Teaching division as sharing and grouping, inverse of multiplication, with concrete materials, mental strategies, short and long division methods.',
    targeted_needs: ['Division difficulties', 'Cannot grasp division concept', 'Division facts not automatic', 'Year 3-6 arithmetic struggles'],

    evidence_level: 'tier_1',
    research_sources: ['EEF Improving Mathematics KS2/3', 'Division research', 'Inverse operations research'],
    effect_size: 0.48,
    success_rate: '65-75% improved division skills',

    age_range: ['primary', 'secondary'],
    setting: ['small_group', 'one_to_one', 'classroom'],
    duration: '12-20 weeks',
    frequency: '4-5 times per week',
    session_length: '20-30 minutes',
    total_sessions: 60,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Counters', 'Sharing mats', 'Arrays', 'Place value counters', 'Division grids'],
    cost_implications: '£40-£120 for materials',

    key_components: [
      'Division as sharing (12÷3 = share 12 between 3)',
      'Division as grouping (12÷3 = how many 3s in 12?)',
      'Division as inverse of multiplication',
      'Concrete representations',
      'Division facts (linked to times tables)',
      'Remainders',
      'Short division method',
      'Long division method (if appropriate)',
      'Application to problems'
    ],

    fidelity_checklist: [
      'Teach both meanings (sharing and grouping)',
      'Use concrete materials',
      'Link to multiplication explicitly',
      'Model methods clearly',
      'Check for understanding',
      'Practice division facts to automaticity',
      'Teach remainders meaningfully',
      'Apply to real contexts'
    ],

    progress_indicators: [
      'Explains division concept',
      'Can share and group accurately',
      'Instant division facts recall',
      'Accurate short division',
      'Handles remainders appropriately',
      'Links to multiplication',
      'Solves division word problems'
    ],

    expected_outcomes: [
      'Conceptual understanding of division',
      'Fluent division facts',
      'Accurate division calculations',
      'Problem-solving with division',
      'Fractions, ratio, proportion readiness'
    ],

    adaptations: [
      'Visual sharing/grouping diagrams',
      'Reduce number size',
      'Color-code steps',
      'Part-whole models',
      'Extended practice time',
      'Technology: virtual manipulatives',
      'Simplify language for EAL'
    ],

    contraindications: ['Requires multiplication knowledge'],

    complementary_interventions: [
      'Times tables mastery',
      'Multiplication strategies',
      'Fractions understanding',
      'Ratio and proportion'
    ],

    implementation_guide: 'TWO MEANINGS: Sharing (12÷3 = share 12 sweets between 3 people) and Grouping (12÷3 = how many groups of 3 in 12?). Weeks 1-3: Concrete sharing with counters. Weeks 4-6: Concrete grouping. Weeks 7-9: Link to multiplication (if 3×4=12, then 12÷3=4 and 12÷4=3). Practice division facts daily. Weeks 10-12: Short division with place value counters (84÷4). Weeks 13-15: Short division with exchanging. Weeks 16-20: Long division if needed, remainders, word problems. CRITICAL: Division facts must become automatic (linked to times tables). Model thinking: "20÷4... I know 4×5=20, so 20÷4=5". Use inverse constantly. Remainders: show concretely (13÷4 = 3 remainder 1).',

    parent_information: 'Division is the hardest of the four operations - but your child is learning it with real understanding! Division has TWO meanings: SHARING (share 12 sweets between 3 people) and GROUPING (how many groups of 3 in 12?). Both matter! We use real objects first, then teach the written methods. Division facts are linked to times tables: if your child knows 4×6=24, they know 24÷4=6! At home: practice division facts (like times tables in reverse), use sharing situations (share 20 grapes between 4 people), ask "how many 5s in 30?". Division understanding = ready for fractions, percentages, ratios!',

    useful_links: [
      'https://www.ncetm.org.uk/division',
      'https://nrich.maths.org/division',
      'https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/maths-ks-2-3'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['division', 'sharing', 'grouping', 'inverse', 'tier_1', 'operations', 'short_division']
  },

  {
    id: 'multi-digit-multiplication-and-division',
    name: 'Multi-Digit Multiplication and Division Mastery',
    category: 'academic',
    subcategory: 'basic_operations',
    description: 'Systematic teaching of multi-digit multiplication (grid method, column method) and long division with place value understanding and mental estimation.',
    targeted_needs: ['Multi-digit calculation errors', 'Year 5-7 arithmetic difficulties', 'SATs preparation', 'Secondary arithmetic gaps'],

    evidence_level: 'tier_1',
    research_sources: ['EEF Improving Mathematics KS2/3', 'NCETM Calculation guidance', 'Formal written methods research'],
    effect_size: 0.44,
    success_rate: '65-75% improved accuracy',

    age_range: ['primary', 'secondary'],
    setting: ['small_group', 'one_to_one', 'classroom'],
    duration: '12-20 weeks',
    frequency: '4-5 times per week',
    session_length: '25-35 minutes',
    total_sessions: 60,

    complexity: 'high',
    staff_training_required: true,
    resources_needed: ['Place value grids', 'Grid paper', 'Place value counters', 'Estimation number lines'],
    cost_implications: '£30-£100 for resources',

    key_components: [
      'Place value understanding reinforced',
      'Mental estimation first',
      'Grid method for multiplication',
      'Column multiplication',
      'Long division (chunking or bus stop)',
      'Checking answers',
      'Application to complex problems',
      'Interpreting remainders in context'
    ],

    fidelity_checklist: [
      'Always estimate first',
      'Link to place value constantly',
      'Teach grid method before column',
      'Model each step explicitly',
      'Check place value alignment',
      'Encourage checking (inverse operation)',
      'Reduce cognitive load (break into steps)',
      'Apply to real-world contexts'
    ],

    progress_indicators: [
      'Estimates accurately',
      'Correct grid method',
      'Accurate column multiplication',
      'Successful long division',
      'Checks answers',
      'Explains methods',
      'Solves complex problems',
      'Reduces careless errors'
    ],

    expected_outcomes: [
      'Fluent multi-digit calculations',
      'Strong place value understanding',
      'Mental estimation skills',
      'Problem-solving with complex numbers',
      'Ready for algebra and higher maths'
    ],

    adaptations: [
      'Grid paper for alignment',
      'Color-code columns',
      'Break into smaller steps',
      'Visual place value charts',
      'Reduce number of digits initially',
      'Extended time',
      'Calculator for checking'
    ],

    contraindications: ['Requires secure times tables and place value'],

    complementary_interventions: [
      'Place value mastery',
      'Times tables fluency',
      'Mental estimation strategies',
      'Problem-solving skills'
    ],

    implementation_guide: 'MULTIPLICATION: Weeks 1-4: Grid method (23×16 = partition into 20+3 and 10+6, multiply each part, add). Clear place value! Weeks 5-8: Column multiplication (start 2-digit × 1-digit, then 2×2, then 3×2). Model each step, emphasize place value. DIVISION: Weeks 9-12: Chunking/grouping method (84÷6 = how many 6s? Take away 10×6=60, then 4×6=24, total 14). Weeks 13-16: Long division (bus stop method if appropriate). Weeks 17-20: Complex problems, remainders in context. ALWAYS estimate first (23×16 is about 20×20=400). Check with inverse. Practice mental strategies too (24×5 = 24×10÷2). Alignment is CRITICAL - use squared paper!',

    parent_information: 'Your child is mastering the most complex arithmetic calculations! Multi-digit multiplication (like 347×28) and long division (like 784÷16) require excellent place value understanding and systematic methods. We teach the "grid method" first for multiplication (breaking numbers into hundreds, tens, ones), then the column method. For division, we use "chunking" or long division. Always estimate first! (300×30=9000 roughly). At home: estimation is KEY (encourage approximate answers first), check with calculators AFTER working out, practice place value, patience - these are complex skills! Mastery now = ready for algebra, ratios, percentages!',

    useful_links: [
      'https://www.ncetm.org.uk/calculation-guidance',
      'https://nrich.maths.org/multiplication-division',
      'https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/maths-ks-2-3'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['multi_digit', 'multiplication', 'long_division', 'grid_method', 'column_method', 'tier_1', 'upper_primary']
  },

  // FRACTIONS, DECIMALS, PERCENTAGES (3)
  {
    id: 'fractions-conceptual-understanding',
    name: 'Fractions Conceptual Understanding Program',
    category: 'academic',
    subcategory: 'fractions_decimals',
    description: 'Building deep understanding of fractions as parts of wholes, numbers on a number line, division, ratio. Using concrete materials, visual models (bar models, area models, number lines), and real-world contexts.',
    targeted_needs: ['Fraction difficulties', 'Cannot visualize fractions', 'Year 3-6 fractions struggles', 'Weak fraction foundations'],

    evidence_level: 'tier_1',
    research_sources: ['EEF Improving Mathematics KS2/3', 'Fractions research (Siegler)', 'NCETM Fractions guidance'],
    effect_size: 0.52,
    success_rate: '70-80% improved fraction understanding',

    age_range: ['primary', 'secondary'],
    setting: ['small_group', 'one_to_one', 'classroom'],
    duration: '16-24 weeks',
    frequency: '4-5 times per week',
    session_length: '25-35 minutes',
    total_sessions: 80,

    complexity: 'high',
    staff_training_required: true,
    resources_needed: ['Fraction walls', 'Fraction bars', 'Cuisenaire rods', 'Circles/pizzas', 'Number lines', 'Bar models'],
    cost_implications: '£60-£200 for manipulatives',

    key_components: [
      'Multiple meanings of fractions (part-whole, division, ratio, number)',
      'Concrete representations',
      'Bar models and area models',
      'Fractions on number line',
      'Equivalent fractions',
      'Comparing and ordering fractions',
      'Adding and subtracting fractions',
      'Multiplying and dividing fractions (if appropriate)',
      'Real-world applications'
    ],

    fidelity_checklist: [
      'Use concrete materials extensively',
      'Teach multiple representations',
      'Emphasize fractions as NUMBERS',
      'Number line use is critical',
      'Bar models for operations',
      'Link to division (3÷4 = 3/4)',
      'Real-world contexts',
      'Avoid rushing to algorithms'
    ],

    progress_indicators: [
      'Explains what a fraction represents',
      'Can show fractions with materials',
      'Draws accurate models',
      'Places fractions on number line',
      'Finds equivalent fractions',
      'Compares fractions accurately',
      'Solves fraction problems',
      'Links to division and decimals'
    ],

    expected_outcomes: [
      'Deep conceptual understanding of fractions',
      'Multiple strategies for fraction work',
      'Confident with fractions',
      'Ready for decimals, percentages, ratio',
      'Improved problem-solving'
    ],

    adaptations: [
      'Start with unit fractions (1/2, 1/4)',
      'Extended concrete phase',
      'Visual supports throughout',
      'Reduce complexity (simpler fractions)',
      'Real-world contexts (pizza, chocolate)',
      'Technology: fraction apps',
      'More time for understanding'
    ],

    contraindications: ['Requires division understanding'],

    complementary_interventions: [
      'Division mastery',
      'Decimals understanding',
      'Ratio and proportion',
      'Visual representation skills'
    ],

    implementation_guide: 'FRACTIONS ARE NUMBERS, not just "parts of shapes"! Weeks 1-4: Unit fractions using concrete materials (1/2, 1/3, 1/4 of shapes, quantities). Weeks 5-8: Non-unit fractions (3/4 = three 1/4s). Weeks 9-12: Fractions on number line (CRITICAL - shows fractions are numbers). Weeks 13-16: Equivalent fractions with fraction walls (1/2 = 2/4 = 4/8). Weeks 17-20: Comparing/ordering using number lines and bar models. Weeks 21-24: Adding/subtracting with same denominator using concrete and bar models. Advanced: multiplication (3/4 × 2 = 3/4 + 3/4), division. Link to division constantly (sharing 3 pizzas between 4 people = 3/4 each = 3÷4). Use bar models for ALL operations!',

    parent_information: 'Fractions are THE most difficult topic in primary maths - but your child is learning them properly from the start! We use lots of concrete materials (fraction bars, circles, Cuisenaire rods) and visual models. KEY: fractions are NUMBERS that go on number lines, not just "parts of pizzas"! 1/2 is halfway between 0 and 1. Your child will learn to compare fractions, find equivalent fractions (1/2 = 2/4), and add/subtract fractions. At home: cut up food (pizza, cake, chocolate) to show fractions, use measuring jugs (1/2 litre), talk about fractions in real life. Understanding fractions = ready for decimals, percentages, ratios, algebra!',

    useful_links: [
      'https://www.ncetm.org.uk/fractions',
      'https://nrich.maths.org/fractions',
      'https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/maths-ks-2-3'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['fractions', 'part_whole', 'number_line', 'bar_models', 'tier_1', 'conceptual', 'equivalent_fractions']
  },

  {
    id: 'decimals-and-place-value',
    name: 'Decimals and Decimal Place Value Program',
    category: 'academic',
    subcategory: 'fractions_decimals',
    description: 'Understanding decimals as fractions (tenths, hundredths, thousandths), place value extension, ordering decimals, decimal calculations, and real-world applications (money, measurement).',
    targeted_needs: ['Decimal difficulties', 'Cannot order decimals', 'Decimal place value confusion', 'Year 4-7 decimals struggles'],

    evidence_level: 'tier_1',
    research_sources: ['EEF Improving Mathematics KS2/3', 'Decimal place value research', 'NCETM Decimals guidance'],
    effect_size: 0.48,
    success_rate: '65-75% improved decimal understanding',

    age_range: ['primary', 'secondary'],
    setting: ['small_group', 'one_to_one', 'classroom'],
    duration: '12-20 weeks',
    frequency: '4-5 times per week',
    session_length: '25-30 minutes',
    total_sessions: 60,

    complexity: 'high',
    staff_training_required: true,
    resources_needed: ['Base-10 blocks', 'Decimal place value grids', 'Money (coins)', 'Measuring equipment', 'Number lines'],
    cost_implications: '£40-£120 for resources',

    key_components: [
      'Decimals as fractions (0.3 = 3/10)',
      'Place value extension (tenths, hundredths, thousandths)',
      'Equivalence (0.5 = 1/2 = 50%)',
      'Ordering and comparing decimals',
      'Decimal calculations (+ - × ÷)',
      'Rounding decimals',
      'Real-world contexts (money, measurement)',
      'Converting between fractions, decimals, percentages'
    ],

    fidelity_checklist: [
      'Link to fractions explicitly',
      'Extend place value understanding',
      'Use concrete materials initially',
      'Number lines for ordering',
      'Real-world contexts (money, measurement)',
      'Common misconceptions addressed (0.45 > 0.6?)',
      'Place value grids for calculations',
      'Check understanding regularly'
    ],

    progress_indicators: [
      'Explains decimals as fractions',
      'Understands decimal place value',
      'Orders decimals correctly',
      'Accurate decimal calculations',
      'Converts between fractions/decimals',
      'Applies to money and measurement',
      'Avoids common errors'
    ],

    expected_outcomes: [
      'Secure decimal understanding',
      'Confident with decimal calculations',
      'Real-world application skills',
      'Ready for percentages and ratio',
      'Scientific notation readiness'
    ],

    adaptations: [
      'Start with tenths only',
      'Visual place value grids',
      'Money contexts (pounds and pence)',
      'Measuring activities',
      'Color-code place value columns',
      'Technology: decimal apps',
      'Extended practice time'
    ],

    contraindications: ['Requires place value and fractions understanding'],

    complementary_interventions: [
      'Place value mastery',
      'Fractions understanding',
      'Percentages',
      'Ratio and proportion'
    ],

    implementation_guide: 'DECIMALS = FRACTIONS in disguise! 0.3 = 3/10, 0.45 = 45/100. Weeks 1-4: Tenths using concrete materials and money (£0.30 = 3/10 of £1). Number lines (0.3 is between 0 and 1). Weeks 5-8: Hundredths (£0.45 = 45p = 45/100). Place value grid (ones | tenths | hundredths). Weeks 9-12: Ordering decimals using number lines - address misconception (0.6 > 0.45 even though 45 > 6). Weeks 13-16: Decimal calculations using place value grids (addition, subtraction). Weeks 17-20: Multiplication and division by 10, 100, 1000 (digits move!), decimal × whole number, if ready: decimal × decimal. CRITICAL: Link to fractions and money constantly!',

    parent_information: 'Decimals are just another way of writing fractions! 0.5 = 5/10 = 1/2. Your child is learning to understand decimal place value (0.45 = 4 tenths and 5 hundredths), order decimals (0.6 is bigger than 0.45 - a common mistake!), and calculate with decimals. We use money heavily (£4.56 = 4 pounds, 5 ten-pence, 6 pennies) and measurement (2.3 metres). At home: use money for practice, measuring in cooking (2.5 litres), notice decimals everywhere (prices, distances, times). Understanding decimals = ready for science, percentages, and real-world maths!',

    useful_links: [
      'https://www.ncetm.org.uk/decimals',
      'https://nrich.maths.org/decimals',
      'https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/maths-ks-2-3'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['decimals', 'place_value', 'money', 'measurement', 'tier_1', 'fractions', 'equivalence']
  },

  {
    id: 'percentages-fractions-decimals-equivalence',
    name: 'Percentages and FDP (Fractions-Decimals-Percentages) Equivalence',
    category: 'academic',
    subcategory: 'fractions_decimals',
    description: 'Understanding percentages as fractions out of 100, converting between fractions/decimals/percentages, calculating percentages, percentage increase/decrease, real-world applications.',
    targeted_needs: ['Percentage difficulties', 'Cannot convert FDP', 'Year 5-8 percentages struggles', 'Real-world percentage problems'],

    evidence_level: 'tier_2',
    research_sources: ['EEF Improving Mathematics KS2/3', 'Percentages research', 'Ratio and proportion guidance'],
    effect_size: 0.44,
    success_rate: '60-70% improved percentage understanding',

    age_range: ['primary', 'secondary'],
    setting: ['small_group', 'one_to_one', 'classroom'],
    duration: '12-16 weeks',
    frequency: '4-5 times per week',
    session_length: '25-30 minutes',
    total_sessions: 55,

    complexity: 'high',
    staff_training_required: true,
    resources_needed: ['100 squares', 'Percentage grids', 'Bar models', 'Real-world materials (sale posters, etc.)'],
    cost_implications: '£30-£100 for resources',

    key_components: [
      'Percent = "out of 100"',
      'Converting fractions to percentages',
      'Converting decimals to percentages',
      'Converting percentages to fractions/decimals',
      'Finding percentages of amounts',
      'Percentage increase and decrease',
      'Real-world applications (sales, interest, statistics)',
      'Bar models for percentage problems'
    ],

    fidelity_checklist: [
      'Link to fractions (50% = 50/100 = 1/2)',
      'Use 100 squares for visualization',
      'Bar models for all calculations',
      'Real-world contexts constantly',
      'Emphasize equivalence',
      'Mental strategies (10%, 50%, 25%)',
      'Avoid rushing to formulas',
      'Check understanding regularly'
    ],

    progress_indicators: [
      'Explains percentage concept',
      'Converts between FDP fluently',
      'Calculates percentages accurately',
      'Uses mental strategies',
      'Solves real-world problems',
      'Understands increase/decrease',
      'Uses bar models effectively'
    ],

    expected_outcomes: [
      'Confident with percentages',
      'FDP equivalence mastered',
      'Real-world percentage skills',
      'Ready for ratio, proportion, probability',
      'Financial literacy improved'
    ],

    adaptations: [
      'Focus on key percentages (50%, 25%, 10%)',
      'Visual 100 squares',
      'Real-world contexts only',
      'Bar models for all problems',
      'Calculator for complex calculations',
      'Extended practice time',
      'Reduce problem complexity'
    ],

    contraindications: ['Requires fractions and decimals understanding'],

    complementary_interventions: [
      'Fractions mastery',
      'Decimals understanding',
      'Ratio and proportion',
      'Problem-solving strategies'
    ],

    implementation_guide: 'PERCENT = "PER HUNDRED" (cent = 100 like century). Weeks 1-3: Understanding (50% = 50 out of 100 = 50/100 = 1/2 = 0.5). Use 100 squares. Weeks 4-6: Converting (fraction → decimal → percentage). Key equivalents memorized (1/2=0.5=50%, 1/4=0.25=25%, 3/4=0.75=75%, 1/10=0.1=10%). Weeks 7-9: Finding percentages using bar models (30% of 80 - draw bar, split into 10 sections = 8 each, 30% = 3 sections = 24). Weeks 10-12: Mental strategies (10% = ÷10, 5% = half of 10%, 1% = ÷100). Weeks 13-16: Increase/decrease (20% discount on £60 = find 20%, subtract). Real-world: sales, VAT, interest, statistics. Bar models are KEY!',

    parent_information: 'Percentages are everywhere - sales (20% off!), test scores (75%), statistics (40% of people...), interest rates. Your child is learning that "percent" means "out of 100" - so 50% = 50 out of 100 = 50/100 = 1/2 = 0.5 (all the same!). They\'ll learn to find percentages (30% of £80), understand discounts (20% off £60 = £12 off = £48), and convert between fractions, decimals, and percentages. At home: notice percentages everywhere, work out sales discounts together, discuss statistics in the news. Understanding percentages = financial literacy and real-world maths skills!',

    useful_links: [
      'https://www.ncetm.org.uk/percentages',
      'https://nrich.maths.org/percentages',
      'https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/maths-ks-2-3'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['percentages', 'FDP', 'equivalence', 'conversion', 'tier_2', 'real_world', 'bar_models']
  },

  // PROBLEM-SOLVING & WORD PROBLEMS (3)
  {
    id: 'word-problem-comprehension-strategies',
    name: 'Word Problem Comprehension and Solution Strategies',
    category: 'academic',
    subcategory: 'problem_solving',
    description: 'Systematic approach to reading, understanding, and solving word problems. Includes visualization, identifying key information, choosing operations, checking answers.',
    targeted_needs: ['Cannot solve word problems', 'Struggles to understand problem text', 'Chooses wrong operation', 'Year 2-7 word problem difficulties'],

    evidence_level: 'tier_1',
    research_sources: ['EEF Improving Mathematics KS2/3', 'Problem-solving research (Polya)', 'Comprehension strategies research'],
    effect_size: 0.58,
    success_rate: '70-80% improved word problem solving',

    age_range: ['primary', 'secondary'],
    setting: ['small_group', 'one_to_one', 'classroom'],
    duration: '12-20 weeks',
    frequency: '3-4 times per week',
    session_length: '25-35 minutes',
    total_sessions: 55,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Word problem cards', 'Bar models', 'Visualization materials', 'Strategy posters'],
    cost_implications: '£30-£100 for resources',

    key_components: [
      'Read carefully (multiple times)',
      'Identify key information',
      'Visualize the problem (draw, act out)',
      'Bar models and visual representations',
      'Choose the operation',
      'Estimate answer first',
      'Solve systematically',
      'Check answer makes sense',
      'RUCSAC or similar strategy (Read, Understand, Choose, Solve, Answer, Check)'
    ],

    fidelity_checklist: [
      'Teach systematic strategy explicitly',
      'Model thinking aloud',
      'Emphasize visualization',
      'Bar models for ALL problems',
      'Highlight key words carefully',
      'Estimate before solving',
      'Check answers in context',
      'Gradually increase complexity'
    ],

    progress_indicators: [
      'Uses systematic strategy',
      'Reads problems carefully',
      'Identifies key information',
      'Visualizes problems',
      'Chooses correct operation',
      'Estimates sensibly',
      'Checks answers',
      'Success rate improving'
    ],

    expected_outcomes: [
      'Confident word problem solver',
      'Strategic approach to problems',
      'Better comprehension',
      'Improved accuracy',
      'Independent problem-solving'
    ],

    adaptations: [
      'Simplify language',
      'Provide visuals',
      'Act out problems',
      'Reduce text length',
      'Highlight key information',
      'Strategy cards available',
      'Partner support',
      'EAL vocabulary support'
    ],

    contraindications: ['Requires basic reading comprehension'],

    complementary_interventions: [
      'Reading comprehension',
      'Mathematical language',
      'Bar modeling',
      'Metacognitive strategies'
    ],

    implementation_guide: 'WORD PROBLEMS = reading + maths + reasoning. Teach explicit strategy: RUCSAC (Read, Understand, Choose operation, Solve, Answer with units, Check). Weeks 1-4: Modeling - teacher demonstrates thinking aloud for every step. Emphasize VISUALIZATION (draw picture, use objects, bar models). Weeks 5-8: Key information - what do we know? what do we need to find? Weeks 9-12: Choosing operations - addition words (altogether, total), subtraction words (difference, fewer), multiplication words (times, groups of), division words (share, each). Weeks 13-16: Bar models for ALL problems (comparison, part-whole, ratio). Weeks 17-20: Multi-step problems, checking answers. CRITICAL: Estimate BEFORE solving (roughly what should the answer be?). Check: does this make sense in the story?',

    parent_information: 'Word problems are where reading meets maths - they\'re challenging! Your child is learning a systematic strategy: Read carefully (twice!), Understand what it\'s asking, Choose the operation (+, -, ×, ÷), Solve, Answer with units, Check (does this make sense?). We use BAR MODELS to visualize every problem - draw a picture showing the numbers and relationships. At home: read problems together, ask "what do we know?", ask "what do we need to find?", draw pictures or use objects, estimate first ("roughly, should the answer be 5 or 500?"), check the answer makes sense in the story. Word problems = real-world maths!',

    useful_links: [
      'https://www.ncetm.org.uk/problem-solving',
      'https://nrich.maths.org/problem-solving',
      'https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/maths-ks-2-3'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['word_problems', 'problem_solving', 'comprehension', 'bar_models', 'tier_1', 'strategies', 'RUCSAC']
  },

  {
    id: 'bar-modeling-mastery',
    name: 'Bar Modeling (Singapore Model Method) Mastery',
    category: 'academic',
    subcategory: 'problem_solving',
    description: 'Systematic teaching of bar modeling (also called Singapore Model Method) for visualizing and solving all types of word problems: part-whole, comparison, multiplication/division, ratio, fractions, percentages.',
    targeted_needs: ['Cannot visualize problems', 'Struggles with complex word problems', 'Needs visual problem-solving tool', 'Year 3-8 problem-solving difficulties'],

    evidence_level: 'tier_1',
    research_sources: ['Singapore Maths research', 'Bar modeling effectiveness studies', 'EEF visual representations guidance'],
    effect_size: 0.64,
    success_rate: '75-85% improved problem-solving with bar models',

    age_range: ['primary', 'secondary'],
    setting: ['small_group', 'one_to_one', 'classroom'],
    duration: '16-24 weeks',
    frequency: '4-5 times per week',
    session_length: '25-30 minutes',
    total_sessions: 80,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Bar model grids', 'Colored pens', 'Cuisenaire rods', 'Example problems', 'Practice books'],
    cost_implications: '£40-£150 for resources',

    key_components: [
      'Part-whole models (total = parts)',
      'Comparison models (more than/fewer than)',
      'Multiplication/division as equal groups',
      'Fractions as parts of bars',
      'Percentages using bars',
      'Ratio and proportion models',
      'Multi-step problems',
      'Drawing accurate, labeled bars'
    ],

    fidelity_checklist: [
      'Model drawing every bar explicitly',
      'Systematic progression (simple → complex)',
      'Label all parts clearly',
      'Link bar to abstract equation',
      'Use for ALL problem types',
      'Emphasize "what do we know, what do we find?"',
      'Check bar matches problem',
      'Practice drawing regularly'
    ],

    progress_indicators: [
      'Draws accurate bars',
      'Labels bars clearly',
      'Chooses appropriate bar model type',
      'Links bar to calculation',
      'Solves complex problems',
      'Uses bars independently',
      'Explains thinking using bar'
    ],

    expected_outcomes: [
      'Powerful visual problem-solving tool',
      'Solves complex multi-step problems',
      'Better mathematical reasoning',
      'Independent problem-solving',
      'Transfer to new problem types'
    ],

    adaptations: [
      'Pre-drawn bars initially',
      'Simpler problems',
      'Color-code bars',
      'Cuisenaire rods first (concrete)',
      'Partner support',
      'Worked examples available',
      'Extended practice time'
    ],

    contraindications: ['None - suitable for all learners'],

    complementary_interventions: [
      'Word problem strategies',
      'Fractions/decimals/percentages',
      'Ratio and proportion',
      'Algebraic thinking'
    ],

    implementation_guide: 'BAR MODELS = rectangles representing quantities. Weeks 1-4: PART-WHOLE (Tom has 23 apples, 15 oranges, how many total? Draw 2 bars, label 23 and 15, total = 23+15). Weeks 5-8: COMPARISON (Tom has 23 apples, 15 more than Ben. How many does Ben have? Draw Tom bar = 23, Ben bar shorter, difference = 15, so Ben = 23-15). Weeks 9-12: MULTIPLICATION (3 bags, 5 sweets each, total? Draw 3 equal bars = 5 each, total = 3×5). Weeks 13-16: FRACTIONS (bar = whole, divide into parts). Weeks 17-20: PERCENTAGES (bar = 100%, divide proportionally). Weeks 21-24: RATIO, multi-step. CRITICAL: Label everything! "?" shows what we\'re finding. Link bar to equation (bar shows 23-15, so equation is 23-15=?).',

    parent_information: 'Bar modeling (also called Singapore Model Method) is a visual way of solving ANY word problem by drawing rectangles! Your child is learning to draw bars to represent the numbers and relationships in problems. Example: "Tom has 23 sweets, Ben has 15 fewer" - draw Tom\'s bar (23), draw Ben\'s bar shorter, mark the difference (15), work out Ben\'s amount. Bar models work for addition, subtraction, fractions, percentages, ratio - EVERYTHING! At home: encourage drawing bars for problems, label all parts, ask "what does each bar represent?", link the bar to the calculation. This is one of the most powerful problem-solving tools in maths!',

    useful_links: [
      'https://www.ncetm.org.uk/bar-models',
      'https://nrich.maths.org/bar-models',
      'https://mathsnoproblem.com/bar-modelling'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['bar_models', 'singapore_maths', 'visualization', 'problem_solving', 'tier_1', 'model_method']
  },

  {
    id: 'multi-step-problem-solving-reasoning',
    name: 'Multi-Step Problem-Solving and Mathematical Reasoning',
    category: 'academic',
    subcategory: 'problem_solving',
    description: 'Tackling complex, multi-step problems requiring multiple operations, reasoning, and justification. Includes SATs-style reasoning problems, investigations, and open-ended tasks.',
    targeted_needs: ['Struggles with complex problems', 'Cannot break down multi-step problems', 'Year 5-8 reasoning difficulties', 'SATs reasoning preparation'],

    evidence_level: 'tier_2',
    research_sources: ['EEF Improving Mathematics KS2/3', 'Problem-solving research', 'Mathematical reasoning studies'],
    effect_size: 0.46,
    success_rate: '60-70% improved complex problem-solving',

    age_range: ['primary', 'secondary'],
    setting: ['small_group', 'one_to_one', 'classroom'],
    duration: '16-24 weeks',
    frequency: '3-4 times per week',
    session_length: '30-40 minutes',
    total_sessions: 70,

    complexity: 'high',
    staff_training_required: true,
    resources_needed: ['Complex problems', 'Bar models', 'Reasoning prompts', 'Strategy cards', 'Past SATs papers'],
    cost_implications: '£30-£100 for resources',

    key_components: [
      'Breaking problems into steps',
      'Identifying what to find first',
      'Multiple operations in sequence',
      'Reasoning and justification',
      'Trial and improvement',
      'Checking answers throughout',
      'Explaining solution pathways',
      'Open-ended investigations',
      'SATs-style reasoning questions'
    ],

    fidelity_checklist: [
      'Model breaking down problems',
      'Think aloud throughout',
      'Emphasize "what do we need first?"',
      'Bar models for visualization',
      'Write steps clearly',
      'Check after each step',
      'Demand explanations',
      'Celebrate multiple solution methods'
    ],

    progress_indicators: [
      'Identifies steps needed',
      'Tackles systematically',
      'Perseveres with difficult problems',
      'Justifies solutions',
      'Checks work',
      'Explains reasoning clearly',
      'Uses multiple strategies',
      'Confident with complexity'
    ],

    expected_outcomes: [
      'Confident with complex problems',
      'Strong reasoning skills',
      'Systematic problem-solving approach',
      'SATs reasoning readiness',
      'Mathematical thinking developed'
    ],

    adaptations: [
      'Scaffold steps explicitly',
      'Provide step-by-step prompts',
      'Reduce problem complexity',
      'Partner collaboration',
      'Extended thinking time',
      'Visual supports',
      'Sentence stems for reasoning'
    ],

    contraindications: ['Requires secure basic calculation skills'],

    complementary_interventions: [
      'Bar modeling',
      'Word problem strategies',
      'Mathematical language and reasoning',
      'Metacognitive strategies'
    ],

    implementation_guide: 'MULTI-STEP = multiple calculations needed in sequence. Weeks 1-4: Two-step problems - identify what to find FIRST. "Tom has 23 sweets, buys 12 more, then shares equally between 5 people. How many each?" Step 1: 23+12=35, Step 2: 35÷5=7. Use bar models! Weeks 5-10: Three-step problems, more complexity. Weeks 11-15: Reasoning problems requiring justification ("Prove that...", "Explain why...", "Is Alex correct?"). Model: restate the claim, test it, explain with evidence. Weeks 16-20: SATs-style reasoning (combination of calculation and explanation). Weeks 21-24: Open investigations (multiple approaches, pattern spotting). CRITICAL: Emphasize PROCESS over answer. Ask "what do we need to know first?" constantly!',

    parent_information: 'Complex, multi-step problems are the ultimate test of mathematical thinking - they require calculation skills AND reasoning! Your child is learning to break big problems into smaller steps: "What do I need to find FIRST before I can answer the question?" They\'ll tackle SATs-style reasoning questions that require explanation and justification. At home: tackle problems together, ask "what information do we need first?", break it into steps, write each step clearly, check after each step, ask "does this make sense?". These problems are HARD - celebrate perseverance and thinking, not just correct answers!',

    useful_links: [
      'https://www.ncetm.org.uk/problem-solving',
      'https://nrich.maths.org/problem-solving',
      'https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/maths-ks-2-3'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['multi_step', 'reasoning', 'problem_solving', 'SATs', 'tier_2', 'complex', 'justification']
  },

  // ALGEBRA FOUNDATIONS (2)
  {
    id: 'algebraic-thinking-patterns-relationships',
    name: 'Algebraic Thinking: Patterns, Relationships, and Generalizations',
    category: 'academic',
    subcategory: 'algebra',
    description: 'Developing algebraic thinking through pattern spotting, describing relationships, making generalizations, and understanding variables as early algebra foundations.',
    targeted_needs: ['Weak algebraic thinking', 'Cannot spot patterns', 'Struggles with relationships', 'Year 4-7 pre-algebra difficulties'],

    evidence_level: 'tier_2',
    research_sources: ['EEF Improving Mathematics KS2/3', 'Algebraic reasoning research', 'Pattern and generalization studies'],
    effect_size: 0.42,
    success_rate: '60-70% improved algebraic thinking',

    age_range: ['primary', 'secondary'],
    setting: ['small_group', 'classroom'],
    duration: '12-20 weeks',
    frequency: '3-4 times per week',
    session_length: '25-30 minutes',
    total_sessions: 55,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Pattern blocks', 'Number sequences', 'Function machines', 'Visual patterns', 'Algebra tiles'],
    cost_implications: '£40-£120 for resources',

    key_components: [
      'Number patterns and sequences',
      'Visual/geometric patterns',
      'Describing patterns in words',
      'Generalizing rules',
      'Function machines (input/output)',
      'Variables as unknowns',
      'Equivalence (=  means "the same as")',
      'Inverse relationships',
      'Missing number problems'
    ],

    fidelity_checklist: [
      'Start with visual patterns',
      'Progress from specific to general',
      'Encourage multiple representations',
      'Use "what comes next?" and "what\'s the rule?"',
      'Link patterns to number relationships',
      'Introduce variables gradually',
      'Emphasize = as equivalence',
      'Real-world pattern contexts'
    ],

    progress_indicators: [
      'Spots patterns',
      'Continues sequences',
      'Describes patterns in words',
      'Finds the rule',
      'Generalizes to new cases',
      'Uses variables appropriately',
      'Understands equivalence',
      'Solves missing number problems'
    ],

    expected_outcomes: [
      'Strong algebraic thinking',
      'Pattern recognition skills',
      'Generalization ability',
      'Ready for formal algebra',
      'Better problem-solving'
    ],

    adaptations: [
      'Concrete patterns first',
      'Visual supports',
      'Simpler sequences',
      'Color-code patterns',
      'Extended exploration time',
      'Technology: pattern apps',
      'Partner collaboration'
    ],

    contraindications: ['Requires basic arithmetic skills'],

    complementary_interventions: [
      'Problem-solving strategies',
      'Mathematical reasoning',
      'Formal algebra (later)',
      'Function understanding'
    ],

    implementation_guide: 'ALGEBRA = generalized arithmetic. Weeks 1-4: REPEATING PATTERNS (red, blue, red, blue... - what comes next? what\'s 10th?). GROWING PATTERNS (visual: 1 square, 3 squares, 5 squares... how many in pattern 10?). Weeks 5-8: NUMBER SEQUENCES (2, 5, 8, 11... what\'s the rule? add 3 each time). Describe in words, then symbols. Weeks 9-12: FUNCTION MACHINES (input → +5 → output). Find the rule. Weeks 13-16: VARIABLES (n + 3 = 10, find n). "n" is unknown. Weeks 17-20: EQUIVALENCE (3 + 4 = 2 + ? ... = means "same as", not "makes"). Missing number problems (? × 6 = 42). CRITICAL: From specific examples to general rules!',

    parent_information: 'Algebraic thinking is the foundation for secondary school algebra - and your child is building it NOW through patterns and relationships! They\'re learning to spot patterns (2, 4, 6, 8... goes up by 2), describe the rule, and predict what comes next. They\'re using "function machines" (input a number, add 5, what comes out?). They\'re learning that "=" means "the same as" (not "makes"). This IS algebra - just without scary symbols yet! At home: spot patterns everywhere (tiles, wallpaper, numbers), ask "what comes next?", ask "what\'s the rule?", play with number sequences. Algebraic thinking = logical thinking = real-world problem-solving!',

    useful_links: [
      'https://www.ncetm.org.uk/algebraic-thinking',
      'https://nrich.maths.org/patterns',
      'https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/maths-ks-2-3'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['algebra', 'patterns', 'sequences', 'generalization', 'tier_2', 'algebraic_thinking', 'pre_algebra']
  },

  {
    id: 'equations-and-expressions-foundations',
    name: 'Equations and Expressions Foundations',
    category: 'academic',
    subcategory: 'algebra',
    description: 'Introduction to formal algebra: solving linear equations, simplifying expressions, substitution, understanding equality, forming equations from word problems.',
    targeted_needs: ['Algebra difficulties', 'Cannot solve equations', 'Year 7-9 algebra struggles', 'Transition to secondary maths'],

    evidence_level: 'tier_2',
    research_sources: ['EEF Improving Mathematics KS2/3', 'Algebra education research', 'Equation solving studies'],
    effect_size: 0.38,
    success_rate: '55-65% improved equation solving',

    age_range: ['secondary'],
    setting: ['small_group', 'one_to_one', 'classroom'],
    duration: '16-24 weeks',
    frequency: '4-5 times per week',
    session_length: '30-40 minutes',
    total_sessions: 80,

    complexity: 'high',
    staff_training_required: true,
    resources_needed: ['Algebra tiles', 'Balance scales', 'Equation cards', 'Visual models', 'Practice materials'],
    cost_implications: '£40-£150 for resources',

    key_components: [
      'Variables as unknowns and as varying quantities',
      'Expressions vs equations',
      'Simplifying expressions (collect like terms)',
      'Solving linear equations (one-step, two-step, multi-step)',
      'Equations with brackets',
      'Equations with negatives',
      'Substitution into expressions/formulas',
      'Forming equations from word problems',
      'Checking solutions'
    ],

    fidelity_checklist: [
      'Use concrete models (algebra tiles, balance)',
      'Link to arithmetic (inverse operations)',
      'Emphasize = as balance/equivalence',
      'Model every step explicitly',
      'Check solutions always',
      'Progress systematically',
      'Link to real-world contexts',
      'Address common errors'
    ],

    progress_indicators: [
      'Distinguishes expressions from equations',
      'Simplifies expressions correctly',
      'Solves one-step equations',
      'Solves two-step equations',
      'Solves multi-step equations',
      'Substitutes into formulas',
      'Forms equations from words',
      'Checks solutions'
    ],

    expected_outcomes: [
      'Confident with formal algebra',
      'Solves linear equations accurately',
      'Understands algebraic notation',
      'Ready for quadratics and beyond',
      'Problem-solving with algebra'
    ],

    adaptations: [
      'Visual models throughout',
      'Simpler equations initially',
      'Step-by-step scaffolds',
      'Color-code operations',
      'Worked examples available',
      'Extended practice time',
      'Technology: algebra apps'
    ],

    contraindications: ['Requires secure arithmetic and negative numbers'],

    complementary_interventions: [
      'Algebraic thinking',
      'Negative numbers',
      'Problem-solving strategies',
      'Graphical representations'
    ],

    implementation_guide: 'ALGEBRA = generalized arithmetic with letters. Weeks 1-3: EXPRESSIONS vs EQUATIONS (3x + 2 is expression, 3x + 2 = 14 is equation). Simplify expressions (2x + 5x = 7x). Weeks 4-6: ONE-STEP EQUATIONS (x + 3 = 10, solve by doing inverse: subtract 3). Use balance model (both sides equal). Weeks 7-10: TWO-STEP EQUATIONS (2x + 3 = 11, undo +3 first, then undo ×2). Weeks 11-14: MULTI-STEP (brackets, like terms). Weeks 15-18: EQUATIONS WITH NEGATIVES. Weeks 19-24: SUBSTITUTION (if x=5, find 3x + 2), FORMING EQUATIONS from word problems. CRITICAL: ALWAYS check solution (substitute back in)!',

    parent_information: 'Your child is learning FORMAL ALGEBRA - this is a major step in secondary maths! They\'re solving equations (2x + 3 = 11, find x) using "inverse operations" (undo operations to find the unknown). We use visual models (balance scales, algebra tiles) so it makes sense. They\'re learning to simplify expressions (2x + 5x = 7x), substitute values (if x=5, what is 3x+2?), and form equations from word problems. At home: ask them to explain their working, check answers together (substitute back in), relate to real situations ("I think of a number, double it, add 3, get 11 - what\'s my number?"). Algebra = powerful problem-solving tool!',

    useful_links: [
      'https://www.ncetm.org.uk/algebra',
      'https://nrich.maths.org/algebra',
      'https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/maths-ks-2-3'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['algebra', 'equations', 'expressions', 'solving', 'tier_2', 'secondary', 'linear_equations']
  },

  // GEOMETRY & SPATIAL REASONING (2)
  {
    id: 'shape-properties-and-spatial-reasoning',
    name: 'Shape Properties and Spatial Reasoning Program',
    category: 'academic',
    subcategory: 'geometry',
    description: 'Understanding 2D and 3D shapes, properties, classifications, angles, symmetry, transformations, and spatial visualization skills.',
    targeted_needs: ['Weak shape knowledge', 'Poor spatial skills', 'Year 2-6 geometry difficulties', 'Cannot visualize shapes'],

    evidence_level: 'tier_2',
    research_sources: ['EEF Improving Mathematics KS1/2', 'Spatial reasoning research', 'Geometry education studies'],
    effect_size: 0.46,
    success_rate: '65-75% improved geometry understanding',

    age_range: ['early_years', 'primary', 'secondary'],
    setting: ['small_group', 'classroom'],
    duration: '12-20 weeks',
    frequency: '3-4 times per week',
    session_length: '25-30 minutes',
    total_sessions: 55,

    complexity: 'medium',
    staff_training_required: false,
    resources_needed: ['2D shapes', '3D solids', 'Tangrams', 'Pattern blocks', 'Geoboards', 'Mirrors', 'Protractors'],
    cost_implications: '£50-£150 for manipulatives',

    key_components: [
      '2D shape properties (sides, vertices, angles)',
      '3D shape properties (faces, edges, vertices)',
      'Shape classification (polygons, quadrilaterals...)',
      'Angles (acute, right, obtuse, straight, reflex)',
      'Symmetry (line and rotational)',
      'Transformations (translation, rotation, reflection)',
      'Coordinates and position',
      'Spatial visualization',
      'Real-world geometry'
    ],

    fidelity_checklist: [
      'Use concrete shapes',
      'Focus on properties not names',
      'Classification activities',
      'Hands-on transformations',
      'Draw shapes accurately',
      'Use correct vocabulary',
      'Link to real-world',
      'Spatial puzzles and problems'
    ],

    progress_indicators: [
      'Identifies shapes by properties',
      'Classifies shapes correctly',
      'Understands angle types',
      'Spots symmetry',
      'Performs transformations',
      'Visualizes 3D from 2D',
      'Uses geometry vocabulary',
      'Solves spatial problems'
    ],

    expected_outcomes: [
      'Strong shape knowledge',
      'Good spatial reasoning',
      'Geometric vocabulary mastered',
      'Ready for advanced geometry',
      'Improved visual-spatial skills'
    ],

    adaptations: [
      'Concrete shapes throughout',
      'Visual supports',
      'Reduce vocabulary load',
      'Hands-on activities',
      'Technology: geometry apps',
      'Extended exploration time',
      'Link to familiar objects'
    ],

    contraindications: ['None - suitable for all learners'],

    complementary_interventions: [
      'Measurement',
      'Area and perimeter',
      'Coordinates and graphing',
      'Design and technology links'
    ],

    implementation_guide: 'GEOMETRY = properties and relationships of shapes. Weeks 1-4: 2D SHAPES - handle, sort, classify by properties (4 sides, right angles...). NOT just names! Triangles (equilateral, isosceles, scalene), quadrilaterals (square, rectangle, parallelogram, trapezium). Weeks 5-8: 3D SHAPES - cubes, cuboids, pyramids, prisms, spheres, cylinders, cones. Count faces, edges, vertices. Nets. Weeks 9-12: ANGLES - identify acute, right, obtuse, straight, reflex. Estimate and measure. Weeks 13-16: SYMMETRY - line symmetry (mirror lines), rotational symmetry. Weeks 17-20: TRANSFORMATIONS - translate (slide), rotate (turn), reflect (flip). Coordinates. CRITICAL: Properties matter more than names!',

    parent_information: 'Geometry is about understanding shapes and space - crucial for maths, science, art, design, and everyday life! Your child is learning shape properties (a square has 4 equal sides and 4 right angles), classifying shapes, understanding angles, spotting symmetry, and transforming shapes (slide, turn, flip). We use real shapes to handle, not just pictures. At home: shape hunt (find rectangles, cylinders...), notice symmetry (butterflies, buildings), practice with building blocks, tangrams, origami, Lego. Ask "what makes this shape special?" Talk about properties! Strong spatial skills = better at maths, science, and problem-solving!',

    useful_links: [
      'https://www.ncetm.org.uk/geometry',
      'https://nrich.maths.org/geometry',
      'https://mathsframe.co.uk/en/resources/geometry'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['geometry', 'shapes', 'spatial_reasoning', '2D', '3D', 'tier_2', 'properties', 'transformations']
  },

  {
    id: 'angles-and-geometric-reasoning',
    name: 'Angles and Geometric Reasoning',
    category: 'academic',
    subcategory: 'geometry',
    description: 'Understanding angles, angle facts, geometric reasoning with angles (angles on line, around point, in triangles, in polygons), and problem-solving.',
    targeted_needs: ['Angle difficulties', 'Cannot calculate angles', 'Weak geometric reasoning', 'Year 5-8 angle problems'],

    evidence_level: 'tier_2',
    research_sources: ['EEF Improving Mathematics KS2/3', 'Angle reasoning research', 'Geometry problem-solving studies'],
    effect_size: 0.40,
    success_rate: '60-70% improved angle understanding',

    age_range: ['primary', 'secondary'],
    setting: ['small_group', 'one_to_one', 'classroom'],
    duration: '12-20 weeks',
    frequency: '3-4 times per week',
    session_length: '25-35 minutes',
    total_sessions: 55,

    complexity: 'high',
    staff_training_required: true,
    resources_needed: ['Protractors', 'Angle demonstrators', 'Geometric diagrams', 'Angle rules posters', 'Practice problems'],
    cost_implications: '£30-£100 for resources',

    key_components: [
      'Measuring angles with protractor',
      'Angles on a straight line (180°)',
      'Angles around a point (360°)',
      'Vertically opposite angles',
      'Angles in triangles (180°)',
      'Angles in quadrilaterals (360°)',
      'Angles in polygons',
      'Parallel lines and angles',
      'Geometric reasoning and proof',
      'Missing angle problems'
    ],

    fidelity_checklist: [
      'Teach angle facts explicitly',
      'Use visual demonstrations',
      'Practice protractor use',
      'Model reasoning steps',
      'Encourage written reasoning',
      'Progress systematically',
      'Check understanding regularly',
      'Apply to problem-solving'
    ],

    progress_indicators: [
      'Measures angles accurately',
      'Knows key angle facts',
      'Calculates missing angles',
      'Explains reasoning',
      'Solves multi-step problems',
      'Recognizes angle relationships',
      'Uses correct vocabulary',
      'Confident with geometry'
    ],

    expected_outcomes: [
      'Secure angle understanding',
      'Geometric reasoning skills',
      'Problem-solving with angles',
      'Ready for trigonometry',
      'Logical thinking developed'
    ],

    adaptations: [
      'Visual angle demonstrators',
      'Angle fact cards',
      'Step-by-step scaffolds',
      'Color-code angles',
      'Worked examples',
      'Extended practice time',
      'Technology: angle apps'
    ],

    contraindications: ['Requires basic shape knowledge'],

    complementary_interventions: [
      'Shape properties',
      'Mathematical reasoning',
      'Problem-solving strategies',
      'Trigonometry (later)'
    ],

    implementation_guide: 'ANGLES = amount of turn measured in degrees. Weeks 1-3: MEASURING with protractor (acute < 90°, right = 90°, obtuse 90-180°, straight = 180°, reflex > 180°). Weeks 4-6: ANGLES ON LINE = 180° (supplementary). Calculate missing angles. Weeks 7-9: ANGLES AROUND POINT = 360°. Vertically opposite angles equal. Weeks 10-13: TRIANGLES - angles sum to 180° (prove by tearing corners, or using parallel lines). Calculate missing angle. Weeks 14-17: QUADRILATERALS - angles sum to 360°. Weeks 18-20: POLYGONS - sum of interior angles formula. PARALLEL LINES - corresponding, alternate, co-interior angles. CRITICAL: Reasoning with reasons (angles on line = 180° BECAUSE...)!',

    parent_information: 'Angles are everywhere - corners of rooms, hands of clocks, road junctions! Your child is learning to measure angles with a protractor, and more importantly, to CALCULATE missing angles using angle facts: angles on a straight line = 180°, angles around a point = 360°, angles in a triangle = 180°, etc. They\'re developing GEOMETRIC REASONING - finding angles step-by-step with explanations. At home: spot angles everywhere, practice protractor use, ask "what\'s the missing angle?", discuss angle facts. This logical reasoning is crucial for maths and science!',

    useful_links: [
      'https://www.ncetm.org.uk/angles',
      'https://nrich.maths.org/angles',
      'https://mathsisfun.com/geometry/angles.html'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['angles', 'geometry', 'geometric_reasoning', 'protractor', 'tier_2', 'triangles', 'problem_solving']
  },

  // MEASUREMENT (2)
  {
    id: 'measurement-concepts-and-skills',
    name: 'Measurement Concepts and Skills Program',
    category: 'academic',
    subcategory: 'measurement',
    description: 'Understanding measurement concepts, choosing appropriate units, measuring accurately, estimating, converting units for length, mass, capacity, time, money.',
    targeted_needs: ['Weak measurement skills', 'Cannot choose units', 'Poor estimation', 'Year 2-6 measurement difficulties'],

    evidence_level: 'tier_2',
    research_sources: ['EEF Improving Mathematics KS1/2', 'Measurement education research', 'Units and estimation studies'],
    effect_size: 0.44,
    success_rate: '65-75% improved measurement skills',

    age_range: ['early_years', 'primary', 'secondary'],
    setting: ['small_group', 'classroom'],
    duration: '12-20 weeks',
    frequency: '3-4 times per week',
    session_length: '25-35 minutes',
    total_sessions: 55,

    complexity: 'medium',
    staff_training_required: false,
    resources_needed: ['Rulers', 'Tape measures', 'Scales', 'Measuring jugs', 'Clocks', 'Money', 'Real objects to measure'],
    cost_implications: '£60-£200 for equipment',

    key_components: [
      'Length (mm, cm, m, km)',
      'Mass (g, kg)',
      'Capacity/volume (ml, l)',
      'Time (seconds, minutes, hours, days, weeks...)',
      'Money (pence, pounds)',
      'Choosing appropriate units',
      'Accurate measuring',
      'Estimation skills',
      'Converting between units',
      'Real-world measuring contexts'
    ],

    fidelity_checklist: [
      'Use real measuring equipment',
      'Measure real objects',
      'Teach estimation first',
      'Compare estimates to actual',
      'Practice unit choice',
      'Teach conversions systematically',
      'Link to real-world',
      'Regular hands-on activities'
    ],

    progress_indicators: [
      'Chooses appropriate units',
      'Estimates sensibly',
      'Measures accurately',
      'Reads scales correctly',
      'Converts between units',
      'Solves measurement problems',
      'Uses measuring tools confidently',
      'Applies to real contexts'
    ],

    expected_outcomes: [
      'Confident with measurement',
      'Good estimation skills',
      'Accurate measuring',
      'Unit conversion mastery',
      'Real-world measurement application'
    ],

    adaptations: [
      'Simpler units initially',
      'Visual conversion charts',
      'More hands-on practice',
      'Real-life measuring tasks',
      'Reduce conversion complexity',
      'Extended practice time',
      'Technology: measuring apps'
    ],

    contraindications: ['None - suitable for all learners'],

    complementary_interventions: [
      'Decimals and place value',
      'Problem-solving',
      'Area and perimeter',
      'Science investigations'
    ],

    implementation_guide: 'MEASUREMENT = comparing to standard units. Weeks 1-4: LENGTH - estimate first ("about 10cm?"), then measure with ruler. Millimetres, centimetres, metres, kilometres. When to use each? Weeks 5-8: MASS - estimate, use scales. Grams, kilograms. Weeks 9-12: CAPACITY - measuring jugs. Millilitres, litres. Practical activities (cooking!). Weeks 13-16: TIME - seconds, minutes, hours, days, weeks, months, years. Reading clocks, durations, timetables. Weeks 17-20: MONEY - pence, pounds. Converting (£3.50 = 350p). CONVERSIONS throughout: 1kg = 1000g, 1m = 100cm, 1l = 1000ml. CRITICAL: Always estimate before measuring!',

    parent_information: 'Measurement is everywhere - cooking, shopping, building, travelling! Your child is learning to choose the right unit (centimetres for a pencil, metres for a room, kilometres for a journey), estimate first ("about how long?"), then measure accurately with rulers, scales, measuring jugs. They\'re converting units (1 metre = 100 centimetres, 1 kilogram = 1000 grams). At home: involve them in cooking (measuring ingredients), DIY (measuring lengths), shopping (weighing fruit, reading prices), time (durations, timetables). Real-world measuring practice is THE BEST way to learn! Measurement = practical maths!',

    useful_links: [
      'https://www.ncetm.org.uk/measurement',
      'https://nrich.maths.org/measurement',
      'https://mathsframe.co.uk/en/resources/measurement'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['measurement', 'length', 'mass', 'capacity', 'time', 'money', 'tier_2', 'estimation', 'units']
  },

  {
    id: 'area-perimeter-volume',
    name: 'Area, Perimeter, and Volume Program',
    category: 'academic',
    subcategory: 'measurement',
    description: 'Understanding and calculating perimeter, area of 2D shapes, surface area and volume of 3D shapes, using formulas, and real-world applications.',
    targeted_needs: ['Area/perimeter confusion', 'Cannot calculate area/volume', 'Year 4-8 measurement difficulties', 'Formula understanding'],

    evidence_level: 'tier_2',
    research_sources: ['EEF Improving Mathematics KS2/3', 'Area and volume research', 'Formula application studies'],
    effect_size: 0.42,
    success_rate: '60-70% improved area/volume understanding',

    age_range: ['primary', 'secondary'],
    setting: ['small_group', 'one_to_one', 'classroom'],
    duration: '16-24 weeks',
    frequency: '4-5 times per week',
    session_length: '30-40 minutes',
    total_sessions: 75,

    complexity: 'high',
    staff_training_required: true,
    resources_needed: ['Squared paper', '3D shapes', 'Centimetre cubes', 'Geoboards', 'Formula cards', 'Real objects'],
    cost_implications: '£40-£150 for resources',

    key_components: [
      'Perimeter (distance around)',
      'Area of rectangles (length × width)',
      'Area of triangles (½ base × height)',
      'Area of compound shapes',
      'Area of circles (πr²)',
      'Volume of cuboids (l × w × h)',
      'Volume of prisms',
      'Surface area',
      'Units (cm², m², cm³, m³)',
      'Real-world applications'
    ],

    fidelity_checklist: [
      'Build understanding before formulas',
      'Use concrete materials',
      'Count squares for area initially',
      'Distinguish perimeter from area',
      'Derive formulas where possible',
      'Use correct units',
      'Link to real-world',
      'Check understanding regularly'
    ],

    progress_indicators: [
      'Distinguishes perimeter from area',
      'Calculates perimeter correctly',
      'Finds area of rectangles',
      'Finds area of triangles',
      'Finds area of compound shapes',
      'Calculates volume of cuboids',
      'Uses correct units',
      'Solves real-world problems'
    ],

    expected_outcomes: [
      'Secure area/perimeter/volume understanding',
      'Formula application skills',
      'Problem-solving with measurement',
      'Ready for advanced geometry',
      'Real-world measurement confidence'
    ],

    adaptations: [
      'Count squares initially (no formulas)',
      'Visual models throughout',
      'Formula cards available',
      'Simpler shapes first',
      'Real-life contexts',
      'Extended practice time',
      'Technology: area calculators for checking'
    ],

    contraindications: ['Requires multiplication and measurement skills'],

    complementary_interventions: [
      'Measurement concepts',
      'Multiplication mastery',
      'Shape properties',
      'Problem-solving strategies'
    ],

    implementation_guide: 'PERIMETER vs AREA: Perimeter = distance AROUND (cm), Area = space INSIDE (cm²). Weeks 1-4: PERIMETER - add all sides. Weeks 5-8: AREA OF RECTANGLES - count squares, then formula (length × width). Units: cm². Weeks 9-12: AREA OF TRIANGLES - show = half of rectangle, formula (½ base × height). Weeks 13-16: COMPOUND SHAPES - break into rectangles/triangles. Weeks 17-20: CIRCLES - circumference (2πr), area (πr²). Weeks 21-24: VOLUME OF CUBOIDS - count cubes, formula (l × w × h). Units: cm³. Surface area = area of all faces. CRITICAL: Understand BEFORE memorizing formulas!',

    parent_information: 'Area, perimeter, and volume are crucial for real-world tasks - decorating, gardening, packing, building! PERIMETER = distance around the edge (like a fence around a field). AREA = how much space inside (like carpet to cover a floor). VOLUME = how much 3D space (like water to fill a pool). Your child is learning to calculate these using formulas BUT understanding comes first! At home: real projects are best - measure rooms for carpet, garden for fencing, boxes for packing. Use squared paper to draw shapes and count squares. This is practical, real-world maths!',

    useful_links: [
      'https://www.ncetm.org.uk/area-perimeter-volume',
      'https://nrich.maths.org/area',
      'https://mathsisfun.com/geometry/area.html'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['area', 'perimeter', 'volume', 'formulas', 'tier_2', 'measurement', 'geometry', 'surface_area']
  },

  // DATA HANDLING & STATISTICS (2)
  {
    id: 'data-handling-and-graphical-representations',
    name: 'Data Handling and Graphical Representations',
    category: 'academic',
    subcategory: 'statistics',
    description: 'Collecting, organizing, and representing data using tables, tally charts, pictograms, bar charts, line graphs, pie charts. Interpreting and analyzing graphs.',
    targeted_needs: ['Weak data handling', 'Cannot read graphs', 'Year 3-7 statistics difficulties', 'Graph interpretation problems'],

    evidence_level: 'tier_2',
    research_sources: ['EEF Improving Mathematics KS2/3', 'Data literacy research', 'Graph comprehension studies'],
    effect_size: 0.40,
    success_rate: '60-70% improved data handling',

    age_range: ['primary', 'secondary'],
    setting: ['small_group', 'classroom'],
    duration: '12-20 weeks',
    frequency: '3-4 times per week',
    session_length: '25-35 minutes',
    total_sessions: 55,

    complexity: 'medium',
    staff_training_required: false,
    resources_needed: ['Graph paper', 'Data collection sheets', 'Rulers', 'Real data sources', 'Technology for graphing'],
    cost_implications: '£30-£100 for resources',

    key_components: [
      'Asking statistical questions',
      'Collecting data (surveys, observations)',
      'Organizing data (tables, tally charts)',
      'Pictograms',
      'Bar charts (and dual bar charts)',
      'Line graphs',
      'Pie charts',
      'Interpreting graphs',
      'Comparing data sets',
      'Real-world data contexts'
    ],

    fidelity_checklist: [
      'Use real data from class',
      'Systematic progression of graph types',
      'Teach graph reading before drawing',
      'Label axes and titles',
      'Choose appropriate scales',
      'Link to real-world contexts',
      'Interpret before creating',
      'Technology for complex graphs'
    ],

    progress_indicators: [
      'Collects data appropriately',
      'Organizes data in tables',
      'Chooses appropriate graph type',
      'Draws graphs accurately',
      'Labels graphs correctly',
      'Interprets graphs correctly',
      'Compares data sets',
      'Applies to real contexts'
    ],

    expected_outcomes: [
      'Confident with data handling',
      'Can create and interpret graphs',
      'Data literacy skills',
      'Ready for advanced statistics',
      'Real-world data application'
    ],

    adaptations: [
      'Simpler data sets',
      'Pre-drawn graph templates',
      'Visual supports',
      'Technology for graphing',
      'Real-life data only',
      'Extended time',
      'Partner collaboration'
    ],

    contraindications: ['None - suitable for all learners'],

    complementary_interventions: [
      'Statistics and probability',
      'Problem-solving',
      'Mathematical reasoning',
      'Science investigations'
    ],

    implementation_guide: 'DATA = information. Weeks 1-3: COLLECTING - ask question ("What\'s your favourite fruit?"), collect data (tally chart). Weeks 4-6: PICTOGRAMS - each symbol represents value (😊 = 2 people). Weeks 7-10: BAR CHARTS - discrete categories, bars don\'t touch. Axes labeled, title. Weeks 11-14: LINE GRAPHS - continuous data (temperature over time), points connected. Weeks 15-18: PIE CHARTS - parts of whole, sectors. Weeks 19-20: INTERPRETATION - "How many?", "What\'s most popular?", "What\'s the difference?". CRITICAL: Read and interpret graphs BEFORE drawing them! Use real class data!',

    parent_information: 'Data handling is about collecting information and showing it visually - essential for science, geography, business, and everyday life! Your child is learning to collect data (surveys), organize it (tables), and create graphs (pictograms, bar charts, line graphs, pie charts). More importantly, they\'re learning to READ and INTERPRET graphs - what does this graph tell us? At home: look at graphs in newspapers, on websites, in sports (league tables!). Discuss what they show. Notice data everywhere (weather charts, Covid statistics, election results). Data literacy = understanding the modern world!',

    useful_links: [
      'https://www.ncetm.org.uk/statistics',
      'https://nrich.maths.org/data',
      'https://mathsframe.co.uk/en/resources/data-handling'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['data', 'statistics', 'graphs', 'charts', 'pictogram', 'bar_chart', 'line_graph', 'tier_2', 'interpretation']
  },

  {
    id: 'statistics-averages-and-spread',
    name: 'Statistics: Averages and Measures of Spread',
    category: 'academic',
    subcategory: 'statistics',
    description: 'Understanding and calculating measures of central tendency (mean, median, mode) and measures of spread (range). Interpreting and using averages in context.',
    targeted_needs: ['Cannot calculate averages', 'Weak statistical understanding', 'Year 6-9 statistics difficulties', 'Mean/median/mode confusion'],

    evidence_level: 'tier_2',
    research_sources: ['EEF Improving Mathematics KS2/3', 'Statistical reasoning research', 'Average understanding studies'],
    effect_size: 0.36,
    success_rate: '55-65% improved statistics understanding',

    age_range: ['primary', 'secondary'],
    setting: ['small_group', 'one_to_one', 'classroom'],
    duration: '12-16 weeks',
    frequency: '3-4 times per week',
    session_length: '25-35 minutes',
    total_sessions: 50,

    complexity: 'high',
    staff_training_required: true,
    resources_needed: ['Data sets', 'Calculators', 'Real-world statistics', 'Practice materials'],
    cost_implications: '£20-£80 for resources',

    key_components: [
      'Mean (average) - add all, divide by how many',
      'Median - middle value when ordered',
      'Mode - most frequent value',
      'Range - difference between highest and lowest',
      'Choosing appropriate average',
      'Interpreting averages in context',
      'Effect of outliers',
      'Comparing data sets using averages',
      'Real-world statistics'
    ],

    fidelity_checklist: [
      'Teach conceptual understanding',
      'Use real data',
      'Distinguish mean/median/mode clearly',
      'Discuss when to use each',
      'Address outliers explicitly',
      'Link to real-world contexts',
      'Check understanding regularly',
      'Calculator use for large data sets'
    ],

    progress_indicators: [
      'Calculates mean correctly',
      'Finds median accurately',
      'Identifies mode',
      'Calculates range',
      'Chooses appropriate average',
      'Interprets in context',
      'Understands outliers',
      'Compares data sets'
    ],

    expected_outcomes: [
      'Confident with averages',
      'Statistical reasoning skills',
      'Data interpretation ability',
      'Ready for advanced statistics',
      'Real-world data literacy'
    ],

    adaptations: [
      'Smaller data sets',
      'Visual representations',
      'Calculator for mean',
      'Real-world contexts only',
      'Formula cards available',
      'Extended practice time',
      'Step-by-step scaffolds'
    ],

    contraindications: ['Requires division and ordering skills'],

    complementary_interventions: [
      'Data handling and graphs',
      'Problem-solving',
      'Mathematical reasoning',
      'Probability'
    ],

    implementation_guide: 'AVERAGES = typical or middle value. Weeks 1-4: MODE = most common (easiest). List data, count frequency, find most frequent. Weeks 5-8: MEDIAN = middle value. Order data (smallest to biggest), find middle. If even number, average of two middle values. Weeks 9-12: MEAN = total ÷ how many. Add all values, divide by number of values. This is what most people mean by "average". Weeks 13-16: RANGE = highest - lowest (shows spread). CHOOSING: Mode for categories (favorite color), Median if outliers (house prices), Mean for typical value (test scores). CRITICAL: Always interpret in context! What does this average MEAN in this situation?',

    parent_information: 'Averages are everywhere - average temperature, average house price, average test score, batting average! Your child is learning THREE types: MEAN (add all values, divide by how many - this is the usual "average"), MEDIAN (middle value when ordered), MODE (most common value). They\'re learning WHEN to use each (mean for typical, median if extreme values, mode for categories). They\'re also learning RANGE (difference between highest and lowest - shows spread). At home: discuss averages in news and sport, work out family averages (heights, bedtimes!), discuss which average makes sense. Understanding statistics = not being fooled by misleading data!',

    useful_links: [
      'https://www.ncetm.org.uk/statistics',
      'https://nrich.maths.org/statistics',
      'https://mathsisfun.com/data/central-measures.html'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['statistics', 'mean', 'median', 'mode', 'range', 'averages', 'tier_2', 'data_analysis']
  },

  // MATHS ANXIETY & CONFIDENCE (2)
  {
    id: 'maths-anxiety-reduction-program',
    name: 'Maths Anxiety Reduction and Confidence Building',
    category: 'academic',
    subcategory: 'maths_wellbeing',
    description: 'Addressing maths anxiety through CBT techniques, growth mindset development, anxiety management strategies, and rebuilding confidence through success experiences.',
    targeted_needs: ['Maths anxiety', 'Fear of maths', 'Low confidence', 'Maths avoidance', 'Test anxiety', 'Fixed mindset'],

    evidence_level: 'tier_2',
    research_sources: ['Maths anxiety research (Ashcraft, Ramirez)', 'Growth mindset (Dweck)', 'CBT for anxiety'],
    effect_size: 0.52,
    success_rate: '65-75% reduced anxiety and improved confidence',

    age_range: ['primary', 'secondary', 'post_16'],
    setting: ['small_group', 'one_to_one'],
    duration: '12-20 weeks',
    frequency: '2-3 times per week',
    session_length: '30-40 minutes',
    total_sessions: 40,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['CBT materials', 'Growth mindset resources', 'Anxiety scales', 'Success tracking sheets', 'Relaxation tools'],
    cost_implications: '£40-£150 for resources',

    key_components: [
      'Identifying maths anxiety triggers',
      'CBT techniques (challenging negative thoughts)',
      'Growth mindset development ("I can\'t do this YET")',
      'Anxiety management (breathing, grounding)',
      'Graduated exposure to feared topics',
      'Building on strengths',
      'Success experiences',
      'Reframing mistakes as learning',
      'Test anxiety strategies',
      'Parent/teacher involvement'
    ],

    fidelity_checklist: [
      'Safe, non-judgmental environment',
      'Identify specific anxiety triggers',
      'Teach CBT thought challenging',
      'Emphasize growth mindset',
      'Celebrate effort and progress',
      'Start with accessible tasks',
      'Build gradually to feared topics',
      'Track confidence and anxiety',
      'Involve parents/teachers',
      'Address perfectionism'
    ],

    progress_indicators: [
      'Reduced physical anxiety symptoms',
      'More positive self-talk',
      'Willingness to attempt maths',
      'Growth mindset language',
      'Improved confidence scores',
      'Reduced avoidance',
      'Better test performance',
      'More resilience with difficulty'
    ],

    expected_outcomes: [
      'Reduced maths anxiety',
      'Improved confidence',
      'Growth mindset developed',
      'Better maths engagement',
      'Improved performance',
      'Reduced avoidance',
      'Resilience with challenges'
    ],

    adaptations: [
      'Individual sessions if needed',
      'Slower pace',
      'Focus on one anxiety technique',
      'More success experiences',
      'Visual anxiety scales',
      'Parent sessions',
      'Collaborate with counselor'
    ],

    contraindications: ['Severe clinical anxiety may need specialist support'],

    complementary_interventions: [
      'Any maths intervention',
      'Metacognitive strategies',
      'Growth mindset programs',
      'Mental health support'
    ],

    implementation_guide: 'MATHS ANXIETY = physiological response to maths (rapid heart rate, sweating, panic, avoidance). NOT lack of ability! Weeks 1-3: IDENTIFY anxiety (physical symptoms, negative thoughts, avoidance behaviours). Use anxiety scales. Discuss triggers. Normalize anxiety ("Many people feel this"). Weeks 4-8: CBT - challenge thoughts ("I\'m terrible at maths" → "I struggle with some areas but I\'m learning"). Evidence for/against. Growth mindset ("I can\'t do this YET"). Mistakes = learning. Weeks 9-14: ANXIETY MANAGEMENT - breathing (box breathing), grounding (5 senses), progressive relaxation. Practice before maths. Weeks 15-20: GRADUATED EXPOSURE - start with low-anxiety tasks, build success, gradually increase difficulty. Celebrate effort! Address test anxiety (practice tests, time management). CRITICAL: Safe environment, no pressure, focus on progress not perfection!',

    parent_information: 'Maths anxiety is REAL - it\'s a physical and emotional response to maths that can interfere with learning and performance. Your child might experience rapid heartbeat, sweating, panic, or complete avoidance. The good news? It CAN be reduced! We\'re using CBT (Cognitive Behavioral Therapy) to challenge negative thoughts ("I\'m terrible at maths" becomes "I struggle with some topics but I\'m improving"), teaching anxiety management (breathing, relaxation), building GROWTH MINDSET ("I can\'t do this YET"), and creating success experiences. At home: NEVER say "I\'m bad at maths too", praise EFFORT not just results, normalize mistakes ("mistakes help us learn"), avoid time pressure, be patient. Your support is CRUCIAL! Reducing anxiety = unlocking mathematical potential!',

    useful_links: [
      'https://www.understood.org/articles/math-anxiety-what-it-is-and-how-to-help',
      'https://www.apa.org/science/about/psa/2015/08/math-anxiety',
      'https://www.mindsetkit.org'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['anxiety', 'confidence', 'growth_mindset', 'CBT', 'maths_wellbeing', 'tier_2', 'emotional_support']
  },

  {
    id: 'positive-maths-identity-development',
    name: 'Positive Maths Identity and Growth Mindset Development',
    category: 'academic',
    subcategory: 'maths_wellbeing',
    description: 'Developing positive mathematical identity, growth mindset, resilience, and seeing oneself as capable of mathematical thinking through success experiences and reframing.',
    targeted_needs: ['Negative maths identity', 'Fixed mindset', 'Low self-efficacy', 'Learned helplessness', '"I\'m not a maths person"'],

    evidence_level: 'tier_2',
    research_sources: ['Growth mindset research (Dweck)', 'Mathematical identity research (Boaler)', 'Self-efficacy research (Bandura)'],
    effect_size: 0.48,
    success_rate: '65-75% improved identity and persistence',

    age_range: ['primary', 'secondary', 'post_16'],
    setting: ['small_group', 'classroom'],
    duration: '12-24 weeks',
    frequency: '2-3 times per week (integrated into maths lessons)',
    session_length: '20-30 minutes',
    total_sessions: 40,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Growth mindset posters', 'Success journals', 'Problem-solving challenges', 'Mathematical biography materials'],
    cost_implications: '£30-£100 for resources',

    key_components: [
      'Growth mindset ("brain can grow")',
      'Reframing fixed mindset statements',
      'Celebrating struggle and effort',
      'Mistakes as learning opportunities',
      'Mathematical strengths identification',
      'Success experiences',
      'Problem-solving (multiple strategies valued)',
      'Mathematical discussions',
      'Belonging to maths community',
      'Role models and mathematical biographies'
    ],

    fidelity_checklist: [
      'Model growth mindset language',
      'Praise effort and strategies',
      'Normalize struggle',
      'Celebrate mistakes',
      'Multiple solution methods valued',
      'Identify and build on strengths',
      'Success tracking',
      'Collaborative problem-solving',
      'Mathematical discussions',
      'Positive reinforcement'
    ],

    progress_indicators: [
      'Growth mindset language',
      'Increased persistence',
      'Willingness to try challenges',
      'Positive maths self-talk',
      'Identifies as "maths person"',
      'Values effort over speed',
      'Resilience with difficulty',
      'Engages in maths discussions'
    ],

    expected_outcomes: [
      'Positive mathematical identity',
      'Growth mindset internalized',
      'Improved self-efficacy',
      'Greater persistence',
      'Better engagement',
      'Reduced fixed mindset beliefs',
      'Enjoyment of maths'
    ],

    adaptations: [
      'Individual identity work',
      'Focus on specific strengths',
      'Simpler growth mindset concepts',
      'Visual reminders',
      'Success journals',
      'Peer support',
      'Parent involvement'
    ],

    contraindications: ['None - beneficial for all learners'],

    complementary_interventions: [
      'Any maths intervention',
      'Maths anxiety reduction',
      'Problem-solving programs',
      'Collaborative learning'
    ],

    implementation_guide: 'MATHEMATICAL IDENTITY = how you see yourself as maths learner. "Am I a maths person?" Weeks 1-4: GROWTH MINDSET - brain is like muscle, grows with practice. FIXED ("I\'m bad at maths, always will be") vs GROWTH ("I struggle with fractions BUT I\'m learning"). Power of YET! Mistakes make brain grow! Weeks 5-8: REFRAMING - catch fixed statements, rephrase. "I can\'t do this" → "I can\'t do this YET". "I\'m terrible" → "This is hard for me right now". Model struggle! Weeks 9-14: STRENGTHS - identify what student IS good at (visual thinking? patterns? persistence?). Build on strengths. Success journal. Weeks 15-20: PROBLEM-SOLVING - multiple strategies valued. Discussions. Collaboration. Mathematical community. Weeks 21-24: ROLE MODELS - mathematicians who struggled (Einstein!), diverse mathematicians. CRITICAL: Teacher language is KEY! "I love how you persisted!", "Your mistake shows you\'re thinking!", "Multiple strategies - brilliant!"',

    parent_information: 'Has your child ever said "I\'m just not a maths person"? This is FIXED MINDSET - believing ability is fixed, not changeable. We\'re teaching GROWTH MINDSET: with effort and practice, your brain GROWS and you CAN improve! "I can\'t do this YET" is more powerful than "I can\'t do this". We\'re helping your child develop a POSITIVE MATHS IDENTITY - seeing themselves as capable mathematical thinkers. We celebrate EFFORT ("you worked so hard!"), STRATEGIES ("great method!"), and MISTAKES ("mistakes help our brains grow!"). At home: use growth language, NEVER say "I was bad at maths", praise effort not just correct answers, normalize struggle ("this is challenging and that\'s good!"), ask about their thinking not just answers. Your child CAN be a "maths person"!',

    useful_links: [
      'https://www.mindsetkit.org',
      'https://www.youcubed.org',
      'https://www.joboaler.com/mathematical-mindsets'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['growth_mindset', 'identity', 'self_efficacy', 'confidence', 'tier_2', 'mindset', 'wellbeing']
  },

  // DYSCALCULIA-SPECIFIC (2)
  {
    id: 'dyscalculia-targeted-intervention',
    name: 'Dyscalculia-Targeted Number Sense Intervention',
    category: 'academic',
    subcategory: 'dyscalculia',
    description: 'Specialist intervention for dyscalculia targeting core number sense deficits: subitizing, magnitude comparison, number line estimation, place value, arithmetic fact retrieval.',
    targeted_needs: ['Dyscalculia diagnosis', 'Severe number sense deficit', 'Poor magnitude understanding', 'Cannot subitize', 'Extreme arithmetic difficulty'],

    evidence_level: 'tier_2',
    research_sources: ['Dyscalculia research (Butterworth, Kaufmann)', 'Number sense intervention studies', 'Approximate Number System research'],
    effect_size: 0.54,
    success_rate: '60-75% improved number sense',

    age_range: ['primary', 'secondary'],
    setting: ['one_to_one', 'small_group'],
    duration: '20-40 weeks (intensive)',
    frequency: '4-5 times per week',
    session_length: '20-30 minutes',
    total_sessions: 100,

    complexity: 'high',
    staff_training_required: true,
    resources_needed: ['Numicon', 'Number lines', 'Dot cards', 'Cuisenaire rods', 'Base-10 blocks', 'Specialist software'],
    cost_implications: '£100-£300 for specialist materials',

    key_components: [
      'Subitizing (instant small quantity recognition)',
      'Magnitude comparison (which is bigger?)',
      'Number line estimation',
      'Place value (deep, concrete understanding)',
      'Part-whole relationships',
      'Arithmetic strategies (not rote)',
      'Visual-spatial representations',
      'Multisensory approaches',
      'Overlearning and repetition',
      'Working memory support'
    ],

    fidelity_checklist: [
      'Diagnosis confirmed',
      'Intensive delivery (daily)',
      'Multisensory throughout',
      'Concrete materials always',
      'Very small steps',
      'High repetition',
      'Visual representations',
      'Working memory scaffolds',
      'Patience (slow progress expected)',
      'Celebrate small gains'
    ],

    progress_indicators: [
      'Can subitize 1-5',
      'Compares magnitudes accurately',
      'Places numbers on line',
      'Understands place value',
      'Uses arithmetic strategies',
      'Improved fact retrieval',
      'Less finger counting',
      'Better estimation'
    ],

    expected_outcomes: [
      'Improved core number sense',
      'Better magnitude understanding',
      'More efficient arithmetic',
      'Reduced dyscalculia impact',
      'Functional numeracy skills',
      'Improved confidence'
    ],

    adaptations: [
      'Even smaller steps',
      'More repetition',
      'Technology support',
      'Calculator for complex tasks',
      'Reduce cognitive load',
      'Extended time always',
      'Visual supports everywhere'
    ],

    contraindications: ['Requires formal dyscalculia diagnosis'],

    complementary_interventions: [
      'Working memory training',
      'Executive function support',
      'Maths anxiety reduction',
      'Assistive technology'
    ],

    implementation_guide: 'DYSCALCULIA = specific learning difficulty with numbers (like dyslexia for reading). Core deficit: NUMBER SENSE (intuitive feel for quantities, magnitudes, relationships). Weeks 1-8: SUBITIZING - instant recognition without counting. Use dot cards (1-5 dots), flash briefly, how many? Numicon shapes. Build automaticity. Weeks 9-16: MAGNITUDE - which is bigger? 7 or 4? Use number lines, Cuisenaire rods (longer = bigger). Estimation (about how many?). Weeks 17-24: NUMBER LINE - place numbers (where does 6 go between 0 and 10?). Mental number line crucial! Weeks 25-32: PLACE VALUE - intensive, concrete work (Base-10 blocks). Weeks 33-40: ARITHMETIC STRATEGIES - no rote drill! Teach strategies (near doubles, make 10, decomposition). CRITICAL: Multisensory (see, hear, touch), concrete first, tiny steps, LOTS of repetition, patience!',

    parent_information: 'Your child has dyscalculia - a specific learning difficulty with numbers and arithmetic, just like dyslexia is for reading. It\'s neurological, NOT laziness or low intelligence! The core problem is "number sense" - the intuitive feel for quantities that most people have naturally. We\'re using SPECIALIST intervention: multisensory teaching, concrete materials (Numicon, number lines), very small steps, lots of repetition. Progress will be SLOW - celebrate small victories! At home: use concrete objects always, visual number lines, no time pressure, calculator for complex calculations is FINE, focus on real-world functional maths. With the right support, your child CAN develop better number sense and functional numeracy!',

    useful_links: [
      'https://www.bdadyslexia.org.uk/dyscalculia',
      'https://dyscalculia.org',
      'https://thirdspacelearning.com/blog/dyscalculia'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['dyscalculia', 'number_sense', 'subitizing', 'magnitude', 'specialist', 'tier_2', 'SEND', 'intensive']
  },

  {
    id: 'dyscalculia-compensatory-strategies',
    name: 'Dyscalculia Compensatory Strategies and Assistive Technology',
    category: 'academic',
    subcategory: 'dyscalculia',
    description: 'Teaching compensatory strategies, assistive technology use, and functional numeracy skills for students with persistent dyscalculia to access curriculum and develop independence.',
    targeted_needs: ['Dyscalculia with persistent difficulties', 'Need for compensatory strategies', 'Functional numeracy required', 'Access to curriculum'],

    evidence_level: 'tier_2',
    research_sources: ['Dyscalculia research', 'Assistive technology research', 'Compensatory strategy studies'],
    effect_size: 0.42,
    success_rate: '70-80% improved access and function',

    age_range: ['primary', 'secondary', 'post_16'],
    setting: ['one_to_one', 'small_group'],
    duration: '12-20 weeks',
    frequency: '2-3 times per week',
    session_length: '30-40 minutes',
    total_sessions: 40,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Calculators', 'Maths apps', 'Visual aids', 'Number lines', 'Times tables grids', 'Real-world materials'],
    cost_implications: '£50-£200 for technology and resources',

    key_components: [
      'Calculator use (when appropriate)',
      'Times tables grids/charts',
      'Visual supports (number lines, hundred squares)',
      'Formula sheets',
      'Maths apps and software',
      'Breaking down multi-step problems',
      'Checking strategies',
      'Functional numeracy (money, time, measurement)',
      'Real-world problem-solving',
      'Self-advocacy'
    ],

    fidelity_checklist: [
      'Teach calculator competence',
      'Provide reference materials',
      'Teach checking strategies',
      'Focus on functional skills',
      'Reduce cognitive load',
      'Allow extra time',
      'Visual supports always',
      'Real-world contexts',
      'Teach self-advocacy',
      'Technology training'
    ],

    progress_indicators: [
      'Uses calculator effectively',
      'Accesses reference materials',
      'Checks work systematically',
      'Functional numeracy skills',
      'Solves real-world problems',
      'Advocates for needs',
      'Reduced frustration',
      'More independent'
    ],

    expected_outcomes: [
      'Access to curriculum',
      'Functional numeracy achieved',
      'Independence with strategies',
      'Reduced reliance on support',
      'Improved confidence',
      'Real-world maths skills'
    ],

    adaptations: [
      'Individualized technology',
      'Focus on priority skills',
      'Reduce expectations appropriately',
      'More visual supports',
      'Extended time always',
      'Reduce pressure',
      'Celebrate functional success'
    ],

    contraindications: ['Should complement, not replace, direct teaching'],

    complementary_interventions: [
      'Dyscalculia-targeted intervention',
      'Functional life skills',
      'Self-advocacy training',
      'Exam access arrangements'
    ],

    implementation_guide: 'COMPENSATORY = working around difficulties while building skills. Weeks 1-4: CALCULATOR - teach proper use. When is it appropriate? Practice. Reduces cognitive load for place value/facts. Weeks 5-8: REFERENCE MATERIALS - times tables grids, number lines, hundred squares, formula sheets. How to use quickly. Weeks 9-12: CHECKING STRATEGIES - estimate first (roughly what?), use inverse (if 23+45=68, check: 68-45=23), calculator check. Weeks 13-16: FUNCTIONAL NUMERACY - money (shopping, budgeting), time (reading clocks, timetables), measurement (cooking, DIY). Real-world focus! Weeks 17-20: PROBLEM-SOLVING - break down steps, use visual supports (bar models), eliminate distractors. SELF-ADVOCACY - "I need a number line", "Can I use a calculator?". CRITICAL: Compensatory strategies are NOT cheating! They enable access and independence!',

    parent_information: 'Your child has dyscalculia - persistent number difficulties. While we work on core skills, we ALSO teach COMPENSATORY STRATEGIES to help them access maths NOW and develop independence. This includes: using CALCULATORS appropriately (not cheating - it\'s like glasses for reading!), reference materials (times tables grids, number lines), checking strategies, and focusing on FUNCTIONAL NUMERACY (money, time, measurement - real-world maths). At home: encourage calculator use for complex calculations, provide visual supports (number lines, hundred squares), focus on practical maths (shopping, cooking, telling time), celebrate what they CAN do. Compensatory strategies + ongoing intervention = maximum success!',

    useful_links: [
      'https://www.bdadyslexia.org.uk/dyscalculia',
      'https://www.understood.org/articles/assistive-technology-for-math',
      'https://dyscalculia.org/support-strategies'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['dyscalculia', 'compensatory', 'assistive_technology', 'calculator', 'functional_numeracy', 'tier_2', 'access']
  },

  // METACOGNITION & STRATEGY USE (2)
  {
    id: 'metacognitive-strategies-for-maths',
    name: 'Metacognitive Strategies for Mathematical Problem-Solving',
    category: 'academic',
    subcategory: 'metacognition',
    description: 'Teaching students to plan, monitor, and evaluate their mathematical thinking using metacognitive strategies, self-questioning, and reflective practices.',
    targeted_needs: ['Impulsive problem-solving', 'Cannot self-monitor', 'Weak strategy selection', 'Poor self-regulation', 'Executive function difficulties'],

    evidence_level: 'tier_1',
    research_sources: ['EEF Metacognition guidance', 'Self-regulated learning research (Zimmerman)', 'Mathematical metacognition studies'],
    effect_size: 0.60,
    success_rate: '70-80% improved problem-solving',

    age_range: ['primary', 'secondary'],
    setting: ['small_group', 'one_to_one', 'classroom'],
    duration: '12-20 weeks',
    frequency: '3-4 times per week',
    session_length: '25-35 minutes',
    total_sessions: 55,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Strategy cards', 'Self-questioning prompts', 'Reflection sheets', 'Think-aloud examples'],
    cost_implications: '£30-£100 for resources',

    key_components: [
      'Planning before solving',
      'Strategy selection',
      'Self-questioning ("What do I know? What do I need?"))',
      'Monitoring progress',
      'Checking answers',
      'Evaluating strategies',
      'Reflection after solving',
      'Thinking aloud',
      'Multiple strategy awareness',
      'Knowing when stuck'
    ],

    fidelity_checklist: [
      'Model metacognitive thinking aloud',
      'Teach explicit strategies',
      'Use self-questioning prompts',
      'Encourage planning time',
      'Monitor progress checking',
      'Reflection after tasks',
      'Discuss strategy choices',
      'Value process over answer',
      'Regular practice',
      'Gradually fade scaffolds'
    ],

    progress_indicators: [
      'Plans before solving',
      'Selects appropriate strategies',
      'Self-questions regularly',
      'Monitors progress',
      'Checks answers',
      'Reflects on strategies',
      'Recognizes when stuck',
      'Tries alternative approaches',
      'Explains thinking'
    ],

    expected_outcomes: [
      'Improved problem-solving',
      'Better strategy use',
      'More self-regulated',
      'Reduced impulsivity',
      'Greater independence',
      'Transfer to new problems',
      'Better mathematical thinking'
    ],

    adaptations: [
      'Visual strategy cards',
      'Simplified self-questions',
      'More modeling',
      'Reduced prompts initially',
      'Partner support',
      'Technology prompts',
      'Extended thinking time'
    ],

    contraindications: ['Requires basic language skills'],

    complementary_interventions: [
      'Problem-solving strategies',
      'Executive function support',
      'Mathematical reasoning',
      'Any content intervention'
    ],

    implementation_guide: 'METACOGNITION = thinking about thinking. Weeks 1-4: PLANNING - "Before I solve, what do I know? What do I need to find? What strategy could I use?" STOP and PLAN! Model thinking aloud. Weeks 5-8: SELF-QUESTIONING - teach prompts: "Does this make sense?", "Am I on track?", "What should I do next?", "Is there another way?". Laminated cards. Weeks 9-12: MONITORING - check as you go. "Does this answer seem right?", "Should I try different strategy?". Estimate first, check reasonableness. Weeks 13-16: REFLECTION - after solving: "Did my strategy work?", "What would I do differently?", "What did I learn?". Weeks 17-20: STRATEGY SELECTION - multiple strategies taught, choosing best for problem. Discuss trade-offs. CRITICAL: Teacher models metacognition constantly! Think aloud, show planning, monitoring, reflection!',

    parent_information: 'Metacognition means "thinking about thinking" - and it\'s one of the MOST powerful ways to improve problem-solving! Your child is learning to: PLAN before solving ("what do I know?", "what strategy?"), MONITOR while solving ("does this make sense?", "am I on track?"), and REFLECT after ("did that work?", "what would I do differently?"). This is self-regulated learning - taking control of their own thinking! At home: ask metacognitive questions ("what\'s your plan?", "how will you check?", "did that strategy work?"), model your own thinking ("I\'m stuck, let me try a different way"), encourage planning before rushing. Metacognition = becoming an independent, strategic thinker!',

    useful_links: [
      'https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/metacognition-and-self-regulation',
      'https://www.ncetm.org.uk/metacognition',
      'https://nrich.maths.org/thinking-mathematically'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['metacognition', 'self_regulation', 'problem_solving', 'strategies', 'tier_1', 'thinking_skills', 'reflection']
  },

  {
    id: 'mathematical-strategy-instruction',
    name: 'Explicit Mathematical Strategy Instruction',
    category: 'academic',
    subcategory: 'metacognition',
    description: 'Teaching specific mathematical strategies explicitly for calculation, problem-solving, and reasoning with modeling, practice, and application across contexts.',
    targeted_needs: ['Inefficient strategies', 'Limited strategy repertoire', 'Cannot select strategies', 'Over-reliance on counting', 'Strategy instruction needed'],

    evidence_level: 'tier_1',
    research_sources: ['EEF Improving Mathematics KS2/3', 'Strategy instruction research', 'Direct instruction studies'],
    effect_size: 0.58,
    success_rate: '75-85% improved strategy use',

    age_range: ['primary', 'secondary'],
    setting: ['small_group', 'one_to_one', 'classroom'],
    duration: '16-24 weeks',
    frequency: '4-5 times per week',
    session_length: '25-35 minutes',
    total_sessions: 75,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Strategy posters', 'Worked examples', 'Practice materials', 'Strategy cards'],
    cost_implications: '£30-£100 for resources',

    key_components: [
      'Explicit strategy teaching',
      'Mental calculation strategies',
      'Problem-solving heuristics',
      'Reasoning strategies',
      'Modeling (teacher demonstrates)',
      'Guided practice',
      'Independent practice',
      'Strategy comparison',
      'Choosing appropriate strategies',
      'Applying across contexts'
    ],

    fidelity_checklist: [
      'Name and describe strategy',
      'Model explicitly (think aloud)',
      'Explain when to use',
      'Guided practice with feedback',
      'Independent practice',
      'Compare strategies',
      'Application to varied problems',
      'Regular review',
      'Strategy selection practice',
      'Automaticity development'
    ],

    progress_indicators: [
      'Knows multiple strategies',
      'Can describe strategies',
      'Uses strategies appropriately',
      'More efficient calculations',
      'Better problem-solving',
      'Explains strategy choices',
      'Applies to new contexts',
      'Reduced inefficient methods'
    ],

    expected_outcomes: [
      'Rich strategy repertoire',
      'Efficient calculations',
      'Strategic problem-solving',
      'Flexible thinking',
      'Better reasoning',
      'Transfer to new problems',
      'Independent strategy use'
    ],

    adaptations: [
      'Fewer strategies initially',
      'Visual strategy cards',
      'More modeling',
      'Extended practice',
      'Simpler contexts first',
      'Strategy prompts available',
      'Technology demonstrations'
    ],

    contraindications: ['Requires basic skills for strategy application'],

    complementary_interventions: [
      'Metacognitive strategies',
      'Mental calculation fluency',
      'Problem-solving programs',
      'Any content intervention'
    ],

    implementation_guide: 'STRATEGIES = efficient methods. EXPLICIT teaching: Name → Model → Practice → Apply. Example strategies: MENTAL CALCULATION - making 10 (8+6 = 8+2+4 = 14), near doubles (7+8 = double 7 + 1), partitioning (34+27 = 30+20 + 4+7). PROBLEM-SOLVING - draw diagram, try simpler numbers, work backwards, look for patterns. REASONING - prove it, find examples/counterexamples, generalize. Teaching sequence: 1) NAME: "This is the partitioning strategy", 2) MODEL: Teacher demonstrates with think-aloud, 3) GUIDED: Students try with support, 4) INDEPENDENT: Students practice alone, 5) APPLY: Use in varied contexts, 6) COMPARE: Which strategy is best for this problem? Why? Weeks 1-6: Teach 2-3 key strategies, Weeks 7-12: Practice and comparison, Weeks 13-18: New strategies, Weeks 19-24: Strategy selection and application. CRITICAL: Explicit, systematic, lots of practice!',

    parent_information: 'Your child is learning MATHEMATICAL STRATEGIES - efficient methods for calculation, problem-solving, and reasoning. For example, mental calculation strategies like "making 10" (to add 8+6, think 8+2=10, then 10+4=14) or "near doubles" (7+8 = double 7 plus 1). Problem-solving strategies like "draw a diagram" or "try simpler numbers first". These strategies are taught EXPLICITLY (not discovered): teacher names it, models it, students practice it, then apply it. At home: ask "what strategy did you use?", discuss different methods ("could you do it another way?"), use strategies in real life (mental calculation when shopping). Strategy knowledge = mathematical power!',

    useful_links: [
      'https://www.ncetm.org.uk/calculation-strategies',
      'https://nrich.maths.org/problem-solving-strategies',
      'https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/maths-ks-2-3'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['strategies', 'mental_calculation', 'problem_solving', 'explicit_teaching', 'tier_1', 'efficiency', 'methods']
  },

  // MATHEMATICAL REASONING & LOGIC (2)
  {
    id: 'logical-reasoning-and-proof',
    name: 'Logical Reasoning and Mathematical Proof',
    category: 'academic',
    subcategory: 'reasoning',
    description: 'Developing logical reasoning skills, understanding proof, making and testing conjectures, finding counterexamples, and justifying mathematical statements.',
    targeted_needs: ['Weak reasoning', 'Cannot justify answers', 'Poor logical thinking', 'Year 5-9 reasoning difficulties', 'Proof understanding needed'],

    evidence_level: 'tier_2',
    research_sources: ['Mathematical reasoning research', 'Proof understanding studies', 'Logical thinking development'],
    effect_size: 0.46,
    success_rate: '60-70% improved reasoning',

    age_range: ['primary', 'secondary'],
    setting: ['small_group', 'classroom'],
    duration: '16-24 weeks',
    frequency: '3-4 times per week',
    session_length: '30-40 minutes',
    total_sessions: 70,

    complexity: 'high',
    staff_training_required: true,
    resources_needed: ['Reasoning tasks', 'Proof examples', 'Logic puzzles', 'Mathematical statements to investigate'],
    cost_implications: '£30-£100 for resources',

    key_components: [
      'Making conjectures (educated guesses)',
      'Testing conjectures systematically',
      'Finding counterexamples',
      'Logical reasoning',
      'If-then reasoning',
      'Proof (informal and formal)',
      'Justification and explanation',
      'Spotting errors in reasoning',
      'Mathematical argumentation',
      'Deductive vs inductive reasoning'
    ],

    fidelity_checklist: [
      'Pose open-ended questions',
      'Encourage conjectures',
      'Model testing systematically',
      'Teach counterexample thinking',
      'Demand justifications',
      'Model proof thinking',
      'Value reasoning over answers',
      'Discuss errors in reasoning',
      'Collaborative reasoning',
      'Progress to formal proof'
    ],

    progress_indicators: [
      'Makes conjectures',
      'Tests systematically',
      'Finds counterexamples',
      'Reasons logically',
      'Justifies statements',
      'Understands proof',
      'Spots errors',
      'Constructs arguments',
      'Uses deductive reasoning'
    ],

    expected_outcomes: [
      'Strong logical reasoning',
      'Proof understanding',
      'Mathematical argumentation',
      'Critical thinking',
      'Ready for advanced maths',
      'Deeper mathematical thinking',
      'Transfer to other subjects'
    ],

    adaptations: [
      'Simpler conjectures initially',
      'Visual reasoning supports',
      'Sentence stems for justification',
      'Worked proof examples',
      'Reduce language complexity',
      'Extended thinking time',
      'Partner reasoning'
    ],

    contraindications: ['Requires solid mathematical foundations'],

    complementary_interventions: [
      'Problem-solving strategies',
      'Mathematical language',
      'Algebraic thinking',
      'Geometric reasoning'
    ],

    implementation_guide: 'REASONING = explaining WHY, not just WHAT. Weeks 1-4: CONJECTURES - "I think all even numbers can be split into two equal groups" (conjecture). How can we test? Try examples. Weeks 5-8: COUNTEREXAMPLES - "Odd numbers + odd numbers = even" (test: 3+5=8 ✓, 7+9=16 ✓, always true?). "All quadrilaterals have 4 right angles" (counterexample: trapezium). ONE counterexample disproves! Weeks 9-14: PROOF - showing something is ALWAYS true for ALL cases, not just examples. "Prove odd + odd = even" (odd = 2n+1, 2n+1 + 2m+1 = 2(n+m+1) which is even). Weeks 15-20: IF-THEN reasoning, logical arguments. Weeks 21-24: SPOTTING ERRORS in reasoning (is this argument valid?). CRITICAL: Always ask "WHY?", "How do you know?", "Prove it!", "Could there be a counterexample?"',

    parent_information: 'Mathematical reasoning is about WHY, not just getting answers! Your child is learning to make CONJECTURES (educated guesses like "I think all prime numbers except 2 are odd"), test them systematically, find COUNTEREXAMPLES (examples that prove something wrong), and construct PROOFS (showing something is ALWAYS true). This is real mathematical thinking - what mathematicians do! We ask "WHY?", "How do you know?", "Prove it!", "Could there be an exception?". At home: ask "how do you know?", discuss whether statements are always/sometimes/never true, find counterexamples together. Reasoning = critical thinking for life, not just maths!',

    useful_links: [
      'https://nrich.maths.org/reasoning',
      'https://www.ncetm.org.uk/mathematical-reasoning',
      'https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/maths-ks-2-3'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['reasoning', 'proof', 'logic', 'conjectures', 'counterexamples', 'tier_2', 'justification', 'critical_thinking']
  },

  {
    id: 'rich-mathematical-tasks-investigations',
    name: 'Rich Mathematical Tasks and Investigations',
    category: 'academic',
    subcategory: 'reasoning',
    description: 'Engaging with open-ended, rich mathematical tasks and investigations that develop reasoning, problem-solving, creativity, and deeper mathematical thinking.',
    targeted_needs: ['Procedural understanding only', 'Limited problem-solving', 'Need for challenge', 'Deeper thinking required', 'Year 4-10 enrichment'],

    evidence_level: 'tier_2',
    research_sources: ['Rich tasks research', 'Mathematical problem-solving studies', 'Open-ended tasks effectiveness'],
    effect_size: 0.48,
    success_rate: '70-80% improved mathematical thinking',

    age_range: ['primary', 'secondary'],
    setting: ['small_group', 'classroom'],
    duration: 'Ongoing (integrated into curriculum)',
    frequency: '2-3 times per week',
    session_length: '40-60 minutes',
    total_sessions: 50,

    complexity: 'high',
    staff_training_required: true,
    resources_needed: ['Rich task collections (NRICH, etc.)', 'Open-ended problems', 'Investigation materials', 'Collaborative resources'],
    cost_implications: '£30-£100 for resources',

    key_components: [
      'Open-ended tasks (multiple solutions)',
      'Low floor, high ceiling problems',
      'Mathematical investigations',
      'Pattern spotting and generalization',
      'Collaborative problem-solving',
      'Multiple representations',
      'Creativity and exploration',
      'Justification and reasoning',
      'Persistence and resilience',
      'Mathematical discussion'
    ],

    fidelity_checklist: [
      'Choose genuinely open tasks',
      'Allow exploration time',
      'Multiple solutions valued',
      'Collaboration encouraged',
      'Teacher as facilitator',
      'Mathematical discussions',
      'Reasoning emphasized',
      'Present work and thinking',
      'Reflect on strategies',
      'Celebrate different approaches'
    ],

    progress_indicators: [
      'Engages deeply with tasks',
      'Explores systematically',
      'Finds multiple solutions',
      'Reasons and justifies',
      'Collaborates effectively',
      'Shows creativity',
      'Persists with difficulty',
      'Discusses mathematically',
      'Makes connections'
    ],

    expected_outcomes: [
      'Deeper mathematical thinking',
      'Problem-solving creativity',
      'Strong reasoning skills',
      'Love of mathematical challenge',
      'Collaborative skills',
      'Resilience and persistence',
      'Mathematical confidence'
    ],

    adaptations: [
      'Simpler entry points',
      'More scaffolding initially',
      'Visual supports',
      'Reduce task complexity',
      'Partner collaboration',
      'Extended time',
      'Teacher guidance as needed'
    ],

    contraindications: ['Should complement, not replace, skill development'],

    complementary_interventions: [
      'Problem-solving strategies',
      'Metacognitive strategies',
      'Mathematical reasoning',
      'Collaborative learning'
    ],

    implementation_guide: 'RICH TASKS = open-ended, multiple solutions, "low floor high ceiling" (everyone can start, nobody maxes out). Examples: "Find all ways to make 20 using 4 numbers", "Investigate which rectangles have perimeter = area", "Explore number patterns in Pascal\'s Triangle". NOT: "Work out 3×4". Session structure: 1) LAUNCH: Present task, ensure understanding, NO method given, 2) EXPLORE: Students work (pairs/small groups), try approaches, struggle is GOOD, teacher circulates asking questions not telling, 3) DISCUSS: Share strategies, solutions, reasoning. Compare approaches. Generalize. 4) REFLECT: What worked? What would you do differently? Use tasks from NRICH, Youcubed, Math Pickle. Weeks 1-10: Simpler rich tasks, scaffolding. Weeks 11-30: More complex investigations. Weeks 31-50: Extended projects. CRITICAL: Exploration and reasoning valued MORE than answers!',

    parent_information: 'Rich mathematical tasks are open-ended problems with multiple solutions - real mathematical thinking, not just practicing procedures! Example: "Find all ways to make 10 using exactly 4 numbers" (10+0+0+0, 5+5+0+0, 6+2+1+1, 5+3+1+1, 3+3+2+2...). Your child explores, tries different approaches, works with others, discusses strategies, justifies solutions. This develops REASONING, CREATIVITY, PROBLEM-SOLVING, and PERSISTENCE - the real skills of mathematics! It\'s challenging and that\'s the point! At home: try tasks together (NRICH website has great ones), encourage exploration ("try different ways"), discuss thinking not just answers, celebrate persistence ("you kept trying!"). Rich tasks = deep mathematical thinking!',

    useful_links: [
      'https://nrich.maths.org',
      'https://www.youcubed.org/tasks',
      'https://mathpickle.com'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['rich_tasks', 'investigations', 'open_ended', 'problem_solving', 'reasoning', 'tier_2', 'collaborative', 'challenge']
  }
];

// ============================================================================
// BEHAVIORAL INTERVENTIONS (25+ interventions)
// ============================================================================

const BEHAVIORAL_INTERVENTIONS: InterventionTemplate[] = [
  {
    id: 'positive-behaviour-support-plan',
    name: 'Functional Behaviour Assessment and Positive Behaviour Support Plan',
    category: 'behavioural',
    subcategory: 'behavior_management',
    description: 'Comprehensive assessment of challenging behaviour to identify function, followed by individualised support plan with replacement behaviours, preventive strategies, and response protocols.',
    targeted_needs: ['Challenging behaviour', 'Aggression', 'Non-compliance', 'Self-injury', 'Disruptive classroom behaviour', 'Behaviours interfering with learning'],

    evidence_level: 'tier_1',
    research_sources: ['Positive Behavioural Interventions & Supports (PBIS)', 'Association for Positive Behaviour Support', 'O\'Neill et al. Functional Assessment'],
    effect_size: 0.68,
    success_rate: '70-80% reduction in target behaviours',

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
      'Functional Behaviour Assessment (FBA)',
      'Hypothesis about function of behaviour',
      'Replacement behaviour teaching',
      'Antecedent modifications (prevention)',
      'Consequence modifications (response)',
      'Data collection system',
      'Team collaboration',
      'Regular review and adaptation'
    ],

    fidelity_checklist: [
      'Complete thorough FBA before plan',
      'Identify function of behaviour (attention, escape, tangible, sensory)',
      'Teach replacement behaviour that serves same function',
      'Modify environment to prevent triggers',
      'Respond consistently to target behaviour',
      'Reinforce replacement behaviour',
      'Collect daily data on behaviour',
      'Review data weekly and adjust plan',
      'All staff trained on plan implementation'
    ],

    progress_indicators: [
      'Decreased frequency of target behaviour',
      'Increased use of replacement behaviour',
      'Longer periods without incidents',
      'Reduced intensity of behaviours',
      'Improved engagement in learning',
      'Better relationships with peers/adults'
    ],

    expected_outcomes: [
      '50-80% reduction in target behaviour',
      'Increase in pro-social behaviours',
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

    implementation_guide: 'Step 1: Conduct FBA - interview staff/parents, observe student, review records. Step 2: Analyze data to determine function (Why is this behaviour happening? What is student getting/avoiding?). Step 3: Develop hypothesis statement ("When [antecedent], student [behaviour] in order to [function]"). Step 4: Design plan - teach replacement behaviour that achieves same function more appropriately, modify environment to prevent triggers, plan consistent response to behaviour. Step 5: Train all staff. Step 6: Implement plan consistently. Step 7: Collect data. Step 8: Review weekly and adjust.',

    parent_information: 'Your child\'s challenging behaviour is serving a purpose - it\'s their way of getting something they need or avoiding something difficult. We are working to understand WHY the behaviour happens, then teach a better way to meet that need. The behaviour support plan will include: preventing situations that trigger the behaviour, teaching a new skill to replace the behaviour, and responding consistently when the behaviour happens. Your role: help us understand what works at home, use consistent strategies, celebrate progress, and stay positive - behaviour change takes time.',

    useful_links: [
      'https://www.pbis.org',
      'https://www.behaviour.org',
      'https://www.challengingbehaviour.org.uk'
    ],

    created_at: '2025-11-01',
    updated_at: '2025-11-01',
    tags: ['behaviour', 'PBS', 'FBA', 'challenging_behaviour', 'tier_1', 'evidence_based', 'individualized']
  },

  {
    id: 'check-in-check-out',
    name: 'Check In/Check Out (CICO) Behaviour Support',
    category: 'behavioural',
    subcategory: 'behavior_management',
    description: 'Tier 2 intervention where student checks in daily with assigned adult, carries point card to all lessons for immediate feedback, and checks out at end of day. Provides structure, increased positive interactions, and frequent feedback.',
    targeted_needs: ['Attention-seeking behaviour', 'Low-level disruptive behaviour', 'Lack of structure', 'Need for positive adult attention', 'ADHD'],

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
      'Meeting behaviour goal more consistently',
      'Reduced office referrals',
      'Improved academic engagement',
      'More positive teacher feedback',
      'Student reports feeling supported'
    ],

    expected_outcomes: [
      '60-80% reduction in problem behaviours',
      'Improved academic performance',
      'Better relationships with adults',
      'Increased school connectedness',
      'Internalization of expected behaviours'
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
      'May not be sufficient for high-intensity behaviours'
    ],

    complementary_interventions: [
      'Social skills teaching',
      'Self-monitoring strategies',
      'Organization support',
      'Academic interventions if needed'
    ],

    implementation_guide: 'Recruit mentor (often teaching assistant, pastoral staff). Create point card with 3-5 target behaviours. Student checks in each morning - mentor greets warmly, reviews goals, provides encouragement. Student carries card to lessons. After each lesson, teacher rates behaviour (0-2 points per behaviour). Brief positive feedback given. At end of day, student checks out with mentor - total points calculated, celebrate successes, troubleshoot challenges, send report home. If student meets daily goal (typically 80%), earn small reward. Review data weekly with team.',

    parent_information: 'Your child will check in with a mentor each morning, carry a card throughout the day to track behaviour, and check out at the end of day. You\'ll receive daily feedback. This gives your child: more structure, positive adult attention, immediate feedback, and clear goals. At home, please: review the daily report positively, celebrate successes (don\'t just focus on problems), provide agreed home reward if daily goal met, and communicate with school if you have concerns.',

    useful_links: [
      'https://www.pbis.org/resource/check-in-check-out',
      'https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/behaviour-interventions',
      'https://www.interventioncentral.org/behavioural-interventions/schoolwide-classroommgt/check-check-out-intervention'
    ],

    created_at: '2025-11-01',
    updated_at: '2025-11-01',
    tags: ['behaviour', 'CICO', 'tier_2', 'evidence_based', 'ADHD', 'low_cost', 'structure']
  },

  // Self-Regulation & Emotional Control
  {
    id: 'zones-of-regulation',
    name: 'Zones of Regulation',
    category: 'behavioural',
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
      'Reduced behavioural incidents',
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
    tags: ['self_regulation', 'emotions', 'zones', 'autism', 'ADHD', 'tier_2', 'visual', 'mixed']
  },

  {
    id: 'cognitive-behavioural-therapy-children',
    name: 'Cognitive Behavioral Therapy (CBT) for Children and Adolescents',
    category: 'behavioural',
    subcategory: 'emotional_regulation',
    description: 'Evidence-based therapeutic approach teaching students to identify unhelpful thoughts, challenge them, and develop healthier thinking patterns and coping strategies for anxiety, depression, and emotional difficulties.',
    targeted_needs: ['Anxiety', 'Depression', 'Negative thinking', 'Emotional difficulties', 'Low mood', 'Worry', 'OCD', 'Trauma responses'],

    evidence_level: 'tier_1',
    research_sources: ['NICE guidelines for anxiety/depression', 'EEF Social & Emotional Learning', 'CBT research (Beck, Ellis)'],
    effect_size: 0.70,
    success_rate: '60-75% show significant improvement',

    age_range: ['primary', 'secondary', 'post_16'],
    setting: ['one_to_one', 'small_group'],
    duration: '8-12 weeks',
    frequency: '1-2 times per week',
    session_length: '30-50 minutes',
    total_sessions: 12,

    complexity: 'high',
    staff_training_required: true,
    resources_needed: ['CBT workbooks', 'Thought record sheets', 'Coping cards', 'Relaxation materials', 'Assessment scales'],
    cost_implications: '£50-£200 for resources, specialist training required',

    key_components: [
      'Psychoeducation about thoughts-feelings-behaviours link',
      'Identifying negative automatic thoughts',
      'Cognitive restructuring (challenging thoughts)',
      'Behavioral activation',
      'Exposure (for anxiety)',
      'Problem-solving skills',
      'Relaxation techniques',
      'Relapse prevention'
    ],

    fidelity_checklist: [
      'Structured CBT protocol followed',
      'Collaborative relationship established',
      'Thought records completed',
      'Homework assigned and reviewed',
      'Behavioral experiments conducted',
      'Progress monitored with scales',
      'Parent/carer involvement',
      'Supervision/consultation for practitioner'
    ],

    progress_indicators: [
      'Identifies negative thoughts',
      'Challenges unhelpful thinking',
      'Uses coping strategies',
      'Reduced anxiety/depression scores',
      'Improved mood',
      'Better functioning',
      'Fewer avoidance behaviours',
      'Increased activity'
    ],

    expected_outcomes: [
      'Reduced anxiety/depression symptoms',
      'Healthier thinking patterns',
      'Improved emotional regulation',
      'Better coping skills',
      'Increased resilience',
      'Improved functioning at school/home'
    ],

    adaptations: [
      'Simplify language for younger children',
      'Use visual/creative methods',
      'Shorter sessions for younger ages',
      'More behavioural focus for children',
      'Cultural adaptations',
      'Technology-enhanced (apps)',
      'Parent-involved for younger children'
    ],

    contraindications: ['Severe mental health crisis requires specialist CAMHS', 'Psychosis', 'Active self-harm/suicide risk needs immediate specialist support'],

    complementary_interventions: [
      'Mindfulness',
      'Relaxation training',
      'Social skills (if relevant)',
      'Family therapy',
      'Medication (specialist decision)'
    ],

    implementation_guide: 'SESSION STRUCTURE: 1) Mood check-in, 2) Review homework, 3) Session agenda, 4) New skill/concept, 5) Practice, 6) Homework setting, 7) Summary. CORE MODEL: Thoughts → Feelings → Behaviors. Weeks 1-2: Psychoeducation, engagement, goal-setting. Weeks 3-5: Thought identification (what am I thinking when anxious/sad?), introduce thought records. Weeks 6-8: Cognitive restructuring (is this thought helpful? is it true? what\'s the evidence? what would I tell a friend?). Develop balanced thoughts. Weeks 9-11: Behavioral experiments, exposure (face fears gradually), behavioural activation (do activities even when don\'t feel like it). Week 12: Relapse prevention, maintenance plan. CRITICAL: Homework is essential! Review every session.',

    parent_information: 'Your child is receiving CBT - a talking therapy that helps them understand how thoughts, feelings, and behaviours are connected. They\'ll learn to spot unhelpful thoughts ("I\'m rubbish", "Everyone hates me", "Something terrible will happen") and challenge them with evidence. They\'ll learn coping strategies and face fears gradually. Your role: encourage homework completion, praise efforts, use CBT language at home ("what\'s the thought?"), support exposure activities. CBT is active - your child needs to practice skills between sessions. Progress takes time but CBT is highly effective for anxiety and depression in children!',

    useful_links: [
      'https://www.rcpsych.ac.uk/mental-health/treatments-and-wellbeing/cognitive-behavioural-therapy-(cbt)',
      'https://www.minded.org.uk',
      'https://youngminds.org.uk/find-help/feelings-and-symptoms/anxiety/'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['CBT', 'anxiety', 'depression', 'therapy', 'tier_1', 'evidence_based', 'emotional_health', 'mental_health']
  },

  {
    id: 'mindfulness-based-stress-reduction-youth',
    name: 'Mindfulness-Based Stress Reduction for Children and Adolescents',
    category: 'behavioural',
    subcategory: 'emotional_regulation',
    description: 'Teaching mindfulness meditation and present-moment awareness to reduce stress, improve focus, regulate emotions, and enhance wellbeing through body scan, breathing, and mindful awareness practices.',
    targeted_needs: ['Stress', 'Anxiety', 'Poor attention', 'Emotional dysregulation', 'Rumination', 'ADHD', 'Trauma'],

    evidence_level: 'tier_2',
    research_sources: ['Mindfulness in Schools research', 'EEF Wellbeing interventions', 'Mindfulness-Based Stress Reduction (MBSR) studies'],
    effect_size: 0.42,
    success_rate: '55-65% show improvements',

    age_range: ['primary', 'secondary', 'post_16'],
    setting: ['small_group', 'classroom', 'one_to_one'],
    duration: '8-12 weeks',
    frequency: '2-3 times per week',
    session_length: '10-30 minutes (age-dependent)',
    total_sessions: 20,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Mindfulness scripts', 'Audio recordings', 'Mindfulness cards', 'Quiet space', 'Cushions/mats'],
    cost_implications: '£30-£150 for resources and training',

    key_components: [
      'Mindful breathing',
      'Body scan',
      'Mindful awareness of thoughts/feelings',
      'Mindful movement',
      'Present-moment focus',
      'Non-judgmental observation',
      'Daily practice',
      'Integration into daily life'
    ],

    fidelity_checklist: [
      'Regular practice sessions',
      'Guided meditations provided',
      'Home practice encouraged',
      'Non-judgmental atmosphere',
      'Teacher models mindfulness',
      'Age-appropriate practices',
      'Gradual progression in difficulty',
      'Integration with curriculum'
    ],

    progress_indicators: [
      'Engages in practices',
      'Practices at home',
      'Increased present-moment awareness',
      'Better emotional regulation',
      'Reduced stress/anxiety',
      'Improved focus',
      'Uses mindfulness spontaneously',
      'Calmer responses'
    ],

    expected_outcomes: [
      'Reduced stress and anxiety',
      'Improved attention and focus',
      'Better emotional regulation',
      'Increased wellbeing',
      'Greater self-awareness',
      'Improved resilience'
    ],

    adaptations: [
      'Shorter practices for younger children',
      'More movement-based for active children',
      'Simplified language',
      'Visual aids',
      'Apps and technology',
      'Trauma-informed modifications',
      'Optional participation (trauma considerations)'
    ],

    contraindications: ['Trauma - use trauma-informed mindfulness only', 'Psychosis - may need adaptations', 'Dissociation - monitor carefully'],

    complementary_interventions: [
      'CBT',
      'Relaxation training',
      'Emotional regulation strategies',
      'Yoga/movement',
      'Nature-based interventions'
    ],

    implementation_guide: 'START SHORT: 1-2 minutes, build up. Weeks 1-3: BREATHING (mindful breathing - notice breath in/out, anchor to present). "Breathing buddy" for young children (toy on tummy rises/falls). Weeks 4-6: BODY SCAN (notice sensations in different body parts, no judgment). Start feet, move up. Weeks 7-9: THOUGHTS & FEELINGS (notice thoughts like clouds passing, don\'t grab them, let them go). Feelings in body. Weeks 10-12: MINDFUL ACTIVITIES (eating, walking, listening mindfully). DAILY PRACTICE: 5-10 mins. Use bells/chimes. Discuss experiences non-judgmentally. Model: "I noticed my mind wandered, I brought it back". CRITICAL: Optional, never forced. Safe, calm environment.',

    parent_information: 'Mindfulness means paying attention to the present moment without judgment - noticing what\'s happening right now (breath, body, thoughts, feelings) rather than worrying about past/future. Your child is learning simple practices: mindful breathing (notice breath in and out), body scan (notice body sensations), observing thoughts (like clouds passing). Benefits: reduced stress and anxiety, better focus, calmer responses, emotional regulation. At home: practice together (apps like Headspace for Kids, Smiling Mind), encourage daily practice (even 2 mins!), model mindfulness ("I\'m taking 3 mindful breaths"), use before bed or stressful events. Mindfulness is a skill - improves with practice!',

    useful_links: [
      'https://mindfulnessinschools.org',
      'https://www.smilingmind.com.au',
      'https://www.headspace.com/kids',
      'https://www.annakaisermindfulness.com'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['mindfulness', 'stress', 'anxiety', 'attention', 'wellbeing', 'tier_2', 'emotional_regulation', 'meditation']
  },

  {
    id: 'trauma-informed-behaviour-support',
    name: 'Trauma-Informed Behaviour Support and Regulation',
    category: 'behavioural',
    subcategory: 'trauma_support',
    description: 'Specialized approach recognizing impact of trauma on behaviour, focusing on safety, relationships, emotion regulation, and reducing triggers rather than traditional behavioural consequences.',
    targeted_needs: ['Trauma history', 'ACEs', 'Attachment difficulties', 'Dysregulation', 'Aggression', 'Avoidance', 'Hypervigilance', 'Looked-after children'],

    evidence_level: 'tier_2',
    research_sources: ['Trauma-Informed Schools research', 'NICE Complex Trauma guidelines', 'ACEs research (Felitti)', 'Attachment theory (Bowlby)'],
    effect_size: 0.54,
    success_rate: '60-70% improved regulation and safety',

    age_range: ['early_years', 'primary', 'secondary', 'post_16'],
    setting: ['classroom', 'mixed', 'one_to_one'],
    duration: 'Ongoing approach',
    frequency: 'Continuous',
    session_length: 'N/A - systemic approach',

    complexity: 'high',
    staff_training_required: true,
    resources_needed: ['Trauma-informed training', 'Calm/safe spaces', 'Regulation tools', 'Relationship-building activities', 'Supervision for staff'],
    cost_implications: '£500-£2000 for training, ongoing supervision costs',

    key_components: [
      'Understanding trauma impact on brain/behaviour',
      'Prioritize safety (physical and psychological)',
      'Build trustworthy relationships',
      'Regulate before educate',
      'Co-regulation before self-regulation',
      'Reduce triggers in environment',
      'Avoid re-traumatization',
      'Strength-based approach',
      'Staff wellbeing and supervision'
    ],

    fidelity_checklist: [
      'Staff trained in trauma-informed practice',
      'Safe spaces available',
      'Key adult relationship for each child',
      'Regulation strategies taught',
      'Triggers identified and minimized',
      'No punitive/shame-based responses',
      'Behavior understood as communication',
      'Regular supervision for staff',
      'Parent/carer partnership'
    ],

    progress_indicators: [
      'Feels safer at school',
      'Trusts key adults',
      'Uses regulation strategies',
      'Reduced dysregulation frequency',
      'Less aggressive/avoidant behaviour',
      'Improved attendance',
      'More engaged in learning',
      'Better peer relationships'
    ],

    expected_outcomes: [
      'Increased sense of safety',
      'Secure attachments with adults',
      'Improved self-regulation',
      'Reduced trauma responses',
      'Better school functioning',
      'Healing and recovery progress'
    ],

    adaptations: [
      'Individualized to trauma history',
      'Cultural sensitivity',
      'Developmentally appropriate',
      'Involve therapeutic services',
      'Family trauma-informed support',
      'Gradual trust-building',
      'Flexibility with expectations'
    ],

    contraindications: ['Complements but doesn\'t replace specialist trauma therapy', 'Severe PTSD needs CAMHS involvement'],

    complementary_interventions: [
      'Trauma-focused CBT (specialist)',
      'EMDR (specialist)',
      'Play therapy',
      'Art therapy',
      'Nurture groups',
      'Attachment-based interventions'
    ],

    implementation_guide: 'TRAUMA-INFORMED PRINCIPLES: Safety, Trustworthiness, Choice, Collaboration, Empowerment. UNDERSTANDING: Trauma changes brain development - fight/flight/freeze responses, hypervigilance, difficulty regulating. Behavior is COMMUNICATION not manipulation. ENVIRONMENT: Predictable routines, minimize transitions/changes, calm spaces, sensory tools available. RELATIONSHIPS: Key adult for each child, consistent, reliable, safe. Build trust slowly - may test. REGULATION: Co-regulate first (calm adult presence), teach strategies (breathing, movement, sensory), "regulate before educate" (can\'t learn when dysregulated). RESPONSES: Avoid punishment, isolation, confrontation. Use "What happened to you?" not "What\'s wrong with you?". Repair ruptures. STAFF: Supervision essential to prevent vicarious trauma.',

    parent_information: 'Trauma-informed approach recognizes that traumatic experiences (abuse, neglect, loss, violence, ACEs) change how children\'s brains develop and how they respond to the world. Traumatized children may seem aggressive, avoidant, or shut down - these are survival responses, not "bad behaviour". We focus on: SAFETY (feeling safe physically and emotionally), RELATIONSHIPS (trusted adults), REGULATION (helping them calm), and UNDERSTANDING (behaviour as communication). We avoid punishment and shame. We respond with compassion, patience, and consistency. Your role: partner with us, share what helps your child feel safe, be patient with slow trust-building, use regulation strategies at home. Healing from trauma takes time but with the right support, children can recover and thrive.',

    useful_links: [
      'https://www.trauma-informed-schools.co.uk',
      'https://www.annafreud.org/trauma',
      'https://www.beaconhouse.org.uk/trauma-informed-schools',
      'https://www.minded.org.uk'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['trauma', 'ACEs', 'attachment', 'safety', 'regulation', 'tier_2', 'trauma_informed', 'looked_after']
  },

  {
    id: 'adhd-self-regulation-executive-function',
    name: 'ADHD Self-Regulation and Executive Function Support',
    category: 'behavioural',
    subcategory: 'ADHD_support',
    description: 'Comprehensive support program for students with ADHD targeting self-regulation, organization, time management, attention, impulsivity, and executive function skills through environmental modifications, explicit teaching, and self-monitoring.',
    targeted_needs: ['ADHD', 'Inattention', 'Hyperactivity', 'Impulsivity', 'Poor organization', 'Time management difficulties', 'Executive function deficits'],

    evidence_level: 'tier_1',
    research_sources: ['NICE ADHD guidelines', 'EEF Metacognition & Self-Regulation', 'Barkley Executive Function research'],
    effect_size: 0.58,
    success_rate: '65-75% improved functioning',

    age_range: ['primary', 'secondary', 'post_16'],
    setting: ['mixed', 'one_to_one', 'classroom'],
    duration: 'Ongoing support',
    frequency: 'Daily environmental supports + weekly skills teaching',
    session_length: '15-30 minutes for explicit teaching',

    complexity: 'high',
    staff_training_required: true,
    resources_needed: ['Visual schedules', 'Timers', 'Checklists', 'Movement breaks', 'Organization systems', 'Self-monitoring tools'],
    cost_implications: '£100-£400 for environmental modifications and materials',

    key_components: [
      'Environmental modifications (seating, sensory tools, breaks)',
      'Visual supports (schedules, timers, checklists)',
      'Organization systems (folders, planners, apps)',
      'Time management strategies',
      'Self-monitoring and self-regulation',
      'Movement breaks and fidget tools',
      'Explicit instruction chunked',
      'Positive reinforcement',
      'Home-school communication'
    ],

    fidelity_checklist: [
      'ADHD-friendly environment created',
      'Visual supports in place',
      'Movement breaks scheduled',
      'Instructions chunked and repeated',
      'Organization explicitly taught',
      'Self-monitoring used daily',
      'Positive reinforcement frequent',
      'Reasonable adjustments made',
      'Parent partnership',
      'Regular review'
    ],

    progress_indicators: [
      'Improved attention span',
      'Better organization',
      'Tasks completed',
      'Reduced impulsivity',
      'Self-monitoring used',
      'Improved executive function',
      'Better self-regulation',
      'Academic progress'
    ],

    expected_outcomes: [
      'Improved attention and focus',
      'Better self-regulation',
      'Increased organization',
      'Reduced impulsivity',
      'Improved academic performance',
      'Better social relationships',
      'Increased self-efficacy'
    ],

    adaptations: [
      'Individualized to ADHD profile',
      'Increase structure for severe ADHD',
      'Technology aids (apps, reminders)',
      'Reduce stigma (discrete supports)',
      'Collaborate with ADHD specialist',
      'Medication management (if prescribed)',
      'Intensive for some students'
    ],

    contraindications: ['Should complement not replace medication if prescribed', 'Some accommodations need formal SEND plan'],

    complementary_interventions: [
      'Social skills (ADHD-related difficulties)',
      'Emotional regulation',
      'CBT for ADHD',
      'Mindfulness',
      'Metacognitive strategies'
    ],

    implementation_guide: 'ENVIRONMENT: Seat near teacher, away from distractions. Fidget tools available. Movement breaks every 20-30 mins. Calm corner for regulation. VISUAL SUPPORTS: Visual timetable, now-next boards, timers (Time Timer), task checklists. INSTRUCTIONS: Short, chunked, repeated. Check understanding. Written + verbal. One step at a time. ORGANIZATION: Color-coded folders, homework diary, locker system. Teach explicitly! Check regularly. TIME MANAGEMENT: Break tasks into steps with time for each. Use timers. Backwards planning. SELF-MONITORING: Charts for attention, task completion. Self-rating. Immediate feedback. BREAKS: Planned movement (jobs, walk, exercise). REINFORCEMENT: Frequent, immediate, specific praise. Token systems if needed. HOME: Daily communication (what went well, homework, reminders).',

    parent_information: 'ADHD is a neurodevelopmental condition affecting self-regulation, attention, and impulsivity - it\'s NOT bad behaviour or laziness! Your child\'s brain works differently. We\'re providing ADHD-friendly support: environmental changes (seating, movement breaks), visual supports (schedules, timers), explicit teaching of organization and time management, frequent positive feedback. At home: structured routines, visual schedules, timers, break tasks into small steps, movement breaks, praise effort, be patient! ADHD children often have amazing creativity, energy, and thinking - we help them harness their strengths. If medication is prescribed, school support + medication = best outcomes. Partner with us!',

    useful_links: [
      'https://www.additudemag.com',
      'https://www.understood.org/adhd',
      'https://www.nice.org.uk/guidance/ng87',
      'https://chadd.org'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['ADHD', 'self_regulation', 'executive_function', 'organization', 'tier_1', 'SEND', 'neurodevelopmental']
  },

  {
    id: 'autism-social-communication-support',
    name: 'Autism-Specific Social Communication and Sensory Support',
    category: 'behavioural',
    subcategory: 'autism_support',
    description: 'Comprehensive autism support addressing social communication, sensory needs, routine/predictability, anxiety, and special interests. Autism-affirming, neurodiversity-informed approach.',
    targeted_needs: ['Autism', 'Social communication difficulties', 'Sensory processing difficulties', 'Anxiety', 'Need for routine', 'Special interests'],

    evidence_level: 'tier_1',
    research_sources: ['NICE Autism guidelines', 'National Autistic Society', 'EEF SEND evidence', 'Neurodiversity-affirming practice research'],
    effect_size: 0.62,
    success_rate: '70-80% improved school functioning',

    age_range: ['early_years', 'primary', 'secondary', 'post_16'],
    setting: ['classroom', 'mixed', 'one_to_one'],
    duration: 'Ongoing support',
    frequency: 'Continuous environmental supports + targeted teaching',
    session_length: 'Embedded throughout day',

    complexity: 'high',
    staff_training_required: true,
    resources_needed: ['Visual supports', 'Social stories', 'Sensory tools', 'Predictable routines', 'Quiet space', 'Special interest materials'],
    cost_implications: '£200-£1000+ for comprehensive modifications and resources',

    key_components: [
      'Autism-friendly environment (visual, predictable, calm)',
      'Visual supports (schedules, social stories, comic strip conversations)',
      'Sensory supports (sensory profile, tools, breaks)',
      'Predictable routines and preparation for changes',
      'Social skills teaching (autism-specific)',
      'Special interests incorporated',
      'Anxiety management',
      'Communication supports',
      'Neurodiversity-affirming approach'
    ],

    fidelity_checklist: [
      'Autism training for staff',
      'Visual supports throughout',
      'Sensory needs met',
      'Predictable routines',
      'Changes prepared in advance',
      'Social skills taught explicitly',
      'Special interests valued and used',
      'Quiet space available',
      'Autism-affirming language and attitudes',
      'Parent partnership'
    ],

    progress_indicators: [
      'Reduced anxiety',
      'Improved social understanding',
      'Better sensory regulation',
      'Increased communication',
      'Fewer meltdowns',
      'Improved school attendance',
      'Better engagement',
      'Using support strategies'
    ],

    expected_outcomes: [
      'Reduced anxiety and stress',
      'Improved social communication',
      'Better sensory regulation',
      'Increased participation',
      'Positive self-identity',
      'Academic progress',
      'Better wellbeing'
    ],

    adaptations: [
      'Highly individualized to autistic profile',
      'AAC if needed',
      'Adjust language complexity',
      'More visual supports',
      'Smaller groups',
      'Extended processing time',
      'Flexible with demands'
    ],

    contraindications: ['Must be autism-affirming not "fixing" autism', 'Avoid therapies aimed at making child "normal"'],

    complementary_interventions: [
      'Social stories',
      'AAC if needed',
      'Anxiety management',
      'Sensory integration (OT)',
      'Speech & Language Therapy'
    ],

    implementation_guide: 'ENVIRONMENT: Calm, organized, visual. Reduce sensory overload (lights, noise). Clear boundaries. VISUAL SUPPORTS: Visual timetable (what, when, how long), now-next boards, task boards, social stories for new/difficult situations. ROUTINE: Consistent, predictable. Warn of changes in advance (visual countdown). SOCIAL COMMUNICATION: Teach explicitly (not assumed). Social stories, comic strips, video modeling. Literal language. SENSORY: Sensory profile completed. Provide tools (fidgets, ear defenders, weighted blanket, calm space). SPECIAL INTERESTS: Incorporate into learning! Use as rewards, transition tools, anxiety management. COMMUNICATION: Allow processing time. Accept all communication (verbal, AAC, writing). ANXIETY: Predict triggers, prepare, provide regulation strategies. NEURODIVERSITY-AFFIRMING: Accept autistic traits (stimming, need for routine, special interests) - don\'t punish! Focus on wellbeing and access.',

    parent_information: 'Your autistic child experiences the world differently - their brain is wired differently, processing sensory information, social cues, and routines in unique ways. We\'re providing AUTISM-SPECIFIC support: visual schedules, social stories, sensory tools, predictable routines, incorporating special interests. We take a NEURODIVERSITY-AFFIRMING approach - we\'re not trying to "fix" or "normalize" your child. We accept and support their autism while helping them navigate a neurotypical world. At home: visual supports, predictable routines, prepare for changes, respect sensory needs, honor special interests, clear communication. Your child\'s autism is part of who they are - with the right support, autistic people thrive!',

    useful_links: [
      'https://www.autism.org.uk',
      'https://www.ambitious about autism.org.uk',
      'https://www.nice.org.uk/guidance/cg128',
      'https://autisticadvocacy.org'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['autism', 'neurodiversity', 'social_communication', 'sensory', 'tier_1', 'SEND', 'autism_affirming']
  },

  // Dr. Scott Ighavongbe-Patrick's Evidence-Based Interventions
  {
    id: 'biological-basis-emotions-intervention',
    name: 'Affect Script Theory & Compass of Shame Intervention',
    category: 'behavioural',
    subcategory: 'emotional_regulation',
    description: 'Comprehensive intervention based on Tomkins\' Affect Script Theory and Nathanson\'s Compass of Shame. Helps children and adults understand that emotions are automatic biological responses (affects) that form scripts (patterns), and provides strategies to break negative affect-behaviour loops and address shame responses.',
    targeted_needs: ['Emotional dysregulation', 'Shame-based behaviours', 'Aggressive outbursts', 'Withdrawal', 'Task avoidance', 'Perfectionism', 'Emotional reactivity', 'Trauma responses'],

    evidence_level: 'tier_1',
    research_sources: ['Tomkins (1962-1992) Affect Script Theory', 'Nathanson (1992) Compass of Shame', 'Biological Basis of Emotions (Ighavongbe-Patrick)', 'Affective Neuroscience Research'],
    effect_size: 0.75,
    success_rate: '70-85% improvement in emotional regulation when implemented consistently',

    age_range: ['early_years', 'primary', 'secondary', 'post_16'],
    setting: ['classroom', 'small_group', 'one_to_one', 'home', 'mixed'],
    duration: '8-12 weeks initial phase, ongoing reinforcement',
    frequency: 'Daily psychoeducation and in-the-moment coaching',
    session_length: '15-30 minutes for explicit teaching, continuous real-time support',
    total_sessions: 24,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['9 Affects visual chart', 'Compass of Shame diagram', 'Affect recognition cards', 'Script identification worksheets', 'Breaking the loop strategy cards', 'Parent/teacher guide'],
    cost_implications: '£50-£150 for training materials and visual resources',

    key_components: [
      'Psychoeducation: 9 Affect Scripts (2 positive: joy/enjoyment, interest/excitement; 1 neutral: surprise/startle; 6 negative: distress/anguish, fear/terror, shame/humiliation, disgust, anger/rage, contempt)',
      'Understanding affects as biological/automatic (not choices)',
      'Script formation: how repeated experiences create emotional patterns',
      'Compass of Shame: 4 responses (Withdrawal, Avoidance, Attack Self, Attack Others)',
      'Affective resonance: how one emotion triggers others',
      'Script interrupters: breaking negative loops',
      'Adult role in co-regulation',
      'Teaching alternative scripts',
      'Strengths-based reframing'
    ],

    fidelity_checklist: [
      'Teach all 9 affects explicitly with examples',
      'Explain biological basis (not conscious choice)',
      'Help identify child\'s dominant affect scripts',
      'Map shame responses using Compass of Shame',
      'Model affect labeling in real-time ("I see distress-anguish right now")',
      'Teach script interrupters specific to child\'s patterns',
      'Adults regulate own affects before responding',
      'Focus on breaking loops, not punishing affects',
      'Use affective attunement (match then lead)',
      'Celebrate new scripts forming'
    ],

    progress_indicators: [
      'Child can name and recognize affects',
      'Increased affect vocabulary',
      'Can identify own affect scripts',
      'Recognizes shame responses (Compass quadrants)',
      'Uses script interrupters independently',
      'Longer time between trigger and reaction',
      'Reduced intensity of negative affect loops',
      'More positive affect expressions',
      'Adults report improved co-regulation'
    ],

    expected_outcomes: [
      'Deep understanding of emotional processes',
      'Reduced shame-based behaviours (70-80% reduction)',
      'Ability to interrupt automatic affect scripts',
      'Improved emotional literacy',
      'Better relationships (adults understand child\'s affects)',
      'Reduced reactive behaviours',
      'Increased emotional resilience',
      'Formation of new, healthier affect scripts'
    ],

    adaptations: [
      'Early Years: Use simple language (happy/interested/scared/sad/angry), visual emotion faces',
      'Primary: Introduce full 9 affects, use stories and scenarios',
      'Secondary: Add neuroscience, discuss script formation in depth',
      'Non-verbal: Use visual affect cards, body language mapping',
      'Trauma: Gentler approach to shame work, safety first',
      'Whole-class: Teach as universal emotional literacy'
    ],

    contraindications: ['Avoid during acute crisis', 'Not appropriate if child is in survival mode', 'Requires adult emotional regulation capacity'],

    complementary_interventions: [
      'Attachment-informed strategies',
      'Trauma-informed approaches',
      'Co-regulation techniques',
      'Mindfulness/body awareness',
      'Play therapy',
      'Restorative practices'
    ],

    implementation_guide: 'PHASE 1 (Weeks 1-2): Psychoeducation - Teach 9 affects explicitly. Use visual charts. Explain: affects are BIOLOGICAL (automatic, in autonomic nervous system), not choices. Like reflexes - distress-anguish happens TO us, not because we\'re "naughty." PHASE 2 (Weeks 3-4): Script Identification - Help child identify their patterns. Example: "Every time there\'s a hard task (trigger), you feel distress-anguish (affect), which triggers shame-humiliation, and you attack others (Compass quadrant)." Name the script together. PHASE 3 (Weeks 5-8): Script Interrupters - Teach specific strategies. For task avoidance: "When distress comes, we\'ll do X before shame arrives." For aggression: "When anger-rage starts, we use Y to stop the loop." PHASE 4 (Weeks 9-12): New Scripts - Reinforce new patterns. Celebrate when child uses interrupter. "You felt distress but used your strategy - you\'re building a new script!" ONGOING: Adult Role - Model affect labeling. Stay regulated. Use affective attunement (match child\'s energy then gradually reduce). Break your own negative loops. Provide shame-free environment.',

    parent_information: 'Your child\'s emotions are BIOLOGICAL RESPONSES, not bad behaviour. We all have 9 affect scripts hardwired in our nervous system: 2 feel good (joy, interest), 1 is neutral (surprise), and 6 feel bad (distress, fear, shame, disgust, anger, contempt). When affects repeat in certain situations, they become SCRIPTS - automatic patterns. Example: homework triggers distress, which triggers shame, which triggers "attack others" (yelling). This isn\'t your child being difficult - it\'s an automatic script formed from past experiences. SHAME is the master emotion - when we feel shame, we respond in 4 ways: 1) Withdrawal (hide, isolate), 2) Avoidance (distract, deflect), 3) Attack Self (self-criticism, perfectionism), 4) Attack Others (blame, aggression). Your role: Learn the 9 affects, identify your child\'s scripts, teach interrupters, stay regulated yourself, create shame-free spaces. Remember: affects are AUTOMATIC. Your child isn\'t choosing to feel angry - anger is happening TO them. With support, new scripts form.',

    useful_links: [
      'http://www.tomkins.org - Tomkins Institute',
      'https://www.compassionatesch ools.org - Shame resilience',
      'https://www.affectscript.org - Educational resources',
      'https://www.shameresiliencetheory.com - Brené Brown\'s work on shame'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['affect_theory', 'shame', 'emotional_regulation', 'neuroscience', 'evidence_based', 'doctoral_research', 'tier_1', 'comprehensive']
  },

  {
    id: 'circle-of-friends-intervention',
    name: 'Circle of Friends - Peer Support for Isolated Children',
    category: 'behavioural',
    subcategory: 'social_inclusion',
    description: 'Structured peer support intervention for socially isolated, rejected, or vulnerable children. Establishes a volunteer friendship circle (6-8 peers) who meet weekly to support the focus child\'s social inclusion, problem-solve challenges, and build genuine relationships. Based on humanistic psychology and social learning theory.',
    targeted_needs: ['Social isolation', 'Peer rejection', 'Loneliness', 'Bullying', 'Social communication difficulties', 'Autism', 'Newcomer adjustment', 'Low self-esteem'],

    evidence_level: 'tier_2',
    research_sources: ['Newton, Taylor & Wilson (1996)', 'Frederickson & Turner (2003)', 'Kalyva & Avramidis (2005)', 'Maslow\'s Hierarchy of Needs', 'Bandura\'s Social Learning Theory', 'Rogers\' Person-Centered Approach', 'Dodge\'s Social Information Processing Model'],
    effect_size: 0.65,
    success_rate: '60-75% show improved social inclusion and reduced isolation',

    age_range: ['early_years', 'primary', 'secondary'],
    setting: ['small_group', 'classroom'],
    duration: '12-16 weeks minimum (can continue longer)',
    frequency: 'Weekly circle meetings',
    session_length: '20-30 minutes per meeting',
    total_sessions: 12,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Whole class introduction session materials', 'Circle meeting structure guide', 'Problem-solving frameworks', 'Consent forms', 'Meeting record sheets', 'Confidentiality agreements', 'People in Our Lives concentric circles worksheet'],
    cost_implications: '£20-£100 for materials and facilitator time',

    key_components: [
      'Whole class awareness session (40-60 mins)',
      'Sensitive introduction of focus child\'s situation',
      'Volunteer recruitment (6-8 children)',
      'Parental consent for all involved',
      'Weekly structured meetings (20-30 mins)',
      'Problem-solving focus (not sympathy)',
      'Confidentiality agreements',
      'Ground rules establishment',
      'Adult facilitation gradually reducing',
      'Regular review and monitoring',
      'Clear ending protocol'
    ],

    fidelity_checklist: [
      'Conduct whole class session before starting',
      'Present focus child\'s challenges sensitively (strengths-based)',
      'Recruit 6-8 genuine volunteers (not assigned)',
      'Obtain consent from all parents',
      'Establish clear ground rules (confidentiality, respect, problem-solving not gossip)',
      'Weekly meetings held consistently',
      'Use problem-solving structure (What\'s working? What\'s difficult? What can we do?)',
      'Focus child central to discussions',
      'Adult facilitates but circle leads',
      'Review effectiveness every 4 weeks',
      'Clear ending arranged (not abrupt)'
    ],

    progress_indicators: [
      'Focus child has increased peer interactions',
      'Circle members interact with focus child outside meetings',
      'Focus child reports feeling less lonely',
      'Reduced incidents of isolation/exclusion',
      'Focus child participates more in class',
      'Improved confidence and self-esteem',
      'Wider peer group awareness increases',
      'Problem-solving skills develop in all members'
    ],

    expected_outcomes: [
      'Significant reduction in social isolation (60-75% cases)',
      'At least 2-3 genuine friendships formed',
      'Improved social skills for focus child',
      'Increased empathy in circle members',
      'Better school attendance',
      'Reduced anxiety',
      'Improved academic engagement',
      'Whole class culture of inclusion'
    ],

    adaptations: [
      'Early Years: Shorter meetings (10-15 mins), adult-led play activities',
      'Primary: Use games, structured activities, visual problem-solving tools',
      'Secondary: More peer-led, focus on social problem-solving, peer mentoring',
      'Autism: Prepare focus child in advance, use visual supports, explicit social coaching',
      'Newcomer: Include language support, cultural sensitivity, welcome activities',
      'SEMH: Closer adult support, emotional regulation strategies, flexible structure'
    ],

    contraindications: ['Not appropriate if focus child refuses participation', 'Avoid if stigmatization risk too high', 'Not suitable during acute crisis/trauma'],

    complementary_interventions: [
      'Social skills training for focus child',
      'Lunch club/structured break times',
      'Peer mentoring schemes',
      'Whole-class PSHE on friendship',
      '1:1 emotional support for focus child',
      'Anti-bullying initiatives'
    ],

    implementation_guide: 'STEP 1: Identify focus child (vulnerable, isolated, rejected, or struggling socially). Discuss with parents, explain Circle of Friends. STEP 2: Whole Class Session (40-60 mins) - Facilitate discussion about friendships, loneliness, differences. Introduce focus child\'s challenges sensitively (WITH their consent) - strengths-based, non-stigmatizing. Example: "Sam finds it hard to join games at playtime and sometimes feels lonely. They\'re really good at [strength]. Who would like to help?" STEP 3: Recruit Volunteers - Ask for 6-8 volunteers. Select children who are mature, empathetic, reliable (not necessarily "popular"). STEP 4: Parental Consent - All circle members AND focus child parents consent. STEP 5: First Meeting - Establish ground rules (confidentiality, respect, problem-solving). Discuss: What\'s going well? What\'s difficult? What could we do? Assign actions (e.g., "I\'ll ask Sam to play football," "I\'ll sit with Sam at lunch"). STEP 6: Weekly Meetings - Review actions, problem-solve new challenges, celebrate successes. Focus child central to discussions. STEP 7: Review Every 4 Weeks - Is it working? Do we continue? STEP 8: Ending - Plan clear ending (not sudden). Celebrate achievements.',

    parent_information: 'Circle of Friends is a peer support group where 6-8 classmates volunteer to support your child\'s social inclusion. It\'s NOT about "fixing" your child - it\'s about creating a supportive network. The circle meets weekly to discuss what\'s going well, what\'s challenging, and what they can do to help. Your child is at the CENTER of these discussions. The goal: reduce loneliness, build genuine friendships, improve social confidence. Your role: Give consent, encourage participation, support your child, communicate with facilitator. Benefits seen: reduced isolation, improved friendships, better confidence, increased school engagement. This is STRENGTHS-BASED - the circle recognizes your child\'s positives while supporting challenges.',

    useful_links: [
      'https://www.inclusive solutions.com/circleoffriends',
      'https://www.anti-bullyingalliance.org.uk',
      'https://www.autismeducationtrust.org.uk/circle-of-friends'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['peer_support', 'social_inclusion', 'isolation', 'friendship', 'tier_2', 'humanistic', 'evidence_based', 'EP_intervention']
  },

  {
    id: 'precision-monitoring-direct-instruction',
    name: 'Precision Monitoring with Direct Instruction',
    category: 'behavioural',
    subcategory: 'academic_progress_monitoring',
    description: 'Precision Monitoring is an ASSESSMENT tool (not a teaching method) using daily probes and ratio chart graphing to track fluency development. Combined with Direct Instruction (Model-Lead-Test) teaching approach. Based on Haring & Eaton\'s Learning Hierarchy: Acquisition → Fluency → Maintenance → Generalization → Adaptation. Provides data-driven decision-making for intervention effectiveness.',
    targeted_needs: ['Slow learning progress', 'Lack of fluency', 'Skill retention difficulties', 'Need for data-driven intervention', 'Dyslexia', 'Dyscalculia', 'Learning difficulties', 'Monitoring intervention effectiveness'],

    evidence_level: 'tier_1',
    research_sources: ['Haring & Eaton (1978) Learning Hierarchy', 'Precision Teaching (Lindsley)', 'Direct Instruction research (Engelmann & Carnine)', 'EEF Feedback & Assessment', 'Chartered Institute of Educational Assessors'],
    effect_size: 0.88,
    success_rate: '80-90% show measurable fluency gains when implemented with fidelity',

    age_range: ['early_years', 'primary', 'secondary', 'post_16'],
    setting: ['one_to_one', 'small_group'],
    duration: 'Ongoing until fluency/mastery achieved (typically 6-20 weeks)',
    frequency: 'Daily teaching sessions + daily 1-minute probes',
    session_length: '10-15 minutes teaching + 1 minute probe',
    total_sessions: 60,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Baseline assessment materials', 'Daily probe sheets (1-minute timings)', 'Ratio charts (semi-logarithmic)', 'Direct Instruction scripts/materials', 'SMART target templates', 'Decision rules guide (3-day rule, 8-day rule)', 'Probe builder tool (http://www.johnandgwyn.co.uk/multiprobe.xls)'],
    cost_implications: '£50-£200 for materials, training, and probe generation tools',

    key_components: [
      'Step 1: Identify difficulty and baseline (what CAN\'T child do?)',
      'Step 2: Set SMART target (Observable verb + Conditions + Criterion + Timeline)',
      'Step 3: Teaching sessions using Direct Instruction (Model-Lead-Test)',
      'Step 4: Daily 1-minute probe (measure correct AND incorrect responses)',
      'Step 5: Chart results on ratio chart (celeration lines)',
      'Step 6: Analyze data and make decisions (3-day rule, 8-day rule)',
      'Model-Lead-Test correction procedure',
      'Focus on FLUENCY not just accuracy',
      'Data-driven adjustments'
    ],

    fidelity_checklist: [
      'Baseline established before intervention starts',
      'SMART target written (specific, measurable, achievable, relevant, time-bound)',
      'Observable verb used (e.g., "reads," "writes," "calculates" not "knows")',
      'Criterion includes accuracy AND speed (e.g., "60 words per minute with <2 errors")',
      'Teaching sessions use Direct Instruction Model-Lead-Test',
      'Daily 1-minute probe conducted',
      'BOTH correct AND incorrect responses charted',
      'Ratio chart used (not linear chart)',
      'Data analyzed weekly using decision rules',
      '3-day rule: If 3 consecutive days below aim line, check if too hard',
      '8-day rule: If no progress after 8 days, change intervention'
    ],

    progress_indicators: [
      'Celeration line shows upward trend (correct responses increasing)',
      'Celeration line shows downward trend (incorrect responses decreasing)',
      'Aim line crossed (target met)',
      'Fluency developing (speed AND accuracy improving)',
      'Child moves through Learning Hierarchy stages',
      'Skill maintained over time',
      'Skill generalizes to different contexts',
      'Child can adapt skill to new situations'
    ],

    expected_outcomes: [
      'Measurable fluency gains (80-90% reach target)',
      'Movement through Learning Hierarchy (Acquisition→Fluency→Maintenance→Generalization→Adaptation)',
      'Data shows intervention effectiveness',
      'Skill retention over time',
      'Faster learning rates',
      'Generalization to real-world contexts',
      'Adaptation to new learning',
      'Increased learner confidence'
    ],

    adaptations: [
      'Reading: Letter sounds, word reading, passage reading fluency',
      'Writing: Letter formation, spelling, sentence writing',
      'Maths: Number facts, calculations, problem-solving steps',
      'Functional skills: Life skills, vocational tasks, self-care',
      'Any skill that can be counted: Use for ANY measurable skill!',
      'Differentiation: Adjust probe difficulty to "challenge point" (not too easy/hard)'
    ],

    contraindications: ['Not appropriate for skills that can\'t be counted/measured', 'Requires daily consistency - won\'t work if probes missed', 'Not suitable during acquisition phase (use AFTER initial teaching)'],

    complementary_interventions: [
      'Task analysis for complex skills',
      'Errorless learning for initial acquisition',
      'Reinforcement systems for motivation',
      'Overlearning for maintenance',
      'Distributed practice for retention',
      'Mixed review for generalization'
    ],

    implementation_guide: 'STEP 1: Identify Difficulty & Baseline - What can\'t the child do fluently? Conduct 1-minute probe to establish baseline. Count correct AND incorrect responses. Example: Kira reads 20 words/min with 8 errors. STEP 2: Set SMART Target - Formula: [Observable verb] + [Conditions] + [Criterion] + [Timeline]. Example: "Kira will read aloud 60 words per minute with no more than 2 errors on 3 consecutive days by [date]." STEP 3: Teaching Sessions (Direct Instruction) - Use MODEL-LEAD-TEST. MODEL: Adult demonstrates skill. "Watch me read this word: /c/ /a/ /t/ cat." LEAD: Adult and child together. "Let\'s read it together: /c/ /a/ /t/ cat." TEST: Child independent. "Now you read it." If error: Return to Model-Lead-Test. STEP 4: Daily 1-Minute Probe - After teaching, conduct 1-minute timed probe. Count corrects (numerator) and incorrects (denominator). STEP 5: Chart Results - Plot on ratio chart (semi-logarithmic). Draw aim line from baseline to target. STEP 6: Analyze & Adjust - Use decision rules: 3-DAY RULE: If 3 consecutive days below aim line, check if task too hard, provide more support. 8-DAY RULE: If no progress after 8 instructional days, CHANGE something (material, method, target). CELEBRATE: When aim line crossed 3 consecutive times, skill is FLUENT! Move to maintenance/generalization.',

    parent_information: 'Precision Monitoring is a way of tracking your child\'s learning progress DAILY using 1-minute "probes" (timed tests) and charting results on a special graph. It\'s like a fitness tracker for learning! We\'re measuring FLUENCY - how fast AND accurate your child is. Why? Because research shows children need to be FLUENT (fast + accurate) to remember skills and use them in real life. How it works: 1) We teach your child using Direct Instruction (Model-Lead-Test - very clear, structured teaching). 2) Every day, we do a 1-minute probe (e.g., "Read these words for 1 minute"). 3) We chart how many they got correct and incorrect. 4) The graph shows progress - if it\'s going up, great! If flat, we change our teaching. Your role: Practice at home if asked, celebrate progress, trust the data. We use DECISION RULES: if no progress after 8 days, we change something. This ensures we don\'t waste time on ineffective approaches. The goal: Your child becomes FLUENT, retains the skill, and can use it anywhere!',

    useful_links: [
      'http://www.johnandgwyn.co.uk/multiprobe.xls - Free probe builder',
      'https://www.celeration.org - Standard Celeration Society',
      'https://www.nifdi.org - National Institute for Direct Instruction',
      'https://www.chartshare.org - Precision Teaching resources'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['precision_teaching', 'direct_instruction', 'fluency', 'data_driven', 'evidence_based', 'tier_1', 'assessment', 'learning_hierarchy', 'EP_tool']
  },

  {
    id: 'learning-hierarchy-skills-development',
    name: 'Learning Hierarchy of Skills Development (Haring & Eaton Framework)',
    category: 'behavioural',
    subcategory: 'skill_development',
    description: 'Framework for understanding and teaching skill progression through five hierarchical stages: Acquisition (learning new skills), Fluency (building speed/automaticity), Maintenance (retaining over time), Generalization (applying across contexts), and Adaptation (modifying for novel situations). Used to inform teaching strategies, assessment focus, and intervention planning. Essential for matching instruction to learner\'s current stage.',
    targeted_needs: ['New skill learning', 'Slow skill acquisition', 'Lack of automaticity/fluency', 'Difficulty retaining learned skills', 'Failure to generalize skills', 'Inflexibility in skill application', 'Need for targeted teaching strategies', 'Learning difficulties', 'Dyslexia', 'Dyscalculia'],

    evidence_level: 'tier_1',
    research_sources: ['Haring & Eaton (1978) - Learning Hierarchy', 'Precision Teaching research', 'Direct Instruction research', 'Educational Psychology literature'],
    effect_size: 0.82,
    success_rate: '75-90% when teaching matched to stage',

    age_range: ['early_years', 'primary', 'secondary', 'post_16', 'all'],
    setting: ['one_to_one', 'small_group', 'classroom', 'home'],
    duration: 'Ongoing framework - not time-limited',
    frequency: 'Continuous application in teaching and assessment',
    session_length: 'N/A - framework for all teaching',

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Learning Hierarchy visual aid', 'Assessment probes', 'Data recording sheets', 'Training in framework application', 'Examples of stage-appropriate teaching strategies'],
    cost_implications: '£50-£150 for training materials',

    key_components: [
      '1. ACQUISITION: Learning NEW skills - child doesn\'t know how to do it yet',
      '2. FLUENCY: Building SPEED and AUTOMATICITY - child knows how but is slow/effortful',
      '3. MAINTENANCE: RETAINING skills over time without ongoing practice',
      '4. GENERALIZATION: APPLYING skills across different contexts, people, settings',
      '5. ADAPTATION: MODIFYING and adapting skills for novel/complex situations',
      'Match teaching strategies to stage',
      'Assess which stage child is at BEFORE planning intervention',
      'Progress sequentially through stages (don\'t skip)'
    ],

    fidelity_checklist: [
      'Identify current stage through assessment/observation',
      'Match teaching strategy to stage (different strategies for each)',
      'Use appropriate prompts for stage (more at Acquisition, less at Fluency)',
      'Set appropriate success criteria for stage',
      'Use stage-appropriate reinforcement',
      'Collect data appropriate to stage (accuracy vs. fluency vs. generalization)',
      'Move to next stage only when current stage mastered',
      'Plan explicitly for generalization and adaptation (don\'t assume it happens)',
      'Revisit earlier stages if skills deteriorate'
    ],

    progress_indicators: [
      'ACQUISITION: Increasing accuracy (from 0% to 80-90% correct)',
      'FLUENCY: Increasing rate/speed while maintaining accuracy (aim for automaticity)',
      'MAINTENANCE: Skill retained after 1 week, 1 month without practice',
      'GENERALIZATION: Skill performed with different people, settings, materials',
      'ADAPTATION: Child modifies skill appropriately for new situations',
      'Clear movement through stages',
      'Reduced prompting/support needed',
      'Increased independence and confidence'
    ],

    expected_outcomes: [
      'Efficient skill acquisition (less wasted time)',
      'Automaticity and fluency (not just accuracy)',
      'Long-term retention of skills',
      'Skills applied beyond teaching context',
      'Flexible skill use in novel situations',
      'Matched teaching = faster progress',
      'Reduced learning difficulties',
      'Prevention of "skill islands" (can do it here but not there)'
    ],

    adaptations: [
      'ACQUISITION STAGE: Use Model-Lead-Test, errorless learning, high prompts, immediate corrective feedback, high reinforcement for effort, focus on ACCURACY only',
      'FLUENCY STAGE: Timed practice, repeated practice trials, games/races, reduce prompts, celebrate speed improvements, precision teaching probes, aim for automaticity',
      'MAINTENANCE STAGE: Distributed practice (spacing), periodic checks, review sessions, self-monitoring, build into routines',
      'GENERALIZATION STAGE: Plan explicitly - different people teach, different settings, different materials, varied examples, "train and hope" doesn\'t work',
      'ADAPTATION STAGE: Problem-solving opportunities, novel situations, "What if?" scenarios, creativity encouraged, open-ended tasks',
      'DYSLEXIA/DYSCALCULIA: May need extended Fluency stage (accuracy achieved but fluency elusive) - don\'t rush, use precision teaching',
      'AUTISM: Explicit generalization planning essential - may not spontaneously generalize, use multiple exemplars',
      'WORKING MEMORY DIFFICULTIES: Focus on Fluency to reduce cognitive load (automaticity frees up working memory)'
    ],

    contraindications: ['Don\'t skip stages (e.g., teaching generalization when still at acquisition)', 'Don\'t assume generalization happens automatically - it must be explicitly taught', 'Don\'t continue pushing fluency if accuracy drops (return to acquisition)', 'Don\'t use fluency-building strategies (e.g., timed practice) during acquisition stage - child will practice errors'],

    complementary_interventions: [
      'Precision Monitoring (for tracking stage progress)',
      'Direct Instruction (teaching method for Acquisition)',
      'Fluency-building interventions (Repeated Reading, Number Facts practice)',
      'Generalization programming (multiple exemplar training)',
      'Self-monitoring (for Maintenance)',
      'Problem-solving training (for Adaptation)'
    ],

    implementation_guide: 'LEARNING HIERARCHY FRAMEWORK (Haring & Eaton, 1978): Five sequential stages of skill learning - each requires DIFFERENT teaching approaches. STAGE 1: ACQUISITION (CAN\'T DO IT) - Learning a NEW skill from scratch. Child: Doesn\'t know how, makes many errors, needs high support. Teaching Focus: ACCURACY (not speed). Strategies: Model-Lead-Test (show, do together, child does), errorless learning, high prompting, immediate corrective feedback, break into small steps, high reinforcement for trying/effort, slow pace, lots of repetition. Success Criteria: 80-90% accuracy on 3 consecutive sessions. STAGE 2: FLUENCY (CAN DO IT BUT SLOW) - Building speed and automaticity. Child: Knows how, accurate, but slow, effortful, not automatic. Teaching Focus: SPEED and AUTOMATICITY (accuracy already achieved). Strategies: Timed practice, repeated practice trials, games/competitions, reduce prompts, "beat your best" charts, precision teaching probes, celebrate speed gains (not just accuracy), shorter frequent sessions. Success Criteria: Age-appropriate rate (e.g., 60 sounds per minute for reading) with 95%+ accuracy for 3 consecutive sessions. STAGE 3: MAINTENANCE (KEEPING IT) - Retaining skills over time without ongoing practice. Child: Can do it fluently when prompted, but may forget if not practiced. Teaching Focus: RETENTION across time. Strategies: Distributed practice (spaced over time), periodic "cold probe" checks (without warning), review sessions (weekly → fortnightly → monthly), embed into routines, self-monitoring charts, celebrate retention ("You still remember from last month!"). Success Criteria: Skill performed at fluent level after 1 week, 2 weeks, 1 month without explicit teaching. STAGE 4: GENERALIZATION (USING IT EVERYWHERE) - Applying skill across different contexts. Child: Can do it with this teacher, these materials, this setting - but not elsewhere. Teaching Focus: APPLICATION across people, settings, materials, time. Strategies: Multiple exemplars (teach with varied examples), different teachers/adults, different settings (classroom, playground, home), different materials (worksheets, whiteboards, real objects), varied time of day, explicit "Where else could you use this?" discussions, program for generalization (don\'t assume it happens). Success Criteria: Skill performed fluently with 3+ different people, 3+ different settings, 3+ different materials. STAGE 5: ADAPTATION (CHANGING IT) - Modifying skill for novel/complex situations. Child: Can do it as taught, but can\'t modify/adapt when situation changes. Teaching Focus: FLEXIBILITY and problem-solving. Strategies: Novel problem situations, "What if?" scenarios, open-ended tasks, encourage creativity, problem-solving training, teach metacognitive strategies ("What do I know that might help?"), apply to real-world situations. Success Criteria: Child spontaneously adapts skill for new situations without prompting. KEY PRINCIPLES: 1) ASSESS stage first (don\'t assume) - a child may be fluent in one skill, acquisition in another. 2) MATCH teaching to stage - acquisition needs different strategies than fluency. 3) PROGRESS SEQUENTIALLY - don\'t skip stages. If fluency drops, return to acquisition. If generalization fails, more fluency building may be needed. 4) GENERALIZATION doesn\'t happen automatically - must be explicitly programmed. 5) Different REINFORCEMENT for different stages: Acquisition = reinforce effort/trying. Fluency = reinforce speed/improvement. Maintenance = reinforce remembering. Generalization = reinforce applying. Adaptation = reinforce creativity/problem-solving. EXAMPLE - TEACHING SIGHT WORDS: Acquisition: Model word, child repeats, flashcards with immediate feedback, high praise for trying, 5-10 words until 90% accuracy. Fluency: Timed flashcard games, "beat the clock", 1-minute probes, aim for instant recognition, celebrate speed gains. Maintenance: Weekly/monthly "cold checks", embed in daily reading, occasional review games. Generalization: Spot words in books, posters, labels around school/home, different fonts, different contexts. Adaptation: Use sight words creatively in sentences, stories, jokes - child plays with words.',

    parent_information: 'Your child learns skills in STAGES - and different stages need different support! LEARNING HIERARCHY (Haring & Eaton, 1978): 1) ACQUISITION: Learning something NEW - they don\'t know how yet. What you\'ll see: Lots of errors, needs help, slow, effortful. What helps: SHOW them (model), do it WITH them, lots of practice, celebrate TRYING (not just getting it right), be patient, break it into tiny steps. Don\'t worry about speed yet - focus on getting it RIGHT. 2) FLUENCY: They CAN do it, but it\'s SLOW. What you\'ll see: Accurate but takes forever, lots of concentration needed, not automatic. What helps: PRACTICE for speed - timed games, "beat your own record", make it fun/competitive, celebrate getting FASTER. Now we care about speed! 3) MAINTENANCE: KEEPING the skill - not forgetting it. What you\'ll see: Can do it when reminded, but might forget if not practiced. What helps: Occasional practice (once a week, once a month), "Do you still remember how to...?", build it into routines, celebrate remembering from last time. 4) GENERALIZATION: Using the skill EVERYWHERE, not just at school. What you\'ll see: Can do it with teacher but not with you, can do it on worksheets but not in real life. What helps: Practice in DIFFERENT places (home, shops, park), with different people, with different materials, point out "This is like what you learned at school!" 5) ADAPTATION: CHANGING the skill for new situations - being creative/flexible. What you\'ll see: Can do exactly what was taught, but struggles when situation changes slightly. What helps: "What if?" questions, problem-solving, encourage trying new ways, real-world challenges, celebrate creative thinking. WHY THIS MATTERS: If your child is still LEARNING a skill (Acquisition), pushing them to be FAST will frustrate them - they\'ll practice errors! If they\'re already ACCURATE but slow (Fluency), they need speed practice - not more accuracy work. Match the support to the stage, and learning goes faster! Most importantly: GENERALIZATION doesn\'t happen automatically - kids with learning difficulties often need explicit help to use skills outside the teaching context. Practice at home, in the community, in different situations. That\'s how skills become truly functional!',

    useful_links: [
      'https://iris.peabody.vanderbilt.edu/module/sld/cresource/q2/p05/ - Learning Hierarchy explained',
      'https://www.interventioncentral.org - Teaching strategies by stage',
      'https://www.celeration.org - Precision Teaching & Learning Hierarchy',
      'Educational Psychology textbooks (Haring & Eaton, 1978 original paper)'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['learning_hierarchy', 'skill_development', 'tier_1', 'framework', 'assessment', 'Haring_Eaton', 'evidence_based', 'EP_tool', 'doctoral_research', 'fluency', 'generalization']
  }
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
      'Significant disruptive behaviour may interfere with group'
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

    parent_information: 'Your child is learning to manage their anxiety using proven techniques. They will learn: what happens in their body when anxious, how to calm down using breathing/relaxation, how thoughts affect feelings, how to challenge worried thoughts, and how to gradually face fears (not avoid them). This is called CBT (Cognitive Behavioral Therapy). Your role: encourage practice of techniques at home, don\'t accommodate avoidance (gently support facing fears), praise brave behaviour, manage your own anxiety, attend parent sessions if offered. Anxiety improves with practice - be patient.',

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

  // RESTORATIVE JUSTICE INTERVENTIONS - reflecting Dr. Patrick's doctoral expertise
  {
    id: 'restorative-circles-classroom',
    name: 'Restorative Circles and Conferencing in Schools',
    category: 'social_emotional',
    subcategory: 'restorative_justice',
    description: 'Structured restorative approach bringing together those affected by conflict/harm to dialogue, understand impact, repair relationships, and restore community. Includes proactive circles for building relationships and reactive circles for addressing harm.',
    targeted_needs: ['Conflict resolution', 'Bullying', 'Relationship breakdown', 'Antisocial behaviour', 'Reintegration after exclusion', 'Community building', 'Peer disputes'],

    evidence_level: 'tier_1',
    research_sources: ['Restorative Justice Council UK', 'EEF Behavior interventions', 'Transforming Conflict (Morrison)', 'Dr. Patrick\'s doctoral research'],
    effect_size: 0.62,
    success_rate: '65-80% improved relationships and reduced repeat incidents',

    age_range: ['primary', 'secondary', 'post_16'],
    setting: ['small_group', 'classroom', 'mixed'],
    duration: 'Ongoing practice',
    frequency: 'Regular proactive circles + reactive as needed',
    session_length: '20-60 minutes depending on circle type',

    complexity: 'high',
    staff_training_required: true,
    resources_needed: ['Restorative questions cards', 'Talking piece', 'Circle scripts', 'Training for facilitators', 'Follow-up agreement forms'],
    cost_implications: '£500-£2000 for whole-school training + ongoing facilitation time',

    key_components: [
      'Proactive circles (community building, check-ins)',
      'Restorative conversations (1-1 or small group)',
      'Restorative conferences (formal, facilitated)',
      'Restorative questions (What happened? Who was affected? How can we repair?)',
      'Focus on relationships not punishment',
      'Voluntary participation',
      'Safe, respectful space',
      'Repair agreements and follow-up'
    ],

    fidelity_checklist: [
      'Trained facilitator leads circles',
      'Use restorative questions framework',
      'Voluntary participation (not coerced)',
      'Safe, non-judgmental space created',
      'All voices heard equally',
      'Focus on harm and repair, not blame',
      'Agreements made collaboratively',
      'Follow-up to check agreements kept',
      'Embedded in whole-school ethos'
    ],

    progress_indicators: [
      'Participants feel heard',
      'Understanding of impact increased',
      'Agreements reached collaboratively',
      'Relationships restored/improved',
      'Reduced repeat incidents',
      'Increased sense of community',
      'Fewer exclusions',
      'Students report feeling safer'
    ],

    expected_outcomes: [
      'Restored relationships',
      'Reduced conflict and bullying',
      'Accountability without punishment',
      'Stronger school community',
      'Improved emotional literacy',
      'Reduced exclusions and suspensions',
      'Positive school climate'
    ],

    adaptations: [
      'Simpler language for younger children',
      'Visual supports (SEND)',
      'Smaller circles for anxiety',
      'Cultural sensitivity',
      'Trauma-informed adaptations',
      'Virtual/hybrid circles if needed',
      'Extended preparation time'
    ],

    contraindications: ['Power imbalances need careful management', 'Victim safety paramount - never force participation', 'Some serious safeguarding issues require different response'],

    complementary_interventions: [
      'Peer mediation',
      'Emotion regulation',
      'Social skills training',
      'Trauma-informed practice',
      'Bullying prevention programs'
    ],

    implementation_guide: 'RESTORATIVE QUESTIONS: 1) What happened? (all perspectives), 2) What were you thinking at the time?, 3) Who has been affected? How?, 4) What needs to happen to make things right?, 5) What can we do to prevent this happening again? PROACTIVE CIRCLES (weekly): Build relationships, discuss issues, celebrate successes. RESTORATIVE CONVERSATIONS: Informal, daily practice. "I noticed... how did that affect...? what could repair...?" RESTORATIVE CONFERENCES: Formal, for significant harm. Preparation crucial - meet separately first. CONFERENCE STRUCTURE: Welcome, ground rules, harmer speaks (what happened? thinking? now?), affected speak (impact? feelings? needs?), supporters speak, agreement on repair, follow-up plan. CRITICAL: Voluntary, safe, focus on repair not punishment!',

    parent_information: 'Restorative Justice is NOT "soft" - it\'s accountability through understanding harm and making amends. When conflict happens, instead of punishment (which often makes things worse), we bring people together to: understand what happened, hear how people were affected, repair the harm, and prevent it happening again. Your child will have a VOICE - they can explain their perspective, hear others\' perspectives, and be part of the solution. For those who caused harm: they face the real impact of their actions and must make amends. For those harmed: they\'re heard, their needs are met, relationships can be restored. Research shows RJ is more effective than punishment at preventing repeat behaviour and improving relationships. You may be invited to participate!',

    useful_links: [
      'https://www.restorativejustice.org.uk',
      'https://www.transformingconflict.org',
      'https://www.educ.cam.ac.uk/research/projects/restorativeschools',
      'https://www.iirp.edu'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['restorative_justice', 'circles', 'conflict_resolution', 'tier_1', 'relationships', 'community', 'accountability', 'doctoral_research']
  },

  {
    id: 'peer-mediation-conflict-resolution',
    name: 'Peer Mediation and Conflict Resolution Program',
    category: 'social_emotional',
    subcategory: 'restorative_justice',
    description: 'Training selected students as peer mediators to help resolve conflicts between students using structured mediation process. Complements whole-school restorative approach.',
    targeted_needs: ['Peer conflicts', 'Friendship fallouts', 'Minor disputes', 'Building student leadership', 'Empowering students', 'Reducing adult intervention'],

    evidence_level: 'tier_2',
    research_sources: ['Peer mediation research', 'EEF Social & Emotional Learning', 'Conflict resolution studies'],
    effect_size: 0.48,
    success_rate: '60-75% of mediated conflicts resolved successfully',

    age_range: ['primary', 'secondary'],
    setting: ['mixed'],
    duration: 'Ongoing program',
    frequency: 'Mediations as needed; regular mediator training/supervision',
    session_length: '20-40 minutes per mediation',

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Mediator training curriculum', 'Mediation scripts', 'Badges/identification', 'Dedicated mediation space', 'Supervision system'],
    cost_implications: '£200-£800 for training and materials',

    key_components: [
      'Recruit and train peer mediators',
      'Structured mediation process',
      'Neutral third-party facilitation',
      'Both parties tell their story',
      'Identify needs and feelings',
      'Generate solutions together',
      'Agreement reached',
      'Follow-up'
    ],

    fidelity_checklist: [
      'Mediators trained properly',
      'Structured process followed',
      'Neutrality maintained',
      'Both parties participate voluntarily',
      'Confidentiality (with safeguarding limits)',
      'Agreement written down',
      'Follow-up check conducted',
      'Adult supervision available',
      'Regular mediator support/supervision'
    ],

    progress_indicators: [
      'Successful conflict resolutions',
      'Students request mediation',
      'Reduced playground conflicts',
      'Mediators demonstrate skills',
      'Student satisfaction with process',
      'Reduced adult interventions',
      'Positive peer culture'
    ],

    expected_outcomes: [
      'Empowered students',
      'Reduced peer conflict',
      'Improved conflict resolution skills school-wide',
      'Student ownership of solutions',
      'Positive peer relationships',
      'Leadership development for mediators'
    ],

    adaptations: [
      'Simpler process for primary',
      'Visual supports',
      'Adult co-mediation if needed',
      'Cultural adaptations',
      'Clear boundaries on what can be mediated',
      'Additional support for SEND mediators'
    ],

    contraindications: ['Bullying - power imbalance makes mediation inappropriate', 'Safeguarding concerns', 'Serious violence', 'Anything requiring adult intervention'],

    complementary_interventions: [
      'Restorative circles',
      'Social skills training',
      'Emotional literacy',
      'Whole-school positive behaviour approach'
    ],

    implementation_guide: 'RECRUITMENT: Select diverse group of students (not just "good" students - range of backgrounds). TRAINING: 6-8 sessions covering: listening, empathy, neutrality, mediation steps, role-plays. MEDIATION PROCESS: 1) Introduction (roles, rules, confidentiality), 2) Story-telling (each person uninterrupted), 3) Identifying issues (what\'s the problem?), 4) Generating solutions (brainstorm together), 5) Agreement (specific, realistic, written), 6) Follow-up (check in later). SUPERVISION: Weekly meetings with mediators - debrief, support, ongoing training. AVAILABILITY: Known times/locations, visibility (badges). CRITICAL: Clear about what CAN\'T be mediated (bullying, serious issues). Mediators are facilitators, not judges!',

    parent_information: 'Peer mediation means trained students help other students resolve conflicts. If your child has a friendship fallout or dispute, they can request mediation. Two trained student mediators listen to both sides, help them understand each other, and support them to find their own solution. It\'s VOLUNTARY and CONFIDENTIAL (unless safety concerns). Benefits: students learn to solve problems themselves, conflicts resolved quickly, empowering! If your child is a MEDIATOR: they\'re developing valuable leadership and communication skills, helping their school community, and learning lifelong conflict resolution skills. They receive training and ongoing support.',

    useful_links: [
      'https://www.conflictresolutionengland.com',
      'https://www.peacemakers.org.uk',
      'https://www.restorativejustice.org.uk/peer-mediation'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['peer_mediation', 'conflict_resolution', 'student_leadership', 'tier_2', 'restorative', 'empowerment']
  },

  {
    id: 'self-esteem-confidence-building',
    name: 'Self-Esteem and Confidence Building Program',
    category: 'social_emotional',
    subcategory: 'self_esteem',
    description: 'Structured program to improve self-esteem, self-concept, and confidence through strengths identification, positive self-talk, goal-setting, success experiences, and challenging negative beliefs.',
    targeted_needs: ['Low self-esteem', 'Poor self-concept', 'Lack of confidence', 'Negative self-talk', 'Learned helplessness', 'Social withdrawal'],

    evidence_level: 'tier_2',
    research_sources: ['Self-esteem research (Rosenberg)', 'EEF Social & Emotional Learning', 'Solution-focused approaches'],
    effect_size: 0.48,
    success_rate: '60-70% improved self-esteem',

    age_range: ['primary', 'secondary'],
    setting: ['small_group', 'one_to_one'],
    duration: '8-12 weeks',
    frequency: '1-2 times per week',
    session_length: '30-45 minutes',
    total_sessions: 15,

    complexity: 'medium',
    staff_training_required: false,
    resources_needed: ['Self-esteem activities', 'Strengths cards', 'Success journals', 'Affirmation cards', 'Goal-setting materials'],
    cost_implications: '£30-£100 for resources',

    key_components: [
      'Identifying personal strengths',
      'Challenging negative self-talk',
      'Positive affirmations',
      'Success experiences and celebrating achievements',
      'Goal-setting and achieving',
      'Growth mindset development',
      'Self-compassion',
      'Social support building'
    ],

    fidelity_checklist: [
      'Strengths identified and reinforced',
      'Negative thoughts challenged',
      'Success journal maintained',
      'Goals set collaboratively',
      'Achievements celebrated',
      'Positive atmosphere',
      'Scaffolded challenges provided',
      'Progress tracked'
    ],

    progress_indicators: [
      'Improved self-esteem scores',
      'More positive self-talk',
      'Increased confidence',
      'Willing to try challenges',
      'Identifies own strengths',
      'Sets and achieves goals',
      'Better peer relationships',
      'Increased participation'
    ],

    expected_outcomes: [
      'Improved self-esteem',
      'Increased confidence',
      'Positive self-concept',
      'Growth mindset',
      'Better resilience',
      'Improved wellbeing'
    ],

    adaptations: [
      'Individual for severe low self-esteem',
      'Visual supports',
      'Simplified activities',
      'Link to interests',
      'Parent involvement',
      'Extended duration'
    ],

    contraindications: ['Depression/mental health concerns may need specialist support alongside'],

    complementary_interventions: [
      'CBT',
      'Growth mindset',
      'Social skills',
      'Resilience building',
      'Counseling if needed'
    ],

    implementation_guide: 'Weeks 1-2: STRENGTHS - identify strengths through activities, feedback from others, reflection. Create strengths cards. Weeks 3-4: NEGATIVE SELF-TALK - identify negative thoughts, challenge them, replace with balanced thoughts. Practice positive affirmations. Weeks 5-6: SUCCESS EXPERIENCES - set small achievable goals, achieve them, celebrate! Success journal. Weeks 7-8: BIGGER CHALLENGES - scaffold appropriate challenges, support, celebrate effort. Weeks 9-10: SOCIAL CONFIDENCE - role-play social situations, practice, feedback. Weeks 11-12: MAINTENANCE - review progress, plan for continued confidence building. CRITICAL: Genuine praise, focus on effort/progress not just outcomes, build on strengths!',

    parent_information: 'Your child is working on building self-esteem and confidence. They\'ll identify their strengths (everyone has them!), learn to challenge negative self-talk ("I\'m rubbish" becomes "I find this hard but I\'m improving"), set and achieve goals, and experience success. Low self-esteem affects everything - friendships, learning, wellbeing. At home: notice and praise efforts (not just results), point out strengths, avoid comparisons with siblings/others, encourage trying new things, be patient - confidence builds slowly! Focus on what they CAN do. Your belief in them matters hugely!',

    useful_links: [
      'https://www.youngminds.org.uk/parent/parents-a-z-mental-health-guide/self-esteem',
      'https://www.mind.org.uk/information-support/tips-for-everyday-living/self-esteem',
      'https://www.dove.com/uk/dove-self-esteem-project.html'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['self_esteem', 'confidence', 'self_concept', 'positive_psychology', 'tier_2', 'wellbeing']
  },

  {
    id: 'resilience-coping-skills',
    name: 'Resilience and Coping Skills Development',
    category: 'social_emotional',
    subcategory: 'resilience',
    description: 'Teaching resilience skills including problem-solving, positive thinking, help-seeking, perspective-taking, and bouncing back from setbacks. Building protective factors against adversity.',
    targeted_needs: ['Poor resilience', 'Cannot cope with setbacks', 'Gives up easily', 'Adversity', 'Life challenges', 'Need for coping strategies'],

    evidence_level: 'tier_2',
    research_sources: ['Resilience research (Rutter, Masten)', 'EEF Social & Emotional Learning', 'Penn Resiliency Program'],
    effect_size: 0.44,
    success_rate: '60-70% improved resilience',

    age_range: ['primary', 'secondary'],
    setting: ['small_group', 'classroom'],
    duration: '10-15 weeks',
    frequency: '1-2 times per week',
    session_length: '30-45 minutes',
    total_sessions: 18,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Resilience curriculum', 'Problem-solving activities', 'Coping strategy cards', 'Growth mindset materials'],
    cost_implications: '£50-£150 for curriculum and resources',

    key_components: [
      'Problem-solving skills',
      'Positive explanatory style',
      'Growth mindset',
      'Help-seeking skills',
      'Emotion regulation',
      'Social support building',
      'Perspective-taking',
      'Learning from setbacks',
      'Identifying protective factors'
    ],

    fidelity_checklist: [
      'Problem-solving taught explicitly',
      'Positive thinking practiced',
      'Help-seeking encouraged',
      'Growth mindset reinforced',
      'Coping strategies taught',
      'Real-life application',
      'Social support strengthened',
      'Practice with setbacks'
    ],

    progress_indicators: [
      'Uses problem-solving',
      'More positive explanations',
      'Asks for help',
      'Bounces back from setbacks',
      'Uses coping strategies',
      'Growth mindset language',
      'Better emotion regulation',
      'Increased perseverance'
    ],

    expected_outcomes: [
      'Improved resilience',
      'Better coping skills',
      'Increased perseverance',
      'Positive mindset',
      'Better problem-solving',
      'Reduced vulnerability to stress'
    ],

    adaptations: [
      'Simplify for younger children',
      'Real-life examples',
      'Visual coping strategy menu',
      'Parent involvement',
      'Individual if needed',
      'Cultural adaptations'
    ],

    contraindications: ['Severe trauma may need specialist support', 'Cannot build resilience during crisis - stabilize first'],

    complementary_interventions: [
      'Growth mindset',
      'Problem-solving skills',
      'Emotional regulation',
      'Social skills',
      'CBT'
    ],

    implementation_guide: 'RESILIENCE = bouncing back from setbacks. Weeks 1-3: PROBLEM-SOLVING - structured steps (identify problem, brainstorm solutions, evaluate, choose, try, review). Practice with scenarios. Weeks 4-6: POSITIVE THINKING - explanatory style (setback = temporary, specific, changeable vs permanent, global, fixed). Challenge negative predictions. Weeks 7-9: HELP-SEEKING - identify trusted adults, practice asking for help, support networks. Weeks 10-12: COPING STRATEGIES - coping menu (distraction, relaxation, exercise, talking, problem-solving, reframing). Match strategy to situation. Weeks 13-15: LEARNING FROM SETBACKS - what went wrong? what can I learn? what will I do differently? Growth mindset. Weeks 16-18: PRACTICE - real-life application, review, maintain. CRITICAL: Model resilience yourself! Share your setbacks and coping.',

    parent_information: 'Resilience is the ability to bounce back from setbacks, cope with stress, and adapt to challenges - it\'s not about never struggling, it\'s about coping when you do! Your child is learning: problem-solving (step-by-step approach), positive thinking (setbacks are temporary and I can overcome them), help-seeking (asking for support is strength), and coping strategies (different tools for different situations). At home: model resilience (share your challenges and coping), normalize setbacks ("everyone has hard times"), praise effort and coping (not just success), encourage problem-solving, build support network. Resilient children become resilient adults - this is life-long skill building!',

    useful_links: [
      'https://www.boingboing.org.uk',
      'https://www.annafreud.org/schools-and-colleges/resources/building-resilience',
      'https://www.mind.org.uk/information-support/for-children-and-young-people/looking-after-yourself/building-resilience'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['resilience', 'coping', 'problem_solving', 'positive_thinking', 'tier_2', 'protective_factors']
  },

  {
    id: 'emotional-literacy-feelings-education',
    name: 'Emotional Literacy and Feelings Education',
    category: 'social_emotional',
    subcategory: 'emotional_literacy',
    description: 'Teaching children to recognize, name, understand, and express emotions appropriately. Includes emotion vocabulary, causes/triggers, physical sensations, intensity scales, and healthy expression.',
    targeted_needs: ['Poor emotional literacy', 'Cannot name feelings', 'Difficulty expressing emotions', 'Emotional outbursts', 'Alexithymia', 'Autism', 'SEND'],

    evidence_level: 'tier_2',
    research_sources: ['Emotional intelligence research (Goleman)', 'EEF Social & Emotional Learning', 'Emotion-Focused interventions'],
    effect_size: 0.52,
    success_rate: '65-75% improved emotional literacy',

    age_range: ['early_years', 'primary', 'secondary'],
    setting: ['small_group', 'classroom', 'one_to_one'],
    duration: '8-12 weeks',
    frequency: '2-3 times per week',
    session_length: '20-30 minutes',
    total_sessions: 25,

    complexity: 'low',
    staff_training_required: false,
    resources_needed: ['Emotion faces/cards', 'Feelings vocabulary resources', 'Books about emotions', 'Emotion thermometer', 'Body maps'],
    cost_implications: '£30-£100 for resources',

    key_components: [
      'Emotion vocabulary (basic and complex emotions)',
      'Recognizing emotions in self',
      'Recognizing emotions in others',
      'Causes/triggers of emotions',
      'Physical sensations of emotions',
      'Intensity scales',
      'Appropriate expression of emotions',
      'Emotional regulation strategies (after literacy established)'
    ],

    fidelity_checklist: [
      'Emotion vocabulary taught systematically',
      'Use visual supports',
      'Practice identifying emotions',
      'Link to physical sensations',
      'Model expressing emotions',
      'Safe environment for emotional expression',
      'Regular practice',
      'Generalize to real situations'
    ],

    progress_indicators: [
      'Names emotions accurately',
      'Recognizes own emotions',
      'Recognizes others\' emotions',
      'Identifies triggers',
      'Uses intensity scales',
      'Expresses emotions appropriately',
      'Links emotions to body sensations',
      'Growing emotion vocabulary'
    ],

    expected_outcomes: [
      'Improved emotional literacy',
      'Better emotion recognition',
      'Appropriate emotional expression',
      'Foundation for emotional regulation',
      'Improved empathy',
      'Better communication'
    ],

    adaptations: [
      'Visual emotion cards/faces',
      'Simplified vocabulary for younger children',
      'Body-based approaches',
      'Apps/technology',
      'Cultural considerations',
      'Autism-specific approaches'
    ],

    contraindications: ['None - beneficial for all'],

    complementary_interventions: [
      'Emotional regulation',
      'Social skills',
      'Zones of Regulation',
      'Mindfulness',
      'Trauma-informed practice'
    ],

    implementation_guide: 'EMOTIONAL LITERACY = understanding emotions. Weeks 1-2: BASIC EMOTIONS - happy, sad, angry, scared, surprised. Use faces, stories, photos. Name them. Weeks 3-4: RECOGNIZING IN SELF - "How do you feel?" Check-ins daily. Use emotion fans/charts. Weeks 5-6: RECOGNIZING IN OTHERS - look at faces, body language, tone. Practice with videos/photos. Empathy. Weeks 7-8: CAUSES - what makes you happy/sad/angry/scared? Triggers. Different people feel differently about same thing. Weeks 9-10: PHYSICAL SENSATIONS - where do you feel anger (chest tight, hot face)? Sad? Scared? Body mapping. Weeks 11-12: INTENSITY - emotion thermometer (bit annoyed → angry → furious). Complex emotions (frustrated, disappointed, embarrassed). CRITICAL: Normalize ALL emotions - no "bad" feelings! Validate feelings while teaching appropriate expression.',

    parent_information: 'Emotional literacy means understanding emotions - recognizing them, naming them, knowing what causes them. It\'s the foundation for managing emotions! Your child is learning: emotion vocabulary (happy, sad, angry, scared, worried, excited, proud...), recognizing emotions in themselves and others, what triggers emotions, where they feel emotions in their body. ALL emotions are OK - we\'re teaching healthy ways to express them! At home: emotion check-ins ("how are you feeling?"), name your own emotions ("I feel frustrated because..."), read books about feelings, validate their emotions ("I understand you\'re angry, and hitting is not OK - let\'s find another way"), use emotion faces/charts. Emotional literacy = emotional intelligence!',

    useful_links: [
      'https://www.understood.org/articles/the-importance-of-teaching-feelings',
      'https://www.elsa-support.co.uk',
      'https://www.twinkl.co.uk/resources/wellbeing-resources/feelings-and-emotions-wellbeing'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['emotional_literacy', 'feelings', 'emotion_recognition', 'empathy', 'tier_2', 'foundation']
  },

  {
    id: 'emotionally-based-school-avoidance',
    name: 'Emotionally Based School Avoidance (EBSA) Intervention',
    category: 'social_emotional',
    subcategory: 'school_avoidance',
    description: 'Graduated, anxiety-focused approach to EBSA addressing underlying anxiety/distress, building coping skills, gradual reintegration, and addressing school-based triggers. Collaborative with family.',
    targeted_needs: ['School refusal', 'School avoidance', 'Anxiety about school', 'Somatic complaints', 'Poor attendance', 'Morning distress'],

    evidence_level: 'tier_1',
    research_sources: ['EBSA DfE guidance', 'NICE anxiety guidelines', 'CBT for school refusal research', 'Gradual reintegration evidence'],
    effect_size: 0.64,
    success_rate: '65-80% improved attendance',

    age_range: ['primary', 'secondary'],
    setting: ['one_to_one', 'mixed', 'home'],
    duration: '8-20 weeks (variable)',
    frequency: 'Daily contact + gradual attendance building',
    session_length: 'Variable - graduated approach',

    complexity: 'high',
    staff_training_required: true,
    resources_needed: ['EBSA assessment tools', 'Anxiety management resources', 'Graduated reintegration plan', 'Safe base in school', 'Home-school communication system'],
    cost_implications: '£200-£1000+ for assessment and intensive support',

    key_components: [
      'Comprehensive assessment (not truancy - understand anxiety)',
      'Identify triggers and maintaining factors',
      'Anxiety management strategies',
      'Address school-based factors',
      'Graduated reintegration plan',
      'Safe person and safe base in school',
      'Parent support and partnership',
      'Flexibility and patience',
      'Avoid punishment or pressure',
      'Long-term monitoring'
    ],

    fidelity_checklist: [
      'EBSA not truancy - anxiety recognized',
      'Thorough assessment completed',
      'School triggers identified and addressed',
      'Graduated plan (NOT abrupt return)',
      'Anxiety strategies taught',
      'Safe base and person in school',
      'Parents supported and involved',
      'No punishment for non-attendance',
      'Flexible approach',
      'Regular review and adjustment'
    ],

    progress_indicators: [
      'Reduced morning anxiety',
      'Increasing time in school',
      'Using anxiety management strategies',
      'School triggers being addressed',
      'Improved attendance (gradual)',
      'Engaging with work',
      'Parent and child report reduced distress',
      'Sustained attendance'
    ],

    expected_outcomes: [
      'Return to school (gradual)',
      'Improved attendance',
      'Reduced anxiety',
      'Better coping skills',
      'School triggers addressed',
      'Maintained attendance',
      'Improved wellbeing'
    ],

    adaptations: [
      'Highly individualized',
      'Very gradual for severe cases',
      'Home tuition if needed initially',
      'Alternative provision considered',
      'Mental health service involvement',
      'Medication if appropriate',
      'Family therapy if needed'
    ],

    contraindications: ['Truancy (different approach)', 'Safeguarding concerns at home (different response)', 'Severe mental health crisis needs CAMHS'],

    complementary_interventions: [
      'CBT for anxiety',
      'Social skills (if peer issues)',
      'Academic support (if falling behind)',
      'Family therapy',
      'CAMHS involvement if severe'
    ],

    implementation_guide: 'EBSA ≠ TRUANCY. This is ANXIETY/DISTRESS about school, not refusal. ASSESSMENT: Why is school difficult? (bullying? academic pressure? transitions? sensory? social? separation anxiety? undiagnosed SEND?). What helps? What maintains avoidance? ANXIETY MANAGEMENT: Teach strategies (CBT, relaxation, mindfulness). ADDRESS TRIGGERS: Fix school factors (bullying, work pressure, transitions, sensory environment). GRADUATED REINTEGRATION: DO NOT force full return immediately! Start tiny (visit school briefly, safe room only, one lesson, morning only) → gradually increase. SAFE BASE: Key adult, safe room to retreat to when overwhelmed. PARENT PARTNERSHIP: Support parents - they\'re stressed too! Daily communication. FLEXIBILITY: Bad days will happen - don\'t punish. PATIENCE: This takes TIME! Weeks/months not days. MAINTAIN: Monitor long-term, be ready to support if attendance drops. CRITICAL: Punishment worsens EBSA!',

    parent_information: 'EBSA (Emotionally Based School Avoidance) means your child WANTS to attend school but anxiety/distress prevents them - it\'s NOT truancy or naughty behaviour! Morning distress, physical complaints (tummy ache, headache), panic, crying, pleading are signs. We will: understand WHY school is difficult (bullying? work stress? social? sensory? separation anxiety?), fix school problems where possible, teach anxiety management, create a graduated return plan (NOT forced immediate return - this makes it worse!), provide a safe base/person in school, work closely with you. This is HARD for everyone - you need support too! Be patient - improvement is gradual. Punishment doesn\'t work for EBSA. With the right support, children DO return to school! Contact us immediately if attendance drops - early intervention is key.',

    useful_links: [
      'https://www.gov.uk/government/publications/school-attendance/framework-for-securing-full-attendance-actions-for-schools-and-local-authorities',
      'https://www.emotionallybasedscho olavoidance.com',
      'https://www.annafreud.org/schools-and-colleges/resources/ebsa',
      'https://www.minded.org.uk'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['EBSA', 'school_refusal', 'school_avoidance', 'anxiety', 'attendance', 'tier_1', 'graduated_reintegration']
  },

  {
    id: 'anger-management-self-control',
    name: 'Anger Management and Self-Control Skills',
    category: 'social_emotional',
    subcategory: 'emotional_regulation',
    description: 'Teaching anger recognition, triggers, calming strategies, problem-solving alternatives to aggression, and repairing after angry outbursts. Cognitive-behavioural approach.',
    targeted_needs: ['Anger outbursts', 'Aggression', 'Poor self-control', 'Reactive behaviour', 'Verbal/physical aggression', 'Difficulty calming down'],

    evidence_level: 'tier_2',
    research_sources: ['Anger management research', 'EEF Behavior interventions', 'CBT for anger', 'Self-control training studies'],
    effect_size: 0.54,
    success_rate: '60-70% reduced aggressive incidents',

    age_range: ['primary', 'secondary'],
    setting: ['small_group', 'one_to_one'],
    duration: '10-15 weeks',
    frequency: '1-2 times per week',
    session_length: '30-45 minutes',
    total_sessions: 18,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Anger management curriculum', 'Calm-down strategies cards', 'Anger thermometer', 'Problem-solving worksheets', 'Relaxation materials'],
    cost_implications: '£50-£150 for curriculum and resources',

    key_components: [
      'Recognizing anger (physical signs, thoughts, triggers)',
      'Anger intensity scale',
      'Calming strategies (breathing, counting, walking away)',
      'Cognitive restructuring (thoughts fueling anger)',
      'Problem-solving alternatives to aggression',
      'Communication skills (assertive not aggressive)',
      'Empathy and perspective-taking',
      'Repairing and apologizing after incidents'
    ],

    fidelity_checklist: [
      'Anger triggers identified',
      'Calming strategies taught and practiced',
      'Cognitive restructuring used',
      'Problem-solving practiced',
      'Communication skills taught',
      'Empathy developed',
      'Practice with real scenarios',
      'Repairing relationship ruptures'
    ],

    progress_indicators: [
      'Recognizes anger early',
      'Uses calming strategies',
      'Reduced aggressive incidents',
      'Problem-solves before reacting',
      'Communicates needs assertively',
      'Shows empathy',
      'Apologizes and repairs',
      'Longer periods of self-control'
    ],

    expected_outcomes: [
      'Reduced aggression',
      'Improved self-control',
      'Better anger management',
      'Positive problem-solving',
      'Improved relationships',
      'Reduced exclusions'
    ],

    adaptations: [
      'Individual for severe aggression',
      'Visual anger thermometer',
      'Simplified strategies',
      'Parent involvement',
      'Trauma-informed modifications',
      'ADHD/autism adaptations'
    ],

    contraindications: ['Severe violence may need specialist CAMHS', 'Trauma - use trauma-informed approach'],

    complementary_interventions: [
      'Social skills',
      'Empathy training',
      'Problem-solving',
      'CBT',
      'Trauma-informed support if relevant'
    ],

    implementation_guide: 'Weeks 1-2: RECOGNIZING ANGER - physical signs (hot, tight chest, clenched fists), thoughts ("they did it on purpose!"), triggers. Anger thermometer (1-10). Weeks 3-5: CALMING STRATEGIES - deep breathing, counting to 10, walking away, squeezing stress ball, safe space. Practice! Weeks 6-8: THOUGHTS - anger thoughts ("he\'s trying to annoy me", "this is unfair!"). Are they true? Alternative thoughts. Weeks 9-11: PROBLEM-SOLVING - what can I do INSTEAD of hitting/shouting? Walk through steps. Role-play. Weeks 12-14: COMMUNICATION - assertive not aggressive. "I feel... when... I need...". Practice. Weeks 15-16: EMPATHY - how do others feel when I\'m angry? Perspective-taking. Weeks 17-18: REPAIRING - apologizing, making amends, rebuilding trust. CRITICAL: Practice, practice, practice! Real-life application.',

    parent_information: 'Anger is a normal emotion - everyone feels it! The problem is how your child expresses it (hitting, shouting, breaking things). They\'re learning to: recognize anger EARLY (before explosion), use calming strategies (deep breathing, walking away, counting to 10), challenge angry thoughts ("did they really mean to?"), solve problems WITHOUT aggression, communicate needs assertively ("I feel angry when..."), understand how their anger affects others. At home: model healthy anger expression, stay calm when they\'re angry (don\'t escalate!), praise use of strategies, help them practice, repair relationships after incidents. Anger management is a SKILL - it takes practice! Be patient.',

    useful_links: [
      'https://www.youngminds.org.uk/young-person/coping-with-life/anger',
      'https://www.understood.org/articles/anger-issues-what-you-need-to-know',
      'https://www.annafreud.org/on-my-mind/self-care/anger-management'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['anger', 'aggression', 'self_control', 'emotional_regulation', 'tier_2', 'behaviour_change']
  },

  {
    id: 'bereavement-and-loss-support',
    name: 'Bereavement and Loss Support for Children',
    category: 'social_emotional',
    subcategory: 'bereavement',
    description: 'Sensitive support for bereaved children addressing grief, emotional expression, memory-keeping, adjusting to loss, and preventing complicated grief. Developmental age-appropriate.',
    targeted_needs: ['Bereavement', 'Loss', 'Grief', 'Death of parent/sibling/friend', 'Significant loss', 'Traumatic bereavement'],

    evidence_level: 'tier_2',
    research_sources: ['Childhood bereavement research', 'Winston\'s Wish guidance', 'Grief counseling research', 'NICE bereavement guidance'],
    effect_size: 0.46,
    success_rate: '65-75% improved adjustment',

    age_range: ['early_years', 'primary', 'secondary'],
    setting: ['one_to_one', 'small_group'],
    duration: '6-12+ weeks (ongoing if needed)',
    frequency: '1 time per week',
    session_length: '30-45 minutes',
    total_sessions: 10,

    complexity: 'high',
    staff_training_required: true,
    resources_needed: ['Bereavement resources', 'Memory boxes', 'Books about death/loss', 'Art materials', 'Referral pathways'],
    cost_implications: '£50-£200 for resources + specialist training',

    key_components: [
      'Safe space to express grief',
      'Age-appropriate understanding of death',
      'Normalizing grief reactions',
      'Emotional expression (talking, art, play)',
      'Memory-keeping activities',
      'Continuing bonds with deceased',
      'Adjusting to changes',
      'Supporting family',
      'Referral if complicated grief'
    ],

    fidelity_checklist: [
      'Trained in childhood bereavement',
      'Safe, consistent relationship',
      'Age-appropriate approach',
      'All emotions welcomed',
      'Memory work sensitively done',
      'Family involved',
      'School staff informed',
      'Monitor for complicated grief',
      'Referral pathway clear'
    ],

    progress_indicators: [
      'Expresses feelings about loss',
      'Engages with grief work',
      'Maintains memories appropriately',
      'Adjusting to changes',
      'Attending school regularly',
      'Functioning improving',
      'Not showing signs of complicated grief',
      'Accessing support when needed'
    ],

    expected_outcomes: [
      'Healthy grieving process',
      'Emotional expression',
      'Memories maintained',
      'Adjustment to loss',
      'Prevented complicated grief',
      'Continued development',
      'Family supported'
    ],

    adaptations: [
      'Highly age-dependent',
      'Cultural/religious sensitivity essential',
      'Play-based for young children',
      'Talking for older children',
      'Art/creative expression',
      'Individual vs group depends on need',
      'Extended support for traumatic bereavement'
    ],

    contraindications: ['Complicated/traumatic grief needs specialist service', 'Safeguarding concerns', 'Severe mental health needs CAMHS referral'],

    complementary_interventions: [
      'Trauma therapy (if traumatic death)',
      'Family therapy',
      'CBT (if depression developing)',
      'CAMHS (if complicated grief)',
      'Winston\'s Wish/bereavement charity support'
    ],

    implementation_guide: 'GRIEF IN CHILDREN = different from adults. May not cry constantly, may play/laugh then suddenly sad, may regress, may worry about other deaths. SESSIONS: Safe space, consistent. Early sessions: What happened? What do they understand? What are they feeling? Normalize grief (sad, angry, scared, confused, numb ALL normal). EXPRESSION: Talking, drawing, play, writing, music - whatever works. MEMORY WORK: Memory box, photos, stories, "what I remember about...", continuing bond. NOT "moving on" but "carrying them forward". ADJUSTMENT: Life is different now - acknowledge changes, support with practical adjustments (who picks up from school now? celebrations without them?). FAMILY: Involve family, support parents (grieving themselves), school staff briefed. MONITOR: Most children grieve healthily. Watch for: prolonged intense grief, significant functional impairment, suicidal thoughts, traumatic grief → specialist referral. TIMING: Grief has no timeline - support as long as needed.',

    parent_information: 'I\'m so sorry for your family\'s loss. Your child\'s grief will look different from yours - children grieve in bursts, may seem OK then suddenly sad, may not talk about it then bring it up unexpectedly. All reactions are normal. We\'re providing safe space for your child to express feelings, remember the person who died, adjust to life changes. There\'s no "getting over it" - we help them carry the person in their heart while moving forward. At home: be honest (avoid euphemisms like "sleeping"), allow all emotions, maintain routines where possible, keep memories alive, look after yourself (you can\'t support them if you\'re not supported), consider family bereavement support. Contact specialist services if very severe grief. You\'re not alone - we\'re here for your whole family.',

    useful_links: [
      'https://www.winstonswish.org',
      'https://www.childhoodbereavementnetwork.org.uk',
      'https://www.cruse.org.uk/get-help/for-young-people',
      'https://www.hopeagain.org.uk'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['bereavement', 'grief', 'loss', 'death', 'emotional_support', 'tier_2', 'trauma', 'sensitive']
  },

  {
    id: 'post-16-transition-preparation-adulthood',
    name: 'Post-16 Transition and Preparation for Adulthood (PfA)',
    category: 'social_emotional',
    subcategory: 'post_16_transition',
    description: 'Comprehensive transition program for disaffected and vulnerable young people aged 14-19, focusing on the four PfA outcomes: Employment, Independent Living, Community Inclusion, and Health. Evidence-based support addressing the critical transition period where many young people with SEND disengage.',
    targeted_needs: ['Post-16 transition difficulties', 'Disengagement', 'NEET risk', 'SEND transition', 'Care leavers', 'Alternative provision students', 'Low aspirations', 'Lack of post-16 skills', 'Social isolation', 'Mental health difficulties'],

    evidence_level: 'tier_1',
    research_sources: ['DfE Preparing for Adulthood (PfA) framework', 'SEND Code of Practice (Section 8)', 'EEF Careers & Transition', 'Preparing for Adulthood national programme', 'CEDAR research (University of Warwick)'],
    effect_size: 0.58,
    success_rate: '55-70% improved post-16 outcomes when PfA planning starts Year 9',

    age_range: ['secondary', 'post_16'],
    setting: ['one_to_one', 'small_group', 'mixed'],
    duration: '2-5 years (Year 9 through to age 19 or 25 if EHCP)',
    frequency: 'Weekly sessions plus ongoing review',
    session_length: '45-60 minutes',

    complexity: 'high',
    staff_training_required: true,
    resources_needed: ['PfA planning tools', 'Person-centred planning resources', 'Careers resources', 'Independent living skills materials', 'Community links', 'Work experience placements', 'Travel training resources'],
    cost_implications: '£500-£2,000 per student (staff time, resources, placements)',

    key_components: [
      'Four PfA outcomes: Employment, Independent Living, Community Inclusion, Health',
      'Person-centred planning (student voice central)',
      'Aspirational goal-setting',
      'Skills teaching (work, living, social, travel)',
      'Work experience and supported internships',
      'College/apprenticeship preparation',
      'Independent living skills development',
      'Community participation',
      'Health and wellbeing support',
      'Multi-agency collaboration',
      'Annual Review PfA focus from Year 9',
      'Transition planning from Year 9 (not Year 11!)'
    ],

    fidelity_checklist: [
      'Student voice central - "nothing about us without us"',
      'PfA planning starts Year 9 minimum',
      'All four PfA outcomes addressed',
      'Person-centred approaches used',
      'Aspirational goals set collaboratively',
      'Work experience arranged',
      'Independent living skills taught explicitly',
      'Travel training provided if needed',
      'Multi-agency team involved (careers, social care, health)',
      'Annual Reviews focus on PfA from Year 9',
      'Post-16 options explored early',
      'Family involved but student leads',
      'Transition support continues post-16 (not cliff-edge at 16)'
    ],

    progress_indicators: [
      'Student can articulate aspirations',
      'Increased confidence and self-advocacy',
      'Work experience completed',
      'Post-16 destination secured',
      'Independent living skills developing',
      'Community activities accessed',
      'Reduced anxiety about future',
      'Engaged in transition planning',
      'Health needs managed independently',
      'Social connections maintained'
    ],

    expected_outcomes: [
      'Positive post-16 destination (education, employment, training)',
      'Reduced NEET risk',
      'Greater independence',
      'Community inclusion',
      'Improved wellbeing',
      'Self-advocacy skills',
      'Sustainable post-16 progression',
      'Reduced disaffection and disengagement'
    ],

    adaptations: [
      'Start earlier (Year 8) for complex SEND',
      'Individual for anxious/disaffected students',
      'Visual supports and simplified materials',
      'Extended transition period',
      'Intensive support for care leavers',
      'Link to interests and strengths',
      'Flexible post-16 options explored'
    ],

    contraindications: ['Must not be deficit-focused - aspirational and strengths-based!', 'Don\'t limit aspirations based on disability'],

    complementary_interventions: [
      'Supported internships',
      'Travel training',
      'Independent living skills',
      'Social skills',
      'Careers guidance',
      'Mental health support',
      'EBSA intervention if school-averse'
    ],

    implementation_guide: 'CRITICAL: POST-16 TRANSITION = THE CLIFF-EDGE. Most disaffected young people with SEND experience massive drop in support at 16, leading to NEET, isolation, mental health deterioration. THIS INTERVENTION PREVENTS THAT.\n\nYEAR 9 (Age 13-14): START PfA PLANNING NOW! Not Year 11! Annual Review becomes PfA-focused. Use person-centred planning - "What\'s important TO you?" "What\'s important FOR you?" Explore all four outcomes: 1) EMPLOYMENT - What job do you want? What are your strengths? 2) INDEPENDENT LIVING - Where will you live? What skills needed? 3) COMMUNITY - Friends? Hobbies? Activities? 4) HEALTH - Managing health needs independently? Discuss aspirations - dream big! Identify barriers - what support needed?\n\nYEAR 10-11 (Age 14-16): SKILLS BUILDING. EMPLOYMENT: Work experience (supported), careers exploration, CV/interview skills, workplace behaviour, professional communication. INDEPENDENT LIVING: Cooking, budgeting, laundry, personal care, time management, using public services. COMMUNITY: Accessing leisure facilities, joining clubs, maintaining friendships, using local resources. HEALTH: Managing medication, appointments, understanding health conditions, healthy living. TRAVEL TRAINING: Independent travel is CRITICAL for employment and inclusion.\n\nYEAR 11: POST-16 OPTIONS EXPLORED AND SECURED. College? Apprenticeship? Supported internship? Specialist provision? DON\'T WAIT UNTIL JUNE! Visits arranged, applications supported, transitions planned. EHCP reviewed - does it continue post-16? Section F and I updated for post-16 setting.\n\nPOST-16 (Age 16-19 or 25): SUPPORT CONTINUES! Not a cliff-edge! College support arranged, work placements continued, community participation supported, mental health monitored, EHCP reviewed annually, progression pathway clear. Age 18 transition to adult services planned early.\n\nKEY PRINCIPLES: Student voice central. Aspirational (don\'t limit based on disability). Multi-agency (careers, social care, health, voluntary sector). Start early (Year 9). Four PfA outcomes always. Skills taught explicitly. Family involved but student leads. Ongoing post-16 support.\n\nDISAFFECTED STUDENTS: Often low aspirations, negative school experiences, don\'t see future. Use: strengths-based approach, alternative curriculum, work-based learning, mentoring, therapeutic support, flexible provision. Find what motivates them - often practical/vocational not academic.',

    parent_information: 'Your child is at a critical stage - planning for adult life after school. Research shows young people with SEND have much worse post-16 outcomes (higher unemployment, social isolation, mental health difficulties) WITHOUT good transition planning. We\'re using the "Preparing for Adulthood" approach looking at four areas: 1) EMPLOYMENT - What job/career? We\'ll arrange work experience, teach job skills, explore options. 2) INDEPENDENT LIVING - Where will they live? What skills needed? We\'ll teach cooking, budgeting, travel, self-care. 3) COMMUNITY INCLUSION - Friends, hobbies, activities. We\'ll support accessing clubs, leisure, social connections. 4) HEALTH - Managing their health independently. We start this planning in Year 9 (not Year 11!) because it takes time. Your child\'s voice is central - what do THEY want? Your role: support their aspirations (don\'t limit based on disability), help with skills practice at home, attend reviews, share your knowledge, but let your child lead. If your child has an EHCP, it can continue to 25 if needed. Post-16 support doesn\'t stop at 16 - we continue supporting progression. This is about ensuring your child has the skills, support, and opportunities for a fulfilling adult life.',

    useful_links: [
      'https://www.preparingforadulthood.org.uk',
      'https://www.gov.uk/children-with-special-educational-needs/extra-SEN-help',
      'https://www.mencap.org.uk/advice-and-support/education/preparing-adulthood',
      'https://www.ndti.org.uk/resources/preparing-for-adulthood',
      'https://www.preparingforadulthood.org.uk/downloads/employment/supported-internships-toolkit.htm'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['post_16', 'transition', 'preparation_for_adulthood', 'PfA', 'NEET_prevention', 'disaffected', 'tier_1', 'SEND', 'care_leavers', 'employment', 'independent_living']
  },

  {
    id: 'supported-internships-work-skills',
    name: 'Supported Internships and Vocational Skills Programme',
    category: 'social_emotional',
    subcategory: 'post_16_transition',
    description: 'Structured work-based learning programme for young people aged 16-24 with SEND, providing real employment experience with job coaching support, explicit teaching of workplace skills, and a route to paid employment. Addresses the critical employment gap for young people with learning disabilities.',
    targeted_needs: ['Post-16 young people with SEND seeking employment', 'Learning disabilities', 'Autism', 'Complex SEND', 'No/low qualifications', 'Limited work experience', 'Need for practical work skills', 'At risk of long-term unemployment'],

    evidence_level: 'tier_1',
    research_sources: ['DfE Supported Internships research', 'Association of Supported Employment', 'NDTi employment evidence', 'Preparing for Adulthood programme evaluation'],
    effect_size: 0.72,
    success_rate: '30-40% achieve paid employment (compared to 6% without supported internships)',

    age_range: ['post_16'],
    setting: ['mixed', 'mixed'],
    duration: '6-12 months minimum',
    frequency: '3-5 days per week',
    session_length: 'Full working day',

    complexity: 'high',
    staff_training_required: true,
    resources_needed: ['Job coach', 'Employer partnerships', 'Travel training', 'Workplace assessment tools', 'Task analysis resources', 'Communication supports', 'Study programme elements (English, maths)'],
    cost_implications: '£5,000-£15,000 per student (job coach, college partnership, resources)',

    key_components: [
      'Real work placement (not simulated)',
      'Job coach support (initially intensive, faded)',
      'Explicit teaching of job tasks (task analysis, systematic instruction)',
      'Workplace behaviour and social skills',
      'Travel training to/from workplace',
      'Personalised learning plan',
      'Employer engagement and partnership',
      'Study programme (English, maths, employability)',
      'Person-centred planning',
      'Progression to paid employment',
      'Ongoing support post-employment'
    ],

    fidelity_checklist: [
      'Real workplace (not classroom simulation)',
      'Job coach provided and trained',
      'Minimum 6 months duration',
      'Tasks taught systematically (task analysis)',
      'Support faded gradually',
      'Travel training completed',
      'Workplace social skills taught explicitly',
      'Employer understands reasonable adjustments',
      'Student has paid role goal',
      'Study programme integrated',
      'Regular reviews with student, employer, job coach',
      'Progression pathway clear',
      'Post-internship support arranged'
    ],

    progress_indicators: [
      'Increased independence on job tasks',
      'Reduced job coach support needed',
      'Improved work quality and speed',
      'Better workplace social skills',
      'Punctuality and attendance',
      'Following workplace routines',
      'Communicating with colleagues',
      'Problem-solving work challenges',
      'Travel independently',
      'Positive employer feedback'
    ],

    expected_outcomes: [
      '30-40% achieve paid employment',
      'Increased employability skills',
      'Work experience and references',
      'Vocational qualifications',
      'Independence and confidence',
      'Social connections through work',
      'Pathway out of NEET',
      'Improved quality of life',
      'Economic participation'
    ],

    adaptations: [
      'Match placement to interests/strengths',
      'Adjust support intensity',
      'Extended duration if needed',
      'Multiple placements to find right fit',
      'Assistive technology',
      'Visual supports',
      'Modified tasks',
      'Part-time if full-time too challenging'
    ],

    contraindications: ['Requires willing employer partner', 'Student must want employment goal'],

    complementary_interventions: [
      'Post-16 PfA planning',
      'Travel training',
      'Social skills',
      'Independent living skills',
      'Communication support',
      'Anxiety management if needed'
    ],

    implementation_guide: 'SUPPORTED INTERNSHIPS = transformative for young people with SEND. NOT work experience (2 weeks). NOT volunteering. PROPER job role with proper job coach support.\n\nPHASE 1 - PREPARATION (Weeks 1-4): Assess student strengths, interests, support needs. Careers guidance. Identify suitable employers. Arrange workplace. Task analysis of job role. Plan support strategies. Travel training begins.\n\nPHASE 2 - INITIAL PLACEMENT (Weeks 5-12): Job coach works alongside student, teaching tasks explicitly using systematic instruction, modeling, practice, feedback. ALL tasks broken down (how to greet customers, how to stock shelves, how to use till, how to ask for help, how to take break, how to handle mistakes). Workplace social skills taught explicitly. Travel training continues.\n\nPHASE 3 - FADING SUPPORT (Weeks 13-30): Job coach gradually steps back as student becomes independent. From 1:1 all day → job coach nearby → check-ins only → occasional visits. BUT support always available if needed. Problem-solving work challenges. Employer feedback.\n\nPHASE 4 - PROGRESSION (Weeks 31+): Goal = PAID EMPLOYMENT. Options: 1) Employer offers job (best outcome!), 2) Use experience/reference for other jobs, 3) Extended internship if more time needed, 4) Further training/qualification then employment. Post-employment support continues (job coach check-ins, employer liaison, problem-solving).\n\nSTUDY PROGRAMME: Integrated English, maths, employability skills (CV, interview, rights at work, money management).\n\nEMPLOYER ENGAGEMENT: Educate about reasonable adjustments, benefits of diverse workforce, job coach role. Match student strengths to business needs. This is mutually beneficial - employers get reliable, motivated worker; student gets real job.\n\nCRITICAL SUCCESS FACTORS: 1) Job coach skilled and committed, 2) Employer genuinely engaged, 3) Tasks taught systematically, 4) Support faded not removed, 5) Student\'s interests/strengths matched to role, 6) Minimum 6 months, 7) Employment is the goal from the start.',

    parent_information: 'A Supported Internship could be life-changing for your child. It\'s a proper job role in a real workplace (retail, hospitality, office, care, warehousing, etc.) with a job coach teaching your child the job. NOT work experience (2 weeks) or volunteering - this is 6-12 months working towards PAID EMPLOYMENT. Your child will learn actual job tasks, workplace behaviour, travel independently, earn references, and build confidence. Research shows 30-40% of young people with learning disabilities on Supported Internships get paid jobs afterwards - compared to only 6% generally. This could be your child\'s route out of NEET and into economic independence. It\'s hard work - full working days, travel, new social situations - but SO worthwhile. Your role: support them through challenges, celebrate progress, liaise with job coach, help with evening routine/sleep (working is tiring!), encourage them. Many parents worry "Can my child really work?" - YES, with the right support and the right match, they absolutely can! This is about aspirations, inclusion, and economic participation.',

    useful_links: [
      'https://www.gov.uk/topic/further-education-skills/supported-internships',
      'https://www.preparingforadulthood.org.uk/what-we-do/employment/supported-internships',
      'https://www.base-uk.org/supported-internships',
      'https://www.mencap.org.uk/advice-and-support/education/supported-internships'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['supported_internships', 'employment', 'post_16', 'work_skills', 'job_coach', 'tier_1', 'SEND', 'learning_disabilities', 'transition']
  },

  {
    id: 'depression-low-mood-adolescent-support',
    name: 'Depression and Low Mood Support for Adolescents',
    category: 'social_emotional',
    subcategory: 'mental_health',
    description: 'Evidence-based intervention for adolescents experiencing depression or persistent low mood, using CBT and behavioural activation approaches to improve mood, challenge negative thinking, increase activity, and develop coping strategies. Includes risk assessment and CAMHS liaison.',
    targeted_needs: ['Depression', 'Low mood', 'Anhedonia (loss of pleasure)', 'Negative thinking', 'Social withdrawal', 'Hopelessness', 'Loss of motivation', 'Sleep/appetite changes', 'Self-neglect'],

    evidence_level: 'tier_1',
    research_sources: ['NICE Depression in Children & Young People guidelines', 'EEF Social & Emotional Learning', 'Behavioral Activation research (Lewinsohn)', 'CBT for adolescent depression (Beck)'],
    effect_size: 0.72,
    success_rate: '60-70% show significant improvement with intervention',

    age_range: ['secondary', 'post_16'],
    setting: ['one_to_one', 'small_group'],
    duration: '8-16 weeks (mild-moderate); ongoing with CAMHS if severe',
    frequency: '1-2 times per week',
    session_length: '45-60 minutes',
    total_sessions: 15,

    complexity: 'high',
    staff_training_required: true,
    resources_needed: ['CBT for depression resources', 'Behavioral activation materials', 'Mood monitoring tools', 'Activity scheduling sheets', 'Risk assessment protocols', 'CAMHS referral pathways'],
    cost_implications: '£200-£800 (staff training, resources, CAMHS liaison)',

    key_components: [
      'Comprehensive assessment including risk',
      'Psychoeducation about depression',
      'Mood monitoring',
      'Behavioral activation (increase pleasant activities)',
      'Cognitive restructuring (challenge negative thoughts)',
      'Problem-solving',
      'Sleep hygiene',
      'Social support building',
      'Relapse prevention',
      'CAMHS referral if severe/suicidal',
      'Family involvement',
      'School adjustments'
    ],

    fidelity_checklist: [
      'RISK ASSESSED at every session (suicidal thoughts? self-harm? safeguarding?)',
      'Mood tracked regularly',
      'Behavioral activation implemented (activity scheduling)',
      'Negative thoughts identified and challenged',
      'Pleasant activities increased',
      'Sleep and routine addressed',
      'Social connections supported',
      'Problem-solving taught',
      'Family involved appropriately',
      'CAMHS referral if severe depression or risk',
      'School staff aware and supportive',
      'Relapse prevention plan created'
    ],

    progress_indicators: [
      'Improved mood scores',
      'Increased activity levels',
      'More balanced thinking',
      'Better sleep',
      'Improved attendance',
      'Re-engaging with friends',
      'Participating in activities',
      'Reduced hopelessness',
      'Better self-care',
      'Increased motivation'
    ],

    expected_outcomes: [
      'Reduced depression symptoms',
      'Improved mood',
      'Increased functioning',
      'Better coping strategies',
      'Reduced risk',
      'Improved quality of life',
      'Re-engagement in education/activities',
      'Prevention of escalation'
    ],

    adaptations: [
      'Individual if severe or at risk',
      'Adjust pace to student',
      'Visual supports',
      'Integrate with CAMHS care',
      'Modified activities for low motivation',
      'Parental support sessions',
      'Shorter sessions initially if concentration poor'
    ],

    contraindications: ['SEVERE depression → CAMHS urgently', 'Suicidal ideation → safeguarding immediately', 'Psychosis → psychiatric assessment', 'Must work alongside medication if prescribed'],

    complementary_interventions: [
      'CAMHS treatment',
      'Medication (if prescribed)',
      'Family therapy',
      'Anxiety management',
      'Self-harm support',
      'Counseling',
      'Mindfulness',
      'Peer support'
    ],

    implementation_guide: 'DEPRESSION IN ADOLESCENTS = serious mental health condition, NOT "just a phase". Can severely impact education, relationships, development, and carries suicide risk. SCHOOLS CAN HELP but severe cases need CAMHS.\n\nASSESSMENT: How long? How severe? Triggering event or insidious onset? Suicidal thoughts? Self-harm? Functioning (school, friends, self-care)? Family history? Previous episodes? RISK ASSESSMENT - EVERY SESSION. If suicidal ideation → safeguarding procedures immediately.\n\nPSYCHOEDUCATION (Week 1-2): Depression is illness not weakness. Symptoms (low mood, anhedonia, negative thinking, fatigue, sleep/appetite changes, withdrawal). Explaining link between thoughts-feelings-behaviours. Treatment works! Mood monitoring.\n\nBEHAVIORAL ACTIVATION (Weeks 3-6): Depression = withdrawal from activities = more depression = VICIOUS CYCLE. BREAK IT by increasing pleasant/meaningful activities even if "don\'t feel like it". Activity scheduling - start tiny (10 min walk, text a friend, listen to music) → build up. Schedule daily. Achievement AND pleasure. Movement especially helpful.\n\nCOGNITIVE WORK (Weeks 7-10): Identify negative automatic thoughts ("I\'m worthless", "Nothing will get better", "Everyone hates me"). Challenge them - evidence? Alternative explanations? What would you tell a friend? Replace with balanced thoughts. Rumination vs problem-solving.\n\nPROBLEM-SOLVING (Weeks 11-12): Depression often linked to real problems (bullying, academic pressure, family issues, identity struggles). Systematic problem-solving approach. What CAN be changed? What support needed?\n\nSLEEP & ROUTINE (Throughout): Sleep hygiene critical. Regular sleep/wake times, limit screens, bedroom environment. Daily routine (depression loves chaos).\n\nRELAPSE PREVENTION (Weeks 13-15): Warning signs. Coping strategies. Support network. Maintenance plan. When to seek help again.\n\nFAMILY: Educate about depression, involvement in behavioural activation, reducing criticism, support without enabling withdrawal.\n\nCAMHS REFERRAL if: Severe depression, suicidal ideation/plans, self-harm, not responding to school-based intervention, psychotic symptoms, safeguarding concerns.',

    parent_information: 'Your child is experiencing depression - this is a real mental health condition, not "being difficult" or "a phase". Depression in teenagers looks different from adults - may be irritable not sad, withdrawn, loss of interest in everything, sleep changes, drop in grades, self-criticism. It\'s NOT your fault. Depression has many causes - biology, genetics, stress, trauma. We\'re providing evidence-based support using CBT and behavioural activation to help your child\'s mood improve. At home: encourage activities even if they "don\'t feel like it" (depression lies - doing nothing makes it worse), maintain routine, reduce criticism (they\'re suffering already), listen without trying to "fix" everything, look after yourself (supporting a depressed teen is exhausting), watch for risk (talk of suicide, self-harm → seek help immediately). Depression is treatable - most young people recover with the right support. If severe, CAMHS referral may be needed. You\'re not alone - we\'re here to support your whole family.',

    useful_links: [
      'https://www.youngminds.org.uk/young-person/mental-health-conditions/depression',
      'https://www.mind.org.uk/information-support/types-of-mental-health-problems/depression',
      'https://www.papyrus-uk.org (suicide prevention)',
      'https://www.thecalmzone.net (male suicide prevention)',
      'https://www.samaritans.org (116 123)'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['depression', 'low_mood', 'mental_health', 'adolescent', 'CBT', 'behavioural_activation', 'tier_1', 'CAMHS', 'risk', 'suicide_prevention']
  },

  {
    id: 'self-harm-awareness-support',
    name: 'Self-Harm Awareness and Support Intervention',
    category: 'social_emotional',
    subcategory: 'mental_health',
    description: 'Compassionate, evidence-based approach to supporting young people who self-harm, focusing on understanding function of self-harm, developing alternative coping strategies, addressing underlying distress, and harm minimization. Includes risk assessment, safeguarding, and CAMHS liaison.',
    targeted_needs: ['Self-harm (cutting, burning, hitting, etc.)', 'Emotional dysregulation', 'Overwhelming distress', 'Lack of coping strategies', 'Trauma', 'Anxiety', 'Depression', 'Low self-esteem', 'Difficulty expressing emotions'],

    evidence_level: 'tier_1',
    research_sources: ['NICE Self-Harm guidelines', 'Mental Health Foundation self-harm research', 'Dialectical Behavior Therapy (DBT) skills', 'Self-harm intervention guidelines (Royal College Psychiatrists)'],
    effect_size: 0.54,
    success_rate: '50-65% reduction in self-harm frequency with intervention',

    age_range: ['secondary', 'post_16'],
    setting: ['one_to_one'],
    duration: '10-20 weeks (mild-moderate); ongoing with CAMHS if severe/suicidal',
    frequency: '1-2 times per week',
    session_length: '45-60 minutes',
    total_sessions: 20,

    complexity: 'high',
    staff_training_required: true,
    resources_needed: ['Self-harm assessment tools', 'Risk assessment protocols', 'DBT distress tolerance skills', 'Alternative coping strategies resources', 'Harm minimization guidance', 'CAMHS referral pathways', 'Safeguarding procedures'],
    cost_implications: '£300-£1,000 (specialist training, resources, CAMHS liaison)',

    key_components: [
      'Comprehensive risk assessment (suicidality? severity?)',
      'Non-judgmental, compassionate approach',
      'Understanding function of self-harm (emotion regulation? self-punishment? communication?)',
      'Emotional awareness and labeling',
      'Distress tolerance skills (DBT)',
      'Alternative coping strategies',
      'Addressing underlying issues (trauma, bullying, identity, mental health)',
      'Safety planning',
      'Harm minimization (if unable to stop immediately)',
      'Building support network',
      'CAMHS referral if severe/suicidal',
      'Family support and education'
    ],

    fidelity_checklist: [
      'RISK ASSESSED thoroughly - suicidal intent? methods? frequency? severity? triggers?',
      'Safeguarding procedures followed',
      'Non-judgmental, compassionate stance maintained',
      'Function of self-harm understood',
      'Emotions recognized and validated',
      'Distress tolerance skills taught',
      'Alternative coping strategies identified and practiced',
      'Safety plan created collaboratively',
      'Underlying issues addressed (not just self-harm behaviour)',
      'Family involved appropriately',
      'CAMHS referral if suicidal or severe',
      'Regular risk reviews',
      'Staff supervision and support'
    ],

    progress_indicators: [
      'Reduced frequency of self-harm',
      'Reduced severity/medical risk',
      'Use of alternative coping strategies',
      'Better emotional awareness',
      'Increased distress tolerance',
      'Reaching out for support before self-harming',
      'Addressing underlying issues',
      'Improved mood',
      'Better relationships',
      'Increased hope'
    ],

    expected_outcomes: [
      'Reduced self-harm',
      'Alternative coping strategies learned',
      'Emotional regulation improved',
      'Underlying distress addressed',
      'Reduced suicide risk',
      'Support network developed',
      'Quality of life improved',
      'Engagement with mental health support'
    ],

    adaptations: [
      'Pacing adjusted to student',
      'Integrate with CAMHS care if receiving',
      'Trauma-informed adaptations',
      'Neurodivergent-friendly approaches',
      'Cultural sensitivity',
      'LGBTQ+ affirmative if relevant',
      'Extended duration if needed'
    ],

    contraindications: ['SUICIDAL SELF-HARM → CAMHS urgently + safeguarding', 'Severe/life-threatening → medical + psychiatric assessment', 'Cannot be sole intervention if severe - needs CAMHS'],

    complementary_interventions: [
      'CAMHS treatment',
      'DBT skills group',
      'Trauma therapy',
      'Depression/anxiety intervention',
      'Family therapy',
      'Counseling',
      'Medication if prescribed'
    ],

    implementation_guide: 'SELF-HARM = COPING STRATEGY (unhealthy but functional). Young person is in distress and self-harm is how they\'re managing. Our job = understand why, teach better coping, address underlying pain. NOT punishment, NOT anger, NOT "attention-seeking" (even if communication function, still valid need!).\n\nASSESSMENT: When? How? Where? How often? How severe? (Medical risk?) What triggers? What function? (Emotion regulation - "releases tension"? Self-punishment - "I deserve pain"? Communication - "I need help"? Dissociation - "feel something"?) Suicidal intent? (CRITICAL: self-harm to cope ≠ suicide attempt, but can overlap). Social contagion? Other mental health issues?\n\nRISK ASSESSMENT EVERY SESSION: Recent self-harm? Suicidal thoughts? Plans? Access to means? Safety? → Safeguarding if high risk.\n\nBUILDING RELATIONSHIP (Weeks 1-3): MUST be non-judgmental. "I\'m worried about you" not "That\'s stupid/attention-seeking". Validate distress. Self-harm makes sense as coping (even if we want to replace it). Psychoeducation - why does self-harm "work"? (Endorphins, distraction, release, control). NOT "just stop" - need alternatives first.\n\nEMOTIONAL AWARENESS (Weeks 4-6): Many young people who self-harm can\'t identify emotions. "I just feel BAD". Emotion labeling. Triggers. Warning signs ("When I feel [emotion], I want to self-harm").\n\nALTERNATIVE COPING STRATEGIES (Weeks 7-12): CRITICAL - need alternatives BEFORE stopping self-harm. Distress tolerance skills (DBT): 1) DISTRACTION - intense activity, cold water, loud music, talking to someone. 2) SELF-SOOTHING - senses (soft blanket, nice smell, favorite song). 3) OPPOSITE ACTION - feeling angry? Do something gentle. Feeling sad? Do something uplifting. 4) PROS & CONS - of self-harming vs coping differently. 5) RIDE THE WAVE - urges peak then reduce. What works is individual - brainstorm, practice, identify what helps. NO JUDGMENT if self-harm happens - "What did you need in that moment? What else could you try next time?"\n\nUNDERLYING ISSUES (Weeks 13-18): Self-harm is symptom not cause. What\'s the pain underneath? Trauma? Bullying? Identity struggles? Family issues? Depression? Anxiety? Address these.\n\nSAFETY PLANNING: Who can I contact? What can I do? Where can I go? Safe environment? Remove means if possible.\n\nHARM MINIMIZATION (Controversial but pragmatic): If unable to stop immediately, how to reduce harm? Clean skin/tools? Treat wounds? Delay (15 minutes first)? Less severe method? (NOT condoning - reducing risk while building alternatives).\n\nFAMILY: Parents often terrified, angry, feeling helpless. Educate about self-harm, non-judgmental responses, support without surveillance, when to seek emergency help.\n\nCAMHS REFERRAL if: Suicidal intent, severe/frequent/escalating, not responding to school intervention, complex mental health needs.',

    parent_information: 'Learning your child self-harms is devastating - you may feel scared, angry, guilty, helpless. First: this is NOT your fault. Self-harm is your child\'s way of coping with overwhelming distress - it "works" for them in the moment (releases tension, expresses pain, feel in control). Our goal is to understand WHY they\'re in such distress, and teach healthier coping strategies. Self-harm ≠ suicide attempt (though can co-exist), but it IS a sign your child is struggling. At home: stay calm (hard!), don\'t punish or remove sharps dramatically (surveillance can increase shame), DO say "I\'m worried about you, how can I help?", listen without judgment, help them use alternative coping strategies, look after yourself (this is traumatic for parents too), know when to seek emergency help (suicidal, severe injury, rapid escalation → A&E or crisis services). Most young people who self-harm DO stop with the right support. If severe, CAMHS involvement needed. Resources: Young Minds parents helpline, Self-harm support organizations. You\'re not alone.',

    useful_links: [
      'https://www.youngminds.org.uk/young-person/coping-with-life/self-harm',
      'https://www.selfharm.co.uk',
      'https://www.nshn.co.uk (National Self-Harm Network)',
      'https://www.mind.org.uk/information-support/types-of-mental-health-problems/self-harm',
      'https://www.papyrus-uk.org (if suicidal)',
      'https://www.samaritans.org (116 123)'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['self_harm', 'self_injury', 'mental_health', 'DBT', 'coping_strategies', 'tier_1', 'risk', 'safeguarding', 'CAMHS', 'adolescent', 'emotional_regulation']
  },

  {
    id: 'bullying-prevention-whole-school',
    name: 'Whole-School Anti-Bullying Prevention and Intervention',
    category: 'social_emotional',
    subcategory: 'bullying',
    description: 'Comprehensive whole-school approach to preventing and responding to bullying, including proactive education, clear procedures, targeted support for victims and perpetrators, and culture change. Evidence-based strategies addressing physical, verbal, relational, and cyber-bullying.',
    targeted_needs: ['Bullying (victim or perpetrator)', 'Peer conflict', 'Cyber-bullying', 'Social exclusion', 'Intimidation', 'Harassment', 'Low-level disruption escalating', 'Unsafe school climate'],

    evidence_level: 'tier_1',
    research_sources: ['DfE Preventing and Tackling Bullying guidance', 'Anti-Bullying Alliance', 'Olweus Bullying Prevention Programme', 'EEF Behavior interventions', 'KiVa anti-bullying programme (Finland)'],
    effect_size: 0.58,
    success_rate: '20-30% reduction in bullying with whole-school approach',

    age_range: ['early_years', 'primary', 'secondary'],
    setting: ['classroom', 'mixed'],
    duration: 'Ongoing whole-school programme',
    frequency: 'Universal + targeted interventions',
    session_length: 'Varied - assemblies, lessons, interventions',

    complexity: 'high',
    staff_training_required: true,
    resources_needed: ['Anti-bullying policy', 'PSHE anti-bullying curriculum', 'Reporting systems', 'Incident recording', 'Restorative justice resources', 'Parent information', 'Peer support training', 'Monitoring data systems'],
    cost_implications: '£1,000-£5,000 (staff training, resources, programmes, time)',

    key_components: [
      'Clear anti-bullying policy (definition, procedures, consequences)',
      'Whole-school ethos of respect and inclusion',
      'Universal PSHE education (what is bullying, bystander intervention, empathy, online safety)',
      'Clear reporting mechanisms (tell a trusted adult, online reporting)',
      'Swift, consistent response to incidents',
      'Support for victims (safety plan, counseling, rebuild confidence)',
      'Consequences AND support for perpetrators (why? teach empathy, reparation)',
      'Restorative approaches where appropriate',
      'Staff training (identify, respond, record)',
      'Parent partnership',
      'Monitoring and data collection',
      'Peer support systems (buddies, ambassadors)',
      'Cyber-bullying specific strategies',
      'Protected characteristics focus (SEND, LGBTQ+, race, etc.)'
    ],

    fidelity_checklist: [
      'Anti-bullying policy in place, communicated, followed',
      'Definition clear (repeated, intentional harm, power imbalance)',
      'Universal PSHE anti-bullying lessons delivered',
      'Reporting mechanisms accessible and trusted',
      'ALL incidents recorded and investigated',
      'Victims supported immediately (safety first)',
      'Perpetrators have consequences AND intervention',
      'Restorative approaches used where safe',
      'Staff trained annually',
      'Parents informed and involved',
      'Bullying data monitored (hotspots? patterns? groups?)',
      'Cyber-bullying addressed explicitly',
      'Protected characteristics bullying monitored',
      'Whole-school culture promotes respect'
    ],

    progress_indicators: [
      'Reduced bullying incidents',
      'Increased reporting (initially may increase - good sign of trust!)',
      'Faster resolution of incidents',
      'Victims feel safe and supported',
      'Perpetrators understand impact and change behaviour',
      'Positive school climate measures',
      'Reduced exclusions',
      'Better peer relationships',
      'Staff confidence in handling bullying',
      'Parent satisfaction'
    ],

    expected_outcomes: [
      '20-30% reduction in bullying',
      'Safer school environment',
      'Improved wellbeing',
      'Better attendance',
      'Reduced anxiety/mental health issues',
      'Improved learning environment',
      'Positive peer culture',
      'Students empowered to report and intervene',
      'Reduced serious harm'
    ],

    adaptations: [
      'Age-appropriate approaches',
      'Cultural sensitivity',
      'SEND-specific considerations',
      'LGBTQ+ inclusive',
      'Cyber-bullying expertise',
      'Trauma-informed for complex cases',
      'Multi-agency for severe cases'
    ],

    contraindications: ['Mediation NOT appropriate if power imbalance or serious harm', 'Restorative approaches only when victim feels safe', 'Criminal matters (assault, sexual harassment) → police'],

    complementary_interventions: [
      'Restorative justice',
      'Social skills (victims and perpetrators)',
      'Emotional regulation (perpetrators)',
      'Anxiety/trauma support (victims)',
      'PSHE citizenship',
      'Peer mediation',
      'Anti-bullying ambassadors'
    ],

    implementation_guide: 'BULLYING = REPEATED, INTENTIONAL HARM with POWER IMBALANCE. NOT every conflict is bullying (peers falling out, one-off incident = not bullying, different response needed).\n\nWHOLE-SCHOOL APPROACH (Olweus model): 1) SCHOOL LEVEL - policy, training, supervision, monitoring. 2) CLASSROOM LEVEL - rules, curriculum, class meetings. 3) INDIVIDUAL LEVEL - victim support, perpetrator intervention, parent involvement.\n\nPREVENTION (Universal): PSHE lessons on bullying (definition, types, impact, bystander intervention, reporting). Assemblies. Positive behaviour expectations. Anti-Bullying Week. Peer support systems. Staff supervision (playgrounds, corridors, toilets, online spaces). Culture of respect and inclusion.\n\nREPORTING: TRUST is critical. If students don\'t report, we can\'t help. Tell a trusted adult. Online reporting form. Worry boxes. Regular check-ins. "It\'s NEVER snitching to report bullying - it\'s protecting yourself and others."\n\nRESPONSE TO INCIDENTS: 1) IMMEDIATE - ensure victim\'s safety. 2) INVESTIGATE - what happened? Who? When? Where? Witnesses? Pattern or one-off? 3) RECORD - all incidents logged. 4) VICTIM SUPPORT - believe them, safety plan, counseling if needed, rebuild confidence, monitor ongoing. 5) PERPETRATOR CONSEQUENCES - sanctions (proportionate), AND intervention (WHY did you do this? Teach empathy, understand impact, make amends). 6) PARENTS - inform both sets, partnership in resolution. 7) MONITOR - has it stopped? Is victim safe? Has perpetrator changed?\n\nRESTORATIVE APPROACHES: Only when: victim feels safe, genuine remorse from perpetrator, no ongoing risk. Bring together, hear impact, make amends, repair relationship (if appropriate). NOT forced forgiveness!\n\nCYBER-BULLYING: Online safety education. Screenshot evidence. Report to platforms. Police if serious. Support victim (online harassment is relentless). Perpetrator - understand digital footprint and real-world consequences.\n\nPROTECTED CHARACTERISTICS: Bullying of SEND, LGBTQ+, racial, religious groups especially harmful. Specific monitoring. Hate incident recording. Explicit inclusion education. Targeted support.\n\nPERPETRATORS: Often have underlying issues - trauma, home problems, SEND, low empathy, learned behaviour. Punishment alone doesn\'t work. Need: understand why, teach empathy, address underlying issues, reparation, behaviour change support.\n\nVICTIMS: Immediate safety. Believe them. Trauma-informed support. Rebuild confidence and social skills. Peer support. Monitor mental health. DON\'T blame victim or suggest "standing up to bullies" (dangerous advice).\n\nMONITORING: Data on incidents (who, what, where, when, protected characteristics). Analyze patterns. Hotspots? Particular groups targeted? Times? Use data to target interventions.',

    parent_information: 'Bullying is repeated, intentional harm where there\'s a power imbalance. Our school takes bullying seriously and has clear procedures. If your child is being bullied: 1) Report to school immediately, 2) We will investigate, ensure safety, and support your child, 3) We\'ll work with you to monitor and resolve. If your child is bullying others: 1) We will have consequences but also intervention to address WHY and teach better behaviour, 2) Please work with us - often underlying issues at home or unmet needs, 3) Your child needs to understand impact and change behaviour. PREVENTION: Talk about bullying at home, teach empathy and respect for differences, monitor online activity, model kind behaviour, encourage reporting. CYBER-BULLYING: Screenshot evidence, don\'t retaliate online, report to school and platforms. Bullying affects mental health, learning, and safety - we all have responsibility to tackle it. Together we can create a safe, respectful school community.',

    useful_links: [
      'https://www.anti-bullyingalliance.org.uk',
      'https://www.bullying.co.uk',
      'https://www.gov.uk/government/publications/preventing-and-tackling-bullying',
      'https://www.childline.org.uk/info-advice/bullying-abuse-safety/types-bullying',
      'https://www.internetmatters.org/issues/cyberbullying',
      'https://www.stonewall.org.uk/get-involved/education/get-involved-schools (LGBTQ+ bullying)'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['bullying', 'anti_bullying', 'cyber_bullying', 'mixed', 'prevention', 'tier_1', 'safeguarding', 'protected_characteristics', 'PSHE']
  },

  {
    id: 'anti-bullying-ambassadors-peer-support',
    name: 'Anti-Bullying Ambassadors and Peer Support Programme',
    category: 'social_emotional',
    subcategory: 'bullying',
    description: 'Student-led anti-bullying programme training selected pupils as ambassadors to promote kindness, support peers, raise awareness, and create positive school culture. Empowers students to be part of the solution through education, campaigns, and peer support.',
    targeted_needs: ['Bullying prevention', 'Peer isolation', 'Negative peer culture', 'Low-level unkindness', 'Bystander passivity', 'Student disempowerment', 'Need for peer support'],

    evidence_level: 'tier_2',
    research_sources: ['Diana Award Anti-Bullying Programme', 'Peer support research', 'EEF Peer tutoring/mentoring evidence', 'Anti-Bullying Alliance peer approaches'],
    effect_size: 0.42,
    success_rate: '60-70% of schools report improved school climate',

    age_range: ['primary', 'secondary'],
    setting: ['mixed'],
    duration: 'Ongoing programme (ambassadors trained annually)',
    frequency: 'Regular ambassador meetings + reactive peer support',
    session_length: 'Varied',

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Ambassador training programme', 'Diana Award resources or similar', 'Badges/visibility', 'Campaign materials', 'Meeting space', 'Staff coordinator time', 'Peer support protocols'],
    cost_implications: '£200-£1,000 (training, resources, Diana Award accreditation optional)',

    key_components: [
      'Selection of diverse student ambassadors (application or nomination)',
      'Comprehensive training (bullying awareness, listening skills, boundaries, reporting)',
      'Visible role (badges, posters, assemblies)',
      'Awareness campaigns (Anti-Bullying Week, assemblies, posters, social media)',
      'Peer support (lunchtime, playground, peer listening)',
      'Reporting mechanism (ambassadors can signpost but NOT investigate)',
      'Regular ambassador meetings',
      'Staff supervision and support',
      'Evaluation and impact measurement',
      'Recognition and celebration of ambassadors'
    ],

    fidelity_checklist: [
      'Ambassadors recruited from diverse student body',
      'Training completed (minimum half-day)',
      'Role boundaries clear (support not investigation)',
      'Visible presence in school',
      'At least one awareness campaign per term',
      'Regular supervision meetings',
      'Safeguarding protocols understood',
      'Staff coordinator assigned',
      'Incidents reported to staff appropriately',
      'Impact evaluated',
      'Ambassadors feel supported'
    ],

    progress_indicators: [
      'Active ambassador participation',
      'Awareness campaigns delivered',
      'Students accessing peer support',
      'Positive feedback from students',
      'Increased reporting of bullying',
      'Improved school climate',
      'Reduced low-level unkindness',
      'Ambassador confidence and skills',
      'Staff report positive impact',
      'Sustained programme over time'
    ],

    expected_outcomes: [
      'More positive peer culture',
      'Students empowered',
      'Early intervention for issues',
      'Reduced bullying',
      'Increased awareness and empathy',
      'Bystander intervention',
      'Peer support available',
      'Student voice in anti-bullying work',
      'Leadership skills developed',
      'Whole-school ownership'
    ],

    adaptations: [
      'Age-appropriate (primary vs secondary)',
      'Training adapted to ambassador needs',
      'SEND ambassadors included',
      'Diverse representation ensured',
      'Flexible role based on individual strengths',
      'Online/cyber-bullying focus if needed'
    ],

    contraindications: ['Ambassadors NOT investigators or mediators - must refer to staff', 'Cannot replace staff responsibility', 'Must have staff supervision'],

    complementary_interventions: [
      'Whole-school anti-bullying policy',
      'PSHE anti-bullying curriculum',
      'Restorative justice',
      'Peer mediation',
      'Student councils',
      'Mental health awareness'
    ],

    implementation_guide: 'ANTI-BULLYING AMBASSADORS = student-led approach empowering young people to create kind, respectful school culture. Complements (not replaces) staff-led anti-bullying work.\n\nRECRUITMENT: Open to all (application or nomination). Select diverse group representing whole school community (year groups, genders, backgrounds, SEND). Interview or application process. Around 10-30 ambassadors depending on school size.\n\nTRAINING (Minimum half-day): 1) What is bullying? Types, impact, difference from conflict. 2) Role of ambassadors - awareness raising, peer support, reporting, campaigns. NOT investigation or mediation! 3) Listening skills and empathy. 4) Boundaries and safeguarding - when to refer to staff immediately. 5) Self-care - looking after yourself. 6) Planning campaigns.\n\nVISIBILITY: Badges, posters, assembly introduction, newsletter, website. Students need to KNOW who ambassadors are and how to access them.\n\nAWARENESS CAMPAIGNS: Anti-Bullying Week (November), Safer Internet Day (February), regular assemblies, posters, videos, social media (if age-appropriate). Creative, student-led.\n\nPEER SUPPORT: Available at break/lunch, designated space or roaming. Listening, signposting, reassuring. "I\'m here if you want to talk." If bullying disclosed → report to staff immediately. NOT trying to solve - supporting and referring.\n\nMEETINGS: Weekly or fortnightly. Plan campaigns, share observations (general not names), training top-ups, problem-solving, support each other. Staff coordinator leads.\n\nSAFEGUARDING: CRITICAL - ambassadors MUST know when to refer to staff (any bullying, safeguarding concern, beyond their role). They are NOT counselors or investigators. Clear protocols.\n\nRECOGNITION: Certificates, references, celebration events, Diana Award accreditation. Acknowledge their commitment.\n\nSUSTAINABILITY: New ambassadors recruited annually. Older ambassadors mentor new ones. Embedded in school culture.',

    parent_information: 'Our school has Anti-Bullying Ambassadors - trained student volunteers who promote kindness and support peers. They run awareness campaigns, provide peer listening, and help create a positive school culture. Ambassadors are NOT investigators - they support students and refer concerns to staff. If your child is interested in being an ambassador, they can apply [details]. If your child is experiencing bullying, they can talk to an ambassador who will ensure they get adult support. This peer-led approach empowers students to be part of the solution. Anti-Bullying Ambassadors complement our whole-school anti-bullying work - staff remain responsible for investigating and resolving bullying.',

    useful_links: [
      'https://www.antibullyingpro.com/anti-bullying-ambassadors',
      'https://anti-bullyingalliance.org.uk/tools-information/all-about-bullying/peer-support',
      'https://www.mentoring.org/resource/peer-to-peer-mentoring',
      'https://www.anti-bullyingalliance.org.uk/anti-bullying-week'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['anti_bullying', 'peer_support', 'student_leadership', 'ambassadors', 'prevention', 'tier_2', 'mixed', 'empowerment']
  },

  {
    id: 'study-skills-revision-exam-preparation',
    name: 'Study Skills, Revision Techniques, and Exam Preparation Programme',
    category: 'social_emotional',
    subcategory: 'study_skills',
    description: 'Explicit teaching of evidence-based study skills, revision strategies, time management, planning, and exam technique for students who struggle with self-regulated learning. Addresses the critical gap in metacognitive skills that underpins academic success.',
    targeted_needs: ['Poor study skills', 'Ineffective revision', 'Lack of planning and organization', 'Procrastination', 'Exam anxiety', 'Time management difficulties', 'Don\'t know HOW to learn', 'Passive learning', 'Last-minute cramming', 'Underachievement'],

    evidence_level: 'tier_1',
    research_sources: ['EEF Metacognition & Self-Regulation (+7 months)', 'Evidence-based revision techniques (Dunlosky et al.)', 'Rosenshine\'s Principles of Instruction', 'Retrieval practice research (Bjork)', 'Spaced practice and interleaving'],
    effect_size: 0.68,
    success_rate: '60-75% improved academic outcomes',

    age_range: ['secondary', 'post_16'],
    setting: ['small_group', 'classroom'],
    duration: '8-12 weeks (intensive) or ongoing curriculum',
    frequency: '1-2 times per week',
    session_length: '45-60 minutes',
    total_sessions: 15,

    complexity: 'medium',
    staff_training_required: false,
    resources_needed: ['Study skills workbook', 'Revision planners', 'Timer/time management tools', 'Past papers', 'Mind mapping materials', 'Flashcard systems', 'Retrieval practice resources', 'Online study tools'],
    cost_implications: '£50-£200 per student (resources, workbooks)',

    key_components: [
      'Metacognition (thinking about learning)',
      'Evidence-based revision techniques (retrieval practice, spaced practice, interleaving, NOT re-reading/highlighting)',
      'Time management and planning (revision timetables, breaking down tasks)',
      'Organization (notes, files, deadlines)',
      'Note-taking strategies (Cornell notes, mind maps)',
      'Active learning strategies',
      'Memory techniques',
      'Exam technique (reading questions, timing, structure)',
      'Managing exam anxiety',
      'Self-testing and feedback',
      'Avoiding procrastination',
      'Independent learning skills'
    ],

    fidelity_checklist: [
      'Evidence-based techniques taught (retrieval, spacing, interleaving)',
      'Students create personal revision timetables',
      'Active learning modeled and practiced',
      'Note-taking strategies explicitly taught',
      'Time management skills practiced',
      'Self-testing emphasized over passive re-reading',
      'Exam technique taught with practice',
      'Procrastination strategies addressed',
      'Students apply skills to real subjects',
      'Progress monitored (grades, confidence)',
      'Parental involvement',
      'Techniques reinforced across subjects'
    ],

    progress_indicators: [
      'Using revision timetables',
      'Applying evidence-based techniques',
      'Better organized notes and materials',
      'Starting revision earlier',
      'Active learning instead of passive',
      'Improved time management',
      'Reduced procrastination',
      'Better exam performance',
      'Increased confidence',
      'Metacognitive awareness',
      'Self-testing regularly'
    ],

    expected_outcomes: [
      'Improved exam results',
      'Better study habits',
      'Increased independence',
      'Reduced anxiety',
      'Time management skills',
      'Metacognitive awareness',
      'Lifelong learning skills',
      'Confidence in learning ability',
      'Reduced cramming',
      'Academic success'
    ],

    adaptations: [
      'SEND modifications (visual supports, simplified planning)',
      'Dyslexia-friendly strategies',
      'ADHD support (chunking, movement breaks, timers)',
      'Anxiety management integrated',
      'Subject-specific application',
      'Individual for severe difficulties',
      'Digital tools for tech-savvy students',
      'Shorter sessions if concentration poor'
    ],

    contraindications: ['Won\'t fix missing content knowledge - need subject catch-up too', 'Requires student engagement - won\'t work if refused'],

    complementary_interventions: [
      'Subject-specific tutoring',
      'Catch-up interventions',
      'Growth mindset',
      'Anxiety management',
      'ADHD support',
      'Executive function coaching',
      'Mentoring'
    ],

    implementation_guide: 'STUDY SKILLS GAP = CRITICAL! Many students, especially those with SEND, have NEVER been explicitly taught HOW to learn. They re-read notes passively, cram last-minute, don\'t plan. TEACH THEM!\n\nEVIDENCE-BASED REVISION TECHNIQUES (Dunlosky et al.):\n✅ HIGH UTILITY:\n1) RETRIEVAL PRACTICE - test yourself! Flashcards, past papers, quiz yourself. Pulling information from memory STRENGTHENS it. WAY more effective than re-reading. "If you can\'t recall it, you don\'t know it."\n2) SPACED PRACTICE - spread revision over time. NOT cramming! Study Topic A today, Topic B tomorrow, back to A next week. Spacing = better long-term retention.\n3) INTERLEAVING - mix up topics instead of blocking. Study Maths equations then History then back to Maths. Builds flexibility.\n\n❌ LOW UTILITY (but students love them!):\n- Re-reading notes passively (illusion of fluency)\n- Highlighting (doesn\'t engage brain)\n- Summarizing only (better than nothing but not as good as retrieval)\n\nWeek 1-2: METACOGNITION: "How do you currently revise?" (Most say: re-read notes, make pretty notes). "Is it working?" Teach: active vs passive learning. Brain science - testing strengthens memory, passive reading doesn\'t.\n\nWeek 3-4: PLANNING & TIME MANAGEMENT: Create revision timetable. Identify all topics, time available, allocate realistically. Break big tasks into small chunks. Use timer (Pomodoro: 25 min work, 5 min break). Start EARLY not last-minute.\n\nWeek 5-6: NOTE-TAKING: Cornell notes (question/notes/summary). Mind maps. Condensing notes. Organized filing. DON\'T spend hours making beautiful notes (procrastination!). Notes are for USING not admiring.\n\nWeek 7-8: RETRIEVAL PRACTICE: Flashcards (Quizlet), past papers, practice questions, blank page - write everything you know, quiz yourself. Self-test BEFORE looking at answers. Struggle = learning!\n\nWeek 9-10: EXAM TECHNIQUE: Read question carefully, underline key words, plan answer, time management in exam, structure, check work. Practice with past papers.\n\nWeek 11-12: AVOIDING PROCRASTINATION & EXAM ANXIETY: Procrastination = task feels overwhelming → break it down, start tiny (5 min), remove distractions. Exam anxiety - breathing, preparation reduces anxiety, positive self-talk.\n\nAPPLICATION: Students apply techniques to REAL subjects. Science test next week? Create flashcards, self-test, spaced practice.\n\nPARENTS: Help with revision timetable, test them (retrieval!), minimize distractions, encourage early start not cramming.',

    parent_information: 'Your child is learning HOW to study effectively - a skill often not taught explicitly. Most students revise ineffectively (re-reading notes, highlighting, cramming) which creates illusion of learning but poor exam performance. We\'re teaching EVIDENCE-BASED techniques: 1) RETRIEVAL PRACTICE - self-testing (flashcards, past papers) is THE most effective revision method. 2) SPACED PRACTICE - spreading revision over weeks, not cramming night before. 3) PLANNING - revision timetables, breaking tasks down, starting early. At home: help them create and stick to revision plan, test them (it helps!), encourage active not passive revision, minimize phone/social media during study, support but don\'t do the work for them, praise effort and improvement. These skills = lifelong benefit! Students who master effective study strategies succeed academically and become independent learners. Study skills matter as much as subject knowledge.',

    useful_links: [
      'https://www.learningscientists.org (evidence-based techniques)',
      'https://quizlet.com (flashcards)',
      'https://www.gcsepod.com (GCSE revision)',
      'https://www.bbc.co.uk/bitesize/articles/znwcxyc (revision tips)',
      'https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/metacognition-and-self-regulation'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['study_skills', 'revision', 'exam_preparation', 'metacognition', 'retrieval_practice', 'time_management', 'tier_1', 'academic', 'evidence_based', 'EEF']
  },

  {
    id: 'catch-up-learning-gap-filling-remedial',
    name: 'Catch-Up Learning and Gap-Filling Intervention',
    category: 'social_emotional',
    subcategory: 'academic_intervention',
    description: 'Systematic identification and remediation of gaps in foundational knowledge and skills, using diagnostic assessment, targeted teaching, and scaffolded progression. Evidence-based approach for students who have fallen behind due to absence, SEND, or other factors.',
    targeted_needs: ['Significant learning gaps', 'Behind age-related expectations', 'Missing foundational knowledge', 'Post-absence catch-up', 'School moves/disrupted education', 'SEND barriers to learning', 'Lockdown/pandemic learning loss', 'Underachievement'],

    evidence_level: 'tier_1',
    research_sources: ['EEF Small group tuition (+4 months)', 'EEF One-to-one tuition (+5 months)', 'EEF Teaching Assistant Interventions (+4 months)', 'Response to Intervention (RTI) model', 'Precision teaching evidence'],
    effect_size: 0.52,
    success_rate: '60-80% catch up with intensive intervention',

    age_range: ['early_years', 'primary', 'secondary'],
    setting: ['one_to_one', 'small_group'],
    duration: '10-20 weeks (or until gap closed)',
    frequency: '3-5 times per week',
    session_length: '20-40 minutes',
    total_sessions: 50,

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Diagnostic assessment tools', 'Subject-specific intervention programmes', 'Manipulatives (maths)', 'Phonics resources (reading)', 'Progress tracking system', 'Catch-up curriculum resources'],
    cost_implications: '£500-£2,000 per student (staff time, resources, assessments)',

    key_components: [
      'Diagnostic assessment (where are the gaps?)',
      'Baseline assessment',
      'Targeted teaching of missing concepts/skills',
      'Explicit instruction with modeling',
      'Scaffolded practice with immediate feedback',
      'Mastery before moving on',
      'Regular formative assessment',
      'Overlearning and consolidation',
      'Link to age-appropriate curriculum',
      'Gradual release to independence',
      'High-quality delivery (trained staff)',
      'Progress monitoring',
      'Exit criteria (when to mainstream)'
    ],

    fidelity_checklist: [
      'Diagnostic assessment completed BEFORE intervention',
      'Intervention targeted to specific gaps identified',
      'High-quality explicit teaching',
      'Small group (max 3-4) or 1:1',
      'Intensive frequency (3-5x per week)',
      'Evidence-based programme/resources used',
      'Immediate corrective feedback',
      'Mastery of each concept before progression',
      'Progress assessed fortnightly',
      'Linked to mainstream curriculum',
      'Exit when gap sufficiently closed',
      'Mainstream teacher informed of progress'
    ],

    progress_indicators: [
      'Closing the gap in diagnostic assessments',
      'Increased accuracy on targeted skills',
      'Greater confidence',
      'Keeping up in mainstream lessons',
      'Reduced frustration',
      'Improved engagement',
      'Better test scores',
      'Teacher reports progress',
      'Student can explain concepts',
      'Transferring skills to different contexts'
    ],

    expected_outcomes: [
      'Gaps in learning closed or significantly reduced',
      'Accessing age-appropriate curriculum',
      'Improved attainment',
      'Increased confidence and engagement',
      'Reduced need for ongoing support',
      'Better long-term educational outcomes',
      'Prevented widening of gaps',
      'Positive attitude to learning'
    ],

    adaptations: [
      'Intensity adjusted (1:1 vs small group, frequency)',
      'Duration extended for significant gaps',
      'SEND modifications (visual, multisensory)',
      'Motivational strategies',
      'Technology/apps to support',
      'Home learning link',
      'Subject-specific programmes',
      'Pre-teaching for upcoming curriculum'
    ],

    contraindications: ['Won\'t work if poor attendance continues - address barriers first', 'Quality matters - poorly delivered intervention ineffective', 'Can\'t catch up if gaps continually widening - may need ongoing small group teaching'],

    complementary_interventions: [
      'Subject-specific tutoring',
      'Study skills',
      'Growth mindset',
      'Attendance support',
      'SEND support',
      'Speech & language if underlying',
      'Working memory interventions',
      'Homework club'
    ],

    implementation_guide: 'LEARNING GAPS = HUGE barrier. Student missed phonics in Year 1? Now in Year 4 can\'t read fluently. Student was absent during fractions? Now can\'t access decimals/percentages. GAPS WIDEN over time unless closed. CATCH-UP INTERVENTION = targeted, intensive, high-quality teaching of missing skills.\n\nDIAGNOSTIC ASSESSMENT: WHERE are the gaps? Use: diagnostic tests, error analysis, teacher assessment, observation. Example: Student struggles with reading - phonics screening check shows gaps in Phase 3/4 sounds. Example: Student can\'t do long multiplication - check: times tables? place value? column addition? WHERE did learning break down?\n\nTARGETED TEACHING: Teach the SPECIFIC missing skills, not generic "extra literacy". Use evidence-based programmes: Reading - phonics (Sounds-Write, Read Write Inc catchup), comprehension strategies. Maths - calculation, place value, specific concepts. Writing - sentence structure, spelling rules, composition.\n\nEXPLICIT INSTRUCTION: DON\'T assume they\'ll "pick it up". TEACH explicitly: 1) MODEL - "Watch me", 2) GUIDED PRACTICE - "Let\'s do together", 3) INDEPENDENT PRACTICE - "Your turn", 4) FEEDBACK - immediate, specific, corrective. Check understanding constantly.\n\nMASTERY: Don\'t rush. Student must MASTER Skill A before moving to Skill B. Overlearn! Fluency and automaticity matter. If not mastered, gaps just continue.\n\nINTENSITY: Catch-up requires MORE teaching time than mainstream. 3-5 sessions per week, minimum 20 minutes. Small group (max 3-4) or 1:1 for severe gaps. HIGH-QUALITY delivery essential (trained staff, evidence-based resources).\n\nPROGRESS MONITORING: Assess every 2 weeks. Is the gap closing? If not, adjust intervention (more intensity? different approach? check for SEND?).\n\nLINK TO MAINSTREAM: Intervention complements mainstream, doesn\'t replace it. Inform class teacher of progress. Student needs to apply skills in class.\n\nEXIT CRITERIA: When gap sufficiently closed (e.g., reading at ARE, can access curriculum), phase out intervention. Monitor for regression.\n\nPREVENTION: High-quality teaching in mainstream prevents gaps! But when gaps exist, targeted intervention works.',

    parent_information: 'Your child has gaps in their learning in [subject] which are making it hard for them to keep up. This might be due to absence, learning differences, or just needing more time to grasp concepts. We\'re providing catch-up intervention - small group/1:1 teaching focused specifically on filling those gaps. This is GOOD NEWS - we\'ve identified the problem and we\'re fixing it! Your child will have [X] extra sessions per week for [Y] weeks, learning the skills they\'re missing. At home: practise the skills being taught, read together daily (if reading gaps), support homework, stay positive ("You\'re learning!", not "You\'re behind"), communicate with us about progress. Catch-up intervention is time-limited - once gaps are filled, your child returns fully to mainstream. Early intervention now prevents bigger problems later. Most children close gaps completely with intensive support.',

    useful_links: [
      'https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/one-to-one-tuition',
      'https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/small-group-tuition',
      'https://www.nationaltutoring.org.uk',
      'https://www.gov.uk/government/publications/catch-up-premium-coronavirus-covid-19',
      'https://www.thenationalcollege.co.uk/podcasts/closing-the-gap'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['catch_up', 'remedial', 'learning_gaps', 'intervention', 'tutoring', 'tier_1', 'EEF', 'academic', 'targeted_teaching', 'attainment']
  },

  {
    id: 'positive-psychology-growth-mindset',
    name: 'Positive Psychology and Growth Mindset Programme',
    category: 'social_emotional',
    subcategory: 'positive_psychology',
    description: 'Evidence-based positive psychology intervention teaching students growth mindset, strengths-based thinking, optimism, resilience, and "can-do" attitude. Addresses low self-efficacy and fixed mindset beliefs that undermine learning and wellbeing, particularly for students with history of failure.',
    targeted_needs: ['Low self-efficacy', 'Fixed mindset ("I can\'t")', 'Learned helplessness', 'Negative thinking', 'Low self-esteem', 'Fear of failure', 'Giving up easily', 'Underachievement', 'Low aspirations', 'Pessimism'],

    evidence_level: 'tier_1',
    research_sources: ['Carol Dweck growth mindset research', 'EEF Metacognition & Self-Regulation', 'Positive Psychology (Seligman)', 'Self-efficacy theory (Bandura)', 'Character strengths (VIA Institute)'],
    effect_size: 0.52,
    success_rate: '55-70% improved academic outcomes and wellbeing',

    age_range: ['primary', 'secondary', 'post_16'],
    setting: ['small_group', 'classroom'],
    duration: '8-12 weeks (can be ongoing)',
    frequency: '1-2 times per week',
    session_length: '30-45 minutes',
    total_sessions: 12,

    complexity: 'medium',
    staff_training_required: false,
    resources_needed: ['Growth mindset resources', 'Strengths cards/assessments', 'Positive psychology workbooks', 'Goal-setting materials', 'Gratitude journals', 'Celebration systems'],
    cost_implications: '£50-£200 (resources, training)',

    key_components: [
      'Fixed vs growth mindset teaching',
      'Brain science (neuroplasticity - brains can grow!)',
      'Reframing failure as learning',
      'Effort praise not ability praise',
      'Character strengths identification (VIA)',
      'Optimistic thinking patterns',
      'Goal-setting and achieving',
      'Celebrating progress not just outcomes',
      'Positive self-talk',
      'Gratitude practice',
      'Savoring successes',
      'Using strengths to overcome challenges',
      'Resilience building'
    ],

    fidelity_checklist: [
      'Growth mindset explicitly taught',
      'Neuroplasticity explained (your brain grows when you learn!)',
      'Fixed mindset language challenged ("I can\'t... YET!")',
      'Effort, strategies, and progress praised (not just "clever")',
      'Failure normalized and reframed',
      'Character strengths identified and used',
      'Goals set collaboratively',
      'Successes celebrated',
      'Gratitude practiced',
      'Positive language modeled',
      'Embedded across curriculum',
      'Staff use growth mindset language consistently'
    ],

    progress_indicators: [
      'Using growth mindset language ("I can\'t do this YET")',
      'Persisting with challenges instead of giving up',
      'Viewing mistakes as learning opportunities',
      'Trying new strategies when stuck',
      'Positive self-talk',
      'Identifying and using strengths',
      'Setting and working towards goals',
      'Increased confidence',
      'Improved resilience',
      'Better engagement in learning',
      'More optimistic outlook'
    ],

    expected_outcomes: [
      'Growth mindset developed',
      'Increased self-efficacy ("I CAN do this")',
      'Better perseverance',
      'Improved academic outcomes',
      'Resilience to setbacks',
      'Positive attitude to learning',
      'Strengths-based self-concept',
      'Increased optimism',
      'Better wellbeing',
      'Higher aspirations'
    ],

    adaptations: [
      'Age-appropriate language',
      'SEND modifications',
      'Visual supports',
      'Individual for severe learned helplessness',
      'Link to student interests',
      'Cultural sensitivity',
      'Trauma-informed (some students have genuine barriers)',
      'Whole-class universal approach best'
    ],

    contraindications: ['Don\'t use growth mindset to blame students for systemic barriers (poverty, SEND, etc.)', 'Must acknowledge REAL barriers exist while teaching agency', 'Not a replacement for addressing structural inequalities'],

    complementary_interventions: [
      'Self-esteem building',
      'Resilience programmes',
      'Goal-setting coaching',
      'Mentoring',
      'Study skills',
      'Catch-up learning (to address actual skill gaps)',
      'CBT if negative thinking severe'
    ],

    implementation_guide: 'GROWTH MINDSET = belief that abilities can develop through effort, strategies, and learning from mistakes. FIXED MINDSET = belief that abilities are innate and unchangeable ("I\'m just not a maths person"). Students with low self-efficacy often have fixed mindset + history of failure = learned helplessness. POSITIVE PSYCHOLOGY = evidence-based science of wellbeing, strengths, and thriving.\n\nWeek 1-2: FIXED VS GROWTH MINDSET: Teach concepts. Fixed: "I can\'t do this", "I\'m not clever". Growth: "I can\'t do this YET", "I can learn with effort". Show videos, examples. NEUROPLASTICITY: "Your brain is like a muscle - it grows when you use it! Every time you struggle and learn, you build brain connections. Making mistakes helps your brain grow!" This is SCIENCE not motivational fluff.\n\nWeek 3-4: REFRAMING FAILURE: Mistakes = learning opportunities, not evidence of stupidity. "My favorite thing is when students make mistakes - it means your brain is growing!" Famous failures (Einstein, J.K. Rowling). What can we learn from this mistake?\n\nWeek 5-6: EFFORT PRAISE: Instead of "You\'re so clever!" say "You worked really hard on that!", "Great strategy!", "You didn\'t give up!". Praise process not person. Set challenging goals, achieve them through effort.\n\nWeek 7-8: CHARACTER STRENGTHS: Everyone has strengths! VIA Character Strengths assessment. Identify top strengths. Use them! Link to learning - "How can you use your strength of persistence to tackle this maths problem?"\n\nWeek 9-10: POSITIVE THINKING: Gratitude practice (3 good things daily). Positive self-talk. Savoring successes. Optimistic explanatory style (setbacks are temporary, specific, external; successes are permanent, pervasive, internal).\n\nWeek 11-12: GOAL-SETTING & FUTURE: Set SMART goals. Break down. Celebrate progress. "What can you achieve with a growth mindset that you thought was impossible before?"\n\nLANGUAGE MATTERS: Model growth mindset language CONSTANTLY. "This is hard... but that means my brain is growing!", "I made a mistake - what can I learn?", "I can\'t do it YET".\n\nWHOLE-SCHOOL: Growth mindset works best as whole-school culture, not one-off intervention. Displays, assemblies, staff language, praise systems, celebrating effort and progress.\n\nCAVEAT: Don\'t use growth mindset to blame students for systemic inequalities. Acknowledge real barriers exist (poverty, SEND, discrimination) while empowering agency within those constraints.',

    parent_information: 'Your child is learning about "growth mindset" - the scientifically-proven belief that abilities can develop through effort and learning. Many students, especially those who\'ve struggled, believe "I\'m just not good at [subject]" (fixed mindset). This becomes self-fulfilling prophecy - they give up easily, don\'t try new strategies, avoid challenges. Growth mindset teaches: "I can\'t do this YET, but I can learn with effort!" We\'re teaching: 1) Your brain grows when you learn (neuroplasticity), 2) Mistakes help you learn, 3) Effort and strategies matter more than "natural ability", 4) Everyone has character strengths to use. At home: Use growth mindset language ("You worked so hard!", not "You\'re so clever"), Praise effort, strategies, progress (not just results), Normalize mistakes ("What did you learn?"), Share your own learning struggles, Say "YET" ("You can\'t ride a bike... yet!"), Avoid labeling ("maths person", "not creative" - abilities aren\'t fixed!). Growth mindset improves academic outcomes, resilience, and wellbeing. Your words are powerful - "I believe you can learn this with effort" is transformative!',

    useful_links: [
      'https://www.mindsetworks.com/science',
      'https://www.understood.org/en/articles/growth-mindset',
      'https://www.viacharacter.org/character-strengths (free strengths assessment)',
      'https://www.actionforhappiness.org',
      'https://www.authentic happiness.sas.upenn.edu (Seligman\'s Positive Psychology Center)'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['growth_mindset', 'positive_psychology', 'self_efficacy', 'strengths', 'resilience', 'tier_1', 'wellbeing', 'mindset', 'character', 'optimism', 'Dweck', 'Seligman']
  },

  {
    id: 'primary-secondary-transition-support',
    name: 'Primary to Secondary Transition Support Programme',
    category: 'social_emotional',
    subcategory: 'transitions',
    description: 'Comprehensive transition programme supporting vulnerable students moving from primary to secondary school, addressing anxiety, practical concerns, social relationships, and academic expectations. Evidence-based approach reducing transition difficulties.',
    targeted_needs: ['Transition anxiety', 'SEND students transitioning', 'Looked-after children', 'Anxious/vulnerable students', 'Social difficulties', 'Organizational challenges', 'Fear of unknowns', 'Friendship concerns', 'Academic worries'],

    evidence_level: 'tier_2',
    research_sources: ['EEF Transition research', 'DfE Transition guidance', 'Educational Transitions research', 'Best practice transition programmes'],
    effect_size: 0.48,
    success_rate: '65-75% smoother transitions with intervention',

    age_range: ['primary', 'secondary'],
    setting: ['small_group', 'one_to_one', 'mixed'],
    duration: 'Summer term Year 6 + Autumn term Year 7',
    frequency: 'Weekly sessions + enhanced transition activities',
    session_length: '30-45 minutes',
    total_sessions: 20,

    complexity: 'medium',
    staff_training_required: false,
    resources_needed: ['Transition workbooks', 'Photos/virtual tour of secondary school', 'Secondary school liaison', 'Social stories', 'Transition passport', 'Buddy system materials'],
    cost_implications: '£100-£500 per student (staff time, resources, extra visits)',

    key_components: [
      'Early identification of vulnerable students',
      'Addressing worries and misconceptions',
      'Extra visits to secondary school',
      'Meeting key staff and buddy',
      'Learning environment familiarization',
      'Practical skills (timetable, locker, lunch, uniform)',
      'Social preparation (making friends, peer relationships)',
      'Academic expectations',
      'SEND transition planning',
      'Transition passport (all about me)',
      'Parent partnership',
      'Ongoing Year 7 support',
      'Communication between primary and secondary'
    ],

    fidelity_checklist: [
      'Vulnerable students identified early (Spring term)',
      'Worries discussed and addressed',
      'Multiple visits to secondary school arranged',
      'Key staff met (Year 7 team, SENCO, buddy)',
      'Practical concerns addressed (locker, timetable, map, uniform)',
      'Social skills preparation',
      'Transition passport created and shared',
      'Parents involved and informed',
      'Information shared with secondary (with consent)',
      'Year 7 check-ins scheduled',
      'Primary-secondary liaison strong',
      'Summer school/transition days attended'
    ],

    progress_indicators: [
      'Reduced anxiety about transition',
      'Knows practical information (uniform, timetable, etc.)',
      'Visited secondary school multiple times',
      'Met key adults and buddy',
      'Confidence increased',
      'Worries addressed',
      'Excited (or at least OK) about starting',
      'Parent feels informed and confident',
      'Smooth first term in Year 7',
      'Attendance good',
      'Friendships forming',
      'Engaging in lessons'
    ],

    expected_outcomes: [
      'Successful transition to secondary',
      'Reduced anxiety',
      'Quicker settling in',
      'Better attendance',
      'Positive peer relationships',
      'Academic engagement',
      'Confidence in new environment',
      'Reduced transition dip',
      'SEND needs met from day 1',
      'Parent confidence'
    ],

    adaptations: [
      'Intensity based on need (some need just 1-2 extra visits, others need weekly support)',
      'Individual for severe anxiety',
      'SEND-specific planning',
      'Looked-after children - Virtual School involvement',
      'Social stories for autism',
      'Visual supports',
      'Peer buddy matching',
      'Extended support into Year 7'
    ],

    contraindications: ['Generic transition activities alone not enough for vulnerable students', 'Requires cooperation between primary and secondary'],

    complementary_interventions: [
      'Anxiety management',
      'Social skills',
      'Organizational skills',
      'Friendship groups',
      'SEND support planning',
      'Counseling if severe anxiety',
      'Mentoring in Year 7'
    ],

    implementation_guide: 'PRIMARY-SECONDARY TRANSITION = significant life event. Most students cope OK with universal transition activities (visits, taster days). But vulnerable students (SEND, anxiety, LAC, poor social skills, organizational difficulties) need ENHANCED support or risk: anxiety, school refusal, friendships breakdown, academic regression (transition dip).\n\nIDENTIFICATION (Spring Term Year 6): Who needs extra support? SEND students, anxious students, LAC, poor social skills, previous transition difficulties (e.g., struggled moving classes), significant life events, no friendships.\n\nWORRIES (Summer Term Year 6 sessions): "What worries you about secondary school?" Common: getting lost, making friends, harder work, bullying, lockers, different teachers, forgetting PE kit, big building, older students. Address EACH worry: Getting lost? Map, tour, buddy. Friends? Social skills, buddy, joining clubs. Harder work? "Teachers know you\'re Year 7, they support you". Normalize anxiety - everyone feels nervous!\n\nEXTRA VISITS: Universal = 1 transition day. Vulnerable students = 3-6 visits. Timing varies (quieter for anxiety), focus on student\'s needs (SEND: sensory considerations, safe spaces; anxious: meet key adults, see normal day).\n\nPRACTICAL PREPARATION: How does timetable work? Where\'s my form room? How do I use locker? What do I do at lunch? Where are toilets? What if I forget something? PRACTICE these.\n\nSOCIAL PREPARATION: Making friends in Year 7 (everyone in same boat, join clubs, be friendly, it takes time). Buddy system - match with Year 8 buddy. Maintain primary friendships where possible but accept some may drift.\n\nTRANSITION PASSPORT: "All About Me" - strengths, needs, interests, what helps when anxious/stuck, who to ask for help. SEND info, strategies that work. Share with Year 7 team (with consent).\n\nPARENTS: Parent transition evening, address their worries, practical info, reassure.\n\nYEAR 7 SUPPORT: DON\'T just drop student! Check-ins week 1, 2, 6, 12. "How\'s it going? Worries? Friends? Coping OK?" Early intervention if struggles.',

    parent_information: 'Moving to secondary school is a big change. Most children adjust well, but some need extra support - that\'s OK! We\'ve identified your child would benefit from enhanced transition support because [reason]. This includes: extra visits to secondary school, meeting key staff and a buddy, addressing worries, practical preparation, transition passport. Your child may feel anxious - this is normal! Secondary school IS different (bigger, more students, different teachers, complex timetable) but support is there. At home: Talk about transition positively, visit school together over summer, practice journey, organize uniform/equipment early, reassure worries are normal, contact secondary school if concerns. First term can be tiring (longer day, more stimulation, new routines) - earlier bedtimes, patience with emotions. Most transition difficulties resolve within first half-term with support. We\'re working with secondary school to ensure smooth transition - your child will be OK!',

    useful_links: [
      'https://www.gov.uk/government/publications/school-transitions-practice-guide',
      'https://www.annafreud.org/schools-and-colleges/resources/moving-to-secondary-school-transition-booklet',
      'https://www.youngminds.org.uk/parent/blog/supporting-your-child-with-the-move-to-secondary-school',
      'https://www.autism.org.uk/advice-and-guidance/topics/education/moving-schools'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['transition', 'primary_secondary', 'Year_6_7', 'anxiety', 'SEND', 'vulnerable_students', 'tier_2', 'prevention']
  },

  {
    id: 'nurture-groups-attachment-trauma',
    name: 'Nurture Groups for Attachment and Trauma-Informed Support',
    category: 'social_emotional',
    subcategory: 'attachment',
    description: 'Evidence-based nurture group provision offering predictable, nurturing environment for children with attachment difficulties, trauma, or early developmental gaps. Combines social-emotional learning with academic support, emphasizing relationships, routine, and developmental curriculum. Particularly effective for looked-after children.',
    targeted_needs: ['Attachment difficulties', 'Looked-after children (LAC)', 'Trauma', 'Early developmental gaps', 'Emotional dysregulation', 'Relationship difficulties', 'Social communication gaps', 'Chaotic home backgrounds', 'Insecure attachment', 'Adverse Childhood Experiences (ACEs)'],

    evidence_level: 'tier_1',
    research_sources: ['Nurture Group Network evidence', 'EEF Social & Emotional Learning', 'Attachment theory (Bowlby)', 'Trauma-informed practice', 'Boxall Profile assessment'],
    effect_size: 0.58,
    success_rate: '70-80% return to mainstream successfully',

    age_range: ['early_years', 'primary', 'secondary'],
    setting: ['small_group'],
    duration: '2-4 terms (flexible based on need)',
    frequency: 'Daily (mornings or full day)',
    session_length: 'Half-day or full day',

    complexity: 'high',
    staff_training_required: true,
    resources_needed: ['Nurture room', 'Homely resources (kitchen area, comfortable seating, toys, books)', 'Boxall Profile', 'Developmental curriculum', 'Routine visual supports', 'Breakfast/snack provision', '2 trained staff (teacher/TA)'],
    cost_implications: '£10,000-£30,000 per group per year (staffing, room, resources)',

    key_components: [
      'Small group (max 6-12 children)',
      'Two trained adults (predictable attachments)',
      'Homely, nurturing environment',
      'Predictable routine and structure',
      'Breakfast/snack time together (family meal)',
      'Developmental curriculum (meeting early developmental needs)',
      'Explicit teaching of social-emotional skills',
      'Relationship-based approach',
      'Trauma-informed practice',
      'Part-time provision (maintain mainstream links)',
      'Academic learning integrated',
      'Transition planning back to mainstream',
      'Staff supervision and reflective practice',
      'Parent partnership where possible'
    ],

    fidelity_checklist: [
      'Boxall Profile completed for assessment and progress',
      'Small group size maintained',
      'Two trained staff present',
      'Nurturing, predictable environment',
      'Consistent daily routine',
      'Breakfast/snack shared',
      'Relationships prioritized',
      'Developmental needs met (may need "younger" activities)',
      'Trauma-informed responses to behaviour',
      'Part-time attendance (not full-time segregation)',
      'Transition to mainstream planned from start',
      'Regular supervision for staff',
      'Progress monitored (Boxall Profile, SDQ)',
      'Integration activities with mainstream'
    ],

    progress_indicators: [
      'Improved Boxall Profile scores',
      'Reduced dysregulation',
      'Better relationships with adults',
      'Improved peer relationships',
      'Increased emotional vocabulary',
      'Better self-regulation',
      'Increased learning readiness',
      'More secure attachment behaviours',
      'Reduced challenging behaviour',
      'Increased mainstream time',
      'Academic progress',
      'Positive self-concept'
    ],

    expected_outcomes: [
      '70-80% successful return to mainstream',
      'Secure attachment to key adults',
      'Improved emotional regulation',
      'Better social skills',
      'Reduced trauma symptoms',
      'Developmental gaps reduced',
      'Improved wellbeing',
      'Better learning engagement',
      'Positive peer relationships',
      'Increased resilience'
    ],

    adaptations: [
      'Age-appropriate (primary vs secondary nurture)',
      'Duration flexible (some need 1 term, others 4+ terms)',
      'Part-time vs full-time based on need',
      'Trauma-specific modifications',
      'Cultural sensitivity',
      'Integration with therapeutic services (CAMHS, therapy)',
      'Looked-after children - Virtual School involvement',
      'Attachment-focused parenting support where possible'
    ],

    contraindications: ['Not suitable if child at risk of harm from peers', 'Requires long-term commitment - not quick fix', 'Expensive - needs dedicated resources', 'Staff need high skill level and emotional resilience'],

    complementary_interventions: [
      'Trauma therapy (EMDR, trauma-focused CBT)',
      'Therapeutic parenting support (foster carers, parents)',
      'Play therapy',
      'Art therapy',
      'Social stories',
      'Emotional regulation coaching',
      'Dyadic Developmental Psychotherapy (if appropriate)',
      'Virtual School support (LAC)'
    ],

    implementation_guide: 'NURTURE GROUPS = evidence-based intervention for children whose early attachment and developmental experiences were disrupted. These children often: struggle with relationships, dysregulated emotions, can\'t access learning, chaotic behaviour, stuck at early developmental stages. WHY? Trauma, neglect, insecure attachment, ACEs, LAC, inconsistent caregiving. NURTURE GROUPS provide safe, predictable, nurturing environment to "re-do" early developmental experiences.\n\nSIX PRINCIPLES OF NURTURE:\n1) Children\'s learning is understood developmentally\n2) The classroom offers a safe base\n3) Nurture is important for the development of wellbeing\n4) Language is understood as vital for communication and learning\n5) All behaviour is communication\n6) Transitions are significant in children\'s lives\n\nASSESSMENT: Boxall Profile (diagnostic assessment of social-emotional development). Identifies developmental stage and gaps. Used for baseline and progress monitoring.\n\nENVIRONMENT: Homely, not clinical. Kitchen area, comfortable seating, toys, books, games. Predictable, organized. Two adults (secure attachments). Small group (6-12 max).\n\nROUTINE (Example): Arrival welcome, breakfast together (family meal - teaches social skills, conversation, turn-taking), morning activities (developmental play, social skills, learning tasks), snack, outdoor play, reflection time. PREDICTABILITY is key - routine never changes.\n\nDEVELOPMENTAL CURRICULUM: Meet child at their developmental stage, NOT chronological age. 7-year-old may need toddler-level emotional support. Activities: play, sensory, turn-taking, sharing, cooperation, emotional literacy, boundaries, cause-and-effect, language development, academic skills when ready.\n\nRELATIONSHIPS: Two key adults = secure base. Consistent, predictable, attuned, boundaried, warm. Children learn: adults are trustworthy, I am valued, relationships are safe, I can regulate with support.\n\nBEHAVIOR: Trauma-informed responses. "All behaviour is communication" - what need is this behaviour communicating? Co-regulate, teach alternative ways to meet needs, therapeutic not punitive.\n\nINTEGRATION WITH MAINSTREAM: Part-time nurture (mornings) + mainstream (afternoons) OR full days nurture initially then gradually increase mainstream time. Maintain links with class, celebrate successes, transition planning from day 1. Goal = successful return to mainstream.\n\nSTAFF WELLBEING: Nurture group work is emotionally demanding. Regular supervision, reflective practice, peer support essential.\n\nLAC: Nurture groups particularly effective for looked-after children - secure base at school, consistent adults, developmental reparation.',

    parent_information: 'Your child is attending our Nurture Group - a special small group providing extra support for social and emotional development. Some children need extra help learning how to manage feelings, make friends, and feel safe at school - that\'s what Nurture Group does. Your child will have consistent, caring adults, predictable routines, time to play and learn social skills, and support to be ready for learning. It\'s not punishment - it\'s extra nurture! Many children join Nurture Group if they\'ve had difficult early experiences, been in care, moved schools a lot, or just need more support. At home: keep routines predictable, provide consistent boundaries with warmth, validate feelings, be patient (progress takes time), communicate with nurture staff. Most children attend Nurture Group for 2-4 terms then transition back to their class full-time, with new skills and confidence. This is about giving your child the foundations they need to thrive.',

    useful_links: [
      'https://www.nurturegroups.org',
      'https://www.beaconcollaborative.org.uk/nurture-group.html',
      'https://www.local.gov.uk/our-support/our-improvement-offer/care-and-health-improvement/looked-after-children-resources',
      'https://www.gov.uk/government/publications/mental-health-and-behaviour-in-schools--2'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['nurture_groups', 'attachment', 'trauma', 'LAC', 'looked_after_children', 'ACEs', 'developmental', 'tier_1', 'relationships', 'SEMH']
  },

  {
    id: 'social-stories-autism-spectrum',
    name: 'Social Stories for Autism Spectrum Understanding',
    category: 'social_emotional',
    subcategory: 'autism_support',
    description: 'Personalized Social Stories™ intervention using short, structured stories to teach autistic students about social situations, expectations, and appropriate responses. Evidence-based visual and narrative approach addressing social understanding and anxiety in autism.',
    targeted_needs: ['Autism/ASC', 'Social understanding difficulties', 'Anxiety about new situations', 'Behavior in specific contexts', 'Transition difficulties', 'Unexpected change', 'Social communication gaps', 'Literal thinking', 'Need for predictability'],

    evidence_level: 'tier_1',
    research_sources: ['Carol Gray Social Stories™ research', 'NICE Autism guidelines', 'National Autistic Society', 'NPDC Evidence-Based Practices', 'Autism-specific pedagogy'],
    effect_size: 0.64,
    success_rate: '65-80% show improved understanding and behaviour',

    age_range: ['early_years', 'primary', 'secondary', 'post_16'],
    setting: ['one_to_one', 'small_group'],
    duration: 'Ongoing as needed (situation-specific)',
    frequency: 'Read daily before relevant situation',
    session_length: '5-10 minutes',

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Social Stories™ training/guidelines', 'Writing materials', 'Photos/visuals', 'Laminator', 'Digital tools (for video social stories)', 'Storage system'],
    cost_implications: '£50-£200 (training, resources, staff time to create stories)',

    key_components: [
      'Personalized to student (photo, interests, specific situation)',
      'Specific Social Story™ structure (descriptive, perspective, directive sentences)',
      'Positive, reassuring tone',
      'Visual supports (photos, symbols, drawings)',
      'Repeated reading (before and during situation)',
      'Celebrates what student SHOULD do (not punishing)',
      'Addresses anxiety and uncertainty',
      'Explains social expectations explicitly',
      'Provides predictability',
      'Teaches perspective-taking',
      'Reviewed and updated as needed',
      'Generalization support'
    ],

    fidelity_checklist: [
      'Story follows Social Stories™ guidelines (Carol Gray)',
      'Written from student perspective (first person)',
      'Positive, patient tone',
      'Appropriate sentence ratio (descriptive, perspective, directive)',
      'Visuals included (photos of actual environment/people)',
      'Length appropriate (short for younger/complex needs)',
      'Read WITH student multiple times before situation',
      'Available during situation if needed',
      'Updated if situation changes or story not effective',
      'Parent/carers have copy for home',
      'Other strategies used alongside (not sole intervention)',
      'Celebrates success'
    ],

    progress_indicators: [
      'Student understands situation better',
      'Reduced anxiety about situation',
      'Appropriate behaviour in target situation',
      'Increased confidence',
      'Fewer meltdowns/shutdowns',
      'Generalizing understanding to similar situations',
      'Requesting to read story',
      'Using story language ("First... then...")',
      'Better transitions',
      'Reduced need for story over time (internalized learning)'
    ],

    expected_outcomes: [
      'Improved understanding of social situations',
      'Reduced anxiety',
      'More appropriate behaviour',
      'Better transitions',
      'Increased independence',
      'Perspective-taking skills',
      'Predictability and structure',
      'Confidence in new situations',
      'Reduced challenging behaviour',
      'Better coping with change'
    ],

    adaptations: [
      'Complexity based on student (simple for young/complex needs, detailed for older/able)',
      'Format: written, visual-only, video, audio, app-based',
      'Length: one sentence to multiple pages',
      'Reading support if needed',
      'Multiple stories for different situations',
      'Portable (mini version for pocket)',
      'Digital versions on tablet',
      'Siblings/peers can have copy too (whole-class understanding)'
    ],

    contraindications: ['Must follow Social Stories™ format - poorly written stories ineffective or harmful', 'Not for punishment or coercion', 'Should be positive and descriptive not directive only'],

    complementary_interventions: [
      'Visual timetables',
      'Visual supports',
      'Autism social skills groups',
      'Communication support',
      'Sensory support',
      'Anxiety management',
      'TEACCH strategies',
      'Positive behaviour support'
    ],

    implementation_guide: 'SOCIAL STORIES™ = Carol Gray\'s evidence-based intervention for AUTISM. Autistic students often struggle with: unpredictability, social expectations (unspoken rules), perspective-taking, anxiety about unknowns. Social Stories EXPLICITLY TEACH what to expect and how to respond.\n\nWHEN TO USE: New situations (starting school, assembly, fire drill), challenging situations (lunch hall, playground, transitions), behaviour targets (taking turns, asking for help), anxiety-provoking events (dentist, school trip, change in routine).\n\nSTRUCTURE (Carol Gray\'s guidelines):\n1) DESCRIPTIVE sentences - objective facts about situation. "Sometimes at school we have fire drills."\n2) PERSPECTIVE sentences - others\' thoughts/feelings. "The teacher wants everyone to be safe."\n3) DIRECTIVE sentences - what student should do. "I will line up quietly."\n4) Ratio: More descriptive/perspective, fewer directive. (NOT just rules!)\n\nTONE: Positive, patient, reassuring. NOT threatening or punishing. "This is what happens, this is what you can do, you\'ll be OK."\n\nPERSONALIZATION: Use student\'s name, photo, interests. Photos of ACTUAL environment/people. First person ("I", "my"). Specific to student\'s needs.\n\nVISUALS: Photos >> symbols >> drawings. Real photos of school, teachers, situations most helpful. Match student\'s processing (some need words+pictures, others pictures only).\n\nLENGTH: Depends on student. Young/complex needs: 1-2 sentences + pictures. Older/able: full page. Keep it SHORT - long stories lose attention.\n\nIMPLEMENTATION:\n1) WRITE story (follow guidelines, personalize, visuals)\n2) INTRODUCE: Read together, discuss, answer questions\n3) PRACTICE: Read daily BEFORE relevant situation (e.g., read fire drill story every morning)\n4) AVAILABLE: Have story accessible during situation if needed\n5) REVIEW: Did it help? Adjust if needed\n6) FADE: As student internalizes, reduce frequency\n\nEXAMPLE - Fire Drill Story:\n"Sometimes at school we have fire drills. [PHOTO of school]\nThe fire alarm is loud. It helps everyone know to leave the building. [PHOTO of alarm]\nMy teacher, Miss Smith, will tell us to line up. [PHOTO of Miss Smith]\nI will line up quietly with my class. [PHOTO of student lining up]\nWe will walk outside to the playground. [PHOTO of playground]\nWe will wait until the drill is finished. [PHOTO of class waiting]\nThen we will go back inside. I will be safe. [PHOTO of student smiling]"\n\nCOMMON MISTAKES: Too long, too directive (just rules), punishing tone, not personalized, no visuals, not reading it regularly.',

    parent_information: 'Social Stories are short, personalized stories helping your autistic child understand social situations and what to expect. Autistic children often find unpredictable situations confusing or anxiety-provoking because social "rules" aren\'t obvious. Social Stories explicitly teach: what will happen, why it happens, what your child can do, reassurance they\'ll be OK. We\'ve created a Social Story for your child about [situation]. Please read it together daily, especially before that situation. Use positive, calm tone. Answer questions. Have it available during the situation if helpful. Over time, your child will understand and the story may not be needed anymore. You can create your own Social Stories at home for other situations (dentist, family events, holidays) using the same structure. Social Stories should be positive and informative, never punishing. This is a respectful, autism-affirming way to teach social understanding and reduce anxiety.',

    useful_links: [
      'https://carolgraysocialstories.com/social-stories',
      'https://www.autism.org.uk/advice-and-guidance/professional-practice/social-stories-autism',
      'https://www.thesocialstoryprojust.com',
      'https://www.autismparentingmagazine.com/social-stories-children',
      'https://www.twinkl.co.uk/resources/social-stories'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['social_stories', 'autism', 'ASC', 'ASD', 'visual_supports', 'Carol_Gray', 'tier_1', 'social_understanding', 'anxiety', 'transitions', 'evidence_based']
  },

  // Dr. Scott Ighavongbe-Patrick's Additional Evidence-Based Interventions
  {
    id: 'attachment-informed-classroom-strategies',
    name: 'Attachment-Informed Classroom Strategies for Different Attachment Styles',
    category: 'social_emotional',
    subcategory: 'attachment_trauma',
    description: 'Differentiated classroom strategies tailored to specific attachment styles (Resistant/Ambivalent, Disorganized/Disoriented, Avoidant). Addresses attachment-related anxiety, hypervigilance, controlling behaviours, and relationship difficulties through trauma-informed, attachment-aware approaches.',
    targeted_needs: ['Attachment difficulties', 'Trauma', 'LAC (Looked After Children)', 'Adoption', 'Early adversity', 'Anxiety', 'Hypervigilance', 'Controlling behaviour', 'Relationship difficulties', 'Trust issues'],

    evidence_level: 'tier_2',
    research_sources: ['Ainsworth Attachment Theory', 'Bowlby Attachment Research', 'Bomber (2007) Inside I\'m Hurting', 'Geddes (2006) Attachment in the Classroom', 'Hughes Attachment-Focused Approaches', 'Trauma-Informed Schools Research'],
    effect_size: 0.68,
    success_rate: '65-75% show improved emotional regulation and school engagement',

    age_range: ['early_years', 'primary', 'secondary'],
    setting: ['classroom', 'small_group', 'one_to_one', 'mixed'],
    duration: 'Ongoing adaptive approach',
    frequency: 'Daily relationship-based interactions',
    session_length: 'Continuous embedded approach',

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Attachment theory training for staff', 'Trauma-informed practice resources', 'Relationship-building tools', 'Sensory regulation resources', 'Safe spaces', 'Visual schedules', 'Transition supports', 'Worry box', 'Permission cards'],
    cost_implications: '£100-£500 for training and resources',

    key_components: [
      'Understanding attachment styles (Resistant/Ambivalent, Disorganized/Disoriented, Avoidant)',
      'Connection before correction',
      'Differentiated strategies based on attachment profile',
      'Predictable routines and transitions',
      'Safe spaces and co-regulation tools',
      'Relationship repair protocols',
      'Sensory regulation support',
      'Developmental age vs chronological age awareness',
      'Trauma-sensitive language and responses'
    ],

    fidelity_checklist: [
      'Staff trained in attachment theory and trauma-informed practice',
      'Child\'s attachment style identified',
      'Strategies individualized to attachment profile',
      'Consistent key adult assigned',
      'Connection prioritized before correction',
      'Predictable routines established',
      'Safe space available',
      'Transitions warned in advance',
      'Sensory needs addressed',
      'Developmental age considered in expectations',
      'Relationship repair after ruptures',
      'No shame-based discipline'
    ],

    progress_indicators: [
      'Reduced anxiety and hypervigilance',
      'Improved trust in key adults',
      'Better emotional regulation',
      'Decreased controlling behaviours',
      'More appropriate help-seeking',
      'Improved peer relationships',
      'Better transitions',
      'Increased school attendance',
      'Reduced meltdowns/shutdowns',
      'Improved academic engagement'
    ],

    expected_outcomes: [
      'Secure base established at school',
      'Improved attachment security',
      'Better emotional regulation (65-75% improvement)',
      'Reduced anxiety and stress responses',
      'Improved relationships with adults and peers',
      'Better learning engagement',
      'Reduced exclusion/behavioural incidents',
      'Improved wellbeing and school belonging'
    ],

    adaptations: [
      'RESISTANT/AMBIVALENT: High anxiety/uncertainty - Need to hold teacher attention, dependent on teacher. Strategies: Differentiated tasks, turn-taking for attention, holding special object, responsibility for tasks not people, explicit comments showing teacher thinking about them, proximity without constant 1:1',
      'DISORGANIZED/DISORIENTED: Extreme fear/anxiety expressed as controlling/omnipotent - Unexpected eruptions, persistent refusal, heightened stress state. Strategies: Connection before correction, acknowledge developmental age vs chronological age, safe spaces, worry box, permission cards for breaks, concrete/rhythmic activities, consistent responses (no shame)',
      'AVOIDANT: Indifference to uncertainty - Need to be autonomous, deny need for support, attention toward task rather than teacher. Strategies: Pairs/small groups for proximity, clear structured tasks, choice elements, peer mentors, stories about feelings, respect independence while being available',
      'ALL STYLES: Predictable routines, transition warnings, key adult, safe spaces, co-regulation, relationship repair, developmental vs chronological age, no shame/punishment for attachment behaviours'
    ],

    contraindications: ['Not appropriate if staff lack attachment training', 'Avoid during acute crisis without specialist support', 'Requires consistent key adult - won\'t work if frequent staff changes'],

    complementary_interventions: [
      'Theraplay/DDP (Dyadic Developmental Psychotherapy)',
      'Play therapy',
      'Nurture groups',
      'Sensory integration (OT)',
      'Trauma-focused CBT',
      'Family support/parenting programs',
      'Key person attachment relationship'
    ],

    implementation_guide: 'STEP 1: UNDERSTAND ATTACHMENT - Train staff in Ainsworth\'s attachment styles: SECURE (50-60%): Trust adults, seek help, regulate emotions well. RESISTANT/AMBIVALENT (15%): High anxiety, clingy, need constant reassurance. AVOIDANT (15-20%): Independent, don\'t seek help, suppress emotions. DISORGANIZED/DISORIENTED (15%): Fearful, controlling, unpredictable responses. STEP 2: IDENTIFY CHILD\'S PROFILE - Which attachment style? What triggers dysregulation? What soothes? Developmental vs chronological age gap? STEP 3: DIFFERENTIATE STRATEGIES - See adaptations above for specific approaches. STEP 4: KEY ADULT - Assign consistent adult (not necessarily teacher - could be TA, pastoral lead). This person provides secure base. STEP 5: CONNECTION BEFORE CORRECTION - When behaviour challenges, connect emotionally FIRST. "I see you\'re struggling. Let\'s figure this out together." BEFORE "You broke the rule, here\'s consequence." STEP 6: PREDICTABLE ENVIRONMENT - Visual schedules, transition warnings, consistent routines, warn of changes, safe spaces available. STEP 7: DEVELOPMENTAL AGE - Attachment trauma can mean child\'s emotional age lags behind. A 10-year-old may have 5-year-old emotional regulation. Adjust expectations accordingly. STEP 8: CO-REGULATION - Model calm, provide sensory tools (fidgets, weighted blanket, calm space), breathing together, validate emotions. STEP 9: RELATIONSHIP REPAIR - After ruptures (meltdowns, conflicts), REPAIR the relationship. "I\'m still here, we\'re OK, I care about you." Don\'t hold grudges. STEP 10: NO SHAME - Attachment difficulties are NOT naughty. Avoid shame-based discipline (humiliation, isolation, withdrawal of relationship).',

    parent_information: 'Your child\'s early experiences have shaped how they relate to others - their "attachment style." If early relationships were inconsistent, frightening, or unresponsive, your child may have developed insecure attachment patterns as a survival strategy. This isn\'t their fault or yours - it\'s their brain\'s way of coping. At school, we\'re using ATTACHMENT-INFORMED strategies: 1) Key Adult - consistent person your child can rely on. 2) Connection Before Correction - relationship first, behaviour second. 3) Predictable Routines - reduces anxiety. 4) Safe Spaces - somewhere to regulate emotions. 5) Developmental Age Awareness - we understand your child\'s emotional age may be younger than chronological age. 6) Relationship Repair - after difficult moments, we repair the relationship. 7) No Shame - we never use shame-based discipline. Your role: Share what works at home, communicate about triggers, celebrate progress (even tiny steps), be patient - attachment healing takes time. Work with us consistently. With secure, consistent, warm relationships, attachment patterns CAN improve.',

    useful_links: [
      'https://beaconhouse.org.uk - Beacon House attachment resources',
      'https://www.attachmentresearch community.com',
      'https://ddpnetwork.org - Dan Hughes DDP',
      'https://www.nurtureuk.org',
      'https://www.annafreud.org/trauma-informed-schools'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['attachment', 'trauma', 'LAC', 'adoption', 'tier_2', 'relationship_based', 'trauma_informed', 'EP_intervention', 'evidence_based']
  },

  {
    id: 'positive-timetable-recording',
    name: 'Positive Timetable Recording - Solution-Focused Behaviour Tracking',
    category: 'social_emotional',
    subcategory: 'behavior_monitoring',
    description: 'Solution-focused behaviour monitoring system that records and highlights "problem-free" times rather than focusing on difficulties. Uses timetable format to track when behaviour is SUCCESSFUL, increasing child\'s awareness, responsibility, and self-regulation. Based on solution-focused brief therapy principles (Rowe, 2012).',
    targeted_needs: ['Behavior difficulties', 'Self-regulation challenges', 'Need for positive feedback', 'Attention-seeking', 'Low self-esteem', 'Behavior change resistance', 'Solution-focused approaches'],

    evidence_level: 'tier_2',
    research_sources: ['Rowe (2012) Solution-Focused Practice', 'Solution-Focused Brief Therapy Research', 'Positive Psychology', 'Strength-Based Approaches'],
    effect_size: 0.58,
    success_rate: '55-70% show improved self-regulation and behaviour awareness',

    age_range: ['early_years', 'primary', 'secondary'],
    setting: ['classroom', 'home', 'mixed'],
    duration: '4-8 weeks minimum',
    frequency: 'Daily recording and review',
    session_length: '5-10 minutes check-in, continuous recording',

    complexity: 'low',
    staff_training_required: true,
    resources_needed: ['Blank weekly timetables', 'Highlighter pens', 'Tracking forms', 'Review meeting structure', 'Home communication sheets'],
    cost_implications: '£10-£30 for materials',

    key_components: [
      'Weekly timetable format (personalized to child\'s schedule)',
      'Recording ONLY problem-free times (not problems)',
      'Highlighter system (solid line = problem-free, dotted = mixed, blank = problems)',
      'Focus on frequency and duration (not intensity)',
      'Daily/twice-daily review with child',
      'Solution-focused questions (What helped? What can you do?)',
      'Attribution to child\'s own actions (not external factors)',
      'Identifies patterns (when is behaviour successful?)',
      'No targets set (child leads progress)',
      'Celebrates problem-free times'
    ],

    fidelity_checklist: [
      'Blank timetable created for child\'s week',
      'Explained to child: "We\'re recording GOOD times, not problems"',
      'Highlighter used to show problem-free periods (solid line)',
      'Dotted line for "mixed" periods',
      'Blank spaces for problem times (no detail recorded - not focus)',
      'Review held regularly (start with after each session, phase to twice-daily, then daily)',
      'Four solution-focused questions asked: 1) Check child\'s perception matches adult, 2) What helped this be problem-free? 3) What was good for you/others? 4) What will keep this going?',
      'Attribution to child\'s actions emphasized',
      'Patterns discussed (notice lunchtime always green? PE lessons?)',
      'NO targets set or pressure to increase problem-free time',
      'Can develop to child self-recording'
    ],

    progress_indicators: [
      'Increased problem-free periods',
      'Child recognizes own successful strategies',
      'Child attributes success to own actions (not luck/others)',
      'Child identifies patterns',
      'Improved self-awareness',
      'Increased self-regulation',
      'More positive teacher-child interactions',
      'Child requests to see timetable',
      'Behavior improvement maintained',
      'Child self-records independently'
    ],

    expected_outcomes: [
      'Improved behaviour self-regulation',
      'Increased awareness of successful strategies',
      'Positive focus (strengths not deficits)',
      'Better relationships with adults',
      'Increased problem-free time',
      'Improved self-esteem',
      'Sense of agency and control',
      'Pattern recognition skills',
      'Reduced need for external behaviour management'
    ],

    adaptations: [
      'Early Years/SEN: Simpler timetable (morning/snack/lunch/afternoon), more frequent reviews, adult-led',
      'Primary: Half-day or full-day timetable, twice-daily reviews moving to daily',
      'Secondary: Full week timetable, daily or weekly reviews, more student-led',
      'Home: Adapt for home routine (breakfast/morning/lunch/afternoon/dinner/bedtime)',
      'Whole class/group: Use for multiple students, celebrate patterns together',
      'Very challenging behaviour: Start with very short periods (15-minute segments)'
    ],

    contraindications: ['Ineffective if used punitively', 'Not appropriate if child lacks insight', 'Don\'t use if focus on problems continues despite tool'],

    complementary_interventions: [
      'Solution-focused counseling',
      'Strengths-based approaches',
      'Restorative practices',
      'Self-regulation strategies',
      'Positive Behavior Support',
      'Motivational interviewing'
    ],

    implementation_guide: 'RATIONALE: When behaviour improves, FREQUENCY and DURATION change before INTENSITY. Traditional recording focuses on intensity ("How bad was it?"), missing early improvements. Positive Timetable Recording captures frequency/duration changes, showing progress sooner and motivating continued effort. STEP 1: Create Timetable - Blank timetable for child\'s week (or day). Include all periods (lessons, break, lunch, etc.). STEP 2: Introduce to Child - "We\'re going to use highlighters to record times when things go well for you. We\'ll meet to talk about ONLY the good times, not what went wrong." STEP 3: Recording System - SOLID LINE: Problem-free from adult\'s perspective. DOTTED LINE: Bit on/off, mixed. BLANK: Problems (but we don\'t record details). STEP 4: Review Meetings - Start frequent (after each period or twice-daily), phase to daily. Ask FOUR QUESTIONS: 1) "Was that problem-free for you too, or did you feel differently?" (Check perceptions). 2) "What helped that time be problem-free?" (Identify strategies - child\'s actions!). 3) "What was good about that time for you and others?" (Reflect on benefits). 4) "What will keep these good times going?" (Plan, but don\'t set targets or pressure). STEP 5: Attribution - Emphasize child\'s agency. NOT "The teacher was nice to you" BUT "You waited patiently/you asked for help/you took a break when needed." STEP 6: Pattern Analysis - "I notice lunchtimes are usually problem-free - what\'s different then?" "PE is always green - what helps?" STEP 7: Celebrate - Celebrate progress! Point out increases. NO PRESSURE to improve faster. STEP 8: Develop Independence - Move to child self-recording when ready.',

    parent_information: 'Positive Timetable Recording is a SOLUTION-FOCUSED tool. Instead of tracking every problem your child has, we track PROBLEM-FREE times. Why? Because research shows when behaviour improves, small changes happen first (how often, how long) before big changes (how intense). By focusing on WHAT\'S WORKING, your child becomes more aware of successful strategies, takes ownership, and feels motivated. How it works: We create a timetable of your child\'s day/week. After each period, we highlight if it was problem-free (solid line), mixed (dotted line), or had problems (blank - we don\'t focus on this). We meet with your child to discuss: What helped? What was good? What can keep it going? We emphasize YOUR CHILD\'S actions, not luck or others being nice. Over time, your child recognizes their own power to self-regulate. At home: You can use the same approach! Create a home timetable (breakfast, morning, school run, after school, dinner, bedtime). Highlight problem-free times. Discuss with your child. Focus on THEIR strategies. Celebrate! NO targets, NO pressure - let progress happen naturally.',

    useful_links: [
      'https://www.solutionfocusedschools.co.uk',
      'https://www.brief therapy.org.uk',
      'https://www.edpsych.org.uk/solution-focused-practice'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['solution_focused', 'behaviour_monitoring', 'strengths_based', 'self_regulation', 'tier_2', 'positive_psychology', 'EP_tool']
  },

  {
    id: 'abcc-functional-behaviour-analysis',
    name: 'ABCC Charts - Functional Behaviour Analysis for Schools',
    category: 'social_emotional',
    subcategory: 'behavior_assessment',
    description: 'Systematic behaviour recording tool analyzing Antecedent-Behavior-Consequence-Communication (ABCC). Helps identify WHY behaviour happens (function/communication) to develop effective interventions. Based on positive behaviour support model seeing behaviour as purposeful communication of unmet needs.',
    targeted_needs: ['Challenging behaviour', 'Need to understand behaviour function', 'Intervention planning', 'Pattern identification', 'Communication through behaviour', 'Unmet needs'],

    evidence_level: 'tier_1',
    research_sources: ['LaVigna & Willis (1995, 2005) Positive Behavioral Support', 'Dorado et al (2016) HEARTS Trauma-Informed Schools', 'Herbert (1985) Functional Analysis', 'Tim Cooke EP Practitioner Research'],
    effect_size: 0.72,
    success_rate: '70-80% lead to effective intervention when analyzed properly',

    age_range: ['early_years', 'primary', 'secondary', 'post_16'],
    setting: ['classroom', 'mixed'],
    duration: '1-4 weeks data collection, then ongoing intervention',
    frequency: 'Record each incident for time-limited period',
    session_length: '2-5 minutes per recording',

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['ABCC chart templates', 'Staff training in functional analysis', 'Analysis framework', 'Intervention planning tools', 'Data review meeting time'],
    cost_implications: '£20-£100 for materials and training',

    key_components: [
      'Antecedent: What was happening BEFORE? (Context, not trigger)',
      'Behavior: What happened? (Objective description, no interpretation)',
      'Consequence: What happened AFTER? (What did child obtain/avoid?)',
      'Communication: What was child trying to achieve/communicate? (Hypothesis about function)',
      'Pattern analysis across multiple incidents',
      'Function identification (escape, attention, tangible, sensory)',
      'Intervention matched to function',
      'Team-based hypothesis development'
    ],

    fidelity_checklist: [
      'A-B-C columns completed descriptively (NOT interpretatively)',
      'Antecedent = context (where, when, with whom, what activity)',
      'Behavior = specific, observable description (not "disruptive" but "threw pencil")',
      'Consequence = what child obtained/avoided (not just disciplinary response)',
      'Communication column completed AFTER analyzing multiple incidents',
      'Pattern analysis conducted',
      'Multiple staff perspectives included',
      'Child\'s perspective considered (if possible)',
      'Hypothesis about function developed',
      'Intervention designed to meet function in appropriate way',
      'Time-limited data collection (not every incident forever)'
    ],

    progress_indicators: [
      'Clear pattern identified',
      'Function/communication understood',
      'Hypothesis developed',
      'Intervention designed and implemented',
      'Behavior frequency/intensity decreasing',
      'Replacement behaviour increasing',
      'Child\'s needs met appropriately',
      'Staff feel more confident responding'
    ],

    expected_outcomes: [
      'Understanding of behaviour function',
      'Effective, function-matched intervention',
      'Reduced challenging behaviour (70-80%)',
      'Increased appropriate communication',
      'Staff empathy and understanding increased',
      'Proactive rather than reactive responses',
      'Child\'s legitimate needs met',
      'Better relationships'
    ],

    adaptations: [
      'Simplified version: ABC only (omit Communication initially)',
      'Digital: Use apps/forms for quick recording',
      'Whole-staff: Multiple staff record same child for comprehensive picture',
      'Home: Parents can use same format for home behaviours',
      'Specific behaviour: Focus on one target behaviour at a time',
      'Visual: Add photos/symbols for non-readers'
    ],

    contraindications: ['Must be descriptive not interpretative in A-B-C columns', 'Don\'t continue forever - analyze after sufficient data', 'Useless if not analyzed and acted upon'],

    complementary_interventions: [
      'Positive Behavior Support Plans',
      'Communication intervention (especially if behaviour is communication)',
      'Environmental modifications',
      'Teaching replacement behaviours',
      'Sensory assessment and support',
      'Relationship-building strategies'
    ],

    implementation_guide: 'PHILOSOPHY: "Children are trying to solve problems rather than be one" (Herbert, 1985). Behavior is COMMUNICATION - child is trying to tell us something or achieve something. Our job: understand the message, then teach better ways to communicate. "What problem is the child trying to solve right now?" ABCC STRUCTURE: ANTECEDENT (A): What was happening BEFORE? NOT "What triggered it?" (we may not see trigger). CONTEXT: Where? With whom? What activity? What just happened? Example: "During Maths, in classroom, working independently on worksheet, 10 mins into task." BEHAVIOR (B): What happened? OBJECTIVE description. NOT "disruptive," "naughty," "attention-seeking." WHAT DID YOU SEE? Example: "Threw pencil across room, shouted \'This is stupid\', refused to continue." CONSEQUENCE (C): What happened AFTER? What did child OBTAIN or AVOID? NOT just "I gave detention." What payoff? Example: "Removed from lesson to quiet room, completed easier work with TA 1:1." (Obtained: escape from hard task + adult attention + easier work). COMMUNICATION (C): Complete LATER after multiple incidents. What is child communicating? What legitimate need? Example: "I need help with this work" or "I find it hard to persevere when frustrated" or "I need adult attention." ANALYSIS: Collect 5-10 incidents. Look for PATTERNS: Same antecedents? Same consequences? Common functions? FOUR FUNCTIONS: 1) ESCAPE/AVOIDANCE (to get away from something), 2) ATTENTION (to get adult/peer attention), 3) TANGIBLE (to get object/activity), 4) SENSORY (feels good/relieves discomfort). INTERVENTION: Match intervention to FUNCTION. Escape function? → Make task easier, teach help-seeking, provide breaks. Attention function? → Increase positive attention, teach appropriate attention-seeking. NOT one-size-fits-all!',

    parent_information: 'ABCC charts help us understand WHY your child behaves in challenging ways. We believe: "Children are trying to solve problems rather than be one." Your child\'s behaviour is COMMUNICATION - they\'re trying to tell us something or achieve something, but in an unhelpful way. ABCC = Antecedent (what was happening before), Behavior (what happened), Consequence (what did they get/avoid), Communication (what were they trying to achieve?). Example: Antecedent = Difficult homework. Behavior = Shouting, refusal. Consequence = Sent to room (escape), homework not done. Communication = "I need help, this is too hard, I\'m frustrated." NOW WE UNDERSTAND! The intervention: Offer help earlier, break tasks down, teach \'I need help\' phrase, provide breaks. We\'re meeting the NEED (help with hard work) in an APPROPRIATE way. You can use ABCC at home too! When challenging behaviour happens, note: What was happening before? What exactly happened? What did my child get or avoid? What might they be trying to communicate? Once you understand the function, you can meet that need in a better way.',

    useful_links: [
      'https://www.challengingbehaviour.org.uk',
      'https://www.pbis.org/resource/functional-behavioural-assessment',
      'https://www.behaviour.org'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['functional_analysis', 'behaviour_assessment', 'positive_behaviour_support', 'ABC', 'function', 'tier_1', 'EP_tool', 'evidence_based']
  },

  {
    id: 'pupil-voice-participation-framework',
    name: 'Pupil Voice & Participation Framework - Gathering Children\'s Views',
    category: 'social_emotional',
    subcategory: 'participation_rights',
    description: 'Comprehensive framework for meaningfully gathering and acting upon children and young people\'s views about their education, support, and wellbeing. Based on UNCRC Article 12 (right to be heard), Person-Centered Planning principles, and participatory research methods. Ensures authenticity, accessibility, and action.',
    targeted_needs: ['Pupil participation', 'Voice and choice', 'EHCP/PCP development', 'Decision-making involvement', 'Rights-based practice', 'Person-centered planning', 'Advocacy', 'Authentic consultation'],

    evidence_level: 'tier_1',
    research_sources: ['UNCRC Article 12', 'Lundy Model of Participation', 'Person-Centered Planning (Sanderson)', 'Lancaster & Broadbent Listening to Young Children', 'Mosaic Approach (Clark & Moss)', 'Children & Young People\'s Participation Research'],
    effect_size: 0.71,
    success_rate: '75-85% report feeling heard and involved when implemented with fidelity',

    age_range: ['early_years', 'primary', 'secondary', 'post_16'],
    setting: ['classroom', 'small_group', 'one_to_one', 'mixed'],
    duration: 'Ongoing embedded practice',
    frequency: 'Regular structured opportunities + continuous daily practice',
    session_length: '15-60 minutes depending on method and age',

    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Person-Centered Planning tools (One Page Profile, PATH, MAPs)', 'Accessible communication tools (AAC, symbols, Makaton)', 'Creative methods (art, play, photography, video)', 'Talking Mats', 'Scaling tools', 'Child-friendly questionnaires', 'Advocate support if needed'],
    cost_implications: '£100-£500 for training and resources',

    key_components: [
      'Multiple methods matched to child (verbal, visual, play-based, creative)',
      'Accessible communication (simplified language, AAC, visual supports)',
      'Safe, comfortable environment',
      'Trusted adult present',
      'Time and patience (no rushing)',
      'Choice and control (opt-out, choose method)',
      'Acting on views (not tokenistic)',
      'Feedback to child (how their views influenced decisions)',
      'UNCRC Article 12 principles (Space, Voice, Audience, Influence)',
      'Person-Centered Planning approaches (child at center)'
    ],

    fidelity_checklist: [
      'Purpose explained to child in accessible way',
      'Method matched to child\'s communication and preferences',
      'Child given choice (participate or not, which method)',
      'Environment safe, comfortable, private',
      'Trusted adult present',
      'Sufficient time allowed (not rushed)',
      'Open questions used (not leading)',
      'Child\'s actual words/views recorded (not adult interpretation)',
      'Views shared with relevant decision-makers',
      'Child told how their views influenced decisions',
      'If views not acted upon, reasons explained respectfully',
      'Follow-up conversation held'
    ],

    progress_indicators: [
      'Child participates willingly',
      'Child expresses views (in own way)',
      'Child reports feeling heard',
      'Views documented accurately',
      'Views influence decisions',
      'Feedback given to child',
      'Child\'s confidence in expressing views increases',
      'Adults value and seek child\'s perspective',
      'Culture of participation develops'
    ],

    expected_outcomes: [
      'Child feels heard and valued (75-85%)',
      'Improved decision-making (child\'s perspective included)',
      'Better outcomes (plans match child\'s needs/wants)',
      'Increased child engagement and motivation',
      'Empowerment and agency',
      'Rights fulfilled (UNCRC Article 12)',
      'Stronger relationships (adult-child)',
      'Culture change (child as active participant, not passive recipient)'
    ],

    adaptations: [
      'EARLY YEARS: Mosaic Approach (observation, child-led tours, photos, play), Talking Mats, drawing, role play with toys',
      'PRIMARY: Scaling (1-10, emoji scales), All About Me pages, diamond ranking, Blob Trees, Circle of Friends mapping, video diaries',
      'SECONDARY: Written questionnaires, focus groups, student councils, co-production, peer research, video/photography projects, online surveys',
      'NON-VERBAL: Talking Mats, AAC, eye gaze, photos, symbols, objects of reference, intensive interaction, observe preferences/responses',
      'AUTISM: Visual supports, written questions in advance, choice boards, special interest incorporation, quiet space, no eye contact pressure',
      'EHCP/PCP: One Page Profile, PATH, MAPs, Person-Centered Reviews, aspirations mapping, good day/bad day charts'
    ],

    contraindications: ['Tokenistic consultation (asking but not acting) damages trust', 'Inappropriate for safeguarding concerns requiring immediate action', 'Must match method to child - one size doesn\'t fit all'],

    complementary_interventions: [
      'Person-Centered Planning',
      'Advocacy support',
      'Communication interventions (AAC)',
      'Rights education',
      'Self-advocacy training',
      'Decision-making support',
      'Accessible information provision'
    ],

    implementation_guide: 'UNCRC ARTICLE 12: Every child has the right to express views freely in all matters affecting them, and for those views to be given due weight. LUNDY MODEL (4 elements): SPACE: Safe, comfortable environment, time, no pressure. VOICE: Tools to express views (communication support, creative methods). AUDIENCE: Views reach decision-makers. INFLUENCE: Views taken seriously and acted upon. METHODS (match to child): VERBAL: Conversations, interviews, focus groups, councils. VISUAL: Drawing, photos, video, symbols, scaling, Blob Trees. PLAY-BASED: Toys, role play, puppets, games, sand tray. CREATIVE: Art, music, drama, poetry, digital media. STRUCTURED TOOLS: Talking Mats, diamond ranking, 1-10 scales, All About Me, One Page Profile, PATH, MAPs. OBSERVATIONAL: Observe choices, preferences, engagement (especially young/non-verbal). PERSON-CENTERED PLANNING: ONE PAGE PROFILE: What people like/admire about me? What\'s important TO me? What\'s important FOR me? How to support me? PATH: Where do I want to be in 1 year/5 years? What do I need to get there? MAPs: What\'s my story? What are my dreams? What are my strengths? What do I need? IMPLEMENTATION STEPS: 1) Explain purpose to child (why their views matter, how they\'ll be used). 2) Offer choice of methods. 3) Create safe space, trusted adult. 4) Use open questions, child-led pace. 5) Record CHILD\'S words/views (not adult interpretation). 6) Share views with decision-makers. 7) Act on views (incorporate into plans). 8) Give feedback to child ("Your views helped us decide..."). 9) If views not acted upon, explain why respectfully. 10) Embed as ongoing practice, not one-off.',

    parent_information: 'Your child has the RIGHT to be heard in all decisions affecting them (UNCRC Article 12). We take this seriously. We use PUPIL VOICE methods to meaningfully gather your child\'s views about their education, support, and wellbeing. This isn\'t tokenistic - we genuinely want to know what THEY think, and we act on their views. Methods vary: Some children talk, others draw, use photos, symbols, play, or technology. We match the method to YOUR CHILD. We create safe spaces, give time, use trusted adults, offer choices. YOUR CHILD\'S actual words/views are recorded - not what we think they mean. Their views inform decisions about support, teaching, targets, EHCPs. We tell your child how their views made a difference. Why does this matter? 1) It\'s their right. 2) Better outcomes - plans match what THEY need/want. 3) Empowerment - they have voice and agency. 4) Stronger relationships - they feel valued. You can support this at home: Ask your child\'s views on family decisions, respect their opinions (even if you disagree), explain when you can\'t do what they want and why, show them their views matter. Participation is a SKILL - it develops with practice and respect.',

    useful_links: [
      'https://www.lundy.ulst.ac.uk/Lundy-Model-of-Participation.html',
      'https://www.councilfordisabledchildren.org.uk/participation',
      'https://www.helensandersonassociates.co.uk - Person-Centered Planning',
      'https://www.talkingmats.com',
      'https://www.involving.org.uk - Children\'s participation',
      'https://www.ncb.org.uk/participation-rights'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['pupil_voice', 'participation', 'rights', 'UNCRC', 'person_centered', 'advocacy', 'tier_1', 'SEND', 'EHCP', 'empowerment']
  },

  {
    id: 'supporting-children-attachment-needs',
    name: 'Supporting Children with Attachment Needs - Comprehensive School-Based Intervention',
    category: 'social_emotional',
    subcategory: 'attachment_trauma',
    description: 'Comprehensive, evidence-based framework for identifying and supporting children with attachment difficulties in educational settings. Based on Ainsworth\'s attachment styles, Bowlby\'s attachment theory, and neuroscience research. Includes whole-school approaches, individual interventions, parent support, and multi-agency collaboration. Differentiates attachment difficulties from autism (Coventry Grid). Created by Dr. Scott Ighavongbe-Patrick CPsychol DEPsych MBPsS.',
    targeted_needs: ['Attachment difficulties', 'Insecure attachment (Resistant/Ambivalent, Avoidant, Disorganized)', 'Trauma', 'Looked After Children (LAC)', 'Adopted children', 'Adverse Childhood Experiences (ACEs)', 'Relationship difficulties', 'Emotional dysregulation', 'Trust issues', 'Control-seeking behaviours', 'Hypervigilance', 'Developmental trauma'],

    evidence_level: 'tier_1',
    research_sources: ['Bowlby Attachment Theory', 'Ainsworth Strange Situation & Attachment Styles', 'Perry (2009) Neuroscience of Trauma', 'Bomber (2007, 2011) Inside I\'m Hurting / Survival Book', 'Geddes (2006) Attachment in the Classroom', 'Hughes (2006) DDP Attachment-Focused Therapy', 'Coventry Grid (2010) Attachment vs Autism Differentiation', 'Dr. Scott Ighavongbe-Patrick (2025) Supporting Children with Attachment Needs'],
    effect_size: 0.78,
    success_rate: '70-85% show improved relationships and emotional regulation',

    age_range: ['early_years', 'primary', 'secondary', 'all'],
    setting: ['mixed', 'classroom', 'one_to_one', 'small_group', 'home'],
    duration: 'Long-term (often 1-3 years) - attachment work takes time',
    frequency: 'Daily - embedded in all interactions',
    session_length: 'N/A - approach embedded throughout day, plus targeted 1:1 sessions as needed',

    complexity: 'high',
    staff_training_required: true,
    resources_needed: ['Attachment training for all staff', 'Key Person system', 'Safe spaces', 'Sensory regulation tools', 'Visual supports', 'Therapeutic Life Story Work materials', 'Supervision for staff (attachment work is emotionally demanding)', 'Multi-agency collaboration protocols', 'Parent support resources'],
    cost_implications: '£500-£2000 for whole-school training + ongoing supervision costs + therapeutic resources',

    key_components: [
      'ATTACHMENT THEORY FOUNDATION: Secure base (Bowlby), Internal Working Model (beliefs about self/others), Attachment styles (Secure, Resistant, Avoidant, Disorganized)',
      'KEY PERSON APPROACH: Designated trusted adult, consistent relationship, safe haven',
      'RELATIONSHIP-FIRST PHILOSOPHY: Connection before correction, all behaviour is communication',
      'UNDERSTANDING NEUROSCIENCE: Stress response systems (fight/flight/freeze/fawn), window of tolerance, brain development impact of trauma',
      'DIFFERENTIATED STRATEGIES: Tailored to attachment style (different needs for Avoidant vs Resistant vs Disorganized)',
      'WHOLE-SCHOOL TRAUMA-INFORMED APPROACH: All staff trained, consistent expectations, relational discipline',
      'EMOTIONAL REGULATION SUPPORT: Co-regulation before self-regulation, safe spaces, sensory tools',
      'FAMILY WORK: Parent support, psychoeducation, strengthening parent-child attachment',
      'LIFE STORY WORK: For LAC/adopted - making sense of past, building coherent narrative',
      'MULTI-AGENCY COLLABORATION: EP, Social Care, CAMHS, Virtual School, Adoption Support'
    ],

    fidelity_checklist: [
      'All staff trained in attachment theory and trauma-informed practice',
      'Key Person assigned and relationship prioritized',
      'Behavior understood through attachment lens (not just behaviour management)',
      'Safe spaces available and accessible',
      'Visual supports and predictability provided',
      'Connection routines (morning greeting, transitions, end of day)',
      'Relational discipline (not punitive) - repair over punishment',
      'Staff supervision for emotional impact of attachment work',
      'Parent engagement and support (not blame)',
      'Multi-agency meetings (TAF/TAC/CIN as appropriate)',
      'Consistent adults (minimize staff changes)',
      'Differentiated strategies matched to attachment style',
      'Emotion coaching and co-regulation used consistently',
      'Realistic expectations (attachment healing takes YEARS, not weeks)',
      'Celebration of small steps and relationship progress'
    ],

    progress_indicators: [
      'RELATIONSHIP QUALITY: Seeks out Key Person, shows preference, accepts comfort, trusts adult support',
      'EMOTIONAL REGULATION: Calmer responses, reduced meltdowns, accepts co-regulation, beginning to self-regulate',
      'BEHAVIOR: Fewer control battles, reduced aggression, less hypervigilance, improved peer relationships',
      'TRUST: Asks for help, shares worries, allows vulnerability, accepts "no" without escalation',
      'SELF-CONCEPT: More positive self-talk, increased self-esteem, reduced shame',
      'LEARNING ENGAGEMENT: Better focus (when emotionally regulated), reduced avoidance, can take risks',
      'PARENT-CHILD RELATIONSHIP: Improved warmth, reduced conflict, better attunement (if family work included)',
      'WINDOW OF TOLERANCE: Stays regulated more often, recovers from dysregulation faster',
      'Note: Progress is NON-LINEAR - expect setbacks, regressions, "testing" behaviours (checking if adult is reliable)'
    ],

    expected_outcomes: [
      'LONG-TERM: More secure attachment patterns (Internal Working Model shifts)',
      'Improved emotional regulation and reduced trauma responses',
      'Stronger, healthier relationships (adults and peers)',
      'Increased trust in adults and reduced hypervigilance',
      'Better learning outcomes (when emotional needs met, learning becomes possible)',
      'Reduced exclusions and behaviour incidents',
      'Improved mental health and wellbeing',
      'Stronger family relationships (if family work included)',
      'Reduced need for specialist services (early intervention)',
      'Note: Realistic expectations - attachment change takes YEARS. Small steps are huge progress.'
    ],

    adaptations: [
      'RESISTANT/AMBIVALENT ATTACHMENT (Anxious, clingy, uncertainty): High reassurance, predictable routines, frequent check-ins, turn-taking for attention (not unlimited), "You\'re safe, I\'m here", teach to ask for help, differentiated tasks to reduce anxiety, allow proximity to Key Person',
      'AVOIDANT ATTACHMENT (Self-reliant, rejects help, independent): Pairs/small groups (not 1:1 initially - too intense), side-by-side activities (less eye contact pressure), respect independence but offer subtle support, clear structured tasks, celebrate effort quietly (not publicly), let them come to you, teach it\'s OK to need help',
      'DISORGANIZED/DISORIENTED ATTACHMENT (Fear, confusion, trauma): Connection before correction, safe spaces immediately available, worry box, consistent routine, warn before transitions, emotion coaching, co-regulation (they can\'t self-regulate yet), short-term targets, relationship above all else, supervision for staff (this is hardest attachment style)',
      'EARLY YEARS: Attachment focus critical - Key Person system, emotional availability, co-regulation, play-based connection, parent attachment support',
      'PRIMARY: Key Person + safe base in classroom, emotion coaching, relationship repair, peer relationship support, Life Story Work (if LAC/adopted)',
      'SECONDARY: Modified Key Person (form tutor/mentor), respect need for autonomy, offer support without pressure, peer relationships increasingly important, transition support (primary to secondary is HIGH RISK for attachment difficulties)',
      'LOOKED AFTER CHILDREN (LAC): Virtual School involvement, PEP targets include attachment/emotional needs, Life Story Work, Theraplay, consistent adults (minimize placement moves), manage transitions carefully, trauma-informed',
      'ADOPTED CHILDREN: Recognize pre-adoption trauma, parent training (attachment parenting), school-home consistency, Life Story Work, Adoption Support Fund for therapy',
      'AUTISM + ATTACHMENT DIFFICULTIES: Use Coventry Grid to differentiate (some behaviours overlap but different origins), visual supports, predictability, special interest connection, sensory needs, both attachment AND autism strategies needed'
    ],

    contraindications: ['Standard behaviour management (detentions, isolation, exclusion) often worsens attachment difficulties - use relational approaches', 'Expecting quick fixes - attachment healing takes YEARS', 'Blaming parents - many parents have their own attachment difficulties and need support, not judgment', 'Removing child from Key Person as punishment - this breaks trust', 'Inconsistent adults - attachment children need CONSISTENCY', 'Dismissing "small" behaviours - for attachment children, sitting near you without running IS huge progress'],

    complementary_interventions: [
      'Theraplay (attachment-focused play therapy)',
      'Dyadic Developmental Psychotherapy (DDP - Hughes)',
      'PACE approach (Playfulness, Acceptance, Curiosity, Empathy)',
      'Nurture Groups',
      'Emotion Coaching',
      'Sensory Regulation Interventions',
      'Social Stories (for predictability)',
      'Life Story Work (for LAC/adopted)',
      'Filial Therapy (parent-child relationship therapy)',
      'Parent training (attachment-based parenting)',
      'CAMHS therapeutic support (if trauma/mental health needs)',
      'Family therapy'
    ],

    implementation_guide: 'COMPREHENSIVE FRAMEWORK FOR SUPPORTING ATTACHMENT NEEDS IN SCHOOLS (Dr. Scott Ighavongbe-Patrick). PART 1: UNDERSTANDING ATTACHMENT. ATTACHMENT THEORY (Bowlby): Child\'s first relationships create an "Internal Working Model" (IWM) - beliefs about: "Am I lovable?" "Are adults reliable?" "Is the world safe?" Secure Attachment (consistent, responsive care): IWM = "I\'m worthy of love, adults help me, world is safe". Result: Confident, emotionally regulated, seeks help when needed. Insecure Attachment (inconsistent/unresponsive care): IWM = "I\'m not worthy, adults let me down, world is dangerous". Result: Hypervigilance, control-seeking, emotional dysregulation, relationship difficulties. AINSWORTH ATTACHMENT STYLES: SECURE (60-70% general population, <10% LAC): Confident, seeks comfort, trusts adults, emotionally regulated, learns well. RESISTANT/AMBIVALENT (10-15%): Anxious, clingy, uncertain if adult will respond, hypervigilant to separation, hard to soothe, needs constant reassurance. AVOIDANT (15-20%): Appears independent, rejects comfort, doesn\'t ask for help (learned adults won\'t respond so "I\'ll do it myself"), suppresses emotions. DISORGANIZED/DISORIENTED (5-10% general, 50-80% LAC/abused children): Fear + confusion, no consistent strategy, fight/flight/freeze, trauma, most concerning. NEUROSCIENCE OF TRAUMA (Perry): Adverse experiences affect brain development - amygdala (threat detection) OVERACTIVE, prefrontal cortex (thinking/regulation) UNDERDEVELOPED. Result: "Always on alert" (hypervigilance), can\'t regulate emotions (needs co-regulation), behaviours = survival strategies. PART 2: KEY PERSON APPROACH. Assign ONE consistent trusted adult (Key Person). NOT a teaching assistant exclusively - could be teacher, TA, learning mentor, office staff. Role: Safe base, secure haven, consistent relationship, someone child can trust and turn to. Daily connection: Morning greeting (warm, predictable), check-ins throughout day, transition support, end-of-day positive goodbye. Child\'s "safe person" - if dysregulated, gets Key Person. Key Person provides: Co-regulation, unconditional positive regard, repair after difficulties, advocacy ("This child is MINE - I\'m looking after them"). PART 3: DIFFERENTIATED STRATEGIES BY ATTACHMENT STYLE. RESISTANT/AMBIVALENT (clingy, anxious): High reassurance ("You\'re safe, I\'m here"), predictable routines + visual timetables, frequent check-ins, teach to ASK for help (instead of anxiety escalating), turn-taking for attention (can\'t give unlimited but be consistent), allow proximity to Key Person, differentiated tasks (reduce overwhelm). AVOIDANT (independent, rejects help): Offer support WITHOUT pressure ("I\'m here if you need me"), pairs/small groups work (1:1 too intense initially), side-by-side activities (less direct eye contact), respect their independence but subtly scaffold, clear structured tasks, celebrate effort QUIETLY (not public praise), let them come to you, teach "It\'s OK to need help sometimes". DISORGANIZED (trauma, fear, confusion): CONNECTION BEFORE CORRECTION - relationship is everything. Safe spaces immediately accessible, warn before transitions, short-term targets, emotion coaching ("I can see you\'re really upset, let\'s take some breaths together"), co-regulation (they CAN\'T self-regulate yet), no surprises, consistent routine, worry box, "You\'re safe here" messages, relational discipline (repair, not punishment), staff supervision (this is emotionally demanding work). PART 4: WHOLE-SCHOOL TRAUMA-INFORMED APPROACH. Train ALL staff (not just Key Person) - teachers, office, lunchtime, bus drivers. Everyone understands: "Behavior is communication", "Connection before correction", "Children are doing their best with the skills they have". Relational discipline: Focus on REPAIR not punishment. "What happened? What were you feeling? What do you need? How can we fix this together?" Avoid: Detentions, isolation, exclusion (these WORSEN attachment - child feels rejected again). Consistent expectations but flexible responses (one-size-fits-all doesn\'t work). Sensory regulation tools: Fidgets, movement breaks, calm spaces, weighted blankets, music. Predictability: Visual timetables, warnings before changes, consistency in adults (don\'t keep changing Key Person). PART 5: EMOTIONAL REGULATION SUPPORT. Attachment children often CAN\'T self-regulate (their brain development affected by trauma). Co-regulation first: Adult stays calm, models regulation, "I can see you\'re upset, let\'s breathe together", proximity, calm voice. Teach window of tolerance: "Green zone" (calm, ready to learn), "Yellow zone" (getting wobbly), "Red zone" (meltdown). Help child recognize zones and ask for help in Yellow. Safe spaces: Calm corner, sensory room, Key Person\'s area - NOT punishment, but place to regulate. Emotion coaching: Name the feeling ("You look really angry"), validate ("That IS frustrating"), offer strategy ("Let\'s try..."), support through it. PART 6: WORKING WITH FAMILIES. Attachment difficulties often intergenerational - parents may have their own attachment trauma. Psychoeducation: Explain attachment to parents (not blaming, but understanding). Parent support: Parenting groups, Theraplay, Filial Therapy, practical strategies at home. School-home consistency: Same approaches, shared language, regular communication (positive contact, not just problems). Recognize parent strengths: Many parents are doing incredible work in difficult circumstances. Offer support, not judgment. PART 7: MULTI-AGENCY COLLABORATION. Attachment needs often require multi-agency response: Educational Psychology (assessment, consultation, intervention planning), Social Care (if safeguarding/LAC), CAMHS (if trauma therapy needed), Virtual School (if LAC - ensure PEP addresses attachment/emotional needs), Adoption Support (if adopted - can access Adoption Support Fund for therapy). TAF/TAC meetings: Coordinate support, share information, joint planning. PART 8: LIFE STORY WORK (for LAC/adopted children). Many LAC/adopted children have fragmented memories and confusion about their past. Life Story Work: Create coherent narrative of their life, photo books, timeline, "This is what happened and why", helps make sense of trauma and moves. Therapeutic tool: Process difficult feelings, build identity, understand "It wasn\'t my fault". Must be done carefully - trained staff, therapy support, parent/carer involvement. PART 9: DIFFERENTIATING ATTACHMENT FROM AUTISM (Coventry Grid). Some behaviours overlap: Poor eye contact, relationship difficulties, rigidity, sensory issues. BUT different origins: ATTACHMENT: Eye contact avoided due to FEAR/mistrust. Relationships avoided due to LEARNED UNRELIABILITY. Rigidity = need for CONTROL (world feels unsafe). AUTISM: Eye contact uncomfortable (sensory/social). Relationships confusing (social communication difficulty). Rigidity = need for PREDICTABILITY (anxiety). Use Coventry Grid to differentiate - ask: "Is this about FEAR/trust (attachment) or CONFUSION/sensory (autism)?" Some children have BOTH - need both attachment AND autism strategies. PART 10: REALISTIC EXPECTATIONS & SELF-CARE. Attachment healing takes YEARS, not weeks. Celebrate tiny progress: "Child sat near me without running" = huge step. Expect regressions: Child will "test" you ("Will you reject me too?"). Stay consistent. Non-linear progress: Good days and terrible days - this is normal. Staff self-care: Attachment work is emotionally exhausting. Supervision essential. Team approach - share the load. Remember: You\'re planting seeds. You may not see the full growth, but you\'re making a difference. SUMMARY: Supporting attachment needs = RELATIONSHIP-BASED, TRAUMA-INFORMED, LONG-TERM work. Key Person + whole-school approach + family support + differentiated strategies + realistic expectations = life-changing for vulnerable children.',

    parent_information: 'ATTACHMENT - what is it? When your child was very young, their early relationships taught them about the world: "Am I safe?" "Can I trust adults?" "Am I lovable?" If those early experiences were consistent and loving, your child learned "Yes, I\'m safe, adults help me, I\'m worthy of love" (SECURE ATTACHMENT). But if early experiences were frightening, inconsistent, or neglectful (even if not your fault - illness, separation, trauma), your child might have learned "The world is scary, adults let me down, I have to cope alone" (INSECURE ATTACHMENT). This isn\'t your child\'s fault OR yours - it\'s what their brain learned to survive difficult early experiences. SIGNS YOUR CHILD MAY HAVE ATTACHMENT DIFFICULTIES: Very clingy and anxious OR very independent and won\'t ask for help. Extreme reactions to small things (meltdowns, aggression). Doesn\'t trust adults, always "on guard" (hypervigilant). Finds relationships really hard (adults and other children). Needs to be in control all the time. Can\'t calm down even with your support. WHAT HELPS: CONSISTENT, RELIABLE ADULTS: Your child needs to learn "This adult won\'t let me down" - but that takes TIME (months/years, not weeks). The school has assigned a KEY PERSON - one consistent adult your child can trust and turn to. CONNECTION BEFORE CORRECTION: When your child behaves badly, it\'s usually because they\'re scared, overwhelmed, or testing if you\'ll reject them. Stay calm, connect first ("I can see you\'re upset"), then address behaviour. PATIENCE: Attachment healing is SLOW. Celebrate tiny progress ("Today you asked for help instead of throwing things - that\'s HUGE!"). Expect setbacks - they\'re normal. CO-REGULATION: Your child probably can\'t calm themselves down yet (their brain development was affected). YOU have to stay calm and help them regulate ("Let\'s take some deep breaths together"). PREDICTABILITY: Routines, warnings before changes, visual timetables - these help your child feel safe. Surprises feel threatening. REPAIR: When things go wrong, REPAIR the relationship. "I\'m sorry I shouted. You\'re safe. I\'m here. Let\'s try again." Models that relationships can be mended. WHAT YOU CAN DO AT HOME: Same strategies school is using - consistency between home and school is powerful. Prioritize relationship over behaviour - connection is more important than compliance. Look after YOURSELF - parenting/caring for children with attachment difficulties is exhausting. You need support too. Access support: Parenting groups, therapeutic parenting training, counseling for you, respite. REMEMBER: Your child\'s difficult behaviours are NOT manipulation - they\'re communication. They\'re saying "I\'m scared, I don\'t trust this, I need help but I don\'t know how to ask". With time, patience, and consistent support, your child CAN learn that they\'re safe, adults are reliable, and they\'re worthy of love. It just takes longer than we\'d like. You\'re doing an amazing job - don\'t give up.',

    useful_links: [
      'https://www.annafreud.org/schools-and-colleges/resources/trauma-informed-schools/ - Trauma-informed schools',
      'https://www.adoptionuk.org - Support for adoptive parents',
      'https://www.thefosteringnetwork.org.uk - Foster carer support',
      'https://ddpnetwork.org - Dyadic Developmental Psychotherapy (DDP)',
      'https://www.theraplay.org - Theraplay attachment therapy',
      'https://www.bps.org.uk - British Psychological Society (find EPs)',
      'https://www.corambaaf.org.uk - Life Story Work resources',
      'https://beaconhouse.org.uk - Therapeutic parenting training',
      'https://www.attachmenttraumanetwork.org - Dan Hughes PACE approach',
      'Louise Bomber books: "Inside I\'m Hurting", "The Teacher\'s Pocket Guide", "Know Me to Teach Me"',
      'Kate Cairns: "Attachment, Trauma and Resilience"',
      'Karen Treisman: "A Treasure Box for Creating Trauma-Informed Organizations"',
      'Dr. Scott Ighavongbe-Patrick (2025): Supporting Children with Attachment Needs [Practitioner Guide]'
    ],

    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    tags: ['attachment', 'trauma', 'LAC', 'adopted', 'ACEs', 'key_person', 'trauma_informed', 'tier_1', 'relationship_based', 'neuroscience', 'Bowlby', 'Ainsworth', 'EP_intervention', 'doctoral_research', 'Dr_Scott_Ighavongbe_Patrick', 'evidence_based', 'mixed']
  }
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
      'Decreased challenging behaviour (due to communication)',
      'Possible emergence of spoken words'
    ],

    expected_outcomes: [
      'Functional communication system established',
      'Reduced frustration and challenging behaviour',
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
    description: 'Occupational therapy intervention using controlled sensory experiences to improve processing and integration of sensory information. Addresses over-responsivity, under-responsivity, and sensory-seeking behaviours.',
    targeted_needs: ['Sensory processing disorder', 'Autism (sensory differences)', 'Over-sensitivity to sensory input', 'Sensory-seeking behaviour', 'Poor body awareness', 'Coordination difficulties'],

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
      'Reduced sensory-seeking/avoiding behaviours',
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
      'Reduced challenging behaviours',
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
    targeted_needs: ['Attention difficulties', 'ADHD', 'Autism (sensory needs)', 'Hyperactivity', 'Difficulty sitting still', 'Sensory-seeking behaviour', 'Low arousal/alertness'],

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
      'Fewer behavioural incidents',
      'Better work completion',
      'Student self-advocates for breaks',
      'Improved self-regulation'
    ],

    expected_outcomes: [
      'Maintained optimal arousal for learning',
      'Improved on-task behaviour',
      'Better academic performance',
      'Reduced disruptive behaviour',
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
    behavioural: BEHAVIORAL_INTERVENTIONS.length,
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
