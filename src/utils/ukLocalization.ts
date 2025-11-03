/**
 * UK Localization Utilities
 *
 * This module provides utilities for ensuring consistent UK English spelling
 * and formatting throughout the EdPsych Connect World platform.
 */

/**
 * Common US to UK spelling mappings
 */
export const usToUkSpellings: Record<string, string> = {
  // -or to -our
  'behavior': 'behaviour',
  'behaviors': 'behaviours',
  'behavioral': 'behavioural',
  'color': 'colour',
  'colors': 'colours',
  'colored': 'coloured',
  'colorful': 'colourful',
  'favor': 'favour',
  'favors': 'favours',
  'favorite': 'favourite',
  'favorites': 'favourites',
  'flavor': 'flavour',
  'flavors': 'flavours',
  'harbor': 'harbour',
  'harbors': 'harbours',
  'honor': 'honour',
  'honors': 'honours',
  'honorable': 'honourable',
  'humor': 'humour',
  'humors': 'humours',
  'humorous': 'humorous', // same in both
  'labor': 'labour',
  'labors': 'labours',
  'neighbor': 'neighbour',
  'neighbors': 'neighbours',
  'neighborhood': 'neighbourhood',
  'rumor': 'rumour',
  'rumors': 'rumours',
  'valor': 'valour',

  // -ize to -ise
  'analyze': 'analyse',
  'analyzes': 'analyses',
  'analyzed': 'analysed',
  'analyzing': 'analysing',
  'apologize': 'apologise',
  'apologizes': 'apologises',
  'apologized': 'apologised',
  'apologizing': 'apologising',
  'authorize': 'authorise',
  'authorizes': 'authorises',
  'authorized': 'authorised',
  'authorizing': 'authorising',
  'capitalize': 'capitalise',
  'capitalizes': 'capitalises',
  'capitalized': 'capitalised',
  'capitalizing': 'capitalising',
  'categorize': 'categorise',
  'categorizes': 'categorises',
  'categorized': 'categorised',
  'categorizing': 'categorising',
  'organize': 'organise',
  'organizes': 'organises',
  'organized': 'organised',
  'organizing': 'organising',
  'realize': 'realise',
  'realizes': 'realises',
  'realized': 'realised',
  'realizing': 'realising',
  'recognize': 'recognise',
  'recognizes': 'recognises',
  'recognized': 'recognised',
  'recognizing': 'recognising',
  'specialize': 'specialise',
  'specializes': 'specialises',
  'specialized': 'specialised',
  'specializing': 'specialising',
  'standardize': 'standardise',
  'standardizes': 'standardises',
  'standardized': 'standardised',
  'standardizing': 'standardising',

  // -er to -re
  'center': 'centre',
  'centers': 'centres',
  'centered': 'centred',
  'fiber': 'fibre',
  'fibers': 'fibres',
  'liter': 'litre',
  'liters': 'litres',
  'meter': 'metre',
  'meters': 'metres',
  'theater': 'theatre',
  'theaters': 'theatres',

  // -yze to -yse
  'catalyze': 'catalyse',
  'catalyzes': 'catalyses',
  'catalyzed': 'catalysed',
  'catalyzing': 'catalysing',
  'paralyze': 'paralyse',
  'paralyzes': 'paralyses',
  'paralyzed': 'paralysed',
  'paralyzing': 'paralysing',

  // -og to -ogue
  'analog': 'analogue',
  'analogs': 'analogues',
  'catalog': 'catalogue',
  'catalogs': 'catalogues',
  'dialog': 'dialogue',
  'dialogs': 'dialogues',
  'monolog': 'monologue',
  'monologs': 'monologues',

  // Educational terminology
  'grade': 'mark',
  'grades': 'marks',
  'grading': 'marking',
  'semester': 'term',
  'semesters': 'terms',
  'enrollment': 'enrolment',
  'enrollments': 'enrolments',
  'program': 'programme',
  'programs': 'programmes',
  'math': 'maths',
  'advisor': 'adviser',
  'advisors': 'advisers',
  'counselor': 'counsellor',
  'counselors': 'counsellors',
  'freshman': 'first-year student',
  'sophomores': 'second-year students',
  'juniors': 'third-year students',
  'seniors': 'fourth-year students'
};

