'use client'

/**
 * Phase Transfers Page
 * Manage educational phase transitions
 */

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/hooks';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRightCircle,
  School,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  ChevronRight
} from 'lucide-react';
import { EHCPModuleVideoIntro } from '@/components/ehcp/EHCPModuleVideoIntro';

interface PhaseTransfer {
  id: string;
  ehcp_id: string;
  child_id: string;
  current_phase: string;
  target_phase: string;
  status: string;
  target_date: string;
  proposed_setting?: string;
  case_officer?: string;
  ehcp?: { student_id: string };
  child?: { name: string };
  events?: { id: string; event_type: string; status: string }[];
}

const phaseLabels: Record<string, string> = {
  early_years: 'Early Years',
  primary: 'Primary',
  secondary: 'Secondary',
  post_16: 'Post-16',
  higher_education: 'Higher Education'
};

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  planning: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Planning' },
  consultation: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Consultation' },
  placement_search: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Placement Search' },
  naming_school: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Naming School' },
  transition_support: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Transition Support' },
  completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
  delayed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Delayed' }
};

export default function PhaseTransfersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [transfers, setTransfers] = useState<PhaseTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [_filter, _setFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchTransfers();
    }
  }, [user]);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ehcp/phase-transfers');
      if (response.ok) {
        const data = await response.json();
        setTransfers(data.transfers || []);
      }
    } catch (err) {
      console.error('Error fetching transfers:', err);
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

  const getMonthsUntil = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const months = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30));
    return months;
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

  const activeTransfers = transfers.filter(t => t.status !== 'completed');
  const upcomingTransfers = transfers.filter(t => {
    const months = getMonthsUntil(t.target_date);
    return months <= 12 && months > 0 && t.status !== 'completed';
  });

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
                  <ArrowRightCircle className="h-7 w-7 text-green-600" />
                  Phase Transfers
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage educational phase transitions for EHCP children
                </p>
              </div>
            </div>
            <button
              onClick={() => {}}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Transfer
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Video Introduction */}
        <EHCPModuleVideoIntro
          videoKey="phase-transfers-mastery"
          title="Phase Transfers Mastery"
          description="Navigate educational transitions smoothly with preparation checklists, timeline management, and school consultation workflows."
          duration="4 min"
          gradient="from-green-600 to-emerald-600"
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <ArrowRightCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Transfers</p>
                <p className="text-2xl font-bold text-gray-900">{activeTransfers.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Due This Year</p>
                <p className="text-2xl font-bold text-amber-600">{upcomingTransfers.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <School className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Primary → Secondary</p>
                <p className="text-2xl font-bold text-gray-900">
                  {transfers.filter(t => t.current_phase === 'primary' && t.target_phase === 'secondary').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {transfers.filter(t => t.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Info */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900">UK SEND Code Phase Transfer Timeline</h3>
              <p className="text-sm text-green-700 mt-1">
                Phase transfers should be planned well in advance. For primary to secondary, 
                consultations typically begin in Year 5. The LA must name a school in the EHCP 
                by 15 February in the year of transfer.
              </p>
            </div>
          </div>
        </div>

        {/* Transfer Cards */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading transfers...</p>
          </div>
        ) : transfers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <ArrowRightCircle className="h-12 w-12 text-gray-300 mx-auto" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No phase transfers</h3>
            <p className="mt-2 text-gray-500">Create a new phase transfer to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transfers.map((transfer) => {
              const statusStyle = statusConfig[transfer.status] || statusConfig.planning;
              const monthsUntil = getMonthsUntil(transfer.target_date);
              const isUrgent = monthsUntil <= 6 && monthsUntil > 0;
              
              return (
                <div
                  key={transfer.id}
                  className={`bg-white rounded-xl shadow-sm border overflow-hidden ${
                    isUrgent ? 'ring-2 ring-amber-400' : ''
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        {/* Phase Transition Visual */}
                        <div className="flex items-center gap-2">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                              <School className="h-8 w-8 text-gray-500" />
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              {phaseLabels[transfer.current_phase]}
                            </p>
                          </div>
                          <ChevronRight className="h-6 w-6 text-gray-400" />
                          <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                              <School className="h-8 w-8 text-green-600" />
                            </div>
                            <p className="text-xs text-green-700 font-medium mt-1">
                              {phaseLabels[transfer.target_phase]}
                            </p>
                          </div>
                        </div>

                        <div className="ml-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {transfer.child?.name || `Child ID: ${transfer.child_id}`}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {transfer.ehcp?.student_id || `EHCP-${transfer.ehcp_id}`}
                          </p>
                          {transfer.proposed_setting && (
                            <p className="text-sm text-gray-600 mt-1">
                              Proposed: {transfer.proposed_setting}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                          {statusStyle.label}
                        </span>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <Calendar className="h-4 w-4 inline mr-1" />
                            Target: {formatDate(transfer.target_date)}
                          </p>
                          <p className={`text-xs mt-1 ${monthsUntil <= 3 ? 'text-red-600 font-medium' : monthsUntil <= 6 ? 'text-amber-600' : 'text-gray-500'}`}>
                            {monthsUntil <= 0 
                              ? 'Overdue' 
                              : `${monthsUntil} month${monthsUntil !== 1 ? 's' : ''} remaining`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="mt-6 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        {['planning', 'consultation', 'placement_search', 'naming_school', 'transition_support', 'completed'].map((step, idx) => {
                          const stepIdx = ['planning', 'consultation', 'placement_search', 'naming_school', 'transition_support', 'completed'].indexOf(transfer.status);
                          const isComplete = idx <= stepIdx;
                          const isCurrent = idx === stepIdx;
                          
                          return (
                            <React.Fragment key={step}>
                              <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  isComplete 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-gray-200 text-gray-400'
                                } ${isCurrent ? 'ring-2 ring-green-300' : ''}`}>
                                  {isComplete ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                  ) : (
                                    <span className="text-xs">{idx + 1}</span>
                                  )}
                                </div>
                                <span className={`text-xs mt-1 ${isCurrent ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
                                  {step.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                </span>
                              </div>
                              {idx < 5 && (
                                <div className={`flex-1 h-0.5 mx-2 ${isComplete && idx < stepIdx ? 'bg-green-500' : 'bg-gray-200'}`} />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
