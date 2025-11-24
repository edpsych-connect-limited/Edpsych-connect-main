import { AssessmentSession } from '@/lib/stealth-assessment/types';

export interface StudentProfile {
  id: string;
  name: string;
  yearGroup: number;
  needs: string[]; // e.g., "Dyslexia", "ADHD"
  
  // Aggregated Cognitive Profile (0-100)
  cognitiveProfile: {
    processingSpeed: number;
    workingMemory: number;
    attention: number;
    learningMemory: number;
  };

  recentSessions: AssessmentSession[];
  interventions: InterventionRecommendation[];
}

export interface InterventionRecommendation {
  id: string;
  title: string;
  description: string;
  domain: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'ACTIVE' | 'PENDING' | 'COMPLETED';
  generatedAt: number;
}

// Mock Database
let MOCK_PROFILE: StudentProfile = {
  id: 'student-123',
  name: 'Leo Thompson',
  yearGroup: 5,
  needs: [],
  cognitiveProfile: {
    processingSpeed: 50,
    workingMemory: 50,
    attention: 50,
    learningMemory: 50
  },
  recentSessions: [],
  interventions: []
};

export class StudentProfileService {
  
  static async getProfile(_studentId: string): Promise<StudentProfile> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_PROFILE;
  }

  static async saveSession(studentId: string, session: AssessmentSession): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 1. Add session to history
    MOCK_PROFILE.recentSessions.push(session);

    // 2. Update Aggregated Profile (Simple Moving Average)
    // In a real system, this would be a complex Bayesian update
    Object.values(session.metrics).forEach(metric => {
      const domainKey = this.mapDomainToKey(metric.domainId);
      if (domainKey && metric.confidence > 0.2) {
        // Weighted update: 80% old, 20% new
        MOCK_PROFILE.cognitiveProfile[domainKey] = 
          (MOCK_PROFILE.cognitiveProfile[domainKey] * 0.8) + (metric.score * 0.2);
      }
    });

    console.log('Session saved for', studentId);
  }

  private static mapDomainToKey(domainId: string): keyof StudentProfile['cognitiveProfile'] | null {
    switch (domainId) {
      case 'ecca-domain-processing-speed': return 'processingSpeed';
      case 'ecca-domain-working-memory': return 'workingMemory';
      case 'ecca-domain-attention-executive-function': return 'attention';
      case 'ecca-domain-learning-memory': return 'learningMemory';
      default: return null;
    }
  }

  static async addIntervention(studentId: string, intervention: InterventionRecommendation): Promise<void> {
    MOCK_PROFILE.interventions.push(intervention);
  }
}
