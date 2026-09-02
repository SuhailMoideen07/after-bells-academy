import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const templates = await db.getAllScheduleTemplates();
    return NextResponse.json({ templates });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const {
      teacher_id,
      student_id,
      student_name,
      student_names,
      batch_name,
      is_batch,
      subject_name,
      grade_class,
      days_of_week,
      start_time,
      end_time,
      active_from,
      active_until,
    } = body;

    if (!teacher_id || !student_id || !subject_name || !grade_class || !days_of_week?.length || !start_time || !end_time || !active_from || !active_until) {
      return NextResponse.json({ error: 'Missing required template fields' }, { status: 400 });
    }

    // Strict validation: enforce exactly 1-hour class duration (60 minutes)
    const [sH, sM] = start_time.split(':').map(Number);
    const [eH, eM] = end_time.split(':').map(Number);
    if (!isNaN(sH) && !isNaN(eH)) {
      const diff = (eH * 60 + (eM || 0)) - (sH * 60 + (sM || 0));
      if (diff !== 60) {
        return NextResponse.json({ error: 'Invalid class duration! Only 1-hour classes (60 minutes) are allowed.' }, { status: 400 });
      }
    }

    // Validate date range
    if (active_from > active_until) {
      return NextResponse.json({ error: 'Active from date must be before active until date' }, { status: 400 });
    }

    const teacher = await db.getTeacherById(teacher_id);

    // Create the template
    const template = await db.createScheduleTemplate({
      teacher_id,
      teacher_name: teacher?.name,
      student_id,
      student_name,
      student_names: Array.isArray(student_names) ? student_names : [],
      batch_name: batch_name || '',
      is_batch: Boolean(is_batch || (student_names && student_names.length > 1)),
      subject_name,
      grade_class,
      days_of_week,
      start_time,
      end_time,
      active_from,
      active_until,
      is_active: true,
    });

    // Generate schedules immediately
    const existingSchedules = await db.getAllSchedules();
    const { created, skipped } = await db.generateFromTemplate(template, existingSchedules);

    // Update last_generated_at and count
    const updatedTemplate = await db.updateScheduleTemplate(template.id, {
      last_generated_at: new Date().toISOString(),
      last_generated_count: created,
    });

    return NextResponse.json({
      success: true,
      template: updatedTemplate || template,
      generated: { created, skipped },
    });
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
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    const updatedTemplate = await db.updateScheduleTemplate(id, updates);
    if (!updatedTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, template: updatedTemplate });
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
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    const success = await db.deleteScheduleTemplate(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
