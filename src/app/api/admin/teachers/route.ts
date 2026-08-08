import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { isValidEmail, validatePasswordStrength } from '@/lib/utils';

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const teachers = await db.getAllTeachers();
  return NextResponse.json({ teachers });
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, phone, password, subjects, bio } = body;

    if (!name || !email || !password || !phone) {
      return NextResponse.json({ error: 'Name, email, phone, and password are required' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    const passCheck = validatePasswordStrength(password);
    if (!passCheck.valid) {
      return NextResponse.json({ error: passCheck.error }, { status: 400 });
    }

    const existingUser = await db.findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    const newTeacher = await db.createTeacherAccount({
      name,
      email,
      phone,
      passwordRaw: password,
      subjects: Array.isArray(subjects) ? subjects : ['General'],
      bio,
    });

    return NextResponse.json({ success: true, teacher: newTeacher });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { teacherId, action, ...updates } = body;

    if (!teacherId) {
      return NextResponse.json({ error: 'Teacher ID is required' }, { status: 400 });
    }

    const teacher = await db.getTeacherById(teacherId);
    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    if (action === 'reset_password') {
      const { newPassword } = updates;
      if (!newPassword) {
        return NextResponse.json({ error: 'New password is required' }, { status: 400 });
      }
      const passCheck = validatePasswordStrength(newPassword);
      if (!passCheck.valid) {
        return NextResponse.json({ error: passCheck.error }, { status: 400 });
      }
      await db.resetUserPassword(teacher.user_id, newPassword);
      return NextResponse.json({ success: true, message: 'Password reset successfully' });
    }

    if (updates.email && !isValidEmail(updates.email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    if (action === 'toggle_status') {
      const newStatus = teacher.status === 'active' ? 'disabled' : 'active';
      await db.updateUserStatus(teacher.user_id, newStatus);
      return NextResponse.json({ success: true, teacher: await db.getTeacherById(teacherId) });
    }

    const updatedTeacher = await db.updateTeacher(teacherId, updates);
    return NextResponse.json({ success: true, teacher: updatedTeacher });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Teacher ID is required' }, { status: 400 });
    }

    const success = await db.deleteTeacher(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
