/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const dynamic = 'force-dynamic';

/**
 * Health Dashboard API Endpoint
 * 
 * This endpoint provides a comprehensive health status dashboard for monitoring
 * the application's deployment health, performance, and configuration.
 * 
 * Features:
 * - Current deployment information
 * - System health status
 * - Environment variables status
 * - Recent verification reports
 * - Performance metrics
 */
export async function GET() {
  const timestamp = new Date().toISOString();
  
  // Basic system information
  const systemInfo = {
    timestamp,
    hostname: os.hostname(),
    platform: process.platform,
    uptime: process.uptime(),
    memory: {
      total: os.totalmem(),
      free: os.freemem(),
      usage: (1 - os.freemem() / os.totalmem()) * 100
    },
    cpus: os.cpus().length
  };

  // Deployment information
  const deploymentInfo = {
    version: process.env.NEXT_PUBLIC_GIT_COMMIT || 'unknown',
    environment: process.env.NEXT_PUBLIC_APP_ENV || 'unknown',
    deploymentTimestamp: process.env.NEXT_PUBLIC_DEPLOYMENT_TIMESTAMP || 'unknown',
    buildNumber: process.env.NEXT_PUBLIC_BUILD_NUMBER || 'unknown',
    branch: process.env.NEXT_PUBLIC_GIT_BRANCH || 'unknown',
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'unknown'
  };
  
  // Check for critical environment variables
  const requiredVars = [
    'NEXT_PUBLIC_DEPLOYMENT_TIMESTAMP',
    'NEXT_PUBLIC_APP_ENV',
    'NEXT_PUBLIC_BASE_URL'
  ];
  
  const envStatus = {
    missing: requiredVars.filter(key => !process.env[key]),
    status: 'healthy'
  };
  
  if (envStatus.missing.length > 0) {
    envStatus.status = 'degraded';
  }
  
  // Calculate deployment age
  let deploymentAge = null;
  if (process.env.NEXT_PUBLIC_DEPLOYMENT_TIMESTAMP) {
    try {
      const deployTime = new Date(process.env.NEXT_PUBLIC_DEPLOYMENT_TIMESTAMP);
      const now = new Date();
      deploymentAge = {
        ms: now.getTime() - deployTime.getTime(),
        seconds: (now.getTime() - deployTime.getTime()) / 1000,
        minutes: (now.getTime() - deployTime.getTime()) / (1000 * 60),
        hours: (now.getTime() - deployTime.getTime()) / (1000 * 60 * 60),
        days: (now.getTime() - deployTime.getTime()) / (1000 * 60 * 60 * 24)
      };
    } catch (_error) {
      console._error('Error calculating deployment age:', _error);
    }
  }
  
  // Overall health status
  let healthStatus = 'healthy';
  let statusMessage = 'System is healthy';
  
  if (envStatus.missing.length > 0) {
    healthStatus = 'degraded';
    statusMessage = 'Missing environment variables';
  }
  
  if (deploymentAge && deploymentAge.days > 7) {
    healthStatus = 'warning';
    statusMessage = 'Deployment is more than 7 days old';
  }
  
  // Check for verification reports
  const reports = [];
  try {
    const dataDir = path.join(process.cwd(), '.verification');
    if (fs.existsSync(dataDir)) {
      const files = fs.readdirSync(dataDir)
        .filter(f => f.endsWith('.json'))
        .sort()
        .reverse()
        .slice(0, 10);
      
      for (const file of files) {
        try {
          const content = fs.readFileSync(path.join(dataDir, file), 'utf-8');
          reports.push(JSON.parse(content));
        } catch (_error) {
          console._error(`Error reading file ${file}:`, _error);
        }
      }
    }
  } catch (_error) {
    console._error('Error reading verification reports:', _error);
  }
  
  // Performance metrics - just placeholders for now
  // In a real implementation, these would be populated with actual metrics
  const performanceMetrics = {
    averageResponseTime: 123, // ms
    p95ResponseTime: 245,     // ms
    p99ResponseTime: 500,     // ms
    requestsPerMinute: 120,
    errorRate: 0.02           // 2%
  };
  
  // Assemble final response
  const response = {
    status: healthStatus,
    message: statusMessage,
    timestamp,
    system: systemInfo,
    deployment: deploymentInfo,
    environment: envStatus,
    deploymentAge,
    performance: performanceMetrics,
    recentReports: reports.length > 0 ? reports : undefined
  };
  
  // Set appropriate status code
  const statusCode = healthStatus === 'healthy' ? 200 : 
                    healthStatus === 'degraded' ? 207 : 
                    healthStatus === 'warning' ? 203 : 500;
  
  // Add cache control headers to prevent caching
  return NextResponse.json(response, {
    status: statusCode,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    }
  });
}