
import * as Lib from '../src/lib/interventions/intervention-library';

async function main() {
    console.log('Exports:', Object.keys(Lib));
    
    // Attempt to aggregate if there is no single master list
    let allInterventions: any[] = [];
    
    if ((Lib as any).INTERVENTION_LIBRARY) {
        allInterventions = (Lib as any).INTERVENTION_LIBRARY;
    } else {
        // Try to combine known categories if they are exported
        const categories = [
            'ACADEMIC_INTERVENTIONS',
            'BEHAVIOURAL_INTERVENTIONS',
            'SOCIAL_EMOTIONAL_INTERVENTIONS',
            'COMMUNICATION_INTERVENTIONS',
            'SENSORY_INTERVENTIONS'
        ];
        
        for (const cat of categories) {
             if ((Lib as any)[cat]) {
                 console.log(`Found category export: ${cat} with ${(Lib as any)[cat].length} items`);
                 allInterventions = [...allInterventions, ...(Lib as any)[cat]];
             }
        }
    }

    console.log(`Total interventions extracted: ${allInterventions.length}`);
    
    // Add new Working Memory interventions
    const newInterventions = [
         {
            id: 'working-memory-chunking',
            name: 'Chunking Strategy Training',
            category: 'academic',
            subcategory: 'cognition',
            description: 'Teaching students to group information into meaningful units (chunks) to bypass working memory limits. Reduces cognitive load by treating groups of items as single units.',
            targeted_needs: ['Poor working memory', 'Difficulty following multi-step instructions', 'Information overload'],
            evidence_level: 'tier_1',
            research_sources: ['Miller (1956)', 'Cowan (2001)'],
            age_range: ['all'],
            setting: ['classroom', 'small_group', 'one_to_one', 'home'],
            duration: '10-15 mins',
            frequency: 'Daily practice',
            session_length: 'Short bursts',
            complexity: 'low',
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
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            tags: ['working_memory', 'cognitive_load', 'study_skills']
        },
        {
            id: 'working-memory-dual-coding',
            name: 'Dual Coding Strategy',
            category: 'academic',
            subcategory: 'cognition',
            description: 'Combining verbal and visual information. Processing information through two channels (visual and auditory) simultaneously to double working memory capacity.',
            targeted_needs: ['Verbal working memory deficit', 'Difficulty retaining spoken information'],
            evidence_level: 'tier_1',
            research_sources: ['Paivio (1971)', 'Caviglioli (2019)'],
            age_range: ['all'],
            setting: ['classroom', 'one_to_one', 'home'],
            duration: 'Embedded in teaching',
            frequency: 'Continuous',
            session_length: 'N/A',
            complexity: 'medium',
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
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            tags: ['dual_coding', 'working_memory', 'multimedia_learning']
        }
    ];

    // Check for duplicates before adding
    for (const newInt of newInterventions) {
        if (!allInterventions.find(i => i.id === newInt.id)) {
            console.log(`Adding new intervention: ${newInt.id}`);
            allInterventions.push(newInt);
        } else {
             console.log(`Intervention ${newInt.id} already exists.`);
        }
    }

    const fs = require('fs');
    fs.writeFileSync('src/lib/interventions/interventions-data.json', JSON.stringify(allInterventions, null, 2));
    console.log('Successfully wrote interventions-data.json');
}

main().catch(console.error);
