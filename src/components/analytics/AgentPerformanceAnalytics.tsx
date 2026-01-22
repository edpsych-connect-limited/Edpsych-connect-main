'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, Bot, CheckCircle, Clock, DollarSign, Minus, TrendingDown, TrendingUp, XCircle } from 'lucide-react';

interface AgentPerformanceData {
  agentId: string;
  name: string;
  type: string;
  performanceMetrics: {
    totalTasksProcessed: number;
    averageResponseTime: number;
    successRate: number;
    currentQueueSize: number;
    costPerRequest: number;
    totalCost: number;
  };
  utilization: {
    loadFactor: number;
    uptime: number;
    activeTime: number;
    idleTime: number;
  };
  taskBreakdown: {
    tutoring: number;
    feedback: number;
    monitoring: number;
    coaching: number;
    curriculum: number;
    assessment: number;
  };
  errorMetrics: {
    totalErrors: number;
    errorRate: number;
    commonErrors: {
      type: string;
      count: number;
      percentage: number;
    }[];
  };
  trends: {
    responseTimeTrend: 'improving' | 'stable' | 'declining';
    successRateTrend: 'improving' | 'stable' | 'declining';
    utilizationTrend: 'increasing' | 'stable' | 'decreasing';
  };
}

export default function AgentPerformanceAnalytics() {
  const [agents, setAgents] = useState<AgentPerformanceData[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'hour' | 'day' | 'week' | 'month'>('day');

  const fetchAgentPerformance = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/agents?timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch agent performance data');
      }
      const data = await response.json();
      setAgents(data.agents || []);
    } catch (_err) {
      setError(_err instanceof Error ? _err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAgentPerformance();
  }, [fetchAgentPerformance]);

  const getPerformanceColor = (value: number, type: 'responseTime' | 'successRate' | 'utilization') => {
    switch (type) {
      case 'responseTime':
        return value < 2000 ? 'text-green-600' : value < 5000 ? 'text-yellow-600' : 'text-red-600';
      case 'successRate':
        return value > 95 ? 'text-green-600' : value > 90 ? 'text-yellow-600' : 'text-red-600';
      case 'utilization':
        return value < 70 ? 'text-green-600' : value < 90 ? 'text-yellow-600' : 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining':
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(4)}`;
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
          <XCircle className="h-6 w-6 text-red-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-red-800">Error Loading Agent Data</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bot className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Agent Performance Analytics</h1>
              <p className="text-gray-600">Detailed performance metrics and utilization statistics for all AI agents</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              aria-label="Time range"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="hour">Last Hour</option>
              <option value="day">Last 24 Hours</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Agent Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div
            key={agent.agentId}
            onClick={() => setSelectedAgent(agent)}
            className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bot className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{agent.type}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${getPerformanceColor(agent.performanceMetrics.successRate, 'successRate')}`}>
                  {agent.performanceMetrics.successRate.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">Success Rate</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Response Time</span>
                <div className="flex items-center space-x-1">
                  <span className={getPerformanceColor(agent.performanceMetrics.averageResponseTime, 'responseTime')}>
                    {formatResponseTime(agent.performanceMetrics.averageResponseTime)}
                  </span>
                  {getTrendIcon(agent.trends.responseTimeTrend)}
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span>Tasks Processed</span>
                <span className="font-medium">{agent.performanceMetrics.totalTasksProcessed}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Utilization</span>
                <div className="flex items-center space-x-1">
                  <span className={getPerformanceColor(agent.utilization.loadFactor * 100, 'utilization')}>
                    {(agent.utilization.loadFactor * 100).toFixed(0)}%
                  </span>
                  {getTrendIcon(agent.trends.utilizationTrend)}
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span>Cost/Request</span>
                <span className="font-medium">{formatCost(agent.performanceMetrics.costPerRequest)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Agent View */}
      {selectedAgent && (
        <div className="space-y-6">
          {/* Agent Header */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bot className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedAgent.name}</h2>
                  <p className="text-gray-600">Agent ID: {selectedAgent.agentId} • Type: {selectedAgent.type}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">
                  {selectedAgent.performanceMetrics.successRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Response Time</h3>
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {formatResponseTime(selectedAgent.performanceMetrics.averageResponseTime)}
              </div>
              <div className="flex items-center text-sm">
                <span className="text-gray-500">Trend: </span>
                {getTrendIcon(selectedAgent.trends.responseTimeTrend)}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Tasks Processed</h3>
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {selectedAgent.performanceMetrics.totalTasksProcessed}
              </div>
              <div className="text-sm text-gray-500">
                {selectedAgent.performanceMetrics.currentQueueSize} in queue
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Utilization</h3>
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {(selectedAgent.utilization.loadFactor * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-500">
                {Math.round(selectedAgent.utilization.uptime * 100)}% uptime
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Total Cost</h3>
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {formatCost(selectedAgent.performanceMetrics.totalCost)}
              </div>
              <div className="text-sm text-gray-500">
                {formatCost(selectedAgent.performanceMetrics.costPerRequest)} per request
              </div>
            </div>
          </div>

          {/* Task Breakdown */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(selectedAgent.taskBreakdown).map(([taskType, count]) => (
                <div key={taskType} className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{count}</div>
                  <div className="text-sm text-gray-500 capitalize">{taskType}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Error Analysis */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Error Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Errors</span>
                    <span className="font-medium text-red-600">{selectedAgent.errorMetrics.totalErrors}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Error Rate</span>
                    <span className="font-medium text-red-600">{selectedAgent.errorMetrics.errorRate.toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Common Errors</h4>
                <div className="space-y-2">
                  {selectedAgent.errorMetrics.commonErrors.slice(0, 3).map((error, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="truncate mr-2">{error.type}</span>
                      <span className="text-red-600">{error.count} ({error.percentage.toFixed(1)}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Utilization Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Utilization Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {Math.round(selectedAgent.utilization.activeTime)}h
                </div>
                <div className="text-sm text-gray-500">Active Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {Math.round(selectedAgent.utilization.idleTime)}h
                </div>
                <div className="text-sm text-gray-500">Idle Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {Math.round(selectedAgent.utilization.uptime * 100)}%
                </div>
                <div className="text-sm text-gray-500">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
