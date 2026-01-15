
const fs = require('fs');
const path = 'src/lib/interventions/intervention-library.ts';

const newInterventions = `

// ADDED: Working Memory Strategies
const chunkingIntervention = {
    id: 'working-memory-chunking',
    name: 'Chunking Strategy Training',
    category: 'academic' as const,
    subcategory: 'cognition',
    description: 'Teaching students to group information into meaningful units (chunks) to bypass working memory limits. Reduces cognitive load by treating groups of items as single units.',
    targeted_needs: ['Poor working memory', 'Difficulty following multi-step instructions', 'Information overload'],
    evidence_level: 'tier_1' as const,
    research_sources: ['Miller (1956)', 'Cowan (2001)'],
    age_range: ['all'] as any[],
    setting: ['classroom', 'small_group', 'one_to_one', 'home'] as any[],
    duration: '10-15 mins',
    frequency: 'Daily practice',
    session_length: 'Short bursts',
    complexity: 'low' as const,
    staff_training_required: false,
    resources_needed: ['Visual aids', 'Lists', 'Key vocabulary'],
    cost_implications: 'None',
    key_components: ['Grouping items', 'Finding patterns', 'Categorization'],
    fidelity_checklist: ['Student groups items autonomously', 'Recall improves with chunks'],
    progress_indicators: ['Improved recall of lists', 'Better instruction following'],
    expected_outcomes: ['Increased effective working memory capacity'],
    adaptations: ['Color coding', 'Rhythm/Prosody'],
    contraindications: ['None'],
    complementary_interventions: ['Dual Coding'],
    implementation_guide: 'Teach the student to break long numbers (07700900123) into chunks (07700 900 123). Apply to instructions: "Get your coat" (1), "Line up" (2).',
    parent_information: 'Help your child remember things by breaking them down into small groups of 3 or 4.',
    useful_links: [],
    created_at: '2025-01-15',
    updated_at: '2025-01-15',
    tags: ['working_memory', 'cognitive_load', 'study_skills']
};

ACADEMIC_INTERVENTIONS.push(chunkingIntervention);

const dualCodingIntervention = {
    id: 'working-memory-dual-coding',
    name: 'Dual Coding Strategy',
    category: 'academic' as const,
    subcategory: 'cognition',
    description: 'Combining verbal and visual information. Processing information through two channels (visual and auditory) simultaneously to double working memory capacity.',
    targeted_needs: ['Verbal working memory deficit', 'Difficulty retaining spoken information'],
    evidence_level: 'tier_1' as const,
    research_sources: ['Paivio (1971)', 'Caviglioli (2019)'],
    age_range: ['all'] as any[],
    setting: ['classroom', 'one_to_one', 'home'] as any[],
    duration: 'Embedded in teaching',
    frequency: 'Continuous',
    session_length: 'N/A',
    complexity: 'medium' as const,
    staff_training_required: true,
    resources_needed: ['Icons', 'Diagrams', 'Visualizers'],
    cost_implications: 'Training time',
    key_components: ['Visuals + Text', 'Temporal contiguity', 'Spatial contiguity'],
    fidelity_checklist: ['Visuals explain the text/talk', 'No decorative clip art'],
    progress_indicators: ['Better retention of concepts'],
    expected_outcomes: ['Deeper understanding', 'Long-term retention'],
    adaptations: ['Graphic organizers'],
    contraindications: ['Visual overload'],
    complementary_interventions: ['Chunking'],
    implementation_guide: 'When explaining a concept, draw a simple diagram at the same time. Do not just read text. Use icons to represent steps in a process.',
    parent_information: 'Draw pictures while you explain things to your child.',
    useful_links: ['https://www.olicav.com'],
    created_at: '2025-01-15',
    updated_at: '2025-01-15',
    tags: ['dual_coding', 'working_memory', 'multimedia_learning']
};

ACADEMIC_INTERVENTIONS.push(dualCodingIntervention);

// Ensure they are in the main library export if it exists
if (typeof INTERVENTION_LIBRARY !== 'undefined' && Array.isArray(INTERVENTION_LIBRARY)) {
    // Check if not already there (to be safe against multiple runs)
    if (!INTERVENTION_LIBRARY.find(i => i.id === 'working-memory-chunking')) {
        INTERVENTION_LIBRARY.push(chunkingIntervention);
    }
    if (!INTERVENTION_LIBRARY.find(i => i.id === 'working-memory-dual-coding')) {
        INTERVENTION_LIBRARY.push(dualCodingIntervention);
    }
}
`;

fs.appendFileSync(path, newInterventions);
console.log('Appended new interventions to library.');
