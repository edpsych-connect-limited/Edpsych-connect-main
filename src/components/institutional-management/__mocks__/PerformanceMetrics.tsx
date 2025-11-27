/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';

const MockPerformanceMetrics: React.FC<any> = ({ id, metrics, isLoading, error }) => {
  if (isLoading) {
    return <div>Loading performance data...</div>;
  }
  
  if (error) {
    return (
      <div>
        <div>Failed to load performance data: {error}</div>
        <button>Retry</button>
      </div>
    );
  }
  
  if (!metrics) {
    return <div>No performance data available</div>;
  }
  
  return (
    <div>
      <h2>Performance Metrics</h2>
      <div>
        <div>156</div> {/* Assessment Completions */}
        <div>78.5%</div> {/* Average Score */}
        <div>450</div> {/* Student Count */}
        <div>94%</div> {/* Completion Rate */}
        <div>12%</div> {/* Assessment completions trend */}
      </div>
      
      <div>
        <h3>Performance Trends</h3>
        <div data-testid="line-chart">Line Chart</div>
      </div>
      
      <div>
        <h3>Subject Performance</h3>
        <div data-testid="bar-chart">Bar Chart</div>
      </div>
      
      <div>
        <h3>Benchmarking</h3>
        <div>Your Institution</div>
        <div>District Average</div>
        <div>National Average</div>
        <div data-testid="doughnut-chart">Doughnut Chart</div>
      </div>
      
      <div>
        <h4>Last 6 Months</h4>
      </div>
    </div>
  );
};

export default MockPerformanceMetrics;