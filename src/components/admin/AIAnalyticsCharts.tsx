'use client'

import React from 'react';
import { Badge } from '../../packages/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../packages/ui/card';
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
  AreaChart,
} from 'recharts';

interface AIAnalyticsChartsProps {
  data: {
    performance: {
      averageResponseTime: number;
      successRate: number;
    };
    cost: {
      dailyCost: number;
      monthlyCost: number;
      averageCostPerRequest: number;
    };
    agents: Array<{
      agentId: string;
      totalRequests: number;
      averageResponseTime: number;
      successRate: number;
      cost: number;
    }>;
    recentErrors: Array<{
      timestamp: string;
      service: string;
      operation: string;
      duration: number;
      error?: string;
    }>;
  };
  servicePerformanceData: Array<{
    service: string;
    responseTime: number;
    successRate: number;
    requestCount: number;
  }>;
  hourlyUsageData: Array<{ hour: string; requests: number }>;
  costByServiceData: Array<{ service: string; cost: number }>;
  agentUsageData: Array<{
    agent: string;
    requests: number;
    responseTime: number;
    successRate: number;
  }>;
  colors: string[];
}

export default function AIAnalyticsCharts({
  data,
  servicePerformanceData,
  hourlyUsageData,
  costByServiceData,
  agentUsageData,
  colors,
}: AIAnalyticsChartsProps) {
  return (
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
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
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
                  {agent.agentId.replace(/_/g, ' ').replace(/\\b\\w/g, (l) => l.toUpperCase())}
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
  );
}
