import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teacher = await db.getTeacherByUserId(user.id);
    if (!teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
    }

    return NextResponse.json({ teacher });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teacher = await db.getTeacherByUserId(user.id);
    if (!teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const { avatar_url, bio, phone, name } = body;

    // Optional validation for base64 size (max ~3MB)
    if (avatar_url && typeof avatar_url === 'string' && avatar_url.length > 4 * 1024 * 1024) {
      return NextResponse.json({ error: 'Profile image size is too large. Please select a smaller photo.' }, { status: 400 });
    }

    const updatedTeacher = await db.updateTeacher(teacher.id, {
      ...(avatar_url !== undefined && { avatar_url: String(avatar_url) }),
      ...(bio !== undefined && { bio: String(bio) }),
      ...(phone !== undefined && { phone: String(phone) }),
      ...(name !== undefined && { name: String(name) }),
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      teacher: updatedTeacher,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
