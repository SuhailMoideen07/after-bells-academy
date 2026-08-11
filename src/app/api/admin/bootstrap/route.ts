import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { getTodayFormatted } from '@/lib/utils';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const [teachers, students, batches, schedules, logs] = await Promise.all([
      db.getAllTeachers(),
      db.getAllStudents(),
      db.getAllBatches(),
      db.getAllSchedules(),
      db.getAllClassLogs(),
    ]);

    const recentLogs = logs.slice(0, 15);
    const todayStr = getTodayFormatted();
    const todaySchedules = schedules.filter(s => s.date === todayStr);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const classesToday = todaySchedules.length;
    const teachersActive = teachers.filter(t => t.status === 'active').length;
    const completedLogs = logs.filter(l => l.status === 'completed');
    const cancelledLogs = logs.filter(l => l.status === 'cancelled');

    const monthlyCompletedLogs = completedLogs.filter(l => {
      const d = new Date(l.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalMinutes = monthlyCompletedLogs.reduce((acc, l) => acc + (l.duration_minutes || 0), 0);
    const monthlyTeachingHours = Math.round((totalMinutes / 60) * 10) / 10;

    const analytics = {
      classesToday,
      teachersActive,
      classesCompleted: completedLogs.length,
      classesCancelled: cancelledLogs.length,
      monthlyTeachingHours,
    };

    return NextResponse.json({
      teachers,
      students,
      batches,
      schedules,
      recentLogs,
      todaySchedules,
      analytics,
      totalTeachers: teachers.length,
      totalStudents: students.length,
    });
  } catch (error: any) {
    console.error('Admin bootstrap API error:', error);
    return NextResponse.json({ error: error.message || 'Server error loading bootstrap data' }, { status: 500 });
  }
}
