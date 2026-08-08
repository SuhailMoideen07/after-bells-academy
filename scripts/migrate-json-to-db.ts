import fs from 'fs';
import path from 'path';
import { PrismaClient, Role, Status, ScheduleStatus } from '@prisma/client';

const prisma = new PrismaClient();

function toRole(r?: string): Role {
  return r === 'admin' ? Role.admin : Role.teacher;
}

function toStatus(s?: string): Status {
  return s === 'disabled' ? Status.disabled : Status.active;
}

function toScheduleStatus(s?: string): ScheduleStatus {
  if (s === 'in_progress') return ScheduleStatus.in_progress;
  if (s === 'completed') return ScheduleStatus.completed;
  if (s === 'cancelled') return ScheduleStatus.cancelled;
  return ScheduleStatus.scheduled;
}

async function main() {
  const jsonPath = path.join(process.cwd(), 'data', 'academy_db.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('No academy_db.json file found at', jsonPath);
    return;
  }

  const raw = fs.readFileSync(jsonPath, 'utf-8');
  const data = JSON.parse(raw);

  console.log('--- Starting Migration from JSON to PostgreSQL ---');

  // 1. Migrate Users
  if (Array.isArray(data.users)) {
    console.log(`Migrating ${data.users.length} users...`);
    for (const u of data.users) {
      await prisma.user.upsert({
        where: { id: u.id },
        update: {
          email: u.email,
          name: u.name,
          role: toRole(u.role),
          status: toStatus(u.status),
          createdAt: u.created_at ? new Date(u.created_at) : new Date(),
        },
        create: {
          id: u.id,
          email: u.email,
          name: u.name,
          role: toRole(u.role),
          status: toStatus(u.status),
          createdAt: u.created_at ? new Date(u.created_at) : new Date(),
        },
      });
    }
  }

  // 2. Migrate User Passwords
  if (data._passwords && typeof data._passwords === 'object') {
    console.log(`Migrating password hashes...`);
    for (const [userId, hash] of Object.entries(data._passwords)) {
      await prisma.userPassword.upsert({
        where: { userId },
        update: { hash: String(hash) },
        create: { userId, hash: String(hash) },
      });
    }
  }

  // 3. Migrate Subjects
  if (Array.isArray(data.subjects)) {
    console.log(`Migrating ${data.subjects.length} subjects...`);
    for (const s of data.subjects) {
      await prisma.subject.upsert({
        where: { id: s.id },
        update: { name: s.name, code: s.code },
        create: { id: s.id, name: s.name, code: s.code },
      });
    }
  }

  // 4. Migrate Teachers
  if (Array.isArray(data.teachers)) {
    console.log(`Migrating ${data.teachers.length} teachers...`);
    for (const t of data.teachers) {
      await prisma.teacher.upsert({
        where: { id: t.id },
        update: {
          userId: t.user_id,
          email: t.email,
          name: t.name,
          phone: t.phone,
          avatarUrl: t.avatar_url || null,
          bio: t.bio || '',
          subjects: t.subjects || [],
          assignedStudentCount: t.assigned_student_count || 0,
          status: toStatus(t.status),
          createdAt: t.created_at ? new Date(t.created_at) : new Date(),
        },
        create: {
          id: t.id,
          userId: t.user_id,
          email: t.email,
          name: t.name,
          phone: t.phone,
          avatarUrl: t.avatar_url || null,
          bio: t.bio || '',
          subjects: t.subjects || [],
          assignedStudentCount: t.assigned_student_count || 0,
          status: toStatus(t.status),
          createdAt: t.created_at ? new Date(t.created_at) : new Date(),
        },
      });
    }
  }

  // 5. Migrate Students
  if (Array.isArray(data.students)) {
    console.log(`Migrating ${data.students.length} students...`);
    for (const st of data.students) {
      await prisma.student.upsert({
        where: { id: st.id },
        update: {
          name: st.name,
          gradeClass: st.grade_class,
          board: st.board,
          guardianName: st.guardian_name,
          phone: st.phone,
          assignedTeacherId: st.assigned_teacher_id || null,
          subjects: st.subjects || [],
          status: toStatus(st.status),
          createdAt: st.created_at ? new Date(st.created_at) : new Date(),
        },
        create: {
          id: st.id,
          name: st.name,
          gradeClass: st.grade_class,
          board: st.board,
          guardianName: st.guardian_name,
          phone: st.phone,
          assignedTeacherId: st.assigned_teacher_id || null,
          subjects: st.subjects || [],
          status: toStatus(st.status),
          createdAt: st.created_at ? new Date(st.created_at) : new Date(),
        },
      });
    }
  }

  // 6. Migrate Batches
  if (Array.isArray(data.batches)) {
    console.log(`Migrating ${data.batches.length} batches...`);
    for (const b of data.batches) {
      await prisma.batch.upsert({
        where: { id: b.id },
        update: {
          name: b.name,
          subjectName: b.subject_name || '',
          gradeClass: b.grade_class || '',
          studentIds: b.student_ids || [],
          studentNames: b.student_names || [],
          createdAt: b.created_at ? new Date(b.created_at) : new Date(),
        },
        create: {
          id: b.id,
          name: b.name,
          subjectName: b.subject_name || '',
          gradeClass: b.grade_class || '',
          studentIds: b.student_ids || [],
          studentNames: b.student_names || [],
          createdAt: b.created_at ? new Date(b.created_at) : new Date(),
        },
      });
    }
  }

  // 7. Migrate Schedules
  if (Array.isArray(data.schedules)) {
    console.log(`Migrating ${data.schedules.length} schedules...`);
    for (const sch of data.schedules) {
      await prisma.schedule.upsert({
        where: { id: sch.id },
        update: {
          teacherId: sch.teacher_id,
          studentId: sch.student_id,
          studentName: sch.student_name || null,
          studentNames: sch.student_names || [],
          isBatch: Boolean(sch.is_batch),
          batchName: sch.batch_name || null,
          subjectName: sch.subject_name,
          gradeClass: sch.grade_class,
          dayOfWeek: sch.day_of_week,
          startTime: sch.start_time,
          endTime: sch.end_time,
          date: sch.date,
          status: toScheduleStatus(sch.status),
          isRescheduled: Boolean(sch.is_rescheduled),
          rescheduledAt: sch.rescheduled_at ? new Date(sch.rescheduled_at) : null,
        },
        create: {
          id: sch.id,
          teacherId: sch.teacher_id,
          studentId: sch.student_id,
          studentName: sch.student_name || null,
          studentNames: sch.student_names || [],
          isBatch: Boolean(sch.is_batch),
          batchName: sch.batch_name || null,
          subjectName: sch.subject_name,
          gradeClass: sch.grade_class,
          dayOfWeek: sch.day_of_week,
          startTime: sch.start_time,
          endTime: sch.end_time,
          date: sch.date,
          status: toScheduleStatus(sch.status),
          isRescheduled: Boolean(sch.is_rescheduled),
          rescheduledAt: sch.rescheduled_at ? new Date(sch.rescheduled_at) : null,
        },
      });
    }
  }

  // 8. Migrate Class Logs
  if (Array.isArray(data.classLogs)) {
    console.log(`Migrating ${data.classLogs.length} class logs...`);
    const validSchedules = await prisma.schedule.findMany({ select: { id: true } });
    const scheduleIdSet = new Set(validSchedules.map(s => s.id));

    for (const cl of data.classLogs) {
      const scheduleIdVal = (cl.schedule_id && scheduleIdSet.has(cl.schedule_id)) ? cl.schedule_id : null;

      await prisma.classLog.upsert({
        where: { id: cl.id },
        update: {
          scheduleId: scheduleIdVal,
          teacherId: cl.teacher_id,
          teacherName: cl.teacher_name,
          studentId: cl.student_id,
          studentName: cl.student_name,
          studentNames: cl.student_names || [],
          isBatch: Boolean(cl.is_batch),
          batchName: cl.batch_name || null,
          subjectName: cl.subject_name,
          gradeClass: cl.grade_class,
          date: cl.date,
          startTime: cl.start_time,
          endTime: cl.end_time,
          durationMinutes: cl.duration_minutes || 60,
          status: cl.status,
          remarks: cl.remarks || null,
          cancelledReason: cl.cancelled_reason || null,
          createdAt: cl.created_at ? new Date(cl.created_at) : new Date(),
        },
        create: {
          id: cl.id,
          scheduleId: scheduleIdVal,
          teacherId: cl.teacher_id,
          teacherName: cl.teacher_name,
          studentId: cl.student_id,
          studentName: cl.student_name,
          studentNames: cl.student_names || [],
          isBatch: Boolean(cl.is_batch),
          batchName: cl.batch_name || null,
          subjectName: cl.subject_name,
          gradeClass: cl.grade_class,
          date: cl.date,
          startTime: cl.start_time,
          endTime: cl.end_time,
          durationMinutes: cl.duration_minutes || 60,
          status: cl.status,
          remarks: cl.remarks || null,
          cancelledReason: cl.cancelled_reason || null,
          createdAt: cl.created_at ? new Date(cl.created_at) : new Date(),
        },
      });
    }
  }

  // 9. Migrate Notifications
  if (Array.isArray(data.notifications)) {
    console.log(`Migrating ${data.notifications.length} notifications...`);
    for (const n of data.notifications) {
      await prisma.notificationItem.upsert({
        where: { id: n.id },
        update: {
          userId: n.user_id,
          title: n.title,
          message: n.message,
          type: n.type,
          readStatus: Boolean(n.read_status),
          createdAt: n.created_at ? new Date(n.created_at) : new Date(),
        },
        create: {
          id: n.id,
          userId: n.user_id,
          title: n.title,
          message: n.message,
          type: n.type,
          readStatus: Boolean(n.read_status),
          createdAt: n.created_at ? new Date(n.created_at) : new Date(),
        },
      });
    }
  }

  console.log('--- Migration Completed Successfully! ---');
}

main()
  .catch(e => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
