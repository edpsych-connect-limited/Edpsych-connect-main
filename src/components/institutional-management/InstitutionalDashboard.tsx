import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import InstitutionOverview from './InstitutionOverview';
import DepartmentManagement from './DepartmentManagement';
import ContactManagement from './ContactManagement';
import SubscriptionManagement from './SubscriptionManagement';
import PerformanceMetrics from './PerformanceMetrics';
import ActivityLogs from './ActivityLogs';
import SLAAnalytics from './SLAAnalytics';

// Define types for our data structures
interface Institution {
  id: string;
  name: string;
  type: string;
  verified: boolean;
  activeUserCount?: number;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  metrics?: {
    assessmentCompletions?: number;
    assessmentCompletionsTrend?: number;
    activeInterventions?: number;
    activeInterventionsTrend?: number;
    resourceUtilization?: number;
    resourceUtilizationTrend?: number;
  };
  subscription?: any;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    county?: string;
    postcode?: string;
    country?: string;
  };
  phone?: string;
  email?: string;
  website?: string;
  founded?: string;
  size?: string;
  description?: string;
  tags?: string[];
}

interface Department {
  id: string;
  name: string;
  parentId?: string;
  headOfDepartment?: string;
  staffCount?: number;
  description?: string;
  createdAt?: string;
  institutionId?: string;
}

const InstitutionalDashboard: React.FC<{ id?: string }> = ({ id }) => {
  const router = useRouter();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);

  useEffect(() => {
    const fetchInstitutionData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/institutions/${id}`);
        
        if (!response.ok) {
          throw new Error(`Error fetching institution: ${response.statusText}`);
        }
        
        const data = await response.json();
        setInstitution(data);
        
        // Fetch departments
        const deptResponse = await fetch(`/api/institutions/${id}/departments`);
        
        if (!deptResponse.ok) {
          throw new Error(`Error fetching departments: ${deptResponse.statusText}`);
        }
        
        const deptData = await deptResponse.json();
        setDepartments(deptData);
        
      } catch (err: any) {
        console.error('Error fetching institution data:', err);
        setError(err.message || 'An error occurred while loading institution data');
      } finally {
        setLoading(false);
      }
    };

    fetchInstitutionData();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-5 text-center">
        <h2 className="text-xl font-bold text-red-500 mb-4">Error Loading Dashboard</h2>
        <p>{error}</p>
        <p className="mt-4 text-blue-500 cursor-pointer" onClick={() => router.push('/institutions')}>
          Return to Institutions List
        </p>
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="p-5 text-center">
        <h2 className="text-xl font-bold mb-4">Institution Not Found</h2>
        <p>The requested institution could not be found or you don&apos;t have access to it.</p>
        <p className="mt-4 text-blue-500 cursor-pointer" onClick={() => router.push('/institutions')}>
          Return to Institutions List
        </p>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{institution.name}</h1>
          <div className="flex items-center mt-1">
            <span className={`px-2 py-1 rounded text-sm mr-2 ${institution.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {institution.verified ? 'Verified' : 'Pending Verification'}
            </span>
            <span className="text-sm text-gray-600">{institution.type}</span>
          </div>
        </div>
        
        <div className="flex text-right">
          <div className="mr-6">
            <p className="text-sm text-gray-600">Total Departments</p>
            <p className="text-xl font-bold">{departments.length}</p>
          </div>
          <div className="mr-6">
            <p className="text-sm text-gray-600">Active Users</p>
            <p className="text-xl font-bold">{institution.activeUserCount || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Subscription</p>
            <p className="text-xl font-bold">{institution.subscriptionPlan || 'None'}</p>
            {institution.subscriptionStatus && (
              <p className="text-sm">
                <span className={`px-2 py-1 rounded ${institution.subscriptionStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {institution.subscriptionStatus}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SLA Analytics for Local Authorities */}
      {institution.type === 'Local Authority' && (
        <SLAAnalytics
          metrics={{
            averageCompletionWeeks: 18.5,
            withinDeadlinePercent: 92,
            activeCases: 145,
            breachCount: 3,
            upcomingDeadlines: 12,
          }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <div>
            <p className="text-sm text-gray-600">Assessment Completions</p>
            <p className="text-xl font-bold">{institution.metrics?.assessmentCompletions || 0}</p>
            <p className="text-sm text-gray-600">
              <span className="text-green-600">↑</span> {institution.metrics?.assessmentCompletionsTrend || 0}% since last month
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div>
            <p className="text-sm text-gray-600">Active Interventions</p>
            <p className="text-xl font-bold">{institution.metrics?.activeInterventions || 0}</p>
            <p className="text-sm text-gray-600">
              <span className="text-green-600">↑</span> {institution.metrics?.activeInterventionsTrend || 0}% since last month
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div>
            <p className="text-sm text-gray-600">Resource Utilization</p>
            <p className="text-xl font-bold">{institution.metrics?.resourceUtilization || 0}%</p>
            <p className="text-sm text-gray-600">
              <span className="text-green-600">↑</span> {institution.metrics?.resourceUtilizationTrend || 0}% since last month
            </p>
          </div>
        </div>
      </div>

      <div className="border-b mb-4">
        <ul className="flex">
          {['Overview', 'Departments', 'Contacts', 'Subscription', 'Performance', 'Activity'].map((tab, index) => (
            <li key={index} className="-mb-px">
              <button
                className={`inline-block py-2 px-4 font-semibold ${activeTab === index ? 'border-l border-t border-r rounded-t text-blue-600 border-gray-200 bg-white' : 'text-gray-500 hover:text-blue-500'}`}
                onClick={() => setActiveTab(index)}
              >
                {tab}
              </button>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="p-4 bg-white rounded shadow">
        {activeTab === 0 && (
          <InstitutionOverview institution={institution} />
        )}
        {activeTab === 1 && (
          <DepartmentManagement
            id={institution.id}
            initialDepartments={departments}
          />
        )}
        {activeTab === 2 && (
          <ContactManagement
            id={institution.id}
          />
        )}
        {activeTab === 3 && (
          <SubscriptionManagement
            id={institution.id}
          />
        )}
        {activeTab === 4 && (
          <PerformanceMetrics
            id={institution.id}
            metrics={institution.metrics || {}}
          />
        )}
        {activeTab === 5 && (
          <ActivityLogs
            id={institution.id}
          />
        )}
      </div>
    </div>
  );
};

export default InstitutionalDashboard;