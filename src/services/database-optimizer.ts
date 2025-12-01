import { logger } from "@/lib/logger";
/**
 * Database Optimization Service
 * Comprehensive database query optimization and connection management
 */

export interface QueryMetrics {
  query: string;
  duration: number;
  timestamp: Date;
  rowsAffected: number;
  connectionId: string;
  database: string;
  isSlow: boolean;
  optimizationScore: number;
  recommendations: string[];
}

export interface ConnectionPoolMetrics {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingClients: number;
  maxConnections: number;
  utilizationRate: number;
}

export interface DatabaseConfig {
  connectionPool: {
    min: number;
    max: number;
    idleTimeoutMillis: number;
    connectionTimeoutMillis: number;
    acquireTimeoutMillis: number;
  };
  queryTimeout: number;
  slowQueryThreshold: number;
  enableQueryLogging: boolean;
  enableConnectionPooling: boolean;
  enableReadReplicas: boolean;
  readReplicaUrls: string[];
}

export interface OptimizationRecommendation {
  id: string;
  type: 'index' | 'query' | 'connection' | 'config' | 'schema';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  sql?: string;
  beforeQuery?: string;
  afterQuery?: string;
}

export class DatabaseOptimizer {
  private static instance: DatabaseOptimizer;
  private queryMetrics: QueryMetrics[] = [];
  private config: DatabaseConfig = {
    connectionPool: {
      min: 2,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      acquireTimeoutMillis: 60000
    },
    queryTimeout: 30000,
    slowQueryThreshold: 1000, // 1 second
    enableQueryLogging: true,
    enableConnectionPooling: true,
    enableReadReplicas: false,
    readReplicaUrls: []
  };

