import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { validateCsrf } from '@/lib/csrf';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
);

const COOKIE_NAME = 'aba_session_token';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // 1. CSRF Protection for state-mutating API requests (POST, PUT, DELETE, PATCH)
  if (pathname.startsWith('/api/') && !validateCsrf(request)) {
    return NextResponse.json(
      { error: 'CSRF Validation Failed: Cross-origin request blocked.' },
      { status: 403 }
    );
  }

  let session: { userId: string; role: 'admin' | 'teacher' } | null = null;

  if (token) {
    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      session = verified.payload as unknown as { userId: string; role: 'admin' | 'teacher' };
    } catch (e) {
      session = null;
    }
  }

  // 2. Unauthenticated users trying to access protected paths
  if (pathname.startsWith('/admin') || pathname.startsWith('/teacher')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Role checks
  if (pathname.startsWith('/admin') && session && session.role !== 'admin') {
    return NextResponse.redirect(new URL('/teacher', request.url));
  }

  // 4. Prevent logged-in users from visiting login page
  if (pathname === '/login' && session) {
    const redirectPath = session.role === 'admin' ? '/admin' : '/teacher';
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // 5. API Route Authorization Checks
  if (pathname.startsWith('/api/admin')) {
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }
  }

  if (pathname.startsWith('/api/teacher')) {
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Session required' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

// Support both proxy export and middleware fallback for Next.js 16
export const middleware = proxy;

export const config = {
  matcher: ['/admin/:path*', '/teacher/:path*', '/login', '/api/admin/:path*', '/api/teacher/:path*', '/api/auth/:path*'],
};
