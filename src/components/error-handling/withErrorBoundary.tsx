import React from 'react';
import type { ComponentType, ErrorInfo, ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';

interface WithErrorBoundaryOptions {
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropChange?: boolean;
  showErrorDetails?: boolean;
}

/**
 * Higher-Order Component that wraps a component with an ErrorBoundary
 * 
 * @param Component - The component to wrap
 * @param options - Configuration options for the ErrorBoundary
 * @returns A new component wrapped with an ErrorBoundary
 * 
 * @example
 * ```tsx
 * const SafeComponent = withErrorBoundary(MyComponent, {
 *   fallback: <p>Something went wrong with MyComponent</p>,
 *   showErrorDetails: process.env.NODE_ENV === 'development'
 * });
 * ```
 */
export function withErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
): ComponentType<P> {
  const { 
    fallback,
    onError,
    resetOnPropChange = false,
    showErrorDetails = process.env.NODE_ENV === 'development'
  } = options;

  const displayName = Component.displayName || Component.name || 'Component';

  const WrappedComponent = (props: P): React.ReactElement => (
    <ErrorBoundary
      fallback={fallback}
      onError={onError}
      resetOnPropChange={resetOnPropChange}
      showErrorDetails={showErrorDetails}
    >
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${displayName})`;

  return WrappedComponent;
}

export default withErrorBoundary;