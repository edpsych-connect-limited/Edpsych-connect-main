/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { StudentRecord } from './mock-mis-data';

export interface AuditFinding {
  id: string;
  type: 'FUNDING_OPPORTUNITY' | 'COMPLIANCE_RISK' | 'INTERVENTION_NEEDED';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  potentialValue?: number; // Estimated funding in GBP
  affectedStudents: string[]; // IDs
}

export class SchoolAuditEngine {
  static runAudit(students: StudentRecord[]): AuditFinding[] {
    const findings: AuditFinding[] = [];

    // 1. Potential Undiagnosed Learning Difficulties (Funding Opportunity)
    const undiagnosed = students.filter(s => 
      s.senStatus === 'N' && 
      (s.chronologicalAge - s.readingAge) > 24
    );

    if (undiagnosed.length > 0) {
      findings.push({
        id: 'audit-1',
        type: 'FUNDING_OPPORTUNITY',
        severity: 'HIGH',
        title: 'Potential Undiagnosed Learning Needs',
        description: `${undiagnosed.length} students have a reading age gap > 2 years but are not on the SEN register. Early identification could unlock Top-Up funding.`,
        potentialValue: undiagnosed.length * 6000, // Approx £6k per EHCP
        affectedStudents: undiagnosed.map(s => s.id)
      });
    }

    // 2. Attendance & SEN Compliance Risk
    const persistentAbsenceSen = students.filter(s => 
      s.senStatus !== 'N' && 
      s.attendance < 90
    );

    if (persistentAbsenceSen.length > 0) {
      findings.push({
        id: 'audit-2',
        type: 'COMPLIANCE_RISK',
        severity: 'MEDIUM',
        title: 'SEN Persistent Absence Risk',
        description: `${persistentAbsenceSen.length} students with SEN have attendance below 90%. This triggers automatic Local Authority review thresholds.`,
        affectedStudents: persistentAbsenceSen.map(s => s.id)
      });
    }

    // 3. Pupil Premium & SEN Intersection (Intervention Targeting)
    const ppSen = students.filter(s => s.pp && s.senStatus !== 'N');
    
    if (ppSen.length > 0) {
      findings.push({
        id: 'audit-3',
        type: 'INTERVENTION_NEEDED',
        severity: 'LOW',
        title: 'Pupil Premium SEN Strategy Gap',
        description: `${ppSen.length} students are both PP and SEN. Ensure intervention mapping explicitly demonstrates use of PP funding for SEN outcomes.`,
        affectedStudents: ppSen.map(s => s.id)
      });
    }

    return findings;
  }
}
