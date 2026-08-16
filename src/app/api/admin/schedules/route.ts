import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';

function getDayOfWeekName(dateStr: string): string {
  if (!dateStr) return 'Scheduled';
  const parts = dateStr.split('T')[0].split('-').map(Number);
  if (parts.length === 3) {
    const [y, m, d] = parts;
    const selectedDate = new Date(y, m - 1, d);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[selectedDate.getDay()] || 'Scheduled';
  }
  return 'Scheduled';
}

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const schedules = await db.getAllSchedules();
  return NextResponse.json({ schedules });
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
      day_of_week,
      start_time,
      end_time,
      date,
    } = body;

    if (!teacher_id || (!student_id && (!student_names || student_names.length === 0)) || !subject_name || !start_time || !end_time || !date) {
      return NextResponse.json({ error: 'Missing required schedule fields' }, { status: 400 });
    }

    // Strict Validation: enforce exactly 1-hour (60 minutes) duration
    if (start_time && end_time) {
      const [sH, sM] = start_time.split(':').map(Number);
      const [eH, eM] = end_time.split(':').map(Number);
      if (!isNaN(sH) && !isNaN(eH)) {
        const diff = (eH * 60 + (eM || 0)) - (sH * 60 + (sM || 0));
        if (diff !== 60) {
          return NextResponse.json(
            { error: 'Invalid class duration! Only 1-hour classes (60 minutes) are allowed.' },
            { status: 400 }
          );
        }
      }
    }

    // Server-side deduplication check: verify if an identical schedule already exists
    const existingSchedules = await db.getAllSchedules();
    const targetStudentName = student_name || 'Student Batch';
    const duplicate = existingSchedules.find(
      s =>
        s.teacher_id === teacher_id &&
        s.date === date &&
        s.start_time === start_time &&
        s.end_time === end_time &&
        s.subject_name === subject_name &&
        ((batch_name && s.batch_name === batch_name) || s.student_name === targetStudentName)
    );
    if (duplicate) {
      return NextResponse.json({ success: true, schedule: duplicate, duplicatePrevented: true });
    }

    const newSchedule = await db.createSchedule({
      teacher_id,
      student_id: student_id || 'batch_grp',
      student_name: targetStudentName,
      student_names: Array.isArray(student_names) ? student_names : [],
      batch_name: batch_name || '',
      is_batch: Boolean(is_batch || (student_names && student_names.length > 1)),
      subject_name,
      grade_class: grade_class || 'General',
      day_of_week: (day_of_week && day_of_week !== 'Today') ? day_of_week : getDayOfWeekName(date),
      start_time,
      end_time,
      date,
      status: 'scheduled',
    });

    return NextResponse.json({ success: true, schedule: newSchedule });
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
    const { id, start_time, end_time, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Schedule ID is required for editing' }, { status: 400 });
    }

    // Strict Validation: enforce exactly 1-hour (60 minutes) duration
    if (start_time && end_time) {
      const [sH, sM] = start_time.split(':').map(Number);
      const [eH, eM] = end_time.split(':').map(Number);
      if (!isNaN(sH) && !isNaN(eH)) {
        const diff = (eH * 60 + (eM || 0)) - (sH * 60 + (sM || 0));
        if (diff !== 60) {
          return NextResponse.json(
            { error: 'Invalid class duration! Only 1-hour classes (60 minutes) are allowed.' },
            { status: 400 }
          );
        }
      }
    }

    const updatedSchedule = await db.updateSchedule(id, {
      ...(start_time && { start_time }),
      ...(end_time && { end_time }),
      ...updates,
    });

    if (!updatedSchedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, schedule: updatedSchedule });
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
    const clearAll = searchParams.get('all');
    const id = searchParams.get('id');

    if (clearAll === 'true') {
      await db.clearAllSchedules();
      return NextResponse.json({ success: true, message: 'All schedules cleared' });
    }

    if (id) {
      const success = await db.deleteSchedule(id);
      return NextResponse.json({ success });
    }

    return NextResponse.json({ error: 'Schedule ID or clear all flag required' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
