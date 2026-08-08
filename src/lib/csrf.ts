import { NextRequest, NextResponse } from 'next/server';

export const CSRF_HEADER_NAME = 'x-csrf-token';
export const CSRF_COOKIE_NAME = 'aba_csrf_token';

/**
 * Validates CSRF origin and referer headers for state-mutating HTTP requests (POST, PUT, PATCH, DELETE).
 * Prevents Cross-Site Request Forgery attacks from external domains.
 */
export function validateCsrf(request: NextRequest): boolean {
  const method = request.method.toUpperCase();
  // Safe HTTP methods do not mutate state
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return true;
  }

  // Exempt public authentication routes (login, forgot-password, reset-password)
  const pathname = request.nextUrl.pathname;
  if (['/api/auth/login', '/api/auth/forgot-password', '/api/auth/reset-password'].includes(pathname)) {
    return true;
  }

  // Check Origin or Referer header
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const targetOrigin = request.nextUrl.origin;

  if (origin) {
    return origin === targetOrigin;
  }

  if (referer) {
    try {
      const refererUrl = new URL(referer);
      return refererUrl.origin === targetOrigin;
    } catch {
      return false;
    }
  }

  // If neither origin nor referer is provided on a state-mutating request, check x-requested-with header
  const requestedWith = request.headers.get('x-requested-with');
  if (requestedWith === 'XMLHttpRequest') {
    return true;
  }

  // Also check custom CSRF token header against cookie token if available
  const csrfHeaderToken = request.headers.get(CSRF_HEADER_NAME);
  const csrfCookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  if (csrfHeaderToken && csrfCookieToken && csrfHeaderToken === csrfCookieToken) {
    return true;
  }

  return false;
}
