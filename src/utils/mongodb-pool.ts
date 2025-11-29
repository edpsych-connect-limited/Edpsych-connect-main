/**
 * MongoDB Connection Pooling Utility
 *
 * This module provides enterprise-grade MongoDB connection pooling
 * with monitoring, error handling, and reconnection capabilities.
 *
 * Features include:
 * - connectionPooling with configurable limits
 * - connection_pool monitoring
 * - Automatic pool: management
 */

import { MongoClient, Db, MongoClientOptions } from 'mongodb';
import { logger } from '@/lib/logger';

/**
 * Connection pool configuration
 */
export const MONGODB_POOL_CONFIG = {
  // Maximum connections in the pool
  MAX_POOL_SIZE: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '10', 10),
  // Minimum connections in the pool
  MIN_POOL_SIZE: parseInt(process.env.MONGODB_MIN_POOL_SIZE || '5', 10),
  // Maximum idle time for a connection (ms)
  MAX_IDLE_TIME_MS: parseInt(process.env.MONGODB_MAX_IDLE_TIME_MS || '60000', 10),
  // Connection timeout (ms)
  CONNECT_TIMEOUT_MS: parseInt(process.env.MONGODB_CONNECT_TIMEOUT_MS || '30000', 10),
  // Socket timeout (ms)
  SOCKET_TIMEOUT_MS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT_MS || '45000', 10),
  // Server selection timeout (ms)
  SERVER_SELECTION_TIMEOUT_MS: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || '30000', 10),
  // Wait queue timeout (ms)
  WAIT_QUEUE_TIMEOUT_MS: parseInt(process.env.MONGODB_WAIT_QUEUE_TIMEOUT_MS || '10000', 10),
  // Maximum wait queue size
  WAIT_QUEUE_SIZE: parseInt(process.env.MONGODB_WAIT_QUEUE_SIZE || '1000', 10),
  // Heartbeat frequency (ms)
  HEARTBEAT_FREQUENCY_MS: parseInt(process.env.MONGODB_HEARTBEAT_FREQUENCY_MS || '10000', 10),
  // Local threshold (ms)
  LOCAL_THRESHOLD_MS: parseInt(process.env.MONGODB_LOCAL_THRESHOLD_MS || '15', 10),
  // Retry reads
  RETRY_READS: process.env.MONGODB_RETRY_READS !== 'false',
  // Retry writes
  RETRY_WRITES: process.env.MONGODB_RETRY_WRITES !== 'false',
};

/**
 * MongoDB connection interface
 */
export interface MongoDBConnection {
  client: MongoClient;
  db: Db;
}

/**
 * Connection state
 */
let connection: MongoDBConnection | null = null;
let isConnecting = false;
let connectionMonitorInterval: NodeJS.Timeout | null = null;

/**
 * Connection statistics
 */
export const connectionStats = {
  connectionsCreated: 0,
  connectionsOpened: 0,
  connectionsClosed: 0,
  connectionErrors: 0,
  lastConnectionTime: null as Date | null,
  lastErrorTime: null as Date | null,
  lastError: null as Error | null,
  isConnected: false,
  poolStats: null as any,
};

/**
 * Get MongoDB connection options with pooling configuration
 */
function getConnectionOptions(): MongoClientOptions {
  return {
    maxPoolSize: MONGODB_POOL_CONFIG.MAX_POOL_SIZE,
    minPoolSize: MONGODB_POOL_CONFIG.MIN_POOL_SIZE,
    maxIdleTimeMS: MONGODB_POOL_CONFIG.MAX_IDLE_TIME_MS,
    connectTimeoutMS: MONGODB_POOL_CONFIG.CONNECT_TIMEOUT_MS,
    socketTimeoutMS: MONGODB_POOL_CONFIG.SOCKET_TIMEOUT_MS,
    serverSelectionTimeoutMS: MONGODB_POOL_CONFIG.SERVER_SELECTION_TIMEOUT_MS,
    waitQueueTimeoutMS: MONGODB_POOL_CONFIG.WAIT_QUEUE_TIMEOUT_MS,
    // waitQueueSize: MONGODB_POOL_CONFIG.WAIT_QUEUE_SIZE, // Deprecated in newer MongoDB driver versions
    heartbeatFrequencyMS: MONGODB_POOL_CONFIG.HEARTBEAT_FREQUENCY_MS,
    localThresholdMS: MONGODB_POOL_CONFIG.LOCAL_THRESHOLD_MS,
    retryReads: MONGODB_POOL_CONFIG.RETRY_READS,
    retryWrites: MONGODB_POOL_CONFIG.RETRY_WRITES,
    // keepAlive: true, // Deprecated in newer MongoDB driver versions
  };
}

