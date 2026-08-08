import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local / .env
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, 'utf-8');
  content.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^["']|["']$/g, '');
      process.env[key] = val;
    }
  });
}

import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Clearing all demo & test data from Supabase PostgreSQL & Local Storage...');

  try {
    // Get Admin User IDs to preserve
    const adminUsers = await prisma.user.findMany({ where: { role: 'admin' } });
    const adminUserIds = adminUsers.map(u => u.id);

    // 1. Clear Supabase PostgreSQL database tables (preserving admin user)
    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany(),
      prisma.notificationItem.deleteMany(),
      prisma.classLog.deleteMany(),
      prisma.schedule.deleteMany(),
      prisma.batch.deleteMany(),
      prisma.student.deleteMany(),
      prisma.teacher.deleteMany(),
      prisma.userPassword.deleteMany({
        where: {
          userId: { notIn: adminUserIds },
        },
      }),
      prisma.user.deleteMany({
        where: {
          id: { notIn: adminUserIds },
        },
      }),
    ]);

    console.log('✅ Supabase PostgreSQL: All teachers, students, batches, schedules, and logs cleared.');

    // 2. Clear Local JSON Fallback File (academy_db.json)
    const dbFile = path.join(process.cwd(), 'data', 'academy_db.json');
    if (fs.existsSync(dbFile)) {
      const raw = fs.readFileSync(dbFile, 'utf-8');
      const parsed = JSON.parse(raw);

      // Preserve admin user & admin password
      const jsonAdminUsers = (parsed.users || []).filter((u: any) => u.role === 'admin');
      const adminPasswords: Record<string, string> = {};
      jsonAdminUsers.forEach((u: any) => {
        if (parsed._passwords && parsed._passwords[u.id]) {
          adminPasswords[u.id] = parsed._passwords[u.id];
        }
      });

      const resetData = {
        users: jsonAdminUsers.length > 0 ? jsonAdminUsers : [{ id: 'usr_admin', email: 'admin@afterbells.in', name: 'Academy Admin', role: 'admin', status: 'active', created_at: new Date().toISOString() }],
        teachers: [],
        students: [],
        subjects: parsed.subjects || [
          { id: 'subj_1', name: 'Mathematics', code: 'MATH-10' },
          { id: 'subj_2', name: 'Physics', code: 'PHYS-11' },
          { id: 'subj_3', name: 'Chemistry', code: 'CHEM-11' },
          { id: 'subj_4', name: 'Biology', code: 'BIOL-10' },
          { id: 'subj_5', name: 'English Literature', code: 'ENG-09' },
          { id: 'subj_6', name: 'Computer Science', code: 'CS-12' },
        ],
        batches: [],
        schedules: [],
        classLogs: [],
        notifications: [],
        _passwords: adminPasswords,
      };

      fs.writeFileSync(dbFile, JSON.stringify(resetData, null, 2), 'utf-8');
      console.log('✅ Local academy_db.json: Cleaned and reset to fresh production state.');
    }
  } catch (error: any) {
    console.error('Error clearing data:', error.message || error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();
