'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '../../lib/analytics';
import type { Dashboard, DashboardWidget } from '../../lib/analytics';
import { logError } from '../../lib/logger';

interface RealTimeDataState {
  metrics?: Array<{
    name: string;
    value: number;
    trend?: 'up' | 'down' | 'stable';
    change?: number;
  }>;
  [key: string]: any;
}

interface DashboardProps {
  dashboardId?: string;
  tenantId?: string;
}

export default function Dashboard({ dashboardId = 'default' }: DashboardProps) {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [realTimeData, setRealTimeData] = useState<RealTimeDataState>({});

  const loadDashboard = useCallback(async () => {
    try {
      const dashboardData = analyticsService.getDashboard(dashboardId);
      setDashboard(dashboardData);
    } catch (error) {
      logError(error as Error, { component: 'Dashboard', operation: 'loadDashboard' });
    } finally {
      setLoading(false);
    }
  }, [dashboardId]);

  const setupRealTimeUpdates = useCallback(() => {
    // In production, this would connect to WebSocket for real-time updates
    const interval = setInterval(async () => {
      const metrics = await analyticsService.getRealtimeMetrics();
      setRealTimeData((prev: RealTimeDataState) => ({ ...prev, metrics }));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadDashboard();
    const cleanup = setupRealTimeUpdates();
    return cleanup;
  }, [loadDashboard, setupRealTimeUpdates]);

  const renderWidget = (widget: DashboardWidget) => {
    switch (widget.type) {
      case 'metric':
        return <MetricWidget widget={widget} data={realTimeData} />;
      case 'chart':
        return <ChartWidget widget={widget} data={realTimeData} />;
      case 'table':
        return <TableWidget widget={widget} data={realTimeData} />;
      case 'heatmap':
        return <HeatmapWidget widget={widget} data={realTimeData} />;
      case 'funnel':
        return <FunnelWidget widget={widget} data={realTimeData} />;
      default:
        return <div>Unsupported widget type</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Dashboard not found</h3>
        <p className="text-gray-500">The requested dashboard could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{dashboard.name}</h1>
            <p className="text-gray-600">{dashboard.description}</p>
          </div>
          <div className="flex space-x-3">
            <button className="btn-secondary">Export</button>
            <button className="btn-primary">Edit Dashboard</button>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-12 gap-6">
        {dashboard.widgets.map((widget) => (
          <div
            key={widget.id}
            className="bg-white shadow rounded-lg p-6"
            // eslint-disable-next-line react/forbid-dom-props
            style={{
              gridColumn: `span ${widget.position.width}`,
              gridRow: `span ${widget.position.height}`
            }}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">{widget.title}</h3>
            {renderWidget(widget)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Widget Components
function MetricWidget({ widget, data }: { widget: DashboardWidget; data: RealTimeDataState }) {
  const metric = data.metrics?.find((m) => m.name === widget.config.metric);

  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-gray-900">
        {metric ? formatValue(metric.value, widget.config.format) : '0'}
      </div>
      {widget.config.showTrend && metric && (
        <div className="flex items-center justify-center mt-2">
          <span className={`text-sm ${
            metric.trend === 'up' ? 'text-green-600' :
            metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
            {Math.abs(metric.change ?? 0)}%
          </span>
        </div>
      )}
    </div>
  );
}

function ChartWidget({ widget }: { widget: DashboardWidget; data?: RealTimeDataState }) {
  // Placeholder for chart implementation
  return (
    <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
      <div className="text-center">
        <div className="text-4xl mb-2">📊</div>
        <p className="text-gray-600">Chart: {widget.config.type}</p>
        <p className="text-sm text-gray-500">Implementation pending</p>
      </div>
    </div>
  );
}

function TableWidget({ widget }: { widget: DashboardWidget; data?: RealTimeDataState }) {
  // Placeholder for table implementation
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {widget.config.columns?.map((column: string) => (
              <th key={column} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          <tr>
            <td colSpan={widget.config.columns?.length || 1} className="px-6 py-4 text-center text-gray-500">
              Data loading...
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function HeatmapWidget(_props: { widget?: DashboardWidget; data?: RealTimeDataState }) {
  return (
    <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
      <div className="text-center">
        <div className="text-4xl mb-2">🔥</div>
        <p className="text-gray-600">Heatmap</p>
        <p className="text-sm text-gray-500">Implementation pending</p>
      </div>
    </div>
  );
}

function FunnelWidget({ widget }: { widget: DashboardWidget; data?: RealTimeDataState }) {
  return (
    <div className="space-y-2">
      {widget.config.steps?.map((step: string, index: number) => (
        <div key={step} className="relative">
          <div
            className="bg-primary-100 text-primary-800 px-4 py-2 rounded text-sm font-medium"
            // eslint-disable-next-line react/forbid-dom-props
            style={{
              width: `${100 - (index * 10)}%`,
              marginLeft: `${(index * 10) / 2}%`
            }}
          >
            {step}: {Math.floor(Math.random() * 1000)} users
          </div>
        </div>
      ))}
    </div>
  );
}

// Utility functions
function formatValue(value: number, format: string): string {
  switch (format) {
    case 'number':
      return value.toLocaleString();
    case 'percentage':
      return `${value}%`;
    case 'currency':
      return `$${value.toLocaleString()}`;
    default:
      return value.toString();
  }
}