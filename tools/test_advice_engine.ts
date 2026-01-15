
import { RecommendationEngine, StudentProfile } from '../src/lib/ai/recommendation-engine';

const engine = RecommendationEngine.getInstance();

// TEST CASE 1: The "Working Memory" Student
// Scenario: Year 4 student, struggles with multi-step instructions, likely overload.
const profile: StudentProfile = {
    id: 'student_001',
    age_years: 9,
    presenting_needs: ['working_memory', 'following instructions', 'overwhelmed'],
    severity: 'medium',
    setting: 'classroom',
    diagnosis_tags: []
};

console.log('\n================================================================');
console.log('       EDPSYCH CONNECT | INTELLIGENT ADVICE ENGINE v1.0         ');
console.log('================================================================');
console.log(`Analyzing Profile: Student ${profile.id} (${profile.age_years}y)`);
console.log(`Needs: ${profile.presenting_needs.join(', ')}`);
console.log('----------------------------------------------------------------');

const recommendations = engine.generateRecommendations(profile, 3);

if (recommendations.length === 0) {
    console.log('NO MATCHES FOUND.');
} else {
    recommendations.forEach((rec, index) => {
        const i = rec.intervention;
        console.log(`\n[${index + 1}] RECOMMENDATION: ${i.name.toUpperCase()}`);
        console.log(`    Confidence:      ${rec.confidence_score.toFixed(1)}/100`);
        console.log(`    Action:          ${rec.routing_action.toUpperCase()}`);
        console.log(`    Strategy ID:     ${i.id}`);
        console.log(`    Evidence:        ${i.evidence_level.toUpperCase()}`);
        console.log(`    Reasoning:       ${rec.suitability_reasoning}`);
        console.log('    Match Factors:');
        rec.match_factors.forEach(f => {
            console.log(`      * ${f.factor}: ${f.description}`);
        });
    });
}
console.log('\n================================================================');
console.log('STATUS: ENGINE OPERATIONAL');
console.log('================================================================\n');
