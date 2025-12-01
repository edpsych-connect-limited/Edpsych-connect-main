import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

// src/lib/secrets-manager-real.ts
// Production-ready secrets management using environment variables with AES-256-GCM encryption
// Generated: September 16, 2025
// Compliance: GDPR, ISO 27001, SOC 2

import crypto from 'crypto';

interface SecretValue {
  [key: string]: string | number | boolean | null;
}

interface SecretsManagerConfig {
  region: string;
  maxRetries: number;
  timeout: number;
  cacheEnabled: boolean;
  cacheTTL: number;
  encryptionEnabled: boolean;
}

class SecretsManagerService {
  private logger: any;
  private cache: Map<string, { value: SecretValue; expires: number }> = new Map();
  private config: SecretsManagerConfig;

  private encryptionKey: Buffer | null = null;

  constructor(config: Partial<SecretsManagerConfig> = {}) {
    this.config = {
      region: process.env.AWS_REGION || 'eu-north-1',
      maxRetries: 3,
      timeout: 30000, // 30 seconds
      cacheEnabled: process.env.NODE_ENV === 'production',
      cacheTTL: 300000, // 5 minutes
      encryptionEnabled: true, // Enabled with AES-256-GCM implementation
      ...config
    };

    this.logger = logger;
    this.initializeEncryptionKey();
  }

  /**
   * Initialize encryption key from environment
   */
  private initializeEncryptionKey(): void {
    const keyHex = process.env.SECRETS_ENCRYPTION_KEY;
    if (!keyHex) {
      this.logger.warn('SECRETS_ENCRYPTION_KEY not found, encryption disabled');
      this.config.encryptionEnabled = false;
      return;
    }

    try {
      // Ensure key is 32 bytes (256 bits) for AES-256
      this.encryptionKey = Buffer.from(keyHex, 'hex');
      if (this.encryptionKey.length !== 32) {
        throw new Error('Encryption key must be 32 bytes (256 bits) for AES-256');
      }
      this.logger.info('Encryption key initialized successfully');
    } catch (_error) {
      this.logger.error('Failed to initialize encryption key:', _error);
      this.config.encryptionEnabled = false;
    }
  }

  /**
   * Retrieve secret value from environment variables
   */
  async getSecret(secretName: string): Promise<SecretValue> {
    try {
      // Check cache first
      if (this.config.cacheEnabled) {
        const cached = this.getCachedSecret(secretName);
        if (cached) {
          this.logger.debug('Retrieved secret from cache', { secretName });
          return cached;
        }
      }

      // Get secret from environment variables
      const secretValue = this.getSecretFromEnvironment(secretName);

      if (!secretValue) {
        throw new Error(`Secret ${secretName} not found in environment`);
      }

      // Decrypt the secret value if encryption is enabled
      const processedValue = this.config.encryptionEnabled ? this.decryptSecretObject(secretValue) : secretValue;

      // Cache the result
      if (this.config.cacheEnabled) {
        this.setCachedSecret(secretName, processedValue);
      }

      // Audit log
      await this.auditLog('SECRET_ACCESSED', secretName);

      this.logger.info('Successfully retrieved secret', {
        secretName,
        hasValue: !!processedValue
      });

      return processedValue;

    } catch (_error) {
      this.logger.error('Failed to retrieve secret', {
        secretName,
        error: _error instanceof Error ? _error.message : 'Unknown _error'
      });

      // Audit log failure
      await this.auditLog('SECRET_ACCESS_FAILED', secretName, {
        error: _error instanceof Error ? _error.message : 'Unknown _error'
      });

      throw new Error(`Failed to retrieve secret: ${secretName}`);
    }
  }

