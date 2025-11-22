'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import AssessmentAdministrationWizard from '@/components/assessments/AssessmentAdministrationWizard';

export default function ConductAssessmentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const caseId = params.id as string;
  const instanceId = searchParams.get('instanceId');

  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const response = await fetch(`/api/cases/${caseId}`);
        if (response.ok) {
          const data = await response.json();
          setCaseData(data.case);
        } else {
          setError('Case not found');
        }
      } catch (err) {
        setError('Failed to load case details');
      } finally {
        setLoading(false);
      }
    };

    if (caseId) {
      fetchCase();
    }
  }, [caseId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700 mb-4">{error || 'Case data unavailable'}</p>
          <button
            onClick={() => router.push('/cases')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Cases
          </button>
        </div>
      </div>
    );
  }

  // Calculate age
  const birthDate = new Date(caseData.students.date_of_birth);
  const ageDifMs = Date.now() - birthDate.getTime();
  const ageDate = new Date(ageDifMs); // miliseconds from epoch
  const age = Math.abs(ageDate.getUTCFullYear() - 1970);

  return (
    <AssessmentAdministrationWizard
      caseId={parseInt(caseId)}
      studentId={caseData.student_id}
      studentName={`${caseData.students.first_name} ${caseData.students.last_name}`}
      studentAge={age}
      existingInstanceId={instanceId || undefined}
    />
  );
}
