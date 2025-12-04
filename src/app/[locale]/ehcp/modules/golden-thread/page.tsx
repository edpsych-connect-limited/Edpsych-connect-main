'use client'

/**
 * Golden Thread Page
 * Visualise connections between needs, outcomes and provisions
 */

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/hooks';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  GitBranch,
  CheckCircle2,
  AlertCircle,
  Link2,
  BarChart3,
  Eye,
  RefreshCw
} from 'lucide-react';
import { EHCPModuleVideoIntro } from '@/components/ehcp/EHCPModuleVideoIntro';

// Custom LinkBreak icon since it may not exist in lucide
const LinkBreakIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 17H7A5 5 0 0 1 7 7" />
    <path d="M15 7h2a5 5 0 0 1 4 8" />
    <line x1="8" y1="12" x2="12" y2="12" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

interface GoldenThreadAnalysis {
  id: string;
  ehcp_id: string;
  analysis_date: string;
  overall_coherence: number;
  overall_quality: number;
  needs_coverage: number;
  outcomes_alignment: number;
  provision_mapping: number;
  provision_gaps: string[];
  broken_links: string[];
  recommendations: string[];
  ehcp?: { student_id: string };
}

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-600';
};

const getScoreBg = (score: number) => {
  if (score >= 80) return 'bg-green-100';
  if (score >= 60) return 'bg-amber-100';
  return 'bg-red-100';
};

export default function GoldenThreadPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [analyses, setAnalyses] = useState<GoldenThreadAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<GoldenThreadAnalysis | null>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ehcp/golden-thread');
      if (response.ok) {
        const data = await response.json();
        setAnalyses(data.analyses || []);
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

  const avgCoherence = analyses.length > 0
    ? Math.round(analyses.reduce((acc, a) => acc + a.overall_coherence, 0) / analyses.length)
    : 0;
  
  const avgQuality = analyses.length > 0
    ? Math.round(analyses.reduce((acc, a) => acc + a.overall_quality, 0) / analyses.length)
    : 0;

  const withGaps = analyses.filter(a => a.provision_gaps && a.provision_gaps.length > 0).length;
  const withBrokenLinks = analyses.filter(a => a.broken_links && a.broken_links.length > 0).length;

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
                  <GitBranch className="h-7 w-7 text-indigo-600" />
                  Golden Thread Analysis
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Visualise connections between needs, outcomes and provisions
                </p>
              </div>
            </div>
            <button
              onClick={fetchData}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Analysis
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Video Introduction */}
        <EHCPModuleVideoIntro
          videoKey="golden-thread-coherence"
          title="Golden Thread Coherence"
          description="Visualise and strengthen the connections between assessed needs, outcomes, and provisions in EHCPs with AI-powered analysis."
          duration="4 min"
          gradient="from-indigo-600 to-purple-600"
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${getScoreBg(avgCoherence)} rounded-lg`}>
                <Link2 className={`h-5 w-5 ${getScoreColor(avgCoherence)}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Coherence</p>
                <p className={`text-2xl font-bold ${getScoreColor(avgCoherence)}`}>{avgCoherence}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${getScoreBg(avgQuality)} rounded-lg`}>
                <BarChart3 className={`h-5 w-5 ${getScoreColor(avgQuality)}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Quality</p>
                <p className={`text-2xl font-bold ${getScoreColor(avgQuality)}`}>{avgQuality}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">With Gaps</p>
                <p className="text-2xl font-bold text-amber-600">{withGaps}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <LinkBreakIcon className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Broken Links</p>
                <p className="text-2xl font-bold text-red-600">{withBrokenLinks}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <GitBranch className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-indigo-900">The Golden Thread</h3>
              <p className="text-sm text-indigo-700 mt-1">
                A well-written EHCP demonstrates a clear &ldquo;golden thread&rdquo; connecting the child&apos;s 
                assessed needs (Sections B, C, D) to specific outcomes (Section E) and the provisions 
                required to achieve them (Sections F, G, H). This analysis identifies gaps and broken links.
              </p>
            </div>
          </div>
        </div>

        {/* Analysis List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Analyzing golden threads...</p>
          </div>
        ) : analyses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <GitBranch className="h-12 w-12 text-gray-300 mx-auto" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No analyses yet</h3>
            <p className="mt-2 text-gray-500">Golden thread analyses will appear here once generated.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {analyses.map((analysis) => (
              <div
                key={analysis.id}
                className="bg-white rounded-xl shadow-sm border overflow-hidden hover:border-indigo-200 transition cursor-pointer"
                onClick={() => setSelectedAnalysis(selectedAnalysis?.id === analysis.id ? null : analysis)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {analysis.ehcp?.student_id || `EHCP-${analysis.ehcp_id}`}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Analyzed: {formatDate(analysis.analysis_date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getScoreColor(analysis.overall_coherence)}`}>
                          {analysis.overall_coherence}%
                        </div>
                        <p className="text-xs text-gray-500">Coherence</p>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getScoreColor(analysis.overall_quality)}`}>
                          {analysis.overall_quality}%
                        </div>
                        <p className="text-xs text-gray-500">Quality</p>
                      </div>
                      <Eye className={`h-5 w-5 ${selectedAnalysis?.id === analysis.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                    </div>
                  </div>

                  {/* Score Bars */}
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Needs Coverage</span>
                        <span>{analysis.needs_coverage}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${analysis.needs_coverage >= 80 ? 'bg-green-500' : analysis.needs_coverage >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${analysis.needs_coverage}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Outcomes Alignment</span>
                        <span>{analysis.outcomes_alignment}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${analysis.outcomes_alignment >= 80 ? 'bg-green-500' : analysis.outcomes_alignment >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${analysis.outcomes_alignment}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Provision Mapping</span>
                        <span>{analysis.provision_mapping}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${analysis.provision_mapping >= 80 ? 'bg-green-500' : analysis.provision_mapping >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${analysis.provision_mapping}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedAnalysis?.id === analysis.id && (
                  <div className="border-t bg-gray-50 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Provision Gaps */}
                      {analysis.provision_gaps && analysis.provision_gaps.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 flex items-center gap-2 mb-3">
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            Provision Gaps
                          </h4>
                          <ul className="space-y-2">
                            {analysis.provision_gaps.map((gap, idx) => (
                              <li key={idx} className="text-sm text-gray-600 bg-white p-2 rounded border border-amber-200">
                                {gap}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Broken Links */}
                      {analysis.broken_links && analysis.broken_links.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 flex items-center gap-2 mb-3">
                            <LinkBreakIcon className="h-4 w-4 text-red-500" />
                            Broken Links
                          </h4>
                          <ul className="space-y-2">
                            {analysis.broken_links.map((link, idx) => (
                              <li key={idx} className="text-sm text-gray-600 bg-white p-2 rounded border border-red-200">
                                {link}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Recommendations */}
                      {analysis.recommendations && analysis.recommendations.length > 0 && (
                        <div className="md:col-span-2">
                          <h4 className="font-medium text-gray-900 flex items-center gap-2 mb-3">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Recommendations
                          </h4>
                          <ul className="space-y-2">
                            {analysis.recommendations.map((rec, idx) => (
                              <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
