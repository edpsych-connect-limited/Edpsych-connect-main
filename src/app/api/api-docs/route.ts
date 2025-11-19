import { NextResponse } from 'next/server';

/**
 * API Documentation Route for EdPsych Connect World
 * Simplified for Vercel deployment compatibility
 */

// Route segment config for App Router
export const maxDuration = 30;
export const revalidate = 3600;

// Static OpenAPI specification to avoid swagger-jsdoc dependency issues
const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'EdPsych Connect World API',
    version: '1.0.0',
    description: 'Comprehensive API documentation for the EdPsych Connect World educational platform',
    contact: {
      name: 'EdPsych Connect World API Support',
      email: 'api@edpsychconnect.app',
    },
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_API_URL || 'https://api.edpsychconnect.app',
      description: 'Production API Server',
    },
    {
      url: 'http://localhost:3000',
      description: 'Development Server',
    },
  ],
  // Basic security schemes
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  // Core API paths
  paths: {
    '/api/auth/login': {
      post: {
        summary: 'User authentication',
        tags: ['Authentication'],
        responses: {
          '200': {
            description: 'Login successful'
          }
        }
      }
    },
    '/api/tenants': {
      get: {
        summary: 'Get tenant information',
        tags: ['Tenants'],
        responses: {
          '200': {
            description: 'Tenant information retrieved successfully'
          }
        }
      }
    },
  },
  // Basic tag structure
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and authorization endpoints',
    },
    {
      name: 'Tenants',
      description: 'Multi-tenant management and configuration',
    },
  ],
};

// Serve Swagger spec for GET requests
export async function GET() {
  return NextResponse.json(swaggerSpec);
}

// Return minimal metadata for POST requests
export async function POST() {
  return NextResponse.json({
    success: true,
    data: swaggerSpec,
    metadata: {
      generatedAt: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    },
  });
}