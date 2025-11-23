import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getJwtFromRequest } from '@/lib/auth/edge-auth-adapter/jwt';
import { routing } from './navigation';

const intlMiddleware = createMiddleware(routing);

// Paths that require authentication
const PROTECTED_PATHS = [
  '/dashboard',
  '/settings',
  '/profile',
  '/admin',
  '/assessments',
  '/reports',
  '/clients',
  '/calendar',
  '/messages',
  '/documents'
];

// Paths that are always public (even if they match a protected pattern somehow)
const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/',
  '/about',
  '/blog',
  '/contact',
  '/privacy',
  '/terms',
  '/api/auth' // Auth API must be public
];

// API paths that are public
const PUBLIC_API_PATHS = [
  '/api/auth',
  '/api/webhooks',
  '/api/waitlist',
  '/api/status',
  '/api/version'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Handle CORS for API routes
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }
    
    // Check if it's a public API route
    const isPublicApi = PUBLIC_API_PATHS.some(path => pathname.startsWith(path));
    
    if (isPublicApi) {
      return response;
    }

    // Verify authentication for protected API routes
    const payload = await getJwtFromRequest(request);
    if (!payload) {
      console.log('[Middleware] Unauthorized API request:', pathname);
      console.log('[Middleware] Cookies:', request.cookies.getAll());
      return NextResponse.json(
        { error: 'Unauthorized (Middleware)' },
        { status: 401, headers: response.headers }
      );
    }

    return response;
  }

  // Remove locale prefix for auth checking
  const pathnameWithoutLocale = pathname.replace(/^\/(en|cy)/, '') || '/';

  // 2. Check if the path is protected
  const isProtected = PROTECTED_PATHS.some(path => pathnameWithoutLocale.startsWith(path));
  const isPublic = PUBLIC_PATHS.some(path => pathnameWithoutLocale.startsWith(path));

  if (isProtected && !isPublic) {
    // Verify authentication
    const payload = await getJwtFromRequest(request);

    if (!payload) {
      // User is not authenticated, redirect to login
      const url = request.nextUrl.clone();
      url.pathname = '/en/login'; // Default to en for login redirect
      url.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(url);
    }

    // Role-based access control (RBAC)
    // Example: /admin routes require ADMIN role
    if (pathnameWithoutLocale.startsWith('/admin')) {
      const userRole = (payload as any).role;
      if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
        // User does not have permission
        const url = request.nextUrl.clone();
        url.pathname = '/en/dashboard'; // Redirect to user dashboard
        return NextResponse.redirect(url);
      }
    }
  }

  // 3. Redirect authenticated users away from auth pages
  if (pathnameWithoutLocale === '/login' || pathnameWithoutLocale === '/register') {
    const payload = await getJwtFromRequest(request);
    if (payload) {
      // User is already logged in, redirect to dashboard
      const url = request.nextUrl.clone();
      url.pathname = '/en/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return intlMiddleware(request);
}

// Match everything except static files
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - Images
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

