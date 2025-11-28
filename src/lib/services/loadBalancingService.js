/**
 * Load Balancing Service
 *
 * This service provides comprehensive load balancing and scaling capabilities:
 * - Intelligent request distribution
 * - Health monitoring and failover
 * - Auto-scaling based on load
 * - Geographic load balancing
 * - Session persistence
 * - Traffic shaping and rate limiting
 */
import { logger } from '@/lib/logger';


class LoadBalancingService {
  constructor(options = {}) {
    this.options = {
      algorithm: options.algorithm || 'round_robin', // round_robin, least_connections, ip_hash, weighted
      healthCheckInterval: options.healthCheckInterval || 30000, // 30 seconds
      healthCheckTimeout: options.healthCheckTimeout || 5000, // 5 seconds
      maxConnectionsPerServer: options.maxConnectionsPerServer || 1000,
      enableAutoScaling: options.enableAutoScaling || true,
      scalingThreshold: options.scalingThreshold || 0.8, // 80% utilization
      sessionPersistence: options.sessionPersistence || false,
      enableGeoRouting: options.enableGeoRouting || true,
      ...options
    };

    this.servers = new Map();
    this.serverStats = new Map();
    this.activeConnections = new Map();
    this.sessionStore = new Map();
    this.geoRoutes = new Map();

    this.healthCheckInterval = null;
    this.scalingInterval = null;

    this._initialize();
  }

  /**
   * Initialize the load balancing service
   */
  async _initialize() {
    try {
      // Set up default servers
      await this._setupDefaultServers();

      // Start health monitoring
      this.healthCheckInterval = setInterval(() => {
        this._performHealthChecks();
      }, this.options.healthCheckInterval);

      // Start auto-scaling if enabled
      if (this.options.enableAutoScaling) {
        this.scalingInterval = setInterval(() => {
          this._checkScalingNeeds();
        }, 60000); // Check every minute
      }

      // Set up geo-routing if enabled
      if (this.options.enableGeoRouting) {
        await this._setupGeoRouting();
      }

      logger.info('Load balancing service initialized');
    } catch (error) {
      logger.error('Error initializing load balancing service:', error);
    }
  }

