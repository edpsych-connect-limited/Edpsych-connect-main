/**
 * EdPsych Connect Commercial API Access Framework
 * 
 * This module provides a comprehensive framework for commercial API access
 * with usage-based pricing for the EdPsych Connect research platform.
 * 
 * It includes:
 * - API key management with quantum-resistant cryptography
 * - Usage tracking and analytics
 * - Flexible pricing models
 * - Rate limiting and quota enforcement
 * - Billing and invoicing
 */

// Export models
export * from './models/api-pricing';
export * from './models/api-usage';

// Export services
export { ApiKeyService } from './services/api-key-service';
export type { CreateApiKeyParams } from './services/api-key-service';
export { UsageTrackingService } from './services/usage-tracking-service';

// Export middleware
export {
  verifyApiKey,
  checkApiQuota,
  trackApiUsage,
  setRateLimitHeaders,
  apiAccessControl
} from './middleware/api-access-middleware';

// Export controller
import apiAccessController from './controllers/api-access-controller';

// Express application setup
import express, { Request, Response, Application } from 'express';
import * as bodyParser from 'body-parser';
import cors from 'cors';

/**
 * Create an Express application with the API access framework
 *
 * @param options Configuration options
 * @returns Express application
 */
export function createApiAccessApp(options: {
  apiBasePath?: string;
  enableCors?: boolean;
  corsOptions?: cors.CorsOptions;
} = {}): Application {
  // Default options
  const {
    apiBasePath = '/api/v1',
    enableCors = true,
    corsOptions = {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
    }
  } = options;
  
  // Create Express application
  const app: Application = express();
  
  // Configure middleware
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  
  // Configure CORS
  if (enableCors) {
    app.use(cors(corsOptions));
  }
  
  // Mount API routes
  app.use(`${apiBasePath}/api-access`, apiAccessController);
  
  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  });
  
  return app;
}

// Export everything as a default object
const ApiAccess = {
  createApiAccessApp,
  apiAccessController
};

export default ApiAccess;