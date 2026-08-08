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

    const [analytics, teachers, students, allLogs, allSchedules] = await Promise.all([
      db.getAdminAnalytics(),
      db.getAllTeachers(),
      db.getAllStudents(),
      db.getAllClassLogs(),
      db.getAllSchedules(),
    ]);

    const recentLogs = allLogs.slice(0, 15);
    const todayStr = getTodayFormatted();
    const todaySchedules = allSchedules.filter(s => s.date === todayStr);

    return NextResponse.json({
      analytics,
      totalTeachers: teachers.length,
      totalStudents: students.length,
      todaySchedules,
      recentLogs,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error loading admin analytics' }, { status: 500 });
  }
}
