import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    const template = await db.getScheduleTemplateById(id);
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Optional override body for date range
    let activeFrom = template.active_from;
    let activeUntil = template.active_until;
    try {
      const body = await request.json();
      if (body?.active_from) activeFrom = body.active_from;
      if (body?.active_until) activeUntil = body.active_until;
    } catch (_) {
      // Body is optional
    }

    const effectiveTemplate = {
      ...template,
      active_from: activeFrom,
      active_until: activeUntil,
    };

    const existingSchedules = await db.getAllSchedules();
    const { created, skipped } = await db.generateFromTemplate(effectiveTemplate, existingSchedules);

    const updatedTemplate = await db.updateScheduleTemplate(id, {
      active_from: activeFrom,
      active_until: activeUntil,
      last_generated_at: new Date().toISOString(),
      last_generated_count: created,
    });

    return NextResponse.json({
      success: true,
      template: updatedTemplate || template,
      generated: { created, skipped },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
