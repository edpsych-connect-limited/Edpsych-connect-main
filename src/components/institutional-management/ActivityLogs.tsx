/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { useState, useEffect } from 'react';

interface ActivityLog {
  id: string;
  institutionId: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

interface ActivityLogsProps {
  id: string;
  initialLogs?: ActivityLog[];
}

const ActivityLogs: React.FC<ActivityLogsProps> = ({ 
  id, 
  initialLogs = [] 
}) => {
  const [logs, setLogs] = useState<ActivityLog[]>(initialLogs);
  const [loading, setLoading] = useState<boolean>(initialLogs.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [filter, setFilter] = useState<{
    action?: string;
    resourceType?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }>({});
  
  const ITEMS_PER_PAGE = 10;
  
  // Sample activity types for filtering
  const actionTypes = [
    'LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 
    'ASSIGN', 'REVOKE', 'DOWNLOAD', 'UPLOAD', 'SHARE'
  ];
  
  // Sample resource types for filtering
  const resourceTypes = [
    'USER', 'CONTACT', 'DEPARTMENT', 'LICENSE', 
    'SUBSCRIPTION', 'ASSESSMENT', 'INTERVENTION', 'REPORT'
  ];

  // No mock data as we're using real API connections

  const fetchLogs = React.useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      // Build query parameters for filtering
      const queryParams = new URLSearchParams();
      
      if (filter.action) {
        queryParams.append('action', filter.action);
      }
      
      if (filter.resourceType) {
        queryParams.append('resourceType', filter.resourceType);
      }
      
      if (filter.userId) {
        queryParams.append('userId', filter.userId);
      }
      
      if (filter.startDate) {
        queryParams.append('startDate', filter.startDate);
      }
      
      if (filter.endDate) {
        queryParams.append('endDate', filter.endDate);
      }
      
      // Add pagination parameters
      queryParams.append('page', page.toString());
      queryParams.append('limit', ITEMS_PER_PAGE.toString());
      
      // Make the API call
      const response = await fetch(`/api/institutions/${id}/activity-logs?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching logs: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Set logs and pagination info from API response
      setLogs(data.logs || []);
      setTotalPages(data.totalPages || 1);
    } catch (_err) {
      console.error('Error fetching activity logs:', _err);
      setError(_err instanceof Error ? _err.message : 'An error occurred while loading activity logs');
    } finally {
      setLoading(false);
    }
  }, [id, filter, page]);

  useEffect(() => {
    if (initialLogs.length === 0) {
      fetchLogs();
    } else {
      setLogs(initialLogs);
      setTotalPages(Math.ceil(initialLogs.length / ITEMS_PER_PAGE) || 1);
    }
  }, [id, initialLogs, page, filter, fetchLogs]);

  // No need for processLogs function as we're using the API's pagination

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFilter(prevFilter => ({
      ...prevFilter,
      [name]: value === '' ? undefined : value
    }));
    
    // Reset to first page when filter changes
    setPage(1);
  };

  const clearFilters = () => {
    setFilter({});
    setPage(1);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      case 'LOGIN':
      case 'LOGOUT':
        return 'bg-purple-100 text-purple-800';
      case 'DOWNLOAD':
      case 'UPLOAD':
        return 'bg-yellow-100 text-yellow-800';
      case 'ASSIGN':
      case 'REVOKE':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading activity logs...</div>;
  }

  if (error) {
    return (
      <div className="p-5 bg-red-50 text-red-500 rounded">
        <h3 className="font-semibold">Error</h3>
        <p>{error}</p>
        <button 
          onClick={fetchLogs}
          className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 text-sm mt-2"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold">Activity Logs</h2>
          <p className="text-gray-600">View all user activities within this institution</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label htmlFor="action" className="block text-sm font-medium text-gray-700 mb-1">
                Action Type
              </label>
              <select
                id="action"
                name="action"
                value={filter.action || ''}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded text-sm"
              >
                <option value="">All Actions</option>
                {actionTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="resourceType" className="block text-sm font-medium text-gray-700 mb-1">
                Resource Type
              </label>
              <select
                id="resourceType"
                name="resourceType"
                value={filter.resourceType || ''}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded text-sm"
              >
                <option value="">All Resources</option>
                {resourceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={filter.startDate || ''}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={filter.endDate || ''}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded text-sm"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 border border-gray-300 rounded shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-sm text-center text-gray-500">
                    No activity logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{log.userName}</div>
                      <div className="text-xs text-gray-500">{log.userEmail}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{log.resourceType}</div>
                      <div className="text-xs text-gray-500">{log.resourceId || '—'}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {log.details || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className={`px-3 py-1 rounded text-sm ${
                page === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className={`px-3 py-1 rounded text-sm ${
                page === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden p-4">
        <h3 className="font-medium mb-2">Export Options</h3>
        <div className="flex space-x-2">
          <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
            Export CSV
          </button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
            Export PDF
          </button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
            Print Logs
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;