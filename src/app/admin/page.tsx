"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  ArrowRight,
  TrendingUp,
  BookOpen,
  UserCheck,
  FileText,
  Sparkles,
} from 'lucide-react';
import { useAdminData } from '@/context/AdminDataContext';

function formatTime12Hr(time24: string): string {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  if (isNaN(h)) return time24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const hFormatted = String(h).padStart(2, '0');
  return `${hFormatted}:${mStr || '00'} ${ampm}`;
}

export default function AdminOverviewPage() {
  const { analytics, teachers, students, todaySchedules, recentLogs, loading } = useAdminData();
  const totalTeachers = teachers.length;
  const totalStudents = students.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-navy-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-navy-primary text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-gold-accent/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-gold-accent uppercase tracking-widest block mb-1">
              After Bells Academy • Executive Overview
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">System Control Panel</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Real-time academy operational stats, class tracking, and teacher management.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/admin/teachers"
              className="px-4 py-2.5 bg-gold-accent hover:bg-gold-hover text-navy-dark font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Teacher
            </Link>
            <Link
              href="/admin/schedules"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4" /> Create Schedule
            </Link>
          </div>
        </div>
      </div>

      {/* ANALYTICS METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-navy-subtle text-navy-primary flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5" />
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Classes Today</p>
          <p className="text-2xl font-black text-navy-primary mt-0.5">{analytics.classesToday}</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <UserCheck className="w-5 h-5" />
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Teachers Active</p>
          <p className="text-2xl font-black text-navy-primary mt-0.5">{analytics.teachersActive} / {totalTeachers}</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <CheckCircle className="w-5 h-5" />
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Classes Completed</p>
          <p className="text-2xl font-black text-navy-primary mt-0.5">{analytics.classesCompleted}</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-3">
            <XCircle className="w-5 h-5" />
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cancelled</p>
          <p className="text-2xl font-black text-navy-primary mt-0.5">{analytics.classesCancelled}</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-gold-light text-gold-accent flex items-center justify-center mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Monthly Hours</p>
          <p className="text-2xl font-black text-navy-primary mt-0.5">{analytics.monthlyTeachingHours} hrs</p>
        </div>
      </div>

      {/* TWO COLUMN GRID FOR MASTER SCHEDULES & RECENT LOGS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Master Schedule */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-navy-primary flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gold-accent" /> Today's Master Timetable
            </h2>
            <Link href="/admin/schedules" className="text-xs font-bold text-gold-accent hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {todaySchedules.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No schedules created for today yet.</p>
          ) : (
            <div className="space-y-3">
              {todaySchedules.map(sch => (
                <div key={sch.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-navy-primary text-sm">{sch.batch_name || sch.student_name}</span>
                      {sch.is_batch && (
                        <span className="px-2 py-0.5 bg-gold-light text-navy-primary font-black text-[10px] rounded-full border border-gold-accent/30">
                          👥 Batch
                        </span>
                      )}
                      {sch.is_rescheduled && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-full border border-amber-300">
                          🔄 Rescheduled
                        </span>
                      )}
                    </div>
                    <span className="text-slate-500 font-medium block mt-0.5">{sch.subject_name} • {sch.teacher_name} ({sch.grade_class})</span>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <span className="font-bold text-slate-700 block">{formatTime12Hr(sch.start_time)} - {formatTime12Hr(sch.end_time)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase inline-block mt-0.5 ${
                      sch.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : sch.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : sch.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {sch.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Master Class Log Feed */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-navy-primary flex items-center gap-2">
              <FileText className="w-5 h-5 text-navy-primary" /> Live Class Logs Feed
            </h2>
            <Link href="/admin/logs" className="text-xs font-bold text-navy-primary hover:underline flex items-center gap-1">
              Audit Logs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentLogs.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No class logs recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {recentLogs.slice(0, 5).map(log => (
                <div key={log.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-navy-primary">{log.teacher_name} → {log.student_name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      log.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {log.status === 'completed' ? `${log.duration_minutes}m` : log.cancelled_reason}
                    </span>
                  </div>
                  <p className="text-slate-500 font-medium">{log.subject_name} • {log.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
