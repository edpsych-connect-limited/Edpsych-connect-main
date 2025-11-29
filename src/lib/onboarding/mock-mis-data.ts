import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

export interface StudentRecord {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  upn: string; // Unique Pupil Number
  senStatus: 'N' | 'K' | 'E'; // No SEN, SEN Support, EHCP
  attendance: number; // Percentage
  readingAge: number; // Months
  chronologicalAge: number; // Months
  fsm: boolean; // Free School Meals
  pp: boolean; // Pupil Premium
  lac: boolean; // Looked After Child
  eal: boolean; // English as Additional Language
  exclusions: number;
}

export const generateMockSchoolData = (count: number = 100): StudentRecord[] => {
  const students: StudentRecord[] = [];
  const firstNames = ['Leo', 'Mia', 'Noah', 'Ava', 'Lucas', 'Isabella', 'James', 'Sophia', 'Oliver', 'Amelia'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

  for (let i = 0; i < count; i++) {
    const chronologicalAge = 120 + Math.floor(Math.random() * 48); // 10-14 years old
    // Simulate correlation: SEN students often have lower reading ages
    const isSen = Math.random() < 0.15;
    const readingAgeGap = isSen ? Math.floor(Math.random() * 36) + 12 : Math.floor(Math.random() * 12) - 6;
    
    students.push({
      id: `stu-${1000 + i}`,
      firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
      lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
      dob: '2012-01-01', // Simplified
      upn: `H8012000${1000 + i}`,
      senStatus: isSen ? (Math.random() < 0.2 ? 'E' : 'K') : 'N',
      attendance: 85 + Math.floor(Math.random() * 15),
      readingAge: chronologicalAge - readingAgeGap,
      chronologicalAge,
      fsm: Math.random() < 0.2,
      pp: Math.random() < 0.25,
      lac: Math.random() < 0.02,
      eal: Math.random() < 0.1,
      exclusions: Math.random() < 0.05 ? Math.floor(Math.random() * 3) + 1 : 0
    });
  }
  
  return students;
};
