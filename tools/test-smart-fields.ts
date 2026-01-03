
import { processSmartFields } from '../src/lib/assessments/smart-fields';
import { AssessmentReport } from '../src/lib/assessments/report-generator';
import { AssessmentTemplate } from '../src/lib/assessments/assessment-library';
import { ScoreResult } from '../src/lib/assessments/scoring-engine';

// Mock Data
const mockTemplate: AssessmentTemplate = {
  id: 'test-template',
  name: 'Test Assessment',
  category: 'cognitive',
  subcategory: 'general',
  description: 'Test',
  age_range: '5-16',
  administration_time: '60',
  purpose: 'Test',
  domains: [],
  qualification_required: 'level_a',
  is_standardized: true,
  norm_referenced: true,
  scoring_method: 'manual',
  sections: [],
  interpretation_guidelines: [],
  references: [],
  tags: []
};

const mockScores: ScoreResult = {
  raw_scores: [],
  standard_scores: [],
  percentiles: [],
  composite_scores: [],
  interpretation: 'Test interpretation',
  strengths: [],
  weaknesses: [],
  primary_need: 'Cognition and Learning'
};

const mockReport: AssessmentReport = {
  student_name: 'John Doe',
  date_of_birth: '2015-01-01',
  chronological_age: '10 years 5 months',
  academic_year: 'Year 5',
  school: 'Example Primary School',
  assessment_name: 'WISC-V',
  assessment_date: '2025-05-20',
  assessor_name: 'Dr. Jane Smith',
  assessor_qualification: 'Educational Psychologist',
  template: mockTemplate,
  scores: mockScores,
  recommendations: [],
  interventions: [],
  report_date: '2025-05-21'
};

// Test Cases
const testCases = [
  {
    input: 'Student {{student.name}} attends {{student.school}}.',
    expected: 'Student John Doe attends Example Primary School.'
  },
  {
    input: 'Assessment conducted by {{assessment.assessor}} on {{assessment.date}}.',
    expected: 'Assessment conducted by Dr. Jane Smith on 2025-05-20.'
  },
  {
    input: 'Primary need identified: {{clinical.primary_need}}.',
    expected: 'Primary need identified: Cognition and Learning.'
  },
  {
    input: 'No smart fields here.',
    expected: 'No smart fields here.'
  }
];

// Run Tests
console.log('Running Smart Fields Tests...\n');
let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
  const result = processSmartFields(test.input, mockReport);
  if (result === test.expected) {
    console.log(`✅ Test ${index + 1} Passed`);
    passed++;
  } else {
    console.log(`❌ Test ${index + 1} Failed`);
    console.log(`   Input:    ${test.input}`);
    console.log(`   Expected: ${test.expected}`);
    console.log(`   Actual:   ${result}`);
    failed++;
  }
});

console.log(`\nSummary: ${passed} Passed, ${failed} Failed`);

if (failed > 0) {
  process.exit(1);
}
