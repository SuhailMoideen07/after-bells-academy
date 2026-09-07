"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Calendar, Clock, User, BookOpen, Sparkles, Trash2, Search, Filter, X, AlertTriangle, Edit2, Repeat, Play, Pause, RefreshCw, CheckCircle2, RotateCcw, CheckSquare, Square } from 'lucide-react';
import type { Schedule, Teacher, Student, Subject, Batch, ScheduleTemplate, TemplateDay } from '@/types/tms';

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

import { useAdminData } from '@/context/AdminDataContext';

export const ALL_TEMPLATE_DAYS: { day: TemplateDay; label: string; short: string }[] = [
  { day: 'Monday', label: 'Monday', short: 'Mon' },
  { day: 'Tuesday', label: 'Tuesday', short: 'Tue' },
  { day: 'Wednesday', label: 'Wednesday', short: 'Wed' },
  { day: 'Thursday', label: 'Thursday', short: 'Thu' },
  { day: 'Friday', label: 'Friday', short: 'Fri' },
  { day: 'Saturday', label: 'Saturday', short: 'Sat' },
  { day: 'Sunday', label: 'Sunday', short: 'Sun' },
];

export function estimateTemplateClasses(daysOfWeek: TemplateDay[], activeFrom: string, activeUntil: string): number {
  if (!daysOfWeek || daysOfWeek.length === 0 || !activeFrom || !activeUntil || activeFrom > activeUntil) return 0;
  const DAY_MAP: Record<string, number> = {
    Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
    Thursday: 4, Friday: 5, Saturday: 6,
  };
  const targetDays = daysOfWeek.map(d => DAY_MAP[d] ?? -1).filter(n => n >= 0);
  const [fY, fM, fD] = activeFrom.split('-').map(Number);
  const [uY, uM, uD] = activeUntil.split('-').map(Number);
  const start = new Date(fY, fM - 1, fD);
  const end = new Date(uY, uM - 1, uD);
  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    if (targetDays.includes(cur.getDay())) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

export default function SchedulesManagementPage() {
  const {
    schedules,
    scheduleTemplates,
    teachers,
    students,
    batches,
    loading,
    addScheduleLocally,
    updateScheduleLocally,
    deleteScheduleLocally,
    deleteSchedulesLocally,
    addBatchLocally,
    deleteBatchLocally,
    addScheduleTemplateLocally,
    updateScheduleTemplateLocally,
    deleteScheduleTemplateLocally,
    refetchAdminData,
  } = useAdminData();
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Tab State: Individual Schedules vs Auto-Scheduling Templates
  const [activeTab, setActiveTab] = useState<'schedules' | 'templates'>('schedules');
  const [templateSearch, setTemplateSearch] = useState('');

  // Auto-Scheduling Template Modal & Form State
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [isSubmittingTemplate, setIsSubmittingTemplate] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [templateNotification, setTemplateNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [tplTeacherId, setTplTeacherId] = useState('');
  const [tplSelectedBatchId, setTplSelectedBatchId] = useState('');
  const [tplBatchName, setTplBatchName] = useState('');
  const [tplSelectedStudentIds, setTplSelectedStudentIds] = useState<string[]>([]);
  const [tplSubjectName, setTplSubjectName] = useState('Mathematics');
  const [tplDaysOfWeek, setTplDaysOfWeek] = useState<TemplateDay[]>(['Monday', 'Wednesday', 'Friday']);
  const [tplStartTime, setTplStartTime] = useState('16:00');
  const [tplEndTime, setTplEndTime] = useState('17:00');
  const [tplActiveFrom, setTplActiveFrom] = useState(getLocalTodayString());
  const [tplActiveUntil, setTplActiveUntil] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return getLocalTodayString(d);
  });

  // Filters
  const [search, setSearch] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedDatePreset, setSelectedDatePreset] = useState<'all' | 'today' | 'tomorrow' | 'this_week' | 'upcoming' | 'past' | 'custom'>('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Multi-Selection State & Bulk Delete
  const [selectedScheduleIds, setSelectedScheduleIds] = useState<string[]>([]);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Student details modal
  const [studentModalData, setStudentModalData] = useState<{ title: string; students: string[] } | null>(null);

  // Add/Edit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);
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

  const handleTplStartTimeSelect = (newStartTime: string) => {
    setTplStartTime(newStartTime);
    setTplEndTime(addOneHour(newStartTime));
  };

  useEffect(() => {
    if (teachers.length > 0 && !teacherId) setTeacherId(teachers[0].id);
    if (students.length > 0 && selectedStudentIds.length === 0) {
      setSelectedStudentIds([students[0].id]);
    }
    if (teachers.length > 0 && !tplTeacherId) setTplTeacherId(teachers[0].id);
    if (students.length > 0 && tplSelectedStudentIds.length === 0) {
      setTplSelectedStudentIds([students[0].id]);
    }
  }, [teachers, students, teacherId, selectedStudentIds, tplTeacherId, tplSelectedStudentIds]);

  // Strict Validation: enforce exactly 1 hour (60 minutes) schedule duration
  const [sH, sM] = startTime.split(':').map(Number);
  const [eH, eM] = endTime.split(':').map(Number);
  const startMins = !isNaN(sH) ? sH * 60 + (sM || 0) : 0;
  const endMins = !isNaN(eH) ? eH * 60 + (eM || 0) : 0;
  const durationMinutes = endMins - startMins;

  const isTimeInverted = endMins <= startMins;
  const isNotOneHour = durationMinutes !== 60;
  const isTimeInvalid = isTimeInverted || isNotOneHour;

  const handleOpenCreateModal = () => {
    setEditingSchedule(null);
    setBatchName('');
    setSelectedBatchId('');
    if (teachers.length > 0) setTeacherId(teachers[0].id);
    if (students.length > 0) setSelectedStudentIds([students[0].id]);
    else setSelectedStudentIds([]);
    setSubjectName('Mathematics');
    const today = getLocalTodayString();
    setDate(today);
    setDayOfWeek(calculateDayTag(today));
    setStartTime('16:00');
    setEndTime('17:00');
    setModalOpen(true);
  };

  const handleOpenCreateTemplateModal = () => {
    if (teachers.length > 0) setTplTeacherId(teachers[0].id);
    if (students.length > 0) setTplSelectedStudentIds([students[0].id]);
    else setTplSelectedStudentIds([]);
    setTplSelectedBatchId('');
    setTplBatchName('');
    setTplSubjectName('Mathematics');
    setTplDaysOfWeek(['Monday', 'Wednesday', 'Friday']);
    setTplStartTime('16:00');
    setTplEndTime('17:00');
    setTplActiveFrom(getLocalTodayString());
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    setTplActiveUntil(getLocalTodayString(d));
    setTemplateModalOpen(true);
  };

  const handleToggleTplDay = (day: TemplateDay) => {
    setTplDaysOfWeek(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSetTplPreset = (preset: 'mwf' | 'tts' | 'weekdays' | 'weekends' | 'all') => {
    if (preset === 'mwf') setTplDaysOfWeek(['Monday', 'Wednesday', 'Friday']);
    if (preset === 'tts') setTplDaysOfWeek(['Tuesday', 'Thursday', 'Saturday']);
    if (preset === 'weekdays') setTplDaysOfWeek(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    if (preset === 'weekends') setTplDaysOfWeek(['Saturday', 'Sunday']);
    if (preset === 'all') setTplDaysOfWeek(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingTemplate) return;

    if (!tplTeacherId || tplSelectedStudentIds.length === 0 || !tplSubjectName || tplDaysOfWeek.length === 0 || !tplStartTime || !tplEndTime || !tplActiveFrom || !tplActiveUntil) {
      alert('Please fill in all template fields and select at least one day and student.');
      return;
    }

    if (tplActiveFrom > tplActiveUntil) {
      alert('Start date must be before end date.');
      return;
    }

    setIsSubmittingTemplate(true);
    const selectedStudents = students.filter(s => tplSelectedStudentIds.includes(s.id));
    const studentNames = selectedStudents.map(s => s.name);
    const selectedTeacherObj = teachers.find(t => t.id === tplTeacherId);

    const displayStudentName = tplBatchName
      ? `${tplBatchName} (${selectedStudents.length} Students)`
      : selectedStudents.length > 1
      ? `${selectedStudents[0].name} +${selectedStudents.length - 1} others`
      : selectedStudents[0]?.name || 'Student';

    try {
      const res = await fetch('/api/admin/schedule-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_id: tplTeacherId,
          student_id: tplSelectedStudentIds[0] || 'batch_grp',
          student_name: displayStudentName,
          student_names: studentNames,
          batch_name: tplBatchName,
          is_batch: selectedStudents.length > 1 || Boolean(tplBatchName),
          subject_name: tplSubjectName,
          grade_class: selectedStudents[0] ? selectedStudents[0].grade_class : 'General',
          days_of_week: tplDaysOfWeek,
          start_time: tplStartTime,
          end_time: tplEndTime,
          active_from: tplActiveFrom,
          active_until: tplActiveUntil,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create auto-schedule template');

      if (data.template) {
        addScheduleTemplateLocally(data.template);
      }
      setTemplateModalOpen(false);
      setTemplateNotification({
        type: 'success',
        message: `Template saved! Generated ${data.generated?.created || 0} class schedules (${data.generated?.skipped || 0} duplicates skipped).`,
      });
      setTimeout(() => setTemplateNotification(null), 6000);
      refetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Error creating auto-schedule template');
    } finally {
      setIsSubmittingTemplate(false);
    }
  };

  const handleToggleTemplateActive = async (template: ScheduleTemplate) => {
    const updatedStatus = !template.is_active;
    updateScheduleTemplateLocally(template.id, { is_active: updatedStatus });
    try {
      const res = await fetch('/api/admin/schedule-templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: template.id, is_active: updatedStatus }),
      });
      if (!res.ok) {
        updateScheduleTemplateLocally(template.id, { is_active: template.is_active });
        throw new Error('Failed to update template status');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating template status');
    }
  };

  const handleRegenerateTemplate = async (template: ScheduleTemplate) => {
    if (regeneratingId) return;
    setRegeneratingId(template.id);
    try {
      const res = await fetch(`/api/admin/schedule-templates/${template.id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active_from: template.active_from, active_until: template.active_until }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to re-generate schedules');

      if (data.template) {
        updateScheduleTemplateLocally(template.id, data.template);
      }
      setTemplateNotification({
        type: 'success',
        message: `Regenerated schedules! Created ${data.generated?.created || 0} new sessions (${data.generated?.skipped || 0} existing skipped).`,
      });
      setTimeout(() => setTemplateNotification(null), 6000);
      refetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Error re-generating schedules');
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recurring schedule template? Existing scheduled classes will be preserved.')) return;
    deleteScheduleTemplateLocally(id);
    try {
      const res = await fetch(`/api/admin/schedule-templates?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete template');
      refetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Error deleting template');
      refetchAdminData();
    }
  };

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
    if (isSubmitting) return;

    if (!teacherId || selectedStudentIds.length === 0 || !subjectName || !date || !startTime || !endTime) {
      alert('Please select at least one student and fill out all schedule parameters.');
      return;
    }

    if (isTimeInvalid) {
      alert('Invalid schedule time! Classes must be scheduled for exactly 1 hour (60 minutes).');
      return;
    }

    setIsSubmitting(true);

    const selectedStudents = students.filter(s => selectedStudentIds.includes(s.id));
    const studentNames = selectedStudents.map(s => s.name);
    const selectedTeacherObj = teachers.find(t => t.id === teacherId);

    const displayStudentName = batchName
      ? `${batchName} (${selectedStudents.length} Students)`
      : selectedStudents.length > 1
      ? `${selectedStudents[0].name} +${selectedStudents.length - 1} others`
      : selectedStudents[0]?.name || 'Student';

    const isEditing = Boolean(editingSchedule);
    const targetEditId = editingSchedule?.id;

    const optimisticSchedule: Schedule = {
      id: isEditing ? targetEditId! : 'sch_opt_' + Date.now(),
      teacher_id: teacherId,
      teacher_name: selectedTeacherObj?.name || editingSchedule?.teacher_name || 'Teacher',
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
      status: editingSchedule?.status || 'scheduled',
      is_rescheduled: isEditing ? true : undefined,
    };

    // Instant Feedback: Optimistically update state & close modal instantly!
    if (isEditing && targetEditId) {
      updateScheduleLocally(targetEditId, optimisticSchedule);
    } else {
      addScheduleLocally(optimisticSchedule);
    }

    setModalOpen(false);
    setEditingSchedule(null);
    setBatchName('');

    try {
      const res = await fetch('/api/admin/schedules', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(isEditing && { id: targetEditId }),
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

      if (data.schedule) {
        if (isEditing && targetEditId) {
          updateScheduleLocally(targetEditId, data.schedule);
        } else {
          deleteScheduleLocally(optimisticSchedule.id);
          addScheduleLocally(data.schedule);
        }
      }
      refetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Error saving schedule');
      if (!isEditing) {
        deleteScheduleLocally(optimisticSchedule.id);
      }
      refetchAdminData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearAllSchedules = async () => {
    if (!confirm('Are you sure you want to clear ALL schedules? This cannot be undone.')) return;
    try {
      const res = await fetch('/api/admin/schedules?all=true', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to clear schedules');
      refetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Error clearing schedules');
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    try {
      deleteScheduleLocally(id);
      setSelectedScheduleIds(prev => prev.filter(item => item !== id));
      const res = await fetch(`/api/admin/schedules?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete schedule');
      refetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Error deleting schedule');
      refetchAdminData();
    }
  };

  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    schedules.forEach(s => {
      if (s.subject_name) set.add(s.subject_name);
    });
    ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Science', 'Social Studies'].forEach(s => set.add(s));
    return Array.from(set).sort();
  }, [schedules]);

  const isAnyFilterActive = Boolean(
    search ||
    selectedTeacher ||
    selectedDatePreset !== 'all' ||
    selectedDate ||
    selectedBatch ||
    selectedSubject ||
    selectedStatus
  );

  const handleResetFilters = () => {
    setSearch('');
    setSelectedTeacher('');
    setSelectedDatePreset('all');
    setSelectedDate('');
    setSelectedBatch('');
    setSelectedSubject('');
    setSelectedStatus('');
  };

  const handleSaveNewBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingBatch) return;

    if (!newBatchTitle || !newBatchTitle.trim()) {
      alert('Please enter a batch name');
      return;
    }

    setIsSubmittingBatch(true);

    try {
      const batchStudents = students.filter(s => newBatchStudentIds.includes(s.id));
      const batchStudentNames = batchStudents.map(s => s.name);

      const optimisticBatch: Batch = {
        id: 'btch_opt_' + Date.now(),
        name: newBatchTitle.trim(),
        subject_name: subjectName,
        grade_class: batchStudents[0]?.grade_class || '',
        student_ids: newBatchStudentIds,
        student_names: batchStudentNames,
        created_at: new Date().toISOString(),
      };

      addBatchLocally(optimisticBatch);
      setSelectedBatchId(optimisticBatch.id);
      setBatchName(optimisticBatch.name);
      if (optimisticBatch.student_ids && optimisticBatch.student_ids.length > 0) {
        setSelectedStudentIds(optimisticBatch.student_ids);
      }
      setNewBatchTitle('');
      setNewBatchStudentIds([]);
      setNewBatchModalOpen(false);

      const res = await fetch('/api/admin/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: optimisticBatch.name,
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
        deleteBatchLocally(optimisticBatch.id);
        addBatchLocally(data.batch);
        setSelectedBatchId(data.batch.id);
        setBatchName(data.batch.name);
        refetchAdminData();
      }
    } catch (err: any) {
      alert(err.message || 'Error saving batch');
      refetchAdminData();
    } finally {
      setIsSubmittingBatch(false);
    }
  };

  const filteredSchedules = useMemo(() => {
    const todayStr = getLocalTodayString();

    // Compute start & end of this week (Monday to Sunday)
    const now = new Date();
    const currentDay = now.getDay();
    const diffToMonday = (currentDay + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const weekStartStr = getLocalTodayString(monday);
    const weekEndStr = getLocalTodayString(sunday);

    return schedules
      .filter(sch => {
        if (search) {
          const q = search.toLowerCase();
          const matchTeacher = sch.teacher_name?.toLowerCase().includes(q);
          const matchBatch = sch.batch_name?.toLowerCase().includes(q);
          const matchSubject = sch.subject_name?.toLowerCase().includes(q);
          const matchStudentName = sch.student_name?.toLowerCase().includes(q);
          const matchStudents = sch.student_names?.some(s => s.toLowerCase().includes(q));
          const matchDate = sch.date?.toLowerCase().includes(q);
          if (!matchTeacher && !matchBatch && !matchSubject && !matchStudentName && !matchStudents && !matchDate) {
            return false;
          }
        }
        if (selectedTeacher && sch.teacher_id !== selectedTeacher) return false;
        if (selectedBatch && sch.batch_name !== selectedBatch) return false;
        if (selectedSubject && sch.subject_name !== selectedSubject) return false;
        if (selectedStatus && sch.status !== selectedStatus) return false;

        // Date Preset filtering
        if (selectedDatePreset === 'today') {
          if (sch.date !== todayStr) return false;
        } else if (selectedDatePreset === 'tomorrow') {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          if (sch.date !== getLocalTodayString(tomorrow)) return false;
        } else if (selectedDatePreset === 'this_week') {
          if (!sch.date || sch.date < weekStartStr || sch.date > weekEndStr) return false;
        } else if (selectedDatePreset === 'upcoming') {
          if (!sch.date || sch.date < todayStr) return false;
        } else if (selectedDatePreset === 'past') {
          if (!sch.date || sch.date >= todayStr) return false;
        } else if (selectedDatePreset === 'custom' && selectedDate) {
          if (sch.date !== selectedDate) return false;
        }

        // Direct date input filter (if a specific date is selected)
        if (selectedDate && selectedDatePreset !== 'custom') {
          if (sch.date !== selectedDate) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const dateCompare = (b.date || '').localeCompare(a.date || '');
        if (dateCompare !== 0) return dateCompare;
        const timeCompare = (b.start_time || '').localeCompare(a.start_time || '');
        if (timeCompare !== 0) return timeCompare;
        return (b.id || '').localeCompare(a.id || '');
      });
  }, [schedules, search, selectedTeacher, selectedBatch, selectedSubject, selectedStatus, selectedDatePreset, selectedDate]);

  const isAllFilteredSelected =
    filteredSchedules.length > 0 &&
    filteredSchedules.every(s => selectedScheduleIds.includes(s.id));

  const isSomeFilteredSelected =
    filteredSchedules.some(s => selectedScheduleIds.includes(s.id));

  const handleToggleSelectSchedule = (id: string) => {
    setSelectedScheduleIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    const filteredIds = filteredSchedules.map(s => s.id);
    if (isAllFilteredSelected) {
      setSelectedScheduleIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedScheduleIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleClearSelection = () => {
    setSelectedScheduleIds([]);
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedScheduleIds.length === 0 || isBulkDeleting) return;
    setIsBulkDeleting(true);
    const idsToDelete = [...selectedScheduleIds];

    // Optimistically update
    deleteSchedulesLocally(idsToDelete);
    setSelectedScheduleIds([]);
    setBulkDeleteModalOpen(false);

    try {
      const res = await fetch('/api/admin/schedules', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: idsToDelete }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete schedules');

      setTemplateNotification({
        type: 'success',
        message: `Deleted ${idsToDelete.length} schedule session${idsToDelete.length > 1 ? 's' : ''} successfully.`,
      });
      setTimeout(() => setTemplateNotification(null), 5000);
      refetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Error deleting selected schedules');
      refetchAdminData();
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const visibleStudents = useMemo(() => {
    if (!selectedBatchId) return students;
    const found = batches.find(b => b.id === selectedBatchId);
    if (!found) return students;

    const ids = found.student_ids || [];
    const names = found.student_names || [];

    if (ids.length === 0 && names.length === 0) return students;

    return students.filter(s => ids.includes(s.id) || names.includes(s.name) || selectedStudentIds.includes(s.id));
  }, [selectedBatchId, batches, students, selectedStudentIds]);

  const tplVisibleStudents = useMemo(() => {
    if (!tplSelectedBatchId) return students;
    const found = batches.find(b => b.id === tplSelectedBatchId);
    if (!found) return students;

    const ids = found.student_ids || [];
    const names = found.student_names || [];

    if (ids.length === 0 && names.length === 0) return students;

    return students.filter(s => ids.includes(s.id) || names.includes(s.name) || tplSelectedStudentIds.includes(s.id));
  }, [tplSelectedBatchId, batches, students, tplSelectedStudentIds]);

  const filteredTemplates = useMemo(() => {
    return (scheduleTemplates || []).filter(tpl => {
      if (!templateSearch) return true;
      const q = templateSearch.toLowerCase();
      const matchTeacher = tpl.teacher_name?.toLowerCase().includes(q);
      const matchBatch = tpl.batch_name?.toLowerCase().includes(q);
      const matchSubject = tpl.subject_name?.toLowerCase().includes(q);
      const matchStudentName = tpl.student_name?.toLowerCase().includes(q);
      const matchStudents = tpl.student_names?.some(s => s.toLowerCase().includes(q));
      const matchDays = tpl.days_of_week?.some(d => d.toLowerCase().includes(q));
      return matchTeacher || matchBatch || matchSubject || matchStudentName || matchStudents || matchDays;
    });
  }, [scheduleTemplates, templateSearch]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-primary tracking-tight">Schedule Management</h1>
          <p className="text-xs text-slate-500 mt-1">Automate recurring timetables, generate classes effortlessly, and manage batch schedules.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <button
            onClick={() => setNewBatchModalOpen(true)}
            className="px-3.5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" /> Create New Batch
          </button>
          <button
            onClick={handleOpenCreateTemplateModal}
            className="px-4 py-2.5 bg-navy-primary hover:bg-navy-dark text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
          >
            <Repeat className="w-4 h-4 text-gold-accent" /> Auto-Schedule (Recurring)
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-gold-accent hover:bg-gold-hover text-navy-dark font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> One-Off Class
          </button>
        </div>
      </div>

      {/* NOTIFICATION TOAST BANNER */}
      {templateNotification && (
        <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold animate-in fade-in slide-in-from-top-2 ${
          templateNotification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {templateNotification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />}
            <span>{templateNotification.message}</span>
          </div>
          <button onClick={() => setTemplateNotification(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TABS SELECTOR */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('schedules')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'schedules'
              ? 'bg-navy-primary text-white shadow-md'
              : 'text-slate-600 hover:text-navy-primary hover:bg-white bg-slate-50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Class Schedules</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === 'schedules' ? 'bg-gold-accent text-navy-dark' : 'bg-slate-200 text-slate-700'
          }`}>
            {schedules.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'templates'
              ? 'bg-navy-primary text-white shadow-md'
              : 'text-slate-600 hover:text-navy-primary hover:bg-white bg-slate-50'
          }`}
        >
          <Repeat className={`w-4 h-4 ${activeTab === 'templates' ? 'text-gold-accent' : 'text-slate-500'}`} />
          <span>Recurring Rules (Auto-Scheduling)</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === 'templates' ? 'bg-gold-accent text-navy-dark' : 'bg-slate-200 text-slate-700'
          }`}>
            {scheduleTemplates.length}
          </span>
        </button>
      </div>

      {/* TAB 1: INDIVIDUAL CLASS SCHEDULES */}
      {activeTab === 'schedules' && (
        <div className="space-y-4">
          {/* FILTER CONTROLS BAR */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row md:items-center gap-3 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by student, batch, teacher, subject, or date..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-navy-primary font-medium"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Teacher Dropdown */}
              <div className="w-full sm:w-44">
                <select
                  value={selectedTeacher}
                  onChange={e => setSelectedTeacher(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none font-semibold text-slate-700"
                >
                  <option value="">👤 All Teachers</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Date Filter: Preset + Specific Date Picker */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <select
                  value={selectedDatePreset}
                  onChange={e => {
                    const val = e.target.value as any;
                    setSelectedDatePreset(val);
                    if (val !== 'custom') setSelectedDate('');
                  }}
                  className="w-full sm:w-36 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none font-semibold text-slate-700"
                >
                  <option value="all">📅 All Dates</option>
                  <option value="today">Today</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="this_week">This Week</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                  <option value="custom">Specific Date...</option>
                </select>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => {
                    setSelectedDate(e.target.value);
                    setSelectedDatePreset('custom');
                  }}
                  className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
                  title="Filter by exact date"
                />
                {selectedDate && (
                  <button
                    onClick={() => {
                      setSelectedDate('');
                      setSelectedDatePreset('all');
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600"
                    title="Clear date filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Batch Dropdown */}
              <div className="w-full sm:w-44">
                <select
                  value={selectedBatch}
                  onChange={e => setSelectedBatch(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none font-semibold text-slate-700"
                >
                  <option value="">🏷️ All Batches</option>
                  {[...batches]
                    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }))
                    .map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                </select>
              </div>

              {/* Subject Dropdown */}
              <div className="w-full sm:w-36">
                <select
                  value={selectedSubject}
                  onChange={e => setSelectedSubject(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none font-semibold text-slate-700"
                >
                  <option value="">📚 All Subjects</option>
                  {availableSubjects.map(subj => (
                    <option key={subj} value={subj}>{subj}</option>
                  ))}
                </select>
              </div>

              {/* Status Dropdown */}
              <div className="w-full sm:w-36">
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none font-semibold text-slate-700"
                >
                  <option value="">⚡ All Statuses</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Reset All Filters Button */}
              {isAnyFilterActive && (
                <button
                  onClick={handleResetFilters}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
                  title="Clear all active filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
                </button>
              )}
            </div>

            {/* ACTIVE FILTERS CHIPS */}
            {isAnyFilterActive && (
              <div className="pt-2.5 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs">
                <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider">
                  Active Filters ({filteredSchedules.length} of {schedules.length} matches):
                </span>
                {selectedTeacher && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-navy-50 text-navy-primary text-xs font-semibold border border-navy-100">
                    Teacher: {teachers.find(t => t.id === selectedTeacher)?.name || selectedTeacher}
                    <button onClick={() => setSelectedTeacher('')} className="hover:text-red-500 cursor-pointer"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {(selectedDatePreset !== 'all' || selectedDate) && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gold-light text-navy-dark text-xs font-semibold border border-gold-accent/30">
                    Date: {selectedDate ? formatDateDDMMYYYY(selectedDate) : selectedDatePreset.replace('_', ' ')}
                    <button onClick={() => { setSelectedDate(''); setSelectedDatePreset('all'); }} className="hover:text-red-500 cursor-pointer"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {selectedBatch && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                    Batch: {selectedBatch}
                    <button onClick={() => setSelectedBatch('')} className="hover:text-red-500 cursor-pointer"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {selectedSubject && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                    Subject: {selectedSubject}
                    <button onClick={() => setSelectedSubject('')} className="hover:text-red-500 cursor-pointer"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {selectedStatus && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                    Status: {selectedStatus}
                    <button onClick={() => setSelectedStatus('')} className="hover:text-red-500 cursor-pointer"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {search && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                    Keyword: "{search}"
                    <button onClick={() => setSearch('')} className="hover:text-red-500 cursor-pointer"><X className="w-3 h-3" /></button>
                  </span>
                )}
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-red-600 hover:underline font-bold ml-1 cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* BULK ACTIONS BAR (Shows whenever 1 or more schedules are selected) */}
          {selectedScheduleIds.length > 0 && (
            <div className="bg-navy-primary text-white p-3.5 px-5 rounded-2xl flex items-center justify-between gap-3 shadow-lg flex-wrap animate-in fade-in slide-in-from-top-2 border border-navy-dark">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="w-7 h-7 rounded-xl bg-gold-accent text-navy-dark font-black text-xs flex items-center justify-center shadow-xs">
                  {selectedScheduleIds.length}
                </span>
                <span className="font-extrabold text-xs sm:text-sm">
                  {selectedScheduleIds.length} Schedule{selectedScheduleIds.length > 1 ? 's' : ''} Selected
                </span>
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="text-xs text-gold-accent hover:underline font-bold ml-1 cursor-pointer"
                >
                  {isAllFilteredSelected ? 'Deselect All Filtered' : `Select All Filtered (${filteredSchedules.length})`}
                </button>
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="text-xs text-slate-300 hover:text-white hover:underline font-medium cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBulkDeleteModalOpen(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Delete Selected ({selectedScheduleIds.length})
                </button>
              </div>
            </div>
          )}

          {/* SCHEDULES TABLE */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-navy-primary uppercase tracking-wider">
                Total Active Schedules ({filteredSchedules.length})
              </span>
              {selectedScheduleIds.length > 0 && (
                <span className="text-xs font-extrabold text-red-600">
                  {selectedScheduleIds.length} selected for action
                </span>
              )}
            </div>

            {filteredSchedules.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-sm text-navy-primary">No Active Schedules Found</p>
                <p className="text-xs mt-1">
                  {isAnyFilterActive ? 'Try adjusting or clearing your filters above.' : 'Create an auto-scheduling template or add individual sessions to populate the timetable.'}
                </p>
                {isAnyFilterActive && (
                  <button
                    onClick={handleResetFilters}
                    className="mt-3 px-3.5 py-1.5 bg-navy-primary text-white text-xs font-bold rounded-xl hover:bg-navy-dark transition-colors inline-flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={isAllFilteredSelected}
                          ref={el => {
                            if (el) el.indeterminate = isSomeFilteredSelected && !isAllFilteredSelected;
                          }}
                          onChange={handleToggleSelectAll}
                          className="w-4 h-4 rounded text-navy-primary focus:ring-navy-primary cursor-pointer accent-navy-primary"
                          title={isAllFilteredSelected ? "Deselect all filtered" : "Select all filtered"}
                        />
                      </th>
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
                      const isSelected = selectedScheduleIds.includes(sch.id);
                      const studentList: string[] = sch.student_names && sch.student_names.length > 0
                        ? [...sch.student_names].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
                        : [sch.student_name || 'Student'];

                      const hasMore = studentList.length > 1;

                      return (
                        <tr
                          key={sch.id}
                          className={`transition-colors ${
                            isSelected
                              ? 'bg-amber-50/70 border-l-4 border-l-gold-accent'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="p-3.5 w-10 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectSchedule(sch.id)}
                              className="w-4 h-4 rounded text-navy-primary focus:ring-navy-primary cursor-pointer accent-navy-primary"
                              title="Select schedule"
                            />
                          </td>
                          <td className="p-3.5 text-slate-800 font-bold whitespace-nowrap">{formatDateDDMMYYYY(sch.date)} ({calculateDayTag(sch.date) || sch.day_of_week})</td>
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
                                    title: sch.batch_name ? `Students in ${sch.batch_name}` : `Attending Students`,
                                    students: studentList,
                                  })}
                                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[11px] rounded-xl border border-slate-300 transition-colors shadow-2xs cursor-pointer"
                                  title="View enrolled students"
                                >
                                  +{studentList.length - 1} more
                                </button>
                              )}
                            </div>
                          </td>

                          <td className="p-3.5 whitespace-nowrap">
                            <span className="px-2.5 py-1 bg-navy-subtle text-navy-primary font-bold rounded-lg mr-1.5">
                              {sch.subject_name}
                            </span>
                            <span className="text-slate-500 font-semibold">{sch.grade_class}</span>
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            {sch.status === 'scheduled' && (
                              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-extrabold text-[11px] rounded-full border border-slate-200 inline-flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-500" /> Scheduled
                              </span>
                            )}
                            {sch.status === 'in_progress' && (
                              <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-extrabold text-[11px] rounded-full border border-amber-300 inline-flex items-center gap-1 animate-pulse">
                                <Sparkles className="w-3 h-3 text-amber-600" /> In Progress
                              </span>
                            )}
                            {sch.status === 'completed' && (
                              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-[11px] rounded-full border border-emerald-300 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
                              </span>
                            )}
                            {sch.status === 'cancelled' && (
                              <span className="px-2.5 py-1 bg-red-100 text-red-800 font-extrabold text-[11px] rounded-full border border-red-300 inline-flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-red-600" /> Cancelled
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
        </div>
      )}

      {/* TAB 2: RECURRING TEMPLATES (AUTO-SCHEDULING) */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          {/* BANNER */}
          <div className="bg-gradient-to-r from-navy-primary to-slate-900 text-white p-5 rounded-3xl shadow-md relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 relative z-10 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-accent/20 border border-gold-accent/30 rounded-full text-gold-accent text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-gold-accent" /> Auto-Scheduling Engine
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">Recurring Schedule Rules</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Set regular patterns once (e.g. Every Monday, Wednesday, Friday at 4:00 PM). The system automatically generates all individual class sessions with full conflict-free deduplication!
              </p>
            </div>
            <button
              onClick={handleOpenCreateTemplateModal}
              className="px-4 py-2.5 bg-gold-accent hover:bg-gold-hover text-navy-dark font-black text-xs rounded-xl shadow-lg flex items-center gap-2 whitespace-nowrap transition-transform active:scale-95 relative z-10"
            >
              <Plus className="w-4 h-4" /> Create Auto-Schedule Rule
            </button>
          </div>

          {/* SEARCH & STATS BAR */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={templateSearch}
                onChange={e => setTemplateSearch(e.target.value)}
                placeholder="Search rules by teacher, batch, student, or subject..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-navy-primary"
              />
            </div>
            <div className="text-xs font-bold text-slate-500 whitespace-nowrap">
              Showing {filteredTemplates.length} of {scheduleTemplates.length} Recurring Rules
            </div>
          </div>

          {/* TEMPLATES GRID */}
          {filteredTemplates.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
              <Repeat className="w-12 h-12 text-slate-300 mx-auto" />
              <div>
                <p className="font-extrabold text-base text-navy-primary">No Recurring Rules Found</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Create your first recurring rule to automatically populate your weekly schedule without creating the same class manually every day!
                </p>
              </div>
              <button
                onClick={handleOpenCreateTemplateModal}
                className="px-5 py-2.5 bg-navy-primary hover:bg-navy-dark text-white font-extrabold text-xs rounded-xl shadow-md inline-flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4 text-gold-accent" /> Create First Rule
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map(tpl => {
                const isRegenerating = regeneratingId === tpl.id;

                return (
                  <div
                    key={tpl.id}
                    className={`bg-white rounded-3xl p-5 border transition-all shadow-sm space-y-4 ${
                      tpl.is_active ? 'border-slate-200 hover:border-navy-primary/40 hover:shadow-md' : 'border-slate-200 bg-slate-50/60 opacity-80'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <span className="px-2.5 py-0.5 bg-navy-subtle text-navy-primary font-bold text-xs rounded-lg">
                            {tpl.subject_name}
                          </span>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-medium text-[11px] rounded-lg">
                            {tpl.grade_class}
                          </span>
                        </div>
                        <h3 className="font-black text-sm text-navy-primary flex items-center gap-1.5">
                          {tpl.batch_name ? (
                            <>🏷️ {tpl.batch_name}</>
                          ) : (
                            <>👤 {tpl.student_name || 'Student'}</>
                          )}
                        </h3>
                      </div>

                      {/* Status badge */}
                      <button
                        onClick={() => handleToggleTemplateActive(tpl)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors ${
                          tpl.is_active
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                        title={tpl.is_active ? 'Click to Pause' : 'Click to Activate'}
                      >
                        {tpl.is_active ? <Play className="w-2.5 h-2.5 fill-emerald-800" /> : <Pause className="w-2.5 h-2.5 fill-slate-600" />}
                        {tpl.is_active ? 'Active' : 'Paused'}
                      </button>
                    </div>

                    {/* Teacher & Time Info */}
                    <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="font-bold flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-navy-primary" /> Teacher:
                        </span>
                        <span className="font-extrabold text-navy-primary">{tpl.teacher_name || 'Teacher'}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-700">
                        <span className="font-bold flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-navy-primary" /> Timing:
                        </span>
                        <span className="font-extrabold text-navy-primary">
                          {formatTime12Hr(tpl.start_time)} - {formatTime12Hr(tpl.end_time)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-700">
                        <span className="font-bold flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-navy-primary" /> Range:
                        </span>
                        <span className="font-bold text-slate-600 text-[11px]">
                          {formatDateDDMMYYYY(tpl.active_from)} → {formatDateDDMMYYYY(tpl.active_until)}
                        </span>
                      </div>
                    </div>

                    {/* Day Pills */}
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Repeating On:</p>
                      <div className="flex items-center gap-1 flex-wrap">
                        {ALL_TEMPLATE_DAYS.map(d => {
                          const isSelected = tpl.days_of_week?.includes(d.day);
                          return (
                            <span
                              key={d.day}
                              className={`px-2 py-1 rounded-lg text-[10px] font-black tracking-tight ${
                                isSelected
                                  ? 'bg-navy-primary text-gold-accent shadow-2xs'
                                  : 'bg-slate-100 text-slate-400'
                              }`}
                            >
                              {d.short}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Stats & Actions Footer */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-slate-500 font-semibold">
                        {tpl.last_generated_count !== undefined ? (
                          <span className="text-emerald-700 font-bold">⚡ {tpl.last_generated_count} generated</span>
                        ) : (
                          <span>Created {formatDateDDMMYYYY(tpl.created_at?.split('T')[0] || '')}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleRegenerateTemplate(tpl)}
                          disabled={isRegenerating}
                          className="px-2.5 py-1.5 bg-gold-light hover:bg-gold-accent text-navy-primary font-extrabold text-[11px] rounded-xl border border-gold-accent/40 flex items-center gap-1 transition-colors disabled:opacity-50"
                          title="Re-generate class sessions for this template range"
                        >
                          <RefreshCw className={`w-3 h-3 ${isRegenerating ? 'animate-spin' : ''}`} />
                          <span>{isRegenerating ? 'Generating...' : 'Re-Generate'}</span>
                        </button>

                        <button
                          onClick={() => handleDeleteTemplate(tpl.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Delete Template"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

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
                  disabled={isTimeInvalid || isSubmitting}
                  className={`py-2.5 px-5 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 ${
                    isTimeInvalid || isSubmitting
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      : 'bg-gold-accent hover:bg-gold-hover text-navy-dark'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-navy-dark border-t-transparent rounded-full animate-spin" />
                      <span>{editingSchedule ? 'Updating...' : 'Scheduling...'}</span>
                    </>
                  ) : (
                    <span>{editingSchedule ? 'Save & Update Schedule' : 'Schedule Class'}</span>
                  )}
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
                  disabled={isSubmittingBatch}
                  className="py-2.5 px-5 bg-navy-primary hover:bg-navy-dark text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingBatch ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving Batch...</span>
                    </>
                  ) : (
                    <span>Save Batch</span>
                  )}
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
      {/* MODAL: CREATE RECURRING AUTO-SCHEDULE TEMPLATE */}
      {templateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl border border-slate-200 my-auto max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-gold-accent/20 border border-gold-accent/30 rounded-full text-gold-accent text-[11px] font-black mb-1">
                  <Sparkles className="w-3 h-3 text-gold-accent" /> Auto-Scheduling Rule
                </div>
                <h3 className="text-lg font-black text-navy-primary">Create Recurring Schedule</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Define your regular recurring timetable once. All individual sessions will be automatically generated!
                </p>
              </div>
              <button
                onClick={() => setTemplateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="space-y-4">
              {/* Batch Selector (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase text-slate-700">
                    Assign to Batch (Optional)
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold">Or select individual students below</span>
                </div>
                <select
                  value={tplSelectedBatchId}
                  onChange={e => {
                    const id = e.target.value;
                    setTplSelectedBatchId(id);
                    if (!id) {
                      setTplBatchName('');
                      if (students.length > 0) setTplSelectedStudentIds([students[0].id]);
                    } else {
                      const b = batches.find(item => item.id === id);
                      if (b) {
                        setTplBatchName(b.name);
                        if (b.subject_name) setTplSubjectName(b.subject_name);
                        const matchIds = students
                          .filter(s => (b.student_ids && b.student_ids.includes(s.id)) || (b.student_names && b.student_names.includes(s.name)))
                          .map(s => s.id);
                        if (matchIds.length > 0) setTplSelectedStudentIds(matchIds);
                      }
                    }
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-navy-primary"
                >
                  <option value="">-- No Batch (Individual Student Selection) --</option>
                  {[...batches]
                    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }))
                    .map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.student_ids?.length || b.student_names?.length || 0} Students)
                      </option>
                    ))}
                </select>
              </div>

              {/* Teacher Selector */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Faculty / Teacher *
                </label>
                <select
                  value={tplTeacherId}
                  onChange={e => setTplTeacherId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-navy-primary"
                  required
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subjects.join(', ') || 'General'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Input */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  value={tplSubjectName}
                  onChange={e => setTplSubjectName(e.target.value)}
                  placeholder="e.g. Mathematics, Physics, Chemistry"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-navy-primary"
                  required
                />
              </div>

              {/* Student Selection (Checkboxes) */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Enrolled Students * ({tplSelectedStudentIds.length} Selected)
                </label>
                <div className="max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  {tplVisibleStudents.map(st => {
                    const isSelected = tplSelectedStudentIds.includes(st.id);
                    return (
                      <label
                        key={st.id}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                          isSelected ? 'bg-navy-subtle text-navy-primary font-bold' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              if (isSelected) {
                                setTplSelectedStudentIds(tplSelectedStudentIds.filter(id => id !== st.id));
                              } else {
                                setTplSelectedStudentIds([...tplSelectedStudentIds, st.id]);
                              }
                            }}
                            className="rounded text-navy-primary focus:ring-navy-primary"
                          />
                          <span>{st.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium">{st.grade_class} ({st.board})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Days of Week Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase text-slate-700">
                    Recurring Days of the Week *
                  </label>
                  <span className="text-[11px] font-bold text-navy-primary">
                    {tplDaysOfWeek.length} Day(s) Selected
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap mb-2">
                  <button
                    type="button"
                    onClick={() => handleSetTplPreset('mwf')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-colors"
                  >
                    Mon, Wed, Fri
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetTplPreset('tts')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-colors"
                  >
                    Tue, Thu, Sat
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetTplPreset('weekdays')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-colors"
                  >
                    All Weekdays (Mon-Fri)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetTplPreset('weekends')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-colors"
                  >
                    Weekends (Sat-Sun)
                  </button>
                </div>

                {/* Day Toggle Buttons */}
                <div className="grid grid-cols-7 gap-1">
                  {ALL_TEMPLATE_DAYS.map(d => {
                    const isSelected = tplDaysOfWeek.includes(d.day);
                    return (
                      <button
                        key={d.day}
                        type="button"
                        onClick={() => handleToggleTplDay(d.day)}
                        className={`py-2 px-1 rounded-xl text-xs font-black transition-all text-center ${
                          isSelected
                            ? 'bg-navy-primary text-gold-accent shadow-sm scale-102 ring-2 ring-navy-primary/30'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {d.short}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Timing (Strictly 1 Hour) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Start Time *
                  </label>
                  <select
                    value={tplStartTime}
                    onChange={e => handleTplStartTimeSelect(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-navy-primary"
                  >
                    {TIME_SLOTS_12HR.map(slot => (
                      <option key={slot.value24} value={slot.value24}>
                        {slot.label12}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    End Time (Auto 1-Hour)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={formatTime12Hr(tplEndTime)}
                    className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Recurring Date Range */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase text-slate-700">
                    Active Date Range (From → Until) *
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date(tplActiveFrom || getLocalTodayString());
                        d.setMonth(d.getMonth() + 1);
                        setTplActiveUntil(getLocalTodayString(d));
                      }}
                      className="text-[10px] font-bold text-navy-primary hover:underline"
                    >
                      +1M
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date(tplActiveFrom || getLocalTodayString());
                        d.setMonth(d.getMonth() + 3);
                        setTplActiveUntil(getLocalTodayString(d));
                      }}
                      className="text-[10px] font-bold text-navy-primary hover:underline"
                    >
                      +3M
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date(tplActiveFrom || getLocalTodayString());
                        d.setMonth(d.getMonth() + 6);
                        setTplActiveUntil(getLocalTodayString(d));
                      }}
                      className="text-[10px] font-bold text-navy-primary hover:underline"
                    >
                      +6M
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="date"
                      value={tplActiveFrom}
                      onChange={e => setTplActiveFrom(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-navy-primary"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="date"
                      value={tplActiveUntil}
                      onChange={e => setTplActiveUntil(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-navy-primary"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Estimate Calculation Box */}
              {(() => {
                const estimatedCount = estimateTemplateClasses(tplDaysOfWeek, tplActiveFrom, tplActiveUntil);
                return (
                  <div className="bg-amber-50/80 border border-amber-200/80 p-3.5 rounded-2xl text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Estimated Output: ~{estimatedCount} Classes</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      This rule will automatically generate approximately <strong>{estimatedCount} class sessions</strong> across the selected date range. Any overlapping schedules already on the timetable will be automatically skipped without duplicates.
                    </p>
                  </div>
                );
              })()}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTemplateModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTemplate}
                  className="py-2.5 px-5 bg-navy-primary hover:bg-navy-dark text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmittingTemplate ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating Schedules...</span>
                    </>
                  ) : (
                    <>
                      <Repeat className="w-3.5 h-3.5 text-gold-accent" />
                      <span>Save & Generate Schedules</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL: BULK DELETE CONFIRMATION */}
      {bulkDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Delete {selectedScheduleIds.length} Schedule{selectedScheduleIds.length > 1 ? 's' : ''}?</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Are you sure you want to permanently remove the <strong>{selectedScheduleIds.length} selected schedule session{selectedScheduleIds.length > 1 ? 's' : ''}</strong> from the timetable?
            </p>

            {/* Selected Items Preview */}
            <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 bg-slate-50 rounded-2xl border border-slate-100 mb-5 text-xs">
              {selectedScheduleIds.slice(0, 5).map(id => {
                const sch = schedules.find(s => s.id === id);
                if (!sch) return null;
                return (
                  <div key={id} className="p-2 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-navy-primary">{sch.batch_name || sch.student_name}</span>
                      <span className="text-[11px] text-slate-400 ml-1.5">({sch.subject_name})</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">
                      {formatDateDDMMYYYY(sch.date)} · {formatTime12Hr(sch.start_time)}
                    </span>
                  </div>
                );
              })}
              {selectedScheduleIds.length > 5 && (
                <p className="text-[11px] text-slate-400 text-center font-bold py-1">
                  ...and {selectedScheduleIds.length - 5} more sessions
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isBulkDeleting}
                onClick={() => setBulkDeleteModalOpen(false)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isBulkDeleting}
                onClick={handleBulkDeleteConfirm}
                className="py-2.5 px-5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isBulkDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete {selectedScheduleIds.length} Schedule{selectedScheduleIds.length > 1 ? 's' : ''}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
