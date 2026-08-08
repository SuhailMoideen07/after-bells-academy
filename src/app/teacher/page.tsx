"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Clock,
  Calendar,
  BookOpen,
  User,
  Play,
  CheckCircle,
  XCircle,
  LogOut,
  Bell,
  Sparkles,
  Users,
  History,
  Phone,
  FileText,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  X,
  Camera,
  Upload,
  Trash2,
  Lock,
  KeyRound,
} from 'lucide-react';
import type { Teacher, Schedule, ClassLog, Student, NotificationItem, TeacherStats } from '@/types/tms';

export function getLocalTodayString(d = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calculateDayTag(dateStr: string): string {
  if (!dateStr) return '';
  const todayStr = getLocalTodayString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalTodayString(yesterday);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = getLocalTodayString(tomorrow);

  if (dateStr === todayStr) return 'Today';
  if (dateStr === yesterdayStr) return 'Yesterday';
  if (dateStr === tomorrowStr) return 'Tomorrow';

  const parts = dateStr.split('-').map(Number);
  if (parts.length === 3) {
    const [y, m, d] = parts;
    const selectedDate = new Date(y, m - 1, d);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[selectedDate.getDay()] || '';
  }

  return '';
}

function formatDateDDMMYYYY(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}-${month}-${year}`;
}

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

function getTeacherInitials(name?: string): string {
  if (!name) return 'T';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function TeacherDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [stats, setStats] = useState<TeacherStats>({
    todayClassesCount: 0,
    upcomingClassesCount: 0,
    monthClassesCount: 0,
    monthHours: 0,
  });
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [recentLogs, setRecentLogs] = useState<ClassLog[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'history' | 'students'>('today');

  // Modals state
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [endModalOpen, setEndModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [cancelReason, setCancelReason] = useState('Student Absent');
  const [actionLoading, setActionLoading] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [studentModalData, setStudentModalData] = useState<{ title: string; students: string[] } | null>(null);

  // Profile & Avatar Modal state
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Change Password Modal state
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');

      setPasswordSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setChangePasswordModalOpen(false);
        setPasswordSuccess('');
      }, 1500);
    } catch (err: any) {
      setPasswordError(err.message || 'Error changing password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const [fetchError, setFetchError] = useState<string>('');

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      setFetchError('');
      const res = await fetch('/api/teacher/dashboard');
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to load dashboard data');
      }
      const data = await res.json();
      setTeacher(data.teacher);
      setStats(data.stats);
      setSchedules(data.schedules || []);
      setRecentLogs(data.recentLogs || []);
      setStudents(data.assignedStudents || []);
      setNotifications(data.notifications || []);
    } catch (err: any) {
      console.error('Dashboard load error:', err);
      setFetchError(err.message || 'Error loading dashboard. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB. Please choose a smaller image.');
      return;
    }

    setSelectedAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveAvatar = async () => {
    if (!selectedAvatarFile) return;

    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedAvatarFile);

      const res = await fetch('/api/teacher/avatar', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile picture');

      if (data.teacher) {
        setTeacher(data.teacher);
      }
      setSelectedAvatarFile(null);
      setProfileModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Error updating profile photo');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!confirm('Are you sure you want to remove your profile photo?')) return;
    setAvatarUploading(true);
    try {
      const res = await fetch('/api/teacher/avatar', {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove photo');

      if (data.teacher) {
        setTeacher(data.teacher);
      }
      setSelectedAvatarFile(null);
      setAvatarPreview('');
      setProfileModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Error removing photo');
    }
  };

  // Class Actions
  const handleStartClass = async (schedule: Schedule) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/teacher/class/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduleId: schedule.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start class');

      await fetchDashboardData();
    } catch (err: any) {
      alert(err.message || 'Error starting class');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/teacher/class/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduleId: selectedSchedule.id,
          remarks,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to end class');

      setEndModalOpen(false);
      setRemarks('');
      setSelectedSchedule(null);
      await fetchDashboardData();
    } catch (err: any) {
      alert(err.message || 'Error ending class');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/teacher/class/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduleId: selectedSchedule.id,
          reason: cancelReason,
          remarks,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel class');

      setCancelModalOpen(false);
      setRemarks('');
      setSelectedSchedule(null);
      await fetchDashboardData();
    } catch (err: any) {
      alert(err.message || 'Error cancelling class');
    } finally {
      setActionLoading(false);
    }
  };

  const todayStr = getLocalTodayString();
  
  // Active today schedules (pending or in-progress)
  const todayActiveSchedules = schedules.filter(s => {
    const isTodayDate = s.date ? s.date === todayStr : s.day_of_week === 'Today';
    return isTodayDate && s.status !== 'completed' && s.status !== 'cancelled';
  });

  // Completed or past day sessions
  const completedSessions = schedules.filter(s => {
    const isPastDate = s.date ? s.date < todayStr : false;
    return s.status === 'completed' || s.status === 'cancelled' || isPastDate;
  }).sort((a, b) => {
    if (a.date !== b.date) return (b.date || '').localeCompare(a.date || '');
    return (b.start_time || '').localeCompare(a.start_time || '');
  });

  // Upcoming scheduled classes (active pending classes from today onwards)
  const upcomingSchedules = schedules.filter(s => {
    if (s.status === 'completed' || s.status === 'cancelled') return false;
    if (!s.date) return true;
    return s.date >= todayStr;
  }).sort((a, b) => {
    if (a.date !== b.date) return (a.date || '').localeCompare(b.date || '');
    return (a.start_time || '').localeCompare(b.start_time || '');
  });

  if (loading || fetchError) {
    if (fetchError) {
      return (
        <div className="min-h-screen bg-navy-dark flex items-center justify-center p-6">
          <div className="text-center space-y-4 max-w-sm bg-navy-primary/80 backdrop-blur-md p-8 rounded-3xl border border-red-500/30 shadow-2xl animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto text-2xl font-bold border border-red-500/30">
              ⚠️
            </div>
            <h3 className="text-white font-black text-base">Unable to Load Workspace</h3>
            <p className="text-slate-300 text-xs leading-relaxed">{fetchError}</p>
            <button
              onClick={() => {
                setLoading(true);
                fetchDashboardData();
              }}
              className="w-full py-3 bg-gold-accent hover:bg-gold-hover text-navy-dark font-extrabold text-xs rounded-xl shadow-lg transition-all transform active:scale-95"
            >
              Retry Loading Workspace
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-100 pb-10 overflow-hidden animate-in fade-in duration-300">
        {/* Skeleton Top Header */}
        <header className="bg-navy-primary text-white sticky top-0 z-30 shadow-lg border-b border-gold-accent/20">
          <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-3 w-24 bg-gold-accent/30 rounded-md animate-pulse" />
              <div className="h-5 w-40 bg-white/20 rounded-md animate-pulse" />
            </div>
            <div className="w-9 h-9 rounded-full bg-white/10 animate-pulse" />
          </div>
        </header>

        {/* Skeleton Hero Banner */}
        <div className="bg-navy-dark text-white pt-6 pb-12 px-4 shadow-inner relative overflow-hidden">
          <div className="max-w-4xl mx-auto flex items-center justify-between relative z-10">
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gold-accent/20 rounded-full animate-pulse" />
              <div className="h-7 w-48 bg-white/20 rounded-lg animate-pulse" />
              <div className="h-3.5 w-40 bg-white/10 rounded-md animate-pulse" />
            </div>

            {/* Glowing Live Sync Badge */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 border border-gold-accent/30 backdrop-blur-md shadow-xl animate-pulse">
              <Sparkles className="w-4 h-4 text-gold-accent animate-spin" style={{ animationDuration: '3s' }} />
              <span className="text-xs font-extrabold text-gold-accent tracking-wide">Syncing Live Data...</span>
            </div>
          </div>
        </div>

        {/* Skeleton Stats Grid */}
        <div className="max-w-4xl mx-auto px-4 -mt-7 relative z-20 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-4 rounded-2xl shadow-md border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-slate-100 animate-pulse" />
                <div className="h-3 w-12 bg-slate-100 rounded-md animate-pulse" />
              </div>
              <div className="h-7 w-16 bg-slate-200 rounded-lg animate-pulse" />
              <div className="h-3 w-20 bg-slate-100 rounded-md animate-pulse" />
            </div>
          ))}
        </div>

        {/* Skeleton Schedules & Activity Cards */}
        <div className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="h-5 w-40 bg-slate-200 rounded-md animate-pulse" />
              <div className="h-4 w-16 bg-slate-100 rounded-md animate-pulse" />
            </div>
            {[1, 2].map((i) => (
              <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-32 bg-slate-200 rounded-md animate-pulse" />
                  <div className="h-5 w-20 bg-slate-200 rounded-full animate-pulse" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-3 w-24 bg-slate-100 rounded-md animate-pulse" />
                  <div className="h-3 w-20 bg-slate-100 rounded-md animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-20 sm:pb-10">
      {/* Mobile Top Header Navigation */}
      <header className="bg-navy-primary text-white sticky top-0 z-30 shadow-lg border-b border-gold-accent/20">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-xs text-gold-accent font-bold uppercase tracking-wider block">Teacher Workspace</span>
              <h1 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                Welcome back, {teacher?.name || 'Teacher'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification Icon */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-2 rounded-xl bg-navy-dark hover:bg-slate-800 text-slate-200 relative transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {notifications.some(n => !n.read_status) && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-gold-accent rounded-full animate-ping" />
                )}
              </button>

              {/* Notification Dropdown */}
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-navy-primary">Notifications</h3>
                    <span className="text-[10px] bg-gold-light text-navy-primary px-2 py-0.5 rounded-full font-bold">
                      {notifications.length} alerts
                    </span>
                  </div>
                  <div className="space-y-2.5 max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 py-2 text-center">No new notifications</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                          <p className="font-bold text-navy-primary">{n.title}</p>
                          <p className="text-slate-600 text-[11px] mt-0.5">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 pt-4 sm:pt-6 space-y-6">
        {/* TEACHER PROFILE BANNER CARD */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 relative overflow-hidden">
          <div className="relative group shrink-0">
            {teacher?.avatar_url ? (
              <img
                src={teacher.avatar_url}
                alt={teacher.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-gold-accent shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => {
                  setAvatarPreview(teacher?.avatar_url || '');
                  setProfileModalOpen(true);
                }}
              />
            ) : (
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-navy-primary text-gold-accent font-black text-xl sm:text-2xl flex items-center justify-center border-4 border-gold-accent shadow-md cursor-pointer hover:scale-105 transition-transform"
                onClick={() => {
                  setAvatarPreview(teacher?.avatar_url || '');
                  setProfileModalOpen(true);
                }}
              >
                {getTeacherInitials(teacher?.name)}
              </div>
            )}
            <button
              onClick={() => {
                setAvatarPreview(teacher?.avatar_url || '');
                setProfileModalOpen(true);
              }}
              className="absolute bottom-0 right-0 p-2 bg-gold-accent text-navy-dark rounded-full shadow-md hover:scale-110 transition-transform border-2 border-white"
              title="Upload / Change Profile Picture"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-navy-primary tracking-tight">
                {teacher?.name || 'Teacher Profile'}
              </h2>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] uppercase rounded-full">
                Active Faculty
              </span>
            </div>

            <p className="text-xs text-slate-500 font-semibold flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <span>📧 {teacher?.email}</span>
              <span>📞 {teacher?.phone}</span>
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">Subjects:</span>
              {teacher?.subjects?.map(s => (
                <span key={s} className="px-2.5 py-0.5 bg-navy-subtle text-navy-primary font-bold text-xs rounded-full">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-end justify-between gap-3 self-stretch">
            <button
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="flex items-center gap-1 text-xs font-bold text-navy-primary hover:text-gold-accent transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
            </button>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                onClick={() => {
                  setAvatarPreview(teacher?.avatar_url || '');
                  setProfileModalOpen(true);
                }}
                className="px-3 py-1.5 bg-gold-light hover:bg-gold-accent text-navy-primary font-extrabold text-xs rounded-xl border border-gold-accent/40 flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <Camera className="w-3.5 h-3.5" /> Profile Photo
              </button>
              <button
                onClick={() => {
                  setPasswordError('');
                  setPasswordSuccess('');
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setChangePasswordModalOpen(true);
                }}
                className="px-3 py-1.5 bg-navy-subtle hover:bg-navy-primary hover:text-white text-navy-primary font-extrabold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5" /> Password
              </button>
            </div>
          </div>
        </div>

        {/* STATS CARDS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-9 h-9 rounded-xl bg-navy-subtle text-navy-primary flex items-center justify-center mb-2">
              <Calendar className="w-5 h-5" />
            </div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Today's Classes</p>
            <p className="text-2xl font-black text-navy-primary mt-0.5">{stats.todayClassesCount}</p>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-9 h-9 rounded-xl bg-gold-light text-gold-accent flex items-center justify-center mb-2">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Upcoming</p>
            <p className="text-2xl font-black text-navy-primary mt-0.5">{stats.upcomingClassesCount}</p>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <CheckCircle className="w-5 h-5" />
            </div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">This Month</p>
            <p className="text-2xl font-black text-navy-primary mt-0.5">{stats.monthClassesCount} classes</p>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
              <BookOpen className="w-5 h-5" />
            </div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hours (Month)</p>
            <p className="text-2xl font-black text-navy-primary mt-0.5">{stats.monthHours} hrs</p>
          </div>
        </div>

        {/* TAB NAVIGATION BAR */}
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap text-center ${
              activeTab === 'today'
                ? 'bg-navy-primary text-white shadow-md'
                : 'text-slate-600 hover:text-navy-primary hover:bg-slate-50'
            }`}
          >
            Today ({todayActiveSchedules.length})
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap text-center ${
              activeTab === 'upcoming'
                ? 'bg-navy-primary text-white shadow-md'
                : 'text-slate-600 hover:text-navy-primary hover:bg-slate-50'
            }`}
          >
            Upcoming ({upcomingSchedules.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap text-center ${
              activeTab === 'history'
                ? 'bg-navy-primary text-white shadow-md'
                : 'text-slate-600 hover:text-navy-primary hover:bg-slate-50'
            }`}
          >
            History ({recentLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap text-center ${
              activeTab === 'students'
                ? 'bg-navy-primary text-white shadow-md'
                : 'text-slate-600 hover:text-navy-primary hover:bg-slate-50'
            }`}
          >
            My Students ({students.length})
          </button>
        </div>

        {/* TAB 1: TODAY'S CLASSES & COMPLETED SESSIONS */}
        {activeTab === 'today' && (
          <div className="space-y-6">
            {/* ACTIVE TODAY'S SCHEDULED CLASSES */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-wider text-navy-primary flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold-accent" /> Today's Scheduled Classes
                </h2>
                <span className="text-xs text-slate-500 font-semibold">{todayStr}</span>
              </div>

              {todayActiveSchedules.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 shadow-2xs">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-navy-primary text-xs sm:text-sm">No Active Classes Scheduled For Today</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Check completed sessions below or view upcoming timetables.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayActiveSchedules.map(schedule => {
                    const isInProgress = schedule.status === 'in_progress';

                    return (
                      <div
                        key={schedule.id}
                        className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all shadow-sm ${
                          isInProgress
                            ? 'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/20'
                            : 'border-slate-200 hover:border-navy-primary/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="px-2.5 py-0.5 bg-navy-subtle text-navy-primary font-bold text-xs rounded-full">
                                {schedule.subject_name}
                              </span>
                              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 font-medium text-xs rounded-full">
                                {schedule.grade_class}
                              </span>
                              {schedule.is_batch && (
                                <span className="px-2.5 py-0.5 bg-gold-light text-navy-primary font-bold text-xs rounded-full border border-gold-accent/40">
                                  👥 Small Batch ({schedule.student_names?.length || 5} Students)
                                </span>
                              )}
                              {schedule.is_rescheduled && (
                                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 font-extrabold text-xs rounded-full border border-amber-300 flex items-center gap-1 shadow-2xs">
                                  🔄 Rescheduled by Admin
                                </span>
                              )}
                            </div>
                            <h3 className="text-base font-extrabold text-navy-primary flex items-center gap-1.5 mt-1">
                              <User className="w-4 h-4 text-gold-accent" /> {schedule.batch_name || schedule.student_name}
                            </h3>

                            {schedule.student_names && schedule.student_names.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {schedule.student_names.map(sName => (
                                  <span key={sName} className="px-2 py-0.5 bg-slate-100 text-navy-primary text-[11px] font-bold rounded-md border border-slate-200">
                                    👤 {sName}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Status Badge */}
                          <div>
                            {isInProgress ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-white font-black text-xs rounded-full shadow-sm animate-pulse">
                                <span className="w-2 h-2 bg-white rounded-full" /> In Progress
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 font-bold text-xs rounded-full">
                                <Clock className="w-3.5 h-3.5" /> Scheduled
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Time Details */}
                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-xl mb-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-navy-primary" /> {formatTime12Hr(schedule.start_time)} - {formatTime12Hr(schedule.end_time)}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => {
                              setSelectedSchedule(schedule);
                              setEndModalOpen(true);
                            }}
                            disabled={actionLoading}
                            className="col-span-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                          >
                            <CheckCircle className="w-4.5 h-4.5 text-white" /> Mark Completed
                          </button>

                          <button
                            onClick={() => {
                              setSelectedSchedule(schedule);
                              setCancelModalOpen(true);
                            }}
                            className="py-3 px-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl border border-red-200 flex items-center justify-center gap-1 transition-all"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Cancel
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SEPARATE COMPLETED SESSIONS SECTION */}
            {completedSessions.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-200/80">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black uppercase tracking-wider text-navy-primary flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" /> Completed Sessions
                  </h2>
                  <span className="text-xs text-slate-500 font-semibold">({completedSessions.length} total)</span>
                </div>

                <div className="space-y-3">
                  {completedSessions.map(schedule => {
                    const isCompleted = schedule.status === 'completed';
                    const isCancelled = schedule.status === 'cancelled';
                    const dayTag = calculateDayTag(schedule.date);

                    return (
                      <div
                        key={schedule.id}
                        className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all shadow-sm ${
                          isCompleted
                            ? 'border-emerald-200/80 bg-emerald-50/10'
                            : isCancelled
                            ? 'border-red-200/80 bg-red-50/10'
                            : 'border-slate-200 opacity-80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="px-2.5 py-0.5 bg-navy-subtle text-navy-primary font-bold text-xs rounded-full">
                                {schedule.subject_name}
                              </span>
                              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 font-medium text-xs rounded-full">
                                {schedule.grade_class}
                              </span>
                              {schedule.is_batch && (
                                <span className="px-2.5 py-0.5 bg-gold-light text-navy-primary font-bold text-xs rounded-full border border-gold-accent/40">
                                  👥 Small Batch ({schedule.student_names?.length || 5} Students)
                                </span>
                              )}
                              {schedule.is_rescheduled && (
                                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 font-extrabold text-xs rounded-full border border-amber-300 flex items-center gap-1 shadow-2xs">
                                  🔄 Rescheduled by Admin
                                </span>
                              )}
                            </div>
                            <h3 className="text-base font-extrabold text-navy-primary flex items-center gap-1.5 mt-1">
                              <User className="w-4 h-4 text-gold-accent" /> {schedule.batch_name || schedule.student_name}
                            </h3>

                            {schedule.student_names && schedule.student_names.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {schedule.student_names.map(sName => (
                                  <span key={sName} className="px-2 py-0.5 bg-slate-100 text-navy-primary text-[11px] font-bold rounded-md border border-slate-200">
                                    👤 {sName}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Status Badge */}
                          <div>
                            {isCompleted && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">
                                <CheckCircle className="w-3.5 h-3.5" /> Completed
                              </span>
                            )}
                            {isCancelled && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 font-bold text-xs rounded-full">
                                <XCircle className="w-3.5 h-3.5" /> Cancelled
                              </span>
                            )}
                            {!isCompleted && !isCancelled && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 font-bold text-xs rounded-full">
                                <Clock className="w-3.5 h-3.5" /> Day Ended
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Date & Timing Bar */}
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                          <span className="flex items-center gap-1.5 font-bold text-navy-primary">
                            <Calendar className="w-3.5 h-3.5 text-navy-primary" />
                            {formatDateDDMMYYYY(schedule.date)} {dayTag ? `(${dayTag})` : ''}
                          </span>
                          <span className="flex items-center gap-1 text-slate-600 font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-500" /> {formatTime12Hr(schedule.start_time)} - {formatTime12Hr(schedule.end_time)}
                          </span>
                        </div>

                        <div className="mt-3 py-2 px-3 bg-emerald-50 text-emerald-700 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-emerald-200">
                          <CheckCircle className="w-4 h-4 text-emerald-600" /> Session Completed
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: UPCOMING CLASSES */}
        {activeTab === 'upcoming' && (
          <div className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-navy-primary">Upcoming Timetable</h2>
            {upcomingSchedules.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                <p className="font-bold text-navy-primary text-sm">No Upcoming Classes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingSchedules.map(schedule => (
                  <div key={schedule.id} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="px-2.5 py-0.5 bg-navy-subtle text-navy-primary font-bold text-xs rounded-full">
                            {schedule.subject_name}
                          </span>
                          <span className="text-xs bg-slate-100 px-2.5 py-0.5 rounded-full font-medium text-slate-700">
                            {schedule.grade_class}
                          </span>
                          {schedule.is_batch && (
                            <span className="px-2.5 py-0.5 bg-gold-light text-navy-primary font-bold text-xs rounded-full border border-gold-accent/40">
                              👥 Small Batch ({schedule.student_names?.length || 5} Students)
                            </span>
                          )}
                          {schedule.is_rescheduled && (
                            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 font-extrabold text-xs rounded-full border border-amber-300 flex items-center gap-1 shadow-2xs">
                              🔄 Rescheduled by Admin
                            </span>
                          )}
                        </div>

                        <h3 className="font-extrabold text-base text-navy-primary flex items-center gap-1.5 mt-1">
                          <User className="w-4 h-4 text-gold-accent" /> {schedule.batch_name || schedule.student_name}
                        </h3>

                        {schedule.student_names && schedule.student_names.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {schedule.student_names.map(sName => (
                              <span key={sName} className="px-2 py-0.5 bg-slate-100 text-navy-primary text-[11px] font-bold rounded-md border border-slate-200">
                                👤 {sName}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <span className="px-3 py-1 bg-navy-subtle text-navy-primary font-bold text-xs rounded-full whitespace-nowrap">
                        {calculateDayTag(schedule.date) || schedule.day_of_week}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-xl mt-2">
                      <span>📅 {formatDateDDMMYYYY(schedule.date)}</span>
                      <span>•</span>
                      <span>⏰ {formatTime12Hr(schedule.start_time)} - {formatTime12Hr(schedule.end_time)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: HISTORY LOGS */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-navy-primary">Class Log History</h2>
            {recentLogs.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                <p className="font-bold text-navy-primary text-sm">No Class History Recorded Yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentLogs.map(log => {
                  const studentList = log.student_names && log.student_names.length > 0
                    ? [...log.student_names].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
                    : [log.student_name];

                  return (
                    <div key={log.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            {log.batch_name && (
                              <span className="px-2.5 py-0.5 bg-gold-light text-navy-primary font-black text-xs rounded-full border border-gold-accent/40">
                                🏷️ {log.batch_name}
                              </span>
                            )}
                            <span className="text-xs bg-slate-100 px-2.5 py-0.5 rounded-full font-bold text-slate-700">
                              {log.subject_name} ({log.grade_class})
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                            <span className="px-2.5 py-1 bg-white text-navy-primary text-xs font-bold rounded-xl border border-slate-200 shadow-2xs inline-flex items-center gap-1">
                              👤 {studentList[0]}
                            </span>
                            {studentList.length > 1 && (
                              <button
                                onClick={() => setStudentModalData({
                                  title: log.batch_name ? `${log.batch_name} Enrolled Students` : 'Class Students',
                                  students: studentList,
                                })}
                                className="px-2.5 py-1 bg-navy-subtle text-navy-primary font-extrabold text-xs rounded-xl border border-navy-primary/20 hover:bg-navy-primary hover:text-white transition-colors flex items-center gap-1"
                              >
                                +{studentList.length - 1} more
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-full inline-block ${
                            log.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {log.status === 'completed' ? `${log.duration_minutes} mins` : `Cancelled: ${log.cancelled_reason || 'Other'}`}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-500 font-semibold pt-1 border-t border-slate-100 flex items-center justify-between">
                        <span>📅 {formatDateDDMMYYYY(log.date)} • ⏰ {formatTime12Hr(log.start_time)} - {formatTime12Hr(log.end_time)}</span>
                      </div>

                      {log.status === 'cancelled' ? (
                        <div className="mt-1 bg-red-50/70 p-2.5 rounded-xl border border-red-200/60 space-y-0.5">
                          <p className="text-xs font-extrabold text-red-700">
                            🚫 Cancellation Reason: {log.cancelled_reason || 'Other'}
                          </p>
                          {log.remarks && (
                            <p className="text-xs text-red-900/80 font-medium italic">
                              "{log.remarks}"
                            </p>
                          )}
                        </div>
                      ) : (
                        log.remarks && (
                          <p className="mt-1 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                            "{log.remarks}"
                          </p>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: MY STUDENTS */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-navy-primary">Assigned Students</h2>
            {students.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                <p className="font-bold text-navy-primary text-sm">No Students Assigned Yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {students.map(std => (
                  <div key={std.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-black text-navy-primary text-sm">{std.name}</h4>
                      <span className="px-2 py-0.5 bg-gold-light text-navy-primary text-[10px] font-bold rounded-full">
                        {std.board}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-600">{std.grade_class}</p>
                    <p className="text-xs text-slate-500 mt-1">Guardian: {std.guardian_name}</p>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-gold-accent" /> {std.phone}
                      </span>
                      <a
                        href={`https://wa.me/${std.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-emerald-600 hover:underline"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL: END CLASS */}
      {endModalOpen && selectedSchedule && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <h3 className="text-lg font-black text-navy-primary mb-1">Complete & Log Class</h3>
            <p className="text-xs text-slate-500 mb-4">
              Student: <span className="font-bold text-navy-primary">{selectedSchedule.student_name}</span> ({selectedSchedule.subject_name})
            </p>

            <form onSubmit={handleEndClassSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Short Class Remarks (Optional)
                </label>
                <textarea
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  rows={3}
                  placeholder="e.g. Completed Chapter 4, assigned practice questions 1 to 5."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-navy-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEndModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="py-2.5 px-5 bg-navy-primary hover:bg-navy-dark text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" /> Save & Complete Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CANCEL CLASS */}
      {cancelModalOpen && selectedSchedule && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <h3 className="text-lg font-black text-red-600 mb-1">Cancel Scheduled Class</h3>
            <p className="text-xs text-slate-500 mb-4">
              Class with <span className="font-bold text-navy-primary">{selectedSchedule.student_name}</span>
            </p>

            <form onSubmit={handleCancelClassSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Cancellation Reason
                </label>
                <div className="space-y-2">
                  {['Student Absent', 'Teacher Unavailable', 'Holiday', 'Other'].map(r => (
                    <label key={r} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-100">
                      <input
                        type="radio"
                        name="cancelReason"
                        value={r}
                        checked={cancelReason === r}
                        onChange={e => setCancelReason(e.target.value)}
                        className="text-navy-primary focus:ring-navy-primary"
                      />
                      {r}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Cancellation Remarks & Additional Note (Optional)
                </label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="e.g. Student informed 1 hour prior due to health issues."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-navy-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="py-2.5 px-5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BATCH STUDENTS MODAL */}
      {studentModalData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-black text-navy-primary">{studentModalData.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{studentModalData.students.length} Total Students Enrolled</p>
              </div>
              <button
                onClick={() => setStudentModalData(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {studentModalData.students.map((sName, idx) => (
                <div
                  key={sName}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200/80"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-navy-subtle text-navy-primary font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </div>
                    <span className="font-bold text-xs text-navy-primary">{sName}</span>
                  </div>
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-full">
                    Enrolled
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setStudentModalData(null)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-xs rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PROFILE & AVATAR SETTINGS */}
      {profileModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 my-auto max-h-[90vh] overflow-y-auto space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-navy-primary">Profile & Avatar Settings</h3>
                <p className="text-xs text-slate-500 mt-0.5">Upload a professional profile photo for students & admin to see.</p>
              </div>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center text-center space-y-4 py-2">
              <div className="relative group">
                <div className="relative overflow-hidden rounded-full border-4 border-gold-accent shadow-xl w-28 h-28">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt={teacher?.name || 'Teacher'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-navy-primary text-gold-accent font-black text-2xl flex items-center justify-center">
                      {getTeacherInitials(teacher?.name)}
                    </div>
                  )}
                </div>

                <label className="absolute bottom-0 right-0 p-2.5 bg-gold-accent hover:bg-gold-hover text-navy-dark rounded-full shadow-lg cursor-pointer hover:scale-110 active:scale-90 transition-all border-2 border-white">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileSelect}
                    disabled={avatarUploading}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <h4 className="font-extrabold text-sm text-navy-primary">{teacher?.name}</h4>
                <p className="text-xs text-slate-500">{teacher?.email}</p>
                <p className="text-[11px] text-slate-400 mt-1 font-semibold">Supported: JPG, PNG, WebP (Max 5MB)</p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-3 border-t border-slate-100">
              <label className={`w-full py-2.5 px-4 bg-navy-subtle hover:bg-navy-primary hover:text-white text-navy-primary font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] text-center ${avatarUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                <Upload className="w-4 h-4" /> Select New Photo from Device
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileSelect}
                  disabled={avatarUploading}
                  className="hidden"
                />
              </label>

              {avatarPreview && avatarPreview !== teacher?.avatar_url && (
                <button
                  type="button"
                  onClick={handleSaveAvatar}
                  disabled={avatarUploading}
                  className="w-full py-3 px-4 bg-gold-accent hover:bg-gold-hover text-navy-dark font-black text-xs rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {avatarUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 text-navy-dark animate-spin" />
                      <span>Uploading to Cloudinary CDN...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Save Profile Photo</span>
                    </>
                  )}
                </button>
              )}

              {teacher?.avatar_url && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={avatarUploading}
                  className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-extrabold text-xs rounded-xl transition-all hover:shadow-sm active:scale-[0.98] flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {avatarUploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Removing...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Profile Photo</span>
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setProfileModalOpen(false);
                  setPasswordError('');
                  setPasswordSuccess('');
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setChangePasswordModalOpen(true);
                }}
                disabled={avatarUploading}
                className="w-full py-2.5 px-4 bg-navy-subtle hover:bg-navy-primary hover:text-white text-navy-primary font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] mt-1"
              >
                <KeyRound className="w-4 h-4" /> Change Account Password
              </button>

              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="w-full py-2 px-4 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors mt-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CHANGE PASSWORD */}
      {changePasswordModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 my-auto space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-gold-light text-navy-primary rounded-xl">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-navy-primary">Change Password</h3>
                  <p className="text-xs text-slate-500">Update your teacher account credentials.</p>
                </div>
              </div>
              <button
                onClick={() => setChangePasswordModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {passwordError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-700 font-bold">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-navy-primary focus:outline-none focus:border-navy-primary focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 chars, 1 uppercase, 1 number, 1 special"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-navy-primary focus:outline-none focus:border-navy-primary focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-navy-primary focus:outline-none focus:border-navy-primary focus:bg-white font-medium"
                />
              </div>

              <div className="text-[11px] text-slate-500 space-y-0.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="font-bold text-slate-700">Password Requirements:</p>
                <p>• At least 8 characters</p>
                <p>• 1 uppercase & 1 lowercase letter</p>
                <p>• 1 number & 1 special character (!@#$%^&*)</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setChangePasswordModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-5 py-2.5 bg-navy-primary hover:bg-navy-dark text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  {passwordLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-gold-accent" />
                  )}
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
