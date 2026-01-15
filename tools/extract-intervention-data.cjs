/**
 * Extract intervention data from intervention-library.ts and save as JSON
 * This refactor moves ~11,500 lines of data out of the TypeScript source
 * 
 * Structure:
 * - Line 89: ACADEMIC_INTERVENTIONS starts
 * - Line 7116: BEHAVIORAL_INTERVENTIONS starts
 * - Line 8367: SOCIAL_EMOTIONAL_INTERVENTIONS starts
 * - Line 11425: COMMUNICATION_INTERVENTIONS starts
 * - Line 11627: SENSORY_INTERVENTIONS starts
 * - Line ~11966: export INTERVENTION_LIBRARY (combined array)
 */
const fs = require('fs');
const path = require('path');

const sourceFile = path.join(__dirname, '..', 'src', 'lib', 'interventions', 'intervention-library.ts');
const targetFile = path.join(__dirname, '..', 'src', 'lib', 'interventions', 'interventions-data.json');

console.log('[1/6] Reading intervention-library.ts (12,530 lines)...');
const lines = fs.readFileSync(sourceFile, 'utf8').split('\n');
console.log(`✓ Loaded ${lines.length} lines`);

// Extract each array section
console.log('[2/6] Extracting intervention arrays...');

function extractArray(startLine, endLine) {
  // Skip the const declaration line
  const arrayContent = lines.slice(startLine, endLine).join('\n');
  
  // Extract just the array content (between [ and ];)
  const startIdx = arrayContent.indexOf('[');
  const endIdx = arrayContent.lastIndexOf('];');
  
  if (startIdx === -1 || endIdx === -1) {
    console.error(`✗ Could not find array boundaries in lines ${startLine}-${endLine}`);
    return null;
  }
  
  return arrayContent.substring(startIdx + 1, endIdx).trim();
}

const arrays = {
  ACADEMIC: extractArray(89, 7115),           // Lines 89-7115
  BEHAVIORAL: extractArray(7116, 8366),        // Lines 7116-8366
  SOCIAL_EMOTIONAL: extractArray(8367, 11424), // Lines 8367-11424
  COMMUNICATION: extractArray(11425, 11626),   // Lines 11425-11626
  SENSORY: extractArray(11627, 11965)          // Lines 11627-11965 (before export)
};

console.log(`✓ Extracted 5 arrays`);

// Combine all arrays into valid JavaScript
console.log('[3/6] Building JavaScript module...');
const jsCode = `
const ACADEMIC_INTERVENTIONS = [
  ${arrays.ACADEMIC}
];

const BEHAVIORAL_INTERVENTIONS = [
  ${arrays.BEHAVIORAL}
];

const SOCIAL_EMOTIONAL_INTERVENTIONS = [
  ${arrays.SOCIAL_EMOTIONAL}
];

const COMMUNICATION_INTERVENTIONS = [
  ${arrays.COMMUNICATION}
];

const SENSORY_INTERVENTIONS = [
  ${arrays.SENSORY}
];

module.exports = {
  ACADEMIC_INTERVENTIONS,
  BEHAVIORAL_INTERVENTIONS,
  SOCIAL_EMOTIONAL_INTERVENTIONS,
  COMMUNICATION_INTERVENTIONS,
  SENSORY_INTERVENTIONS
};
`;

// Write to temp file
const tempFile = path.join(__dirname, 'temp-interventions.cjs');
console.log('[4/6] Writing temporary file...');
fs.writeFileSync(tempFile, jsCode, 'utf8');
console.log(`✓ Created ${tempFile} (${(jsCode.length / 1024).toFixed(0)} KB)`);

// Load and validate
console.log('[5/6] Loading and validating intervention objects...');
try {
  delete require.cache[require.resolve(tempFile)];
  const data = require(tempFile);
  
  // Combine all interventions
  const combined = [
    ...(data.ACADEMIC_INTERVENTIONS || []),
    ...(data.BEHAVIORAL_INTERVENTIONS || []),
    ...(data.SOCIAL_EMOTIONAL_INTERVENTIONS || []),
    ...(data.COMMUNICATION_INTERVENTIONS || []),
    ...(data.SENSORY_INTERVENTIONS || [])
  ];
  
  console.log(`✓ Loaded ${combined.length} interventions:`);
  console.log(`  - Academic: ${data.ACADEMIC_INTERVENTIONS?.length || 0}`);
  console.log(`  - Behavioural: ${data.BEHAVIORAL_INTERVENTIONS?.length || 0}`);
  console.log(`  - Social/Emotional: ${data.SOCIAL_EMOTIONAL_INTERVENTIONS?.length || 0}`);
  console.log(`  - Communication: ${data.COMMUNICATION_INTERVENTIONS?.length || 0}`);
  console.log(`  - Sensory: ${data.SENSORY_INTERVENTIONS?.length || 0}`);
  
  // Sample validation
  const sample = combined[0];
  if (!sample || !sample.id || !sample.name) {
    throw new Error('Invalid intervention structure: missing required fields');
  }
  console.log(`✓ Validation passed (sample: ${sample.id})`);
  
  // Write to JSON
  console.log('[6/6] Writing interventions-data.json...');
  const jsonContent = JSON.stringify(combined, null, 2);
  fs.writeFileSync(targetFile, jsonContent, 'utf8');
  const targetSizeKB = (jsonContent.length / 1024).toFixed(0);
  console.log(`✓ Saved ${combined.length} interventions (${targetSizeKB} KB)`);
  
  // Cleanup
  fs.unlinkSync(tempFile);
  console.log('✓ Removed temporary file');
  
  console.log('\n✅ SUCCESS: Intervention data extracted to JSON');
  console.log(`   📁 ${targetFile}`);
  console.log(`   📊 ${combined.length} interventions, ${targetSizeKB} KB`);
  console.log(`\n   Next step: Refactor intervention-library.ts to load from this JSON file`);
  
} catch (error) {
  console.error('\n✗ ERROR during validation:', error.message);
  console.error(error.stack);
  if (fs.existsSync(tempFile)) {
    console.log(`❗ Temp file preserved for debugging: ${tempFile}`);
    console.log(`   You can inspect it to see what went wrong`);
  }
  process.exit(1);
}
