import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing password reset token.' }, { status: 400 });
    }

    if (!newPassword || typeof newPassword !== 'string') {
      return NextResponse.json({ error: 'Please enter a new password.' }, { status: 400 });
    }

    // Password strength validation: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{}|;:',.<>?]).{8,}$/;
    if (!pwdRegex.test(newPassword)) {
      return NextResponse.json(
        {
          error:
            'Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.',
        },
        { status: 400 }
      );
    }

    // Find token in DB
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetRecord) {
      return NextResponse.json({ error: 'This password reset link is invalid or has already been used.' }, { status: 400 });
    }

    if (new Date() > resetRecord.expiresAt) {
      // Clean up expired token
      await prisma.passwordResetToken.delete({ where: { token } }).catch(() => {});
      return NextResponse.json({ error: 'This password reset link has expired. Please request a new one.' }, { status: 400 });
    }

    const user = await db.findUserByEmail(resetRecord.email);
    if (!user) {
      return NextResponse.json({ error: 'User account not found.' }, { status: 404 });
    }

    // Hash new password with 10-round bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Save hash & delete token
    await prisma.$transaction([
      prisma.userPassword.upsert({
        where: { userId: user.id },
        create: { userId: user.id, hash: passwordHash },
        update: { hash: passwordHash },
      }),
      prisma.passwordResetToken.delete({ where: { id: resetRecord.id } }),
    ]);

    return NextResponse.json({
      message: 'Your password has been successfully updated! You can now log in with your new password.',
    });
  } catch (error: any) {
    console.error('Error in /api/auth/reset-password:', error);
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 });
  }
}
