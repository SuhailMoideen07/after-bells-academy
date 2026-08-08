import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { signJWT, setSessionCookie } from '@/lib/auth';
import { isValidEmail } from '@/lib/utils';

// --- In-memory rate limiter ---
// Tracks failed login attempts per IP. Resets on server restart (acceptable for this scale).
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

const MAX_ATTEMPTS = 5;           // Max failed attempts before lockout
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15-minute lockout
const CLEANUP_INTERVAL_MS = 30 * 60 * 1000; // Clean stale entries every 30 min

// Periodically clean up old entries to prevent memory leak
if (typeof globalThis !== 'undefined') {
  const globalForRate = globalThis as unknown as { _loginRateCleanup?: boolean };
  if (!globalForRate._loginRateCleanup) {
    globalForRate._loginRateCleanup = true;
    setInterval(() => {
      const now = Date.now();
      for (const [key, val] of loginAttempts.entries()) {
        if (now - val.lastAttempt > LOCKOUT_DURATION_MS) {
          loginAttempts.delete(key);
        }
      }
    }, CLEANUP_INTERVAL_MS);
  }
}

function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}

function isRateLimited(ip: string): { limited: boolean; remainingSeconds: number } {
  const entry = loginAttempts.get(ip);
  if (!entry) return { limited: false, remainingSeconds: 0 };

  const elapsed = Date.now() - entry.lastAttempt;

  // If lockout period has passed, reset
  if (elapsed > LOCKOUT_DURATION_MS) {
    loginAttempts.delete(ip);
    return { limited: false, remainingSeconds: 0 };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    const remainingMs = LOCKOUT_DURATION_MS - elapsed;
    return { limited: true, remainingSeconds: Math.ceil(remainingMs / 1000) };
  }

  return { limited: false, remainingSeconds: 0 };
}

function recordFailedAttempt(ip: string) {
  const entry = loginAttempts.get(ip);
  if (entry) {
    entry.count += 1;
    entry.lastAttempt = Date.now();
  } else {
    loginAttempts.set(ip, { count: 1, lastAttempt: Date.now() });
  }
}

function clearAttempts(ip: string) {
  loginAttempts.delete(ip);
}

export async function POST(request: Request) {
  try {
    const ip = getClientIP(request);

    // Check rate limit before processing
    const rateCheck = isRateLimited(ip);
    if (rateCheck.limited) {
      const minutes = Math.ceil(rateCheck.remainingSeconds / 60);
      return NextResponse.json(
        { error: `Too many failed login attempts. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    const user = await db.findUserByEmail(email);
    if (!user) {
      recordFailedAttempt(ip);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (user.status === 'disabled') {
      return NextResponse.json({ error: 'Account is disabled. Contact academy admin.' }, { status: 403 });
    }

    const isValid = await db.verifyUserPassword(user.id, password);
    if (!isValid) {
      recordFailedAttempt(ip);
      const entry = loginAttempts.get(ip);
      const remaining = MAX_ATTEMPTS - (entry?.count || 0);
      const message = remaining > 0
        ? `Invalid credentials. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`
        : 'Too many failed attempts. Account temporarily locked for 15 minutes.';
      return NextResponse.json({ error: message }, { status: 401 });
    }

    // Successful login — clear rate limit for this IP
    clearAttempts(ip);

    // Sign JWT Token
    const token = await signJWT(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      Boolean(rememberMe)
    );

    // Set cookie
    await setSessionCookie(token, Boolean(rememberMe));

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      redirect: user.role === 'admin' ? '/admin' : '/teacher',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
