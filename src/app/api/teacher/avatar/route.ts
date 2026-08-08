import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { uploadImageToCloudinary, isCloudinaryConfigured } from '@/lib/cloudinary';

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teacher = await db.getTeacherByUserId(user.id);
    if (!teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Validate mime type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Please upload a valid image file (JPEG, PNG, WebP)' }, { status: 400 });
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let avatarUrl = '';

    if (isCloudinaryConfigured()) {
      // Upload to Cloudinary CDN
      const cloudinaryResult = await uploadImageToCloudinary(buffer, 'after-bells/avatars');
      avatarUrl = cloudinaryResult.secure_url;
    } else {
      // Fallback if Cloudinary keys are not configured yet
      const base64 = buffer.toString('base64');
      avatarUrl = `data:${file.type};base64,${base64}`;
    }

    // Update teacher record in DB
    const updatedTeacher = await db.updateTeacher(teacher.id, {
      avatar_url: avatarUrl,
    });

    return NextResponse.json({
      success: true,
      message: isCloudinaryConfigured()
        ? 'Profile photo uploaded to Cloudinary CDN successfully!'
        : 'Profile photo updated!',
      avatarUrl,
      teacher: updatedTeacher,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error uploading avatar' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teacher = await db.getTeacherByUserId(user.id);
    if (!teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
    }

    const updatedTeacher = await db.updateTeacher(teacher.id, { avatar_url: '' });

    return NextResponse.json({
      success: true,
      message: 'Profile photo removed',
      teacher: updatedTeacher,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
