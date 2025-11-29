/**
 * Error Handling Components
 * 
 * This barrel file exports all error handling components and utilities
 * to simplify imports throughout the application.
 */

export { default as ErrorBoundary } from './ErrorBoundary';
export { default as ErrorDisplay } from './ErrorDisplay';
export { default as withErrorBoundary } from './withErrorBoundary';
export { default as useErrorHandler } from './useErrorHandler';

// Also export types
export type { ErrorBoundaryProps, ErrorBoundaryState } from './ErrorBoundary';