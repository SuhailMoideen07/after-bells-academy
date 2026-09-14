import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';

function getCurrentMonthKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || getCurrentMonthKey();

    const data = await db.getFeeRecordsForMonth(month);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Fees GET error:', error);
    return NextResponse.json({ error: error.message || 'Server error loading fee records' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await request.json();

    if (body.action === 'mark_paid') {
      if (!body.id) {
        return NextResponse.json({ error: 'Fee record ID is required' }, { status: 400 });
      }
      const record = await db.markFeeAsPaid(
        body.id,
        body.payment_method || 'Cash',
        body.transaction_ref,
        body.remarks
      );
      return NextResponse.json({ success: true, record });
    }

    if (body.action === 'update_student_fee') {
      const { student_id, monthly_fee, month } = body;
      if (!student_id || monthly_fee === undefined) {
        return NextResponse.json({ error: 'student_id and monthly_fee are required' }, { status: 400 });
      }
      const parsedFee = parseFloat(monthly_fee) || 0;
      await db.updateStudent(student_id, { monthly_fee: parsedFee });

      // If a fee record ID is provided, sync the record amount_due if not already paid/prorated
      if (body.id) {
        await db.updateFeeRecord(body.id, {
          amount_due: parsedFee,
          base_amount: parsedFee,
        });
      }

      const monthKey = month || getCurrentMonthKey();
      const updatedData = await db.getFeeRecordsForMonth(monthKey);
      return NextResponse.json({ success: true, ...updatedData });
    }

    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: 'Fee record ID is required' }, { status: 400 });
    }

    if (updates.amount_due !== undefined) updates.amount_due = parseFloat(updates.amount_due) || 0;
    if (updates.amount_paid !== undefined) updates.amount_paid = parseFloat(updates.amount_paid) || 0;

    const record = await db.updateFeeRecord(id, updates);
    return NextResponse.json({ success: true, record });
  } catch (error: any) {
    console.error('Fees PUT error:', error);
    return NextResponse.json({ error: error.message || 'Server error updating fee record' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { action, id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Fee record ID is required' }, { status: 400 });
    }

    if (action === 'prorate') {
      const proratedAmount = parseFloat(body.prorated_amount);
      if (isNaN(proratedAmount) || proratedAmount < 0) {
        return NextResponse.json({ error: 'Valid prorated amount is required' }, { status: 400 });
      }
      const record = await db.manuallyProrateFeeRecord(id, {
        proratedAmount,
        reason: body.reason,
      });
      return NextResponse.json({ success: true, record });
    }

    if (action === 'reset_proration') {
      const record = await db.resetProration(id);
      return NextResponse.json({ success: true, record });
    }

    return NextResponse.json({ error: 'Invalid PATCH action' }, { status: 400 });
  } catch (error: any) {
    console.error('Fees PATCH error:', error);
    return NextResponse.json({ error: error.message || 'Server error updating fee proration' }, { status: 500 });
  }
}
