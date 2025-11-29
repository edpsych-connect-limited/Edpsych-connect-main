/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { useState, useEffect, useId } from 'react';
import { FaServer, FaRobot, FaUsers, FaClock, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

interface SystemMetrics {
  orchestrator: {
    status: 'operational' | 'degraded' | 'down';
    totalAgents: number;
    activeAgents: number;
    queueStatus: {
      pending: number;
      active: number;
      total: number;
    };
    systemInfo: {
      uptime: number;
      memory: { heapUsed: number; [key: string]: unknown };
      nodeVersion: string;
      platform: string;
    };
  };
  agents: {
    registered: number;
    active: number;
    health: Array<{
      agentId: string;
      name: string;
      status: string;
      loadFactor: number;
      performanceMetrics: {
        averageResponseTime: number;
        successRate: number;
        totalTasksProcessed: number;
        currentQueueSize: number;
      };
      lastSeen: string;
    }>;
  };
  recentActivity: Array<{
    id: string;
    requestType: string;
    studentId: string;
    strategy: string;
    processingTime: number;
    timestamp: string;
  }>;
}

// Helper component to avoid inline styles
const ProgressBar = ({ progress }: { progress: number }) => {
  const id = useId().replace(/:/g, '');
  return (
    <>
      <style>{`
        .progress-${id} {
          width: ${progress}%;
        }
      `}</style>
      <div
        className={`bg-blue-600 h-2 rounded-full progress-${id}`}
      />
    </>
  );
};

export default function SystemOverview() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/orchestrator/status');
      if (!response.ok) {
        throw new Error('Failed to fetch system metrics');
      }
      const data = await response.json();
      setMetrics(data);
      setError(null);
    } catch (_err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
      case 'available':
        return 'text-green-600 bg-green-100';
      case 'degraded':
      case 'busy':
        return 'text-yellow-600 bg-yellow-100';
      case 'down':
      case 'offline':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
      case 'available':
        return <FaCheckCircle className="h-4 w-4" />;
      case 'degraded':
      case 'busy':
        return <FaExclamationTriangle className="h-4 w-4" />;
      case 'down':
      case 'offline':
        return <FaExclamationTriangle className="h-4 w-4" />;
      default:
        return <FaServer className="h-4 w-4" />;
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <FaExclamationTriangle className="h-6 w-6 text-red-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-red-800">Error Loading Metrics</h3>
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchMetrics}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* System Status Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FaServer className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">System Overview</h1>
              <p className="text-gray-600">Real-time platform performance and health metrics</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(metrics.orchestrator.status)}`}>
              {getStatusIcon(metrics.orchestrator.status)}
              <span className="capitalize">{metrics.orchestrator.status}</span>
            </span>
            <button
              onClick={fetchMetrics}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Agents</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.orchestrator.totalAgents}</p>
              </div>
              <FaRobot className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Agents</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.orchestrator.activeAgents}</p>
              </div>
              <FaUsers className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Queued Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.orchestrator.queueStatus.pending}</p>
              </div>
              <FaClock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Uptime</p>
                <p className="text-2xl font-bold text-gray-900">{formatUptime(metrics.orchestrator.systemInfo.uptime)}</p>
              </div>
              <FaCheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Agent Health Status */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Agent Health Status</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Load Factor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks Processed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Seen</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metrics.agents.health.map((agent) => (
                <tr key={agent.agentId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{agent.name}</div>
                    <div className="text-sm text-gray-500">{agent.agentId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(agent.status)}`}>
                      {getStatusIcon(agent.status)}
                      <span className="capitalize">{agent.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <ProgressBar progress={agent.loadFactor * 100} />
                      </div>
                      <span className="text-sm text-gray-900">{Math.round(agent.loadFactor * 100)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Math.round(agent.performanceMetrics.averageResponseTime)}ms
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Math.round(agent.performanceMetrics.successRate * 100)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {agent.performanceMetrics.totalTasksProcessed}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(agent.lastSeen).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {metrics.recentActivity.slice(0, 10).map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                    {activity.requestType}
                  </span>
                  <span className="text-sm text-gray-600">Student: {activity.studentId}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Strategy: {activity.strategy} | Processing Time: {activity.processingTime}ms
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Node Version</p>
            <p className="text-lg font-semibold text-gray-900">{metrics.orchestrator.systemInfo.nodeVersion}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Platform</p>
            <p className="text-lg font-semibold text-gray-900 capitalize">{metrics.orchestrator.systemInfo.platform}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Memory Usage</p>
            <p className="text-lg font-semibold text-gray-900">
              {Math.round(metrics.orchestrator.systemInfo.memory.heapUsed / 1024 / 1024)}MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}