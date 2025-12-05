/**
 * Client-Side Error Reporting Utility
 * 
 * Provides functions for React error boundaries to report errors to the server
 * without requiring Sentry or other external error tracking services.
 */

interface ErrorReportPayload {
  type: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  context?: Record<string, any>;
  url?: string;
  userAgent?: string;
  timestamp?: number;
}

/**
 * Report an error to the server
 * 
 * @param error - The error object or message
 * @param context - Additional context about the error
 * @param type - Error severity level
 */
export async function reportError(
  error: Error | string,
  context?: Record<string, any>,
  type: 'error' | 'warning' | 'info' = 'error'
): Promise<void> {
  try {
    const payload: ErrorReportPayload = {
      type,
      message: typeof error === 'string' ? error : error.message,
      stack: error instanceof Error ? error.stack : undefined,
      context,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      timestamp: Date.now(),
    };

    // Send to error reporting API
    // Using fetch with no error handling - if it fails, we just log to console
    // This prevents error reporting from breaking the app
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((err) => {
      console.error('Failed to report error to server:', err);
    });

    // Also log to console for local debugging
    console.error(`[${type.toUpperCase()}]`, typeof error === 'string' ? error : error.message, context);
  } catch (err) {
    // If error reporting fails, don't let it break the app
    console.error('Error reporting failed:', err);
  }
}

/**
 * Report a warning to the server
 */
export async function reportWarning(
  message: string,
  context?: Record<string, any>
): Promise<void> {
  await reportError(message, context, 'warning');
}

/**
 * Report an info message to the server
 */
export async function reportInfo(
  message: string,
  context?: Record<string, any>
): Promise<void> {
  await reportError(message, context, 'info');
}

/**
 * Report error from a React error boundary
 */
export async function reportErrorBoundaryError(
  error: Error,
  errorInfo: { componentStack: string }
): Promise<void> {
  await reportError(error, {
    errorSource: 'React Error Boundary',
    componentStack: errorInfo.componentStack,
  });
}
