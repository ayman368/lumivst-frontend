import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Use same secret as backend
const SECRET_KEY = process.env.JWT_SECRET || "tqsdlvy=jtead%x)jmn5@jl%ior3_5am)k%(6=q+myn0!!v%)i";

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

  console.log(`[Middleware] Path: ${path}, Token: ${token ? 'Present' : 'Missing'}, IsPublic: ${isPublicPath}`);

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

  // 2. If HAS TOKEN
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(SECRET_KEY));
    console.log(`[Middleware] ${path} - User: ${payload.email} Approved: ${payload.is_approved} Admin: ${payload.is_admin}`);

    // A. Check Approval Status
    if (!payload.is_approved) {
      // Allow access ONLY to pending-approval page
      if (path.startsWith('/pending-approval')) {
        return NextResponse.next();
      }
      // Block API calls if unapproved (optional, but good for security)
      if (path.startsWith('/api/') && !path.startsWith('/api/auth/')) {
        return new NextResponse(JSON.stringify({ message: 'Account pending approval' }), { status: 403, headers: { 'content-type': 'application/json' } });
      }
      // Redirect everything else to pending-approval
      return NextResponse.redirect(new URL('/pending-approval', request.url));
    }

    // B. If User IS Approved
    if (path.startsWith('/pending-approval')) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Redirect away from auth pages if already logged in
    if (path === '/login' || path === '/register') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // C. Admin Route Protection
    if (path.startsWith('/admin')) {
      if (!payload.is_admin) { // Ensure boolean check
        console.log(`[Middleware] Admin Access Denied for ${payload.email}`);
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    return NextResponse.next();

  } catch (error) {
    console.error(`[Middleware] Token Verification Error:`, error);
    // Token invalid - Treat as No Token
    // If public path, allow (logging out the invalid token happens on client or next request)
    if (publicPaths.some(p => path.startsWith(p)) || path.startsWith('/api/public')) {
      const response = NextResponse.next();
      response.cookies.delete('session_token');
      return response;
    }
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('session_token');
    return response;
  }
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