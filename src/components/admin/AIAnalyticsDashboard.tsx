'use client'

import { logger } from "@/lib/logger";
/**
 * AI Analytics Dashboard Component
 * Comprehensive dashboard for monitoring AI service performance, costs, and usage
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../packages/ui/card';
import { Button } from '../../packages/ui/button';
import { Badge } from '../../packages/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../packages/ui/tabs';
import { Progress } from '../../packages/ui/progress';
import { Alert, AlertDescription } from '../../packages/ui/alert';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
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
    return <div>No data available</div>;
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

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="cost">Cost Analysis</TabsTrigger>
          <TabsTrigger value="agents">Agent Usage</TabsTrigger>
          <TabsTrigger value="errors">Error Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Service Performance</CardTitle>
                <CardDescription>Average response time by service</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={servicePerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="service" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="responseTime" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Peak Usage Hours</CardTitle>
                <CardDescription>Request distribution by hour</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={hourlyUsageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="requests" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cost" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Cost by Service</CardTitle>
                <CardDescription>AI service costs breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={costByServiceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(props: any) => {
                        const { service, percent } = props;
                        return `${service} ${(percent * 100).toFixed(0)}%`;
                      }}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="cost"
                    >
                      {costByServiceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Summary</CardTitle>
                <CardDescription>Cost metrics overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Daily Cost:</span>
                  <span className="font-bold">${data.cost.dailyCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Cost:</span>
                  <span className="font-bold">${data.cost.monthlyCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Cost/Request:</span>
                  <span className="font-bold">${data.cost.averageCostPerRequest.toFixed(4)}</span>
                </div>
                <div className="pt-4">
                  <div className="flex justify-between mb-2">
                    <span>Cost Efficiency</span>
                    <span>{((data.performance.successRate / 100) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(data.performance.successRate / 100) * 100} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance</CardTitle>
              <CardDescription>Usage and performance metrics for autonomous agents</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={agentUsageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="agent" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="requests" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.agents.slice(0, 6).map((agent) => (
              <Card key={agent.agentId}>
                <CardHeader>
                  <CardTitle className="text-sm">
                    {agent.agentId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Requests:</span>
                    <Badge variant="secondary">{agent.totalRequests}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Response Time:</span>
                    <span>{Math.round(agent.averageResponseTime)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate:</span>
                    <span>{agent.successRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost:</span>
                    <span>${agent.cost.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Errors</CardTitle>
              <CardDescription>Latest AI service errors and issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentErrors.length === 0 ? (
                  <p className="text-gray-500">No recent errors</p>
                ) : (
                  data.recentErrors.map((error, index) => (
                    <Alert key={index} variant="destructive">
                      <AlertDescription>
                        <div className="flex justify-between items-start">
                          <div>
                            <strong>{error.service}.{error.operation}</strong>
                            <p className="text-sm mt-1">{error.error}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Duration: {error.duration}ms | {new Date(error.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <Badge variant="destructive">
                            {error.duration > 10000 ? 'Slow' : 'Error'}
                          </Badge>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-sm text-gray-500 text-center">
        Last updated: {new Date(data.metadata.generatedAt).toLocaleString()} |
        Total events tracked: {data.metadata.totalEvents.toLocaleString()}
      </div>
    </div>
  );
}