import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teacher = await db.getTeacherByUserId(user.id);
    const body = await request.json();
    const { scheduleId } = body;

    if (!scheduleId) {
      return NextResponse.json({ error: 'Schedule ID is required' }, { status: 400 });
    }

    const schedule = await db.getScheduleById(scheduleId);
    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    // Security ownership check
    if (user.role === 'teacher' && teacher && schedule.teacher_id !== teacher.id) {
      return NextResponse.json({ error: 'Forbidden: You do not own this class schedule' }, { status: 403 });
    }

    if (schedule.status === 'completed' || schedule.status === 'cancelled') {
      return NextResponse.json({ error: 'Cannot start a finalized class session' }, { status: 400 });
    }

    const now = new Date();
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Use updateSchedule to persist BOTH start_time and status to disk
    const updatedSchedule = await db.updateSchedule(schedule.id, {
      start_time: currentTimeStr,
      status: 'in_progress',
    }, { isAdminReschedule: false });

    return NextResponse.json({
      success: true,
      message: 'Class started successfully',
      schedule: updatedSchedule || schedule,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
