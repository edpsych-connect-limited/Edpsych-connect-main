/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, PieLabelRenderProps
} from 'recharts';

interface PerformanceMetricsProps {
  id: string;
  metrics: {
    assessmentCompletions?: number;
    assessmentCompletionsTrend?: number;
    activeInterventions?: number;
    activeInterventionsTrend?: number;
    resourceUtilization?: number;
    resourceUtilizationTrend?: number;
    // Additional metrics
    studentOutcomes?: number[];
    performanceTrends?: { month: string; value: number }[];
    benchmarkComparison?: { category: string; institution: number; benchmark: number }[];
    departmentPerformance?: { name: string; value: number; color: string }[];
    userActivity?: { day: string; count: number }[];
  };
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ metrics }) => {
  
  // Default data for when metrics are missing
  const performanceTrends = metrics.performanceTrends || [
    { month: 'Jan', value: 65 },
    { month: 'Feb', value: 68 },
    { month: 'Mar', value: 73 },
    { month: 'Apr', value: 79 },
    { month: 'May', value: 82 },
    { month: 'Jun', value: 86 }
  ];

  const benchmarkData = metrics.benchmarkComparison || [
    { category: 'Assessments', institution: 85, benchmark: 65 },
    { category: 'Interventions', institution: 78, benchmark: 60 },
    { category: 'Resource Use', institution: 92, benchmark: 70 },
    { category: 'Outcomes', institution: 88, benchmark: 75 },
    { category: 'Engagement', institution: 95, benchmark: 80 }
  ];

  const departmentData = metrics.departmentPerformance || [
    { name: 'Special Ed', value: 35, color: '#0088FE' },
    { name: 'Literacy', value: 25, color: '#00C49F' },
    { name: 'Behaviour', value: 20, color: '#FFBB28' },
    { name: 'General', value: 15, color: '#FF8042' },
    { name: 'Admin', value: 5, color: '#8884D8' }
  ];

  const activityData = metrics.userActivity || [
    { day: 'Mon', count: 24 },
    { day: 'Tue', count: 32 },
    { day: 'Wed', count: 28 },
    { day: 'Thu', count: 35 },
    { day: 'Fri', count: 22 },
    { day: 'Sat', count: 6 },
    { day: 'Sun', count: 4 }
  ];

  return (
    <div className="space-y-8">
      {/* Performance Trends */}
      <div className="bg-white p-5 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Performance Trends</h3>
        <p className="text-sm text-gray-600 mb-4">Overall performance metrics over time</p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={performanceTrends}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
              name="Performance Score"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Benchmark Comparison */}
      <div className="bg-white p-5 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Benchmark Comparison</h3>
        <p className="text-sm text-gray-600 mb-4">How your institution compares to similar organisations</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={benchmarkData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="institution" fill="#8884d8" name="Your Institution" />
            <Bar dataKey="benchmark" fill="#82ca9d" name="Benchmark Average" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Department Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Department Performance</h3>
          <p className="text-sm text-gray-600 mb-4">Resource utilization by department</p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={departmentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: PieLabelRenderProps) => {
                  const { name, value: _value, percent } = props;
                  if (typeof percent === 'number') {
                    return `${name}: ${(percent * 100).toFixed(0)}%`;
                  }
                  return '';
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {departmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* User Activity */}
        <div className="bg-white p-5 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Weekly User Activity</h3>
          <p className="text-sm text-gray-600 mb-4">Platform usage by day of week</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={activityData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#4c1d95" name="Active Users" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="bg-white p-5 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Performance Analysis</h3>
        <p className="text-sm text-gray-600 mb-4">Detailed analysis of institutional performance</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded">
            <p className="text-sm text-gray-600">Assessment Completion Rate</p>
            <p className="text-xl font-bold">{metrics.assessmentCompletions || 86}%</p>
            <p className="text-xs text-green-600">Up {metrics.assessmentCompletionsTrend || 4}%</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded">
            <p className="text-sm text-gray-600">Intervention Success Rate</p>
            <p className="text-xl font-bold">{metrics.activeInterventions || 72}%</p>
            <p className="text-xs text-green-600">Up {metrics.activeInterventionsTrend || 3}%</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded">
            <p className="text-sm text-gray-600">Resource Utilization</p>
            <p className="text-xl font-bold">{metrics.resourceUtilization || 93}%</p>
            <p className="text-xs text-green-600">Up {metrics.resourceUtilizationTrend || 5}%</p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded">
            <p className="text-sm text-gray-600">User Satisfaction</p>
            <p className="text-xl font-bold">4.8/5</p>
            <p className="text-xs text-green-600">Up 0.2</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;
