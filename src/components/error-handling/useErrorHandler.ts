'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import { useState, useCallback, useEffect } from 'react';


/**
 * React hook for handling errors in functional components
 *
 * This hook provides a way to handle errors in functional components
 * and works well alongside ErrorBoundary components.
 *
 * @param fallbackUI - Optional function to render when an error occurs
 * @returns Object with error handling utilities
 *
 * @example
 * ```tsx
 * const { error, handleError, resetError } = useErrorHandler();
 *
 * if (error) {
 *   return <div>Something went wrong: {error.message}</div>;
 * }
 *
 * return (
 *   <div>
 *     <button onClick={() => {
 *       try {
 *         riskyOperation();
 *       } catch (_err) {
 *         handleError(_err);
 *       }
 *     }}>
 *       Perform Risky Operation
 *     </button>
 *   </div>
 * );
 * ```
 */
export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback((err: unknown) => {
    const error = err instanceof Error ? err : new Error(String(err));

    // Log the error
    console.error('Error caught by useErrorHandler', error, {
      hook: 'useErrorHandler',
      timestamp: new Date().toISOString(),
    });

    setError(error);

    // Return true to indicate the error was handled
    return true;
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  // Add support for global error handling
  useEffect(() => {
    const handleWindowError = (event: ErrorEvent) => {
      // Prevent handling the same error twice
      if (event.error && !error) {
        handleError(event.error);

        // Prevent the error from propagating if we handle it
        event.preventDefault();
      }
    };

    // Add window error listener for uncaught errors
    window.addEventListener('error', handleWindowError);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleWindowError);
    };
  }, [error, handleError]);

  return {
    error,
    handleError,
    resetError,
    isError: !!error,
  };
}

export default useErrorHandler;
