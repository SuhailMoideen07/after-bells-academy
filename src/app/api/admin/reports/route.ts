import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'teacher'; // teacher | student | subject | monthly
    const format = searchParams.get('format'); // csv or json
    const month = searchParams.get('month'); // YYYY-MM format (optional)

    let allLogs = await db.getAllClassLogs();

    // Filter by month period if specified
    if (month) {
      allLogs = allLogs.filter(l => l.date && l.date.substring(0, 7) === month);
    }

    if (reportType === 'teacher') {
      const teachers = await db.getAllTeachers();
      const breakdown = teachers.map(t => {
        const logs = allLogs.filter(l => l.teacher_id === t.id);
        const completed = logs.filter(l => l.status === 'completed');
        const cancelled = logs.filter(l => l.status === 'cancelled');
        const totalMinutes = completed.reduce((acc, l) => acc + (l.duration_minutes || 0), 0);

        return {
          id: t.id,
          name: t.name,
          email: t.email,
          totalClasses: logs.length,
          completedClasses: completed.length,
          cancelledClasses: cancelled.length,
          totalHours: Math.round((totalMinutes / 60) * 10) / 10,
        };
      });

      if (format === 'csv') {
        const escapeCsv = (val: string | number) => `"${String(val).replace(/"/g, '""')}"`;
        const headers = ['Teacher Name', 'Email', 'Total Classes', 'Completed', 'Cancelled', 'Total Hours'];
        const rows = breakdown.map(b => [b.name, b.email, b.totalClasses, b.completedClasses, b.cancelledClasses, b.totalHours]);
        const csvContent = [headers.map(escapeCsv).join(','), ...rows.map(r => r.map(escapeCsv).join(','))].join('\n');

        return new Response(csvContent, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="teacher-report-${new Date().toISOString().split('T')[0]}.csv"`,
          },
        });
      }

      return NextResponse.json({ reportType, data: breakdown });
    }

    if (reportType === 'student') {
      const students = await db.getAllStudents();
      const breakdown = students.map(s => {
        const logs = allLogs.filter(l => l.student_id === s.id);
        const completed = logs.filter(l => l.status === 'completed');
        const cancelled = logs.filter(l => l.status === 'cancelled');
        const totalMinutes = completed.reduce((acc, l) => acc + (l.duration_minutes || 0), 0);

        return {
          id: s.id,
          name: s.name,
          grade: s.grade_class,
          board: s.board,
          teacher: s.assigned_teacher_name,
          totalClasses: logs.length,
          completedClasses: completed.length,
          cancelledClasses: cancelled.length,
          totalHours: Math.round((totalMinutes / 60) * 10) / 10,
        };
      });

      if (format === 'csv') {
        const escapeCsv = (val: string | number | undefined) => `"${String(val ?? '').replace(/"/g, '""')}"`;
        const headers = ['Student Name', 'Grade', 'Board', 'Teacher', 'Total Classes', 'Completed', 'Cancelled', 'Total Hours'];
        const rows = breakdown.map(b => [b.name, b.grade, b.board, b.teacher, b.totalClasses, b.completedClasses, b.cancelledClasses, b.totalHours]);
        const csvContent = [headers.map(escapeCsv).join(','), ...rows.map(r => r.map(escapeCsv).join(','))].join('\n');

        return new Response(csvContent, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="student-report-${new Date().toISOString().split('T')[0]}.csv"`,
          },
        });
      }

      return NextResponse.json({ reportType, data: breakdown });
    }

    // Monthly breakdown
    const monthlyMap: Record<string, { month: string; completed: number; cancelled: number; minutes: number }> = {};
    allLogs.forEach(l => {
      const monthKey = l.date ? l.date.substring(0, 7) : 'Unknown'; // YYYY-MM
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { month: monthKey, completed: 0, cancelled: 0, minutes: 0 };
      }
      if (l.status === 'completed') {
        monthlyMap[monthKey].completed += 1;
        monthlyMap[monthKey].minutes += l.duration_minutes || 0;
      } else {
        monthlyMap[monthKey].cancelled += 1;
      }
    });

    const monthlyData = Object.values(monthlyMap).map(m => ({
      ...m,
      totalHours: Math.round((m.minutes / 60) * 10) / 10,
    }));

    return NextResponse.json({ reportType: 'monthly', data: monthlyData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error generating reports' }, { status: 500 });
  }
}
