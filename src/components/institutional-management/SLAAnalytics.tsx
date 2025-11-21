import React, { useId } from 'react';

interface SLAAnalyticsProps {
  metrics: {
    averageCompletionWeeks?: number;
    withinDeadlinePercent?: number;
    activeCases?: number;
    breachCount?: number;
    upcomingDeadlines?: number;
  };
}

// Helper component to avoid inline styles
const ProgressBar = ({ progress, colorClass }: { progress: number, colorClass: string }) => {
  const id = useId().replace(/:/g, '');
  return (
    <>
      <style>{`
        .progress-${id} {
          width: ${progress}%;
        }
      `}</style>
      <div
        className={`h-1.5 rounded-full ${colorClass} progress-${id}`}
      />
    </>
  );
};

const SLAAnalytics: React.FC<SLAAnalyticsProps> = ({ metrics }) => {
  const {
    averageCompletionWeeks = 0,
    withinDeadlinePercent = 0,
    activeCases = 0,
    breachCount = 0,
    upcomingDeadlines = 0,
  } = metrics;

  return (
    <div className="bg-white p-6 rounded shadow mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">EHCP SLA Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Average Completion Time */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-600 font-semibold">Avg. Completion Time</p>
          <p className="text-2xl font-bold text-gray-900">{averageCompletionWeeks} weeks</p>
          <p className="text-xs text-gray-500 mt-1">Target: 20 weeks</p>
          <div className="w-full bg-blue-200 h-1.5 rounded-full mt-2">
            <ProgressBar
              progress={Math.min((averageCompletionWeeks / 25) * 100, 100)}
              colorClass={averageCompletionWeeks > 20 ? 'bg-red-500' : 'bg-blue-500'}
            />
          </div>
        </div>

        {/* Compliance Rate */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <p className="text-sm text-green-600 font-semibold">20-Week Compliance</p>
          <p className="text-2xl font-bold text-gray-900">{withinDeadlinePercent}%</p>
          <p className="text-xs text-gray-500 mt-1">Target: 95%</p>
          <div className="w-full bg-green-200 h-1.5 rounded-full mt-2">
            <ProgressBar
              progress={withinDeadlinePercent}
              colorClass={withinDeadlinePercent < 90 ? 'bg-red-500' : 'bg-green-500'}
            />
          </div>
        </div>

        {/* Active Cases */}
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <p className="text-sm text-purple-600 font-semibold">Active Cases</p>
          <p className="text-2xl font-bold text-gray-900">{activeCases}</p>
          <p className="text-xs text-gray-500 mt-1">In progress</p>
        </div>

        {/* Risk Alerts */}
        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <p className="text-sm text-red-600 font-semibold">Risk Alerts</p>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-2xl font-bold text-gray-900">{breachCount}</p>
              <p className="text-xs text-gray-500">Breaches</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-orange-600">{upcomingDeadlines}</p>
              <p className="text-xs text-gray-500">Due &lt; 2 weeks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SLAAnalytics;
