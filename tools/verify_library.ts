import { INTERVENTION_LIBRARY } from '../src/lib/interventions/intervention-library';

console.log('Library loaded successfully.');
console.log(`Total interventions: ${INTERVENTION_LIBRARY.length}`);

const meta = INTERVENTION_LIBRARY.find(i => i.id === 'metacognition-self-regulation');
if (meta) {
    console.log('Metacognition strategy found:');
    console.log(JSON.stringify(meta, null, 2));
} else {
    console.error('Metacognition strategy NOT found!');
    process.exit(1);
}
