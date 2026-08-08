import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { db, getTodayFormatted } from '@/lib/db';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find teacher record associated with logged-in user
    let teacher = await db.getTeacherByUserId(user.id);

    // If logged-in user is an admin previewing the page, load the first active teacher
    if (!teacher && user.role === 'admin') {
      const allTeachers = await db.getAllTeachers();
      if (allTeachers.length > 0) {
        teacher = allTeachers[0];
      }
    }

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
    }

    const teacherId = teacher.id;

    // Parallel fetch all dashboard data in 1 concurrent roundtrip
    const [schedules, classLogs, assignedStudents, notifications] = await Promise.all([
      db.getSchedulesByTeacher(teacherId),
      db.getClassLogsByTeacher(teacherId),
      db.getStudentsByTeacherId(teacherId),
      db.getNotificationsByUser(user.id),
    ]);

    // Calculate teacher stats in-memory from loaded schedules & logs
    const todayStr = getTodayFormatted();
    const todayClassesCount = schedules.filter(s => s.date === todayStr).length;
    const upcomingClassesCount = schedules.filter(s => new Date(s.date).getTime() > new Date(todayStr).getTime()).length;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthLogs = classLogs.filter(log => {
      const d = new Date(log.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && log.status === 'completed';
    });

    const monthClassesCount = monthLogs.length;
    const monthMinutes = monthLogs.reduce((acc, l) => acc + (l.duration_minutes || 0), 0);
    const monthHours = Math.round((monthMinutes / 60) * 10) / 10;

    const stats = { todayClassesCount, upcomingClassesCount, monthClassesCount, monthHours };

    return NextResponse.json({
      teacher,
      stats,
      schedules,
      recentLogs: classLogs.slice(0, 10),
      assignedStudents,
      notifications,
    });
  } catch (error: any) {
    console.error('Teacher dashboard GET error:', error);
    return NextResponse.json({ error: error.message || 'Server error loading dashboard' }, { status: 500 });
  }
}
