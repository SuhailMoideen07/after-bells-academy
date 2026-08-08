import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
  }

  const batches = await db.getAllBatches();
  return NextResponse.json({ batches });
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { name, subject_name, grade_class, student_ids, student_names } = body;

    if (!name || !String(name).trim()) {
      return NextResponse.json({ error: 'Batch name is required' }, { status: 400 });
    }

    const newBatch = await db.createBatch({
      name: String(name).trim(),
      subject_name: subject_name ? String(subject_name).trim() : '',
      grade_class: grade_class ? String(grade_class).trim() : '',
      student_ids: Array.isArray(student_ids) ? student_ids : [],
      student_names: Array.isArray(student_names) ? student_names : [],
    });

    return NextResponse.json({ success: true, batch: newBatch });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, subject_name, grade_class, student_ids, student_names } = body;

    if (!id) {
      return NextResponse.json({ error: 'Batch ID is required for editing' }, { status: 400 });
    }

    const updatedBatch = await db.updateBatch(id, {
      ...(name && { name: String(name).trim() }),
      ...(subject_name !== undefined && { subject_name: String(subject_name).trim() }),
      ...(grade_class !== undefined && { grade_class: String(grade_class).trim() }),
      ...(Array.isArray(student_ids) && { student_ids }),
      ...(Array.isArray(student_names) && { student_names }),
    });

    if (!updatedBatch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, batch: updatedBatch });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Batch ID is required' }, { status: 400 });
    }

    const success = await db.deleteBatch(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
