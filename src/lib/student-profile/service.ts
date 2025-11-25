import { prisma } from '@/lib/prisma';
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
  studentIdInt?: number; // Helper for internal use
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

export class StudentProfileService {
  
  static async getProfile(studentId: string): Promise<StudentProfile> {
    // Try to find by unique_id first, then by internal ID if it parses to int
    let profile = await prisma.studentProfile.findFirst({
      where: { 
        student: {
          unique_id: studentId
        }
      },
      include: { 
        student: true
      }
    });

    if (!profile) {
       // Fallback: try to find by internal ID if studentId is a number
       const id = parseInt(studentId);
       if (!isNaN(id)) {
         profile = await prisma.studentProfile.findFirst({
            where: { student_id: id },
            include: { student: true }
         });
       }
    }

    if (!profile) {
      throw new Error(`Student profile not found for ID: ${studentId}`);
    }

    // Parse cognitive profile from learning_style or default
    const cognitiveProfile = (profile.learning_style as any) || {
      processingSpeed: 50,
      workingMemory: 50,
      attention: 50,
      learningMemory: 50
    };

    // Fetch interventions
    const interventions = await prisma.automatedAction.findMany({
      where: {
        student_profile_id: profile.id,
        action_type: 'intervention'
      }
    });

    return {
      id: profile.id,
      studentIdInt: profile.student_id,
      name: `${profile.student.first_name} ${profile.student.last_name}`,
      yearGroup: parseInt(profile.student.year_group) || 5,
      needs: [profile.student.sen_status || 'None'],
      cognitiveProfile,
      recentSessions: [], // TODO: Fetch from AssessmentInstance or similar
      interventions: interventions.map(i => ({
        id: i.id,
        title: (i.action_data as any)?.title || 'Intervention',
        description: (i.action_data as any)?.description || '',
        domain: (i.action_data as any)?.domain || 'General',
        priority: (i.action_data as any)?.priority || 'MEDIUM',
        status: i.outcome_success ? 'COMPLETED' : 'ACTIVE',
        generatedAt: i.created_at.getTime()
      }))
    };
  }

  static async saveSession(studentId: string, session: AssessmentSession): Promise<void> {
    // 1. Find profile
    const profile = await this.getProfile(studentId);
    
    // 2. Update Aggregated Profile (Simple Moving Average)
    const newProfile = { ...profile.cognitiveProfile };
    
    Object.values(session.metrics).forEach(metric => {
      const domainKey = this.mapDomainToKey(metric.domainId);
      if (domainKey && metric.confidence > 0.2) {
        // Weighted update: 80% old, 20% new
        newProfile[domainKey] = 
          (newProfile[domainKey] * 0.8) + (metric.score * 0.2);
      }
    });

    // 3. Save to DB
    await prisma.studentProfile.update({
      where: { id: profile.id },
      data: {
        learning_style: newProfile as any
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
    const profile = await this.getProfile(studentId);
    
    // Fetch tenant_id from profile -> student -> tenant
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { id: profile.id },
      select: { tenant_id: true }
    });

    await prisma.automatedAction.create({
      data: {
        tenant_id: studentProfile?.tenant_id || 1,
        action_type: 'intervention',
        triggered_by: 'system',
        target_type: 'student',
        target_id: studentId,
        student_id: profile.studentIdInt,
        student_profile_id: profile.id,
        action_data: intervention as any,
        outcome_success: false // Active
      }
    });
  }
}
