import { logger } from '@/lib/logger';

interface LoadBalancingOptions {
  algorithm?: 'round_robin' | 'least_connections' | 'ip_hash' | 'weighted';
  healthCheckInterval?: number;
  healthCheckTimeout?: number;
  maxConnectionsPerServer?: number;
  enableAutoScaling?: boolean;
  scalingThreshold?: number;
  sessionPersistence?: boolean;
  enableGeoRouting?: boolean;
}

interface ServerConfig {
  host: string;
  port: number;
  weight?: number;
  region?: string;
  maxConnections?: number;
  healthCheckPath?: string;
  tags?: string[];
}

interface Server {
  id: string;
  host: string;
  port: number;
  weight: number;
  region: string;
  maxConnections: number;
  healthCheckPath: string;
  tags: string[];
  status: 'unknown' | 'healthy' | 'unhealthy' | 'draining';
  lastHealthCheck: string | null;
  consecutiveFailures: number;
  activeConnections: number;
  totalRequests: number;
  responseTime: number;
  addedAt: string;
}

interface ServerStats {
  requestsPerMinute: number;
  errorRate: number;
  averageResponseTime: number;
  cpuUsage: number;
  memoryUsage: number;
}

interface Request {
  sessionId?: string;
  clientIP?: string;
  [key: string]: any;
}

interface RequestMetrics {
  responseTime?: number;
  error?: boolean;
}

interface ServerStatistics {
  id: string;
  host: string;
  port: number;
  status: string;
  region: string;
  activeConnections: number;
  totalRequests: number;
  averageResponseTime: number;
  weight: number;
}

interface LoadBalancingStatistics {
  totalServers: number;
  healthyServers: number;
  unhealthyServers: number;
  totalActiveConnections: number;
  averageConnectionsPerServer: number;
  algorithm: string;
  sessionPersistence: boolean;
  geoRouting: boolean;
  autoScaling: boolean;
  servers: ServerStatistics[];
}

export class LoadBalancingService {
  private options: Required<LoadBalancingOptions>;
  private servers: Map<string, Server>;
  private serverStats: Map<string, ServerStats>;
  private activeConnections: Map<string, number>;
  private sessionStore: Map<string, string>;
  private geoRoutes: Map<string, string[]>;
  private healthCheckInterval: NodeJS.Timeout | null;
  private scalingInterval: NodeJS.Timeout | null;
  private _roundRobinIndex: number;

  constructor(options: LoadBalancingOptions = {}) {
    this.options = {
      algorithm: options.algorithm || 'round_robin',
      healthCheckInterval: options.healthCheckInterval || 30000,
      healthCheckTimeout: options.healthCheckTimeout || 5000,
      maxConnectionsPerServer: options.maxConnectionsPerServer || 1000,
      enableAutoScaling: options.enableAutoScaling !== undefined ? options.enableAutoScaling : true,
      scalingThreshold: options.scalingThreshold || 0.8,
      sessionPersistence: options.sessionPersistence || false,
      enableGeoRouting: options.enableGeoRouting !== undefined ? options.enableGeoRouting : true,
    };

    this.servers = new Map();
    this.serverStats = new Map();
    this.activeConnections = new Map();
    this.sessionStore = new Map();
    this.geoRoutes = new Map();

    this.healthCheckInterval = null;
    this.scalingInterval = null;
    this._roundRobinIndex = 0;

    this._initialize();
  }

  private async _initialize(): Promise<void> {
    try {
      await this._setupDefaultServers();

      this.healthCheckInterval = setInterval(() => {
        this._performHealthChecks();
      }, this.options.healthCheckInterval);

      if (this.options.enableAutoScaling) {
        this.scalingInterval = setInterval(() => {
          this._checkScalingNeeds();
        }, 60000);
      }

      if (this.options.enableGeoRouting) {
        await this._setupGeoRouting();
      }

      logger.info('Load balancing service initialized');
    } catch (error) {
      logger.error('Error initializing load balancing service:', error);
    }
  }

