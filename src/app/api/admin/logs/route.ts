import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const teacherId = searchParams.get('teacherId');
  const studentId = searchParams.get('studentId');
  const subject = searchParams.get('subject');
  const status = searchParams.get('status');
  const date = searchParams.get('date');
  const month = searchParams.get('month'); // YYYY-MM format
  const batch = searchParams.get('batch');
  const search = searchParams.get('search');

  let logs = await db.getAllClassLogs();

  if (teacherId) {
    logs = logs.filter(l => l.teacher_id === teacherId);
  }
  if (studentId) {
    logs = logs.filter(l => l.student_id === studentId);
  }
  if (subject) {
    logs = logs.filter(l => l.subject_name.toLowerCase().includes(subject.toLowerCase()));
  }
  if (status) {
    logs = logs.filter(l => l.status === status);
  }
  if (date) {
    logs = logs.filter(l => l.date === date);
  }
  if (month) {
    logs = logs.filter(l => l.date && l.date.substring(0, 7) === month);
  }
  if (batch) {
    logs = logs.filter(l => l.batch_name === batch);
  }
  if (search) {
    const q = search.toLowerCase();
    logs = logs.filter(
      l =>
        l.teacher_name.toLowerCase().includes(q) ||
        l.student_name.toLowerCase().includes(q) ||
        l.subject_name.toLowerCase().includes(q) ||
        (l.remarks && l.remarks.toLowerCase().includes(q))
    );
  }

  const format = searchParams.get('format'); // csv or json

  if (format === 'csv') {
    const headers = ['Date', 'Start Time', 'End Time', 'Duration (Mins)', 'Teacher Name', 'Batch Name', 'Attended Student(s)', 'Subject', 'Grade/Class', 'Status', 'Remarks / Reason'];
    const rows = logs.map(l => {
      const studentList = l.student_names && l.student_names.length > 0 ? l.student_names.join('; ') : l.student_name;
      const remarksOrReason = l.status === 'cancelled' ? `Cancelled: ${l.cancelled_reason || l.remarks || ''}` : l.remarks || '';
      return [
        l.date,
        l.start_time,
        l.end_time,
        l.duration_minutes || 0,
        l.teacher_name,
        l.batch_name || 'N/A',
        studentList,
        l.subject_name,
        l.grade_class,
        l.status,
        remarksOrReason,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="class-logs-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  }

  return NextResponse.json({ logs, count: logs.length });
}
