import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await db.findUserByEmail(cleanEmail);

    // Security best practice: don't reveal if an email exists or not
    if (!user || user.status === 'disabled') {
      return NextResponse.json({
        message: 'If an account exists with this email address, a password reset link has been sent.',
      });
    }

    // Generate random 64-char crypto token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 60 minutes

    // Save token in DB
    await prisma.passwordResetToken.create({
      data: {
        email: cleanEmail,
        token: resetToken,
        expiresAt,
      },
    });

    let resetLink = '';
    if (process.env.NEXT_PUBLIC_APP_URL) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
      resetLink = `${baseUrl}/reset-password?token=${resetToken}`;
    } else {
      const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
      const proto = request.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
      resetLink = `${proto}://${host}/reset-password?token=${resetToken}`;
    }

    const mailRes = await sendPasswordResetEmail({
      toEmail: cleanEmail,
      userName: user.name,
      resetLink,
    });

    return NextResponse.json({
      message: 'If an account exists with this email address, a password reset link has been sent.',
    });
  } catch (error: any) {
    console.error('Error in /api/auth/forgot-password:', error);
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 });
  }
}