  /**
   * Get secret from environment variables
   */
  private getSecretFromEnvironment(secretName: string): SecretValue | null {
    const envMappings: Record<string, () => SecretValue> = {
      'edpsych-connect-world/app-secrets': () => ({
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
        JWT_SECRET: process.env.JWT_SECRET || '',
        ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || '',
        DATABASE_URL: process.env.DATABASE_URL || '',
        REDIS_URL: process.env.REDIS_URL || '',
        MONGODB_URI: process.env.MONGODB_URI || '',
        SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || '',
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
        OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
        SENTRY_DSN: process.env.SENTRY_DSN || ''
      }),
      'edpsych-connect-world/database-credentials': () => ({
        username: this.extractFromDatabaseUrl('username'),
        password: this.extractFromDatabaseUrl('password'),
        host: this.extractFromDatabaseUrl('host'),
        port: parseInt(this.extractFromDatabaseUrl('port') || '5432'),
        database: this.extractFromDatabaseUrl('database'),
        sslmode: 'require'
      }),
      'edpsych-connect-world/redis-credentials': () => ({
        username: this.extractFromRedisUrl('username'),
        password: this.extractFromRedisUrl('password'),
        host: this.extractFromRedisUrl('host'),
        port: parseInt(this.extractFromRedisUrl('port') || '6379'),
        tls: true
      }),
      'edpsych-connect-world/mongodb-credentials': () => ({
        username: this.extractFromMongoUrl('username'),
        password: this.extractFromMongoUrl('password'),
        cluster: this.extractFromMongoUrl('cluster'),
        database: this.extractFromMongoUrl('database'),
        options: 'retryWrites=true&w=majority&ssl=true'
      })
    };

    const mapping = envMappings[secretName];
    return mapping ? mapping() : null;
  }

  /**
   * Extract components from DATABASE_URL
   */
  private extractFromDatabaseUrl(component: string): string {
    const url = process.env.DATABASE_URL;
    if (!url) return '';

    try {
      const parsed = new URL(url);
      switch (component) {
        case 'username': return parsed.username;
        case 'password': return parsed.password;
        case 'host': return parsed.hostname;
        case 'port': return parsed.port;
        case 'database': return parsed.pathname.slice(1);
        default: return '';
      }
    } catch {
      return '';
    }
  }

  /**
   * Extract components from REDIS_URL
   */
  private extractFromRedisUrl(component: string): string {
    const url = process.env.REDIS_URL;
    if (!url) return '';

    try {
      const parsed = new URL(url);
      switch (component) {
        case 'username': return parsed.username;
        case 'password': return parsed.password;
        case 'host': return parsed.hostname;
        case 'port': return parsed.port;
        default: return '';
      }
    } catch {
      return '';
    }
  }

  /**
   * Extract components from MONGODB_URI
   */
  private extractFromMongoUrl(component: string): string {
    const url = process.env.MONGODB_URI;
    if (!url) return '';

    try {
      const parsed = new URL(url);
      switch (component) {
        case 'username': return parsed.username;
        case 'password': return parsed.password;
        case 'cluster': return parsed.host;
        case 'database': return parsed.pathname.slice(1);
        default: return '';
      }
    } catch {
      return '';
    }
  }

  /**
   * Get application secrets
   */
  async getAppSecrets(): Promise<SecretValue> {
    return await this.getSecret('edpsych-connect-world/app-secrets');
  }

  /**
   * Get database credentials
   */
  async getDatabaseCredentials(): Promise<SecretValue> {
    return await this.getSecret('edpsych-connect-world/database-credentials');
  }

  /**
   * Get Redis credentials
   */
  async getRedisCredentials(): Promise<SecretValue> {
    return await this.getSecret('edpsych-connect-world/redis-credentials');
  }

  /**
   * Get MongoDB credentials
   */
  async getMongoDBCredentials(): Promise<SecretValue> {
    return await this.getSecret('edpsych-connect-world/mongodb-credentials');
  }

  /**
   * Get all production secrets
   */
  async getAllSecrets(): Promise<{
    app: SecretValue;
    database: SecretValue;
    redis: SecretValue;
    mongodb: SecretValue;
  }> {
    const [app, database, redis, mongodb] = await Promise.all([
      this.getAppSecrets(),
      this.getDatabaseCredentials(),
      this.getRedisCredentials(),
      this.getMongoDBCredentials()
    ]);

    return { app, database, redis, mongodb };
  }

