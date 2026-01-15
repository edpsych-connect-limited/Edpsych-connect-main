
const fs = require('fs');
const path = 'src/lib/interventions/intervention-library.ts';

const metaCognitionIntervention = `

// ADDED: High-Impact Metacognition (EEF +7 Months)
const metacognitionIntervention = {
    id: 'metacognition-self-regulation',
    name: 'Metacognition and Self-Regulation',
    category: 'academic' as const,
    subcategory: 'learning_skills',
    description: 'Explicitly teaching students to plan, monitor, and evaluate their own learning. Focuses on "thinking about thinking" - understanding how they learn and managing their own motivation.',
    targeted_needs: ['Passive learning', 'Poor exam performance', 'Lack of independence', 'Study skills deficit'],
    evidence_level: 'tier_1' as const,
    research_sources: ['Education Endowment Foundation (EEF) Toolkit (+7 months)', 'Quigley et al. (2018)', 'Zimmerman (2002)'],
    effect_size: 0.69,
    success_rate: 'Very High Impact',
    age_range: ['primary', 'secondary', 'post_16'] as any[],
    setting: ['classroom', 'small_group', 'one_to_one', 'home'] as any[],
    duration: 'Integrated into curriculum',
    frequency: 'Every lesson',
    session_length: 'N/A',
    complexity: 'high' as const, // High complexity to implement well, but high reward
    staff_training_required: true,
    resources_needed: ['Modeling frames', 'Planning templates', 'Reflection journals'],
    cost_implications: 'Staff Training (CPD)',
    key_components: ['Planning (What do I need to do?)', 'Monitoring (How is it going?)', 'Evaluation (What went well?)'],
    fidelity_checklist: ['Teacher models thinking aloud', 'Students explicitly plan task approach', 'Structured reflection time provided'],
    progress_indicators: ['Increased student autonomy', 'Better ability to explain learning process'],
    expected_outcomes: ['Significant acceleration in progress (+7 months)', 'Independent learners'],
    adaptations: ['Visual planning boards', 'Scaffolded reflection questions'],
    contraindications: ['None - benefits all learners'],
    complementary_interventions: ['Dual Coding', 'Growth Mindset'],
    implementation_guide: 'Do not just teach the content. Teach the *process* of learning it. Model your thinking: "I am stuck on this hard question. I will try re-reading the question to find clues." Get students to plan before they start writing.',
    parent_information: 'Ask your child "How did you work that out?" rather than just "Is it correct?". Encouraging them to explain their thinking helps them learn.',
    useful_links: ['https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/metacognition-and-self-regulation'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tags: ['metacognition', 'EEF', 'high_impact', 'self_regulation']
};

if (typeof ACADEMIC_INTERVENTIONS !== 'undefined') {
    ACADEMIC_INTERVENTIONS.push(metacognitionIntervention);
}
if (typeof INTERVENTION_LIBRARY !== 'undefined' && Array.isArray(INTERVENTION_LIBRARY)) {
    INTERVENTION_LIBRARY.push(metacognitionIntervention);
}
`;

fs.appendFileSync(path, metaCognitionIntervention);
console.log('Appended Metacognition strategy.');
