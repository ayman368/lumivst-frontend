import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ✅ Enable Authentication
const AUTH_ENABLED = true;

export function middleware(request: NextRequest) {
  // If Auth is disabled, allow all requests
  if (!AUTH_ENABLED) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Define public paths that do not require authentication
  const publicPaths = [
    '/login',
    '/register',
    '/signup', // Add if using signup
    '/auth',   // For auth callbacks and verification
  ];

  // Logic to identify public paths
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // Check for token in cookies or headers
  const token = request.cookies.get('token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  // If the user is on a public path (like login)
  if (isPublicPath) {
    // If they are already logged in, redirect them to home/dashboard
    if (token) {
      // You might want to specificy where to go. Usually root '/' or '/dashboard'
      // For now preventing login access if already logged in is good UX but optional.
      // Let's keep it simple: if public path, allow access.
      // If we want to redirect logged in users away from login:
      if (pathname === '/login' || pathname === '/register' || pathname === '/signup') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
    return NextResponse.next();
  }

  // Allow nextjs internals and static files
  if (pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname.startsWith('/favicon.ico') || pathname.match(/\.(png|jpg|jpeg|gif|ico)$/)) {
    return NextResponse.next();
  }

  // For all other routes (protected), if no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Match all request paths except for the ones starting with:
  // - api (API routes)
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};