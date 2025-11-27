/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

// Simple mock implementation of institution service
import { logger } from '../utils/logger';
import { performance } from 'perf_hooks';

// Mock institution data for fallback
const MOCK_INSTITUTIONS = [
  {
    id: "mock-institution-1",
    name: "Cambridge University",
    type: "University",
    country: "United Kingdom",
    activeUsers: 3250,
    departments: [
      { id: "dept-1", name: "Psychology Department" },
      { id: "dept-2", name: "Educational Sciences" },
    ],
    contacts: [
      { id: "contact-1", name: "Dr. Scott Ighavongbe-Patrick", email: "scott@example.edu", role: "Administrator" }
    ],
    subscriptions: [
      {
        id: "sub-1",
        plan: { id: "plan-1", name: "Enterprise", features: ["All Features"] },
        billingContact: { id: "billing-1", name: "Finance Department", email: "finance@example.edu" }
      }
    ]
  },
  {
    id: "mock-institution-2",
    name: "Oxford University",
    type: "University",
    country: "United Kingdom",
    activeUsers: 2800,
    departments: [
      { id: "dept-3", name: "Cognitive Science" },
      { id: "dept-4", name: "Educational Psychology" },
    ],
    contacts: [
      { id: "contact-2", name: "Dr. Scott Ighavongbe-Patrick", email: "scott@example.edu", role: "Administrator" }
    ],
    subscriptions: [
      {
        id: "sub-2",
        plan: { id: "plan-2", name: "Professional", features: ["Core Features"] },
        billingContact: { id: "billing-2", name: "Accounts Department", email: "accounts@example.edu" }
      }
    ]
  }
];

export class InstitutionService {
  /**
   * Create a new institution
   * Returns a mock institution
   */
  async createInstitution(data: any) {
    const startTime = performance.now();
    
    try {
      logger.info('Creating institution (mock)', { name: data.name });
      const mockInstitution = {
        id: `mock-institution-${Date.now()}`,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Log performance metrics
      const duration = performance.now() - startTime;
      logger.info('Mock institution created', {
        duration_ms: duration.toFixed(2)
      });
      
      return mockInstitution;
    } catch (error: any) {
      // Log the error with context
      logger.error('Failed to create institution', error, {
        name: data?.name,
        duration_ms: (performance.now() - startTime).toFixed(2)
      });
      
      throw new Error(`Failed to create institution: ${error.message}`);
    }
  }

  /**
   * Get institution by ID
   * Falls back to mock data
   */
  async getInstitution(id: string) {
    const startTime = performance.now();
    
    try {
      logger.info('Fetching institution (mock)', { id: id });
      const mockInstitution = MOCK_INSTITUTIONS.find(inst => inst.id === id) ||
                              MOCK_INSTITUTIONS[0]; // Fallback to first mock if ID not found
      
      // Log performance metrics
      const duration = performance.now() - startTime;
      logger.info('Mock institution fetched', {
        duration_ms: duration.toFixed(2)
      });
      
      return mockInstitution;
    } catch (error: any) {
      // Log the error with context
      logger.error('Failed to get institution', error, {
        id: id,
        duration_ms: (performance.now() - startTime).toFixed(2)
      });
      
      logger.warn('Using mock institution due to error', { id: id });
      return MOCK_INSTITUTIONS.find(inst => inst.id === id) || MOCK_INSTITUTIONS[0];
    }
  }
  
  /**
   * Get all institutions
   * For landing page display with proper fallback
   */
  async getInstitutionsCount() {
    try {
      return MOCK_INSTITUTIONS.length;
    } catch (error: any) {
      logger.error('Failed to get institutions count', error);
      return MOCK_INSTITUTIONS.length; // Fallback to mock count
    }
  }
  
  /**
   * Get total active users across all institutions
   * For landing page display with proper fallback
   */
  async getActiveUsersCount() {
    try {
      return MOCK_INSTITUTIONS.reduce((total, inst) => total + (inst.activeUsers || 0), 0);
    } catch (error: any) {
      logger.error('Failed to get active users count', error);
      return MOCK_INSTITUTIONS.reduce((total, inst) => total + (inst.activeUsers || 0), 0);
    }
  }
}

// Create singleton instance
export const institutionService = new InstitutionService();
export default institutionService;