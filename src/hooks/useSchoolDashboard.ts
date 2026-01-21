import { useState, useEffect } from 'react';
import { logError } from '@/lib/logger';
import type { InterventionTemplate } from '@/lib/interventions/intervention-library';

export interface DashboardStats {
  activeCases: number;
  teacherAssessments: number;
  interventionCount: number;
  criticalActions: number;
}

export interface Student {
  id: string;
  name: string;
  year: string;
  need: string;
  status: string;
  statusColor: string;
  review: string;
}

// Define API response types locally
interface ApiDashboardMetrics {
  caseload: {
    totalStudents: number;
    pendingAssessments: number;
    urgentActions: number;
  };
  weeklyActivity: {
    interventionsStarted: number;
  };
}

interface ApiRegisterEntry {
  id: string;
  student: {
    firstName: string;
    lastName: string;
    yearGroup: string;
  };
  primaryNeed: string;
  sendStatus: string;
  nextReviewDate: string;
  progressRAG: 'RED' | 'AMBER' | 'GREEN';
}

export function useSchoolDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [classroomInterventions, setClassroomInterventions] = useState<InterventionTemplate[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      const librariesPromise = loadLibraries();

      try {
        // Fetch data in parallel for performance optimization
        const [metricsRes, registerRes] = await Promise.all([
          fetch('/api/senco?action=dashboard'),
          fetch('/api/senco?action=register')
        ]);

        if (!metricsRes.ok) throw new Error('Failed to fetch dashboard metrics');
        if (!registerRes.ok) throw new Error('Failed to fetch student register');
        
        const [metricsData, registerData] = await Promise.all([
          metricsRes.json(),
          registerRes.json()
        ]);
        
        const metrics: ApiDashboardMetrics = metricsData.data;
        const register: ApiRegisterEntry[] = registerData.data;
        const { INTERVENTION_LIBRARY, INTERVENTION_STATS, ASSESSMENT_LIBRARY } = await librariesPromise;

        // Calculate Stats
        const teacherAssessments = ASSESSMENT_LIBRARY.filter(a => a.qualification_required === 'teacher' || a.qualification_required === 'senco').length;
        
        setStats({
          activeCases: metrics.caseload.totalStudents,
          teacherAssessments, // Keep static for now as API doesn't seem to return this specific count
          interventionCount: metrics.weeklyActivity.interventionsStarted,
          criticalActions: metrics.caseload.urgentActions
        });

        // Map Students
        const mappedStudents = register.slice(0, 5).map(entry => ({
          id: entry.id,
          name: `${entry.student.firstName} ${entry.student.lastName}`,
          year: entry.student.yearGroup,
          need: entry.primaryNeed,
          status: entry.sendStatus.replace('_', ' '),
          statusColor: getStatusColor(entry.progressRAG),
          review: new Date(entry.nextReviewDate).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })
        }));

        setStudents(mappedStudents);

        // Keep static interventions for now
        const interventions = INTERVENTION_LIBRARY.filter(i => i.setting.includes('classroom')).slice(0, 3);
        setClassroomInterventions(interventions);

      } catch (err) {
        logError(err instanceof Error ? err : new Error('Unknown error loading dashboard'), { context: 'useSchoolDashboard' });
        setError('Failed to load dashboard data');

        const fallbackLibraries = await librariesPromise.catch(() => null);
        const fallbackAssessments = fallbackLibraries?.ASSESSMENT_LIBRARY ?? [];
        const fallbackInterventions = fallbackLibraries?.INTERVENTION_LIBRARY ?? [];
        const fallbackStats = fallbackLibraries?.INTERVENTION_STATS ?? { total: 0 };

        // Fallback to mock data if API fails (for demo purposes/resilience)
        const teacherAssessments = fallbackAssessments.filter(a => a.qualification_required === 'teacher' || a.qualification_required === 'senco').length;
        const interventions = fallbackInterventions.filter(i => i.setting.includes('classroom')).slice(0, 3);
        
        setStats({
          activeCases: 12, // Mock data
          teacherAssessments,
          interventionCount: fallbackStats.total,
          criticalActions: 2 // Mock data
        });

        setClassroomInterventions(interventions);

        setStudents([
          { id: '1', name: 'Leo Thompson', year: 'Year 4', need: 'Cognition & Learning', status: 'Assessment', statusColor: 'bg-amber-100 text-amber-700', review: 'Jan 24, 2026' },
          { id: '2', name: 'Sarah Jenkins', year: 'Year 6', need: 'SEMH', status: 'EHCP Active', statusColor: 'bg-green-100 text-green-700', review: 'Feb 10, 2026' },
          { id: '3', name: 'Michael Chang', year: 'Year 3', need: 'Communication', status: 'Monitoring', statusColor: 'bg-blue-100 text-blue-700', review: 'Mar 01, 2026' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { stats, classroomInterventions, students, loading, error };
}

async function loadLibraries() {
  const [{ INTERVENTION_STATS, INTERVENTION_LIBRARY }, { ASSESSMENT_LIBRARY }] = await Promise.all([
    import('@/lib/interventions/intervention-library'),
    import('@/lib/assessments/assessment-library')
  ]);

  return { INTERVENTION_STATS, INTERVENTION_LIBRARY, ASSESSMENT_LIBRARY };
}

function getStatusColor(rag: 'RED' | 'AMBER' | 'GREEN'): string {
  switch (rag) {
    case 'GREEN': return 'bg-green-100 text-green-700';
    case 'AMBER': return 'bg-amber-100 text-amber-700';
    case 'RED': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}
