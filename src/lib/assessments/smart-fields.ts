/**
 * Smart Fields Engine
 * Handles dynamic content insertion for assessment reports.
 */

import { AssessmentReport } from './report-generator';

export interface SmartField {
  key: string;
  label: string;
  category: 'student' | 'assessment' | 'school' | 'clinical';
  description: string;
  getValue: (data: AssessmentReport) => string;
}

export const SMART_FIELDS: SmartField[] = [
  // Student Fields
  {
    key: 'student.name',
    label: 'Student Name',
    category: 'student',
    description: "The student's full name",
    getValue: (data) => data.student_name,
  },
  {
    key: 'student.firstname',
    label: 'Student First Name',
    category: 'student',
    description: "The student's first name",
    getValue: (data) => data.student_name.split(' ')[0],
  },
  {
    key: 'student.age',
    label: 'Student Age',
    category: 'student',
    description: "The student's chronological age",
    getValue: (data) => data.chronological_age,
  },
  {
    key: 'student.dob',
    label: 'Date of Birth',
    category: 'student',
    description: "The student's date of birth",
    getValue: (data) => data.date_of_birth,
  },
  {
    key: 'student.school',
    label: 'School',
    category: 'student',
    description: "The student's current school",
    getValue: (data) => data.school,
  },
  {
    key: 'student.year',
    label: 'Academic Year',
    category: 'student',
    description: "The student's academic year group",
    getValue: (data) => data.academic_year,
  },

  // Assessment Fields
  {
    key: 'assessment.date',
    label: 'Assessment Date',
    category: 'assessment',
    description: "Date the assessment was conducted",
    getValue: (data) => data.assessment_date,
  },
  {
    key: 'assessment.assessor',
    label: 'Assessor Name',
    category: 'assessment',
    description: "Name of the EP conducting the assessment",
    getValue: (data) => data.assessor_name,
  },
  
  // Clinical Fields
  {
    key: 'clinical.primary_need',
    label: 'Primary Need',
    category: 'clinical',
    description: "Primary area of need identified",
    getValue: (data) => data.scores.primary_need || 'Not identified',
  },
];

/**
 * Replaces smart fields in a text string with actual data.
 * @param text The text containing smart fields (e.g. "{{student.name}}")
 * @param data The assessment report data
 * @returns The processed text
 */
export function processSmartFields(text: string, data: AssessmentReport): string {
  if (!text) return '';
  
  let processedText = text;
  
  SMART_FIELDS.forEach(field => {
    const placeholder = `{{${field.key}}}`;
    const value = field.getValue(data);
    // Global replace
    processedText = processedText.split(placeholder).join(value);
  });

  return processedText;
}

/**
 * Get a list of all available smart fields for the UI
 */
export function getAvailableSmartFields() {
  return SMART_FIELDS.map(f => ({
    key: f.key,
    label: f.label,
    category: f.category,
    description: f.description
  }));
}
