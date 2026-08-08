"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Search, UserCheck, Trash2, Edit3, Phone, GraduationCap } from 'lucide-react';
import type { Student, Teacher } from '@/types/tms';

export default function StudentManagementPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [gradeClass, setGradeClass] = useState('Grade 10');
  const [board, setBoard] = useState('CBSE');
  const [guardianName, setGuardianName] = useState('');
  const [phone, setPhone] = useState('');
  const [assignedTeacherId, setAssignedTeacherId] = useState('');
  const [subjectsStr, setSubjectsStr] = useState('Mathematics, Physics');

  const loadData = async () => {
    try {
      const [resStd, resTch] = await Promise.all([
        fetch('/api/admin/students'),
        fetch('/api/admin/teachers'),
      ]);
      if (resStd.ok && resTch.ok) {
        const dStd = await resStd.json();
        const dTch = await resTch.json();
        setStudents(dStd.students || []);
        setTeachers(dTch.teachers || []);
        if (dTch.teachers && dTch.teachers.length > 0) {
          setAssignedTeacherId(dTch.teachers[0].id);
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

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !guardianName || !phone || !assignedTeacherId) {
      alert('Please fill out all required fields');
      return;
    }

    try {
      const subjects = subjectsStr.split(',').map(s => s.trim()).filter(Boolean);
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          grade_class: gradeClass,
          board,
          guardian_name: guardianName,
          phone,
          assigned_teacher_id: assignedTeacherId,
          subjects,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add student');

      setAddModalOpen(false);
      setName('');
      setGuardianName('');
      setPhone('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error adding student');
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student record?')) return;
    try {
      const res = await fetch(`/api/admin/students?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredStudents = students.filter(
    s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.guardian_name.toLowerCase().includes(search.toLowerCase()) ||
      s.board.toLowerCase().includes(search.toLowerCase()) ||
      (s.assigned_teacher_name && s.assigned_teacher_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-primary tracking-tight">Student Management</h1>
          <p className="text-xs text-slate-500 mt-1">Enroll students, select curriculums, and map to assigned primary teachers.</p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="px-4 py-2.5 bg-gold-accent hover:bg-gold-hover text-navy-dark font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Enroll New Student
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search students by name, guardian, board, or assigned teacher..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-navy-primary shadow-sm"
        />
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map(s => (
          <div key={s.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 bg-gold-light text-navy-primary font-bold text-[10px] rounded-full uppercase">
                  {s.board} • {s.grade_class}
                </span>
                <h3 className="text-base font-black text-navy-primary mt-2">{s.name}</h3>
                <p className="text-xs text-slate-500 font-medium">Guardian: {s.guardian_name}</p>
              </div>
              <button
                onClick={() => handleDeleteStudent(s.id)}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Delete Student"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
              <p className="flex items-center gap-1.5 font-medium">
                <UserCheck className="w-3.5 h-3.5 text-gold-accent" /> Assigned Teacher: <span className="font-bold text-navy-primary">{s.assigned_teacher_name || 'Unassigned'}</span>
              </p>
              <p className="flex items-center gap-1.5 font-medium">
                <Phone className="w-3.5 h-3.5 text-emerald-600" /> Phone: <span className="font-bold text-slate-800">{s.phone}</span>
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1">
              {s.subjects.map(subj => (
                <span key={subj} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded-full">
                  {subj}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: ADD STUDENT */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 my-auto max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-navy-primary mb-1">Enroll New Student</h3>
            <p className="text-xs text-slate-500 mb-4">Input student details and map to a teacher.</p>

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Student Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Student Full Name"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Grade / Class</label>
                  <select
                    value={gradeClass}
                    onChange={e => setGradeClass(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  >
                    {['KG', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Education Board</label>
                  <select
                    value={board}
                    onChange={e => setBoard(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  >
                    {['CBSE', 'ICSE', 'State Syllabus', 'IGCSE', 'GCSE'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Guardian Name</label>
                  <input
                    type="text"
                    value={guardianName}
                    onChange={e => setGuardianName(e.target.value)}
                    placeholder="Parent / Guardian"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Contact Phone</label>
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
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Assign Primary Teacher</label>
                <select
                  value={assignedTeacherId}
                  onChange={e => setAssignedTeacherId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  required
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.subjects.join(', ')})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Enrolled Subjects</label>
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
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