/**
 * Start monitoring connection health
 */
function startConnectionMonitoring() {
  if (connectionMonitorInterval) {
    clearInterval(connectionMonitorInterval);
  }
  
  connectionMonitorInterval = setInterval(async () => {
    if (connection?.client) {
      try {
        // Update pool statistics
        connectionStats.poolStats = await connection.client.db().admin().serverStatus();
        // Cast to any for deprecated topology property
        connectionStats.isConnected = (connection.client as any).topology?.isConnected() || false;
      } catch (error) {
        logger.warn('Failed to update MongoDB connection statistics', error);
      }
    }
  }, MONGODB_POOL_CONFIG.HEARTBEAT_FREQUENCY_MS);
  
  // Ensure the interval doesn't prevent the process from exiting
  connectionMonitorInterval.unref();
}

/**
 * Connect to MongoDB with connection pooling
 */
export async function connectToMongoDB(): Promise<MongoDBConnection> {
  // If already connected, return existing connection
  if (connection) {
    return connection;
  }
  
  // Prevent multiple concurrent connection attempts
  if (isConnecting) {
    logger.info('MongoDB connection in progress, waiting...');
    await new Promise(resolve => setTimeout(resolve, 500));
    // Recursive call until connection is established
    return connectToMongoDB();
  }
  
  try {
    isConnecting = true;
    
    // Get MongoDB URI from environment variables
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/edpsych';
    
    // Create client with connection pooling options
    logger.info('Creating MongoDB connection with pooling...');
    const options = getConnectionOptions();
    const client = new MongoClient(uri, options);
    
    // Connect to the MongoDB server
    await client.connect();
    const db = client.db();
    
    // Update statistics
    connectionStats.connectionsCreated += 1;
    connectionStats.connectionsOpened += 1;
    connectionStats.lastConnectionTime = new Date();
    connectionStats.isConnected = true;
    
    // Create and store the connection
    connection = { client, db };
    
    // Log connection event
    logger.info('Connected to MongoDB with connection pooling');
    
    // Set up connection event handlers
    client.on('serverHeartbeatSucceeded', () => {
      connectionStats.isConnected = true;
    });
    
    client.on('serverHeartbeatFailed', (event) => {
      logger.warn('MongoDB server heartbeat failed', event);
      connectionStats.isConnected = false;
    });
    
    client.on('connectionPoolCleared', () => {
      connectionStats.connectionsClosed += 1;
      logger.warn('MongoDB connection pool cleared');
    });
    
    client.on('close', () => {
      connectionStats.isConnected = false;
      logger.info('MongoDB connection closed');
    });
    
    // Start connection monitoring
    startConnectionMonitoring();
    
    return connection;
  } catch (error) {
    // Update error statistics
    connectionStats.connectionErrors += 1;
    connectionStats.lastErrorTime = new Date();
    connectionStats.lastError = error as Error;
    connectionStats.isConnected = false;
    
    // Log error
    logger.error('Failed to connect to MongoDB', error);
    throw error;
  } finally {
    isConnecting = false;
  }
}

/**
 * Get MongoDB database instance with connection pooling
 * 
 * @returns MongoDB database instance
 */
export async function getDatabase(): Promise<Db> {
  const { db } = await connectToMongoDB();
  return db;
}

/**
 * Get MongoDB client instance
 * 
 * @returns MongoDB client
 */
export async function getMongoClient(): Promise<MongoClient> {
  const { client } = await connectToMongoDB();
  return client;
}

/**
 * Close MongoDB connection pool
 */
export async function closeMongoDBConnection(): Promise<void> {
  if (connectionMonitorInterval) {
    clearInterval(connectionMonitorInterval);
    connectionMonitorInterval = null;
  }
  
  if (connection?.client) {
    await connection.client.close();
    connection = null;
    connectionStats.connectionsClosed += 1;
    connectionStats.isConnected = false;
    logger.info('MongoDB connection pool closed');
  }
}

/**
 * Get current connection statistics
 */
export function getConnectionStatistics() {
  return { ...connectionStats };
}

// Export default object for backward compatibility
const mongodbPool = {
  connectToMongoDB,
  getDatabase,
  getMongoClient,
  closeMongoDBConnection,
  getConnectionStatistics,
};

export default mongodbPool;