'use client'

/**
 * AI Analytics Dashboard Component
 * Comprehensive dashboard for monitoring AI service performance, costs, and usage
 */
import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../packages/ui/card';
import { Button } from '../../packages/ui/button';
import { Alert, AlertDescription } from '../../packages/ui/alert';
import { EmptyState } from '@/components/ui/EmptyState';

interface AIAnalyticsData {
  performance: {
    totalRequests: number;
    averageResponseTime: number;
    successRate: number;
    errorRate: number;
    performanceByService: Record<string, any>;
    peakUsageHours: Array<{ hour: number; requestCount: number }>;
  };
  cost: {
    totalCost: number;
    dailyCost: number;
    monthlyCost: number;
    costByService: Record<string, number>;
    costByOperation: Record<string, number>;
    averageCostPerRequest: number;
  };
  agents: Array<{
    agentId: string;
    totalRequests: number;
    averageResponseTime: number;
    successRate: number;
    cost: number;
    lastUsed: string;
    usageByHour: Record<number, number>;
  }>;
  cache: {
    totalEntries: number;
    hitRate: number;
    totalSize: number;
    oldestEntry: string | null;
    newestEntry: string | null;
  };
  recentErrors: Array<{
    timestamp: string;
    service: string;
    operation: string;
    duration: number;
    success: boolean;
    error?: string;
  }>;
  metadata: {
    generatedAt: string;
    timeframe: string;
    totalEvents: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AIAnalyticsCharts = dynamic(() => import('./AIAnalyticsCharts'), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border border-gray-200 bg-white p-6 text-gray-500">
      Loading analytics charts...
    </div>
  ),
});

export default function AIAnalyticsDashboard() {
  const [data, setData] = useState<AIAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('day');

  const fetchAnalytics = useCallback(async (selectedTimeframe: string = timeframe) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/ai/analytics?timeframe=${selectedTimeframe}&metrics=all`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (_err) {
      setError(_err instanceof Error ? _err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe);
  };

  const exportData = (format: 'json' | 'csv') => {
    window.open(`/api/ai/analytics?timeframe=${timeframe}&export=${format}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertDescription>
          Error loading analytics: {error}
          <Button
            onClick={() => fetchAnalytics()}
            className="ml-4"
            variant="outline"
            size="sm"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="No analytics data yet"
        description="Once AI services record activity, insights will appear here."
        icon={<Database className="w-8 h-8 text-blue-500" />}
        actionLabel="Retry"
        actionOnClick={() => fetchAnalytics()}
      />
    );
  }

  // Prepare chart data
  const servicePerformanceData = Object.entries(data.performance.performanceByService).map(([service, metrics]) => ({
    service: service.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    responseTime: Math.round(metrics.averageResponseTime),
    successRate: Math.round(metrics.successRate),
    requestCount: metrics.requestCount
  }));

  const costByServiceData = Object.entries(data.cost.costByService).map(([service, cost]) => ({
    service: service.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    cost: Math.round(cost * 100) / 100
  }));

  const agentUsageData = data.agents.slice(0, 10).map(agent => ({
    agent: agent.agentId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    requests: agent.totalRequests,
    responseTime: Math.round(agent.averageResponseTime),
    successRate: Math.round(agent.successRate)
  }));

  const hourlyUsageData = data.performance.peakUsageHours.map(hour => ({
    hour: `${hour.hour}:00`,
    requests: hour.requestCount
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI Analytics Dashboard</h1>
          <p className="text-gray-600">
            Comprehensive monitoring of AI service performance, costs, and usage
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => exportData('json')}
            variant="outline"
            size="sm"
          >
            Export JSON
          </Button>
          <Button
            onClick={() => exportData('csv')}
            variant="outline"
            size="sm"
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="flex gap-2">
        {['day', 'week', 'month'].map((period) => (
          <Button
            key={period}
            onClick={() => handleTimeframeChange(period)}
            variant={timeframe === period ? 'default' : 'outline'}
            size="sm"
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </Button>
        ))}
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.performance.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {data.metadata.timeframe} timeframe
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(data.performance.averageResponseTime)}ms</div>
            <p className="text-xs text-muted-foreground">
              {data.performance.successRate.toFixed(1)}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.cost.totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              ${data.cost.averageCostPerRequest.toFixed(4)} per request
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.agents.length}</div>
            <p className="text-xs text-muted-foreground">
              {data.agents.filter(a => a.totalRequests > 0).length} with usage
            </p>
          </CardContent>
        </Card>
      </div>

      <AIAnalyticsCharts
        data={data}
        servicePerformanceData={servicePerformanceData}
        hourlyUsageData={hourlyUsageData}
        costByServiceData={costByServiceData}
        agentUsageData={agentUsageData}
        colors={COLORS}
      />

      {/* Footer */}
      <div className="text-sm text-gray-500 text-center">
        Last updated: {new Date(data.metadata.generatedAt).toLocaleString()} |
        Total events tracked: {data.metadata.totalEvents.toLocaleString()}
      </div>
    </div>
  );
}
