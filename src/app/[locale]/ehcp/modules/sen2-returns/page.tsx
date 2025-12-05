'use client'

/**
 * SEN2 Returns Page
 * Automated SEN2 data collection and statutory return generation
 */

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/hooks';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProgressBar } from '@/components/common/ProgressBar.component';
import {
  ArrowLeft,
  FileSpreadsheet,
  Download,
  CheckCircle,
  Clock,
  BarChart3,
  Calendar,
  Send,
  RefreshCw
} from 'lucide-react';
import { EHCPModuleVideoIntro } from '@/components/ehcp/EHCPModuleVideoIntro';

interface SEN2Return {
  id: string;
  academic_year: string;
  return_period?: string;
  status: string;
  submission_deadline?: string;
  submitted_at?: string;
  total_ehcps: number;
  new_ehcps: number;
  ceased_ehcps: number;
  ehcps_by_age?: Record<string, number>;
  ehcps_by_need?: Record<string, number>;
  ehcps_by_placement?: Record<string, number>;
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
  in_progress: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In Progress' },
  ready_for_review: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Ready for Review' },
  submitted: { bg: 'bg-green-100', text: 'text-green-800', label: 'Submitted' },
  accepted: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Accepted' },
  rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' }
};

export default function SEN2ReturnsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [returns, setReturns] = useState<SEN2Return[]>([]);
  const [loading, setLoading] = useState(true);
  const [_selectedReturn, _setSelectedReturn] = useState<SEN2Return | null>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ehcp/sen2-returns');
      if (response.ok) {
        const data = await response.json();
        setReturns(data.returns || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const currentReturn = returns.find(r => r.status !== 'submitted' && r.status !== 'accepted');
  const submittedReturns = returns.filter(r => r.status === 'submitted' || r.status === 'accepted');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/ehcp/modules"
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FileSpreadsheet className="h-7 w-7 text-teal-600" />
                  SEN2 Returns
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Automated statutory SEN2 data collection and return generation
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchData}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={() => {}}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-teal-600 hover:bg-teal-700"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Generate Return
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Video Introduction */}
        <EHCPModuleVideoIntro
          videoKey="sen2-returns-automation"
          title="SEN2 Returns Automation"
          description="Automate your statutory SEN2 data collection with intelligent extraction and validation for accurate DfE submissions."
          duration="4 min"
          gradient="from-teal-600 to-emerald-600"
        />

        {/* SEN2 Info Banner */}
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <FileSpreadsheet className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-teal-900">About SEN2 Returns</h3>
              <p className="text-sm text-teal-700 mt-1">
                The SEN2 return is an annual statutory data collection required by the DfE.
                It captures information about children and young people with EHCPs including 
                demographics, primary need types, placement details, and assessment timelines.
                The census date is typically in January each year.
              </p>
            </div>
          </div>
        </div>

        {/* Current Return Status */}
        {currentReturn && (
          <div className="bg-white rounded-xl shadow-sm border mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">Current Return: {currentReturn.academic_year}</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusConfig[currentReturn.status]?.bg} ${statusConfig[currentReturn.status]?.text}`}>
                    {statusConfig[currentReturn.status]?.label || currentReturn.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total EHCPs</p>
                  <p className="text-2xl font-bold text-gray-900">{currentReturn.total_ehcps}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">New This Year</p>
                  <p className="text-2xl font-bold text-green-600">+{currentReturn.new_ehcps}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ceased</p>
                  <p className="text-2xl font-bold text-red-600">-{currentReturn.ceased_ehcps}</p>
                </div>
              </div>

              {currentReturn.submission_deadline && (
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-600">
                    <Clock className="h-5 w-5" />
                    <span className="text-sm">Deadline: {formatDate(currentReturn.submission_deadline)}</span>
                  </div>
                  <div className="flex gap-3">
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                      <Download className="h-4 w-4 mr-2" />
                      Preview
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-teal-600 hover:bg-teal-700">
                      <Send className="h-4 w-4 mr-2" />
                      Submit Return
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Data Breakdown */}
        {currentReturn && (currentReturn.ehcps_by_need || currentReturn.ehcps_by_age || currentReturn.ehcps_by_placement) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* By Need */}
            {currentReturn.ehcps_by_need && Object.keys(currentReturn.ehcps_by_need).length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-teal-600" />
                  By Primary Need
                </h3>
                <div className="space-y-3">
                  {Object.entries(currentReturn.ehcps_by_need).map(([need, count]) => (
                    <div key={need}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{need}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                      <ProgressBar 
                        value={count} 
                        max={currentReturn.total_ehcps} 
                        variant="teal"
                        ariaLabel={`${need}: ${count} out of ${currentReturn.total_ehcps}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* By Age */}
            {currentReturn.ehcps_by_age && Object.keys(currentReturn.ehcps_by_age).length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-teal-600" />
                  By Age Group
                </h3>
                <div className="space-y-3">
                  {Object.entries(currentReturn.ehcps_by_age).map(([age, count]) => (
                    <div key={age}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{age}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                      <ProgressBar 
                        value={count} 
                        max={currentReturn.total_ehcps} 
                        variant="emerald"
                        ariaLabel={`Age ${age}: ${count} out of ${currentReturn.total_ehcps}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* By Placement */}
            {currentReturn.ehcps_by_placement && Object.keys(currentReturn.ehcps_by_placement).length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-teal-600" />
                  By Placement Type
                </h3>
                <div className="space-y-3">
                  {Object.entries(currentReturn.ehcps_by_placement).map(([placement, count]) => (
                    <div key={placement}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{placement}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                      <ProgressBar 
                        value={count} 
                        max={currentReturn.total_ehcps} 
                        variant="blue"
                        ariaLabel={`${placement}: ${count} out of ${currentReturn.total_ehcps}`}
                      />
                    </div>
                  ))}}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Historical Returns */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Historical Returns</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading returns...</p>
            </div>
          ) : submittedReturns.length === 0 ? (
            <div className="p-12 text-center">
              <FileSpreadsheet className="h-12 w-12 text-gray-300 mx-auto" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No submitted returns</h3>
              <p className="mt-2 text-gray-500">Historical SEN2 returns will appear here.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Academic Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total EHCPs</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">New</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ceased</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {submittedReturns.map((ret) => {
                  const config = statusConfig[ret.status] || statusConfig.draft;
                  return (
                    <tr key={ret.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {ret.academic_year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
                          {config.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                        {ret.total_ehcps}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right">
                        +{ret.new_ehcps}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right">
                        -{ret.ceased_ehcps}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {ret.submitted_at ? formatDate(ret.submitted_at) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button className="inline-flex items-center text-sm font-medium text-teal-600 hover:text-teal-800">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
