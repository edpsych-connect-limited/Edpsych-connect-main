'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';

/**
 * Not Found page for App Router
 * 
 * This component is shown when the router can't match a requested route
 * or when notFound() is thrown within a page.
 */
export default function NotFound() {
  try {
    if (typeof window === 'undefined' || typeof React === 'undefined' || !React.useContext) {
      // Prevent SSR crash when React or useContext is unavailable during prerender
      return (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <h1>404</h1>
          <p>Page Not Found</p>
        </div>
      );
    }
  } catch {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h1>404</h1>
        <p>Page Not Found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-5xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
        
        <p className="mb-8 text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved to a different location.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" passHref>
            <Button className="gap-2">
              <Home className="h-4 w-4" />
              Return Home
            </Button>
          </Link>
          
          <Link href="/search" passHref>
            <Button variant="outline" className="gap-2">
              <Search className="h-4 w-4" />
              Search Resources
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}