/**
 * Institutional Management Services
 * 
 * This module exports all services related to institutional management,
 * providing a central point for accessing institution, department, contact,
 * and subscription management functionality.
 */

// Export error types
export * from './errors';

// Export services
import { institutionService } from './institution-service';
import { departmentService } from './department-service';
import { contactService } from './contact-service';
import { subscriptionService } from './subscription-service';
import { permissionService } from './permission-service';
import { auditLogService } from './audit-log-service';

// Export interfaces and types
export * from './types';

// Re-export services
export {
  institutionService,
  departmentService,
  contactService,
  subscriptionService,
  permissionService,
  auditLogService
};

// Export default service bundle
const institutionalManagementServices = {
  institutionService,
  departmentService,
  contactService,
  subscriptionService,
  permissionService,
  auditLogService,
};

export default institutionalManagementServices;