export type UserRole = 'admin' | 'teacher';
export type UserStatus = 'active' | 'disabled';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
}

export interface Teacher {
  id: string;
  user_id: string;
  email: string;
  name: string;
  phone: string;
  avatar_url?: string;
  bio?: string;
  subjects: string[];
  assigned_student_count?: number;
  status: UserStatus;
  created_at: string;
}

export interface Student {
  id: string;
  name: string;
  grade_class: string;
  board: string; // CBSE, ICSE, State, IGCSE, GCSE
  guardian_name: string;
  phone: string;
  assigned_teacher_id: string;
  assigned_teacher_name?: string;
  subjects: string[];
  status: UserStatus;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface Batch {
  id: string;
  name: string;
  subject_name?: string;
  grade_class?: string;
  student_ids?: string[];
  student_names?: string[];
  created_at: string;
}

export type ScheduleStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface Schedule {
  id: string;
  teacher_id: string;
  teacher_name?: string;
  student_id: string;
  student_name?: string;
  student_names?: string[]; // For 1-to-many / small batch classes (e.g. 5 students)
  is_batch?: boolean;
  batch_name?: string;
  subject_name: string;
  grade_class: string;
  day_of_week: string;
  start_time: string; // e.g. "16:00"
  end_time: string;   // e.g. "17:00"
  date: string;       // YYYY-MM-DD
  status: ScheduleStatus;
  is_rescheduled?: boolean;
  rescheduled_at?: string;
}

export type ClassLogStatus = 'completed' | 'cancelled';

export interface ClassLog {
  id: string;
  schedule_id?: string;
  teacher_id: string;
  teacher_name: string;
  student_id: string;
  student_name: string;
  student_names?: string[];
  is_batch?: boolean;
  batch_name?: string;
  subject_name: string;
  grade_class: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: ClassLogStatus;
  remarks?: string;
  cancelled_reason?: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'reminder' | 'schedule_change' | 'system';
  read_status: boolean;
  created_at: string;
}

export interface TeacherStats {
  todayClassesCount: number;
  upcomingClassesCount: number;
  monthClassesCount: number;
  monthHours: number;
}

export interface AdminAnalytics {
  classesToday: number;
  teachersActive: number;
  classesCompleted: number;
  classesCancelled: number;
  monthlyTeachingHours: number;
}