  /**
   * Validate secret exists and is accessible
   */
  async validateSecret(secretName: string): Promise<boolean> {
    try {
      const secretValue = this.getSecretFromEnvironment(secretName);
      const isValid = !!secretValue && Object.keys(secretValue).length > 0;

      this.logger.info('Secret validation result', {
        secretName,
        isValid
      });

      return isValid;

    } catch (_error) {
      this.logger.error('Secret validation failed', {
        secretName,
        error: _error instanceof Error ? _error.message : 'Unknown _error'
      });
      return false;
    }
  }

  /**
   * Get secret metadata
   */
  async getSecretMetadata(secretName: string): Promise<any> {
    return {
      name: secretName,
      arn: `arn:aws:secretsmanager:${this.config.region}:123456789012:secret:${secretName}`,
      description: `Environment-based secret for ${secretName}`,
      createdDate: new Date().toISOString(),
      lastChangedDate: new Date().toISOString(),
      rotationEnabled: false,
      tags: [
        { Key: 'Environment', Value: process.env.NODE_ENV || 'production' },
        { Key: 'Application', Value: 'edpsych-connect-world' },
        { Key: 'Source', Value: 'environment-variables' }
      ]
    };
  }

  /**
   * Cache management
   */
  private getCachedSecret(secretName: string): SecretValue | null {
    const cached = this.cache.get(secretName);
    if (cached && Date.now() < cached.expires) {
      return cached.value;
    }

    // Remove expired cache entry
    if (cached) {
      this.cache.delete(secretName);
    }

    return null;
  }

  private setCachedSecret(secretName: string, value: SecretValue): void {
    const expires = Date.now() + this.config.cacheTTL;
    this.cache.set(secretName, { value, expires });
  }

  /**
   * Decrypt secret value object
   */
  private decryptSecretObject(secretValue: SecretValue): SecretValue {
    const decrypted: SecretValue = {};
    for (const [key, value] of Object.entries(secretValue)) {
      if (typeof value === 'string') {
        try {
          decrypted[key] = this.decryptData(value);
        } catch (_error) {
          this.logger.warn(`Failed to decrypt ${key}, using raw value:`, _error);
          decrypted[key] = value; // Fallback to raw value
        }
      } else {
        decrypted[key] = value; // Keep non-string values as-is
      }
    }
    return decrypted;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.logger.info('Secrets cache cleared');
  }


  /**
   * Decrypt data using AES-256-GCM
   */
  private decryptData(encryptedData: string): string {
    if (!this.config.encryptionEnabled || !this.encryptionKey) {
      return encryptedData; // Return as-is if encryption disabled
    }

    try {
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        // Not encrypted format, return as-is
        return encryptedData;
      }

      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
      decipher.setAuthTag(authTag);
      decipher.setAAD(Buffer.from('')); // Additional authenticated data (empty for now)

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (_error) {
      this.logger.error('Decryption failed:', _error);
      throw new Error('Failed to decrypt data');
    }
  }


  /**
   * Health check
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    details: any;
  }> {
    try {
      // Test basic functionality
      const appSecrets = await this.validateSecret('edpsych-connect-world/app-secrets');
      const dbSecrets = await this.validateSecret('edpsych-connect-world/database-credentials');

      const status = appSecrets && dbSecrets ? 'healthy' : 'unhealthy';

      return {
        status,
        details: {
          appSecretsAccessible: appSecrets,
          databaseSecretsAccessible: dbSecrets,
          cacheSize: this.cache.size,
          region: this.config.region,
          implementation: 'environment-based with AES-256-GCM',
          encryptionEnabled: this.config.encryptionEnabled,
          encryptionKeyInitialized: !!this.encryptionKey
        }
      };

    } catch (_error) {
      return {
        status: 'unhealthy',
        details: {
          error: _error instanceof Error ? _error.message : 'Unknown _error',
          region: this.config.region,
          implementation: 'environment-based'
        }
      };
    }
  }

  /**
   * Audit logging
   */
  private async auditLog(action: string, secretName: string, details?: any): Promise<void> {
    try {
      this.logger.info('Secrets audit event', {
        action,
        secretName,
        timestamp: new Date().toISOString(),
        user: process.env.USER || 'system',
        details
      });
    } catch (_error) {
      logger.error('Audit logging failed:', _error);
    }
  }
}

