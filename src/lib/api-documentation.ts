/**
 * API Documentation Module
 * 
 * This module provides type definitions for the API.
 * NOTE: Full OpenAPI/Swagger integration has been disabled for deployment.
 */

import { z } from 'zod';

// Schema definitions
export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'educator', 'student']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;

export const AssessmentSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']),
  createdById: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Assessment = z.infer<typeof AssessmentSchema>;

export const SessionSchema = z.object({
  id: z.string().uuid(),
  studentId: z.string().uuid(),
  educatorId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  status: z.enum(['scheduled', 'in-progress', 'completed', 'cancelled']),
  notes: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Session = z.infer<typeof SessionSchema>;

// API Endpoints documentation (simplified, no OpenAPI integration)
export const API_ENDPOINTS = {
  users: {
    list: {
      path: '/api/users',
      method: 'GET',
      description: 'List all users',
      response: z.array(UserSchema),
    },
    get: {
      path: '/api/users/:id',
      method: 'GET',
      description: 'Get a user by ID',
      params: {
        id: 'User ID (UUID)',
      },
      response: UserSchema,
    }
  },
  assessments: {
    list: {
      path: '/api/assessments',
      method: 'GET',
      description: 'List all assessments',
      response: z.array(AssessmentSchema),
    }
  },
  sessions: {
    list: {
      path: '/api/sessions',
      method: 'GET',
      description: 'List all sessions',
      response: z.array(SessionSchema),
    }
  }
};

/**
 * Swagger UI configuration (simplified, for future re-integration)
 */
export function getSwaggerUI() {
  return {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customCssUrl: '/swagger.css',
  };
}