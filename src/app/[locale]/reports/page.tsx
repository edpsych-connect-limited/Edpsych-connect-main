'use client';

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 *
 * Reports List Page — Phase 2A
 * Live data from /api/reports. Shows all reports for the tenant with status, type, and actions.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';
import { FileText, Plus, Search, Download, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { REPORT_CONFIDENTIAL_NOTICE, REPORT_EVIDENCE_NOTICE } from '@/lib/content/workflow-microcopy';

interface Report {
  id: number;
  title: string;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
  author?: { id: number; name?: string; email: string };
}

const STATUS_CONFIG: Record<string, { label: string; colour: string; icon: React.ReactNode }> = {
  DRAFT: { label: 'Draft', colour: 'bg-amber-100 text-amber-800', icon: <Clock className="w-3 h-3" /> },
  PUBLISHED: { label: 'Published', colour: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-3 h-3" /> },
  GENERATED: { label: 'Generated', colour: 'bg-blue-100 text-blue-800', icon: <FileText className="w-3 h-3" /> },
};

export default function ReportsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (authLoading || !user) return;
    fetch('/api/reports?limit=100')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setReports(d.reports ?? d.data ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  if (authLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  if (!user) { router.push('/login'); return null; }

  const filtered = search
    ? reports.filter(r =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.type.toLowerCase().includes(search.toLowerCase()) ||
        r.status.toLowerCase().includes(search.toLowerCase())
      )
    : reports;

  const drafts = reports.filter(r => r.status === 'DRAFT').length;
  const published = reports.filter(r => r.status === 'PUBLISHED' || r.status === 'GENERATED').length;

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
            <p className="text-slate-500 mt-1">Generate and manage professional educational psychology reports.</p>
            <div className="mt-3 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-900 max-w-2xl">
              <p>{REPORT_CONFIDENTIAL_NOTICE}</p>
              <p className="mt-1">{REPORT_EVIDENCE_NOTICE}</p>
            </div>
          </div>
          <Link href="/reports/create"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> New Report
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Reports', value: loading ? '…' : reports.length, icon: FileText, colour: 'text-indigo-600 bg-indigo-50' },
            { label: 'Draft', value: loading ? '…' : drafts, icon: Clock, colour: 'text-amber-600 bg-amber-50' },
            { label: 'Published', value: loading ? '…' : published, icon: CheckCircle, colour: 'text-green-600 bg-green-50' },
            { label: 'This Month', value: loading ? '…' : reports.filter(r => new Date(r.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length, icon: AlertCircle, colour: 'text-blue-600 bg-blue-50' },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.colour}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{s.value}</div>
                  <div className="text-xs text-slate-500">{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search reports…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
        </div>

        {/* Reports list */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" /></div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {search ? 'No reports match your search' : 'No reports yet'}
              </h3>
              <p className="text-slate-500 mb-6">
                {search ? 'Try a different search term.' : 'Create your first professional report using our templates.'}
              </p>
              {!search && (
                <Link href="/reports/create"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors">
                  <Plus className="w-4 h-4" /> Create First Report
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Title</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Type</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Author</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Updated</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(report => {
                    const statusConf = STATUS_CONFIG[report.status] || { label: report.status, colour: 'bg-gray-100 text-gray-700', icon: null };
                    return (
                      <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <Link href={`/reports/${report.id}`} className="font-medium text-slate-900 hover:text-indigo-600 transition-colors">
                            {report.title}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-slate-500 capitalize">{report.type.replace(/_/g, ' ')}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConf.colour}`}>
                            {statusConf.icon}{statusConf.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{report.author?.name || report.author?.email || '—'}</td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{new Date(report.updated_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Link href={`/reports/${report.id}`}
                              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">View</Link>
                            {(report.status === 'PUBLISHED' || report.status === 'GENERATED') && (
                              <a href={`/api/reports/${report.id}/export`}
                                className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
                                <Download className="w-3 h-3" />PDF
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