/**
 * Converts US English spelling to UK English spelling based on the mapping
 * @param text Text to convert
 * @returns Text with UK English spelling
 */
export const convertToUkSpelling = (text: string): string => {
  if (!text) return text;

  let ukText = text;

  // Convert whole words only (using word boundaries)
  Object.entries(usToUkSpellings).forEach(([usSpelling, ukSpelling]) => {
    // Case-insensitive global replacement with word boundary check
    const regex = new RegExp(`\\b${usSpelling}\\b`, 'gi');
    ukText = ukText.replace(regex, (match) => {
      // Preserve case of original match
      if (match === match.toLowerCase()) return ukSpelling;
      if (match === match.toUpperCase()) return ukSpelling.toUpperCase();
      if (match[0] === match[0].toUpperCase()) {
        return ukSpelling.charAt(0).toUpperCase() + ukSpelling.slice(1);
      }
      return ukSpelling;
    });
  });

  return ukText;
};

/**
 * Formats a date according to UK convention (DD/MM/YYYY)
 * @param date Date to format
 * @returns Formatted date string
 */
export const formatUkDate = (date: Date): string => {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Formats a date and time according to UK convention
 * @param date Date to format
 * @returns Formatted date and time string
 */
export const formatUkDateTime = (date: Date): string => {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Formats currency according to UK convention
 * @param amount Amount to format
 * @returns Formatted currency string
 */
export const formatUkCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2
  }).format(amount);
};

/**
 * A utility function to ensure text is displayed with UK spelling
 * Can be used in components to automatically convert text
 * @param text Text to convert
 * @returns Text with UK spelling
 */
export const useUkSpelling = (text: string): string => {
  // This could be expanded to check environment variables or user preferences
  return convertToUkSpelling(text);
};

/**
 * Utility function to convert all string props to UK spelling
 * @param props Object containing props to convert
 * @returns Object with string props converted to UK spelling
 */
export const convertPropsToUkSpelling = (props: Record<string, any>): Record<string, any> => {
  // Convert all string props to UK spelling
  return Object.entries(props).reduce((acc, [key, value]) => {
    if (typeof value === 'string') {
      acc[key] = convertToUkSpelling(value);
    } else {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>);
};

/**
 * UK school grade levels equivalent to US grade levels
 */
export const gradeEquivalents: Record<string, string> = {
  'Kindergarten': 'Reception',
  'Grade 1': 'Year 1',
  'Grade 2': 'Year 2',
  'Grade 3': 'Year 3',
  'Grade 4': 'Year 4',
  'Grade 5': 'Year 5',
  'Grade 6': 'Year 6',
  'Grade 7': 'Year 7',
  'Grade 8': 'Year 8',
  'Grade 9': 'Year 9',
  'Grade 10': 'Year 10',
  'Grade 11': 'Year 11',
  'Grade 12': 'Year 12',
  'Grade 13': 'Year 13'
};

/**
 * Converts US grade level to UK equivalent
 * @param grade US grade level
 * @returns UK equivalent
 */
export const convertToUkGradeLevel = (grade: string): string => {
  return gradeEquivalents[grade] || grade;
};

/**
 * Checks if the text contains any US spellings
 * @param text Text to check
 * @returns True if the text contains US spellings
 */
export const containsUsSpellings = (text: string): boolean => {
  if (!text) return false;

  // Check if any US spelling exists as a whole word in the text
  return Object.keys(usToUkSpellings).some(usSpelling => {
    const regex = new RegExp(`\\b${usSpelling}\\b`, 'i');
    return regex.test(text);
  });
};

/**
 * Identifies US spellings in a text
 * @param text Text to check
 * @returns Array of US spellings found in the text
 */
export const identifyUsSpellings = (text: string): string[] => {
  if (!text) return [];

  return Object.keys(usToUkSpellings).filter(usSpelling => {
    const regex = new RegExp(`\\b${usSpelling}\\b`, 'i');
    return regex.test(text);
  });
};

export default {
  convertToUkSpelling,
  formatUkDate,
  formatUkDateTime,
  formatUkCurrency,
  useUkSpelling,
  convertPropsToUkSpelling,
  containsUsSpellings,
  identifyUsSpellings,
  convertToUkGradeLevel,
  usToUkSpellings,
  gradeEquivalents
};