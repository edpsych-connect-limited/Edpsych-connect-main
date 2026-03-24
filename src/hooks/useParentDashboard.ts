import { useState, useEffect } from 'react';
import type { Course } from '@/lib/training/course-catalog';
import type { InterventionTemplate } from '@/lib/interventions/intervention-library';

export interface ChildProfile {
  id: string;
  name: string;
  year: string;
  schoolId: number;
}

interface ApiChild {
  id: number;
  name: string;
  yearGroup: string;
  schoolId: number;
}

interface ApiParentPortalResponse {
  childId: string;
  childName: string;
  progressSummary: {
    overallMessage: string;
    recentAchievements: string[];
  };
  strengthsAndSupport: {
    supportProvided: string[];
  };
}

export function useParentDashboard() {
  const [childProfile, setChildProfile] = useState<ChildProfile | null>(null);
  const [activeIntervention, setActiveIntervention] = useState<InterventionTemplate | undefined>(undefined);
  const [parentCourses, setParentCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      const librariesPromise = loadLibraries();

      try {
        // 1. Fetch Children
        const childrenRes = await fetch('/api/parent/children');
        if (!childrenRes.ok) throw new Error('Failed to fetch children');
        const children: ApiChild[] = await childrenRes.json();

        if (children.length === 0) {
           setLoading(false);
           return;
        }

        const child = children[0];
        setChildProfile({
          id: child.id.toString(),
          name: child.name,
          year: child.yearGroup,
          schoolId: child.schoolId
        });

        // 2. Fetch Portal Data
        const portalRes = await fetch(`/api/parent/portal/${child.id}`);
        if (!portalRes.ok) throw new Error('Failed to fetch portal data');
        const portalData: ApiParentPortalResponse = await portalRes.json();
        const { COURSE_CATALOG, INTERVENTION_LIBRARY } = await librariesPromise;

        // Map Active Intervention
        let intervention: InterventionTemplate | undefined;
        if (portalData.strengthsAndSupport.supportProvided.length > 0) {
            intervention = INTERVENTION_LIBRARY.find(i => 
                portalData.strengthsAndSupport.supportProvided[0].toLowerCase().includes(i.name.toLowerCase())
            );
        }
        
        if (!intervention) {
             intervention = INTERVENTION_LIBRARY.find(i => i.id === 'wm-chunking-strategy');
        }
        setActiveIntervention(intervention);

        // Courses (Static for now)
        const courses = COURSE_CATALOG.filter(c => c.target_audience.includes('Parents')).slice(0, 3);
        setParentCourses(courses);

      } catch (err) {
        console.error('Error loading parent dashboard:', err);
        setError('Failed to load dashboard data');

        const fallbackLibraries = await librariesPromise.catch(() => null);
        const fallbackCourses = fallbackLibraries?.COURSE_CATALOG ?? [];
        const fallbackInterventions = fallbackLibraries?.INTERVENTION_LIBRARY ?? [];

        // Fallback
        const intervention = fallbackInterventions.find(i => i.id === 'wm-chunking-strategy');
        const courses = fallbackCourses.filter(c => c.target_audience.includes('Parents')).slice(0, 3);
        setActiveIntervention(intervention);
        setParentCourses(courses);
        // Do not set a fake child profile on error — show empty state instead
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return { childProfile, activeIntervention, parentCourses, loading, error };
}

async function loadLibraries() {
  const [{ COURSE_CATALOG }, { INTERVENTION_LIBRARY }] = await Promise.all([
    import('@/lib/training/course-catalog'),
    import('@/lib/interventions/intervention-library')
  ]);

  return { COURSE_CATALOG, INTERVENTION_LIBRARY };
}
