import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { db } from './db';
import type { User, UserRole } from '@/types/tms';

if (!process.env.JWT_SECRET) {
  throw new Error(
    'FATAL: JWT_SECRET environment variable is not set. ' +
    'Set it in .env.local (development) or your hosting provider\'s environment settings (production). ' +
    'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"'
  );
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export const COOKIE_NAME = 'aba_session_token';

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  exp?: number;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // First attempt bcrypt compare (for properly hashed passwords)
  try {
    const match = await bcrypt.compare(password, hash);
    if (match) return true;
  } catch (_) {
    // Not a bcrypt hash — fall through to legacy check
  }
  // Fallback to SHA-256 simple hash comparison (legacy seeded passwords)
  const { verifyPasswordSimple } = await import('./db');
  return verifyPasswordSimple(password, hash);
}

export async function signJWT(payload: TokenPayload, rememberMe: boolean = false): Promise<string> {
  const expiration = rememberMe ? '30d' : '24h';
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiration)
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<TokenPayload | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as unknown as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function getSessionUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(COOKIE_NAME);
    if (!tokenCookie || !tokenCookie.value) return null;

    const payload = await verifyJWT(tokenCookie.value);
    if (!payload || !payload.userId) return null;

    const user = await db.findUserById(payload.userId);
    if (!user || user.status === 'disabled') return null;

    return user;
  } catch (error) {
    return null;
  }
}

export async function setSessionCookie(token: string, rememberMe: boolean = false) {
  const cookieStore = await cookies();
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days vs 24 hrs in seconds

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