  addServer(serverConfig: ServerConfig): string {
    try {
      const {
        host,
        port,
        weight = 1,
        region = 'default',
        maxConnections = this.options.maxConnectionsPerServer,
        healthCheckPath = '/health',
        tags = []
      } = serverConfig;

      const serverId = `server_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const server: Server = {
        id: serverId,
        host,
        port,
        weight,
        region,
        maxConnections,
        healthCheckPath,
        tags,
        status: 'unknown',
        lastHealthCheck: null,
        consecutiveFailures: 0,
        activeConnections: 0,
        totalRequests: 0,
        responseTime: 0,
        addedAt: new Date().toISOString()
      };

      this.servers.set(serverId, server);
      this.serverStats.set(serverId, {
        requestsPerMinute: 0,
        errorRate: 0,
        averageResponseTime: 0,
        cpuUsage: 0,
        memoryUsage: 0
      });
      this.activeConnections.set(serverId, 0);

      logger.info(`Added server: ${serverId} (${host}:${port})`);
      return serverId;
    } catch (error) {
      logger.error('Error adding server:', error);
      throw error;
    }
  }

  removeServer(serverId: string): boolean {
    try {
      if (!this.servers.has(serverId)) {
        return false;
      }

      const server = this.servers.get(serverId);
      if (server) {
        server.status = 'draining';
      }

      const drainCheck = setInterval(() => {
        const activeConns = this.activeConnections.get(serverId) || 0;
        if (activeConns === 0) {
          clearInterval(drainCheck);
          this._removeServerCompletely(serverId);
        }
      }, 5000);

      setTimeout(() => {
        clearInterval(drainCheck);
        this._removeServerCompletely(serverId);
      }, 300000);

      return true;
    } catch (error) {
      logger.error('Error removing server:', error);
      return false;
    }
  }

  getNextServer(request: Request = {}): Server | null {
    try {
      const availableServers = Array.from(this.servers.values())
        .filter(server => server.status === 'healthy');

      if (availableServers.length === 0) {
        logger.warn('No healthy servers available');
        return null;
      }

      let selectedServer: Server;

      switch (this.options.algorithm) {
        case 'round_robin':
          selectedServer = this._selectRoundRobin(availableServers);
          break;
        case 'least_connections':
          selectedServer = this._selectLeastConnections(availableServers);
          break;
        case 'ip_hash':
          selectedServer = this._selectIPHash(availableServers, request);
          break;
        case 'weighted':
          selectedServer = this._selectWeighted(availableServers);
          break;
        default:
          selectedServer = this._selectRoundRobin(availableServers);
      }

      if (this.options.sessionPersistence && request.sessionId) {
        const sessionServer = this.sessionStore.get(request.sessionId);
        if (sessionServer && availableServers.find(s => s.id === sessionServer)) {
          const found = this.servers.get(sessionServer);
          if (found) selectedServer = found;
        } else {
          this.sessionStore.set(request.sessionId, selectedServer.id);
        }
      }

      if (this.options.enableGeoRouting && request.clientIP) {
        const geoServer = this._getGeoServer(request.clientIP, availableServers);
        if (geoServer) {
          selectedServer = geoServer;
        }
      }

      const activeConns = this.activeConnections.get(selectedServer.id) || 0;
      if (activeConns >= selectedServer.maxConnections) {
        logger.warn(`Server ${selectedServer.id} at capacity, selecting alternative`);
        return this.getNextServer(request);
      }

      this.activeConnections.set(selectedServer.id, activeConns + 1);

      return selectedServer;
    } catch (error) {
      logger.error('Error selecting server:', error);
      return null;
    }
  }

  releaseConnection(serverId: string, metrics: RequestMetrics = {}): void {
    try {
      const activeConns = this.activeConnections.get(serverId) || 0;
      if (activeConns > 0) {
        this.activeConnections.set(serverId, activeConns - 1);
      }

      if (metrics.responseTime) {
        const server = this.servers.get(serverId);
        if (server) {
          server.totalRequests++;
          server.responseTime = ((server.responseTime * (server.totalRequests - 1)) + metrics.responseTime) / server.totalRequests;
        }
      }

      const stats = this.serverStats.get(serverId);
      if (stats && metrics) {
        if (metrics.error) {
          stats.errorRate = ((stats.errorRate * 0.9) + 0.1);
        }
        if (metrics.responseTime) {
          stats.averageResponseTime = ((stats.averageResponseTime * 0.9) + (metrics.responseTime * 0.1));
        }
      }

    } catch (error) {
      logger.error('Error releasing connection:', error);
    }
  }

  getStatistics(): LoadBalancingStatistics {
    try {
      const servers = Array.from(this.servers.values());
      const totalServers = servers.length;
      const healthyServers = servers.filter(s => s.status === 'healthy').length;
      const totalActiveConnections = Array.from(this.activeConnections.values())
        .reduce((sum, conns) => sum + conns, 0);

      const stats: LoadBalancingStatistics = {
        totalServers,
        healthyServers,
        unhealthyServers: totalServers - healthyServers,
        totalActiveConnections,
        averageConnectionsPerServer: totalServers > 0 ? totalActiveConnections / totalServers : 0,
        algorithm: this.options.algorithm,
        sessionPersistence: this.options.sessionPersistence,
        geoRouting: this.options.enableGeoRouting,
        autoScaling: this.options.enableAutoScaling,
        servers: servers.map(server => ({
          id: server.id,
          host: server.host,
          port: server.port,
          status: server.status,
          region: server.region,
          activeConnections: this.activeConnections.get(server.id) || 0,
          totalRequests: server.totalRequests,
          averageResponseTime: Math.round(server.responseTime),
          weight: server.weight
        }))
      };

      return stats;
    } catch (error) {
      logger.error('Error getting statistics:', error);
      throw error;
    }
  }

  async scaleUp(count: number = 1): Promise<string[]> {
    try {
      const addedServers: string[] = [];

      for (let i = 0; i < count; i++) {
        const serverConfig: ServerConfig = {
          host: `server-${Date.now()}-${i}`,
          port: 3000,
          region: 'auto-scaled',
          tags: ['auto-scaled']
        };

        const serverId = this.addServer(serverConfig);
        addedServers.push(serverId);

        logger.info(`Auto-scaled up: added server ${serverId}`);
      }

      return addedServers;
    } catch (error) {
      logger.error('Error scaling up:', error);
      throw error;
    }
  }

  async scaleDown(count: number = 1): Promise<string[]> {
    try {
      const removableServers = Array.from(this.servers.values())
        .filter(server => server.tags.includes('auto-scaled') && server.status === 'healthy')
        .sort((a, b) => (this.activeConnections.get(a.id) || 0) - (this.activeConnections.get(b.id) || 0))
        .slice(0, count);

      const removedServers: string[] = [];

      for (const server of removableServers) {
        await this.removeServer(server.id);
        removedServers.push(server.id);
        logger.info(`Auto-scaled down: removed server ${server.id}`);
      }

      return removedServers;
    } catch (error) {
      logger.error('Error scaling down:', error);
      throw error;
    }
  }

  private async _setupDefaultServers(): Promise<void> {
    try {
      const defaultServers: ServerConfig[] = [
        { host: 'app-server-1', port: 3000, region: 'us-east-1', weight: 1 },
        { host: 'app-server-2', port: 3000, region: 'us-east-1', weight: 1 },
        { host: 'app-server-3', port: 3000, region: 'eu-west-1', weight: 1 }
      ];

      for (const server of defaultServers) {
        this.addServer(server);
      }

      logger.info(`Set up ${defaultServers.length} default servers`);
    } catch (error) {
      logger.error('Error setting up default servers:', error);
    }
  }

  private async _performHealthChecks(): Promise<void> {
    try {
      const healthCheckPromises = Array.from(this.servers.values())
        .map(server => this._checkServerHealth(server));

      await Promise.allSettled(healthCheckPromises);
    } catch (error) {
      logger.error('Error performing health checks:', error);
    }
  }

  private async _checkServerHealth(server: Server): Promise<void> {
    try {
      const startTime = Date.now();
      const isHealthy = await this._performHealthCheckRequest(server);
      const responseTime = Date.now() - startTime;

      if (isHealthy) {
        server.status = 'healthy';
        server.consecutiveFailures = 0;
        server.lastHealthCheck = new Date().toISOString();
        server.responseTime = responseTime;
      } else {
        server.consecutiveFailures++;
        server.lastHealthCheck = new Date().toISOString();

        if (server.consecutiveFailures >= 3) {
          server.status = 'unhealthy';
          logger.warn(`Server ${server.id} marked as unhealthy after ${server.consecutiveFailures} failures`);
        }
      }

    } catch (error) {
      logger.error(`Health check failed for server ${server.id}:`, error);
      server.consecutiveFailures++;
      server.status = server.consecutiveFailures >= 3 ? 'unhealthy' : server.status;
    }
  }

  private async _performHealthCheckRequest(_server: Server): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Math.random() < 0.95);
      }, Math.random() * 1000 + 500);
    });
  }

  private async _checkScalingNeeds(): Promise<void> {
    try {
      const stats = this.getStatistics();
      const healthyServers = stats.healthyServers;
      const avgConnectionsPerServer = stats.averageConnectionsPerServer;

      const utilizationRate = healthyServers > 0 ? avgConnectionsPerServer / this.options.maxConnectionsPerServer : 0;

      if (utilizationRate > this.options.scalingThreshold) {
        logger.info(`High utilization detected (${(utilizationRate * 100).toFixed(1)}%), scaling up`);
        await this.scaleUp(1);
      } else if (utilizationRate < 0.3 && healthyServers > 1) {
        logger.info(`Low utilization detected (${(utilizationRate * 100).toFixed(1)}%), considering scale down`);
        const autoScaledCount = Array.from(this.servers.values())
          .filter(s => s.tags.includes('auto-scaled') && s.status === 'healthy').length;

        if (autoScaledCount > 0) {
          await this.scaleDown(1);
        }
      }

    } catch (error) {
      logger.error('Error checking scaling needs:', error);
    }
  }

  private async _setupGeoRouting(): Promise<void> {
    try {
      this.geoRoutes.set('NA', ['us-east-1', 'us-west-2']);
      this.geoRoutes.set('EU', ['eu-west-1', 'eu-central-1']);
      this.geoRoutes.set('AS', ['ap-southeast-1', 'ap-northeast-1']);

      logger.info('Geo-routing configured');
    } catch (error) {
      logger.error('Error setting up geo-routing:', error);
    }
  }

  private _selectRoundRobin(servers: Server[]): Server {
    const server = servers[this._roundRobinIndex % servers.length];
    this._roundRobinIndex++;
    return server;
  }

  private _selectLeastConnections(servers: Server[]): Server {
    let selectedServer = servers[0];
    let minConnections = this.activeConnections.get(selectedServer.id) || 0;

    for (const server of servers) {
      const connections = this.activeConnections.get(server.id) || 0;
      if (connections < minConnections) {
        minConnections = connections;
        selectedServer = server;
      }
    }

    return selectedServer;
  }

  private _selectIPHash(servers: Server[], request: Request): Server {
    if (!request.clientIP) {
      return this._selectRoundRobin(servers);
    }

    let hash = 0;
    for (let i = 0; i < request.clientIP.length; i++) {
      hash = ((hash << 5) - hash) + request.clientIP.charCodeAt(i);
      hash = hash & hash;
    }

    const index = Math.abs(hash) % servers.length;
    return servers[index];
  }

  private _selectWeighted(servers: Server[]): Server {
    const totalWeight = servers.reduce((sum, server) => sum + server.weight, 0);
    let random = Math.random() * totalWeight;

    for (const server of servers) {
      random -= server.weight;
      if (random <= 0) {
        return server;
      }
    }

    return servers[0];
  }

  private _getGeoServer(clientIP: string, servers: Server[]): Server | null {
    const region = this._getRegionFromIP(clientIP);
    const regionalServers = servers.filter(server => server.region === region);

    if (regionalServers.length > 0) {
      return this._selectRoundRobin(regionalServers);
    }

    return null;
  }

  private _getRegionFromIP(ip: string): string {
    const firstOctet = parseInt(ip.split('.')[0]);

    if (firstOctet >= 1 && firstOctet <= 126) return 'NA';
    if (firstOctet >= 128 && firstOctet <= 191) return 'EU';
    if (firstOctet >= 192 && firstOctet <= 223) return 'AS';

    return 'default';
  }

  private _removeServerCompletely(serverId: string): void {
    this.servers.delete(serverId);
    this.serverStats.delete(serverId);
    this.activeConnections.delete(serverId);

    logger.info(`Completely removed server: ${serverId}`);
  }

  async shutdown(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    if (this.scalingInterval) {
      clearInterval(this.scalingInterval);
    }

    logger.info('Load balancing service shut down');
  }
}
