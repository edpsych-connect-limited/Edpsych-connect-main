'use client'

import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import React from 'react';
import * as Sentry from "@sentry/nextjs";
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

/**
 * Global Error page for App Router
 * 
 * This component is used when an error occurs in the root layout or is not caught
 * by other error boundaries. It provides a minimal error display since it can't
 * rely on the app's layout being available.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
    if (error) console.error('Global Error:', error);
  }, [error]);

  if (typeof window === 'undefined' || typeof React === 'undefined' || !React.useContext) {
    return (
      <html lang="en">
        <body>
          <div className="text-center p-16">
            <h1 className="text-4xl font-bold mb-4">500</h1>
            <p className="text-xl">Internal Server Error</p>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md w-full mx-auto p-6 text-center">
            <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
            
            <div className="mb-6 p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
              <p className="font-medium">
                The application encountered a critical error.
              </p>
              <p className="text-sm mt-2">
                {process.env.NODE_ENV === 'development' 
                  ? error.message || 'An unknown error occurred'
                  : 'Our team has been notified and is working to fix the issue.'
                }
              </p>
              
              {process.env.NODE_ENV === 'development' && error.stack && (
                <details className="text-left mt-4">
                  <summary className="cursor-pointer text-sm">Error details</summary>
                  <pre className="mt-2 p-2 bg-muted rounded-md text-xs overflow-auto max-h-[200px] text-left">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
            
            <div className="flex justify-center gap-4">
              <Button 
                onClick={reset}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
              >
                Return Home
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}