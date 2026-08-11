"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Teacher, Student, Batch, Schedule, ClassLog, AdminAnalytics } from '@/types/tms';

interface AdminDataContextType {
  teachers: Teacher[];
  students: Student[];
  batches: Batch[];
  schedules: Schedule[];
  recentLogs: ClassLog[];
  todaySchedules: Schedule[];
  analytics: AdminAnalytics;
  loading: boolean;
  refetchAdminData: () => Promise<void>;
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  setBatches: React.Dispatch<React.SetStateAction<Batch[]>>;
  setSchedules: React.Dispatch<React.SetStateAction<Schedule[]>>;
  addTeacherLocally: (teacher: Teacher) => void;
  updateTeacherLocally: (id: string, updates: Partial<Teacher>) => void;
  deleteTeacherLocally: (id: string) => void;
  addStudentLocally: (student: Student) => void;
  updateStudentLocally: (id: string, updates: Partial<Student>) => void;
  deleteStudentLocally: (id: string) => void;
  addBatchLocally: (batch: Batch) => void;
  deleteBatchLocally: (id: string) => void;
  addScheduleLocally: (schedule: Schedule) => void;
  updateScheduleLocally: (id: string, updates: Partial<Schedule>) => void;
  deleteScheduleLocally: (id: string) => void;
}

const defaultAnalytics: AdminAnalytics = {
  classesToday: 0,
  teachersActive: 0,
  classesCompleted: 0,
  classesCancelled: 0,
  monthlyTeachingHours: 0,
};

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [recentLogs, setRecentLogs] = useState<ClassLog[]>([]);
  const [todaySchedules, setTodaySchedules] = useState<Schedule[]>([]);
  const [analytics, setAnalytics] = useState<AdminAnalytics>(defaultAnalytics);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchBootstrapData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/bootstrap');
      if (res.ok) {
        const data = await res.json();
        setTeachers(data.teachers || []);
        setStudents(data.students || []);
        setBatches(data.batches || []);
        setSchedules(data.schedules || []);
        setRecentLogs(data.recentLogs || []);
        setTodaySchedules(data.todaySchedules || []);
        setAnalytics(data.analytics || defaultAnalytics);
      }
    } catch (error) {
      console.error('Failed to load admin bootstrap data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBootstrapData();
  }, [fetchBootstrapData]);

  const addTeacherLocally = useCallback((teacher: Teacher) => {
    setTeachers(prev => [teacher, ...prev.filter(t => t.id !== teacher.id)]);
  }, []);

  const updateTeacherLocally = useCallback((id: string, updates: Partial<Teacher>) => {
    setTeachers(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const deleteTeacherLocally = useCallback((id: string) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
  }, []);

  const addStudentLocally = useCallback((student: Student) => {
    setStudents(prev => [student, ...prev.filter(s => s.id !== student.id)]);
  }, []);

  const updateStudentLocally = useCallback((id: string, updates: Partial<Student>) => {
    setStudents(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
  }, []);

  const deleteStudentLocally = useCallback((id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  }, []);

  const addBatchLocally = useCallback((batch: Batch) => {
    setBatches(prev => [batch, ...prev.filter(b => b.id !== batch.id)]);
  }, []);

  const deleteBatchLocally = useCallback((id: string) => {
    setBatches(prev => prev.filter(b => b.id !== id));
  }, []);

  const addScheduleLocally = useCallback((schedule: Schedule) => {
    setSchedules(prev => [schedule, ...prev.filter(s => s.id !== schedule.id)]);
  }, []);

  const updateScheduleLocally = useCallback((id: string, updates: Partial<Schedule>) => {
    setSchedules(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
  }, []);

  const deleteScheduleLocally = useCallback((id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
  }, []);

  return (
    <AdminDataContext.Provider
      value={{
        teachers,
        students,
        batches,
        schedules,
        recentLogs,
        todaySchedules,
        analytics,
        loading,
        refetchAdminData: fetchBootstrapData,
        setTeachers,
        setStudents,
        setBatches,
        setSchedules,
        addTeacherLocally,
        updateTeacherLocally,
        deleteTeacherLocally,
        addStudentLocally,
        updateStudentLocally,
        deleteStudentLocally,
        addBatchLocally,
        deleteBatchLocally,
        addScheduleLocally,
        updateScheduleLocally,
        deleteScheduleLocally,
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
}
