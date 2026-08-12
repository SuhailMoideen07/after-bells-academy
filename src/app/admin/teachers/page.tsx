"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Search, UserCheck, KeyRound, Power, Edit3, ShieldAlert, Check, Trash2, Clock, Calendar, GraduationCap, FileSpreadsheet, X, Users, BookOpen } from 'lucide-react';
import type { Teacher, ClassLog, Student } from '@/types/tms';

import { useAdminData } from '@/context/AdminDataContext';

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

export default function TeacherManagementPage() {
  const {
    teachers,
    students,
    loading,
    addTeacherLocally,
    updateTeacherLocally,
    deleteTeacherLocally,
    refetchAdminData,
  } = useAdminData();
  const [search, setSearch] = useState('');

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [subjectsStr, setSubjectsStr] = useState('Mathematics, Physics');
  const [bio, setBio] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Edit Teacher form state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editSubjectsStr, setEditSubjectsStr] = useState('');
  const [editBio, setEditBio] = useState('');

  // Activity Modal state
  const [activityLogs, setActivityLogs] = useState<ClassLog[]>([]);
  const [activityStudents, setActivityStudents] = useState<Student[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  // Modal submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!name || !email || !password) {
      alert('Please fill out all required fields');
      return;
    }

    setIsSubmitting(true);
    const subjects = subjectsStr.split(',').map(s => s.trim()).filter(Boolean);

    const optimisticTeacher: Teacher = {
      id: 'tch_opt_' + Date.now(),
      user_id: 'usr_opt_' + Date.now(),
      email,
      name,
      phone,
      bio,
      subjects,
      assigned_student_count: 0,
      status: 'active',
      created_at: new Date().toISOString(),
    };

    // INSTANT FEEDBACK: Add locally & close modal immediately!
    addTeacherLocally(optimisticTeacher);
    setAddModalOpen(false);
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setBio('');

    try {
      const res = await fetch('/api/admin/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, subjects, bio }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create teacher');

      if (data.teacher) {
        deleteTeacherLocally(optimisticTeacher.id);
        addTeacherLocally(data.teacher);
      }
      refetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Error creating teacher');
      deleteTeacherLocally(optimisticTeacher.id);
      refetchAdminData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditModal = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setEditName(teacher.name);
    setEditEmail(teacher.email);
    setEditPhone(teacher.phone);
    setEditSubjectsStr(teacher.subjects.join(', '));
    setEditBio(teacher.bio || '');
    setEditModalOpen(true);
  };

  const handleSaveEditTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher || isSubmitting) return;

    setIsSubmitting(true);
    const subjects = editSubjectsStr.split(',').map(s => s.trim()).filter(Boolean);
    const teacherId = selectedTeacher.id;

    const optimisticTeacher: Partial<Teacher> = {
      name: editName,
      email: editEmail,
      phone: editPhone,
      subjects,
      bio: editBio,
    };

    // INSTANT FEEDBACK: Update locally & close modal immediately!
    updateTeacherLocally(teacherId, optimisticTeacher);
    setEditModalOpen(false);
    setSelectedTeacher(null);

    try {
      const res = await fetch('/api/admin/teachers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId,
          name: editName,
          email: editEmail,
          phone: editPhone,
          subjects,
          bio: editBio,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update teacher');

      if (data.teacher) updateTeacherLocally(teacherId, data.teacher);
      refetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Error updating teacher');
      refetchAdminData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenActivityModal = async (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setActivityModalOpen(true);
    setActivityLoading(true);

    try {
      const resLogs = await fetch(`/api/admin/logs?teacherId=${teacher.id}`);
      if (resLogs.ok) {
        const dLogs = await resLogs.json();
        setActivityLogs(dLogs.logs || []);
      }
      const teacherStudents = students.filter((s: Student) => s.assigned_teacher_id === teacher.id);
      setActivityStudents(teacherStudents);
    } catch (err) {
      console.error(err);
    } finally {
      setActivityLoading(false);
    }
  };

  const handleToggleStatus = async (teacher: Teacher) => {
    const newStatus = teacher.status === 'active' ? 'disabled' : 'active';
    updateTeacherLocally(teacher.id, { status: newStatus as any });
    try {
      const res = await fetch('/api/admin/teachers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId: teacher.id, action: 'toggle_status' }),
      });
      if (res.ok) refetchAdminData();
    } catch (err) {
      console.error(err);
      refetchAdminData();
    }
  };

  const handleDeleteTeacher = async (teacher: Teacher) => {
    if (!confirm(`Are you sure you want to delete teacher "${teacher.name}"? This action cannot be undone.`)) return;

    try {
      deleteTeacherLocally(teacher.id);
      const res = await fetch(`/api/admin/teachers?id=${teacher.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete teacher');
      refetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Error deleting teacher');
      refetchAdminData();
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    if (!selectedTeacher || !newPassword) return;
    e.preventDefault();

    try {
      const res = await fetch('/api/admin/teachers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: selectedTeacher.id,
          action: 'reset_password',
          newPassword,
        }),
      });

      if (res.ok) {
        alert(`Password for ${selectedTeacher.name} reset successfully!`);
        setResetModalOpen(false);
        setNewPassword('');
        setSelectedTeacher(null);
      }
    } catch (err: any) {
      alert(err.message || 'Error resetting password');
    }
  };

  const filteredTeachers = teachers.filter(
    t =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      t.subjects.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  // Compute stats for Activity Modal
  const completedActivityLogs = activityLogs.filter(l => l.status === 'completed');
  const totalActivityMinutes = completedActivityLogs.reduce((acc, l) => acc + (l.duration_minutes || 0), 0);
  const totalActivityHours = Math.round((totalActivityMinutes / 60) * 10) / 10;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-primary tracking-tight">Teacher Management</h1>
          <p className="text-xs text-slate-500 mt-1">Manage academy faculty, edit profiles, view hours & class logs.</p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="px-4 py-2.5 bg-gold-accent hover:bg-gold-hover text-navy-dark font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add New Teacher Account
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search teachers by name, email, or subject..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-navy-primary shadow-sm"
        />
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeachers.map(t => (
          <div key={t.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3.5">
                  {t.avatar_url ? (
                    <img
                      src={t.avatar_url}
                      alt={t.name}
                      className="w-16 h-16 rounded-full object-cover border-3 border-gold-accent shadow-md shrink-0 mt-0.5 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => handleOpenActivityModal(t)}
                    />
                  ) : (
                    <div
                      className="w-16 h-16 rounded-full bg-navy-primary text-gold-accent font-black text-base flex items-center justify-center border-3 border-gold-accent shadow-md shrink-0 mt-0.5 cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => handleOpenActivityModal(t)}
                    >
                      {getTeacherInitials(t.name)}
                    </div>
                  )}

                  <div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      t.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {t.status}
                    </span>
                    <h3
                      className="text-base font-black text-navy-primary mt-1 hover:underline cursor-pointer"
                      onClick={() => handleOpenActivityModal(t)}
                    >
                      {t.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">{t.email}</p>
                    <p className="text-xs text-slate-500 font-medium">📞 {t.phone}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenEditModal(t)}
                  className="p-2 text-slate-500 hover:text-navy-primary hover:bg-slate-100 rounded-xl transition-colors shrink-0"
                  title="Edit Teacher Details"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Subjects</p>
                <div className="flex flex-wrap gap-1">
                  {t.subjects.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-navy-subtle text-navy-primary font-semibold text-[11px] rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {t.bio && <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">{t.bio}</p>}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <button
                onClick={() => handleOpenActivityModal(t)}
                className="w-full py-2 bg-gold-light/60 hover:bg-gold-accent text-navy-primary font-extrabold text-xs rounded-xl border border-gold-accent/40 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <Clock className="w-3.5 h-3.5" /> View Hours & Activity Logs
              </button>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedTeacher(t);
                      setResetModalOpen(true);
                    }}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-navy-primary" /> Reset
                  </button>
                  <button
                    onClick={() => handleToggleStatus(t)}
                    className={`px-2.5 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1 ${
                      t.status === 'active' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" /> {t.status === 'active' ? 'Disable' : 'Enable'}
                  </button>
                </div>

                <button
                  onClick={() => handleDeleteTeacher(t)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Delete Teacher Account"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: ADD TEACHER */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 my-auto max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-navy-primary mb-1">Add Teacher Account</h3>
            <p className="text-xs text-slate-500 mb-4">Create login credentials and assign subjects.</p>

            <form onSubmit={handleCreateTeacher} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Dr. Priya Sharma"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="priya@gmail.com"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Initial Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Teacher@123"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Assigned Subjects (comma separated)</label>
                <input
                  type="text"
                  value={subjectsStr}
                  onChange={e => setSubjectsStr(e.target.value)}
                  placeholder="Mathematics, Physics"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-gold-accent hover:bg-gold-hover text-navy-dark font-extrabold text-xs rounded-xl shadow-md"
                >
                  Create Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT TEACHER DETAILS */}
      {editModalOpen && selectedTeacher && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 my-auto max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-navy-primary mb-1">Edit Teacher Details</h3>
            <p className="text-xs text-slate-500 mb-4">Update profile information for <span className="font-bold text-navy-primary">{selectedTeacher.name}</span>.</p>

            <form onSubmit={handleSaveEditTeacher} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Assigned Subjects (comma separated)</label>
                <input
                  type="text"
                  value={editSubjectsStr}
                  onChange={e => setEditSubjectsStr(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Bio / Qualifications</label>
                <textarea
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditModalOpen(false);
                    setSelectedTeacher(null);
                  }}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-gold-accent hover:bg-gold-hover text-navy-dark font-extrabold text-xs rounded-xl shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESET PASSWORD */}
      {resetModalOpen && selectedTeacher && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 my-auto max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-navy-primary mb-1">Reset Password</h3>
            <p className="text-xs text-slate-500 mb-4">Set a new password for <span className="font-bold text-navy-primary">{selectedTeacher.name}</span>.</p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="NewSecretPassword123"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-navy-primary hover:bg-navy-dark text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Save New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TEACHER ACTIVITY & LOGS */}
      {activityModalOpen && selectedTeacher && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-4xl shadow-2xl border border-slate-200 my-auto max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-4">
                {selectedTeacher.avatar_url ? (
                  <img
                    src={selectedTeacher.avatar_url}
                    alt={selectedTeacher.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-gold-accent shadow-md shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-navy-primary text-gold-accent font-black text-xl flex items-center justify-center border-4 border-gold-accent shadow-md shrink-0">
                    {getTeacherInitials(selectedTeacher.name)}
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-navy-primary">{selectedTeacher.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      selectedTeacher.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedTeacher.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-semibold">
                    📧 {selectedTeacher.email} • 📞 {selectedTeacher.phone}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActivityModalOpen(false);
                  setSelectedTeacher(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activityLoading ? (
              <div className="p-12 text-center text-slate-500">
                <div className="w-8 h-8 border-4 border-navy-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="font-bold text-xs">Loading teacher activity & logs...</p>
              </div>
            ) : (
              <>
                {/* Stats Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-navy-subtle/50 p-4 rounded-2xl border border-navy-primary/10 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Completed Sessions</p>
                      <p className="text-2xl font-black text-navy-primary mt-0.5">{completedActivityLogs.length}</p>
                    </div>
                    <FileSpreadsheet className="w-8 h-8 text-navy-primary opacity-30" />
                  </div>

                  <div className="bg-gold-light/50 p-4 rounded-2xl border border-gold-accent/30 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Hours Taught</p>
                      <p className="text-2xl font-black text-navy-primary mt-0.5">{totalActivityHours} hrs</p>
                    </div>
                    <Clock className="w-8 h-8 text-gold-accent opacity-60" />
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200/60 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assigned Students</p>
                      <p className="text-2xl font-black text-emerald-800 mt-0.5">{activityStudents.length}</p>
                    </div>
                    <Users className="w-8 h-8 text-emerald-600 opacity-40" />
                  </div>
                </div>

                {/* Assigned Students Chips */}
                {activityStudents.length > 0 && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-navy-primary">Assigned Students ({activityStudents.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {activityStudents.map(std => (
                        <span key={std.id} className="px-3 py-1.5 bg-white text-navy-primary font-bold text-xs rounded-xl border border-slate-200 shadow-2xs">
                          👤 {std.name} <span className="text-[10px] text-slate-500 font-semibold">({std.grade_class} • {std.board})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Class Logs Feed Table */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden space-y-2">
                  <div className="p-3.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-navy-primary">
                      Class Logs History ({activityLogs.length})
                    </h4>
                  </div>

                  {activityLogs.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs font-bold">
                      No class logs recorded for this teacher yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto max-h-72 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 uppercase text-slate-500 font-bold sticky top-0 border-b border-slate-200">
                          <tr>
                            <th className="p-3">Date</th>
                            <th className="p-3">Timing & Duration</th>
                            <th className="p-3">Batch / Student</th>
                            <th className="p-3">Subject</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Remarks / Reason</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {activityLogs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-50">
                              <td className="p-3 font-bold text-slate-800 whitespace-nowrap">{formatDateDDMMYYYY(log.date)}</td>
                              <td className="p-3 whitespace-nowrap">
                                <span className="font-semibold block">{formatTime12Hr(log.start_time)} - {formatTime12Hr(log.end_time)}</span>
                                <span className="text-[10px] font-extrabold text-navy-primary block">⏱️ {log.duration_minutes} mins</span>
                              </td>
                              <td className="p-3 font-bold text-navy-primary">
                                {log.batch_name ? (
                                  <span className="px-2 py-0.5 bg-gold-light text-navy-primary font-black text-[11px] rounded-lg border border-gold-accent/40">
                                    🏷️ {log.batch_name}
                                  </span>
                                ) : (
                                  <span>👤 {log.student_name}</span>
                                )}
                              </td>
                              <td className="p-3 font-semibold text-slate-700">{log.subject_name}</td>
                              <td className="p-3 whitespace-nowrap">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  log.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {log.status}
                                </span>
                              </td>
                              <td className="p-3 max-w-xs text-slate-600">
                                {log.status === 'cancelled' ? (
                                  <div className="space-y-0.5">
                                    <span className="font-extrabold text-red-600 block">Reason: {log.cancelled_reason || 'Other'}</span>
                                    {log.remarks && (
                                      <span className="text-[11px] text-slate-700 italic block font-medium">
                                        "{log.remarks}"
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  log.remarks || '—'
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
