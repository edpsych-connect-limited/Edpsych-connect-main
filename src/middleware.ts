import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getJwtFromRequest } from '@/lib/auth/edge-auth-adapter/jwt';

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
    
    // If it's an auth route, let it pass
    if (pathname.startsWith('/api/auth')) {
      return response;
    }

    // For other API routes, we might want to verify the token here too
    // But for now, we'll rely on the route handlers to check auth
    // or add a specific check for /api/protected/* if needed.
    return response;
  }

  // 2. Check if the path is protected
  const isProtected = PROTECTED_PATHS.some(path => pathname.startsWith(path));
  const isPublic = PUBLIC_PATHS.some(path => pathname.startsWith(path));

  if (isProtected && !isPublic) {
    // Verify authentication
    const payload = await getJwtFromRequest(request);

    if (!payload) {
      // User is not authenticated, redirect to login
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(url);
    }

    // Role-based access control (RBAC)
    // Example: /admin routes require ADMIN role
    if (pathname.startsWith('/admin')) {
      const userRole = (payload as any).role;
      if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
        // User does not have permission
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard'; // Redirect to user dashboard
        return NextResponse.redirect(url);
      }
    }
  }

  // 3. Redirect authenticated users away from auth pages
  if (pathname === '/login' || pathname === '/register') {
    const payload = await getJwtFromRequest(request);
    if (payload) {
      // User is already logged in, redirect to dashboard
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
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
