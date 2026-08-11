"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, FileSpreadsheet, CheckCircle, XCircle, Clock, Calendar, User, Layers, Users, X, Download } from 'lucide-react';
import type { ClassLog, Teacher, Student, Batch } from '@/types/tms';

import { useAdminData } from '@/context/AdminDataContext';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function generateMonthOptions(): { value: string; label: string }[] {
  const now = new Date();
  const options: { value: string; label: string }[] = [{ value: '', label: '📅 All Time' }];

  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const key = `${yyyy}-${mm}`;
    const monthName = MONTH_NAMES[d.getMonth()];
    let label = `${monthName} ${yyyy}`;
    if (i === 0) label = `This Month (${monthName} ${yyyy})`;
    if (i === 1) label = `Last Month (${monthName} ${yyyy})`;
    options.push({ value: key, label });
  }
  return options;
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

export default function MasterClassLogsPage() {
  const {
    teachers: contextTeachers,
    students: contextStudents,
    batches: contextBatches,
    recentLogs: contextLogs,
  } = useAdminData();

  const [logs, setLogs] = useState<ClassLog[]>(contextLogs);
  const [teachers, setTeachers] = useState<Teacher[]>(contextTeachers);
  const [students, setStudents] = useState<Student[]>(contextStudents);
  const [batches, setBatches] = useState<Batch[]>(contextBatches);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (contextTeachers.length > 0) setTeachers(contextTeachers);
    if (contextStudents.length > 0) setStudents(contextStudents);
    if (contextBatches.length > 0) setBatches(contextBatches);
    if (contextLogs.length > 0 && logs.length === 0) setLogs(contextLogs);
  }, [contextTeachers, contextStudents, contextBatches, contextLogs]);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  // Student details modal
  const [studentModalData, setStudentModalData] = useState<{ title: string; students: string[] } | null>(null);

  const fetchLogs = async () => {
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (selectedTeacher) query.append('teacherId', selectedTeacher);
      if (selectedStatus) query.append('status', selectedStatus);
      if (selectedSubject) query.append('subject', selectedSubject);
      if (selectedMonth) query.append('month', selectedMonth);

      const resLogs = await fetch(`/api/admin/logs?${query.toString()}`);
      if (resLogs.ok) {
        const dLogs = await resLogs.json();
        setLogs(dLogs.logs || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search, selectedTeacher, selectedStatus, selectedSubject, selectedMonth]);

  const monthOptions = useMemo(() => generateMonthOptions(), []);

  const filteredLogs = logs.filter(log => {
    if (selectedBatch && log.batch_name !== selectedBatch) return false;
    return true;
  });

  // Teacher Hours Summary (aggregated from completed filtered logs)
  const teacherHoursSummary = useMemo(() => {
    const map: Record<string, { name: string; minutes: number; sessions: number }> = {};
    filteredLogs.forEach(log => {
      if (log.status === 'completed') {
        const key = log.teacher_name || 'Unknown';
        if (!map[key]) map[key] = { name: key, minutes: 0, sessions: 0 };
        map[key].minutes += log.duration_minutes || 0;
        map[key].sessions += 1;
      }
    });
    return Object.values(map).sort((a, b) => b.minutes - a.minutes);
  }, [filteredLogs]);

  const totalHoursAll = useMemo(() => {
    return teacherHoursSummary.reduce((acc, t) => acc + t.minutes, 0);
  }, [teacherHoursSummary]);

  const selectedMonthLabel = monthOptions.find(o => o.value === selectedMonth)?.label || 'All Time';

  const handleExportCSV = () => {
    const query = new URLSearchParams({ format: 'csv' });
    if (search) query.append('search', search);
    if (selectedTeacher) query.append('teacherId', selectedTeacher);
    if (selectedStatus) query.append('status', selectedStatus);
    if (selectedSubject) query.append('subject', selectedSubject);
    if (selectedMonth) query.append('month', selectedMonth);
    if (selectedBatch) query.append('batch', selectedBatch);

    window.open(`/api/admin/logs?${query.toString()}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-primary tracking-tight">Master Class Logs</h1>
          <p className="text-xs text-slate-500 mt-1">
            Permanent audit trail of all completed and cancelled tuition sessions across After Bells Academy.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 self-start sm:self-auto transition-all"
        >
          <Download className="w-4 h-4" /> Export CSV / Excel
        </button>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search logs by student, batch, teacher, or remarks..."
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
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="w-full sm:w-52 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none font-semibold text-slate-700"
        >
          {monthOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* TEACHER HOURS SUMMARY CARD */}
      {teacherHoursSummary.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-black text-navy-primary uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4" /> Teacher Hours Summary
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5 font-semibold">
                {selectedMonth ? selectedMonthLabel : 'All Time'} — Completed sessions only
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-navy-primary">{Math.round((totalHoursAll / 60) * 10) / 10}</span>
              <span className="text-xs font-bold text-slate-500 ml-1">Total Hrs</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {teacherHoursSummary.map(t => (
              <div key={t.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="font-extrabold text-xs text-navy-primary block">{t.name}</span>
                  <span className="text-[10px] text-slate-500 font-semibold">{t.sessions} session{t.sessions !== 1 ? 's' : ''}</span>
                </div>
                <span className="px-3 py-1 bg-navy-primary text-white font-black text-xs rounded-xl">
                  {Math.round((t.minutes / 60) * 10) / 10} hrs
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CLASS LOGS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-navy-primary uppercase tracking-wider">
            Total Logged Sessions ({filteredLogs.length})
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-sm text-navy-primary">No Class Logs Found</p>
            <p className="text-xs mt-1">Adjust search filters or conduct test classes in Teacher Portal.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Timing & Duration</th>
                  <th className="p-3.5">Teacher</th>
                  <th className="p-3.5">Batch</th>
                  <th className="p-3.5">Attended Student(s)</th>
                  <th className="p-3.5">Subject & Class</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Remarks / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredLogs.map(log => {
                  const studentList = log.student_names && log.student_names.length > 0
                    ? [...log.student_names].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
                    : [log.student_name];

                  const hasMore = studentList.length > 1;

                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-bold text-slate-800 whitespace-nowrap">{formatDateDDMMYYYY(log.date)}</td>
                      <td className="p-3.5 text-slate-700 whitespace-nowrap">
                        <span className="font-semibold block">{formatTime12Hr(log.start_time)} - {formatTime12Hr(log.end_time)}</span>
                        <span className="text-[10px] font-extrabold text-navy-primary block">⏱️ {log.duration_minutes} mins</span>
                      </td>
                      <td className="p-3.5 text-navy-primary font-extrabold whitespace-nowrap">{log.teacher_name}</td>
                      
                      {/* Separate Batch Column */}
                      <td className="p-3.5 whitespace-nowrap">
                        {log.batch_name ? (
                          <span className="px-2.5 py-1 bg-gold-light text-navy-primary font-black text-xs rounded-xl border border-gold-accent/40 inline-flex items-center gap-1">
                            🏷️ {log.batch_name}
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
                                title: log.batch_name ? `${log.batch_name} Enrolled Students` : 'Class Students',
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
                        <span className="font-bold text-slate-800">{log.subject_name}</span>
                        <span className="text-slate-500 block text-[10px]">{log.grade_class}</span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          log.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3.5 max-w-xs text-slate-600">
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
    </div>
  );
}
