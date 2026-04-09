import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Normalize path for comparison (remove trailing slash except for root)
  const normalizedPath = path === '/' ? '/' : path.replace(/\/+$/, '');

  const publicPaths = [
    '/login',
    '/register',
    '/auth',
    '/pending-approval',
    '/terms',
    '/terms-of-service',
    '/privacy',
    '/privacy-policy',
    '/delete-account',
    '/about',
    '/contact',
  ];

  const isPublicPath =
    publicPaths.some((p) => normalizedPath === p || normalizedPath.startsWith(p + '/')) ||
    normalizedPath.startsWith('/api/public');

  // Secure server-side verification: check for HTTP-only session tokens
  const hasSession = request.cookies.has('session_token');
  const hasRefresh = request.cookies.has('refresh_token');
  const hasPending = request.cookies.has('pending_token');

  // User is considered authenticated if they have a valid active session or a valid refresh token.
  // The Backend validates these tokens on API calls anyway.
  const isAuthenticated = hasSession || hasRefresh;

  // Not authenticated and trying to access protected page → redirect to login
  if (!isAuthenticated && !isPublicPath) {
    // If they have a pending token, send them to approval page instead of login
    if (hasPending) {
        return NextResponse.redirect(new URL('/pending-approval', request.url));
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', `${path}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated and trying to access login/register → redirect to home
  if (isAuthenticated && (normalizedPath === '/login' || normalizedPath === '/register')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};