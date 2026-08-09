import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { db, getTodayFormatted } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teacher = await db.getTeacherByUserId(user.id);
    const body = await request.json();
    const { scheduleId, remarks } = body;

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
      return NextResponse.json({ error: 'Class session is already finalized' }, { status: 400 });
    }

    const now = new Date();
    const actualEndTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    // Use scheduled end_time if available, otherwise actual end time
    const endTimeStr = schedule.end_time || actualEndTimeStr;

    // Calculate duration cleanly (fixed to 1 hour / 60 minutes by default)
    let durationMinutes = 60;
    if (schedule.start_time && schedule.end_time) {
      const [sH, sM] = schedule.start_time.split(':').map(Number);
      const [eH, eM] = schedule.end_time.split(':').map(Number);
      if (!isNaN(sH) && !isNaN(eH)) {
        const startTotal = sH * 60 + (sM || 0);
        const endTotal = eH * 60 + (eM || 0);
        if (endTotal > startTotal) {
          const diff = endTotal - startTotal;
          // Normal class duration: cap between 15 mins and 180 mins
          durationMinutes = Math.min(180, Math.max(15, diff));
        } else {
          // If inverted (e.g. 8 PM - 7 PM) or equal, default to 60 minutes (1 hour)
          durationMinutes = 60;
        }
      }
    }

    // Update schedule — persist end_time and status to database
    const finalSchedule = await db.updateSchedule(schedule.id, {
      end_time: endTimeStr,
      status: 'completed',
    }, { isAdminReschedule: false });

    // Create immutable class log
    const teacherObj = await db.getTeacherById(schedule.teacher_id);
    const studentObj = await db.getStudentById(schedule.student_id);

    const newLog = await db.createClassLog({
      schedule_id: schedule.id,
      teacher_id: schedule.teacher_id,
      teacher_name: teacherObj ? teacherObj.name : schedule.teacher_name || 'Teacher',
      student_id: schedule.student_id,
      student_name: studentObj ? studentObj.name : schedule.student_name || 'Student',
      student_names: schedule.student_names || [],
      is_batch: schedule.is_batch,
      batch_name: schedule.batch_name,
      subject_name: schedule.subject_name,
      grade_class: schedule.grade_class,
      date: schedule.date || getTodayFormatted(),
      start_time: schedule.start_time,
      end_time: endTimeStr,
      duration_minutes: durationMinutes,
      status: 'completed',
      remarks: remarks ? String(remarks).trim() : 'Class completed successfully.',
    });

    return NextResponse.json({
      success: true,
      message: 'Class ended and logged successfully',
      log: newLog,
      schedule: finalSchedule || schedule,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
