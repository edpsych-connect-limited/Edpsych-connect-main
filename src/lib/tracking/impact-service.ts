import { InterventionTemplate } from '../interventions/intervention-library';

export type ImpactRating = 'positive' | 'neutral' | 'negative' | 'unknown';

export interface ImpactLog {
  id: string;
  studentId: string;
  interventionId: string;
  timestamp: string;
  rating: ImpactRating;
  notes?: string;
  observed_improvements?: string[]; // e.g. ["focus", "retention"]
}

// Mock Database
let IMPACT_LOGS: ImpactLog[] = [];

export const ImpactService = {
  
  logImpact: (log: Omit<ImpactLog, 'id' | 'timestamp'>): ImpactLog => {
    const newLog: ImpactLog = {
      ...log,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    IMPACT_LOGS.push(newLog);
    console.log(`[ImpactService] Logged impact for student ${log.studentId}: ${log.rating}`);
    return newLog;
  },

  getStudentLogs: (studentId: string): ImpactLog[] => {
    return IMPACT_LOGS.filter(l => l.studentId === studentId);
  },

  getInterventionStats: (interventionId: string) => {
    const logs = IMPACT_LOGS.filter(l => l.interventionId === interventionId);
    const positive = logs.filter(l => l.rating === 'positive').length;
    return {
      total_uses: logs.length,
      success_rate: logs.length ? (positive / logs.length) * 100 : 0
    };
  }
};
