/**
 * API Error Handler Class
 * 
 * This file defines the core ApiError class that is used
 * throughout the API routes for standardized error handling.
 */

export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

/**
 * Validates that all required fields are present in an object
 */
export function validateRequiredFields(obj: Record<string, any>, fields: string[]): void {
  const missingFields = fields.filter(field => !obj[field]);
  if (missingFields.length > 0) {
    throw new ApiError(`Missing required fields: ${missingFields.join(', ')}`, 400);
  }
}