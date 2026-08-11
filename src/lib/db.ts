import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { Role, Status, ScheduleStatus } from '@prisma/client';
import type {
  User,
  Teacher,
  Student,
  Subject,
  Schedule,
  ClassLog,
  NotificationItem,
  TeacherStats,
  AdminAnalytics,
  Batch,
} from '@/types/tms';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'academy_db.json');

export interface DatabaseSchema {
  users: User[];
  teachers: Teacher[];
  students: Student[];
  subjects: Subject[];
  batches: Batch[];
  schedules: Schedule[];
  classLogs: ClassLog[];
  notifications: NotificationItem[];
}

export function hashPasswordSimple(password: string): string {
  return crypto.createHash('sha256').update(password + '_after_bells_salt').digest('hex');
}

export function verifyPasswordSimple(password: string, hash: string): boolean {
  return hashPasswordSimple(password) === hash;
}

export function hashPasswordBcrypt(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function getTodayFormatted(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const DEFAULT_SUBJECTS: Subject[] = [
  { id: 'subj_1', name: 'Mathematics', code: 'MATH-10' },
  { id: 'subj_2', name: 'Physics', code: 'PHYS-11' },
  { id: 'subj_3', name: 'Chemistry', code: 'CHEM-11' },
  { id: 'subj_4', name: 'Biology', code: 'BIOL-10' },
  { id: 'subj_5', name: 'English Literature', code: 'ENG-09' },
  { id: 'subj_6', name: 'Computer Science', code: 'CS-12' },
];

const DEFAULT_BATCHES: Batch[] = [
  { id: 'btch_1', name: 'AFTER BELLS | BATCH A-01', subject_name: 'Mathematics', grade_class: 'Grade 10', created_at: new Date().toISOString() },
  { id: 'btch_2', name: 'Grade 10 CBSE Math Champions', subject_name: 'Mathematics', grade_class: 'Grade 10', created_at: new Date().toISOString() },
  { id: 'btch_3', name: 'IGCSE Physics Evening Batch A', subject_name: 'Physics', grade_class: 'Grade 12', created_at: new Date().toISOString() },
];

const isPrismaEnabled = () => Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '');

// --- JSON Fallback Manager ---
class JsonDatabaseManager {
  private data: DatabaseSchema;
  private passwords: Record<string, string> = {};

  constructor() {
    this.ensureDirectory();
    this.data = this.loadDatabase();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (_) {}
    }
  }

  public reloadDiskData(): DatabaseSchema {
    this.data = this.loadDatabase();
    return this.data;
  }

  private loadDatabase(): DatabaseSchema {
    if (!fs.existsSync(DB_FILE)) {
      const initial: DatabaseSchema = {
        users: [{ id: 'usr_admin', email: 'admin@afterbells.in', name: 'Academy Admin', role: 'admin', status: 'active', created_at: new Date().toISOString() }],
        teachers: [],
        students: [],
        subjects: DEFAULT_SUBJECTS,
        batches: DEFAULT_BATCHES,
        schedules: [],
        classLogs: [],
        notifications: [],
      };
      this.passwords = { 'usr_admin': hashPasswordSimple('Admin@AfterBells2026') };
      this.saveToFile(initial, this.passwords);
      return initial;
    }

    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      this.passwords = parsed._passwords || {};
      return {
        users: parsed.users || [],
        teachers: parsed.teachers || [],
        students: parsed.students || [],
        subjects: parsed.subjects || DEFAULT_SUBJECTS,
        batches: parsed.batches || DEFAULT_BATCHES,
        schedules: parsed.schedules || [],
        classLogs: parsed.classLogs || [],
        notifications: parsed.notifications || [],
      };
    } catch (err) {
      console.error('Failed to parse academy_db.json fallback.', err);
      return { users: [], teachers: [], students: [], subjects: DEFAULT_SUBJECTS, batches: DEFAULT_BATCHES, schedules: [], classLogs: [], notifications: [] };
    }
  }

  private saveToFile(data = this.data, passwords = this.passwords) {
    try {
      const payload = { ...data, _passwords: passwords };
      fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (_) {}
  }

  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public verifyUserPassword(userId: string, passAttempt: string): boolean {
    const storedHash = this.passwords[userId];
    if (!storedHash) return false;
    try {
      if (bcrypt.compareSync(passAttempt, storedHash)) return true;
    } catch (_) {}
    return verifyPasswordSimple(passAttempt, storedHash);
  }

  public createUser(userData: Omit<User, 'id' | 'created_at'>, passwordRaw: string): User {
    const id = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newUser: User = { ...userData, id, created_at: new Date().toISOString() };
    this.data.users.push(newUser);
    this.passwords[id] = hashPasswordBcrypt(passwordRaw);
    this.saveToFile();
    return newUser;
  }

  public resetUserPassword(userId: string, newPasswordRaw: string): boolean {
    const user = this.findUserById(userId);
    if (!user) return false;
    this.passwords[userId] = hashPasswordBcrypt(newPasswordRaw);
    this.saveToFile();
    return true;
  }

  public updateUserStatus(userId: string, status: 'active' | 'disabled'): boolean {
    const user = this.findUserById(userId);
    if (!user) return false;
    user.status = status;
    const teacher = this.data.teachers.find(t => t.user_id === userId);
    if (teacher) teacher.status = status;
    this.saveToFile();
    return true;
  }

  public getAllTeachers(): Teacher[] {
    this.reloadDiskData();
    return [...this.data.teachers].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
  }

  public getTeacherById(id: string): Teacher | undefined {
    return this.data.teachers.find(t => t.id === id);
  }

  public getTeacherByUserId(userId: string): Teacher | undefined {
    return this.data.teachers.find(t => t.user_id === userId);
  }

  public createTeacherAccount(params: { name: string; email: string; phone: string; passwordRaw: string; subjects: string[]; bio?: string }): Teacher {
    const newUser = this.createUser({ email: params.email, name: params.name, role: 'teacher', status: 'active' }, params.passwordRaw);
    const teacherId = 'tch_' + Date.now();
    const newTeacher: Teacher = {
      id: teacherId,
      user_id: newUser.id,
      email: params.email,
      name: params.name,
      phone: params.phone,
      bio: params.bio || '',
      subjects: params.subjects,
      assigned_student_count: 0,
      status: 'active',
      created_at: new Date().toISOString(),
    };
    this.data.teachers.push(newTeacher);
    this.saveToFile();
    return newTeacher;
  }

  public updateTeacher(id: string, updates: Partial<Teacher>): Teacher | undefined {
    const t = this.getTeacherById(id);
    if (!t) return undefined;
    Object.assign(t, updates);
    if (updates.name || updates.email) {
      const user = this.findUserById(t.user_id);
      if (user) {
        if (updates.name) user.name = updates.name;
        if (updates.email) user.email = updates.email;
      }
    }
    this.saveToFile();
    return t;
  }

  public deleteTeacher(id: string): boolean {
    const idx = this.data.teachers.findIndex(t => t.id === id);
    if (idx === -1) return false;
    const teacher = this.data.teachers[idx];
    if (teacher.user_id) {
      const uIdx = this.data.users.findIndex(u => u.id === teacher.user_id);
      if (uIdx !== -1) this.data.users.splice(uIdx, 1);
      if (this.data.notifications) {
        this.data.notifications = this.data.notifications.filter(n => n.user_id !== teacher.user_id);
      }
    }
    this.data.students.forEach(s => {
      if (s.assigned_teacher_id === teacher.id) {
        s.assigned_teacher_id = '';
        s.assigned_teacher_name = 'Unassigned';
      }
    });
    this.data.schedules = this.data.schedules.filter(s => s.teacher_id !== id);
    this.data.teachers.splice(idx, 1);
    this.saveToFile();
    return true;
  }

  public getAllStudents(): Student[] {
    this.reloadDiskData();
    return [...this.data.students].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
  }

  public getStudentById(id: string): Student | undefined {
    return this.data.students.find(s => s.id === id);
  }

  public getStudentsByTeacherId(teacherId: string): Student[] {
    return this.data.students.filter(s => s.assigned_teacher_id === teacherId).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
  }

  public createStudent(params: Omit<Student, 'id' | 'created_at' | 'assigned_teacher_name'>): Student {
    const teacher = this.getTeacherById(params.assigned_teacher_id);
    const id = 'std_' + Date.now();
    const newStudent: Student = {
      ...params,
      id,
      assigned_teacher_name: teacher ? teacher.name : 'Unassigned',
      created_at: new Date().toISOString(),
    };
    this.data.students.push(newStudent);
    if (teacher) {
      teacher.assigned_student_count = (teacher.assigned_student_count || 0) + 1;
    }
    this.saveToFile();
    return newStudent;
  }

  public updateStudent(id: string, updates: Partial<Student>): Student | undefined {
    const std = this.getStudentById(id);
    if (!std) return undefined;
    if (updates.assigned_teacher_id && updates.assigned_teacher_id !== std.assigned_teacher_id) {
      const oldT = this.getTeacherById(std.assigned_teacher_id);
      if (oldT && oldT.assigned_student_count) oldT.assigned_student_count = Math.max(0, oldT.assigned_student_count - 1);
      const newT = this.getTeacherById(updates.assigned_teacher_id);
      if (newT) {
        newT.assigned_student_count = (newT.assigned_student_count || 0) + 1;
        std.assigned_teacher_name = newT.name;
      }
    }
    Object.assign(std, updates);
    this.saveToFile();
    return std;
  }

  public deleteStudent(id: string): boolean {
    const idx = this.data.students.findIndex(s => s.id === id);
    if (idx === -1) return false;
    const std = this.data.students[idx];
    const teacher = this.getTeacherById(std.assigned_teacher_id);
    if (teacher && teacher.assigned_student_count) {
      teacher.assigned_student_count = Math.max(0, teacher.assigned_student_count - 1);
    }
    if (this.data.batches) {
      this.data.batches.forEach(b => {
        if (b.student_ids) b.student_ids = b.student_ids.filter(sId => sId !== id);
        if (b.student_names && std.name) b.student_names = b.student_names.filter(sName => sName !== std.name);
      });
    }
    this.data.students.splice(idx, 1);
    this.saveToFile();
    return true;
  }

  public getAllSubjects(): Subject[] { return this.data.subjects; }

  public getAllBatches(): Batch[] {
    this.reloadDiskData();
    const list = this.data.batches || DEFAULT_BATCHES;
    return [...list].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
  }

  public createBatch(params: { name: string; subject_name?: string; grade_class?: string; student_ids?: string[]; student_names?: string[] }): Batch {
    const id = 'btch_' + Date.now();
    const newBatch: Batch = {
      id,
      name: params.name,
      subject_name: params.subject_name || '',
      grade_class: params.grade_class || '',
      student_ids: params.student_ids || [],
      student_names: params.student_names || [],
      created_at: new Date().toISOString(),
    };
    if (!this.data.batches) this.data.batches = [];
    this.data.batches.push(newBatch);
    this.saveToFile();
    return newBatch;
  }

  public updateBatch(id: string, updates: Partial<Batch>): Batch | undefined {
    if (!this.data.batches) return undefined;
    const batch = this.data.batches.find(b => b.id === id);
    if (!batch) return undefined;
    Object.assign(batch, updates);
    this.saveToFile();
    return batch;
  }

  public deleteBatch(id: string): boolean {
    if (!this.data.batches) return false;
    const idx = this.data.batches.findIndex(b => b.id === id);
    if (idx === -1) return false;
    this.data.batches.splice(idx, 1);
    this.saveToFile();
    return true;
  }

  public getAllSchedules(): Schedule[] {
    this.reloadDiskData();
    return this.data.schedules;
  }

  public clearAllSchedules(): void {
    this.data.schedules = [];
    this.saveToFile();
  }

  public deleteSchedule(id: string): boolean {
    const idx = this.data.schedules.findIndex(s => s.id === id);
    if (idx === -1) return false;
    this.data.schedules.splice(idx, 1);
    this.saveToFile();
    return true;
  }

  public getSchedulesByTeacher(teacherId: string): Schedule[] {
    return this.data.schedules.filter(s => s.teacher_id === teacherId);
  }

  public getScheduleById(id: string): Schedule | undefined {
    return this.data.schedules.find(s => s.id === id);
  }

  public createSchedule(params: Omit<Schedule, 'id'>): Schedule {
    const teacher = this.getTeacherById(params.teacher_id);
    const student = this.getStudentById(params.student_id);
    const id = 'sch_' + Date.now();
    const newSchedule: Schedule = {
      ...params,
      id,
      teacher_name: teacher?.name || 'Teacher',
      student_name: student?.name || 'Student',
    };
    this.data.schedules.push(newSchedule);
    this.saveToFile();
    return newSchedule;
  }

  public updateScheduleStatus(id: string, status: Schedule['status']): Schedule | undefined {
    const sch = this.getScheduleById(id);
    if (!sch) return undefined;
    sch.status = status;
    this.saveToFile();
    return sch;
  }

  public updateSchedule = (id: string, updates: Partial<Schedule>, options?: { isAdminReschedule?: boolean }): Schedule | undefined => {
    const sch = this.getScheduleById(id);
    if (!sch) return undefined;
    const isReschedule = options?.isAdminReschedule !== false;
    const teacher_id = updates.teacher_id || sch.teacher_id;
    const teacher = this.getTeacherById(teacher_id);
    const teacherName = teacher?.name || updates.teacher_name || sch.teacher_name;
    Object.assign(sch, updates, {
      teacher_id,
      teacher_name: teacherName,
      ...(isReschedule && {
        is_rescheduled: true,
        rescheduled_at: new Date().toISOString(),
      }),
    });
    if (isReschedule && teacher && teacher.user_id) {
      if (!this.data.notifications) this.data.notifications = [];
      const notifId = 'notif_' + Date.now();
      const targetName = sch.batch_name || sch.student_name || 'Student';
      this.data.notifications.unshift({
        id: notifId,
        user_id: teacher.user_id,
        title: 'Class Rescheduled by Admin',
        message: `Your class with ${targetName} (${sch.subject_name}) has been rescheduled to ${sch.date} (${sch.start_time} - ${sch.end_time}).`,
        type: 'schedule_change',
        read_status: false,
        created_at: new Date().toISOString(),
      });
    }
    this.saveToFile();
    return sch;
  };

  public getAllClassLogs(): ClassLog[] {
    this.reloadDiskData();
    return this.data.classLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getClassLogsByTeacher(teacherId: string): ClassLog[] {
    return this.getAllClassLogs().filter(log => log.teacher_id === teacherId);
  }

  public createClassLog(params: Omit<ClassLog, 'id' | 'created_at'>): ClassLog {
    const id = 'log_' + Date.now();
    const newLog: ClassLog = { ...params, id, created_at: new Date().toISOString() };
    this.data.classLogs.push(newLog);
    this.saveToFile();
    return newLog;
  }

  public getNotificationsByUser(userId: string): NotificationItem[] {
    return this.data.notifications.filter(n => n.user_id === userId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public markNotificationAsRead(id: string): boolean {
    const notif = this.data.notifications.find(n => n.id === id);
    if (!notif) return false;
    notif.read_status = true;
    this.saveToFile();
    return true;
  }

  public getTeacherStats(teacherId: string): TeacherStats {
    const todayStr = getTodayFormatted();
    const teacherSchedules = this.getSchedulesByTeacher(teacherId);
    const teacherLogs = this.getClassLogsByTeacher(teacherId);

    const todayClassesCount = teacherSchedules.filter(s => s.date === todayStr).length;
    const upcomingClassesCount = teacherSchedules.filter(s => new Date(s.date).getTime() > new Date(todayStr).getTime()).length;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthLogs = teacherLogs.filter(log => {
      const d = new Date(log.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && log.status === 'completed';
    });
    const monthClassesCount = monthLogs.length;
    const monthMinutes = monthLogs.reduce((acc, l) => acc + (l.duration_minutes || 0), 0);
    const monthHours = Math.round((monthMinutes / 60) * 10) / 10;

    return { todayClassesCount, upcomingClassesCount, monthClassesCount, monthHours };
  }

  public getAdminAnalytics(): AdminAnalytics {
    const todayStr = getTodayFormatted();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const classesToday = this.data.schedules.filter(s => s.date === todayStr).length;
    const teachersActive = this.data.teachers.filter(t => t.status === 'active').length;
    const completedLogs = this.data.classLogs.filter(l => l.status === 'completed');
    const cancelledLogs = this.data.classLogs.filter(l => l.status === 'cancelled');

    const monthlyCompletedLogs = completedLogs.filter(l => {
      const d = new Date(l.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalMinutes = monthlyCompletedLogs.reduce((acc, l) => acc + (l.duration_minutes || 0), 0);
    const monthlyTeachingHours = Math.round((totalMinutes / 60) * 10) / 10;

    return {
      classesToday,
      teachersActive,
      classesCompleted: completedLogs.length,
      classesCancelled: cancelledLogs.length,
      monthlyTeachingHours,
    };
  }
}

const jsonDb = new JsonDatabaseManager();

// Short TTL memory cache for read-heavy student & teacher lists (10 seconds)
let cachedTeachersList: { data: Teacher[]; expiresAt: number } | null = null;
let cachedStudentsList: { data: Student[]; expiresAt: number } | null = null;

export function clearDbDataCache() {
  cachedTeachersList = null;
  cachedStudentsList = null;
}

// --- Async Database Interface (Prisma + Postgres with JSON Fallback) ---
export const db = {
  async findUserByEmail(email: string): Promise<User | undefined> {
    if (!isPrismaEnabled()) return jsonDb.findUserByEmail(email);
    const u = await prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } });
    if (!u) return undefined;
    return { id: u.id, email: u.email, name: u.name, role: u.role as any, status: u.status as any, created_at: u.createdAt.toISOString() };
  },

  async findUserById(id: string): Promise<User | undefined> {
    if (!isPrismaEnabled()) return jsonDb.findUserById(id);
    const u = await prisma.user.findUnique({ where: { id } });
    if (!u) return undefined;
    return { id: u.id, email: u.email, name: u.name, role: u.role as any, status: u.status as any, created_at: u.createdAt.toISOString() };
  },

  async verifyUserPassword(userId: string, passAttempt: string): Promise<boolean> {
    if (!isPrismaEnabled()) return jsonDb.verifyUserPassword(userId, passAttempt);
    const stored = await prisma.userPassword.findUnique({ where: { userId } });
    if (!stored || !stored.hash) return false;
    try {
      if (bcrypt.compareSync(passAttempt, stored.hash)) return true;
    } catch (_) {}
    return verifyPasswordSimple(passAttempt, stored.hash);
  },

  async createUser(userData: Omit<User, 'id' | 'created_at'>, passwordRaw: string): Promise<User> {
    if (!isPrismaEnabled()) return jsonDb.createUser(userData, passwordRaw);
    const id = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const hash = hashPasswordBcrypt(passwordRaw);

    const created = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          id,
          email: userData.email,
          name: userData.name,
          role: userData.role === 'admin' ? Role.admin : Role.teacher,
          status: userData.status === 'disabled' ? Status.disabled : Status.active,
        },
      });
      await tx.userPassword.create({ data: { userId: id, hash } });
      return u;
    });

    return { id: created.id, email: created.email, name: created.name, role: created.role as any, status: created.status as any, created_at: created.createdAt.toISOString() };
  },

  async resetUserPassword(userId: string, newPasswordRaw: string): Promise<boolean> {
    if (!isPrismaEnabled()) return jsonDb.resetUserPassword(userId, newPasswordRaw);
    const hash = hashPasswordBcrypt(newPasswordRaw);
    await prisma.userPassword.upsert({
      where: { userId },
      update: { hash },
      create: { userId, hash },
    });
    return true;
  },

  async updateUserStatus(userId: string, status: 'active' | 'disabled'): Promise<boolean> {
    clearDbDataCache();
    if (!isPrismaEnabled()) return jsonDb.updateUserStatus(userId, status);
    const pStatus = status === 'disabled' ? Status.disabled : Status.active;
    await prisma.user.update({ where: { id: userId }, data: { status: pStatus } });
    await prisma.teacher.updateMany({ where: { userId }, data: { status: pStatus } });
    return true;
  },

  async getAllTeachers(): Promise<Teacher[]> {
    if (!isPrismaEnabled()) return jsonDb.getAllTeachers();
    const now = Date.now();
    if (cachedTeachersList && cachedTeachersList.expiresAt > now) {
      return cachedTeachersList.data;
    }
    const list = await prisma.teacher.findMany({ orderBy: { name: 'asc' } });
    const result = list.map(t => ({
      id: t.id,
      user_id: t.userId,
      email: t.email,
      name: t.name,
      phone: t.phone,
      avatar_url: t.avatarUrl || undefined,
      bio: t.bio || '',
      subjects: t.subjects,
      assigned_student_count: t.assignedStudentCount,
      status: t.status as any,
      created_at: t.createdAt.toISOString(),
    }));
    cachedTeachersList = { data: result, expiresAt: now + 10000 };
    return result;
  },

  async getTeacherById(id: string): Promise<Teacher | undefined> {
    if (!isPrismaEnabled()) return jsonDb.getTeacherById(id);
    const t = await prisma.teacher.findUnique({ where: { id } });
    if (!t) return undefined;
    return {
      id: t.id,
      user_id: t.userId,
      email: t.email,
      name: t.name,
      phone: t.phone,
      avatar_url: t.avatarUrl || undefined,
      bio: t.bio || '',
      subjects: t.subjects,
      assigned_student_count: t.assignedStudentCount,
      status: t.status as any,
      created_at: t.createdAt.toISOString(),
    };
  },

  async getTeacherByUserId(userId: string): Promise<Teacher | undefined> {
    if (!isPrismaEnabled()) return jsonDb.getTeacherByUserId(userId);
    const t = await prisma.teacher.findUnique({ where: { userId } });
    if (!t) return undefined;
    return {
      id: t.id,
      user_id: t.userId,
      email: t.email,
      name: t.name,
      phone: t.phone,
      avatar_url: t.avatarUrl || undefined,
      bio: t.bio || '',
      subjects: t.subjects,
      assigned_student_count: t.assignedStudentCount,
      status: t.status as any,
      created_at: t.createdAt.toISOString(),
    };
  },

  async createTeacherAccount(params: { name: string; email: string; phone: string; passwordRaw: string; subjects: string[]; bio?: string }): Promise<Teacher> {
    clearDbDataCache();
    if (!isPrismaEnabled()) return jsonDb.createTeacherAccount(params);
    const newUser = await this.createUser({ email: params.email, name: params.name, role: 'teacher', status: 'active' }, params.passwordRaw);
    const teacherId = 'tch_' + Date.now();

    const t = await prisma.teacher.create({
      data: {
        id: teacherId,
        userId: newUser.id,
        email: params.email,
        name: params.name,
        phone: params.phone,
        bio: params.bio || '',
        subjects: params.subjects,
        assignedStudentCount: 0,
        status: Status.active,
      },
    });

    return {
      id: t.id,
      user_id: t.userId,
      email: t.email,
      name: t.name,
      phone: t.phone,
      avatar_url: t.avatarUrl || undefined,
      bio: t.bio || '',
      subjects: t.subjects,
      assigned_student_count: t.assignedStudentCount,
      status: t.status as any,
      created_at: t.createdAt.toISOString(),
    };
  },

  async updateTeacher(id: string, updates: Partial<Teacher>): Promise<Teacher | undefined> {
    clearDbDataCache();
    if (!isPrismaEnabled()) return jsonDb.updateTeacher(id, updates);
    const current = await this.getTeacherById(id);
    if (!current) return undefined;

    const t = await prisma.teacher.update({
      where: { id },
      data: {
        ...(updates.name && { name: updates.name }),
        ...(updates.email && { email: updates.email }),
        ...(updates.phone && { phone: updates.phone }),
        ...(updates.bio !== undefined && { bio: updates.bio }),
        ...(updates.avatar_url !== undefined && { avatarUrl: updates.avatar_url }),
        ...(updates.subjects && { subjects: updates.subjects }),
        ...(updates.status && { status: updates.status === 'disabled' ? Status.disabled : Status.active }),
      },
    });

    if (updates.name || updates.email) {
      await prisma.user.update({
        where: { id: t.userId },
        data: {
          ...(updates.name && { name: updates.name }),
          ...(updates.email && { email: updates.email }),
        },
      });
    }

    return {
      id: t.id,
      user_id: t.userId,
      email: t.email,
      name: t.name,
      phone: t.phone,
      avatar_url: t.avatarUrl || undefined,
      bio: t.bio || '',
      subjects: t.subjects,
      assigned_student_count: t.assignedStudentCount,
      status: t.status as any,
      created_at: t.createdAt.toISOString(),
    };
  },

  async deleteTeacher(id: string): Promise<boolean> {
    clearDbDataCache();
    if (!isPrismaEnabled()) return jsonDb.deleteTeacher(id);
    const teacher = await prisma.teacher.findUnique({ where: { id } });
    if (!teacher) return false;

    await prisma.$transaction([
      prisma.classLog.deleteMany({ where: { teacherId: id } }),
      prisma.schedule.deleteMany({ where: { teacherId: id } }),
      prisma.notificationItem.deleteMany({ where: { userId: teacher.userId } }),
      prisma.student.updateMany({ where: { assignedTeacherId: id }, data: { assignedTeacherId: null } }),
      prisma.userPassword.deleteMany({ where: { userId: teacher.userId } }),
      prisma.teacher.delete({ where: { id } }),
      prisma.user.delete({ where: { id: teacher.userId } }),
    ]);
    return true;
  },

  async getAllStudents(): Promise<Student[]> {
    if (!isPrismaEnabled()) return jsonDb.getAllStudents();
    const now = Date.now();
    if (cachedStudentsList && cachedStudentsList.expiresAt > now) {
      return cachedStudentsList.data;
    }
    const list = await prisma.student.findMany({ include: { teacher: true }, orderBy: { name: 'asc' } });
    const result = list.map(s => ({
      id: s.id,
      name: s.name,
      grade_class: s.gradeClass,
      board: s.board,
      guardian_name: s.guardianName,
      phone: s.phone,
      assigned_teacher_id: s.assignedTeacherId || '',
      assigned_teacher_name: s.teacher ? s.teacher.name : 'Unassigned',
      subjects: s.subjects,
      status: s.status as any,
      created_at: s.createdAt.toISOString(),
    }));
    cachedStudentsList = { data: result, expiresAt: now + 10000 };
    return result;
  },

  async getStudentById(id: string): Promise<Student | undefined> {
    if (!isPrismaEnabled()) return jsonDb.getStudentById(id);
    const s = await prisma.student.findUnique({ where: { id }, include: { teacher: true } });
    if (!s) return undefined;
    return {
      id: s.id,
      name: s.name,
      grade_class: s.gradeClass,
      board: s.board,
      guardian_name: s.guardianName,
      phone: s.phone,
      assigned_teacher_id: s.assignedTeacherId || '',
      assigned_teacher_name: s.teacher ? s.teacher.name : 'Unassigned',
      subjects: s.subjects,
      status: s.status as any,
      created_at: s.createdAt.toISOString(),
    };
  },

  async getStudentsByTeacherId(teacherId: string): Promise<Student[]> {
    if (!isPrismaEnabled()) return jsonDb.getStudentsByTeacherId(teacherId);
    const list = await prisma.student.findMany({ where: { assignedTeacherId: teacherId }, orderBy: { name: 'asc' } });
    return list.map(s => ({
      id: s.id,
      name: s.name,
      grade_class: s.gradeClass,
      board: s.board,
      guardian_name: s.guardianName,
      phone: s.phone,
      assigned_teacher_id: s.assignedTeacherId || '',
      assigned_teacher_name: 'Teacher',
      subjects: s.subjects,
      status: s.status as any,
      created_at: s.createdAt.toISOString(),
    }));
  },

  async createStudent(params: Omit<Student, 'id' | 'created_at' | 'assigned_teacher_name'>): Promise<Student> {
    clearDbDataCache();
    if (!isPrismaEnabled()) return jsonDb.createStudent(params);
    const id = 'std_' + Date.now();
    const teacher = params.assigned_teacher_id ? await prisma.teacher.findUnique({ where: { id: params.assigned_teacher_id } }) : null;

    const s = await prisma.student.create({
      data: {
        id,
        name: params.name,
        gradeClass: params.grade_class,
        board: params.board,
        guardianName: params.guardian_name,
        phone: params.phone,
        assignedTeacherId: params.assigned_teacher_id || null,
        subjects: params.subjects,
        status: params.status === 'disabled' ? Status.disabled : Status.active,
      },
    });

    if (params.assigned_teacher_id) {
      await prisma.teacher.update({ where: { id: params.assigned_teacher_id }, data: { assignedStudentCount: { increment: 1 } } });
    }

    return {
      id: s.id,
      name: s.name,
      grade_class: s.gradeClass,
      board: s.board,
      guardian_name: s.guardianName,
      phone: s.phone,
      assigned_teacher_id: s.assignedTeacherId || '',
      assigned_teacher_name: teacher ? teacher.name : 'Unassigned',
      subjects: s.subjects,
      status: s.status as any,
      created_at: s.createdAt.toISOString(),
    };
  },

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student | undefined> {
    clearDbDataCache();
    if (!isPrismaEnabled()) return jsonDb.updateStudent(id, updates);
    const current = await prisma.student.findUnique({ where: { id } });
    if (!current) return undefined;

    if (updates.assigned_teacher_id && updates.assigned_teacher_id !== current.assignedTeacherId) {
      if (current.assignedTeacherId) {
        await prisma.teacher.update({ where: { id: current.assignedTeacherId }, data: { assignedStudentCount: { decrement: 1 } } }).catch(() => {});
      }
      await prisma.teacher.update({ where: { id: updates.assigned_teacher_id }, data: { assignedStudentCount: { increment: 1 } } }).catch(() => {});
    }

    const s = await prisma.student.update({
      where: { id },
      data: {
        ...(updates.name && { name: updates.name }),
        ...(updates.grade_class && { gradeClass: updates.grade_class }),
        ...(updates.board && { board: updates.board }),
        ...(updates.guardian_name && { guardianName: updates.guardian_name }),
        ...(updates.phone && { phone: updates.phone }),
        ...(updates.assigned_teacher_id !== undefined && { assignedTeacherId: updates.assigned_teacher_id || null }),
        ...(updates.subjects && { subjects: updates.subjects }),
        ...(updates.status && { status: updates.status === 'disabled' ? Status.disabled : Status.active }),
      },
      include: { teacher: true },
    });

    return {
      id: s.id,
      name: s.name,
      grade_class: s.gradeClass,
      board: s.board,
      guardian_name: s.guardianName,
      phone: s.phone,
      assigned_teacher_id: s.assignedTeacherId || '',
      assigned_teacher_name: s.teacher ? s.teacher.name : 'Unassigned',
      subjects: s.subjects,
      status: s.status as any,
      created_at: s.createdAt.toISOString(),
    };
  },

  async deleteStudent(id: string): Promise<boolean> {
    clearDbDataCache();
    if (!isPrismaEnabled()) return jsonDb.deleteStudent(id);
    const current = await prisma.student.findUnique({ where: { id } });
    if (!current) return false;

    if (current.assignedTeacherId) {
      await prisma.teacher.update({ where: { id: current.assignedTeacherId }, data: { assignedStudentCount: { decrement: 1 } } }).catch(() => {});
    }

    // Clean up batch membership
    const batches = await prisma.batch.findMany({ where: { studentIds: { has: id } } });
    for (const batch of batches) {
      await prisma.batch.update({
        where: { id: batch.id },
        data: {
          studentIds: batch.studentIds.filter(sId => sId !== id),
          studentNames: batch.studentNames.filter(sName => sName !== current.name),
        },
      });
    }

    await prisma.student.delete({ where: { id } });
    return true;
  },

  async getAllSubjects(): Promise<Subject[]> {
    if (!isPrismaEnabled()) return jsonDb.getAllSubjects();
    const list = await prisma.subject.findMany();
    return list.map(s => ({ id: s.id, name: s.name, code: s.code }));
  },

  async getAllBatches(): Promise<Batch[]> {
    if (!isPrismaEnabled()) return jsonDb.getAllBatches();
    const list = await prisma.batch.findMany({ orderBy: { name: 'asc' } });
    return list.map(b => ({
      id: b.id,
      name: b.name,
      subject_name: b.subjectName || '',
      grade_class: b.gradeClass || '',
      student_ids: b.studentIds,
      student_names: b.studentNames,
      created_at: b.createdAt.toISOString(),
    }));
  },

  async createBatch(params: { name: string; subject_name?: string; grade_class?: string; student_ids?: string[]; student_names?: string[] }): Promise<Batch> {
    if (!isPrismaEnabled()) return jsonDb.createBatch(params);
    const id = 'btch_' + Date.now();
    const b = await prisma.batch.create({
      data: {
        id,
        name: params.name,
        subjectName: params.subject_name || '',
        gradeClass: params.grade_class || '',
        studentIds: params.student_ids || [],
        studentNames: params.student_names || [],
      },
    });
    return { id: b.id, name: b.name, subject_name: b.subjectName || '', grade_class: b.gradeClass || '', student_ids: b.studentIds, student_names: b.studentNames, created_at: b.createdAt.toISOString() };
  },

  async updateBatch(id: string, updates: Partial<Batch>): Promise<Batch | undefined> {
    if (!isPrismaEnabled()) return jsonDb.updateBatch(id, updates);
    const b = await prisma.batch.update({
      where: { id },
      data: {
        ...(updates.name && { name: updates.name }),
        ...(updates.subject_name !== undefined && { subjectName: updates.subject_name }),
        ...(updates.grade_class !== undefined && { gradeClass: updates.grade_class }),
        ...(updates.student_ids && { studentIds: updates.student_ids }),
        ...(updates.student_names && { studentNames: updates.student_names }),
      },
    });
    return { id: b.id, name: b.name, subject_name: b.subjectName || '', grade_class: b.gradeClass || '', student_ids: b.studentIds, student_names: b.studentNames, created_at: b.createdAt.toISOString() };
  },

  async deleteBatch(id: string): Promise<boolean> {
    if (!isPrismaEnabled()) return jsonDb.deleteBatch(id);
    await prisma.batch.delete({ where: { id } });
    return true;
  },

  async getAllSchedules(): Promise<Schedule[]> {
    if (!isPrismaEnabled()) return jsonDb.getAllSchedules();
    const list = await prisma.schedule.findMany({ include: { teacher: true } });
    return list.map(s => ({
      id: s.id,
      teacher_id: s.teacherId,
      teacher_name: s.teacher ? s.teacher.name : 'Unknown Teacher',
      student_id: s.studentId,
      student_name: s.studentName || undefined,
      student_names: s.studentNames,
      is_batch: s.isBatch,
      batch_name: s.batchName || undefined,
      subject_name: s.subjectName,
      grade_class: s.gradeClass,
      day_of_week: s.dayOfWeek,
      start_time: s.startTime,
      end_time: s.endTime,
      date: s.date,
      status: s.status as any,
      is_rescheduled: s.isRescheduled,
      rescheduled_at: s.rescheduledAt ? s.rescheduledAt.toISOString() : undefined,
    }));
  },

  async clearAllSchedules(): Promise<void> {
    if (!isPrismaEnabled()) return jsonDb.clearAllSchedules();
    await prisma.schedule.deleteMany();
  },

  async deleteSchedule(id: string): Promise<boolean> {
    if (!isPrismaEnabled()) return jsonDb.deleteSchedule(id);
    await prisma.schedule.delete({ where: { id } });
    return true;
  },

  async getSchedulesByTeacher(teacherId: string): Promise<Schedule[]> {
    if (!isPrismaEnabled()) return jsonDb.getSchedulesByTeacher(teacherId);
    const list = await prisma.schedule.findMany({ where: { teacherId } });
    return list.map(s => ({
      id: s.id,
      teacher_id: s.teacherId,
      teacher_name: 'Teacher',
      student_id: s.studentId,
      student_name: s.studentName || undefined,
      student_names: s.studentNames,
      is_batch: s.isBatch,
      batch_name: s.batchName || undefined,
      subject_name: s.subjectName,
      grade_class: s.gradeClass,
      day_of_week: s.dayOfWeek,
      start_time: s.startTime,
      end_time: s.endTime,
      date: s.date,
      status: s.status as any,
      is_rescheduled: s.isRescheduled,
      rescheduled_at: s.rescheduledAt ? s.rescheduledAt.toISOString() : undefined,
    }));
  },

  async getScheduleById(id: string): Promise<Schedule | undefined> {
    if (!isPrismaEnabled()) return jsonDb.getScheduleById(id);
    const s = await prisma.schedule.findUnique({ where: { id }, include: { teacher: true } });
    if (!s) return undefined;
    return {
      id: s.id,
      teacher_id: s.teacherId,
      teacher_name: s.teacher ? s.teacher.name : 'Teacher',
      student_id: s.studentId,
      student_name: s.studentName || undefined,
      student_names: s.studentNames,
      is_batch: s.isBatch,
      batch_name: s.batchName || undefined,
      subject_name: s.subjectName,
      grade_class: s.gradeClass,
      day_of_week: s.dayOfWeek,
      start_time: s.startTime,
      end_time: s.endTime,
      date: s.date,
      status: s.status as any,
      is_rescheduled: s.isRescheduled,
      rescheduled_at: s.rescheduledAt ? s.rescheduledAt.toISOString() : undefined,
    };
  },

  async createSchedule(params: Omit<Schedule, 'id'>): Promise<Schedule> {
    if (!isPrismaEnabled()) return jsonDb.createSchedule(params);
    const id = 'sch_' + Date.now();
    const teacher = await prisma.teacher.findUnique({ where: { id: params.teacher_id } });

    const s = await prisma.schedule.create({
      data: {
        id,
        teacherId: params.teacher_id,
        studentId: params.student_id,
        studentName: params.student_name || null,
        studentNames: params.student_names || [],
        isBatch: Boolean(params.is_batch),
        batchName: params.batch_name || null,
        subjectName: params.subject_name,
        gradeClass: params.grade_class,
        dayOfWeek: params.day_of_week,
        startTime: params.start_time,
        endTime: params.end_time,
        date: params.date,
        status: ScheduleStatus.scheduled,
      },
    });

    return {
      id: s.id,
      teacher_id: s.teacherId,
      teacher_name: teacher ? teacher.name : params.teacher_name || 'Teacher',
      student_id: s.studentId,
      student_name: s.studentName || undefined,
      student_names: s.studentNames,
      is_batch: s.isBatch,
      batch_name: s.batchName || undefined,
      subject_name: s.subjectName,
      grade_class: s.gradeClass,
      day_of_week: s.dayOfWeek,
      start_time: s.startTime,
      end_time: s.endTime,
      date: s.date,
      status: s.status as any,
      is_rescheduled: s.isRescheduled,
      rescheduled_at: s.rescheduledAt ? s.rescheduledAt.toISOString() : undefined,
    };
  },

  async updateScheduleStatus(id: string, status: Schedule['status']): Promise<Schedule | undefined> {
    if (!isPrismaEnabled()) return jsonDb.updateScheduleStatus(id, status);
    let pStatus: ScheduleStatus = ScheduleStatus.scheduled;
    if (status === 'in_progress') pStatus = ScheduleStatus.in_progress;
    if (status === 'completed') pStatus = ScheduleStatus.completed;
    if (status === 'cancelled') pStatus = ScheduleStatus.cancelled;

    const s = await prisma.schedule.update({ where: { id }, data: { status: pStatus }, include: { teacher: true } });
    return {
      id: s.id,
      teacher_id: s.teacherId,
      teacher_name: s.teacher ? s.teacher.name : 'Teacher',
      student_id: s.studentId,
      student_name: s.studentName || undefined,
      student_names: s.studentNames,
      is_batch: s.isBatch,
      batch_name: s.batchName || undefined,
      subject_name: s.subjectName,
      grade_class: s.gradeClass,
      day_of_week: s.dayOfWeek,
      start_time: s.startTime,
      end_time: s.endTime,
      date: s.date,
      status: s.status as any,
      is_rescheduled: s.isRescheduled,
      rescheduled_at: s.rescheduledAt ? s.rescheduledAt.toISOString() : undefined,
    };
  },

  async updateSchedule(id: string, updates: Partial<Schedule>, options?: { isAdminReschedule?: boolean }): Promise<Schedule | undefined> {
    if (!isPrismaEnabled()) return jsonDb.updateSchedule(id, updates, options);
    const sch = await this.getScheduleById(id);
    if (!sch) return undefined;
    const isReschedule = options?.isAdminReschedule !== false;

    const teacherId = updates.teacher_id || sch.teacher_id;
    const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });

    const s = await prisma.schedule.update({
      where: { id },
      data: {
        ...(updates.start_time !== undefined && { startTime: updates.start_time }),
        ...(updates.end_time !== undefined && { endTime: updates.end_time }),
        ...(updates.date !== undefined && { date: updates.date }),
        ...(updates.teacher_id !== undefined && { teacherId: updates.teacher_id }),
        ...(updates.student_id !== undefined && { studentId: updates.student_id }),
        ...(updates.student_name !== undefined && { studentName: updates.student_name }),
        ...(updates.student_names !== undefined && { studentNames: updates.student_names }),
        ...(updates.is_batch !== undefined && { isBatch: updates.is_batch }),
        ...(updates.batch_name !== undefined && { batchName: updates.batch_name }),
        ...(updates.subject_name !== undefined && { subjectName: updates.subject_name }),
        ...(updates.grade_class !== undefined && { gradeClass: updates.grade_class }),
        ...(updates.day_of_week !== undefined && { dayOfWeek: updates.day_of_week }),
        ...(updates.status !== undefined && {
          status: updates.status === 'in_progress' ? ScheduleStatus.in_progress :
                  updates.status === 'completed' ? ScheduleStatus.completed :
                  updates.status === 'cancelled' ? ScheduleStatus.cancelled : ScheduleStatus.scheduled
        }),
        ...(isReschedule && { isRescheduled: true, rescheduledAt: new Date() }),
      },
    });

    if (isReschedule && teacher && teacher.userId) {
      const targetName = s.batchName || s.studentName || 'Student';
      await prisma.notificationItem.create({
        data: {
          id: 'notif_' + Date.now(),
          userId: teacher.userId,
          title: 'Class Rescheduled by Admin',
          message: `Your class with ${targetName} (${s.subjectName}) has been rescheduled to ${s.date} (${s.startTime} - ${s.endTime}).`,
          type: 'schedule_change',
          readStatus: false,
        },
      });
    }

    return {
      id: s.id,
      teacher_id: s.teacherId,
      teacher_name: teacher ? teacher.name : 'Unknown Teacher',
      student_id: s.studentId,
      student_name: s.studentName || undefined,
      student_names: s.studentNames,
      is_batch: s.isBatch,
      batch_name: s.batchName || undefined,
      subject_name: s.subjectName,
      grade_class: s.gradeClass,
      day_of_week: s.dayOfWeek,
      start_time: s.startTime,
      end_time: s.endTime,
      date: s.date,
      status: s.status as any,
      is_rescheduled: s.isRescheduled,
      rescheduled_at: s.rescheduledAt ? s.rescheduledAt.toISOString() : undefined,
    };
  },

  async getAllClassLogs(): Promise<ClassLog[]> {
    if (!isPrismaEnabled()) return jsonDb.getAllClassLogs();
    const list = await prisma.classLog.findMany({ orderBy: { createdAt: 'desc' } });
    return list.map(l => ({
      id: l.id,
      schedule_id: l.scheduleId || undefined,
      teacher_id: l.teacherId,
      teacher_name: l.teacherName,
      student_id: l.studentId,
      student_name: l.studentName,
      student_names: l.studentNames,
      is_batch: l.isBatch,
      batch_name: l.batchName || undefined,
      subject_name: l.subjectName,
      grade_class: l.gradeClass,
      date: l.date,
      start_time: l.startTime,
      end_time: l.endTime,
      duration_minutes: l.durationMinutes,
      status: l.status as any,
      remarks: l.remarks || undefined,
      cancelled_reason: l.cancelledReason || undefined,
      created_at: l.createdAt.toISOString(),
    }));
  },

  async getClassLogsByTeacher(teacherId: string): Promise<ClassLog[]> {
    if (!isPrismaEnabled()) return jsonDb.getClassLogsByTeacher(teacherId);
    const list = await prisma.classLog.findMany({ where: { teacherId }, orderBy: { createdAt: 'desc' } });
    return list.map(l => ({
      id: l.id,
      schedule_id: l.scheduleId || undefined,
      teacher_id: l.teacherId,
      teacher_name: l.teacherName,
      student_id: l.studentId,
      student_name: l.studentName,
      student_names: l.studentNames,
      is_batch: l.isBatch,
      batch_name: l.batchName || undefined,
      subject_name: l.subjectName,
      grade_class: l.gradeClass,
      date: l.date,
      start_time: l.startTime,
      end_time: l.endTime,
      duration_minutes: l.durationMinutes,
      status: l.status as any,
      remarks: l.remarks || undefined,
      cancelled_reason: l.cancelledReason || undefined,
      created_at: l.createdAt.toISOString(),
    }));
  },

  async createClassLog(params: Omit<ClassLog, 'id' | 'created_at'>): Promise<ClassLog> {
    if (!isPrismaEnabled()) return jsonDb.createClassLog(params);
    const id = 'log_' + Date.now();
    const l = await prisma.classLog.create({
      data: {
        id,
        scheduleId: params.schedule_id || null,
        teacherId: params.teacher_id,
        teacherName: params.teacher_name,
        studentId: params.student_id,
        studentName: params.student_name,
        studentNames: params.student_names || [],
        isBatch: Boolean(params.is_batch),
        batchName: params.batch_name || null,
        subjectName: params.subject_name,
        gradeClass: params.grade_class,
        date: params.date,
        startTime: params.start_time,
        endTime: params.end_time,
        durationMinutes: params.duration_minutes || 60,
        status: params.status,
        remarks: params.remarks || null,
        cancelledReason: params.cancelled_reason || null,
      },
    });

    return {
      id: l.id,
      schedule_id: l.scheduleId || undefined,
      teacher_id: l.teacherId,
      teacher_name: l.teacherName,
      student_id: l.studentId,
      student_name: l.studentName,
      student_names: l.studentNames,
      is_batch: l.isBatch,
      batch_name: l.batchName || undefined,
      subject_name: l.subjectName,
      grade_class: l.gradeClass,
      date: l.date,
      start_time: l.startTime,
      end_time: l.endTime,
      duration_minutes: l.durationMinutes,
      status: l.status as any,
      remarks: l.remarks || undefined,
      cancelled_reason: l.cancelledReason || undefined,
      created_at: l.createdAt.toISOString(),
    };
  },

  async getNotificationsByUser(userId: string): Promise<NotificationItem[]> {
    if (!isPrismaEnabled()) return jsonDb.getNotificationsByUser(userId);
    const list = await prisma.notificationItem.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    return list.map(n => ({
      id: n.id,
      user_id: n.userId,
      title: n.title,
      message: n.message,
      type: n.type as any,
      read_status: n.readStatus,
      created_at: n.createdAt.toISOString(),
    }));
  },

  async markNotificationAsRead(id: string): Promise<boolean> {
    if (!isPrismaEnabled()) return jsonDb.markNotificationAsRead(id);
    await prisma.notificationItem.update({ where: { id }, data: { readStatus: true } });
    return true;
  },

  async getTeacherStats(teacherId: string): Promise<TeacherStats> {
    if (!isPrismaEnabled()) return jsonDb.getTeacherStats(teacherId);
    const todayStr = getTodayFormatted();
    const teacherSchedules = await this.getSchedulesByTeacher(teacherId);
    const teacherLogs = await this.getClassLogsByTeacher(teacherId);

    const todayClassesCount = teacherSchedules.filter(s => s.date === todayStr).length;
    const upcomingClassesCount = teacherSchedules.filter(s => new Date(s.date).getTime() > new Date(todayStr).getTime()).length;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthLogs = teacherLogs.filter(log => {
      const d = new Date(log.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && log.status === 'completed';
    });

    const monthClassesCount = monthLogs.length;
    const monthMinutes = monthLogs.reduce((acc, l) => acc + (l.duration_minutes || 0), 0);
    const monthHours = Math.round((monthMinutes / 60) * 10) / 10;

    return { todayClassesCount, upcomingClassesCount, monthClassesCount, monthHours };
  },

  async getAdminAnalytics(): Promise<AdminAnalytics> {
    if (!isPrismaEnabled()) return jsonDb.getAdminAnalytics();
    const todayStr = getTodayFormatted();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const schedules = await this.getAllSchedules();
    const teachers = await this.getAllTeachers();
    const logs = await this.getAllClassLogs();

    const classesToday = schedules.filter(s => s.date === todayStr).length;
    const teachersActive = teachers.filter(t => t.status === 'active').length;
    const completedLogs = logs.filter(l => l.status === 'completed');
    const cancelledLogs = logs.filter(l => l.status === 'cancelled');

    const monthlyCompletedLogs = completedLogs.filter(l => {
      const d = new Date(l.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalMinutes = monthlyCompletedLogs.reduce((acc, l) => acc + (l.duration_minutes || 0), 0);
    const monthlyTeachingHours = Math.round((totalMinutes / 60) * 10) / 10;

    return {
      classesToday,
      teachersActive,
      classesCompleted: completedLogs.length,
      classesCancelled: cancelledLogs.length,
      monthlyTeachingHours,
    };
  },
};
