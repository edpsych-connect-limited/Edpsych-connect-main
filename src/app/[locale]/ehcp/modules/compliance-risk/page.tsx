'use client'

/**
 * Compliance & Risk Page
 * AI-powered compliance risk prediction
 */

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/hooks';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  AlertTriangle,
  Shield,
  TrendingUp,
  Bell,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

interface ComplianceRisk {
  id: string;
  ehcp_id: string;
  assessment_date: string;
  overall_risk_level: string;
  risk_score: number;
  risk_factors: string[];
  recommendations: string[];
  ehcp?: { student_id: string };
}

interface ComplianceAlert {
  id: string;
  ehcp_id: string;
  alert_type: string;
  severity: string;
  message: string;
  status: string;
  created_at: string;
  resolved_at?: string;
  ehcp?: { student_id: string };
}

const riskLevelConfig: Record<string, { bg: string; text: string; border: string }> = {
  low: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  high: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
};

const alertSeverityConfig: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  info: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Bell },
  warning: { bg: 'bg-amber-100', text: 'text-amber-800', icon: AlertTriangle },
  critical: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
};

export default function ComplianceRiskPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [risks, setRisks] = useState<ComplianceRisk[]>([]);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts'>('overview');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ehcp/compliance-risk');
      if (response.ok) {
        const data = await response.json();
        setRisks(data.predictions || []);
        setAlerts(data.alerts || []);
      }
    } catch (err) {
      console.error('Error fetching compliance data:', err);
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

  const highRiskCount = risks.filter(r => ['high', 'critical'].includes(r.overall_risk_level)).length;
  const activeAlerts = alerts.filter(a => a.status === 'active');
  const avgRiskScore = risks.length > 0 
    ? Math.round(risks.reduce((acc, r) => acc + r.risk_score, 0) / risks.length)
    : 0;

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
                  <AlertTriangle className="h-7 w-7 text-red-600" />
                  Compliance & Risk
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  AI-powered compliance risk prediction and alerts
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">High Risk EHCPs</p>
                <p className="text-2xl font-bold text-red-600">{highRiskCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Bell className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Alerts</p>
                <p className="text-2xl font-bold text-amber-600">{activeAlerts.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Risk Score</p>
                <p className="text-2xl font-bold text-gray-900">{avgRiskScore}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Compliant</p>
                <p className="text-2xl font-bold text-green-600">
                  {risks.filter(r => r.overall_risk_level === 'low').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Info Banner */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-indigo-900">AI-Powered Risk Analysis</h3>
              <p className="text-sm text-indigo-700 mt-1">
                Our system analyzes EHCP data to predict compliance risks based on statutory deadlines,
                provision delivery patterns, review schedules, and historical data across similar cases.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="border-b">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'overview'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Risk Overview ({risks.length})
              </button>
              <button
                onClick={() => setActiveTab('alerts')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'alerts'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  Alerts
                  {activeAlerts.length > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                      {activeAlerts.length}
                    </span>
                  )}
                </span>
              </button>
            </nav>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Analyzing compliance data...</p>
            </div>
          ) : activeTab === 'overview' ? (
            risks.length === 0 ? (
              <div className="p-12 text-center">
                <Shield className="h-12 w-12 text-gray-300 mx-auto" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No risk assessments</h3>
                <p className="mt-2 text-gray-500">Risk assessments will appear here once analyzed.</p>
              </div>
            ) : (
              <div className="divide-y">
                {risks.sort((a, b) => b.risk_score - a.risk_score).map((risk) => {
                  const config = riskLevelConfig[risk.overall_risk_level] || riskLevelConfig.medium;
                  return (
                    <div key={risk.id} className={`p-6 ${config.bg}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-gray-900">
                              {risk.ehcp?.student_id || `EHCP-${risk.ehcp_id}`}
                            </h3>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text} border ${config.border}`}>
                              {risk.overall_risk_level.toUpperCase()} RISK
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Assessed: {formatDate(risk.assessment_date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-gray-900">{risk.risk_score}%</div>
                          <p className="text-xs text-gray-500">Risk Score</p>
                        </div>
                      </div>

                      {risk.risk_factors && risk.risk_factors.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700">Risk Factors:</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {risk.risk_factors.map((factor, idx) => (
                              <span key={idx} className="inline-flex items-center px-2 py-1 text-xs bg-white rounded border">
                                <AlertTriangle className="h-3 w-3 mr-1 text-amber-500" />
                                {factor}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {risk.recommendations && risk.recommendations.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700">Recommendations:</p>
                          <ul className="mt-2 space-y-1">
                            {risk.recommendations.slice(0, 3).map((rec, idx) => (
                              <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            alerts.length === 0 ? (
              <div className="p-12 text-center">
                <Bell className="h-12 w-12 text-gray-300 mx-auto" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No alerts</h3>
                <p className="mt-2 text-gray-500">Compliance alerts will appear here.</p>
              </div>
            ) : (
              <div className="divide-y">
                {alerts.map((alert) => {
                  const config = alertSeverityConfig[alert.severity] || alertSeverityConfig.warning;
                  const Icon = config.icon;
                  return (
                    <div key={alert.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${config.bg}`}>
                          <Icon className={`h-5 w-5 ${config.text}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{alert.message}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                {alert.ehcp?.student_id || `EHCP-${alert.ehcp_id}`} • {alert.alert_type.replace(/_/g, ' ')}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                alert.status === 'active' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {alert.status}
                              </span>
                              <p className="text-xs text-gray-400 mt-1">{formatDate(alert.created_at)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
