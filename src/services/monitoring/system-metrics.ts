/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import os from 'os';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { monitoringService } from './monitoring-service';
import { MetricUnit } from './cloudwatch-config';

const execPromise = promisify(exec);

/**
 * Utility for collecting and publishing system resource metrics
 */
export class SystemMetricsCollector {
  private isCollecting: boolean = false;
  private collectInterval: NodeJS.Timeout | null = null;
  private intervalMs: number = 60000; // Default: collect metrics every minute

  /**
   * Start collecting system metrics at specified interval
   * @param intervalMs Interval in milliseconds (default: 60000)
   */
  startCollecting(intervalMs: number = 60000): void {
    if (this.isCollecting) {
      return;
    }

    this.intervalMs = intervalMs;
    this.isCollecting = true;
    
    // Collect immediately on start
    this.collectAndPublishMetrics().catch(err => {
      console.error('Error collecting initial system metrics:', err);
    });

    // Then set up interval collection
    this.collectInterval = setInterval(() => {
      this.collectAndPublishMetrics().catch(err => {
        console.error('Error collecting system metrics:', err);
      });
    }, this.intervalMs);
  }

  /**
   * Stop collecting system metrics
   */
  stopCollecting(): void {
    if (this.collectInterval) {
      clearInterval(this.collectInterval);
      this.collectInterval = null;
    }
    this.isCollecting = false;
  }

  /**
   * Collect and publish system metrics
   */
  async collectAndPublishMetrics(): Promise<void> {
    try {
      // Get CPU usage
      const cpuUsage = await this.getCpuUsage();
      if (cpuUsage !== null) {
        await monitoringService.trackResourceUsage('Cpu', cpuUsage, MetricUnit.PERCENT);
      }

      // Get memory usage
      const memoryUsage = this.getMemoryUsage();
      await monitoringService.trackResourceUsage('Memory', memoryUsage, MetricUnit.PERCENT);

      // Get disk usage
      const diskUsage = await this.getDiskUsage();
      if (diskUsage !== null) {
        await monitoringService.trackResourceUsage('Disk', diskUsage, MetricUnit.PERCENT);
      }
    } catch (error) {
      console.error('Error collecting system metrics:', error);
    }
  }

  /**
   * Get CPU usage percentage
   * @returns CPU usage as a percentage or null if unable to determine
   */
  private async getCpuUsage(): Promise<number | null> {
    // First, try the cross-platform approach using os module
    try {
      // Get initial CPU info
      const initialCpuInfo = os.cpus();
      const initialIdle = initialCpuInfo.reduce((acc, cpu) => acc + cpu.times.idle, 0);
      const initialTotal = initialCpuInfo.reduce((acc, cpu) => 
        acc + cpu.times.idle + cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.irq, 0);
      
      // Wait a short period to measure difference
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get updated CPU info
      const currentCpuInfo = os.cpus();
      const currentIdle = currentCpuInfo.reduce((acc, cpu) => acc + cpu.times.idle, 0);
      const currentTotal = currentCpuInfo.reduce((acc, cpu) => 
        acc + cpu.times.idle + cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.irq, 0);
      
      // Calculate CPU usage percentage
      const idleDifference = currentIdle - initialIdle;
      const totalDifference = currentTotal - initialTotal;
      const cpuUsage = 100 - (idleDifference / totalDifference) * 100;
      
      return parseFloat(cpuUsage.toFixed(2));
    } catch (error) {
      console.error('Error calculating CPU usage from os module:', error);
      
      // Fallback: try platform-specific command
      try {
        if (process.platform === 'win32') {
          const { stdout } = await execPromise('wmic cpu get LoadPercentage');
          const cpuLoad = stdout.trim().split('\n')[1].trim();
          return parseFloat(cpuLoad);
        } else if (process.platform === 'linux' || process.platform === 'darwin') {
          const { stdout } = await execPromise("top -b -n 1 | grep 'Cpu(s)' | awk '{print $2}'");
          return parseFloat(stdout.trim());
        }
      } catch (fallbackError) {
        console.error('Error calculating CPU usage with fallback method:', fallbackError);
      }
      
      return null;
    }
  }

  /**
   * Get memory usage percentage
   * @returns Memory usage as a percentage
   */
  private getMemoryUsage(): number {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsage = (usedMemory / totalMemory) * 100;
    
    return parseFloat(memoryUsage.toFixed(2));
  }

  /**
   * Get disk usage percentage
   * @returns Disk usage as a percentage or null if unable to determine
   */
  private async getDiskUsage(): Promise<number | null> {
    try {
      if (process.platform === 'win32') {
        const { stdout } = await execPromise('wmic logicaldisk get size,freespace,caption');
        const lines = stdout.trim().split('\n').slice(1);
        
        let totalSize = 0;
        let totalFree = 0;
        
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 3) {
            const free = parseInt(parts[1], 10);
            const size = parseInt(parts[2], 10);
            
            if (!isNaN(free) && !isNaN(size)) {
              totalFree += free;
              totalSize += size;
            }
          }
        }
        
        if (totalSize > 0) {
          const usedPercentage = ((totalSize - totalFree) / totalSize) * 100;
          return parseFloat(usedPercentage.toFixed(2));
        }
      } else if (process.platform === 'linux' || process.platform === 'darwin') {
        // For Linux and macOS, use df command
        const { stdout } = await execPromise("df -k / | grep -v Filesystem | awk '{print $5}'");
        return parseFloat(stdout.trim().replace('%', ''));
      }
    } catch (error) {
      console.error('Error calculating disk usage:', error);
    }
    
    return null;
  }
}

// Singleton instance
export const systemMetricsCollector = new SystemMetricsCollector();