/**
 * Performance monitoring utilities
 */

export interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
}

/**
 * Get current performance metrics (CPU and Memory usage)
 * Works in both Node.js and browser environments (with limitations)
 * @returns {PerformanceMetrics} Current metrics
 */
export function getPerformanceMetrics(): PerformanceMetrics {
  // Node.js environment
  if (typeof process !== 'undefined' && process.cpuUsage && process.memoryUsage) {
    const mem = process.memoryUsage();
    const cpu = process.cpuUsage();
    
    return {
      // Total CPU time in milliseconds
      cpuUsage: (cpu.user + cpu.system) / 1000,
      // Heap used in bytes
      memoryUsage: mem.heapUsed
    };
  }
  
  // Browser environment
  if (typeof performance !== 'undefined') {
    const memory = (performance as any).memory;
    
    return {
      // In browser, we can't easily get CPU usage per process, so we return 0 or timestamp
      cpuUsage: performance.now(),
      // Chrome-specific memory API
      memoryUsage: memory ? memory.usedJSHeapSize : 0
    };
  }

  return {
    cpuUsage: 0,
    memoryUsage: 0
  };
}
