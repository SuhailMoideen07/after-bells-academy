"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Calendar, Clock, User, BookOpen, Sparkles, Trash2, Search, Filter, X, AlertTriangle, Edit2 } from 'lucide-react';
import type { Schedule, Teacher, Student, Subject, Batch } from '@/types/tms';

export function getLocalTodayString(d = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calculateDayTag(dateStr: string): string {
  if (!dateStr) return 'Today';
  const todayStr = getLocalTodayString();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = getLocalTodayString(tomorrow);

  if (dateStr === todayStr) return 'Today';
  if (dateStr === tomorrowStr) return 'Tomorrow';

  const parts = dateStr.split('-').map(Number);
  if (parts.length === 3) {
    const [y, m, d] = parts;
    const selectedDate = new Date(y, m - 1, d);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[selectedDate.getDay()] || 'Scheduled';
  }

  return 'Scheduled';
}

export function formatDateDDMMYYYY(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}-${month}-${year}`;
}

export function formatTime12Hr(time24: string): string {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  if (isNaN(h)) return time24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const hFormatted = String(h).padStart(2, '0');
  return `${hFormatted}:${mStr || '00'} ${ampm}`;
}

export const TIME_SLOTS_12HR = [
  { value24: '06:00', label12: '06:00 AM' },
  { value24: '06:30', label12: '06:30 AM' },
  { value24: '07:00', label12: '07:00 AM' },
  { value24: '07:30', label12: '07:30 AM' },
  { value24: '08:00', label12: '08:00 AM' },
  { value24: '08:30', label12: '08:30 AM' },
  { value24: '09:00', label12: '09:00 AM' },
  { value24: '09:30', label12: '09:30 AM' },
  { value24: '10:00', label12: '10:00 AM' },
  { value24: '10:30', label12: '10:30 AM' },
  { value24: '11:00', label12: '11:00 AM' },
  { value24: '11:30', label12: '11:30 AM' },
  { value24: '12:00', label12: '12:00 PM' },
  { value24: '12:30', label12: '12:30 PM' },
  { value24: '13:00', label12: '01:00 PM' },
  { value24: '13:30', label12: '01:30 PM' },
  { value24: '14:00', label12: '02:00 PM' },
  { value24: '14:30', label12: '02:30 PM' },
  { value24: '15:00', label12: '03:00 PM' },
  { value24: '15:30', label12: '03:30 PM' },
  { value24: '16:00', label12: '04:00 PM' },
  { value24: '16:30', label12: '04:30 PM' },
  { value24: '17:00', label12: '05:00 PM' },
  { value24: '17:30', label12: '05:30 PM' },
  { value24: '18:00', label12: '06:00 PM' },
  { value24: '18:30', label12: '06:30 PM' },
  { value24: '19:00', label12: '07:00 PM' },
  { value24: '19:30', label12: '07:30 PM' },
  { value24: '20:00', label12: '08:00 PM' },
  { value24: '20:30', label12: '08:30 PM' },
  { value24: '21:00', label12: '09:00 PM' },
  { value24: '21:30', label12: '09:30 PM' },
  { value24: '22:00', label12: '10:00 PM' },
];

export function addOneHour(time24: string): string {
  if (!time24) return '17:00';
  const [hStr, mStr] = time24.split(':');
  let h = (parseInt(hStr, 10) + 1) % 24;
  return `${String(h).padStart(2, '0')}:${mStr || '00'}`;
}

export default function SchedulesManagementPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Student details modal
  const [studentModalData, setStudentModalData] = useState<{ title: string; students: string[] } | null>(null);

  // Add/Edit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [newBatchModalOpen, setNewBatchModalOpen] = useState(false);
  const [newBatchTitle, setNewBatchTitle] = useState('');
  const [newBatchStudentIds, setNewBatchStudentIds] = useState<string[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [batchName, setBatchName] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [subjectName, setSubjectName] = useState('Mathematics');
  const [date, setDate] = useState(getLocalTodayString());
  const [dayOfWeek, setDayOfWeek] = useState('Today');
  const [startTime, setStartTime] = useState('16:00');
  const [endTime, setEndTime] = useState('17:00');

  const handleStartTimeSelect = (newStartTime: string) => {
    setStartTime(newStartTime);
    setEndTime(addOneHour(newStartTime));
  };

  const loadData = async () => {
    try {
      const [resSch, resTch, resStd, resBtc] = await Promise.all([
        fetch('/api/admin/schedules'),
        fetch('/api/admin/teachers'),
        fetch('/api/admin/students'),
        fetch('/api/admin/batches'),
      ]);

      if (resSch.ok && resTch.ok && resStd.ok) {
        const dSch = await resSch.json();
        const dTch = await resTch.json();
        const dStd = await resStd.json();
        const dBtc = resBtc.ok ? await resBtc.json() : { batches: [] };

        setSchedules(dSch.schedules || []);
        setTeachers(dTch.teachers || []);
        setStudents(dStd.students || []);
        setBatches(dBtc.batches || []);

        if (dTch.teachers.length > 0 && !teacherId) setTeacherId(dTch.teachers[0].id);
        if (dStd.students.length > 0 && selectedStudentIds.length === 0) {
          setSelectedStudentIds([dStd.students[0].id]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Strict Validation: enforce exactly 1 hour (60 minutes) schedule duration
  const [sH, sM] = startTime.split(':').map(Number);
  const [eH, eM] = endTime.split(':').map(Number);
  const startMins = !isNaN(sH) ? sH * 60 + (sM || 0) : 0;
  const endMins = !isNaN(eH) ? eH * 60 + (eM || 0) : 0;
  const durationMinutes = endMins - startMins;

  const isTimeInverted = endMins <= startMins;
  const isNotOneHour = durationMinutes !== 60;
  const isTimeInvalid = isTimeInverted || isNotOneHour;

  const handleOpenEditModal = (sch: Schedule) => {
    setEditingSchedule(sch);
    setTeacherId(sch.teacher_id);
    setSubjectName(sch.subject_name);
    setDate(sch.date);
    setDayOfWeek(sch.day_of_week || calculateDayTag(sch.date));
    setStartTime(sch.start_time);
    setEndTime(sch.end_time);
    setBatchName(sch.batch_name || '');

    const foundBatch = batches.find(b => b.name === sch.batch_name);
    if (foundBatch) {
      setSelectedBatchId(foundBatch.id);
    } else {
      setSelectedBatchId('');
    }

    if (sch.student_names && sch.student_names.length > 0) {
      const matchIds = students.filter(s => sch.student_names!.includes(s.name)).map(s => s.id);
      setSelectedStudentIds(matchIds.length > 0 ? matchIds : (sch.student_id ? [sch.student_id] : []));
    } else if (sch.student_id) {
      setSelectedStudentIds([sch.student_id]);
    } else {
      setSelectedStudentIds([]);
    }

    setModalOpen(true);
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId || selectedStudentIds.length === 0 || !subjectName || !date || !startTime || !endTime) {
      alert('Please select at least one student and fill out all schedule parameters.');
      return;
    }

    if (isTimeInvalid) {
      alert('Invalid schedule time! Classes must be scheduled for exactly 1 hour (60 minutes).');
      return;
    }

    try {
      const selectedStudents = students.filter(s => selectedStudentIds.includes(s.id));
      const studentNames = selectedStudents.map(s => s.name);

      const displayStudentName = batchName
        ? `${batchName} (${selectedStudents.length} Students)`
        : selectedStudents.length > 1
        ? `${selectedStudents[0].name} +${selectedStudents.length - 1} others`
        : selectedStudents[0]?.name || 'Student';

      const isEditing = Boolean(editingSchedule);
      const res = await fetch('/api/admin/schedules', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(isEditing && { id: editingSchedule!.id }),
          teacher_id: teacherId,
          student_id: selectedStudentIds[0] || 'batch_grp',
          student_name: displayStudentName,
          student_names: studentNames,
          batch_name: batchName,
          is_batch: selectedStudents.length > 1 || Boolean(batchName),
          subject_name: subjectName,
          grade_class: selectedStudents[0] ? selectedStudents[0].grade_class : 'General',
          day_of_week: dayOfWeek,
          start_time: startTime,
          end_time: endTime,
          date,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save schedule');

      setModalOpen(false);
      setEditingSchedule(null);
      setBatchName('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error saving schedule');
    }
  };

  const handleClearAllSchedules = async () => {
    if (!confirm('Are you sure you want to clear ALL schedules? This cannot be undone.')) return;
    try {
      const res = await fetch('/api/admin/schedules?all=true', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to clear schedules');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error clearing schedules');
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    try {
      const res = await fetch(`/api/admin/schedules?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete schedule');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error deleting schedule');
    }
  };

  const handleSaveNewBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchTitle || !newBatchTitle.trim()) {
      alert('Please enter a batch name');
      return;
    }

    try {
      const batchStudents = students.filter(s => newBatchStudentIds.includes(s.id));
      const batchStudentNames = batchStudents.map(s => s.name);

      const res = await fetch('/api/admin/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newBatchTitle.trim(),
          subject_name: subjectName,
          student_ids: newBatchStudentIds,
          student_names: batchStudentNames,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save batch');
      }

      if (data.batch) {
        setBatches(prev => [...prev, data.batch]);
        setSelectedBatchId(data.batch.id);
        setBatchName(data.batch.name);
        if (data.batch.student_ids && data.batch.student_ids.length > 0) {
          setSelectedStudentIds(data.batch.student_ids);
        }
        setNewBatchTitle('');
        setNewBatchStudentIds([]);
        setNewBatchModalOpen(false);
      }
    } catch (err: any) {
      alert(err.message || 'Error saving batch');
    }
  };

  const filteredSchedules = schedules.filter(sch => {
    if (search) {
      const q = search.toLowerCase();
      const matchTeacher = sch.teacher_name?.toLowerCase().includes(q);
      const matchBatch = sch.batch_name?.toLowerCase().includes(q);
      const matchSubject = sch.subject_name?.toLowerCase().includes(q);
      const matchStudentName = sch.student_name?.toLowerCase().includes(q);
      const matchStudents = sch.student_names?.some(s => s.toLowerCase().includes(q));
      if (!matchTeacher && !matchBatch && !matchSubject && !matchStudentName && !matchStudents) {
        return false;
      }
    }
    if (selectedTeacher && sch.teacher_id !== selectedTeacher) return false;
    if (selectedBatch && sch.batch_name !== selectedBatch) return false;
    if (selectedStatus && sch.status !== selectedStatus) return false;
    return true;
  });

  const visibleStudents = useMemo(() => {
    if (!selectedBatchId) return students;
    const found = batches.find(b => b.id === selectedBatchId);
    if (!found) return students;

    const ids = found.student_ids || [];
    const names = found.student_names || [];

    if (ids.length === 0 && names.length === 0) return students;

    return students.filter(s => ids.includes(s.id) || names.includes(s.name));
  }, [selectedBatchId, batches, students]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-primary tracking-tight">Schedule Management</h1>
          <p className="text-xs text-slate-500 mt-1">Generate weekly timetables, manage batches, and set class timings for faculty.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setNewBatchModalOpen(true)}
            className="px-3.5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Create New Batch
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 bg-gold-accent hover:bg-gold-hover text-navy-dark font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Create Class Schedule
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search schedules by student, batch, teacher, or subject..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-navy-primary"
          />
        </div>

        <select
          value={selectedTeacher}
          onChange={e => setSelectedTeacher(e.target.value)}
          className="w-full sm:w-40 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none font-semibold text-slate-700"
        >
          <option value="">All Teachers</option>
          {teachers.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        <select
          value={selectedBatch}
          onChange={e => setSelectedBatch(e.target.value)}
          className="w-full sm:w-44 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none font-semibold text-slate-700"
        >
          <option value="">All Batches</option>
          {[...batches]
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }))
            .map(b => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
        </select>

        <select
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
          className="w-full sm:w-36 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none font-semibold text-slate-700"
        >
          <option value="">All Statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* SCHEDULES TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-navy-primary uppercase tracking-wider">
            Total Active Schedules ({filteredSchedules.length})
          </span>
        </div>

        {filteredSchedules.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-sm text-navy-primary">No Active Schedules</p>
            <p className="text-xs mt-1">Create a schedule to populate the teacher and admin timetable.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Time</th>
                  <th className="p-3.5">Teacher</th>
                  <th className="p-3.5">Batch</th>
                  <th className="p-3.5">Attended Student(s)</th>
                  <th className="p-3.5">Subject & Class</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredSchedules.map(sch => {
                  const studentList: string[] = sch.student_names && sch.student_names.length > 0
                    ? [...sch.student_names].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
                    : [sch.student_name || 'Student'];

                  const hasMore = studentList.length > 1;

                  return (
                    <tr key={sch.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 text-slate-800 font-bold whitespace-nowrap">{formatDateDDMMYYYY(sch.date)} ({sch.day_of_week})</td>
                      <td className="p-3.5 text-slate-600 whitespace-nowrap">{formatTime12Hr(sch.start_time)} - {formatTime12Hr(sch.end_time)}</td>
                      <td className="p-3.5 text-navy-primary font-extrabold whitespace-nowrap">{sch.teacher_name}</td>
                      
                      {/* Separate Batch Column */}
                      <td className="p-3.5 whitespace-nowrap">
                        {sch.batch_name ? (
                          <span className="px-2.5 py-1 bg-gold-light text-navy-primary font-black text-xs rounded-xl border border-gold-accent/40 inline-flex items-center gap-1">
                            🏷️ {sch.batch_name}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">—</span>
                        )}
                      </td>

                      {/* Attended Students Column with +N expand button */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2.5 py-1 bg-white text-navy-primary font-bold text-xs rounded-xl border border-slate-200 shadow-2xs inline-flex items-center gap-1 whitespace-nowrap">
                            👤 {studentList[0]}
                          </span>
                          {hasMore && (
                            <button
                              onClick={() => setStudentModalData({
                                title: sch.batch_name ? `${sch.batch_name} Enrolled Students` : 'Class Students',
                                students: studentList,
                              })}
                              className="px-2.5 py-1 bg-navy-subtle text-navy-primary font-extrabold text-xs rounded-xl border border-navy-primary/20 hover:bg-navy-primary hover:text-white transition-colors flex items-center gap-1"
                              title="Click to view all students in this batch"
                            >
                              +{studentList.length - 1} more
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-slate-800">{sch.subject_name}</span>
                        <span className="text-slate-500 block text-[10px]">{sch.grade_class}</span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          sch.status === 'in_progress' ? 'bg-amber-100 text-amber-800' : sch.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : sch.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {sch.status}
                        </span>
                        {sch.is_rescheduled && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-extrabold rounded-md border border-amber-300 ml-1.5 inline-flex items-center gap-1">
                            🔄 Rescheduled
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEditModal(sch)}
                          className="p-1.5 text-slate-500 hover:text-navy-primary hover:bg-slate-100 rounded-xl transition-colors mr-1"
                          title="Edit Schedule"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(sch.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Delete Schedule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: CREATE / EDIT SCHEDULE */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 my-auto max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-navy-primary mb-1">
              {editingSchedule ? 'Edit Class Schedule' : 'Create Class Schedule'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">Set date, time slot, teacher, and student.</p>

            <form onSubmit={handleCreateSchedule} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase text-slate-700">
                    Select Saved Batch (Dropdown)
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewBatchModalOpen(true)}
                    className="text-[11px] font-bold text-navy-primary hover:underline flex items-center gap-1"
                  >
                    + Add New Batch Name
                  </button>
                </div>

                <select
                  value={selectedBatchId}
                  onChange={e => {
                    const id = e.target.value;
                    setSelectedBatchId(id);
                    const found = batches.find(b => b.id === id);
                    if (found) {
                      setBatchName(found.name);
                      if (found.subject_name) setSubjectName(found.subject_name);
                      const batchStudentIds = students
                        .filter(s => (found.student_ids || []).includes(s.id) || (found.student_names || []).includes(s.name))
                        .map(s => s.id);
                      setSelectedStudentIds(batchStudentIds.length > 0 ? batchStudentIds : (found.student_ids || []));
                    } else {
                      setBatchName('');
                    }
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  <option value="">-- Select a Pre-defined Batch (e.g. BATCH A-01) --</option>
                  {[...batches]
                    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }))
                    .map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} {b.subject_name ? `(${b.subject_name})` : ''}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Batch / Class Name (Custom or Selected)</label>
                <input
                  type="text"
                  value={batchName}
                  onChange={e => setBatchName(e.target.value)}
                  placeholder="e.g. AFTER BELLS | BATCH A-01"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Teacher</label>
                <select
                  value={teacherId}
                  onChange={e => setTeacherId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  required
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase text-slate-700">
                    Select Students ({selectedStudentIds.length} Selected)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const visibleIds = visibleStudents.map((s: Student) => s.id);
                      const allSelected = visibleIds.length > 0 && visibleIds.every((id: string) => selectedStudentIds.includes(id));
                      if (allSelected) {
                        setSelectedStudentIds(selectedStudentIds.filter(id => !visibleIds.includes(id)));
                      } else {
                        setSelectedStudentIds(Array.from(new Set([...selectedStudentIds, ...visibleIds])));
                      }
                    }}
                    className="text-[11px] font-bold text-navy-primary hover:underline"
                  >
                    {visibleStudents.length > 0 && visibleStudents.every((s: Student) => selectedStudentIds.includes(s.id)) ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="max-h-36 overflow-y-auto bg-slate-50 border border-slate-200 rounded-xl p-2 space-y-1">
                  {visibleStudents.length === 0 ? (
                    <p className="text-xs text-slate-500 py-2 text-center">No enrolled students found for this batch.</p>
                  ) : (
                    visibleStudents.map((s: Student) => {
                      const isSelected = selectedStudentIds.includes(s.id);
                      return (
                        <label
                          key={s.id}
                          className={`flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            isSelected ? 'bg-gold-light/60 border border-gold-accent/40 text-navy-primary font-bold' : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedStudentIds([...selectedStudentIds, s.id]);
                              } else {
                                setSelectedStudentIds(selectedStudentIds.filter(id => id !== s.id));
                              }
                            }}
                            className="w-4 h-4 rounded border-slate-300 text-navy-primary focus:ring-navy-primary"
                          />
                          <span className="flex-1">{s.name} <span className="text-[10px] font-semibold text-slate-500">({s.grade_class} - {s.board})</span></span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={subjectName}
                  onChange={e => setSubjectName(e.target.value)}
                  placeholder="Mathematics"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => {
                      const val = e.target.value;
                      setDate(val);
                      setDayOfWeek(calculateDayTag(val));
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Day Tag</label>
                  <select
                    value={dayOfWeek}
                    onChange={e => setDayOfWeek(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="Today">Today</option>
                    <option value="Tomorrow">Tomorrow</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Start Time</label>
                  <div className="space-y-1.5">
                    <select
                      value={TIME_SLOTS_12HR.some(slot => slot.value24 === startTime) ? startTime : 'custom'}
                      onChange={e => {
                        if (e.target.value !== 'custom') {
                          handleStartTimeSelect(e.target.value);
                        }
                      }}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                    >
                      {!TIME_SLOTS_12HR.some(slot => slot.value24 === startTime) && (
                        <option value="custom">Custom Time ({formatTime12Hr(startTime)})</option>
                      )}
                      {TIME_SLOTS_12HR.map(slot => (
                        <option key={slot.value24} value={slot.value24}>
                          {slot.label12}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-500 font-bold uppercase whitespace-nowrap">Or type time:</span>
                      <input
                        type="time"
                        value={startTime}
                        onChange={e => handleStartTimeSelect(e.target.value)}
                        className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">End Time</label>
                  <div className="space-y-1.5">
                    <select
                      value={TIME_SLOTS_12HR.some(slot => slot.value24 === endTime) ? endTime : 'custom'}
                      onChange={e => {
                        if (e.target.value !== 'custom') {
                          setEndTime(e.target.value);
                        }
                      }}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                    >
                      {!TIME_SLOTS_12HR.some(slot => slot.value24 === endTime) && (
                        <option value="custom">Custom Time ({formatTime12Hr(endTime)})</option>
                      )}
                      {TIME_SLOTS_12HR.map(slot => (
                        <option key={slot.value24} value={slot.value24}>
                          {slot.label12}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-500 font-bold uppercase whitespace-nowrap">Or type time:</span>
                      <input
                        type="time"
                        value={endTime}
                        onChange={e => setEndTime(e.target.value)}
                        className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              {isTimeInverted ? (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold -mt-1 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Invalid time slot! End Time must be strictly later than Start Time (e.g. 6:00 PM to 5:00 PM is invalid).</span>
                </div>
              ) : isNotOneHour ? (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold -mt-1 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Only 1-hour class duration is allowed! Selected duration is {durationMinutes > 0 ? `${durationMinutes} mins` : 'invalid'}. Please set End Time to exactly 1 hour after Start Time.</span>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 font-semibold -mt-2">
                  ⏱️ Schedule duration is set to exactly 1 hour (60 mins).
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setEditingSchedule(null);
                  }}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTimeInvalid}
                  className={`py-2.5 px-5 font-extrabold text-xs rounded-xl shadow-md transition-all ${
                    isTimeInvalid
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      : 'bg-gold-accent hover:bg-gold-hover text-navy-dark'
                  }`}
                >
                  {editingSchedule ? 'Save & Update Schedule' : 'Schedule Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE NEW BATCH */}
      {newBatchModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 my-auto max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-navy-primary mb-1">Create New Batch Name</h3>
            <p className="text-xs text-slate-500 mb-4">Add a batch title and optionally assign students to this batch.</p>

            <form onSubmit={handleSaveNewBatch} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Batch Name / Title</label>
                <input
                  type="text"
                  value={newBatchTitle}
                  onChange={e => setNewBatchTitle(e.target.value)}
                  placeholder="e.g. AFTER BELLS | BATCH A-01"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase text-slate-700">
                    Add Students to Batch ({newBatchStudentIds.length} Selected)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (newBatchStudentIds.length === students.length) {
                        setNewBatchStudentIds([]);
                      } else {
                        setNewBatchStudentIds(students.map(s => s.id));
                      }
                    }}
                    className="text-[11px] font-bold text-navy-primary hover:underline"
                  >
                    {newBatchStudentIds.length === students.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="max-h-36 overflow-y-auto bg-slate-50 border border-slate-200 rounded-xl p-2 space-y-1">
                  {students.map(s => {
                    const isSelected = newBatchStudentIds.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className={`flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          isSelected ? 'bg-gold-light/60 border border-gold-accent/40 text-navy-primary font-bold' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={e => {
                            if (e.target.checked) {
                              setNewBatchStudentIds([...newBatchStudentIds, s.id]);
                            } else {
                              setNewBatchStudentIds(newBatchStudentIds.filter(id => id !== s.id));
                            }
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-navy-primary focus:ring-navy-primary"
                        />
                        <span className="flex-1">{s.name} <span className="text-[10px] text-slate-500">({s.grade_class} - {s.board})</span></span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewBatchModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-navy-primary hover:bg-navy-dark text-white font-extrabold text-xs rounded-xl shadow-md"
                >
                  Save Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BATCH STUDENTS MODAL */}
      {studentModalData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 my-auto max-h-[90vh] overflow-y-auto">
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
                  key={sName + idx}
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
    </div>
  );
}
