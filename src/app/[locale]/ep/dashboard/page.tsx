'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Brain,
  Calendar,
  FileText,
  Briefcase,
  Clock,
  AlertTriangle,
  CheckCircle,
  Users,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/hooks';
import { ASSESSMENT_LIBRARY } from '@/lib/assessments/assessment-library';

interface CaseSummary {
  id: number;
  student_id: number;
  status: string;
  priority: string;
  type: string;
  referral_date: string;
  students?: { id: number; first_name: string; last_name: string };
}

interface ReportSummary {
  id: number;
  title: string;
  status: string;
  type: string;
  created_at: string;
  updated_at: string;
}

interface AssessmentSummary {
  id: string;
  title?: string;
  status: string;
  framework_id: string;
  assessment_date?: string;
  case_id: number;
}

export default function EPDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const epTools = ASSESSMENT_LIBRARY.filter((a) => a.qualification_required === 'ep').slice(0, 3);

  useEffect(() => {
    if (authLoading || !user) return;

    const load = async () => {
      try {
        const [casesRes, reportsRes] = await Promise.all([
          fetch('/api/cases?limit=10&status=active,referral,assessment,intervention'),
          fetch('/api/reports?limit=10&status=DRAFT'),
        ]);

        if (casesRes.ok) {
          const d = await casesRes.json();
          setCases(d.cases ?? d.data ?? []);
        }
        if (reportsRes.ok) {
          const d = await reportsRes.json();
          setReports(d.reports ?? d.data ?? []);
        }
      } catch (e) {
        console.error('EP dashboard load error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, authLoading]);

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="text-lg text-slate-500">Loading…</div></div>;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const displayName = user.name || user.email;
  const nameParts = (user.name || '').trim().split(' ');
  const initials = nameParts.length >= 2
    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
    : (user.name?.[0] || user.email?.[0] || 'EP').toUpperCase();

  const activeCases = cases.filter((c) => c.status !== 'closed');
  const urgentCases = activeCases.filter((c) => c.priority === 'urgent' || c.priority === 'high');
  const draftReports = reports.filter((r) => r.status === 'DRAFT');

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              EdPsych Connect
            </span>
            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">EP Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm">
                {initials}
              </div>
              <span className="text-sm font-medium text-slate-700">{displayName}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome + summary */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Caseload</h1>
            <p className="text-slate-600">
              {loading ? 'Loading your cases…' : (
                <>
                  {activeCases.length} active {activeCases.length === 1 ? 'case' : 'cases'}
                  {draftReports.length > 0 && <> · <span className="text-amber-600 font-medium">{draftReports.length} report{draftReports.length !== 1 ? 's' : ''} in draft</span></>}
                  {urgentCases.length > 0 && <> · <span className="text-red-600 font-medium">{urgentCases.length} urgent</span></>}
                </>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/assessments/new"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors text-sm"
            >
              Start Assessment
            </Link>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          {[
            { title: 'Active Cases', value: loading ? '…' : String(activeCases.length), href: '/cases', icon: Users, tone: 'text-indigo-600', bg: 'bg-indigo-50' },
            { title: 'Draft Reports', value: loading ? '…' : String(draftReports.length), href: '/reports', icon: FileText, tone: 'text-amber-600', bg: 'bg-amber-50' },
            { title: 'Urgent / High Priority', value: loading ? '…' : String(urgentCases.length), href: '/cases?priority=urgent', icon: AlertTriangle, tone: 'text-red-600', bg: 'bg-red-50' },
            { title: 'Start Assessment', value: 'New', href: '/assessments/new', icon: Brain, tone: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.title} href={card.href}
                className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
                <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${card.bg} ${card.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-0.5">{card.value}</div>
                <p className="text-xs text-slate-600">{card.title}</p>
              </Link>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Urgent / high priority cases */}
            {urgentCases.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-red-100">
                <div className="p-5 border-b border-red-50 flex items-center justify-between">
                  <h2 className="font-bold text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" /> Urgent & High Priority
                  </h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {urgentCases.slice(0, 5).map((c) => (
                    <Link key={c.id} href={`/cases/${c.id}`}
                      className="flex items-center justify-between p-4 hover:bg-red-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold text-sm">
                          {c.students ? `${c.students.first_name[0]}${c.students.last_name[0]}` : '#'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">
                            {c.students ? `${c.students.first_name} ${c.students.last_name}` : `Case #${c.id}`}
                          </div>
                          <div className="text-xs text-slate-500 capitalize">{c.type.replace(/_/g, ' ')} · {c.status}</div>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${c.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                        {c.priority}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Active cases */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" /> Active Cases
                </h2>
                <Link href="/cases" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {loading ? (
                <div className="p-6 text-slate-400 text-sm">Loading cases…</div>
              ) : activeCases.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-slate-500 mb-3">No active cases.</p>
                  <Link href="/cases/new" className="text-sm font-semibold text-indigo-600 hover:underline">Create first case</Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {activeCases.slice(0, 6).map((c) => (
                    <Link key={c.id} href={`/cases/${c.id}`}
                      className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                          {c.students ? `${c.students.first_name[0]}${c.students.last_name[0]}` : '#'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">
                            {c.students ? `${c.students.first_name} ${c.students.last_name}` : `Case #${c.id}`}
                          </div>
                          <div className="text-xs text-slate-500 capitalize">{c.type.replace(/_/g, ' ')} · Referred {new Date(c.referral_date).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${
                        c.status === 'assessment' ? 'bg-purple-100 text-purple-700' :
                        c.status === 'intervention' ? 'bg-blue-100 text-blue-700' :
                        c.status === 'referral' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>{c.status}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Draft reports */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-600" /> Reports to Complete
                </h2>
                <Link href="/reports" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {loading ? (
                <div className="p-6 text-slate-400 text-sm">Loading reports…</div>
              ) : draftReports.length === 0 ? (
                <div className="p-6 text-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">No draft reports. You're up to date.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {draftReports.slice(0, 5).map((r) => (
                    <Link key={r.id} href={`/reports/${r.id}`}
                      className="flex items-center justify-between p-4 hover:bg-amber-50 transition-colors">
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">{r.title}</div>
                        <div className="text-xs text-slate-500 capitalize mt-0.5">{r.type.replace(/_/g, ' ')} · Updated {new Date(r.updated_at).toLocaleDateString()}</div>
                      </div>
                      <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">Draft</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* EP Toolkit */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600" /> EP Toolkit
              </h3>
              <div className="space-y-3">
                {epTools.map((tool) => (
                  <Link key={tool.id} href={`/assessments/new?framework=${tool.id}`}
                    className="block p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-indigo-200 transition-colors group">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-700">{tool.name}</h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-500 uppercase">
                        {tool.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{tool.description}</p>
                  </Link>
                ))}
                <Link href="/assessments/library" className="block text-center text-sm font-bold text-indigo-600 hover:text-indigo-700 mt-2">
                  Full Assessment Library →
                </Link>
              </div>
            </div>

            {/* Quick navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Quick Access</h3>
              <div className="space-y-2">
                {[
                  { label: 'EHCP Applications', href: '/ehcp', icon: FileText },
                  { label: 'All Assessments', href: '/assessments', icon: Brain },
                  { label: 'Interventions', href: '/interventions', icon: Clock },
                  { label: 'All Cases', href: '/cases', icon: Users },
                ].map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link key={link.href} href={link.href}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors text-sm text-slate-700 hover:text-indigo-600">
                      <Icon className="w-4 h-4 text-slate-400" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
