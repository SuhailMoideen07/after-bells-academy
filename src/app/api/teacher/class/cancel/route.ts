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
    const { scheduleId, reason, remarks } = body;

    if (!scheduleId || !reason) {
      return NextResponse.json({ error: 'Schedule ID and Cancellation Reason are required' }, { status: 400 });
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

    schedule.status = 'cancelled';
    await db.updateScheduleStatus(schedule.id, 'cancelled');

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
      end_time: schedule.end_time,
      duration_minutes: 0,
      status: 'cancelled',
      cancelled_reason: reason,
      remarks: remarks ? String(remarks).trim() : '',
    });

    return NextResponse.json({
      success: true,
      message: 'Class cancelled and logged successfully',
      log: newLog,
      schedule,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