  /**
   * Add server to load balancer
   *
   * @param {Object} serverConfig - Server configuration
   * @returns {string} Server ID
   */
  addServer(serverConfig) {
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

      const server = {
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

  /**
   * Remove server from load balancer
   *
   * @param {string} serverId - Server ID
   * @returns {boolean} Success status
   */
  removeServer(serverId) {
    try {
      if (!this.servers.has(serverId)) {
        return false;
      }

      // Gracefully drain connections
      const server = this.servers.get(serverId);
      server.status = 'draining';

      // Wait for active connections to drop to zero
      const drainCheck = setInterval(() => {
        const activeConns = this.activeConnections.get(serverId) || 0;
        if (activeConns === 0) {
          clearInterval(drainCheck);
          this._removeServerCompletely(serverId);
        }
      }, 5000); // Check every 5 seconds

      // Force removal after 5 minutes
      setTimeout(() => {
        clearInterval(drainCheck);
        this._removeServerCompletely(serverId);
      }, 300000); // 5 minutes

      return true;
    } catch (error) {
      logger.error('Error removing server:', error);
      return false;
    }
  }

  /**
   * Get next server for request
   *
   * @param {Object} request - Request object
   * @returns {Object|null} Selected server
   */
  getNextServer(request = {}) {
    try {
      const availableServers = Array.from(this.servers.values())
        .filter(server => server.status === 'healthy');

      if (availableServers.length === 0) {
        logger.warn('No healthy servers available');
        return null;
      }

      let selectedServer;

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

      // Handle session persistence
      if (this.options.sessionPersistence && request.sessionId) {
        const sessionServer = this.sessionStore.get(request.sessionId);
        if (sessionServer && availableServers.find(s => s.id === sessionServer)) {
          selectedServer = this.servers.get(sessionServer);
        } else {
          this.sessionStore.set(request.sessionId, selectedServer.id);
        }
      }

      // Handle geo-routing
      if (this.options.enableGeoRouting && request.clientIP) {
        const geoServer = this._getGeoServer(request.clientIP, availableServers);
        if (geoServer) {
          selectedServer = geoServer;
        }
      }

      // Check server capacity
      const activeConns = this.activeConnections.get(selectedServer.id) || 0;
      if (activeConns >= selectedServer.maxConnections) {
        logger.warn(`Server ${selectedServer.id} at capacity, selecting alternative`);
        return this.getNextServer(request); // Recursive call to get alternative
      }

      // Increment active connections
      this.activeConnections.set(selectedServer.id, activeConns + 1);

      return selectedServer;
    } catch (error) {
      logger.error('Error selecting server:', error);
      return null;
    }
  }

  /**
   * Release server connection
   *
   * @param {string} serverId - Server ID
   * @param {Object} metrics - Request metrics
   */
  releaseConnection(serverId, metrics = {}) {
    try {
      const activeConns = this.activeConnections.get(serverId) || 0;
      if (activeConns > 0) {
        this.activeConnections.set(serverId, activeConns - 1);
      }

      // Update server statistics
      if (metrics.responseTime) {
        const server = this.servers.get(serverId);
        if (server) {
          server.totalRequests++;
          server.responseTime = ((server.responseTime * (server.totalRequests - 1)) + metrics.responseTime) / server.totalRequests;
        }
      }

      // Update server stats
      const stats = this.serverStats.get(serverId);
      if (stats && metrics) {
        if (metrics.error) {
          stats.errorRate = ((stats.errorRate * 0.9) + 0.1); // Exponential moving average
        }
        if (metrics.responseTime) {
          stats.averageResponseTime = ((stats.averageResponseTime * 0.9) + (metrics.responseTime * 0.1));
        }
      }

    } catch (error) {
      logger.error('Error releasing connection:', error);
    }
  }

  /**
   * Get load balancing statistics
   *
   * @returns {Object} Load balancing statistics
   */
  getStatistics() {
    try {
      const servers = Array.from(this.servers.values());
      const totalServers = servers.length;
      const healthyServers = servers.filter(s => s.status === 'healthy').length;
      const totalActiveConnections = Array.from(this.activeConnections.values())
        .reduce((sum, conns) => sum + conns, 0);

      const stats = {
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

  /**
   * Scale up servers
   *
   * @param {number} count - Number of servers to add
   * @returns {Array} Added server IDs
   */
  async scaleUp(count = 1) {
    try {
      const addedServers = [];

      for (let i = 0; i < count; i++) {
        // This would integrate with cloud provider APIs to launch new instances
        // For demonstration, we'll simulate adding a server
        const serverConfig = {
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

  /**
   * Scale down servers
   *
   * @param {number} count - Number of servers to remove
   * @returns {Array} Removed server IDs
   */
  async scaleDown(count = 1) {
    try {
      const removableServers = Array.from(this.servers.values())
        .filter(server => server.tags.includes('auto-scaled') && server.status === 'healthy')
        .sort((a, b) => (this.activeConnections.get(a.id) || 0) - (this.activeConnections.get(b.id) || 0))
        .slice(0, count);

      const removedServers = [];

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

  /**
   * Set up default servers
   *
   * @private
   */
  async _setupDefaultServers() {
    try {
      // Add some default servers for demonstration
      const defaultServers = [
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

  /**
   * Perform health checks on all servers
   *
   * @private
   */
  async _performHealthChecks() {
    try {
      const healthCheckPromises = Array.from(this.servers.values())
        .map(server => this._checkServerHealth(server));

      await Promise.allSettled(healthCheckPromises);
    } catch (error) {
      logger.error('Error performing health checks:', error);
    }
  }

  /**
   * Check health of a specific server
   *
   * @private
   * @param {Object} server - Server object
   */
  async _checkServerHealth(server) {
    try {
      const startTime = Date.now();

      // Perform health check (simplified - would use actual HTTP request)
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

  /**
   * Perform actual health check request
   *
   * @private
   * @param {Object} server - Server object
   * @returns {Promise<boolean>} Health status
   */
  async _performHealthCheckRequest(_server) {
    // This would make an actual HTTP request to the server's health endpoint
    // For demonstration, we'll simulate a health check
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate 95% success rate
        resolve(Math.random() < 0.95);
      }, Math.random() * 1000 + 500); // 500-1500ms delay
    });
  }

  /**
   * Check if scaling is needed
   *
   * @private
   */
  async _checkScalingNeeds() {
    try {
      const stats = this.getStatistics();
      const healthyServers = stats.healthyServers;
      const avgConnectionsPerServer = stats.averageConnectionsPerServer;

      const utilizationRate = healthyServers > 0 ? avgConnectionsPerServer / this.options.maxConnectionsPerServer : 0;

      if (utilizationRate > this.options.scalingThreshold) {
        logger.info(`High utilization detected (${(utilizationRate * 100).toFixed(1)}%), scaling up`);
        await this.scaleUp(1);
      } else if (utilizationRate < 0.3 && healthyServers > 1) {
        // Scale down if utilization is low and we have multiple servers
        logger.info(`Low utilization detected (${(utilizationRate * 100).toFixed(1)}%), considering scale down`);
        // Only scale down auto-scaled instances
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

  /**
   * Set up geo-routing
   *
   * @private
   */
  async _setupGeoRouting() {
    try {
      // Set up geographic routing rules
      this.geoRoutes.set('NA', ['us-east-1', 'us-west-2']); // North America
      this.geoRoutes.set('EU', ['eu-west-1', 'eu-central-1']); // Europe
      this.geoRoutes.set('AS', ['ap-southeast-1', 'ap-northeast-1']); // Asia

      logger.info('Geo-routing configured');
    } catch (error) {
      logger.error('Error setting up geo-routing:', error);
    }
  }

  /**
   * Select server using round-robin algorithm
   *
   * @private
   * @param {Array} servers - Available servers
   * @returns {Object} Selected server
   */
  _selectRoundRobin(servers) {
    if (!this._roundRobinIndex) {
      this._roundRobinIndex = 0;
    }

    const server = servers[this._roundRobinIndex % servers.length];
    this._roundRobinIndex++;

    return server;
  }

  /**
   * Select server using least connections algorithm
   *
   * @private
   * @param {Array} servers - Available servers
   * @returns {Object} Selected server
   */
  _selectLeastConnections(servers) {
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

  /**
   * Select server using IP hash algorithm
   *
   * @private
   * @param {Array} servers - Available servers
   * @param {Object} request - Request object
   * @returns {Object} Selected server
   */
  _selectIPHash(servers, request) {
    if (!request.clientIP) {
      return this._selectRoundRobin(servers);
    }

    // Simple hash of IP address
    let hash = 0;
    for (let i = 0; i < request.clientIP.length; i++) {
      hash = ((hash << 5) - hash) + request.clientIP.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }

    const index = Math.abs(hash) % servers.length;
    return servers[index];
  }

  /**
   * Select server using weighted algorithm
   *
   * @private
   * @param {Array} servers - Available servers
   * @returns {Object} Selected server
   */
  _selectWeighted(servers) {
    const totalWeight = servers.reduce((sum, server) => sum + server.weight, 0);
    let random = Math.random() * totalWeight;

    for (const server of servers) {
      random -= server.weight;
      if (random <= 0) {
        return server;
      }
    }

    return servers[0]; // Fallback
  }

  /**
   * Get server based on client geography
   *
   * @private
   * @param {string} clientIP - Client IP address
   * @param {Array} servers - Available servers
   * @returns {Object|null} Selected server
   */
  _getGeoServer(clientIP, servers) {
    // This would use a GeoIP service to determine client location
    // For demonstration, we'll use a simple IP-based region detection
    const region = this._getRegionFromIP(clientIP);
    const regionalServers = servers.filter(server => server.region === region);

    if (regionalServers.length > 0) {
      return this._selectRoundRobin(regionalServers);
    }

    return null;
  }

  /**
   * Get region from IP address
   *
   * @private
   * @param {string} ip - IP address
   * @returns {string} Region code
   */
  _getRegionFromIP(ip) {
    // Simplified IP to region mapping
    const firstOctet = parseInt(ip.split('.')[0]);

    if (firstOctet >= 1 && firstOctet <= 126) return 'NA'; // North America
    if (firstOctet >= 128 && firstOctet <= 191) return 'EU'; // Europe
    if (firstOctet >= 192 && firstOctet <= 223) return 'AS'; // Asia

    return 'default';
  }

  /**
   * Remove server completely
   *
   * @private
   * @param {string} serverId - Server ID
   */
  _removeServerCompletely(serverId) {
    this.servers.delete(serverId);
    this.serverStats.delete(serverId);
    this.activeConnections.delete(serverId);

    logger.info(`Completely removed server: ${serverId}`);
  }

  /**
   * Shutdown the load balancing service
   */
  async shutdown() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    if (this.scalingInterval) {
      clearInterval(this.scalingInterval);
    }

    logger.info('Load balancing service shut down');
  }
}

module.exports = LoadBalancingService;