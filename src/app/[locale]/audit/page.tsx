'use client';

/**
 * Audit Trail Page
 * Phase 2B: Trust & Compliance
 *
 * Accessible to SCHOOL_ADMIN, SENCO, EP roles.
 * Shows a live, paginated, filterable audit log for the tenant.
 */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/hooks';
import { useRouter } from 'next/navigation';
import { Shield, Search, Download, ChevronLeft, ChevronRight, Filter, Clock, User, FileText, AlertCircle } from 'lucide-react';

interface AuditEntry {
  id: string;
  action: string;
  resource?: string;
  entityType?: string;
  entityId?: string;
  description?: string;
  ipAddress?: string;
  timestamp: string;
  userId?: string;
  user?: { id: number; email: string; firstName?: string; lastName?: string };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const ACTION_COLOURS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-800',
  UPDATE: 'bg-blue-100 text-blue-800',
  DELETE: 'bg-red-100 text-red-800',
  VIEW: 'bg-gray-100 text-gray-700',
  LOGIN: 'bg-purple-100 text-purple-800',
  LOGOUT: 'bg-slate-100 text-slate-700',
  EXPORT: 'bg-amber-100 text-amber-800',
  ACCESS: 'bg-indigo-100 text-indigo-800',
};

function actionColour(action: string): string {
  const key = action.split('_')[0].toUpperCase();
  return ACTION_COLOURS[key] || 'bg-gray-100 text-gray-700';
}

function formatAction(action: string): string {
  return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

export default function AuditPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterEntity, setFilterEntity] = useState('');

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: '50' });
      if (filterAction) params.set('action', filterAction);
      if (filterEntity) params.set('entityType', filterEntity);
      const res = await fetch(`/api/audit?${params}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setEntries(data.entries ?? []);
      setPagination(data.pagination ?? null);
    } catch (e) {
      console.error('Audit load error:', e);
    } finally {
      setLoading(false);
    }
  }, [filterAction, filterEntity]);

  useEffect(() => {
    if (!authLoading && user) load(page);
  }, [user, authLoading, page, load]);

  useEffect(() => { setPage(1); load(1); }, [filterAction, filterEntity, load]);

  if (authLoading) return <div className="flex items-center justify-center min-h-screen text-slate-500">Loading…</div>;
  if (!user) { router.push('/login'); return null; }

  const filtered = search
    ? entries.filter(e =>
        e.action.toLowerCase().includes(search.toLowerCase()) ||
        e.entityType?.toLowerCase().includes(search.toLowerCase()) ||
        e.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        e.description?.toLowerCase().includes(search.toLowerCase())
      )
    : entries;

  const exportCSV = () => {
    const rows = [
      ['Timestamp', 'Action', 'Entity', 'User', 'IP Address', 'Description'],
      ...entries.map(e => [
        new Date(e.timestamp).toISOString(),
        e.action,
        e.entityType || '',
        e.user?.email || e.userId || '',
        e.ipAddress || '',
        e.description || '',
      ])
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Audit Trail</h1>
              <p className="text-xs text-slate-500">All activity in your organisation</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={exportCSV}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700">
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <Link href="/settings" className="text-sm text-indigo-600 hover:underline">Settings</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Events', value: pagination?.total ?? '—', icon: Clock, colour: 'text-indigo-600 bg-indigo-50' },
            { label: 'This Page', value: entries.length, icon: FileText, colour: 'text-blue-600 bg-blue-50' },
            { label: 'Unique Users', value: new Set(entries.map(e => e.userId).filter(Boolean)).size, icon: User, colour: 'text-green-600 bg-green-50' },
            { label: 'Page', value: pagination ? `${pagination.page} / ${pagination.totalPages}` : '—', icon: Filter, colour: 'text-amber-600 bg-amber-50' },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.colour}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-900">{stat.value}</div>
                  <div className="text-xs text-slate-500">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search events…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <select value={filterAction} onChange={e => setFilterAction(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="VIEW">View</option>
            <option value="LOGIN">Login</option>
            <option value="EXPORT">Export</option>
          </select>
          <select value={filterEntity} onChange={e => setFilterEntity(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All entities</option>
            <option value="Student">Students</option>
            <option value="Case">Cases</option>
            <option value="Assessment">Assessments</option>
            <option value="Intervention">Interventions</option>
            <option value="Report">Reports</option>
            <option value="User">Users</option>
          </select>
        </div>

        {/* Log table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading audit log…</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No audit events found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Timestamp</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Action</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Entity</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">User</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">IP</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(entry => (
                    <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap font-mono text-xs">
                        {new Date(entry.timestamp).toLocaleDateString()}{' '}
                        <span className="text-slate-400">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${actionColour(entry.action)}`}>
                          {formatAction(entry.action)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {entry.entityType && (
                          <span className="text-slate-700 font-medium">{entry.entityType}</span>
                        )}
                        {entry.entityId && (
                          <span className="text-slate-400 ml-1 font-mono text-xs">#{entry.entityId.substring(0, 8)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {entry.user
                          ? `${entry.user.firstName || ''} ${entry.user.lastName || ''}`.trim() || entry.user.email
                          : entry.userId ? <span className="font-mono text-xs text-slate-400">{entry.userId.substring(0, 8)}…</span> : '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-400 font-mono text-xs">{entry.ipAddress || '—'}</td>
                      <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{entry.description || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total.toLocaleString()} events
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={!pagination.hasPrev}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNext}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
