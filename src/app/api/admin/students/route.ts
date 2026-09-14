import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const students = await db.getAllStudents();
  return NextResponse.json({ students });
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { name, grade_class, board, guardian_name, phone, assigned_teacher_id, subjects, monthly_fee, joining_date } = body;

    if (!name || !grade_class || !board || !guardian_name || !phone || !assigned_teacher_id) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const newStudent = await db.createStudent({
      name,
      grade_class,
      board,
      guardian_name,
      phone,
      assigned_teacher_id,
      subjects: Array.isArray(subjects) ? subjects : ['General'],
      monthly_fee: monthly_fee !== undefined ? parseFloat(monthly_fee) || 0 : 0,
      joining_date: joining_date || undefined,
      status: 'active',
    });

    return NextResponse.json({ success: true, student: newStudent });
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
    const { studentId, ...updates } = body;

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    if (updates.monthly_fee !== undefined) {
      updates.monthly_fee = parseFloat(updates.monthly_fee) || 0;
    }

    const updated = await db.updateStudent(studentId, updates);
    return NextResponse.json({ success: true, student: updated });
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
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    const success = await db.deleteStudent(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
