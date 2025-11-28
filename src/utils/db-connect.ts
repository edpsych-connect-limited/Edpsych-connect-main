import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { MongoClient, Db } from 'mongodb';
import { getDatabase, getMongoClient } from './mongodb-pool';

/**
 * Connect to database with connection pooling
 * @returns MongoDB database instance
 */
export async function dbConnect(): Promise<Db> {
  return getDatabase();
}

/**
 * Get MongoDB client with connection pooling
 * @returns MongoDB client instance
 */
export async function getClient(): Promise<MongoClient> {
  return getMongoClient();
}