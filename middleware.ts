import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define public paths (pages accessible without login)
  const publicPaths = [
    '/login',
    '/register',
    '/auth/',
    '/pending-approval',
    '/terms',
    '/terms-of-service',
    '/privacy',
    '/privacy-policy',
    '/delete-account',
    '/about',
    '/contact'
  ];

  // Check if this is a public path
  const isPublicPath = publicPaths.some(p => path.startsWith(p)) || path.startsWith('/api/public');

  const token = request.cookies.get('session_token')?.value;
  const pendingToken = request.cookies.get('pending_token')?.value;

  // Pending-approval users should stay on pending flow until approved.
  if (pendingToken && !path.startsWith('/pending-approval') && !path.startsWith('/auth/')) {
    return NextResponse.redirect(new URL('/pending-approval', request.url));
  }

  // 1. If NO TOKEN
  if (!token) {
    // Allow public paths
    if (isPublicPath) {
      return NextResponse.next();
    }
    // Redirect to login for ALL other paths (including /)
    console.log(`[Middleware] No token, redirecting to login from: ${path}`);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', encodeURIComponent(path));
    return NextResponse.redirect(loginUrl);
  }

  // 2. If HAS TOKEN: trust backend for final authorization.
  if (path === '/login' || path === '/register') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (except auth-related) - let API handle its own auth
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};