  private optimizationRules = {
    missingIndex: /\bWHERE\s+\w+\s*=\s*[\?\$\w]+/g,
    sequentialScan: /SELECT\s+\*\s+FROM/g,
    subqueryOptimization: /SELECT.*FROM.*WHERE.*IN\s*\(\s*SELECT/g,
    joinOptimization: /INNER\s+JOIN|LEFT\s+JOIN|RIGHT\s+JOIN/g,
    groupByOptimization: /GROUP\s+BY/g,
    orderByOptimization: /ORDER\s+BY/g
  };

  private constructor() {
    this.initializeQueryMonitoring();
  }

  static getInstance(): DatabaseOptimizer {
    if (!DatabaseOptimizer.instance) {
      DatabaseOptimizer.instance = new DatabaseOptimizer();
    }
    return DatabaseOptimizer.instance;
  }

  /**
   * Initialize query monitoring and optimization
   */
  private initializeQueryMonitoring(): void {
    // This would typically wrap database queries
    // For demonstration, we'll create a monitoring wrapper
    this.setupQueryInterceptor();
  }

  /**
   * Setup query interception for monitoring
   */
  private setupQueryInterceptor(): void {
    // This is a simplified version - in production, this would integrate with the actual database client
    // For demonstration purposes only - this would normally integrate with the database client
    const globalAny = global as any;
    const originalQuery = globalAny.query;
    if (originalQuery) {
      globalAny.query = this.wrapQuery(originalQuery);
    }
  }

  /**
   * Wrap database queries with monitoring
   */
  private wrapQuery(originalQuery: (...args: any[]) => Promise<any>): (...args: any[]) => Promise<any> {
    return async (query: string, params?: any[], options?: any) => {
      const startTime = Date.now();
      const connectionId = this.generateConnectionId();

      try {
        const result = await originalQuery(query, params, options);
        const duration = Date.now() - startTime;

        this.recordQueryMetrics({
          query,
          duration,
          timestamp: new Date(),
          rowsAffected: result?.rowCount || result?.affectedRows || 0,
          connectionId,
          database: options?.database || 'default',
          isSlow: duration > this.config.slowQueryThreshold,
          optimizationScore: this.calculateOptimizationScore(query, duration),
          recommendations: this.generateQueryRecommendations(query)
        });

        return result;
      } catch (_error) {
        const duration = Date.now() - startTime;

        this.recordQueryMetrics({
          query,
          duration,
          timestamp: new Date(),
          rowsAffected: 0,
          connectionId,
          database: options?.database || 'default',
          isSlow: true,
          optimizationScore: 0,
          recommendations: ['Query failed - check syntax and permissions']
        });

        throw _error;
      }
    };
  }

  /**
   * Record query metrics
   */
  private recordQueryMetrics(metrics: QueryMetrics): void {
    this.queryMetrics.push(metrics);

    // Keep only recent metrics (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.queryMetrics = this.queryMetrics.filter(m => m.timestamp >= oneDayAgo);

    // Log slow queries
    if (metrics.isSlow) {
      logger.warn('Slow query detected:', {
        query: metrics.query.substring(0, 100) + '...',
        duration: metrics.duration,
        recommendations: metrics.recommendations
      });
    }

    // Log queries with low optimization scores
    if (metrics.optimizationScore < 50) {
      logger.info('Query optimization opportunity:', {
        query: metrics.query.substring(0, 100) + '...',
        score: metrics.optimizationScore,
        recommendations: metrics.recommendations
      });
    }
  }

  /**
   * Calculate optimization score for a query
   */
  private calculateOptimizationScore(query: string, duration: number): number {
    let score = 100;

    // Check for missing indexes
    if (this.optimizationRules.missingIndex.test(query)) {
      score -= 20;
    }

    // Check for SELECT * (inefficient)
    if (this.optimizationRules.sequentialScan.test(query)) {
      score -= 15;
    }

    // Check for subquery optimization opportunities
    if (this.optimizationRules.subqueryOptimization.test(query)) {
      score -= 10;
    }

    // Check for complex joins without proper indexing
    const joinMatches = query.match(this.optimizationRules.joinOptimization);
    if (joinMatches && joinMatches.length > 3) {
      score -= 15;
    }

    // Check for GROUP BY without proper indexing
    if (this.optimizationRules.groupByOptimization.test(query)) {
      score -= 10;
    }

    // Check for ORDER BY without proper indexing
    if (this.optimizationRules.orderByOptimization.test(query)) {
      score -= 10;
    }

    // Penalize long-running queries
    if (duration > 5000) {
      score -= 20;
    } else if (duration > 2000) {
      score -= 10;
    }

    return Math.max(0, score);
  }

  /**
   * Generate optimization recommendations for a query
   */
  private generateQueryRecommendations(query: string): string[] {
    const recommendations: string[] = [];

    if (this.optimizationRules.missingIndex.test(query)) {
      recommendations.push('Consider adding database indexes for WHERE clause columns');
    }

    if (this.optimizationRules.sequentialScan.test(query)) {
      recommendations.push('Avoid SELECT * - specify only needed columns');
    }

    if (this.optimizationRules.subqueryOptimization.test(query)) {
      recommendations.push('Consider using JOIN instead of subquery for better performance');
    }

    const joinMatches = query.match(this.optimizationRules.joinOptimization);
    if (joinMatches && joinMatches.length > 3) {
      recommendations.push('Complex joins detected - consider query refactoring or denormalization');
    }

    if (this.optimizationRules.groupByOptimization.test(query)) {
      recommendations.push('Ensure GROUP BY columns are properly indexed');
    }

    if (this.optimizationRules.orderByOptimization.test(query)) {
      recommendations.push('Ensure ORDER BY columns are properly indexed');
    }

    if (query.length > 1000) {
      recommendations.push('Query is very long - consider breaking into smaller queries');
    }

    return recommendations;
  }

  /**
   * Get connection pool metrics
   */
  getConnectionPoolMetrics(): ConnectionPoolMetrics {
    // This would typically query the actual connection pool
    // For demonstration, return mock data
    return {
      totalConnections: 15,
      activeConnections: 8,
      idleConnections: 7,
      waitingClients: 0,
      maxConnections: this.config.connectionPool.max,
      utilizationRate: (8 / 15) * 100
    };
  }

  /**
   * Get slow queries
   */
  getSlowQueries(threshold: number = this.config.slowQueryThreshold): QueryMetrics[] {
    return this.queryMetrics
      .filter(m => m.duration > threshold)
      .sort((a, b) => b.duration - a.duration);
  }

  /**
   * Get queries with low optimization scores
   */
  getOptimizationOpportunities(minScore: number = 70): QueryMetrics[] {
    return this.queryMetrics
      .filter(m => m.optimizationScore < minScore)
      .sort((a, b) => a.optimizationScore - b.optimizationScore);
  }

  /**
   * Generate comprehensive optimization recommendations
   */
  generateOptimizationRecommendations(): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    const slowQueries = this.getSlowQueries();
    const optimizationOpportunities = this.getOptimizationOpportunities();

    // Index recommendations
    slowQueries.forEach((query, index) => {
      if (query.optimizationScore < 60) {
        recommendations.push({
          id: `index-${index}`,
          type: 'index',
          priority: query.duration > 5000 ? 'high' : 'medium',
          description: `Add indexes for slow query: ${query.query.substring(0, 50)}...`,
          impact: 'Significant performance improvement',
          effort: 'medium',
          sql: this.generateIndexSQL(query.query)
        });
      }
    });

    // Query optimization recommendations
    optimizationOpportunities.forEach((query, index) => {
      recommendations.push({
        id: `query-${index}`,
        type: 'query',
        priority: query.optimizationScore < 30 ? 'high' : 'medium',
        description: `Optimize query: ${query.query.substring(0, 50)}...`,
        impact: 'Improved query performance',
        effort: 'low',
        beforeQuery: query.query,
        afterQuery: this.optimizeQuery(query.query)
      });
    });

    // Connection pool recommendations
    const poolMetrics = this.getConnectionPoolMetrics();
    if (poolMetrics.utilizationRate > 80) {
      recommendations.push({
        id: 'connection-pool',
        type: 'connection',
        priority: 'medium',
        description: 'High connection pool utilization detected',
        impact: 'Better connection management',
        effort: 'low'
      });
    }

    // Configuration recommendations
    if (this.config.slowQueryThreshold < 2000) {
      recommendations.push({
        id: 'config-threshold',
        type: 'config',
        priority: 'low',
        description: 'Consider adjusting slow query threshold',
        impact: 'Better performance monitoring',
        effort: 'low'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Generate index SQL for a query
   */
  private generateIndexSQL(query: string): string {
    // This is a simplified example - in production, this would be more sophisticated
    const tableMatch = query.match(/FROM\s+(\w+)/i);
    const whereMatch = query.match(/WHERE\s+(\w+)\s*=\s*[\?\$\w]+/);

    if (tableMatch && whereMatch) {
      return `CREATE INDEX idx_${tableMatch[1]}_${whereMatch[1]} ON ${tableMatch[1]} (${whereMatch[1]});`;
    }

    return '-- Index creation SQL would be generated here';
  }

  /**
   * Optimize a query
   */
  private optimizeQuery(query: string): string {
    // This is a simplified example - in production, this would use a proper SQL parser
    let optimized = query;

    // Replace SELECT * with specific columns (simplified)
    if (optimized.includes('SELECT *')) {
      optimized = optimized.replace('SELECT *', 'SELECT id, name, created_at');
    }

    return optimized;
  }

  /**
   * Get database configuration
   */
  getConfig(): DatabaseConfig {
    return { ...this.config };
  }

  /**
   * Update database configuration
   */
  updateConfig(updates: Partial<DatabaseConfig>): void {
    this.config = { ...this.config, ...updates };
    logger.info('Database configuration updated');
  }

  /**
   * Generate database performance report
   */
  generatePerformanceReport(): {
    summary: {
      totalQueries: number;
      slowQueries: number;
      averageQueryTime: number;
      optimizationScore: number;
    };
    connectionPool: ConnectionPoolMetrics;
    recommendations: OptimizationRecommendation[];
    slowQueries: QueryMetrics[];
  } {
    const totalQueries = this.queryMetrics.length;
    const slowQueries = this.getSlowQueries().length;
    const averageQueryTime = this.queryMetrics.reduce((sum, m) => sum + m.duration, 0) / totalQueries || 0;
    const averageOptimizationScore = this.queryMetrics.reduce((sum, m) => sum + m.optimizationScore, 0) / totalQueries || 0;

    return {
      summary: {
        totalQueries,
        slowQueries,
        averageQueryTime,
        optimizationScore: averageOptimizationScore
      },
      connectionPool: this.getConnectionPoolMetrics(),
      recommendations: this.generateOptimizationRecommendations(),
      slowQueries: this.getSlowQueries()
    };
  }

  /**
   * Generate connection ID for tracking
   */
  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clean up old metrics
   */
  cleanup(): void {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    this.queryMetrics = this.queryMetrics.filter(m => m.timestamp >= oneWeekAgo);
  }

  /**
   * Export optimization data
   */
  exportData(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['timestamp', 'query', 'duration', 'rowsAffected', 'isSlow', 'optimizationScore', 'recommendations'];
      const rows = this.queryMetrics.map(metric => [
        metric.timestamp.toISOString(),
        metric.query.substring(0, 100),
        metric.duration.toString(),
        metric.rowsAffected.toString(),
        metric.isSlow.toString(),
        metric.optimizationScore.toString(),
        JSON.stringify(metric.recommendations)
      ]);

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    return JSON.stringify(this.queryMetrics, null, 2);
  }
}

// Export singleton instance
export const databaseOptimizer = DatabaseOptimizer.getInstance();
