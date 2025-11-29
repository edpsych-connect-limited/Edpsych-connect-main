/**
 * Custom error types for the institutional management module
 */

/**
 * ValidationError - Thrown when input data fails validation
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * NotFoundError - Thrown when a requested resource is not found
 */
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

/**
 * AccessDeniedError - Thrown when a user does not have permission to perform an action
 */
export class AccessDeniedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AccessDeniedError';
  }
}

/**
 * DuplicateEntityError - Thrown when attempting to create a duplicate entity
 */
export class DuplicateEntityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DuplicateEntityError';
  }
}

/**
 * CircularReferenceError - Thrown when a circular reference is detected
 */
export class CircularReferenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircularReferenceError';
  }
}

/**
 * BusinessRuleViolationError - Thrown when a business rule is violated
 */
export class BusinessRuleViolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BusinessRuleViolationError';
  }
}