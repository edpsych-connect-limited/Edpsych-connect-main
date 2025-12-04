'use client'

/**
 * Mediation & Tribunal Page
 * Track mediation cases and tribunal proceedings
 */

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/hooks';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Scale,
  FileText,
  AlertTriangle,
  CheckCircle,
  Plus,
  Calendar,
  Users
} from 'lucide-react';

interface MediationCase {
  id: string;
  ehcp_id: string;
  case_reference: string;
  mediation_type: string;
  status: string;
  request_date: string;
  meeting_date?: string;
  outcome?: string;
  ehcp?: { student_id: string };
}

interface TribunalCase {
  id: string;
  ehcp_id: string;
  appeal_reference: string;
  appeal_type: string;
  status: string;
  registration_date: string;
  hearing_date?: string;
  decision_outcome?: string;
  ehcp?: { student_id: string };
}

const mediationStatusColors: Record<string, { bg: string; text: string }> = {
  requested: { bg: 'bg-amber-100', text: 'text-amber-800' },
  scheduled: { bg: 'bg-blue-100', text: 'text-blue-800' },
  in_progress: { bg: 'bg-purple-100', text: 'text-purple-800' },
  successful: { bg: 'bg-green-100', text: 'text-green-800' },
  unsuccessful: { bg: 'bg-red-100', text: 'text-red-800' },
  withdrawn: { bg: 'bg-gray-100', text: 'text-gray-800' }
};

const tribunalStatusColors: Record<string, { bg: string; text: string }> = {
  lodged: { bg: 'bg-amber-100', text: 'text-amber-800' },
  response_due: { bg: 'bg-orange-100', text: 'text-orange-800' },
  hearing_scheduled: { bg: 'bg-blue-100', text: 'text-blue-800' },
  hearing_completed: { bg: 'bg-purple-100', text: 'text-purple-800' },
  decision_pending: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  appeal_upheld: { bg: 'bg-red-100', text: 'text-red-800' },
  appeal_dismissed: { bg: 'bg-green-100', text: 'text-green-800' },
  consent_order: { bg: 'bg-teal-100', text: 'text-teal-800' },
  withdrawn: { bg: 'bg-gray-100', text: 'text-gray-800' }
};

export default function MediationTribunalPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [mediations, setMediations] = useState<MediationCase[]>([]);
  const [tribunals, setTribunals] = useState<TribunalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'mediation' | 'tribunal'>('mediation');

  useEffect(() => {
    if (user) {
      fetchCases();
    }
  }, [user]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      
      const [mediationRes, tribunalRes] = await Promise.all([
        fetch('/api/ehcp/mediation'),
        fetch('/api/ehcp/tribunals')
      ]);
      
      if (mediationRes.ok) {
        const data = await mediationRes.json();
        setMediations(data.cases || []);
      }
      
      if (tribunalRes.ok) {
        const data = await tribunalRes.json();
        setTribunals(data.cases || []);
      }
    } catch (err) {
      console.error('Error fetching cases:', err);
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

  const activeMediations = mediations.filter(m => !['successful', 'unsuccessful', 'withdrawn'].includes(m.status));
  const activeTribunals = tribunals.filter(t => !['appeal_upheld', 'appeal_dismissed', 'consent_order', 'withdrawn'].includes(t.status));

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
                  <Scale className="h-7 w-7 text-purple-600" />
                  Mediation & Tribunal
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Track dispute resolution and tribunal proceedings
                </p>
              </div>
            </div>
            <button
              onClick={() => {}}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Case
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Users className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Mediations</p>
                <p className="text-2xl font-bold text-gray-900">{activeMediations.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Scale className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Tribunals</p>
                <p className="text-2xl font-bold text-gray-900">{activeTribunals.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Resolved This Year</p>
                <p className="text-2xl font-bold text-green-600">
                  {mediations.filter(m => m.status === 'successful').length + 
                   tribunals.filter(t => ['appeal_dismissed', 'consent_order'].includes(t.status)).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Upcoming Hearings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tribunals.filter(t => t.status === 'hearing_scheduled').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Deadlines Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900">SENDIST Deadlines</h3>
              <p className="text-sm text-amber-700 mt-1">
                Appeals must be registered within 2 months of the LA decision. 
                LA response is required within 30 working days of appeal registration.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="border-b">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('mediation')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'mediation'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Mediation Cases ({mediations.length})
                </span>
              </button>
              <button
                onClick={() => setActiveTab('tribunal')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'tribunal'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Scale className="h-4 w-4" />
                  Tribunal Cases ({tribunals.length})
                </span>
              </button>
            </nav>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading cases...</p>
            </div>
          ) : activeTab === 'mediation' ? (
            mediations.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-300 mx-auto" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No mediation cases</h3>
                <p className="mt-2 text-gray-500">Create a new mediation case to get started.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">EHCP</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meeting</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mediations.map((mediation) => {
                    const statusStyle = mediationStatusColors[mediation.status] || mediationStatusColors.requested;
                    return (
                      <tr key={mediation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {mediation.case_reference}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {mediation.ehcp?.student_id || `EHCP-${mediation.ehcp_id}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                          {mediation.mediation_type.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                            {mediation.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(mediation.request_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {mediation.meeting_date ? formatDate(mediation.meeting_date) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button className="text-sm font-medium text-purple-600 hover:text-purple-800">
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
          ) : (
            tribunals.length === 0 ? (
              <div className="p-12 text-center">
                <Scale className="h-12 w-12 text-gray-300 mx-auto" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No tribunal cases</h3>
                <p className="mt-2 text-gray-500">Create a new tribunal case to get started.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appeal Ref</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">EHCP</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hearing</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tribunals.map((tribunal) => {
                    const statusStyle = tribunalStatusColors[tribunal.status] || tribunalStatusColors.lodged;
                    return (
                      <tr key={tribunal.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {tribunal.appeal_reference}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {tribunal.ehcp?.student_id || `EHCP-${tribunal.ehcp_id}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                          {tribunal.appeal_type.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                            {tribunal.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(tribunal.registration_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {tribunal.hearing_date ? formatDate(tribunal.hearing_date) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded" title="Documents">
                              <FileText className="h-4 w-4" />
                            </button>
                            <button className="text-sm font-medium text-purple-600 hover:text-purple-800">
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
          )}
        </div>
      </div>
    </div>
  );
}