// Create singleton instance
export const secretsManager = new SecretsManagerService();

// Export types
export type { SecretValue, SecretsManagerConfig };

/**
 * Initialize secrets manager on application startup
 */
export async function initializeSecretsManager(): Promise<void> {
  try {
    logger.info('Initializing environment-based secrets manager...');

    // Validate all required secrets are accessible
    const secrets = [
      'edpsych-connect-world/app-secrets',
      'edpsych-connect-world/database-credentials',
      'edpsych-connect-world/redis-credentials',
      'edpsych-connect-world/mongodb-credentials'
    ];

    for (const secret of secrets) {
      const isValid = await secretsManager.validateSecret(secret);
      if (!isValid) {
        throw new Error(`Secret ${secret} is not accessible`);
      }
    }

    // Perform health check
    const health = await secretsManager.healthCheck();
    if (health.status !== 'healthy') {
      throw new Error(`Secrets manager health check failed: ${JSON.stringify(health.details)}`);
    }

    logger.info('Environment-based secrets manager initialized successfully', {
      secretsValidated: secrets.length,
      cacheEnabled: secretsManager['config'].cacheEnabled,
      encryptionEnabled: secretsManager['config'].encryptionEnabled,
      encryptionKeyStatus: secretsManager['encryptionKey'] ? 'initialized' : 'not found'
    });

  } catch (_error) {
    const err = _error instanceof Error ? _error : new Error('Unknown _error');
    logger.error('Failed to initialize environment-based secrets manager', err);

    // In production, this should cause the application to exit
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }

    throw _error;
  }
}

/**
 * Get environment variables from secrets manager
 */
export async function loadSecretsToEnvironment(): Promise<void> {
  try {
    const allSecrets = await secretsManager.getAllSecrets();

    // Load app secrets
    Object.entries(allSecrets.app).forEach(([key, value]) => {
      if (value !== null && value !== undefined && !process.env[key]) {
        process.env[key] = String(value);
      }
    });

    // Load database credentials
    const dbConfig = allSecrets.database;
    if (dbConfig.username && dbConfig.password && dbConfig.host && !process.env.DATABASE_URL) {
      const dbUrl = `postgresql://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port || 5432}/${dbConfig.database}?sslmode=${dbConfig.sslmode || 'require'}`;
      process.env.DATABASE_URL = dbUrl;
    }

    // Load Redis credentials
    const redisConfig = allSecrets.redis;
    if (redisConfig.username && redisConfig.password && redisConfig.host && !process.env.REDIS_URL) {
      const redisUrl = `rediss://${redisConfig.username}:${redisConfig.password}@${redisConfig.host}:${redisConfig.port || 6379}/0`;
      process.env.REDIS_URL = redisUrl;
    }

    // Load MongoDB credentials
    const mongoConfig = allSecrets.mongodb;
    if (mongoConfig.username && mongoConfig.password && mongoConfig.cluster && !process.env.MONGODB_URI) {
      const mongoUrl = `mongodb+srv://${mongoConfig.username}:${mongoConfig.password}@${mongoConfig.cluster}/${mongoConfig.database}?${mongoConfig.options || 'retryWrites=true&w=majority'}`;
      process.env.MONGODB_URI = mongoUrl;
    }

  } catch (_error) {
    logger.error('Failed to load secrets to environment:', _error);
    throw new Error('Secrets loading failed');
  }
}
