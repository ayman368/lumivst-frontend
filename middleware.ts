import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ✅ قراءة متغير البيئة
const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED !== 'false';

// لو Auth معطل، رجّع كل الطلبات بدون تحقق
if (!AUTH_ENABLED) {
  console.log('🔓 Auth is DISABLED - all routes are public');
}

export function middleware(request: NextRequest) {
  // ✅ إذا Auth معطل، خلي كل الصفحات مفتوحة
  if (!AUTH_ENABLED) {
    return NextResponse.next();
  }

  // ✅ إذا Auth مفعل، شغل الحماية الطبيعية
  const token = request.cookies.get('token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  const protectedPaths = ['/dashboard', '/profile', '/stocks'];
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/stocks/:path*']
};