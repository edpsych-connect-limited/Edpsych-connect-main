import { MongoClient, Db } from 'mongodb';
import { getDatabase, getMongoClient, closeMongoDBConnection, getConnectionStatistics } from './mongodb-pool';

/**
 * Connect to MongoDB database with connection pooling
 * @returns MongoDB database instance
 */
export async function connectToDatabase(): Promise<Db> {
  return getDatabase();
}

/**
 * Get MongoDB client with connection pooling
 * @returns MongoDB client instance
 */
export async function getClient(): Promise<MongoClient> {
  return getMongoClient();
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  return closeMongoDBConnection();
}

/**
 * Get connection statistics
 */
export function getDatabaseStats(): any {
  return getConnectionStatistics();
}

// Export the connection module
const mongoDbUtils = {
  connectToDatabase,
  getClient,
  closeDatabase,
  getDatabaseStats,
};

export default mongoDbUtils;