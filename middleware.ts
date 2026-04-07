import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
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
    '/contact',
  ];

  const isPublicPath = publicPaths.some((p) => path.startsWith(p)) || path.startsWith('/api/public');
  const authMarker = request.cookies.get('frontend_auth')?.value;

  if (!authMarker && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', `${path}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (authMarker && (path === '/login' || path === '/register')) {
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