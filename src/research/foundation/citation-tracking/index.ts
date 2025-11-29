/**
 * EdPsych Connect Citation Tracking and Academic Impact Metrics
 * 
 * This module provides comprehensive citation tracking and academic impact metrics
 * for the EdPsych Connect research platform.
 * 
 * It includes:
 * - Citation tracking across academic publications and research artifacts
 * - Advanced academic impact metrics calculation
 * - Altmetrics support for tracking non-traditional research impact
 * - Citation network analysis
 * - Integration with external citation databases
 */

// Export models
export * from './models/citation';
export * from './models/publication';
export * from './models/researcher';
export * from './models/impact-metrics';

// Export services
export { CitationTrackingService } from './services/citation-tracking-service';
export { PublicationService } from './services/publication-service';
export { ImpactMetricsService } from './services/impact-metrics-service';

// Export controller
import citationTrackingController from './controllers/citation-tracking-controller';

// Express application setup
import express, { Request, Response, Application } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

/**
 * Create an Express application with the citation tracking API
 *
 * @param options Configuration options
 * @returns Express application
 */
export function createCitationTrackingApp(options: {
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
  app.use(`${apiBasePath}/citation-tracking`, citationTrackingController);
  
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
const CitationTracking = {
  createCitationTrackingApp,
  citationTrackingController
};

export default CitationTracking;