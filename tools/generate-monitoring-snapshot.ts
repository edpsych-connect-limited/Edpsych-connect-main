
import { advancedMonitoring } from '../src/lib/monitoring/advanced-monitoring';
import fs from 'fs';
import path from 'path';

async function generateSnapshot() {
  console.log('Generating monitoring snapshot...');

  // Simulate collection over time (e.g., 5 simulation steps)
  console.log('Simulating metric collection...');
  for (let i = 0; i < 5; i++) {
    await advancedMonitoring.collectMetrics();
    // No need to sleep real time, just sequential calls to populate valid history
  }

  const dashboardData = await advancedMonitoring.getDashboardData();
  const summary = advancedMonitoring.getMonitoringSummary();
  
  // Format for markdown inclusion
  const snapshot = {
    generatedAt: new Date().toISOString(),
    status: dashboardData.status,
    uptime: dashboardData.uptime,
    metrics: dashboardData.metrics,
    activeAlerts: dashboardData.activeAlerts,
    trends: dashboardData.trends,
    summary: summary
  };

  const outputPath = path.join(process.cwd(), 'monitoring_snapshot_data.json');
  fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2));

  console.log(`Snapshot generated at: ${outputPath}`);
  
  // Also print a summary for immediate use
  console.log('--- System Status ---');
  console.log(JSON.stringify(dashboardData.status, null, 2));
}

generateSnapshot().catch(err => {
  console.error('Failed to generate snapshot:', err);
  process.exit(1);
});
