
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../src/lib/interventions/interventions-data.json');
let data = [];

try {
  if (fs.existsSync(dataPath)) {
    data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  }
} catch (e) {
  console.log('Error reading data, starting empty', e);
  data = [];
}

const newInterventions = [
  {
    id: 'working-memory-chunking',
    name: 'Chunking Strategy',
    category: 'academic',
    subcategory: 'cognition',
    description: 'Breaking down information into smaller, manageable units (chunks) to reduce cognitive load and improve recall.',
    targeted_needs: ['Working memory difficulties', 'Information processing issues'],
    evidence_level: 'tier_1',
    research_sources: ['Miller (1956)', 'Baddeley (2000)'],
    effect_size: 0.60,
    age_range: ['primary', 'secondary', 'post_16'],
    setting: ['classroom', 'one_to_one', 'home'],
    duration: 'Ongoing',
    frequency: 'Daily',
    session_length: 'Integrated into lessons',
    complexity: 'low',
    staff_training_required: false,
    resources_needed: ['None'],
    cost_implications: 'None',
    key_components: ['Group items', 'Find patterns', 'Organize information'],
    fidelity_checklist: ['Student groups info', 'Recall improved'],
    progress_indicators: ['Improved recall of instructions'],
    expected_outcomes: ['Better retention of facts', 'Following multi-step instructions'],
    adaptations: ['Visual chunking'],
    contraindications: [],
    complementary_interventions: ['Visual supports'],
    implementation_guide: 'Teach students to group phone numbers, spellings, or list items into groups of 3 or 4.',
    parent_information: 'Practice grouping items at home (e.g. shopping list categories).',
    useful_links: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tags: ['memory', 'cognition', 'strategy']
  },
  {
    id: 'working-memory-dual-coding',
    name: 'Dual Coding',
    category: 'academic',
    subcategory: 'cognition',
    description: 'Combining verbal and visual information to broaden the number of channels the brain uses to process information.',
    targeted_needs: ['Working memory difficulties', 'Poor verbal retention'],
    evidence_level: 'tier_1',
    research_sources: ['Paivio (1971)', 'Caviglioli (2019)'],
    effect_size: 0.55,
    age_range: ['all'],
    setting: ['classroom', 'home'],
    duration: 'Ongoing',
    frequency: 'Daily',
    session_length: 'Integrated',
    complexity: 'medium',
    staff_training_required: true,
    resources_needed: ['Visualizers', 'Icons', 'Diagrams'],
    cost_implications: 'None',
    key_components: ['Combine text and image', 'Avoid cognitive overload'],
    fidelity_checklist: ['Visuals support text directly'],
    progress_indicators: ['Better comprehension'],
    expected_outcomes: ['Improved long-term memory'],
    adaptations: [],
    contraindications: [],
    complementary_interventions: ['Graphic organizers'],
    implementation_guide: 'Always accompany spoken explanations with a visual model. Do not speak over text.',
    parent_information: 'Draw pictures to explain concepts.',
    useful_links: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tags: ['memory', 'visual', 'tier_1']
  }
];

// Check duplicates
const existingIds = new Set(data.map(d => d.id));
let addedCount = 0;

newInterventions.forEach(ni => {
  if (!existingIds.has(ni.id)) {
    data.push(ni);
    addedCount++;
    console.log(`Added ${ni.name}`);
  } else {
    console.log(`Skipped ${ni.name} (already exists)`);
  }
});

if (addedCount > 0) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Saved ${data.length} interventions.`);
} else {
  console.log('No new interventions added.');
}
