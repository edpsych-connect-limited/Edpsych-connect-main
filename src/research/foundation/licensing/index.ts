import { logger } from "@/lib/logger";
/**
 * EdPsych Connect - Tiered Research Licensing Module
 * 
 * This is the main entry point for the licensing module.
 * It demonstrates how to integrate the licensing system into an Express application.
 */

import express from 'express';
import licenseController from './controllers/license-controller';

// Create Express application
const app = express();

// Configure middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add basic security headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  next();
});

// Register license routes
app.use('/api', licenseController);

// Add a simple health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'EdPsych Connect Licensing Module',
    version: '1.0.0',
    timestamp: new Date()
  });
});

// Add a simple documentation endpoint
app.get('/', (_req, res) => {
  res.status(200).json({
    name: 'EdPsych Connect Tiered Research Licensing API',
    description: 'API for managing tiered research licenses with quantum-resistant security',
    version: '1.0.0',
    endpoints: [
      { path: '/api/licenses', methods: ['GET', 'POST'], description: 'License management' },
      { path: '/api/licenses/:id', methods: ['GET', 'PUT'], description: 'License operations' },
      { path: '/api/licenses/:id/deactivate', methods: ['POST'], description: 'Deactivate license' },
      { path: '/api/licenses/:id/renew', methods: ['POST'], description: 'Renew license' },
      { path: '/api/licenses/:id/upgrade', methods: ['POST'], description: 'Upgrade license' },
      { path: '/api/licenses/validate', methods: ['POST'], description: 'Validate license' },
      { path: '/api/licenses/report', methods: ['GET'], description: 'Generate license report' },
      { path: '/api/organizations/:organizationId/licenses', methods: ['GET'], description: 'Get organization licenses' },
      { path: '/api/research/data', methods: ['GET'], description: 'Access research data' },
      { path: '/api/research/ml/run', methods: ['POST'], description: 'Run machine learning model' },
      { path: '/api/research/nhs-digital/data', methods: ['GET'], description: 'Access NHS Digital data' },
      { path: '/api/research/data/export', methods: ['POST'], description: 'Export research data' },
      { path: '/api/research/ai/train', methods: ['POST'], description: 'Train custom AI model' }
    ],
    documentation: 'For detailed documentation, please refer to the API documentation in the knowledge base.'
  });
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);

  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
});

// Handle 404 errors
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Resource not found'
  });
});

// Start the server if this module is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  
  app.listen(PORT, () => {
    logger.debug(`EdPsych Connect Licensing Module server running on port ${PORT}`);
    logger.debug(`API documentation available at http://localhost:${PORT}/`);
  });
}

// Export the app for testing or for use as a middleware in a larger application
export default app;
